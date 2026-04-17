import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// This function handles the QR scan result and calls the backend API
export const handleScan = async (qrData: string, studentId: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/mark-attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_id: studentId,
        qr_data: qrData,
      }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      toast.success(`Success! Attendance marked for ${result.meal_type}.`);
    } else if (result.status === 'duplicate') {
      toast.info('You have already marked attendance for this meal.');
    } else {
      toast.error(`Error: ${result.message || 'Something went wrong'}`);
    }

    return result;
  } catch (error) {
    console.error('Scan error:', error);
    toast.error('Failed to connect to the server. Make sure the backend is running.');
    return { status: 'error', message: 'Connection failed' };
  }
};
