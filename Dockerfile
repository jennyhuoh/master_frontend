FROM node:18.12.1 as build
WORKDIR /master_frontend
COPY package*.json ./
RUN yarn install
COPY . ./
RUN ["yarn", "run", "build"]

FROM ubuntu:18.04
RUN apt update -y \
    && apt install nginx curl vim -y \
    && apt-get install software-properties-common -y \
    && add-apt-repository ppa:certbot/certbot -y \
    && apt-get update -y \
    && apt-get install python-certbot-nginx -y \
    && apt-get clean
EXPOSE 80
STOPSIGNAL SIGTERM
COPY --from=build /master_frontend/build /var/www/html
CMD ["nginx", "-g", "daemon off;"]
