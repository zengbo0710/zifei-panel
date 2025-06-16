FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Copy configuration files
COPY public/ ./public/
COPY tailwind.config.js postcss.config.js ./

# Install all dependencies including development dependencies
RUN npm install && \
    npm install -D postcss-cli tailwindcss@latest postcss@latest autoprefixer@latest && \
    ls -la /app/node_modules/ccxt && \
    npm list ccxt && \
    npm run build:css

# Then copy the rest of the application
COPY . .

EXPOSE 3000

# Add a verification step before starting
CMD ["sh", "-c", "ls -la /app/node_modules/ccxt && npm list ccxt && exec npm start"]
