# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for nodemon)
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application (overridden by docker-compose)
CMD ["npm", "run", "dev"]
