-- 가상 상품 DB 스키마 (Supabase/PostgreSQL)
-- 실습용 데이터: docs/dummy/products/ 10건 기준
-- 생성: 상품안내 / 보관·알레르기 / 배송정책 3개 테이블, product_code로 연결

-- ── 테이블 생성 ──────────────────────────────────────────────

create table if not exists products (
    product_code text primary key,
    name text not null,
    category text,
    spec text,
    price integer not null,
    origin text,
    note text
);

create table if not exists product_care (
    product_code text primary key references products(product_code) on delete cascade,
    storage_method text,
    shelf_life text,
    allergy_info text
);

create table if not exists shipping_policy (
    policy_key text primary key,
    policy_value text
);

-- ── 데이터 입력: 상품안내 ──────────────────────────────────────

insert into products (product_code, name, category, spec, price, origin, note) values
('P-0113', '대구사과칩', '건조과일·스낵', '60g', 4900, '대구 팔공산 (사과 100%)', '설탕·첨가물 없음'),
('P-0127', '팔공산 꿀사과', '신선과일', '2kg(7~9개)', 18000, '대구 팔공산 (부사)', '당도 14Brix 이상 선별, 표면 왁스 코팅 없음'),
('P-0205', '성주 참외', '신선과일', '1.5kg(5~6개)', 12000, '경북 성주', '4~7월 한정 판매, 꼭지 마르면 당도 저하'),
('P-0207', '참외청', '가공식품(청·음료)', '350ml', 9500, '참외(경북 성주), 비정제 원당(국내산)', '탄산수 희석 비율 1:4'),
('P-0305', '청도 반건시', '건조과일·스낵', '500g(10개)', 15000, '경북 청도 (감)', '표면 흰 가루는 당분이 굳은 것(정상)'),
('P-0312', '의성 마늘', '신선채소', '1kg(약 15통)', 11000, '경북 의성', '-'),
('P-0318', '흑마늘 진액', '건강식품(즙)', '70ml×30포', 24000, '흑마늘(경북 의성), 정제수', '하루 1포 권장, 임산부·수술 전후 전문가 상담 필요'),
('P-0402', '서문시장 납작만두', '냉동가공식품', '20개(500g)', 7900, '미기재(서문시장식)', '당면·부추 소, 간장 양념 포함, 냉동 상태로 중불 3분 조리'),
('P-0410', '달성 토마토', '신선채소', '1kg(6~8개)', 8500, '대구 달성', '산도가 낮아 생식용'),
('P-0421', '경산 대추칩', '건조과일·스낵', '50g', 5500, '경북 경산 (대추 100%)', '차로 우려 가능(80℃ 물 300ml에 5조각)')
on conflict (product_code) do update set
    name = excluded.name,
    category = excluded.category,
    spec = excluded.spec,
    price = excluded.price,
    origin = excluded.origin,
    note = excluded.note;

-- ── 데이터 입력: 보관·알레르기 ──────────────────────────────────

insert into product_care (product_code, storage_method, shelf_life, allergy_info) values
('P-0113', '개봉 후 냉장 금지, 밀봉하여 서늘한 곳 보관', '개봉 전 6개월 / 개봉 후 7일 이내', '견과류 생산 라인 공유(견과류 알레르기 주의), 글루텐 없음'),
('P-0127', '다른 과일과 함께 보관하지 않기(에틸렌으로 숙성 촉진)', '냉장 3주 / 상온 7일', '알레르기 유발 물질 없음'),
('P-0205', '냉장 보관', '냉장 5일(수령 후 3일 내 섭취 권장)', '알레르기 유발 물질 없음'),
('P-0207', '개봉 전 상온, 개봉 후 냉장. 금속 숟가락 사용 금지(나무·플라스틱 사용)', '개봉 전 12개월 / 개봉 후 30일', '알레르기 유발 물질 없음'),
('P-0305', '냉동 보관 금지, 받은 즉시 냉장', '냉장 10일', '알레르기 유발 물질 없음'),
('P-0312', '통풍 잘 되는 그늘에 상온 보관(망에 보관), 비닐 밀봉·냉장 금지(곰팡이·싹 발생)', '상온 2개월', '알레르기 유발 물질 없음'),
('P-0318', '개봉 전 상온 보관, 개봉한 포는 당일 섭취, 여름철 냉장 보관 권장', '개봉 전 18개월 / 개봉 후 당일', '알레르기 유발 물질 없음'),
('P-0402', '냉동 보관, 해동하지 말고 냉동 상태로 조리(전자레인지 조리 금지)', '냉동 3개월', '밀·대두 알레르기 주의(밀가루, 대두/간장 포함), 제조 라인 계란 사용'),
('P-0410', '꼭지를 아래로 두고 보관, 냉장 후 먹기 30분 전 꺼내기', '실온 3일 / 냉장 7일', '알레르기 유발 물질 없음'),
('P-0421', '개봉 후 밀봉하여 상온 보관, 동봉된 실리카겔 유지', '개봉 후 14일', '견과류 생산 라인 공유(견과류 알레르기 주의)')
on conflict (product_code) do update set
    storage_method = excluded.storage_method,
    shelf_life = excluded.shelf_life,
    allergy_info = excluded.allergy_info;

-- ── 데이터 입력: 배송정책 (전 상품 공통, 1회만 기록) ───────────────

insert into shipping_policy (policy_key, policy_value) values
('적용_범위', '전체 상품 공통 (products 테이블의 모든 product_code에 적용)'),
('무료배송_기준', '30000'),
('배송비', '2500'),
('지역별_배송', '수성구·달서구는 당일배송(오후 2시 이전 주문), 그 외 지역은 익일배송'),
('발송_요일', '신선식품은 월~목 발송, 금요일 주문은 다음 주 월요일 발송')
on conflict (policy_key) do update set
    policy_value = excluded.policy_value;
