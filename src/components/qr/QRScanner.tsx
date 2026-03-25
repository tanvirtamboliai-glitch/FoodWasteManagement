import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { scanQR } from "@/services/api";
import { useDashboardStore } from "@/store/dashboardStore";
import { toast } from "sonner";

export default function QRScanner() {
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
        // We can stop the scanner or just process the result
        // To prevent multiple scans of the same code quickly, we use the service's feedback
        const mealId = `meal-lunch-${new Date().toISOString().slice(0, 10)}`;
        const res = await scanQR(decodedText, mealId);
        
        if (res.success && res.attendance) {
          addAttendance(res.attendance);
          toast.success("Attendance recorded!");
        } else {
          toast.error(res.message || "Scan failed");
        }
      } catch (error) {
        console.error("Scan processing error:", error);
        toast.error("Failed to process QR code");
      }
    };

    scanner.render(onScanSuccess, (error) => {
      // Optional: handle scan error (occurs for every frame without a QR code)
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [addAttendance]);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div id="reader" className="overflow-hidden rounded-2xl border-2 border-border/50 bg-black"></div>
      <p className="text-center text-xs text-muted-foreground">
        Ensure the QR code is centered and well-lit.
      </p>
    </div>
  );
}