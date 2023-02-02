FROM node:18.13 as builder
RUN apt-get update && \
    apt-get install -y \
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
    npm ci --legacy-peer-deps && \
    npm run build
FROM nginx:1-alpine 
EXPOSE 80
COPY docker/nginx/conf.d /etc/nginx/conf.d
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /build/client/public /etc/nginx/html/admin
# cypress will request the root even though noone else uses it
RUN echo "OK" >> /etc/nginx/html/index.html