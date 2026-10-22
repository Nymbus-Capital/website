# Dataplatform service authentication

The backend can obtain its own Microsoft Entra access tokens for Dataplatform reads.
Configure these four server-side settings together:

| Setting | Value |
| --- | --- |
| `DATAPLATFORM_TENANT_ID` | Nymbus tenant UUID |
| `DATAPLATFORM_CLIENT_ID` | This application's own Entra client UUID |
| `DATAPLATFORM_CLIENT_SECRET` | This application's separately managed secret |
| `DATAPLATFORM_API_AUDIENCE` | Dataplatform API client UUID |

An administrator must grant this application's service principal the Dataplatform
`Data.Read` application role. Do not use the IMS, Graph or release-probe identity.
The scope is `api://<API-audience>/.default`. The pipeline caches tokens in memory and
renews them before expiry. An API 401 invalidates only the rejected token and retries the GET once.
Concurrent reads reuse a token that another read has already renewed.
A second 401, a 403, a redirect or a token error stops the read. There is no
fallback to Basic Auth or anonymous access when Entra settings are present.

Use HTTPS for the public API gateway. Inside the ETL project, the exact private
base URL `http://dataplatform-staging:8000` is also supported with a token.
Only `/api/` reads use this identity. Tokens and secrets stay on the server.

Deploy this code before activating Entra settings. With all four settings absent,
the existing access configuration remains available during migration. This is a
temporary compatibility path, not the final access policy. After a successful
read with this app's identity, remove its old Basic credentials. Remove the shared
backend's legacy entry only after every other HTTP consumer has migrated.
Do not change PostgreSQL jobs or publish financial data as an authentication test.


The existing three transient attempts are retained across token renewal. Public
website data reduction, financial validation and publication behavior are unchanged.
