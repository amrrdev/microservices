FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./
RUN npm install

COPY . .

ARG APP_NAME
RUN npm run build -- $APP_NAME

CMD ["npm", "run", "start:dev"]
