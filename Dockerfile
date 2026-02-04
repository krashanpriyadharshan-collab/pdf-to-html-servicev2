FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    wget \
    git \
    build-essential \
    cmake \
    pkg-config \
    libcairo2-dev \
    libjpeg-dev \
    libpng-dev \
    libpoppler-glib-dev \
    libfontforge-dev \
    libspiro-dev \
    libpango1.0-dev \
    libglib2.0-dev \
    libfreetype6-dev \
    poppler-utils \
    python3 \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Build pdf2htmlEX from source
RUN git clone https://github.com/pdf2htmlEX/pdf2htmlEX.git /opt/pdf2htmlEX \
    && cd /opt/pdf2htmlEX \
    && mkdir build \
    && cd build \
    && cmake .. \
    && make -j$(nproc) \
    && make install

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --production
COPY server.js ./

EXPOSE 8088
CMD ["node", "server.js"]
