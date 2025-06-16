FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Then copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
