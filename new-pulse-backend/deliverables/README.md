# Backend Deliverables

이 디렉터리는 제출 검증용 SQLite DB와 CSV export 산출물을 포함한다.

## 포함 파일

- `news-pulse-qa.sqlite`: 실제 QA 실행 결과가 담긴 제출 검증용 SQLite DB
- `articles.csv`: 기사 메타데이터 export
- `article_categories.csv`: 기사-카테고리 매핑 export
- `push_histories.csv`: 푸시 발송 시뮬레이션 이력 export
- `export-summary.csv`: 기본 export 테이블별 row count
- `table-counts.csv`: 주요 테이블 row count
- `article-category-counts.csv`: 카테고리별 기사 매핑 수
- `push-history-status-counts.csv`: 발송 상태별 count
- `article_read_states.csv`: QA 중 생성된 읽음 상태

## CSV Export 재생성

백엔드 실행 후 RSS 수집과 push dispatch를 수행한 뒤 아래 명령으로 기본 CSV 산출물을 생성할 수 있다.

```bash
cd new-pulse-backend
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables
```

기본 생성 대상은 다음과 같다.

- `articles.csv`
- `article_categories.csv`
- `push_histories.csv`
- `export-summary.csv`

SQLite 복사본까지 함께 생성하려면 아래 옵션을 사용한다.

```bash
python3 scripts/export_deliverables.py --db news-pulse.sqlite --out deliverables --include-db-copy
```

## 확인 방법

SQLite DB는 아래처럼 직접 확인할 수 있다.

```bash
sqlite3 new-pulse-backend/deliverables/news-pulse-qa.sqlite \
  "SELECT COUNT(*) FROM articles;"

sqlite3 new-pulse-backend/deliverables/news-pulse-qa.sqlite \
  "SELECT status, COUNT(*) FROM push_histories GROUP BY status;"

sqlite3 new-pulse-backend/deliverables/news-pulse-qa.sqlite \
  "SELECT user_no, article_id, COUNT(*) FROM push_histories GROUP BY user_no, article_id HAVING COUNT(*) > 1;"
```

마지막 중복 확인 SQL은 결과가 없어야 정상이다.

CSV는 일반 텍스트 파일이므로 `head`, spreadsheet 프로그램, 또는 GitHub 파일 뷰어로 확인할 수 있다.

```bash
head -5 new-pulse-backend/deliverables/table-counts.csv
head -5 new-pulse-backend/deliverables/push-history-status-counts.csv
```

원본 과제 문서, 원본 사용자 workbook, 로컬 runtime DB는 이 디렉터리에 넣지 않는다. 산출물 커밋 전에는 공개 금지 자료와 불필요한 개인정보성 컬럼이 추가되지 않았는지 확인한다.
