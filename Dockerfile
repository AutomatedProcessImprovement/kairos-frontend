FROM node:lts-alpine as build

RUN npm i -g serve

WORKDIR /app
COPY package*.json ./
COPY .env.production .env.production
RUN npm install

COPY jsconfig.json jsconfig.json
COPY babel.config.js babel.config.js
COPY vue.config.js vue.config.js
COPY ./public/ ./public
COPY ./src/ ./src
RUN npm run build

FROM nginx:stable-alpine as production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]