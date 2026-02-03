# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package.json và lock file để cài đặt dependencies
COPY package*.json ./

# Cài đặt dependencies
RUN npm install --legacy-peer-deps

# Copy toàn bộ source code (dù volume sẽ ghi đè, nhưng bước này cần cho build)
COPY . .

# Mở port mặc định của NestJS (thường là 3000 hoặc 3001)
EXPOSE 3000

# Chạy lệnh dev
CMD ["npm", "run", "dev"]