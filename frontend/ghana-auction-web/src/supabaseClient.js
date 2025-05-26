// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwcwhgveboknkyzmkmos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3Y3doZ3ZlYm9rbmt5emttb3MiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ4MTgzNDMyLCJleHAiOjIwNjM3NTk0MzJ9.qCoX2jCqTzvw-in-hiYWMvSnqApnUmB9xPYwyOqT_1A';

export const supabase = createClient(supabaseUrl, supabaseKey);
