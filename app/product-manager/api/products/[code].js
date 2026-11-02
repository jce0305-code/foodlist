import { supabase, requireSupabase } from "../_lib/supabase.js";

export default async function handler(req, res) {
  if (!requireSupabase(res)) return;

  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ message: `허용되지 않은 메서드: ${req.method}` });
  }

  const { code } = req.query;
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("product_code", code);

  if (error) return res.status(500).json({ message: error.message });
  if (!count) return res.status(404).json({ message: `상품을 찾을 수 없습니다: ${code}` });

  return res.status(204).end();
}
