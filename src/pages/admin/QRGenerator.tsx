import { useState } from "react";
import QRCode from "qrcode";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Download, QrCode, User, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QRGenerator() {
  const [studentId, setStudentId] = useState("");
  const [messId, setMessId] = useState("mess1");
  const [mealType, setMealType] = useState("lunch");
  const [qr, setQr] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("meal");

  async function generateQR() {
    let qrData = "";
    if (activeTab === "student") {
      if (!studentId.trim()) {
        toast.error("Please enter a student ID");
        return;
      }
      qrData = studentId;
    } else {
      if (!messId.trim() || !mealType.trim()) {
        toast.error("Please fill in meal details");
        return;
      }
      qrData = `${messId}|${mealType}`;
    }

    setIsGenerating(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      const qrImage = await QRCode.toDataURL(qrData, {
        width: 800,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      setQr(qrImage);
      toast.success("QR Code generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR Code");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-container max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">QR Generator</h1>
            <p className="text-muted-foreground italic">Create dining hall access codes or student tokens</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                Generator Settings
              </CardTitle>
              <CardDescription>Select the type of QR code you want to create</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="meal" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="meal">Meal QR</TabsTrigger>
                  <TabsTrigger value="student">Student QR</TabsTrigger>
                </TabsList>
                
                <TabsContent value="meal" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="messId">Mess ID</Label>
                    <Input
                      id="messId"
                      placeholder="e.g. mess1"
                      value={messId}
                      onChange={(e) => setMessId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mealType">Meal Type</Label>
                    <Input
                      id="mealType"
                      placeholder="e.g. breakfast, lunch, dinner"
                      value={mealType}
                      onChange={(e) => setMealType(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="student" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="e.g. STU12345"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={generateQR} 
                disabled={isGenerating}
                className="w-full h-10 font-medium"
              >
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {qr ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-primary" />
                      Generated Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center p-8 space-y-6">
                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-border/20">
                      <img src={qr} alt="Generated QR Code" className="w-48 h-48 rounded-lg" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 w-full">
                      <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                         Value: <span className="text-foreground font-mono bg-muted px-2 py-0.5 rounded">
                           {activeTab === "student" ? studentId : `${messId}|${mealType}`}
                         </span>
                      </p>
                      
                      <Button variant="outline" asChild className="w-full gap-2 border-primary/20 hover:bg-primary/5 text-primary transition-colors">
                        <a href={qr} download={`qr-${activeTab}.png`}>
                          <Download className="h-4 w-4" />
                          Download Image
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center p-12 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20"
              >
                <div className="text-center space-y-3 opacity-40">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">The generated QR code will appear here</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
