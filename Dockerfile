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

# This script only adds `listen [::]:80;` to the stock default.conf, which we
# don't need (the cluster reaches pods over IPv4). On newer Alpine (3.24+) it
# runs `apk manifest`, which peaks at ~50Mi and hangs under our 25Mi / 25m
# CPU limits.
RUN rm /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh

COPY --from=build /app/public /usr/share/nginx/html
