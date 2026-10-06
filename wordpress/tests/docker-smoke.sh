#!/usr/bin/env bash
# Smoke test of the production WordPress image (CI: .github/workflows/ci.yml, "WordPress image").
#   bash wordpress/tests/docker-smoke.sh nymbus-wp:ci
# Starts the image with a throw-away MariaDB, installs WordPress with wp-cli, then checks over HTTP: the hardening
# (no PHP from uploads, no file mods / auto-updates, upload limit), the bundled plugins (active, pinned versions),
# Microsoft sign-in configured from env (dummy ids: only the configuration is checked, no real Entra round trip),
# password sign-in reserved to the emergency account, the brute-force limiter (a forged X-Forwarded-For does not
# help), the content endpoint and `wp nymbus import`. Only throw-away test values here.
set -euo pipefail

IMG="${1:-nymbus-wp:ci}"
NET="nywp-smoke-$$"
DB="nywp-db-$$"
WP="nywp-wp-$$"
PORT="${SMOKE_PORT:-18089}"
BASE="http://127.0.0.1:$PORT"
ADMIN_PW="smoke-$(date +%s)-Aa1!"
EDITOR_PW="editor-$(date +%s)-Bb2!"
JAR="$(mktemp)"
FAILS=0

cleanup() {
  if [ "$FAILS" -ne 0 ] || [ "${SMOKE_KEEP_LOGS:-}" = 1 ]; then docker logs "$WP" 2>&1 | tail -40 || true; fi
  docker rm -f "$WP" "$DB" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
  rm -f "$JAR"
}
trap cleanup EXIT

ok()   { echo "ok   - $1"; }
fail() { echo "FAIL - $1" >&2; FAILS=$((FAILS + 1)); }
check() { if eval "$2"; then ok "$1"; else fail "$1"; fi; }
wpcli() { docker exec "$WP" wp "$@"; } # the image's own WP-CLI (runs as www-data)
HERE="$(cd "$(dirname "$0")" && pwd)"

echo "# static checks"
check "apache configuration is valid" "docker run --rm --entrypoint apache2ctl '$IMG' -t >/dev/null 2>&1"
check "upload limit is 8M" "[ \"\$(docker run --rm --entrypoint php '$IMG' -r 'echo ini_get(\"upload_max_filesize\");')\" = 8M ]"
for p in nymbus-site-content limit-login-attempts-reloaded daggerhart-openid-connect-generic; do
  check "plugin $p baked in" "docker run --rm --entrypoint test '$IMG' -d /usr/src/wordpress/wp-content/plugins/$p"
done
check "WP-CLI baked in (pinned)" "docker run --rm --entrypoint wp '$IMG' --version | grep -q \"WP-CLI \$(sed -n 's/^ARG WPCLI_VERSION=//p' '$HERE/../Dockerfile')\""
check "Apache takes the visitor IP from the right of X-Forwarded-For (mod_remoteip)" "docker run --rm --entrypoint sh '$IMG' -c 'grep -q \"^RemoteIPHeader X-Forwarded-For\" /etc/apache2/conf-enabled/remoteip.conf'"
check "must-use plugins baked in" "docker run --rm --entrypoint test '$IMG' -f /usr/src/wordpress/wp-content/mu-plugins/nymbus-security.php"

echo "# start"
docker network create "$NET" >/dev/null
docker run -d --name "$DB" --network "$NET" -e MARIADB_DATABASE=wp -e MARIADB_USER=wp -e MARIADB_PASSWORD=smoke-db \
  -e MARIADB_ROOT_PASSWORD=smoke-root mariadb:11.4 >/dev/null
docker run -d --name "$WP" --network "$NET" -p "127.0.0.1:$PORT:80" \
  -e WORDPRESS_DB_HOST="$DB" -e WORDPRESS_DB_NAME=wp -e WORDPRESS_DB_USER=wp -e WORDPRESS_DB_PASSWORD=smoke-db \
  -e WORDPRESS_CONFIG_EXTRA="define('WP_ENVIRONMENT_TYPE','local'); define('WP_HOME','$BASE'); define('WP_SITEURL','$BASE');" \
  -e NYMBUS_SSO_TENANT_ID=00000000-0000-4000-8000-000000000001 \
  -e NYMBUS_SSO_CLIENT_ID=00000000-0000-4000-8000-000000000002 \
  -e NYMBUS_SSO_CLIENT_SECRET=smoke-not-a-secret \
  -e NYMBUS_EMERGENCY_ADMIN=smoke-admin \
  "$IMG" >/dev/null

