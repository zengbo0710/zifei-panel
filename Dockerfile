FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with legacy peer deps to handle ccxt
RUN npm install --legacy-peer-deps

# Then copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
