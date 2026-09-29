#!/bin/sh
set -e

if [ -f /etc/letsencrypt/live/discip.uz/fullchain.pem ]; then
  echo "SSL certificate found, using HTTPS config"
  cp /etc/nginx/templates/nginx.ssl.conf /etc/nginx/conf.d/default.conf
else
  echo "No SSL certificate yet, using HTTP-only config"
  cp /etc/nginx/templates/nginx.http.conf /etc/nginx/conf.d/default.conf
fi

exec "$@"
