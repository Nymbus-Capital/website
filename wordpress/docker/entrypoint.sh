#!/bin/sh
# Gives the mounted uploads volume to the web server user (a fresh platform volume is owned by root and uploads
# would fail), then hands over to the official WordPress entrypoint.
set -e
mkdir -p /var/www/html/wp-content/uploads
chown www-data:www-data /var/www/html/wp-content/uploads 2>/dev/null || true
exec docker-entrypoint.sh "$@"
