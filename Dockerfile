FROM node:18 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm build

FROM node:18
WORKDIR /build
COPY --from=builder /usr/src/app/build .
RUN npm i -g serve
EXPOSE 3000
CMD ["serve", "-s"]