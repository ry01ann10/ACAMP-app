
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tukvextwmcefsfvtlthm.supabase.co';
const supabaseAnonKey = 'sb_publishable_83SFxSsQp68mZPy2CVdXOA_7T6Domsd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
