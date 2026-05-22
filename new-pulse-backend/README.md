# News Pulse Backend

## Local Run

```bash
cd new-pulse-backend
./mvnw spring-boot:run
```

기본 API 주소는 `http://localhost:8080`이다. 프론트엔드 dev server는 Vite proxy로 `/api`를 `http://localhost:8080`에 전달하므로 기본 통합 경로에서는 CORS 설정이 필요 없다.

## M7 Backend QA

```bash
cd new-pulse-backend
./mvnw test
./mvnw -q -DskipTests package

java -jar target/new-pulse-backend-0.0.1-SNAPSHOT.jar \
  --server.port=8080
```

다른 터미널에서 확인한다.

```bash
curl -sS http://localhost:8080/api/health
curl -sS http://localhost:8080/api/categories?clientId=qa-client
curl -sS -X POST http://localhost:8080/api/admin/rss/collect
curl -sS 'http://localhost:8080/api/articles?category=POLITICS&clientId=qa-client&limit=5'
curl -sS -X POST http://localhost:8080/api/admin/push/dispatch
curl -sS 'http://localhost:8080/api/admin/push-histories?limit=10'
```

읽음 처리는 실제 `articleId`로 실행한다.

```bash
curl -sS -X POST http://localhost:8080/api/articles/<articleId>/read \
  -H 'Content-Type: application/json' \
  -d '{"clientId":"qa-client"}'
```

## Export

RSS 수집과 push dispatch 후 검증용 CSV 산출물을 만든다.

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables
```

SQLite 복사본은 공개 저장소 커밋 전 PM 검토가 필요하므로, 로컬 QA에서 필요할 때만 명시적으로 생성한다.

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables --include-db-copy
```
