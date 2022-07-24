FROM node:16-alpine

RUN apk --no-cache add --virtual .builds-deps build-base python3 mongodb-tools

WORKDIR /usr/app

COPY services/common services/common
COPY services/api services/api
COPY package.json .
COPY yarn.lock .

RUN yarn workspace api install --frozen-lockfile

RUN chown -R node:node /usr/app

USER node

CMD ["yarn", "workspace", "api", "run", "dev"]