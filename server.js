import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables! Check your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Endpoint: Mark Attendance
 * Input: { student_id, qr_data }
 * qr_data format: "mess_id|meal_type"
 */
app.post('/mark-attendance', async (req, res) => {
  const { student_id, qr_data } = req.body;
  console.log("Incoming request:", { student_id, qr_data });

  if (!student_id || !qr_data) {
    console.warn("Missing student_id or qr_data");
    return res.status(400).json({ status: "error", message: "Missing student_id or qr_data" });
  }

  try {
    // 1. Precise QR Parsing: Identify meal_type anywhere in the QR string
    const knownMeals = ["breakfast", "lunch", "dinner", "snack", "launch"]; // Added 'launch' as typo-safe for 'lunch'
    const qrLower = qr_data.trim().toLowerCase();
    
    console.log("Processing QR string:", qr_data);

    let meal_type = null;
    let mess_id = "default_mess";

    // A. Check for 'mess_id|meal_type' format first (Highest priority)
    if (qr_data.includes('|')) {
        const parts = qr_data.split('|');
        mess_id = parts[0].trim();
        const secondPart = parts[1].trim().toLowerCase();
        
        // Match second part against known meals
        const match = knownMeals.find(m => secondPart.includes(m));
        if (match) {
            meal_type = match === "launch" ? "lunch" : match;
            console.log("Matched 'mess|meal' format:", { mess_id, meal_type });
        }
    }

    // B. If no '|' or if second part didn't match, search the whole string
    if (!meal_type) {
        const match = knownMeals.find(m => qrLower.includes(m));
        if (match) {
            meal_type = match === "launch" ? "lunch" : match;
            // Use the whole string as mess_id if it's not just the meal name
            mess_id = (qrLower === match) ? "default_mess" : qr_data.trim();
            console.log("Matched meal from anywhere in string:", { mess_id, meal_type });
        }
    }

    // C. Still require a meal type in the QR
    if (!meal_type) {
        console.warn("FAILED: No valid meal keyword found in QR data:", qr_data);
        return res.status(400).json({ 
            status: "error", 
            message: "Invalid QR: No meal type (breakfast/lunch/dinner) detected. Ensure your QR contains a valid meal name." 
        });
    }

    console.log("SUCCESS: Final data to insert:", { student_id, mess_id, meal_type });

    // 3. Insert into Supabase table "attendance"
    const { data, error } = await supabase
      .from('attendance')
      .insert([
        { 
            student_id: student_id, 
            meal_type: meal_type,
            mess_id: mess_id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === '23505') { 
        return res.json({ status: "duplicate", message: "Already marked" });
      }
      throw error;
    }

    console.log("Attendance recorded successfully");
    
    // Map DB fields to match Attendance type
    const attendanceRecord = {
        id: data.id,
        studentId: data.student_id,
        studentName: "Student", // Optional: could fetch profile name
        mealId: data.mess_id,
        mealType: data.meal_type,
        date: data.date,
        scannedAt: data.created_at
    };

    return res.json({ 
        status: "success", 
        meal_type, 
        attendance: attendanceRecord 
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Network access on http://172.27.224.181:${PORT}`);
});
