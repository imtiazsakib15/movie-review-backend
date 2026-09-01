FROM node:22-alpine

WORKDIR /app

# Copy package files correctly
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm install

COPY . .

EXPOSE 5000

# Run generation and development server on boot
CMD ["sh", "-lc", "npm run generate --if-present && npm run dev"]
