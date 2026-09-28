FROM node:20-alpine

# Install curl for health check probe
RUN apk add --no-cache curl

WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
