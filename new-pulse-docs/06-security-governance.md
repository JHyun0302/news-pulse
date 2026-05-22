# 보안과 거버넌스

## 데이터 보호

- 원본 과제 문서와 원본 사용자 Excel은 저장소에 포함하지 않는다.
- device id는 운영 로그에 전체 출력하지 않는다.
- CSV export가 필요할 때는 과제 검증에 필요한 컬럼만 포함한다.
- SQLite DB는 검증 산출물과 로컬 런타임 파일을 분리한다.

## 설정 관리

- DB 경로, RSS 수집 주기, CORS origin은 환경 변수 또는 profile 설정으로 관리한다.
- `.env`, 운영 DB, 로컬 원본 데이터는 커밋하지 않는다.
- Spring profile은 `local`, `prod`, `test`를 분리한다.
- test profile은 임시 SQLite 또는 in-memory 대체 DB를 사용해 로컬 DB를 오염시키지 않는다.

## API 노출 기준

- 일반 사용자 API는 `/api/categories`, `/api/articles/**`로 제한한다.
- 검증용 관리 API는 `/api/admin/**`로 분리한다.
- 운영 프록시에서는 필요 시 `/api/admin/**`를 외부 차단할 수 있게 한다.
- CORS는 개발 환경에서만 넓게 열고, 배포 환경에서는 frontend origin만 허용한다.

## 장애와 관측성

- RSS 수집 실패는 feed별로 분리 기록한다.
- push dispatch 결과는 로그가 아니라 DB 이력을 기준으로 검증한다.
- health endpoint는 DB 접근 가능 여부까지 확인한다.
- scheduler 시작/종료, 수집 건수, 신규 기사 수, 발송 시도 수, 성공/실패 수를 구조화 로그로 남긴다.

## 공개 저장소 거버넌스

- 공개 문서에는 구현 기준과 실행 방법만 남긴다.
- 과제 원문을 재배포하는 수준의 문구나 표는 만들지 않는다.
- 의존성 버전은 lock file 또는 build file에 고정한다.
- final deliverables에 포함할 DB/CSV/스크린샷은 민감정보 포함 여부를 확인한 뒤 추가한다.
