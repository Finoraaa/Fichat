import { createClient } from '@supabase/supabase-js';

// Fallback to the provided keys if environment variables are not set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdyagqwwjyoyavgeruos.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_IZhoYiJUdpCPMhJ-q24mkA_bPYqOxgr';

export const supabase = createClient(supabaseUrl, supabaseKey);
