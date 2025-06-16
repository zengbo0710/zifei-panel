FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# Copy package files and install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy the application files
COPY . .

# Build CSS
RUN npm run build:css

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
