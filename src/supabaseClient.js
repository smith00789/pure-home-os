import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "ТВОЙ_SUPABASE_URL",
  "ТВОЙ_SUPABASE_ANON_KEY"
);
