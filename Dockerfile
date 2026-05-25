FROM node:24.13.0-trixie-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm ci --ignore-scripts

COPY ./templates /usr/src/app/templates

RUN npx @tailwindcss/cli -i ./templates/css/custom.css -o ./public/css/styles.css --minify
RUN npm run js:build
RUN npm prune --omit=dev

FROM node:24.13.0-trixie-slim

RUN apt-get update \
  && apt-get upgrade -y \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/local/lib/node_modules/npm \
       /usr/local/lib/node_modules/corepack \
       /opt/yarn-v* \
       /usr/local/bin/npm /usr/local/bin/npx \
       /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg

COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init

USER node

WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node ./src /usr/src/app/src
COPY --chown=node:node ./templates /usr/src/app/templates
COPY --chown=node:node ./public /usr/src/app/public
COPY --chown=node:node --from=build /usr/src/app/public/css/styles.css /usr/src/app/public/css/styles.css
COPY --chown=node:node --from=build /usr/src/app/public/js /usr/src/app/public/js

ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

ENV NODE_ENV=production

EXPOSE 8080

CMD ["dumb-init", "node", "--disable-sigusr1" ,"src/server.js"]
