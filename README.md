# clouddirstat

Track and optimize cloud storage usage.

Inspired by [WinDirStat](https://windirstat.net/) and [qdirstat](https://github.com/shundhammer/qdirstat).

## Setting up `.env`

### Google

1. Create a project in [Google Cloud](https://console.cloud.google.com/)
2. Navigate to APIs and services => Credentials.
3. Create OAuth 2.0 Client ID with the following options:
  - Application type: Web application
  - Authorized JavaScript origins: `http://localhost:5173`
  - Authorized redirect URIs: `http://localhost:5173`
4. Add the client ID as the secret `VITE_GOOGLE_DRIVE_CLIENT_ID`.

### Dropbox

1. Create a new app on the [DBX Platform](https://www.dropbox.com/developers/apps/create).
2. Under OAuth 2, define the redirect URIs. For local development, `http://localhost:5173/select-provider`.
3. Under Permissions tab, ensure the following are checked:
  - `account_info.read`
  - `files.metadata.read`
4. Add the "App key" as the variable `VITE_DROPBOX_CLIENT_ID` in `.env`.

## Updating dependencies

```shell
npx npm-check-updates -u
```
