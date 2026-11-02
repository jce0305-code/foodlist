-- 가상 상품 DB 스키마 (Supabase/PostgreSQL)
-- 실습용: docs/dummy/products/ 10건 기준
-- 테이블: 상품안내(products) / 보관·알레르기(product_care) / 배송정책(shipping_policy)

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
