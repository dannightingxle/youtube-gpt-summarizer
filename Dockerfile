FROM node:18

WORKDIR /app

# Install only JS deps (no native ffmpeg/python)
COPY package*.json ./
RUN npm install

# Copy code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]