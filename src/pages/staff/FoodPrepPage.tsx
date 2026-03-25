import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_TYPES } from "@/constants";
import { submitFood } from "@/services/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { MealType } from "@/types";

export default function FoodPrepPage() {
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [items, setItems] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitFood({
        mealType,
        date: new Date().toISOString().slice(0, 10),
        items: items.split(",").map((s) => s.trim()),
        quantity: Number(quantity),
        preparedBy: "Staff",
      });
      toast.success("Food preparation recorded!");
      setItems("");
      setQuantity("");
    } catch {
      toast.error("Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container max-w-lg space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Food Preparation</h1>
          <p className="text-muted-foreground text-sm">Record today's food preparation details</p>
        </div>

        <form onSubmit={handleSubmit} className="kpi-card space-y-4">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as MealType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Food Items</Label>
            <Textarea placeholder="Rice, Dal, Vegetables, Chapati" value={items} onChange={(e) => setItems(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Separate items with commas</p>
          </div>

          <div className="space-y-2">
            <Label>Quantity (kg)</Label>
            <Input type="number" min="1" placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Preparation
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
