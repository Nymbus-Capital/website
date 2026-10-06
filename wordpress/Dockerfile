# WordPress for the Nymbus content editor (production image, deployed as its own Northflank service: see README.md).
# Everything is baked into the image (WordPress core, our plugin and must-use plugins, the two third-party plugins);
# only the uploads folder needs a volume. Nothing can be installed or updated from wp-admin (DISALLOW_FILE_MODS):
# updating = change the pinned versions below, rebuild, redeploy (README.md, "Updating WordPress").
# Configuration is read from environment variables (names in README.md); there is nothing secret in this file.

# Exact WordPress core + PHP + Apache build (official image). Bump: README.md, "Updating WordPress".
FROM wordpress:7.1.2-php8.3-apache

# Third-party plugins from wordpress.org, pinned to a version AND to the SHA-256 of that exact zip: a changed or
# tampered download fails the build instead of reaching production.
#   Limit Login Attempts Reloaded: brute-force protection of /wp-login.php (the emergency password account).
#   OpenID Connect Generic Client (wordpress.org slug daggerhart-openid-connect-generic): "Sign in with Microsoft"
#   (Entra ID), configured from env by mu-plugins/nymbus-security.php.
ARG LLAR_VERSION=3.3.10
ARG LLAR_SHA256=9125ac1bc06c876326802ff1b9783ef0081749d0025e578c6b355d65622abb3f
ARG OIDC_VERSION=3.11.3
ARG OIDC_SHA256=81c009fe8f8f1504b329656d5a41176b5de09febfca4574393889c46387f8a97

RUN set -eu; \
    cd /tmp; bad=0; \
    fetch() { \
      slug="$1"; main="$2"; ver="$3"; sum="$4"; \
      if ! curl -fsSL --retry 3 --retry-delay 5 -o "$slug.zip" "https://downloads.wordpress.org/plugin/$slug.$ver.zip"; then echo "DOWNLOAD FAILED $slug $ver" >&2; bad=1; return 0; fi; \
      got="$(sha256sum "$slug.zip" | cut -d' ' -f1)"; \
      if [ "$got" != "$sum" ]; then echo "CHECKSUM MISMATCH $slug $ver: expected $sum got $got" >&2; bad=1; return 0; fi; \
      php -r '$z = new ZipArchive(); if ($z->open($argv[1]) !== true || !$z->extractTo($argv[2])) { fwrite(STDERR, "cannot unzip\n"); exit(1); }' "$slug.zip" /usr/src/wordpress/wp-content/plugins; \
      grep -Eq "^[[:space:]*]*Version:[[:space:]]*$ver[[:space:]]*$" "/usr/src/wordpress/wp-content/plugins/$slug/$main"; \
      rm -f "$slug.zip"; \
    }; \
    fetch limit-login-attempts-reloaded limit-login-attempts-reloaded.php "$LLAR_VERSION" "$LLAR_SHA256"; \
    fetch daggerhart-openid-connect-generic openid-connect-generic.php "$OIDC_VERSION" "$OIDC_SHA256"; \
    [ "$bad" = 0 ]; \
    chown -R www-data:www-data /usr/src/wordpress/wp-content/plugins

# WP-CLI (pinned + checksum of the official release) for operations from the Northflank shell: `wp nymbus import`,
# `wp user ...`, database updates after an image bump. The `wp` wrapper runs it as the web server user.
ARG WPCLI_VERSION=2.12.0
ARG WPCLI_SHA256=ce34ddd838f7351d6759068d09793f26755463b4a4610a5a5c0a97b68220d85c
RUN set -eu; \
    curl -fsSL --retry 3 --retry-delay 5 -o /usr/local/lib/wp-cli.phar "https://github.com/wp-cli/wp-cli/releases/download/v$WPCLI_VERSION/wp-cli-$WPCLI_VERSION.phar"; \
    echo "$WPCLI_SHA256  /usr/local/lib/wp-cli.phar" | sha256sum -c -; \
    chmod 0644 /usr/local/lib/wp-cli.phar
COPY docker/wp /usr/local/bin/wp

COPY plugins/nymbus-site-content /usr/src/wordpress/wp-content/plugins/nymbus-site-content
COPY mu-plugins /usr/src/wordpress/wp-content/mu-plugins

# Uploaded pictures (news images, team photos): mount a persistent volume here.
VOLUME ["/var/www/html/wp-content/uploads"]

# Apache: no version banner, nothing listed; no PHP ever runs from the uploads folder (an uploaded script stays a
# file: refused, and the PHP engine is off there; .htaccess files in uploads are ignored).
# PHP: uploads up to 8 MB (web images: about 1600 px wide is a few hundred KB; raise both values here if a PDF needs more).
COPY docker/apache-security.conf /etc/apache2/conf-available/nymbus-security.conf
RUN a2enconf nymbus-security \
 && { echo "expose_php = Off"; echo "upload_max_filesize = 8M"; echo "post_max_size = 10M"; echo "max_file_uploads = 10"; } > /usr/local/etc/php/conf.d/nymbus.ini

COPY docker/entrypoint.sh /usr/local/bin/nymbus-entrypoint.sh
RUN chmod +x /usr/local/bin/nymbus-entrypoint.sh /usr/local/bin/wp
ENTRYPOINT ["nymbus-entrypoint.sh"]
CMD ["apache2-foreground"]

EXPOSE 80
