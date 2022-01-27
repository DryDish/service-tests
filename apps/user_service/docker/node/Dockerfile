FROM node:current-alpine

WORKDIR /app

COPY src/ src/
COPY .env .env 
COPY package.json package.json

RUN npm install

CMD ["node", "src/app.js"]