import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Droplet, Save, Plus, Minus, ChevronDown, Thermometer, Calendar, Download } from "lucide-react";
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
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, collection, deleteDoc, getDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { USER_AUTHENTICATED_EVENT } from "@/hooks/use-auth";
import jsPDF from "jspdf";

const flowOptions = ["Light", "Medium", "Heavy", "Very Heavy"];
const colorOptions = ["Light Red", "Bright Red", "Dark Red", "Brown", "Black", "Pink"];
const periodDayOptions = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
const temperatureUnitOptions = ["°C", "°F"];

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  periodDay: z.string().min(1, "Period day is required"),
  padsChanged: z.number().min(0, "Must be 0 or more").optional(),
  flow: z.string().min(1, "Flow is required"),
  color: z.string().min(1, "Color is required"),
  painLevel: z.number().min(0).max(10),
  bodyTemperature: z.string().optional(),
  temperatureUnit: z.string().default("°C"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Helper function to safely format dates
const safeFormatDate = (dateValue: string | Date | number | undefined | null): string => {
  try {
    if (!dateValue) return "Unknown date";
    if (dateValue instanceof Date) {
      return format(dateValue, "MMM d, yyyy");
    }
    if (typeof dateValue === 'string') {
      return format(parseISO(dateValue), "MMM d, yyyy");
    }
    if (typeof dateValue === 'number') {
      return format(new Date(dateValue), "MMM d, yyyy");
    }
    return "Invalid date";
  } catch (error) {
    console.error("Error formatting date:", error, dateValue);
    return "Invalid date";
  }
};

export default function PeriodFlowTracker() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'track' | 'records'>('track');
  const [savedRecords, setSavedRecords] = useState<(FormValues & { id: string })[]>(() => {
    try {
      const saved = localStorage.getItem("periodFlowTracking");
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
    } catch (error) {
      console.error("Error loading period flow records:", error);
      return [];
    }
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Load user ID on component mount
  useEffect(() => {
    const loadUserId = async () => {
      console.log("PeriodFlowTracker component mounted, checking for user ID");
      
      // Try to get user ID from Firebase Auth
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        console.log("Found user ID :", currentUser.uid);
        setUserId(currentUser.uid);
        return;
      } else {
        console.log("No current user found");
      }
      
      // Try to get user ID from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          if (parsedData.uid) {
            console.log("Found user ID from localStorage:", parsedData.uid);
            setUserId(parsedData.uid);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        console.log("No user data found in localStorage");
      }
    };
    
    loadUserId();
  }, []);
  
  // Log whenever userId changes
  useEffect(() => {
    console.log("User ID changed to:", userId);
  }, [userId]);
  
  // Fetch flow records from Firestore when userId changes or on auth event
  useEffect(() => {
    if (userId) {
      setDataFetched(false); // Always reset to force fetch
      fetchFlowRecordsFromFirestore(userId);
    }
  }, [userId]);

  // Listen for authentication event
  useEffect(() => {
    const handleUserAuthenticated = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log("PeriodFlowTracker: User authenticated event received:", userId);
      if (userId) {
        setDataFetched(false); // Reset to force fetch
        fetchFlowRecordsFromFirestore(userId);
      }
    };

    // Add event listener
    window.addEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);

    // Clean up
    return () => {
      window.removeEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);
    };
  }, []);

  // Function to fetch flow records from Firestore
  const fetchFlowRecordsFromFirestore = async (uid: string) => {
    try {
      console.log("Fetching flow records for user:", uid);
      
      // Get flow records from the flowRecords subcollection
      const flowRecordsRef = collection(db, "users", uid, "periodFlow");
      const recordsQuery = query(flowRecordsRef, orderBy("date", "desc"), limit(50));
      const recordsSnapshot = await getDocs(recordsQuery);
      
      if (!recordsSnapshot.empty) {
        const flowRecords = recordsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            // Ensure date is properly formatted
            date: data.date
          };
        });
        
        console.log("Found flow records:", flowRecords.length, "records");
        
        // Update form state and localStorage
        setSavedRecords(flowRecords);
        localStorage.setItem("periodFlowTracking", JSON.stringify(flowRecords));
      } else {
        console.log("No flow records found");
      }
      
      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching flow records:", error);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      periodDay: "",
      padsChanged: 0,
      flow: "",
      color: "",
      painLevel: 0,
      bodyTemperature: "",
      temperatureUnit: "°C",
      notes: "",
    },
  });

  // Save flow record to Firebase
  const saveFlowRecordToFirestore = async (flowData: FormValues & { id: string }) => {
    try {
      // If userId not set, try to get it directly from auth
      let currentUserId = userId;
      if (!currentUserId) {
        const currentUser = auth.currentUser;
        if (currentUser?.uid) {
          currentUserId = currentUser.uid;
          setUserId(currentUserId);
          console.log("Retrieved user ID directly in save function:", currentUserId);
        } else {
          console.error("Cannot save: No user ID available");
          return false;
        }
      }

      // First, save directly in the user document for easy access
      const userRef = doc(db, "users", currentUserId);
      console.log("Saving to user document:", currentUserId);
      
      // Prepare data for Firestore (convert date to string)
      const firestoreData = {
        ...flowData,
        date: flowData.date instanceof Date 
          ? flowData.date.toISOString() 
          : typeof flowData.date === 'string' 
            ? flowData.date 
            : new Date(flowData.date).toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Save in the user document with periodFlow field
      await setDoc(userRef, {
        periodFlow: {
          [flowData.id]: firestoreData
        },
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      // Also save in a subcollection for better organization
      const flowRef = doc(collection(db, "users", currentUserId, "periodFlow"), flowData.id);
      await setDoc(flowRef, firestoreData);
      
      console.log("Successfully saved flow data ");
      return true;
    } catch (error) {
      console.error("Error saving flow data :", error);
      return false;
    }
  };

  // Delete flow record from Firebase
  const deleteFlowRecordFromFirestore = async (recordId: string) => {
    try {
      // Try to get the user ID if it's not available
      if (!userId) {
        const currentUser = auth.currentUser;
        if (currentUser?.uid) {
          setUserId(currentUser.uid);
        } else {
          console.error("Cannot delete : No user ID available");
          return false;
        }
      }

      const effectiveUserId = userId || auth.currentUser?.uid;
      if (!effectiveUserId) {
        console.error("Still no user ID available after retry");
        return false;
      }

      console.log("Deleting flow data for user:", effectiveUserId);
      
      // First, update the user document to remove this flow record
      const userRef = doc(db, "users", effectiveUserId);
      
      // We can't directly delete a nested field, so we need to update with a special value
      await setDoc(userRef, {
        periodFlow: {
          [recordId]: null  // Firebase will interpret this as a delete operation for this field
        }
      }, { merge: true });
      
      // Also delete from the periodFlow subcollection
      const flowRef = doc(db, "users", effectiveUserId, "periodFlow", recordId);
      await deleteDoc(flowRef);
      
      console.log("Successfully deleted flow data ");
      return true;
    } catch (error) {
      console.error("Error deleting flow data :", error);
      return false;
    }
  };

  // Function to safely serialize a record for storage
  const safeSerializeRecord = (record: FormValues & { id: string }): FormValues & { id: string } => {
    const recordCopy = { ...record };
    if (recordCopy.date instanceof Date) {
      recordCopy.date = recordCopy.date.toISOString();
    }
    return recordCopy;
  };
  
  // Function to safely serialize an array of records
  const safeSerializeRecords = (records: (FormValues & { id: string })[]) => {
    return records.map(safeSerializeRecord);
  };
  
  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    try {
      const newRecord = {
        ...data,
        id: Date.now().toString(),
      };
      
      // Save to Firebase first
      const firestoreSaveResult = await saveFlowRecordToFirestore(newRecord);
      
      // Update local storage and state
      const updatedRecords = [newRecord, ...savedRecords];
      setSavedRecords(updatedRecords);
      
      // Ensure records are properly serialized before storing
      localStorage.setItem("periodFlowTracking", JSON.stringify(safeSerializeRecords(updatedRecords)));
      
      if (firestoreSaveResult) {
        toast({
          title: "Flow record saved",
          description: "Your period flow information has been saved.",
        });
      } else {
        toast({
          title: "Flow record saved ",
          description: "Your period flow information has been recorded.",
        });
      }
      
      setActiveView('records'); // Switch to records view after saving
      
      form.reset({
        date: new Date(),
        periodDay: "",
        padsChanged: 0,
        flow: "",
        color: "",
        painLevel: 0,
        bodyTemperature: "",
        temperatureUnit: "°C",
        notes: "",
      });
    } catch (error) {
      console.error("Error saving record:", error);
      toast({
        title: "Error saving record",
        description: "There was a problem saving your record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const deleteRecord = async (id: string) => {
    try {
      const updatedRecords = savedRecords.filter(record => record.id !== id);
      setSavedRecords(updatedRecords);
      localStorage.setItem("periodFlowTracking", JSON.stringify(safeSerializeRecords(updatedRecords)));
      
      // Delete from Firebase
      await deleteFlowRecordFromFirestore(id);
      
      toast({
        title: "Record deleted",
        description: "Flow record has been removed.",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error deleting record",
        description: "There was a problem deleting the record.",
        variant: "destructive"
      });
    }
  };

  // Download PDF in detailed format like PeriodHistory
  const handleDownloadPDF = () => {
    if (savedRecords.length === 0) {
      toast({
        title: "No records to download",
        description: "Add some flow records first",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Period Flow Records', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Add current date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Detailed flow records (vertical, one per block)
      const sortedRecords = [...savedRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      sortedRecords.forEach((record, idx) => {
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Record #${sortedRecords.length - idx}`, margin, yPos);
        yPos += 7;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${safeFormatDate(record.date)}`, margin, yPos);
        yPos += 7;
        doc.text(`Period Day: ${record.periodDay || '-'}`, margin, yPos);
        yPos += 7;
        doc.text(`Flow: ${record.flow || '-'}`, margin, yPos);
        yPos += 7;
        doc.text(`Color: ${record.color || '-'}`, margin, yPos);
        yPos += 7;
        doc.text(`Pain Level: ${record.painLevel ?? '-'} /10`, margin, yPos);
        yPos += 7;
        doc.text(`Pads/Tampons Changed: ${record.padsChanged ?? '-'}`, margin, yPos);
        yPos += 7;
        if (record.bodyTemperature) {
          doc.text(`Body Temperature: ${record.bodyTemperature}${record.temperatureUnit || '°C'}`, margin, yPos);
          yPos += 7;
        }
        if (record.notes) {
          doc.text('Notes:', margin, yPos);
          yPos += 5;
          const noteLines = doc.splitTextToSize(record.notes, pageWidth - (margin * 2));
          for (let i = 0; i < noteLines.length; i++) {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(noteLines[i], margin, yPos);
            yPos += 5;
          }
        }
        yPos += 10;
      });

      // Save the PDF
      const fileName = `period-flow-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      toast({
        title: "PDF Downloaded",
        description: `Your flow records have been saved as ${fileName}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Failed to generate PDF",
        description: "Please try again.",
        variant: "destructive"
      });
    }
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
              <Button variant="outline" className="w-[160px] justify-between shadow-lg bg-gradient-to-r from-[#f8f7ff] via-[#e0e7ff] to-[#f3e8ff] border-2 border-primary/40 focus:ring-2 focus:ring-primary/60">
                {activeView === 'track' ? 'Track Your Flow' : 'Records'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px] shadow-2xl bg-white/90 backdrop-blur-md border-primary/30">
              <DropdownMenuItem onClick={() => setActiveView('track')}>
                <span className="font-bold text-black">Track Your Flow</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView('records')}>
                <span className="font-bold text-black">Records</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {activeView === 'track' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="bodyTemperature"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="flex items-center gap-1">
                        <Thermometer className="h-4 w-4" />
                        Basal Body Temperature
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="36.5"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Track your temperature to monitor fertility
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="temperatureUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {temperatureUnitOptions.map((option) => (
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Flow Record"}
              </Button>
            </form>
          </Form>
        )}

        {activeView === 'records' && savedRecords.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">Flow Records</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {savedRecords.map((record) => (
                <div key={record.id} className="border rounded-md p-3">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">
                          {safeFormatDate(record.date)}
                        </p>
                        <span className="text-sm px-2 py-0.5 bg-lavender/10 rounded-full">
                          {record.periodDay}
                        </span>
                        <span className="text-sm px-2 py-0.5 bg-lavender/10 rounded-full">
                          {record.flow}
                        </span>
                        {record.bodyTemperature && (
                          <span className="text-sm px-2 py-0.5 bg-calmteal/10 text-calmteal rounded-full flex items-center gap-1">
                            <Thermometer className="h-3 w-3" /> 
                            {record.bodyTemperature}{record.temperatureUnit}
                          </span>
                        )}
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
