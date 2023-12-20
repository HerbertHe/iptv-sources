FROM node:alpine

WORKDIR /app
COPY . /app

RUN apk add --update --no-cache --allow-untrusted runit

# RUN COMMAND
RUN yarn install
RUN yarn build
RUN yarn m3u

VOLUME /app/m3u

EXPOSE 8080

CMD [ "runsvdir", "/app/docker_conf/runit" ]
