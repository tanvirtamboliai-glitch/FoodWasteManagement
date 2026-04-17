import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { scanQR } from "@/services/api";
import { useDashboardStore } from "@/store/dashboardStore";
import { toast } from "sonner";

export default function QRScanner() {
  const { user } = useAuthStore();
  const addAttendance = useDashboardStore((state) => state.addAttendance);

  useEffect(() => {
    // Initialization with a delay to ensure the container is ready
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 15, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    const onScanSuccess = async (decodedText: string) => {
      try {
        if (!user?.id) {
          console.error("No user logged in");
          return;
        }

        // Use the Supabase client directly via the API utility function
        const res = await scanQR(user.id, decodedText);
        
        if (res.success && res.attendance) {
          toast.success(res.message);
          addAttendance(res.attendance);
        } else if (res.message.includes("Already scanned")) {
          toast.info(res.message);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.error("Scan processing error:", error);
        toast.error("Failed to process scan. Please try again.");
      }
    };

    scanner.render(onScanSuccess, (error) => {
      // Optional: handle scan error
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [user, addAttendance]);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div id="reader" className="overflow-hidden rounded-2xl border-2 border-border/50 bg-black"></div>
      <p className="text-center text-xs text-muted-foreground">
        Ensure the QR code is centered and well-lit.
      </p>
    </div>
  );
}