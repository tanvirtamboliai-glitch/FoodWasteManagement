import { useState } from "react";
import { supabase } from "../../services/supabase";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Utensils, Trash2, Save, Loader2 } from "lucide-react";

export default function StaffPanel() {
    const [meal, setMeal] = useState("lunch");
    const [prepared, setPrepared] = useState(0);
    const [leftover, setLeftover] = useState(0);
    const [isSavingFood, setIsSavingFood] = useState(false);
    const [isSavingWaste, setIsSavingWaste] = useState(false);

    // SAVE FOOD
    async function saveFood() {
        if (prepared <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }
        
        setIsSavingFood(true);
        const { error } = await supabase
            .from("food_preparation")
            .insert([
                {
                    meal_type: meal,
                    prepared_quantity: prepared
                }
            ]);

        setIsSavingFood(false);
        if (error) {
            toast.error("Error saving food data");
            console.error(error);
        } else {
            toast.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} food data saved`);
        }
    }

    // SAVE WASTE
    async function saveWaste() {
        if (prepared <= 0) {
            toast.error("Please enter prepared quantity first");
            return;
        }
        
        setIsSavingWaste(true);
        const waste_percentage = (leftover / prepared) * 100;

        const { error } = await supabase
            .from("waste")
            .insert([
                {
                    meal_type: meal,
                    leftover_quantity: leftover,
                    waste_percentage
                }
            ]);

        setIsSavingWaste(false);
        if (error) {
            toast.error("Error saving waste data");
            console.error(error);
        } else {
            toast.success(`${meal.charAt(0).toUpperCase() + meal.slice(1)} waste data recorded`);
        }
    }

    return (
        <DashboardLayout>
            <div className="page-container space-y-8 pb-12">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight">Staff Panel</h1>
                    <p className="text-muted-foreground">Manage today's meal preparations and waste records</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Food Preparation Card */}
                    <Card className="border-none shadow-premium overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Utensils className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Food Preparation</CardTitle>
                                    <CardDescription>Record quantities prepared for each meal</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="meal-type">Meal Session</Label>
                                <Select value={meal} onValueChange={setMeal}>
                                    <SelectTrigger id="meal-type" className="rounded-xl">
                                        <SelectValue placeholder="Select meal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="breakfast">Breakfast</SelectItem>
                                        <SelectItem value="lunch">Lunch</SelectItem>
                                        <SelectItem value="dinner">Dinner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prepared-qty">Prepared Quantity (kg)</Label>
                                <Input
                                    id="prepared-qty"
                                    type="number"
                                    min="0"
                                    placeholder="e.g. 120"
                                    value={prepared || ""}
                                    onChange={(e) => setPrepared(Number(e.target.value))}
                                    className="rounded-xl"
                                />
                            </div>

                            <Button 
                                onClick={saveFood} 
                                className="w-full gap-2 rounded-xl py-6"
                                disabled={isSavingFood}
                            >
                                {isSavingFood ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Preparation Data
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Waste Management Card */}
                    <Card className="border-none shadow-premium overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardHeader className="bg-destructive/5 border-b border-destructive/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                    <Trash2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-destructive">Waste Record</CardTitle>
                                    <CardDescription>Record leftovers to calculate waste metrics</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2 pb-2">
                                <p className="text-sm font-medium">Session: <span className="capitalize text-primary font-bold">{meal}</span></p>
                                <p className="text-xs text-muted-foreground italic">Prepare quantity: {prepared}kg</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="leftover-qty">Leftover Quantity (kg)</Label>
                                <Input
                                    id="leftover-qty"
                                    type="number"
                                    min="0"
                                    max={prepared}
                                    placeholder="e.g. 15"
                                    value={leftover || ""}
                                    onChange={(e) => setLeftover(Number(e.target.value))}
                                    className="rounded-xl border-destructive/20 focus:border-destructive focus:ring-destructive/20"
                                />
                                {leftover > prepared && (
                                    <p className="text-[10px] text-destructive font-medium">Warning: Leftover exceeds prepared quantity</p>
                                )}
                            </div>

                            <div className="p-4 bg-muted rounded-xl bg-opacity-30 border border-border">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-muted-foreground">Estimated Waste:</span>
                                    <span className={prepared > 0 ? (leftover/prepared > 0.15 ? "text-destructive font-bold" : "text-success font-bold") : ""}>
                                        {prepared > 0 ? `${Math.round((leftover / prepared) * 100)}%` : "N/A"}
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-muted-foreground/10 rounded-full overflow-hidden">
                                    <div 
                                        className={cn("h-full transition-all duration-500", leftover/prepared > 0.15 ? "bg-destructive" : "bg-success")}
                                        style={{ width: prepared > 0 ? `${Math.min(100, (leftover / prepared) * 100)}%` : "0%" }}
                                    />
                                </div>
                            </div>

                            <Button 
                                onClick={saveWaste} 
                                variant="destructive"
                                className="w-full gap-2 rounded-xl py-6"
                                disabled={isSavingWaste || prepared === 0}
                            >
                                {isSavingWaste ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Record Waste Data
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}