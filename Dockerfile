# Dockerfile
FROM node:18

WORKDIR /app

# Install your JS dependencies only
COPY package*.json ./
RUN npm install

# Copy code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
