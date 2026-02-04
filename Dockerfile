FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

# 1. Install System Dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    python3 \
    pkg-config \
    libxml2-dev \
    libxslt-dev \
    libffi-dev \
    poppler-utils \
    ca-certificates \
    gnupg

# 2. Install Node.js (Modern Method)
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get update && \
    apt-get install -y nodejs

# 3. Install pdf2htmlEX (Static Build)
RUN wget https://github.com/pdf2htmlEX/pdf2htmlEX/releases/download/v0.18.8.rc1/pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.AppImage \
    && mv pdf2htmlEX-0.18.8.rc1-master-20200630-Ubuntu-bionic-x86_64.AppImage /usr/local/bin/pdf2htmlEX \
    && chmod +x /usr/local/bin/pdf2htmlEX

# 4. Setup App
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

# 5. Create uploads folder
RUN mkdir -p uploads

CMD ["node", "server.js"]
