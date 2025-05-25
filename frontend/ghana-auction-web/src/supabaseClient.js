import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bclyzpttthmbfjauftdg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjbHl6cHR0dGhtYmZqYXVmdGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMTQ2MDgsImV4cCI6MjA2Mzc5MDYwOH0.YAWW13W7EOP-00vY-duolFpts42gY5Kl8HVGjijacQU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
