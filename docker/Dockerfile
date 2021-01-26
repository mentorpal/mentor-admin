FROM node:14.15.0 as builder
ARG NODE_ENV
RUN apt-get update && \
    apt-get install -y \
        build-essential \
        libgif-dev \
        libglu1 \
        libjpeg-dev \
        libpng-dev \
        libtiff-dev \
        libxi-dev && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY client ./client
RUN cd client && \
    npm ci && \
    npm run build
FROM node:14.15.0-slim
ENV TINI_VERSION=v0.16.1
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini 
WORKDIR /app
COPY docker .
RUN rm -rf build
COPY --from=builder /build/client/public /app/public/admin
RUN npm ci  --production 
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/tini", "--", "/app/entrypoint.sh"]