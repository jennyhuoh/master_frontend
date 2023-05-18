FROM node:18.12.1
WORKDIR /app
ADD . /app
RUN yarn install
EXPOSE 3000
CMD yarn start