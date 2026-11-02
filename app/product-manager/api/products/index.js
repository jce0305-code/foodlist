import { supabase, requireSupabase } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!requireSupabase(res)) return;

  if (req.method === "GET") {
    const q = (req.query.q ?? "").toString().trim();
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
    return res.status(200).json(normalized);
  }

  if (req.method === "POST") {
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

    return res.status(201).json({ product_code });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: `허용되지 않은 메서드: ${req.method}` });
}
