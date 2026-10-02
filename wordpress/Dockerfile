# WordPress for the Nymbus content editor (production image, deployed as its own Northflank service: see README.md).
# The plugin and the must-use plugin are baked into the image; only the uploads folder needs a volume.
# Configuration is read from environment variables (names in README.md); there is nothing secret in this file.
FROM wordpress:6-php8.3-apache

COPY plugins/nymbus-site-content /usr/src/wordpress/wp-content/plugins/nymbus-site-content
COPY mu-plugins /usr/src/wordpress/wp-content/mu-plugins

# Uploaded pictures (news images, team photos): mount a persistent volume here.
VOLUME ["/var/www/html/wp-content/uploads"]

# Apache: no version banner, nothing listed
RUN { echo "ServerTokens Prod"; echo "ServerSignature Off"; echo "TraceEnable Off"; } > /etc/apache2/conf-available/nymbus-security.conf \
 && a2enconf nymbus-security \
 && { echo "expose_php = Off"; echo "upload_max_filesize = 16M"; echo "post_max_size = 20M"; } > /usr/local/etc/php/conf.d/nymbus.ini

COPY docker/entrypoint.sh /usr/local/bin/nymbus-entrypoint.sh
RUN chmod +x /usr/local/bin/nymbus-entrypoint.sh
ENTRYPOINT ["nymbus-entrypoint.sh"]
CMD ["apache2-foreground"]

EXPOSE 80
