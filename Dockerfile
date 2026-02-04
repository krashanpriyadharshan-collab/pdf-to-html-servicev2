FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies and Node.js
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    python3 \
    pkg-config \
    libxml2-dev \
    libxslt-dev \
    libffi-dev \
    poppler-utils \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Install pdf2htmlEX from a pre-built static binary (easiest way on modern Ubuntu)
# Using the community build for generic linux
RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.AppImage \
    && mv pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.AppImage /usr/local/bin/pdf2htmlEX \
    && chmod +x /usr/local/bin/pdf2htmlEX

# Setup App
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