for i in $(seq 1 60); do
  if docker exec "$WP" sh -c 'test -f /var/www/html/wp-config.php && php -r "exit(@mysqli_connect(getenv(\"WORDPRESS_DB_HOST\"), getenv(\"WORDPRESS_DB_USER\"), getenv(\"WORDPRESS_DB_PASSWORD\"), getenv(\"WORDPRESS_DB_NAME\")) ? 0 : 1);"' >/dev/null 2>&1; then break; fi
  sleep 3
  if [ "$i" = 60 ]; then echo "WordPress / database did not come up" >&2; exit 1; fi
done
wpcli core install --url="$BASE" --title="Smoke" --admin_user=smoke-admin --admin_password="$ADMIN_PW" \
  --admin_email=admin@example.org --skip-email >/dev/null
wpcli user create smoke-editor editor@example.org --role=editor --user_pass="$EDITOR_PW" >/dev/null

echo "# hardening"
code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
check "login page answers" "[ \"\$(code '$BASE/wp-login.php')\" = 200 ]"
docker exec "$WP" sh -c 'mkdir -p wp-content/uploads/2026/10 \
  && printf "<?php echo \"EXEC\".\"UTED\";" > wp-content/uploads/2026/10/probe.php \
  && printf "<?php echo \"EXEC\".\"UTED\";" > wp-content/uploads/2026/10/probe.jpg \
  && printf "AddType application/x-httpd-php .jpg\nSetHandler application/x-httpd-php\n" > wp-content/uploads/2026/10/.htaccess'
check "PHP in uploads is refused (403)" "[ \"\$(code '$BASE/wp-content/uploads/2026/10/probe.php')\" = 403 ]"
check "PHP in uploads never runs" "! curl -s '$BASE/wp-content/uploads/2026/10/probe.php' | grep -q EXECUTED"
check "a .htaccess in uploads cannot turn PHP on" "! curl -s '$BASE/wp-content/uploads/2026/10/probe.jpg' | grep -q EXECUTED"
check "dot files in uploads are refused" "[ \"\$(code '$BASE/wp-content/uploads/2026/10/.htaccess')\" = 403 ]"
check "no file mods (installs / updates) from wp-admin" "[ \"\$(wpcli eval 'echo wp_is_file_mod_allowed(\"smoke\") ? \"yes\" : \"no\";')\" = no ]"
check "automatic updates off" "[ \"\$(wpcli eval 'echo ( apply_filters( \"automatic_updater_disabled\", false ) && AUTOMATIC_UPDATER_DISABLED && ! apply_filters( \"auto_update_core\", true, null ) ) ? \"off\" : \"on\";')\" = off ]"
check "application passwords off" "[ \"\$(wpcli eval 'echo wp_is_application_passwords_available() ? \"on\" : \"off\";')\" = off ]"
check "XML-RPC refused (403)" "[ \"\$(code -d x '$BASE/xmlrpc.php')\" = 403 ]"

echo "# sign-in"
login() { # $1 user $2 password [$3 X-Forwarded-For]; prints the HTTP status (302 = signed in)
  curl -s -o /tmp/nywp-login.html -w '%{http_code}' -c "$JAR" -b "wordpress_test_cookie=WP%20Cookie%20check" \
    ${3:+-H "X-Forwarded-For: $3"} \
    --data-urlencode "log=$1" --data-urlencode "pwd=$2" -d "wp-submit=Log+In&testcookie=1" "$BASE/wp-login.php"
}
check "emergency administrator signs in with a password" "[ \"\$(login smoke-admin '$ADMIN_PW')\" = 302 ]"
curl -s -o /dev/null -b "$JAR" "$BASE/wp-admin/" # first admin page view activates the bundled plugins
ACTIVE="$(wpcli plugin list --status=active --field=name)"
for p in nymbus-site-content limit-login-attempts-reloaded daggerhart-openid-connect-generic; do
  check "plugin $p active" "grep -qx '$p' <<<\"\$ACTIVE\""
