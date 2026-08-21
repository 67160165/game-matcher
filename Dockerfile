FROM node:20-alpine

WORKDIR /app

# Install backend dependencies first (better layer caching)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy the rest of the project
COPY backend ./backend
COPY frontend ./frontend

# Make sure the data directory (used for JSON "database" files) exists and is writable
RUN mkdir -p /app/backend/data

ENV PORT=3000
EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "server.js"]
