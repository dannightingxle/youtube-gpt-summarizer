# Base image with more tools preinstalled
FROM node:18-bullseye

# Install Python and FFmpeg
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  ffmpeg \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full project
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
