import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gusdjynnajjnadepnrtk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1c2RqeW5uYWpqbmFkZXBucnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU3ODk0ODcsImV4cCI6MjA0MTM2NTQ4N30.-PEbVVDPMozcT43xLC7uAb-uBY3arJwG3mmOVh2FvZQ'

export const supabase = createClient(supabaseUrl, supabaseKey)
