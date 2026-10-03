# Read-only GitHub App migration

This change targets the deployed `redesign/v3-keynote-live-data` branch. The default
`GITHUB_AUTH_MODE=pat` preserves existing production authentication. In `app` mode,
each analytics refresh signs a short-lived JWT and requests a fresh installation token
limited to `analytics` and Contents read. App failures never silently use the PAT.

Register an organization-owned private App with Contents read and automatic Metadata
read, installed only on `Nymbus-Capital/analytics`. Disable webhooks and user OAuth.
Give it no Actions, Administration, Issues, Pull requests, or organization permissions.
The deck reader can use this read-only App; persistence writers and release controllers
need separate identities so reader workloads never receive their broader private keys.

Store `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, and `GITHUB_APP_PRIVATE_KEY`
as runtime credentials restricted to the website. Do not include the private key in build
arguments, images, browser code, logs, or the broad ETL secret group. Keep the existing
PAT during validation. The private key remains a long-lived bootstrap credential;
installation token renewal is automated, private-key rotation is a separate operation.

Validate the App first in an isolated Northflank job using the same deployed commit
and analytics repository. Confirm successful reads, a new token on a later refresh,
and refusal of write access. Then set `GITHUB_AUTH_MODE=app` for the website and
restart through the normal deployment path. Verify the real pipeline refresh and
unchanged public pages. Roll back by restoring `GITHUB_AUTH_MODE=pat` and the
previous attested build. Revoke the PAT only after all its consumers are verified.
