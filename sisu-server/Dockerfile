# Build
FROM node:10 as build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i -g --upgrade npm
RUN npm ci

COPY tsconfig.json tslint.json jest.config.js ./
COPY test ./test
COPY src ./src
RUN npm run build


## Run
FROM node:10-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --production

COPY --from=build /app/dist ./dist

ENV NODE_ENV production
ENTRYPOINT npm start
