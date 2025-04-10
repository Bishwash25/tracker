import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Smile, Save, Plus, Minus, Share, ArrowLeft, Trash2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// List of all moods to track
const moods = [
  "Happiness/Joy",
  "Anxiety/Worry",
  "Sadness",
  "Irritability",
  "Fatigue/Exhaustion",
  "Calm/Relaxed",
  "Stress",
  "Anger/Frustration",
  "Excitement",
  "Fear",
  "Loneliness",
  "Confusion",
  "Empowerment",
  "Overwhelm"
];

// Create the form schema with all moods having intensity
const formSchemaFields: Record<string, any> = {};

// Add each mood as a required field with intensity
moods.forEach(mood => {
  const fieldName = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
  formSchemaFields[fieldName] = z.number({
    required_error: `${mood} intensity is required`,
  }).min(1).max(100);
});

// Add the other field
formSchemaFields.other_mood = z.string().optional();
formSchemaFields.other_intensity = z.number().min(1).max(100).optional();

// Date field
formSchemaFields.date = z.date({
  required_error: "Date is required",
});

const formSchema = z.object(formSchemaFields).refine(data => {
  // If other mood is provided, its intensity must also be provided
  if (data.other_mood && data.other_mood.trim() !== '') {
    return data.other_intensity !== undefined;
  }
  return true;
}, {
  message: "Intensity for Other mood is required",
  path: ["other_intensity"]
});

type FormValues = z.infer<typeof formSchema>;
type ViewMode = "record" | "history";

export default function MoodsTracker({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>("record");
  const [savedMoods, setSavedMoods] = useState<(FormValues & { id: string })[]>(() => {
    const saved = localStorage.getItem("pregnancyMoodTracking");
    return saved ? JSON.parse(saved) : [];
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [moodToDelete, setMoodToDelete] = useState<string | null>(null);

  // Create default values for the form
  const defaultValues: Partial<FormValues> = {
    date: new Date(),
    other_mood: "",
  };

  // Set default intensity for all moods
  moods.forEach(mood => {
    const fieldName = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
    defaultValues[fieldName as keyof FormValues] = 50;
  });
  defaultValues.other_intensity = 50;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  function onSubmit(data: FormValues) {
    const newMood = {
      ...data,
      id: Date.now().toString(),
    };
    
    const updatedMoods = [newMood, ...savedMoods];
    setSavedMoods(updatedMoods);
    localStorage.setItem("pregnancyMoodTracking", JSON.stringify(updatedMoods));
    
    toast({
      title: "Mood record saved",
      description: "Your mood data has been recorded successfully.",
    });
    
    // Reset form with default values
    form.reset(defaultValues);
    
    // Switch to history view after saving
    setViewMode("history");
  }

  const confirmDeleteMood = (id: string) => {
    setMoodToDelete(id);
    setShowConfirmDelete(true);
  };

  const deleteMood = () => {
    if (!moodToDelete) return;
    
    const updatedMoods = savedMoods.filter(mood => mood.id !== moodToDelete);
    setSavedMoods(updatedMoods);
    localStorage.setItem("pregnancyMoodTracking", JSON.stringify(updatedMoods));
    
    toast({
      title: "Mood deleted",
      description: "Mood record has been removed.",
    });
    
    setShowConfirmDelete(false);
    setMoodToDelete(null);
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "record": return "Record your moods";
      case "history": return "Records";
      default: return "Mood Tracker";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>Pregnancy Mood Tracker</h1>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {getViewTitle()} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => setViewMode("record")}>
                Record your moods
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("history")}>
                Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === "record" && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-softpink" />
              Record Your Moods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {moods.map((mood, index) => {
                    const fieldName = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    return (
                      <div key={fieldName} className="p-4 border rounded-md">
                        <div className="font-medium mb-2">{index + 1}. {mood}</div>
                        <FormField
                          control={form.control}
                          name={fieldName as any}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Intensity ({field.value}%) <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <div className="flex items-center gap-4">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => field.onChange(Math.max(1, field.value - 5))}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Slider
                                    min={1}
                                    max={100}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(vals) => field.onChange(vals[0])}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => field.onChange(Math.min(100, field.value + 5))}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    );
                  })}

                  {/* Other Mood Option */}
                  <div className="p-4 border rounded-md">
                    <div className="font-medium mb-2">15. Other</div>
                    <FormField
                      control={form.control}
                      name="other_mood"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Describe your mood</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter other mood type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="other_intensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Intensity ({field?.value || 0}%)</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => field.onChange(Math.max(1, (field.value || 50) - 5))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Slider
                                min={1}
                                max={100}
                                step={1}
                                value={[field.value || 50]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => field.onChange(Math.min(100, (field.value || 50) + 5))}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-softpink hover:bg-softpink/80">
                  <Save className="mr-2 h-4 w-4" />
                  Save Mood Record
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {viewMode === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>Your Mood History</CardTitle>
          </CardHeader>
          <CardContent>
            {savedMoods.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No mood records saved yet</p>
                <Button onClick={() => setViewMode("record")} variant="outline">
                  <Smile className="h-4 w-4 mr-2" />
                  Record Your Moods
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedMoods.map((moodRecord) => (
                  <div key={moodRecord.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">{formatDate(moodRecord.date)}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDeleteMood(moodRecord.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {moods.map((mood) => {
                        const fieldName = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const intensityValue = moodRecord[fieldName as keyof FormValues] as number;
                        if (intensityValue > 0) {
                          return (
                            <div key={fieldName} className="grid grid-cols-2 gap-2">
                              <span>{mood}:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-softpink h-2.5 rounded-full"
                                    style={{ width: `${intensityValue}%` }}
                                  />
                                </div>
                                <span className="text-xs">{intensityValue}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                      {moodRecord.other_mood && moodRecord.other_intensity && (
                        <div className="grid grid-cols-2 gap-2">
                          <span>Other ({moodRecord.other_mood}):</span>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-softpink h-2.5 rounded-full"
                                style={{ width: `${moodRecord.other_intensity}%` }}
                              />
                            </div>
                            <span className="text-xs">{moodRecord.other_intensity}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mood record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteMood}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
