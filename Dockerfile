# build image
FROM debian:latest AS build

RUN apt-get update && apt-get install -y gettext-base

ARG COMMIT_SHA="dev"

WORKDIR /app

COPY public public
COPY replace_env.sh .

RUN ./replace_env.sh

# final image
FROM nginx:alpine

COPY --from=build /app/public /usr/share/nginx/html
