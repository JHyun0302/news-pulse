# Fixture와 Seed 데이터 관리 정책

테스트 fixture와 seed 데이터는 재현성과 공개 저장소 안전성을 동시에 만족해야 한다.

## 원칙

- 원본 과제 첨부 파일은 커밋하지 않는다.
- 테스트 fixture는 원본 데이터를 그대로 복사하지 않고 필요한 최소 형태로 만든다.
- RSS 테스트는 네트워크 호출 없이 fixture XML을 사용한다.
- 사용자 seed는 CSV 형태로 변환하되, 원본 Excel 파일은 저장소에 포함하지 않는다.
- device id는 과제 검증에 필요한 경우만 seed에 포함하고 로그에는 전체 출력하지 않는다.

## 파일 위치

```text
new-pulse-backend/
  src/test/resources/fixtures/
    rss-politics.xml
    rss-economy.xml
    users-sample.csv
  src/main/resources/seed/
    users.csv
```

## RSS Fixture 기준

- 정상 item 2건 이상
- 중복 article_id 1건
- `dc:creator` 포함 item
- pubDate timezone `+0900` 포함 item
- title CDATA 포함 item
- link 마지막 path segment에서 article_id를 추출할 수 있는 item

## User Seed 기준

- 컬럼: `user_no,name,device_id,push_type,categories,dnd_time`
- `push_type`은 importer에서 `APNs`를 `APNS`로 정규화한다.
- `categories`는 쉼표 구분 문자열로 유지한다.
- `dnd_time`은 `-`, 일반 구간, 자정 넘김 구간을 모두 포함한다.
- test fixture는 소량 샘플만 둔다.
- 앱 seed는 전체 사용자 재현이 필요할 때만 `src/main/resources/seed/users.csv`에 둔다.

## DB Fixture 기준

- repository 테스트는 각 테스트마다 schema를 초기화한다.
- 테스트 간 DB 상태를 공유하지 않는다.
- SQLite memory DB 또는 임시 파일 DB를 사용한다.
- 실제 로컬 런타임 DB를 테스트에서 사용하지 않는다.

## 금지 사항

- 테스트가 실제 RSS URL을 호출하게 만들지 않는다.
- 테스트가 현재 시각에 따라 실패하게 만들지 않는다.
- 원본 Excel 경로를 코드에 하드코딩하지 않는다.
- fixture에 과제 원문 문구를 복사하지 않는다.