done
for pair in "limit-login-attempts-reloaded LLAR_VERSION" "daggerhart-openid-connect-generic OIDC_VERSION"; do
  set -- $pair
  want="$(sed -n "s/^ARG $2=//p" "$HERE/../Dockerfile")"
  check "plugin $1 is the pinned version $want" "[ \"\$(wpcli plugin get $1 --field=version)\" = '$want' ]"
done
check "login page offers Sign in with Microsoft" "curl -s '$BASE/wp-login.php' | grep -q 'Sign in with Microsoft'"
curl -s "$BASE/wp-login.php" > /tmp/nywp-form.html
check "Microsoft sign-in points at our tenant" "grep -q 'https://login.microsoftonline.com/00000000-0000-4000-8000-000000000001/oauth2/v2.0/authorize' /tmp/nywp-form.html"
check "Microsoft sign-in uses our client id" "grep -q 'client_id=00000000-0000-4000-8000-000000000002' /tmp/nywp-form.html"
check "the login page says passwords are for the emergency administrator" "grep -q 'reserved for the emergency administrator' /tmp/nywp-form.html"
: > "$JAR"
check "an editor cannot sign in with a password once SSO is on" "[ \"\$(login smoke-editor '$EDITOR_PW')\" = 200 ] && ! grep -q wordpress_logged_in '$JAR'"

TID=00000000-0000-4000-8000-000000000001
OID=0f0f0f0f-1111-4222-8333-444444444444
ssocheck() { wpcli eval "echo is_wp_error( nymbus_sso_user_check( get_user_by( 'login', '$1' ), array( 'tid' => '$TID', 'oid' => '$OID', 'sub' => 'smoke-sub' ) ) ) ? 'refused' : 'allowed';"; }
check "a Microsoft sign-in never opens the emergency administrator" "[ \"\$(ssocheck smoke-admin)\" = refused ]"
check "a Microsoft sign-in never takes over an existing account (no SSO marker)" "[ \"\$(ssocheck smoke-editor)\" = refused ]"
wpcli user meta update smoke-editor openid-connect-generic-subject-identity smoke-sub >/dev/null
wpcli user meta update smoke-editor nymbus_sso_identity "$TID/$OID" >/dev/null
check "a Microsoft sign-in opens the account it created (same sub + tid/oid)" "[ \"\$(ssocheck smoke-editor)\" = allowed ]"
wpcli user meta delete smoke-editor nymbus_sso_identity >/dev/null
check "forced OIDC settings apply even before the settings are saved" "[ \"\$(wpcli eval 'echo (int) get_option( \"openid_connect_generic_settings\", array( \"no_sslverify\" => 1 ) )[\"no_sslverify\"];')\" = 0 ]"
check "password sessions were ended when Microsoft sign-in was switched on" "[ -n \"\$(wpcli option get nymbus_sso_sessions_reset 2>/dev/null)\" ]"
wpcli plugin deactivate limit-login-attempts-reloaded >/dev/null 2>&1 || true
check "the login limiter cannot be deactivated (WP-CLI / bulk / screen)" "wpcli plugin is-active limit-login-attempts-reloaded"

echo "# raw HTML / uploads"
check "editors have no unfiltered_html" "[ \"\$(wpcli eval 'echo user_can( get_user_by( \"login\", \"smoke-editor\" ), \"unfiltered_html\" ) ? \"yes\" : \"no\";')\" = no ]"
check "administrators have no unfiltered_html either" "[ \"\$(wpcli eval 'echo user_can( get_user_by( \"login\", \"smoke-admin\" ), \"unfiltered_html\" ) ? \"yes\" : \"no\";')\" = no ]"
docker exec "$WP" sh -c 'printf "<script>alert(1)</script>" > /tmp/evil.html; printf "alert(1)" > /tmp/evil.js; php -r "file_put_contents(\"/tmp/ok.png\", base64_decode(\"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==\"));"; chmod 644 /tmp/evil.html /tmp/evil.js /tmp/ok.png'
check "an editor cannot upload an .html file" "! wpcli media import /tmp/evil.html --user=smoke-editor >/dev/null 2>&1"
check "an editor cannot upload a .js file" "! wpcli media import /tmp/evil.js --user=smoke-editor >/dev/null 2>&1"
PNGID="$(wpcli media import /tmp/ok.png --user=smoke-editor --porcelain 2>/dev/null || true)"
check "an editor can upload a picture" "[ -n '$PNGID' ]"
PNGURL="$(wpcli post get "${PNGID:-0}" --field=guid 2>/dev/null || true)"
check "uploaded pictures are served, never MIME-sniffed, sandboxed" "curl -s -D - -o /dev/null '$PNGURL' | tr -d '\r' | grep -qi '^x-content-type-options: nosniff' && curl -s -D - -o /dev/null '$PNGURL' | tr -d '\r' | grep -qi '^content-security-policy: sandbox'"
docker exec "$WP" sh -c 'cp /tmp/evil.html /tmp/evil.js wp-content/uploads/2026/10/ && printf "<svg onload=alert(1)/>" > wp-content/uploads/2026/10/evil.svg'
for f in evil.html evil.js evil.svg; do
  check "a $f in uploads is refused (403)" "[ \"\$(code '$BASE/wp-content/uploads/2026/10/$f')\" = 403 ]"
