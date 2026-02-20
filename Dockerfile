FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN npm install -g serve

CMD serve dist -s -l tcp://0.0.0.0:${PORT:-3000}
