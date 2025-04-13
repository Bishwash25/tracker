import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Calculator, Calendar, BarChart3, Trash2, ChevronDown, Download } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
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
import { useIsMobile } from "@/hooks/use-mobile";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  weight: z.coerce.number({
    required_error: "Weight is required",
    invalid_type_error: "Weight must be a number",
  }).positive("Weight must be positive"),
  height: z.coerce.number({
    required_error: "Height is required",
    invalid_type_error: "Height must be a number",
  }).positive("Height must be positive"),
  heightUnit: z.enum(["cm", "m", "ft"], {
    required_error: "Height unit is required",
  }),
  weightUnit: z.enum(["kg", "lb"], {
    required_error: "Weight unit is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;
type ViewMode = "calculator" | "records" | "chart";

// BMI Calculation function
const calculateBMI = (weight: number, height: number, weightUnit: string, heightUnit: string): number => {
  // Convert weight to kg if in pounds
  const weightInKg = weightUnit === "lb" ? weight * 0.453592 : weight;
  
  // Convert height to meters
  let heightInMeters: number;
  if (heightUnit === "cm") {
    heightInMeters = height / 100;
  } else if (heightUnit === "ft") {
    heightInMeters = height * 0.3048;
  } else {
    heightInMeters = height;
  }
  
  // Calculate BMI (weight in kg / height in meters squared)
  return parseFloat((weightInKg / (heightInMeters * heightInMeters)).toFixed(2));
};

// BMI Category determination
const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 24.9) return "Normal weight";
  if (bmi < 29.9) return "Overweight";
  if (bmi < 34.9) return "Obesity Class I";
  if (bmi < 39.9) return "Obesity Class II";
  return "Obesity Class III";
};

// Get color for BMI category
const getBMIColor = (bmi: number): string => {
  if (bmi < 18.5) return "text-blue-500";
  if (bmi < 24.9) return "text-green-600";
  if (bmi < 29.9) return "text-yellow-500";
  if (bmi < 34.9) return "text-orange-500";
  if (bmi < 39.9) return "text-red-500";
  return "text-red-700";
};

