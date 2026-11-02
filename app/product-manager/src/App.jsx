import { useEffect, useMemo, useState } from "react";

const API_BASE = "/api/products";

const EMPTY_FORM = {
  product_code: "",
  name: "",
  category: "",
  spec: "",
  price: "",
  origin: "",
  note: "",
  storage_method: "",
  shelf_life: "",
  allergy_info: "",
};

function ProductRow({ product, onDelete }) {
  const care = product.product_care;
  return (
    <tr>
      <td>{product.product_code}</td>
      <td>{product.name}</td>
      <td>{product.category}</td>
      <td>{product.spec}</td>
      <td className="num">{Number(product.price).toLocaleString()}원</td>
      <td>{product.origin}</td>
      <td>{care?.storage_method ?? "-"}</td>
      <td>{care?.allergy_info ?? "-"}</td>
      <td>
        <button className="danger" onClick={() => onDelete(product.product_code)}>
          삭제
        </button>
      </td>
    </tr>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async (searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const url = searchTerm.trim()
        ? `${API_BASE}?q=${encodeURIComponent(searchTerm.trim())}`
        : API_BASE;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`목록을 불러오지 못했습니다 (${res.status})`);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError(e.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(query);
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.product_code.trim() || !form.name.trim() || !form.price) {
      setError("상품코드, 상품명, 가격은 필수 입력입니다.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_code: form.product_code.trim(),
          name: form.name.trim(),
          category: form.category.trim(),
          spec: form.spec.trim(),
          price: Number(form.price),
          origin: form.origin.trim(),
          note: form.note.trim(),
          storage_method: form.storage_method.trim(),
          shelf_life: form.shelf_life.trim(),
          allergy_info: form.allergy_info.trim(),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `추가에 실패했습니다 (${res.status})`);
      }
      setForm(EMPTY_FORM);
      fetchProducts(query);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productCode) => {
    if (!window.confirm(`${productCode} 상품을 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`${API_BASE}/${encodeURIComponent(productCode)}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `삭제에 실패했습니다 (${res.status})`);
      }
      fetchProducts(query);
    } catch (e) {
      setError(e.message);
    }
  };

  const resultCount = useMemo(() => products.length, [products]);

  return (
    <div className="page">
      <h1>상품 관리</h1>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="상품명 · 카테고리 · 상품코드로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">검색</button>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            fetchProducts("");
          }}
        >
          초기화
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <section className="add-form">
        <h2>상품 추가</h2>
        <form onSubmit={handleAdd}>
          <div className="grid">
            <input placeholder="상품코드 *" value={form.product_code} onChange={handleFormChange("product_code")} />
            <input placeholder="상품명 *" value={form.name} onChange={handleFormChange("name")} />
            <input placeholder="카테고리" value={form.category} onChange={handleFormChange("category")} />
            <input placeholder="규격" value={form.spec} onChange={handleFormChange("spec")} />
            <input placeholder="가격(원) *" type="number" value={form.price} onChange={handleFormChange("price")} />
            <input placeholder="원산지" value={form.origin} onChange={handleFormChange("origin")} />
            <input placeholder="비고" value={form.note} onChange={handleFormChange("note")} />
            <input placeholder="보관방법" value={form.storage_method} onChange={handleFormChange("storage_method")} />
            <input placeholder="유통기한" value={form.shelf_life} onChange={handleFormChange("shelf_life")} />
            <input placeholder="알레르기주의" value={form.allergy_info} onChange={handleFormChange("allergy_info")} />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "추가 중..." : "추가"}
          </button>
        </form>
      </section>

      <section className="list">
        <h2>
          상품 목록 <span className="count">({resultCount}건)</span>
        </h2>
        {loading ? (
          <p>불러오는 중...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>상품코드</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>규격</th>
                <th>가격</th>
                <th>원산지</th>
                <th>보관방법</th>
                <th>알레르기주의</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <ProductRow key={p.product_code} product={p} onDelete={handleDelete} />
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty">결과가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
