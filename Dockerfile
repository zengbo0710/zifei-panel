FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
