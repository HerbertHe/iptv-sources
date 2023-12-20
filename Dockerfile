# build
FROM node:alpine AS build

WORKDIR /app

COPY . /app

RUN yarn install && yarn build && yarn m3u

# final
FROM node:alpine

WORKDIR /app

COPY [ "package.json", "yarn.lock", "/app/" ]

RUN yarn install --production && yarn cache clean

COPY --from=build /app/dist /app/dist

COPY --from=build /app/m3u /app/m3u

EXPOSE 8080

CMD [ "yarn", "serve" ]
