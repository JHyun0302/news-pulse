# News Pulse Frontend

React/Vite frontend for the News Pulse article browsing flow.

## API Connection

- Browser requests use `/api` by default.
- Local dev server proxies `/api` to `http://localhost:8080`.
- Override the dev proxy with `VITE_DEV_API_TARGET` when the backend uses another port.
- Leave `VITE_API_BASE_URL` empty for local proxy and front-vm Nginx same-origin proxy.
- Set `VITE_API_BASE_URL=http://localhost:8080` only when intentionally bypassing the dev proxy.

## Local Integration Check

Terminal 1:

```bash
cd new-pulse-backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--news-pulse.rss.scheduler.enabled=false"
```

Terminal 2:

```bash
cd new-pulse-frontend
npm install
npm run dev -- --port 5173
```

Smoke commands:

```bash
curl http://localhost:8080/api/health
curl "http://localhost:5173/api/categories?clientId=qa-client"
curl -X POST http://localhost:8080/api/admin/rss/collect
```

QA URL:

```text
http://localhost:5173/
```

If the backend runs on another port:

```bash
VITE_DEV_API_TARGET=http://localhost:18081 npm run dev -- --port 5173
```

## Verification

```bash
npm test
npm run build
```
