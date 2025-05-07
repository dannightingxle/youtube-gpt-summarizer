# Dockerfile

FROM node:18

# Install Python and ffmpeg
RUN apt-get update && apt-get install -y python3 ffmpeg

WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Set environment variable at runtime via Render, not here
EXPOSE 3000

CMD ["node", "server.js"]
