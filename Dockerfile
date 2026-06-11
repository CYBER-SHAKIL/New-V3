FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpng-dev \
    libpixman-1-dev \
    fonts-liberation \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN mkdir -p \
    scripts/cmds/cache \
    scripts/cmds/tmp \
    scripts/events/tmp \
    scripts/events/data/leaveAttachment \
    scripts/events/data/welcomeAttachment \
    database/data \
    cache \
    logs

RUN node scripts/patch-fca.js || true

EXPOSE 3000

CMD ["node", "index.js"]
