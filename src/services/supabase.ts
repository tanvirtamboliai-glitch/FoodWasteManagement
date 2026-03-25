import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://seomlpaeskddsbdwgueb.supabase.co"
const supabaseKey = "sb_publishable_JgHiOUNgVlt88x2I4Y7iHg_xhSuE3LV"

export const supabase = createClient(supabaseUrl, supabaseKey)