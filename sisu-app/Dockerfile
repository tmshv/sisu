# Build
FROM node:10 as build
WORKDIR /app

RUN npm i -g --upgrade npm
COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build


# Run
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
COPY --from=build /app/build /usr/share/nginx/html
