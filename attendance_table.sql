-- Set the database timezone to Asia/Kolkata (IST)
ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- Create the attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_name TEXT,
    mess_id TEXT NOT NULL,
    -- CURRENT_DATE will now correctly reflect Asia/Kolkata due to the database timezone setting
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate attendance for the same student on the same day for the same meal
    CONSTRAINT unique_attendance UNIQUE (student_id, date, meal_type)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all for testing (or restrict as needed)
CREATE POLICY "Allow all for now" ON public.attendance
    FOR ALL USING (true);
