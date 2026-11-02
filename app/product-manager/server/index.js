import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isConfigured = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);
const supabase = isConfigured
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

if (!isConfigured) {
  console.warn(
    "[product-manager] .env.local에 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 없습니다. API가 500을 반환합니다."
  );
}

const app = express();
app.use(cors());
app.use(express.json());

function requireSupabase(res) {
  if (!supabase) {
    res.status(500).json({ message: ".env.local에 Supabase 설정이 없습니다 (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)." });
    return false;
  }
  return true;
}

app.get("/api/products", async (req, res) => {
  if (!requireSupabase(res)) return;

  const q = (req.query.q ?? "").trim();
  let query = supabase
    .from("products")
    .select("*, product_care(storage_method, shelf_life, allergy_info)")
    .order("product_code");

  if (q) {
    query = query.or(`name.ilike.%${q}%,category.ilike.%${q}%,product_code.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ message: error.message });

  const normalized = (data ?? []).map((p) => ({
    ...p,
    product_care: Array.isArray(p.product_care) ? p.product_care[0] ?? null : p.product_care,
  }));
  res.json(normalized);
});

app.post("/api/products", async (req, res) => {
  if (!requireSupabase(res)) return;

  const { product_code, name, category, spec, price, origin, note, storage_method, shelf_life, allergy_info } =
    req.body ?? {};

  if (!product_code || !name || price === undefined || price === null || price === "") {
    return res.status(400).json({ message: "상품코드, 상품명, 가격은 필수입니다." });
  }

  const { error: insertError } = await supabase.from("products").insert({
    product_code,
    name,
    category: category || null,
    spec: spec || null,
    price: Number(price),
    origin: origin || null,
    note: note || null,
  });

  if (insertError) {
    const status = insertError.code === "23505" ? 409 : 500;
    return res.status(status).json({ message: insertError.message });
  }

  if (storage_method || shelf_life || allergy_info) {
    const { error: careError } = await supabase.from("product_care").insert({
      product_code,
      storage_method: storage_method || null,
      shelf_life: shelf_life || null,
      allergy_info: allergy_info || null,
    });
    if (careError) return res.status(500).json({ message: careError.message });
  }

  res.status(201).json({ product_code });
});

app.delete("/api/products/:code", async (req, res) => {
  if (!requireSupabase(res)) return;

  const { code } = req.params;
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("product_code", code);

  if (error) return res.status(500).json({ message: error.message });
  if (!count) return res.status(404).json({ message: `상품을 찾을 수 없습니다: ${code}` });

  res.status(204).end();
});

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`product-manager API listening on http://localhost:${PORT}`);
  console.log(`Supabase 연동: ${isConfigured ? "설정됨" : "미설정 (.env.local 확인 필요)"}`);
});
