import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isConfigured = Boolean(SUPABASE_URL && SERVICE_ROLE_KEY);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

export function requireSupabase(res) {
  if (!supabase) {
    res.status(500).json({
      message: "Supabase 설정이 없습니다 (Vercel 프로젝트의 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수 확인).",
    });
    return false;
  }
  return true;
}
