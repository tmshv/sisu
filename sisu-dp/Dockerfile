FROM node:10-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --production

ARG secret=secret
ENV SECRET $secret
ENV MONGODB_URI mongodb://localhost
ENV PORT 80
ENV DB_NAME sisu
ENV LOOP_SLEEP 1000
ENV UPDATE_DELAY 1000
ENV NODE_ENV production
EXPOSE 80

COPY . .
CMD ["npm", "start"]
