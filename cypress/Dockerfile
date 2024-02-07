FROM cypress/base:20.11.0
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY cypress ./cypress
COPY cypress.config.ts .
RUN npm ci --legacy-peer-deps
ENTRYPOINT ["tail", "-f", "/dev/null"]