import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Droplet, Save, Plus, Minus, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const flowOptions = ["Light", "Medium", "Heavy", "Very Heavy"];
const colorOptions = ["Light Red", "Bright Red", "Dark Red", "Brown", "Black", "Pink"];
const periodDayOptions = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  periodDay: z.string().min(1, "Period day is required"),
  padsChanged: z.number().min(0, "Must be 0 or more").optional(),
  flow: z.string().min(1, "Flow is required"),
  color: z.string().min(1, "Color is required"),
  painLevel: z.number().min(0).max(10),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PeriodFlowTracker() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'track' | 'records'>('track');
  const [savedRecords, setSavedRecords] = useState<(FormValues & { id: string })[]>(() => {
    const saved = localStorage.getItem("periodFlowTracking");
    return saved ? JSON.parse(saved) : [];
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      periodDay: "",
      padsChanged: 0,
      flow: "",
      color: "",
      painLevel: 0,
      notes: "",
    },
  });

  function onSubmit(data: FormValues) {
    const newRecord = {
      ...data,
      id: Date.now().toString(),
    };
    
    const updatedRecords = [newRecord, ...savedRecords];
    setSavedRecords(updatedRecords);
    localStorage.setItem("periodFlowTracking", JSON.stringify(updatedRecords));
    
    toast({
      title: "Flow record saved",
      description: "Your period flow information has been recorded.",
    });
    
    setActiveView('records'); // Switch to records view after saving
    
    form.reset({
      date: new Date(),
      periodDay: "",
      padsChanged: 0,
      flow: "",
      color: "",
      painLevel: 0,
      notes: "",
    });
  }

  const deleteRecord = (id: string) => {
    const updatedRecords = savedRecords.filter(record => record.id !== id);
    setSavedRecords(updatedRecords);
    localStorage.setItem("periodFlowTracking", JSON.stringify(updatedRecords));
    
    toast({
      title: "Record deleted",
      description: "Flow record has been removed.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-lavender" />
          Period Flow Tracker
        </CardTitle>
        
        <div className="mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[160px] justify-between">
                {activeView === 'track' ? 'Track Your Flow' : 'Records'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px]">
              <DropdownMenuItem onClick={() => setActiveView('track')}>
                Track Your Flow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView('records')}>
                Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === 'track' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="periodDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periodDayOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="padsChanged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pads/Tampons Changed</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormDescription>
                        Number of pads or tampons changed today
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="flow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flow Intensity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select flow intensity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {flowOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="painLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pain Level ({field.value}/10)</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      0 = No pain, 10 = Severe pain
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any other symptoms or observations" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Save Flow Record
              </Button>
            </form>
          </Form>
        )}

        {activeView === 'records' && savedRecords.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">Flow Records</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveView('track')}
              >
                Add New Record
              </Button>
            </div>
            <div className="space-y-3">
              {savedRecords.map((record) => (
                <div key={record.id} className="border rounded-md p-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{format(new Date(record.date), "MMM d, yyyy")}</p>
                        <span className="text-sm px-2 py-0.5 bg-lavender/10 rounded-full">
                          {record.periodDay}
                        </span>
                        <span className="text-sm px-2 py-0.5 bg-lavender/10 rounded-full">
                          {record.flow}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Color: {record.color} • Pain: {record.painLevel}/10 • Pads: {record.padsChanged}
                      </p>
                      {record.notes && <p className="text-sm mt-1">{record.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteRecord(record.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeView === 'records' && savedRecords.length === 0 && (
          <div className="text-center py-12">
            <Droplet className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No flow records yet</h3>
            <p className="text-muted-foreground mb-6">Start tracking your period flow to see records here</p>
            <Button onClick={() => setActiveView('track')}>
              Track Your Flow
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