export default function BMICalculator({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [bmiRecords, setBMIRecords] = useState<(FormValues & { id: string; bmi: number; category: string })[]>(() => {
    const saved = localStorage.getItem("pregnancyBMIRecords");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>("calculator");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      heightUnit: "cm",
      weightUnit: "kg",
    },
  });
  
  // Save records to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pregnancyBMIRecords", JSON.stringify(bmiRecords));
  }, [bmiRecords]);
  
  function onSubmit(data: FormValues) {
    const bmi = calculateBMI(data.weight, data.height, data.weightUnit, data.heightUnit);
    const category = getBMICategory(bmi);
    
    const newRecord = {
      ...data,
      id: Date.now().toString(),
      bmi,
      category,
    };
    
    const updatedRecords = [newRecord, ...bmiRecords]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setBMIRecords(updatedRecords);
    
    toast({
      title: "BMI calculated and saved",
      description: `Your BMI is ${bmi} (${category})`,
    });
    
    // Reset form
    form.reset({
      date: new Date(),
      weight: undefined,
      height: undefined,
      heightUnit: "cm",
      weightUnit: "kg",
    });
    
    // Switch to records view after calculation
    setViewMode("records");
  }
  
  const confirmDeleteRecord = (id: string) => {
    setRecordToDelete(id);
    setShowConfirmDelete(true);
  };
  
  const deleteRecord = () => {
    if (!recordToDelete) return;
    
    const updatedRecords = bmiRecords.filter(record => record.id !== recordToDelete);
    setBMIRecords(updatedRecords);
    
    toast({
      title: "Record deleted",
      description: "BMI record has been removed",
    });
    
    setShowConfirmDelete(false);
    setRecordToDelete(null);
  };
  
  const handleDownloadRecords = () => {
    if (bmiRecords.length === 0) {
      toast({
        title: "No records to download",
        description: "Add some BMI records first",
        variant: "destructive",
      });
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Download failed",
        description: "Please allow popups to download your records",
        variant: "destructive",
      });
      return;
    }

    // Create HTML content for the PDF
    const sortedRecords = [...bmiRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>BMI Records</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #7e69ab;
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .date {
              color: #666;
              font-size: 14px;
            }
            .category {
              font-weight: bold;
            }
            .underweight { color: #3b82f6; }
            .normal { color: #16a34a; }
            .overweight { color: #eab308; }
            .obesity-1 { color: #f97316; }
            .obesity-2 { color: #ef4444; }
            .obesity-3 { color: #b91c1c; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BMI Records</h1>
            <div class="date">Generated on: ${format(new Date(), "MMMM d, yyyy")}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Height</th>
                <th>Weight</th>
                <th>BMI</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${sortedRecords.map(record => {
                const categoryClass = record.category === "Underweight" ? "underweight" :
                  record.category === "Normal weight" ? "normal" :
                  record.category === "Overweight" ? "overweight" :
                  record.category === "Obesity Class I" ? "obesity-1" :
                  record.category === "Obesity Class II" ? "obesity-2" : "obesity-3";
                
                return `
                  <tr>
                    <td>${format(new Date(record.date), "MMMM d, yyyy")}</td>
                    <td>${record.height} ${record.heightUnit}</td>
                    <td>${record.weight} ${record.weightUnit}</td>
                    <td>${record.bmi}</td>
                    <td class="category ${categoryClass}">${record.category}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write the HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };

    toast({
      title: "Download started",
      description: "Your BMI records are being prepared for download",
    });
  };
  
  // Prepare data for the chart
  const chartData = bmiRecords
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => ({
      date: format(new Date(record.date), "MMM d, yyyy"),
      bmi: record.bmi,
    }));
  
  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "calculator": return "Calculate BMI";
      case "records": return "Records";
      case "chart": return "Charts";
      default: return "BMI Calculator";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>BMI Calculator</h1>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {getViewTitle()} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => setViewMode("calculator")}>
                Calculate BMI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("records")}>
                Records
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("chart")}>
                Charts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {viewMode === "calculator" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculate Your BMI</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your height" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="heightUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="cm">cm</option>
                              <option value="m">m</option>
                              <option value="ft">ft</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your weight" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weightUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="kg">kg</option>
                              <option value="lb">lb</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-softpink hover:bg-softpink/80">
                    Calculate BMI
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>BMI Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Underweight</span>
                  <span className="text-blue-500">Below 18.5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Normal weight</span>
                  <span className="text-green-600">18.5 - 24.9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overweight</span>
                  <span className="text-yellow-500">25 - 29.9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Obesity Class I</span>
                  <span className="text-orange-500">30 - 34.9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Obesity Class II</span>
                  <span className="text-red-500">35 - 39.9</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Obesity Class III</span>
                  <span className="text-red-700">40 or higher</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Note: BMI is not always an accurate measure of health during pregnancy.
                Always consult with your healthcare provider for personalized advice.
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {viewMode === "records" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>BMI History</CardTitle>
            {bmiRecords.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadRecords}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {bmiRecords.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">
                  No BMI records yet. Use the calculator to track your BMI over time.
                </p>
                <Button onClick={() => setViewMode("calculator")} variant="outline">
                  <Calculator className="h-4 w-4 mr-2" /> Calculate Your First BMI
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bmiRecords.map((record) => (
                  <div key={record.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(record.date), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDeleteRecord(record.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Height</p>
                        <p>{record.height} {record.heightUnit}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Weight</p>
                        <p>{record.weight} {record.weightUnit}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-muted-foreground text-sm">BMI</p>
                          <p className="text-lg font-semibold">{record.bmi}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground text-sm">Category</p>
                          <p className={`font-medium ${getBMIColor(record.bmi)}`}>
                            {record.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {viewMode === "chart" && (
        <Card>
          <CardHeader>
            <CardTitle>BMI Trend Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">
                  No BMI records yet. Use the calculator to track your BMI over time.
                </p>
                <Button onClick={() => setViewMode("calculator")} variant="outline">
                  <Calculator className="h-4 w-4 mr-2" /> Calculate Your First BMI
                </Button>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis 
                      domain={["dataMin - 1", "dataMax + 1"]}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="bmi" 
                      stroke="#9d5c8e" 
                      activeDot={{ r: 8 }}
                      name="BMI"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
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
              Are you sure you want to delete this BMI record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteRecord}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 