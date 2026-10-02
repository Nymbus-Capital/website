#!/bin/sh
# Local development set-up (run by `docker compose --profile setup run --rm wpcli`, see docker-compose.yml):
# installs WordPress when it is not installed yet, activates the Nymbus plugin and creates SAMPLE content.
# Safe to run again. NOT used in production (there WordPress is installed through its own screen, see README.md).
set -eu

cd /var/www/html

echo "Waiting for the WordPress files..."
i=0
until [ -f wp-config.php ]; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then echo "wp-config.php did not appear: is the wordpress container running?" >&2; exit 1; fi
  sleep 2
done

echo "Waiting for the database..."
i=0
until wp db query "SELECT 1" >/dev/null 2>&1; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then echo "the database does not answer" >&2; exit 1; fi
  sleep 2
done

if ! wp core is-installed >/dev/null 2>&1; then
  wp core install \
    --url="http://localhost:8080" \
    --title="Nymbus content (local)" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
fi

wp option update timezone_string "America/Toronto"
wp option update blog_public 0
wp rewrite structure '/%postname%/'
wp plugin activate nymbus-site-content
wp nymbus seed

echo
echo "Done. Sign in at http://localhost:8080/wp-login.php with the user and password from your .env,"
echo "then open Nymbus > News / Team / Site texts. The content endpoint:"
echo "  http://localhost:8080/wp-json/nymbus/v1/site-content"
