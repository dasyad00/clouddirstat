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