done
check "WordPress code is root-owned" "[ \"\$(docker exec '$WP' stat -c %U /var/www/html/wp-includes/version.php)\" = root ] && [ \"\$(docker exec '$WP' stat -c %U /var/www/html/wp-content/plugins/nymbus-site-content/nymbus-site-content.php)\" = root ]"
check "the web server cannot rewrite WordPress code" "! docker exec -u www-data '$WP' sh -c 'echo x >> /var/www/html/wp-includes/version.php' 2>/dev/null && ! docker exec -u www-data '$WP' touch /var/www/html/wp-content/plugins/x.php 2>/dev/null"
check "the web server can write uploads" "docker exec -u www-data '$WP' touch /var/www/html/wp-content/uploads/smoke-write"

echo "# content endpoint"
check "content document served" "curl -s '$BASE/?rest_route=/nymbus/v1/site-content' | grep -q '\"schemaVersion\":1'"

echo "# import of the website's team and news (wp nymbus import)"
node --experimental-strip-types "$HERE/../scripts/import-from-site.mjs" --out /tmp/nywp-import.json 2>/dev/null
docker cp /tmp/nywp-import.json "$WP:/tmp/nywp-import.json"
NTEAM="$(node -e 'console.log(require("/tmp/nywp-import.json").team.length)')"
NNEWS="$(node -e 'console.log(require("/tmp/nywp-import.json").news.length)')"
count() { wpcli post list --post_type="$1" --post_status=any --format=count; }
check "dry run lists everything to create" "wpcli nymbus import /tmp/nywp-import.json --dry-run | grep -q '$((NNEWS + NTEAM)) to create'"
check "dry run changes nothing" "[ \"\$(count nymbus_team)\" = 0 ] && [ \"\$(count nymbus_news)\" = 0 ]"
wpcli nymbus import /tmp/nywp-import.json >/dev/null
check "import creates every team member ($NTEAM)" "[ \"\$(count nymbus_team)\" = '$NTEAM' ]"
check "import creates every news item ($NNEWS)" "[ \"\$(count nymbus_news)\" = '$NNEWS' ]"
check "a second import skips what exists" "wpcli nymbus import /tmp/nywp-import.json | grep -q '0 created, 0 updated, $((NNEWS + NTEAM)) skipped'"
check "imported team served by the endpoint" "curl -s '$BASE/?rest_route=/nymbus/v1/site-content' | grep -q '\"id\":\"jean-turmel\"'"

echo "# brute force (last: it locks the test client out)"
# the load balancer APPENDS the visitor address to X-Forwarded-For; an attacker controls only what is to its left
VISITOR="198.51.100.50" # what the balancer appends: the real visitor
for i in 1 2 3 4 5; do login smoke-admin "wrong-$i" "203.0.113.$i, $VISITOR" >/dev/null; done
check "after repeated failures even the right password is refused, whatever the forged part of X-Forwarded-For says" \
  "[ \"\$(login smoke-admin '$ADMIN_PW' '198.51.100.7, 10.0.0.9, $VISITOR')\" = 200 ] && grep -q 'Too many failed login attempts' /tmp/nywp-login.html"
check "another visitor is not locked out by it" "[ \"\$(login smoke-admin '$ADMIN_PW' '198.51.100.99')\" = 302 ]"
echo
if [ "$FAILS" -ne 0 ]; then echo "$FAILS check(s) failed" >&2; exit 1; fi
echo "all checks passed"
