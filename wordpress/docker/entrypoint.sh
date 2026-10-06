#!/bin/sh
# Nymbus WordPress entrypoint:
#  1. lets the official entrypoint copy WordPress into /var/www/html and write wp-config.php (it does that only when
#     its first argument starts with "apache2": we pass a no-op command, then start Apache below);
#  2. makes WordPress core, plugins, themes and wp-config.php owned by root and read-only for the web server: a stolen
#     editor session or a PHP flaw cannot rewrite code. Only the uploads folder (volume) is writable;
#  3. hands over to the official entrypoint (which finds everything in place and just starts Apache).
set -e
mkdir -p /var/www/html/wp-content/uploads
if [ "$(id -u)" = 0 ] && [ "${1#apache2}" != "$1" ]; then
  docker-entrypoint.sh apache2-nymbus-prepare
  chown -R root:root /var/www/html 2>/dev/null || true
  find /var/www/html -path /var/www/html/wp-content/uploads -prune -o \( -type d -exec chmod 0755 {} + \) -o \( -type f -exec chmod 0644 {} + \) 2>/dev/null || true
fi
# the uploads volume belongs to the web server (a fresh platform volume is owned by root and uploads would fail)
chown www-data:www-data /var/www/html/wp-content/uploads 2>/dev/null || true
exec docker-entrypoint.sh "$@"
