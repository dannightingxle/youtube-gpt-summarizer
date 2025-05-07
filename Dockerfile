# Dockerfile
FROM node:18

WORKDIR /app

# Copy package files, install only JS deps
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
