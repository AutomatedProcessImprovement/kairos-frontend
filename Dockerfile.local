FROM node:lts-alpine as build

RUN npm i -g serve

WORKDIR /app
COPY package*.json ./
COPY .env.development .env.development
RUN npm install

COPY jsconfig.json jsconfig.json
COPY babel.config.js babel.config.js
COPY vue.config.js vue.config.js
COPY ./public/ ./public
COPY ./src/ ./src
RUN npm run build

FROM nginx:stable-alpine as production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/local.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]