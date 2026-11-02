# product-manager 앱 정리 노트

## 이게 "사이트"인가, "SQL 시각화"인가?

| 질문 | 답 |
|---|---|
| 기술적으로 "사이트"인가? | 맞음 — 프론트엔드(React) + 백엔드(Express API) + 데이터베이스(Supabase) 3단 구조를 갖춘 실제 웹 애플리케이션 |
| "SQL 시각화"가 맞는 표현인가? | 반은 맞음 — 지금 기능이 조회·검색·추가·삭제뿐이라, Supabase의 Table Editor가 이미 해주는 일을 화면만 바꿔서 다시 보여주는 수준. 그 의미에서는 "SQL 시각화/GUI"에 가까움 |
| 결론 | "상품 데이터용 커스텀 CRUD 웹 앱 (자체 비즈니스 로직 없음)" — 이름(형태)은 사이트가 맞지만, 가치 판단으로는 "지금 상태로는 Table Editor 대체 수준" |

## 이 앱이 Table Editor보다 의미 있어지는 경우

- 비개발자 직원이 SQL/Supabase 화면 없이 상품을 관리해야 할 때
- 추가 시 자동 검증(가격 음수 방지 등) · 커스텀 UI/UX가 필요할 때
- 챗봇 등 다른 시스템과 연동할 API가 필요할 때
- 지금처럼 "연습/테스트" 목적일 때

위 조건 중 해당하는 게 없으면, 사실상 "SQL 시각화 도구"로 부르는 게 더 정직한 표현.

## 구조 요약

- 프론트엔드: React (Vite), `localhost:5173`
- 백엔드: Express API, `localhost:5174`, `/api/products` 엔드포인트 (GET 목록·검색 / POST 추가 / DELETE 삭제)
- 데이터베이스: Supabase (`products`, `product_care` 테이블), service_role 키로 서버에서만 접근 (브라우저에 노출 안 됨)
- 동기화 방식: 자체 캐시/저장소 없음 — 화면을 새로고침/검색할 때마다 매번 Supabase에서 최신 데이터를 가져오는 구조
  - 사이트에서 추가/삭제 → Supabase 테이블에 즉시 반영
  - Supabase Table Editor에서 직접 추가/수정/삭제 → 사이트 새로고침 시 그대로 보임
  - 두 경로 모두 "같은 데이터베이스"를 보는 것이므로 항상 일치함

## 검증 기록

- 더미 자리표시자 값(`.env.local`) → 실제 Supabase URL/키로 교체 후 연동 성공
- GET `/api/products` → 10건 정상 조회
- GET `/api/products?q=마늘` → 2건(의성 마늘, 흑마늘 진액) 정상 검색
- 사이트에서 `p-1030 떡볶이` 추가 → API 응답에 즉시 반영 확인 (Supabase에 실제로 저장됨)
