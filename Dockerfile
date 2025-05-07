# Use Node.js base image
FROM node:18-slim

# Install Python and FFmpeg
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  ffmpeg \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose the port (optional but useful)
EXPOSE 3000

# Start the app
CMD [ "node", "server.js" ]
