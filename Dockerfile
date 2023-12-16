FROM node:alpine

WORKDIR /app
COPY . /app

# RUN COMMAND
RUN yarn install
RUN yarn build
RUN yarn m3u

EXPOSE 8080

CMD [ "yarn", "serve" ]
