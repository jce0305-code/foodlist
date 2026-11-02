-- 알레르기 주의 사항이 있는 상품 조회
-- 제외 대상: '알레르기 유발 물질 없음' (알레르기 없음) / '미확인' 포함 값 (아직 확인되지 않은 항목)

select
    p.product_code,
    p.name,
    p.category,
    c.allergy_info
from products p
join product_care c on c.product_code = p.product_code
where c.allergy_info <> '알레르기 유발 물질 없음'
  and c.allergy_info not ilike '%미확인%'
order by p.product_code;
