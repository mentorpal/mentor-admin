FROM cypress/base:14.15.0
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
RUN npm ci 
COPY cypress ./cypress
COPY cypress.config.ts .
ENTRYPOINT ["tail", "-f", "/dev/null"]