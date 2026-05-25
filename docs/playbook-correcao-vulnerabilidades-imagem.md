# Playbook: reduzir vulnerabilidades da imagem Docker

Resumo replicável das práticas adotadas neste template. Aplicável a qualquer
projeto Node.js que construa uma imagem Docker multi-stage a partir das
imagens oficiais `node:*`.

## Contexto

Em scans de imagem (formato Trivy), três fontes distintas costumam aparecer e
cada uma exige uma correção diferente:

| Fonte | Exemplo de pacote | Como corrigir |
|-------|-------------------|---------------|
| Imagem base desatualizada | `libssl1.1`, `libdb5.3`, `libgnutls30`, `zlib1g` | Trocar a base + `apt-get upgrade` |
| Gerenciadores de pacote embutidos na imagem Node | `minimatch`, `node-tar`, `glob`, `ip-address` (dentro de `npm`/`corepack`/`yarn`) | Remover do estágio de runtime |
| Dependências do projeto (`package-lock.json`) | qualquer pacote npm direto/transitivo | `npm audit` + atualizar o lockfile |

## Passos

### 1. Atualizar a imagem base e aplicar patches do SO

A maioria dos Critical/High vem de pacotes Debian antigos. Fixe uma base com
suporte ativo (ex.: `trixie`/Debian 13) e aplique `apt-get upgrade` no estágio
final:

```dockerfile
# Estágio de build
FROM node:24.13.0-trixie-slim AS build
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init \
  && rm -rf /var/lib/apt/lists/*
# ... npm ci, build, npm prune ...

# Estágio final (runtime)
FROM node:24.13.0-trixie-slim
RUN apt-get update \
  && apt-get upgrade -y \
  && rm -rf /var/lib/apt/lists/*
```

Pontos-chave:
- Fixe a versão completa da imagem (`24.13.0-trixie-slim`), não tag flutuante.
- `apt-get upgrade` pega patches de segurança publicados após a release da base.
- Sempre `rm -rf /var/lib/apt/lists/*` na mesma camada `RUN` (imagem menor).
- Distroless é uma alternativa de superfície ainda menor, mas remove o shell e
  exige reescrever o `Dockerfile` — avalie caso a caso.

### 2. Remover gerenciadores de pacote do estágio de runtime

As imagens oficiais `node:*` embutem `npm`, `corepack` e `yarn` em
`/usr/local/lib/node_modules`. Esses gerenciadores **vendorizam** bibliotecas
(`minimatch`, `node-tar`, `glob`, `ip-address`, `picomatch`, `brace-expansion`)
que o scanner reporta como vulneráveis — mesmo que o `package-lock.json` do
projeto esteja limpo.

Um container de runtime que roda apenas `node app.js` **não precisa** de nenhum
gerenciador de pacote (o `npm ci`/`prune` acontece só no estágio de build).
Remova-os no estágio final:

```dockerfile
RUN apt-get update \
  && apt-get upgrade -y \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/local/lib/node_modules/npm \
       /usr/local/lib/node_modules/corepack \
       /opt/yarn-v* \
       /usr/local/bin/npm /usr/local/bin/npx \
       /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg
```

Pontos-chave:
- Remova **apenas no estágio final**. O estágio de build ainda precisa do `npm`.
- Confira os caminhos dos symlinks na sua versão do Node:
  `docker run --rm node:<tag> sh -c 'ls -l /usr/local/bin'`.
- Valide depois que o `node` ainda funciona e o `node_modules` da aplicação
  está intacto (veja passo 4).

### 3. Bloquear scripts de instalação no estágio de build

Use `npm ci --ignore-scripts` para evitar que dependências executem
`postinstall`/`preinstall` durante o build. Isso defende contra ataques de
supply chain e também evita downloads pesados em build (ex.: browsers do
Playwright). Para dependências nativas, faça `npm rebuild <pacote>`
explicitamente depois.

```dockerfile
RUN npm ci --ignore-scripts
```

### 4. Confirmar que as dependências do projeto estão limpas

CVEs em pacotes npm que **são** do projeto se resolvem atualizando o lockfile:

```bash
npm audit --omit=dev          # vulnerabilidades só de produção
npm audit fix                 # aplica correções compatíveis
```

Commite o `package-lock.json`. Um relatório que aponta versões que não existem
no seu lockfile geralmente indica que o scan é antigo ou que o pacote vem de
fora do projeto (ver passo 2).

### 5. Validar a imagem reconstruída

```bash
docker build -t app:scan .

# node funciona e gerenciadores foram removidos
docker run --rm --entrypoint sh app:scan -c '
  node -e "console.log(process.version)"
  ls /usr/local/lib/node_modules/npm 2>/dev/null && echo "FALHOU: npm presente" || echo "ok: npm removido"
  ls /usr/src/app/node_modules | wc -l'

# checar pacotes do SO
docker run --rm --entrypoint dpkg-query app:scan -W -f='${Package} ${Version}\n'
```

### 6. Automatizar o scan no CI (gate de deploy)

O Dependabot abre PRs de atualização, mas **não bloqueia** um deploy com CVE.
Adicione um workflow que constrói a imagem, escaneia com Trivy e falha o build.
Resumo do que deve estar nele:

- Roda em `pull_request`, em `schedule` semanal (pega CVE nova sem mudança de
  código) e em `workflow_dispatch`.
- Job `npm-audit`: `npm audit --omit=dev --audit-level=high`.
- Job `image-scan`: `docker build` + `aquasecurity/trivy-action` com
  `exit-code: '1'` (o gate) e `ignore-unfixed: true` (não trava em CVE sem
  correção disponível).
- Publica relatório SARIF na aba **Security → Code scanning**.

## Limites: o que não dá para corrigir

CVEs do SO com `Fixed in:` vazio no relatório **não têm correção em distro
nenhuma** ainda. Não há ação no projeto além de:

- Manter `apt-get upgrade` no build, que recolhe o patch assim que a Debian
  publicar.
- Usar `ignore-unfixed: true` no scan do CI para não bloquear deploy por algo
  sem solução.
- Reescanear a cada deploy e acompanhar a contagem ao longo do tempo.

## Checklist replicável

- [ ] Imagem base atualizada para distro com suporte ativo, versão fixada.
- [ ] `apt-get upgrade -y` no estágio final, com limpeza de `apt lists`.
- [ ] `npm`/`corepack`/`yarn` removidos do estágio de runtime.
- [ ] `npm ci --ignore-scripts` no estágio de build.
- [ ] `npm audit --omit=dev` limpo; `package-lock.json` commitado.
- [ ] Imagem reconstruída e validada (`node` roda, app `node_modules` intacto).
- [ ] Workflow de scan no CI como gate, com scan agendado.
- [ ] CVEs restantes confirmadas como `Fixed in:` vazio (sem correção upstream).
