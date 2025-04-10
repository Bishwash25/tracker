import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Smile, Save, Trash2, Calendar, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define mood parameters
const moodParameters = [
  "Irritability & Anger",
  "Anxiety & Restlessness",
  "Sadness & Depression-like Symptoms",
  "Mood Swings & Emotional Sensitivity",
  "Fatigue & Low Energy",
  "Food Cravings & Emotional Eating",
  "Social Withdrawal & Isolation",
  "Increased Sensitivity & Overwhelm",
  "Positive & Calm States",
  "Overwhelm & Mental Fog",
  "Increased Sensitivity to Pain",
  "Lack of Interest in Intimacy",
  "Increased Need for Comfort & Support",
  "Temporary Confidence Boost",
  "Impatience & Short Attention Span"
];

// Create dynamic schema fields
const dynamicSchemaFields = Object.fromEntries(
  moodParameters.map(mood => {
    const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return [key, z.number().min(1).max(100).default(1)];
  })
);

// Create a schema with all mood parameters
const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  ...dynamicSchemaFields,
  // Additional field for "Other" mood
  other_mood_description: z.string().optional(),
  other_mood_intensity: z.number().min(1).max(100).default(1),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Create default values dynamically
const createDefaultValues = () => {
  const defaults = {
    date: new Date(),
    other_mood_description: "",
    other_mood_intensity: 1,
    notes: "",
  };
  
  moodParameters.forEach(mood => {
    const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
    defaults[key] = 1;
  });
  
  return defaults as FormValues;
};

export default function MoodTracker() {
  const [activeView, setActiveView] = useState<'track' | 'records'>('track');
  const [savedRecords, setSavedRecords] = useState<(FormValues & { id: string })[]>(() => {
    const saved = localStorage.getItem("moodTrackingComprehensive");
    return saved ? JSON.parse(saved) : [];
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
  });

  function onSubmit(data: FormValues) {
    const newRecord = {
      ...data,
      id: Date.now().toString(),
    };
    
    const updatedRecords = [newRecord, ...savedRecords];
    setSavedRecords(updatedRecords);
    localStorage.setItem("moodTrackingComprehensive", JSON.stringify(updatedRecords));
    
    toast.success("Mood record saved successfully");
    setActiveView('records'); // Switch to records view after saving
    
    form.reset(createDefaultValues());
  }

  const deleteRecord = (id: string) => {
    const updatedRecords = savedRecords.filter(record => record.id !== id);
    setSavedRecords(updatedRecords);
    localStorage.setItem("moodTrackingComprehensive", JSON.stringify(updatedRecords));
    
    toast.success("Mood record deleted");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="h-5 w-5 text-lavender" />
          Comprehensive Mood Tracker
        </CardTitle>
        
        <div className="mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between">
                {activeView === 'track' ? 'Track Moods' : 'Records'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px]">
              <DropdownMenuItem onClick={() => setActiveView('track')}>
                Track Moods
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView('records')}>
                Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {activeView === 'track' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""} 
                          onChange={e => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="font-medium mb-4">Mood Parameters (intensity 1-100)</h3>
                  <div className="space-y-6">
                    {moodParameters.map((mood, index) => {
                      const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key as any}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel className="text-base font-medium">
                                  {index + 1}. {mood} <span className="text-red-500">*</span>
                                </FormLabel>
                                <span className="text-sm font-semibold">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={100}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                />
                              </FormControl>
                              {index < moodParameters.length - 1 && (
                                <Separator className="mt-4" />
                              )}
                            </FormItem>
                          )}
                        />
                      );
                    })}

                    {/* Other mood section */}
                    <div>
                      <Separator className="mb-4" />
                      <div className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="other_mood_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                16. Other (describe)
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Describe other mood if applicable" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="other_mood_intensity"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel className="text-sm">Intensity</FormLabel>
                                <span className="text-sm font-semibold">
                                  {field.value}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={100}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  disabled={!form.watch("other_mood_description")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional notes about your mood" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Mood Record
                </Button>
              </form>
            </Form>
          )}

          {activeView === 'records' && savedRecords.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Saved Mood Records</h3>
                {savedRecords.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveView('track')}
                  >
                    Add New Record
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {savedRecords.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardHeader className="py-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <CardTitle className="text-base">
                            {format(new Date(record.date), "MMMM d, yyyy")}
                          </CardTitle>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete mood record?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this mood record from your history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteRecord(record.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4">
                      <ScrollArea className="h-[200px] pr-4">
                        <div className="space-y-3">
                          {moodParameters.map((mood, index) => {
                            const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
                            const intensity = record[key as keyof typeof record] as number;
                            
                            return (
                              <div key={key} className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium">
                                  {index + 1}. {mood}
                                </div>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-2 bg-lavender/30 rounded-full" 
                                    style={{ width: `${intensity}%` }}
                                  />
                                  <span className="text-xs">{intensity}</span>
                                </div>
                              </div>
                            );
                          })}
                          
                          {record.other_mood_description && (
                            <div className="grid grid-cols-2 gap-2">
                              <div className="text-sm font-medium">
                                16. Other: {record.other_mood_description}
                              </div>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-2 bg-lavender/30 rounded-full" 
                                  style={{ width: `${record.other_mood_intensity}%` }}
                                />
                                <span className="text-xs">{record.other_mood_intensity}</span>
                              </div>
                            </div>
                          )}
                          
                          {record.notes && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-sm font-semibold mb-1">Notes:</h4>
                              <p className="text-sm text-muted-foreground">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'records' && savedRecords.length === 0 && (
            <div className="text-center py-12">
              <Smile className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No mood records yet</h3>
              <p className="text-muted-foreground mb-6">Start tracking your moods to see records here</p>
              <Button onClick={() => setActiveView('track')}>
                Track Your Mood
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
