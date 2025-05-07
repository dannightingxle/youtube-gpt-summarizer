# Use Node.js with Debian base to support apt
FROM node:18-bullseye

# Install Python and FFmpeg before running npm install
RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip \
  ffmpeg \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the full app code
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]
