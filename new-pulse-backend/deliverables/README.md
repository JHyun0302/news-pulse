# Backend Deliverables

M7 QA에서 실제 RSS 수집과 push dispatch를 실행한 뒤 이 디렉터리에 검증 산출물을 생성한다.

```bash
cd new-pulse-backend
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables
```

기본 생성 대상:

- `articles.csv`
- `article_categories.csv`
- `push_histories.csv`
- `export-summary.csv`

M7 QA에서는 추가 확인용으로 아래 CSV도 생성한다.

- `table-counts.csv`
- `article-category-counts.csv`
- `push-history-status-counts.csv`
- `article_read_states.csv`

SQLite 복사본이 로컬 QA에 필요하면 아래 옵션을 명시한다. SQLite 파일은 공개 저장소 커밋 전에 PM 검토가 필요하다.

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables --include-db-copy
```

원본 DOCX/XLSX와 로컬 runtime DB는 이 디렉터리에 넣지 않는다. 산출물 커밋 전에는 공개 금지 자료와 불필요한 개인정보성 컬럼이 추가되지 않았는지 확인한다.
