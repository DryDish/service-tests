FROM node:current-alpine

WORKDIR /app

COPY package.json package.json
RUN npm install --only=prod

COPY .env .env 
COPY src/ src/


CMD ["node", "src/app.js"]