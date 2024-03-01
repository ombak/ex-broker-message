FROM node:20-alpine

RUN apk update \
    && apk upgrade

RUN mkdir -p /var/www/app

WORKDIR /var/www/app

COPY package*.json .

RUN npm install \
    && npm install --global nodemon

COPY . .

EXPOSE 3002

CMD ["npm", "run", "dev"]