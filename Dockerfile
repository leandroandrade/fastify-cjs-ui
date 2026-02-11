FROM node:24.13.0-bullseye-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm ci
COPY ./templates /usr/src/app/templates
RUN npx @tailwindcss/cli -i ./templates/css/custom.css -o ./public/css/styles.css --minify
RUN npm prune --production

FROM node:24.13.0-bullseye-slim
COPY --from=build /usr/bin/dumb-init /usr/bin/dumb-init
USER node
WORKDIR /usr/src/app
COPY --chown=node:node --from=build /usr/src/app/node_modules /usr/src/app/node_modules
COPY --chown=node:node ./src /usr/src/app/src
COPY --chown=node:node ./templates /usr/src/app/templates
COPY --chown=node:node ./public /usr/src/app/public
COPY --chown=node:node --from=build /usr/src/app/public/css/styles.css /usr/src/app/public/css/styles.css

ARG GIT_COMMIT_HASH
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

ENV NODE_ENV=production

EXPOSE 8080

CMD ["dumb-init", "node", "--disable-sigusr1" ,"src/server.js"]
