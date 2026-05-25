cat > docker-compose.yml <<'EOF'
version: "3.8"

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: hrm_backend
    restart: always
    ports:
      - "3001:3000"
    volumes:
      - ./backend:/app
      - backend_node_modules:/app/node_modules
    extra_hosts:
      - "host.docker.internal:host-gateway"
    env_file:
      - ./backend/.env
    environment:
      PORT: 3000

      # DB ngoài compose, đang chạy trên host EC2 qua port 5432
      DB_HOST: host.docker.internal
      DB_PORT: 5432

      # Support cả 2 kiểu tên biến, tránh app đọc tên nào cũng lỗi
      DB_USER: ${DB_USER}
      DB_USERNAME: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      DB_DATABASE: ${DB_NAME}

    networks:
      - hrm-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: hrm_frontend
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - frontend_node_modules:/app/node_modules
      - frontend_next:/app/.next
    environment:
      NODE_ENV: development

      # Browser gọi qua Next.js rewrite /api
      NEXT_PUBLIC_API_URL: /api

      # Next.js server-side proxy sang backend trong Docker network
      INTERNAL_API_URL: http://backend:3000

    depends_on:
      - backend
    networks:
      - hrm-network

volumes:
  backend_node_modules:
  frontend_node_modules:
  frontend_next:

networks:
  hrm-network:
    driver: bridge
EOF