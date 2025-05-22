import React, { useState, useEffect } from "react";
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
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, collection, deleteDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { USER_AUTHENTICATED_EVENT } from "@/hooks/use-auth";

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
    return [key, z.number().min(1).max(10).default(1)];
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
  other_mood_intensity: z.number().min(1).max(10).optional(),
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
  const [userId, setUserId] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Load user ID on component mount
  useEffect(() => {
    console.log("MoodTracker component mounted, checking for user ID");
    
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
  }, []);
  
  // Log whenever userId changes
  useEffect(() => {
    console.log("User ID changed to:", userId);
    if (userId) {
      // Clear saved records and localStorage on user change
      setSavedRecords([]);
      localStorage.removeItem("moodTrackingComprehensive");
      setDataFetched(false);
    }
  }, [userId]);
  
  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.uid) {
        console.log("Auth state changed - user ID:", user.uid);
        setUserId(user.uid);
      } else {
        console.log("Auth state changed - no user");
      }
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);
  
  // Fetch mood records from Firestore when userId changes or on auth event
  useEffect(() => {
    if (userId && !dataFetched) {
      fetchMoodRecordsFromFirestore(userId);
    }
  }, [userId, dataFetched]);

  // Listen for authentication event
  useEffect(() => {
    const handleUserAuthenticated = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log("MoodTracker: User authenticated event received:", userId);
      if (userId) {
        fetchMoodRecordsFromFirestore(userId);
      }
    };

    // Add event listener
    window.addEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);

    // Clean up
    return () => {
      window.removeEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);
    };
  }, []);

  // Function to fetch mood records from Firestore
  const fetchMoodRecordsFromFirestore = async (uid: string) => {
    try {
      console.log("Fetching mood records for user:", uid);
      
      // Get mood records from the moods subcollection
      const moodsRef = collection(db, "users", uid, "moods");
      const moodsQuery = query(moodsRef, orderBy("createdAt", "desc"), limit(50));
      const moodsSnapshot = await getDocs(moodsQuery);
      
      if (!moodsSnapshot.empty) {
        const moodRecords = moodsSnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Process date properly
          let processedDate = data.date;
          if (typeof processedDate === 'string') {
            processedDate = new Date(processedDate);
          }
          
          return {
            ...data,
            id: doc.id,
            date: processedDate
          };
        });
        
        console.log("Found mood records:", moodRecords.length, "records");
        
        // Update local state and localStorage
        setSavedRecords(moodRecords);
        localStorage.setItem("moodTrackingComprehensive", JSON.stringify(moodRecords));
      } else {
        console.log("No mood records found");
      }
      
      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching mood records:", error);
    }
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
  });

  // Save mood record to Firebase
  const saveMoodToFirestore = async (moodData: FormValues & { id: string }) => {
    if (!userId) {
      // Try one more time to get the user ID directly from auth
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        setUserId(currentUser.uid);
        console.log("Retrieved user ID directly in save function:", currentUser.uid);
      } else {
        console.error("Cannot save : No user ID available");
        return false;
      }
    }

    const effectiveUserId = userId || auth.currentUser?.uid;
    if (!effectiveUserId) {
      console.error("Still no user ID available after retry");
      return false;
    }

    try {
      console.log("Saving mood data for user:", effectiveUserId);
      
      // Convert the date to ISO string for Firestore
      const firestoreData = {
        ...moodData,
        date: moodData.date instanceof Date ? moodData.date.toISOString() : moodData.date,
        createdAt: new Date().toISOString()
      };
      
      // First, save directly in the user document
      const userRef = doc(db, "users", effectiveUserId);
      await setDoc(userRef, {
        moods: {
          [moodData.id]: firestoreData
        },
        moodTracking: {
          lastMoodDate: firestoreData.date,
          lastRecordId: moodData.id,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
      
      // Also save in the moods subcollection
      const moodRef = doc(db, "users", effectiveUserId, "moods", moodData.id);
      await setDoc(moodRef, firestoreData);
      
      console.log("Successfully saved mood data ");
      return true;
    } catch (error) {
      console.error("Error saving mood data:", error);
      return false;
    }
  };

  // Delete mood record from Firebase
  const deleteMoodFromFirestore = async (moodId: string) => {
    if (!userId) {
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        setUserId(currentUser.uid);
      } else {
        console.error("Cannot delete: No user ID available");
        return false;
      }
    }

    const effectiveUserId = userId || auth.currentUser?.uid;
    if (!effectiveUserId) {
      console.error("Still no user ID available after retry");
      return false;
    }

    try {
      console.log("Deleting mood data :", effectiveUserId);
      
      // First, update the user document to remove this mood
      const userRef = doc(db, "users", effectiveUserId);
      
      // We can't directly delete a nested field, so we need to update with a special value
      await setDoc(userRef, {
        moods: {
          [moodId]: null  // Firebase will interpret this as a delete operation for this field
        }
      }, { merge: true });
      
      // Also delete from the moods subcollection
      const moodRef = doc(db, "users", effectiveUserId, "moods", moodId);
      await deleteDoc(moodRef);
      
      console.log("Successfully deleted mood data ");
      return true;
    } catch (error) {
      console.error("Error deleting mood data :", error);
      return false;
    }
  };

  async function onSubmit(data: FormValues) {
    // Check if all mood parameters are still at their default value (1)
    const allDefault = moodParameters.every(mood => {
      const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return data[key] === 1;
    });
    if (allDefault && (!data.other_mood_description || data.other_mood_description.trim() === '')) {
      toast.error("Please choose the option above");
      return;
    }
    
    const newRecord = {
      ...data,
      id: Date.now().toString(),
    };
    
    const updatedRecords = [newRecord, ...savedRecords];
    setSavedRecords(updatedRecords);
    
    // Save to localStorage (keep original functionality)
    localStorage.setItem("moodTrackingComprehensive", JSON.stringify(updatedRecords));
    
    // Save to Firebase
    const firebaseResult = await saveMoodToFirestore(newRecord);
    
    if (firebaseResult) {
      toast.success("Mood record saved successfully.");
    } else {
      toast.success("Mood record saved ");
    }
    
    setActiveView('records'); // Switch to records view after saving
    form.reset(createDefaultValues());
  }

  const deleteRecord = async (id: string) => {
    const updatedRecords = savedRecords.filter(record => record.id !== id);
    setSavedRecords(updatedRecords);
    
    // Update localStorage (keep original functionality)
    localStorage.setItem("moodTrackingComprehensive", JSON.stringify(updatedRecords));
    
    // Delete from Firebase
    await deleteMoodFromFirestore(id);
    
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
              <Button
                variant="outline"
                className="w-[160px] justify-between shadow-lg bg-gradient-to-r from-[#f8f7ff] via-[#e0e7ff] to-[#f3e8ff] border-2 border-primary/40 focus:ring-2 focus:ring-primary/60"
              >
                {activeView === 'track' ? 'Track Moods' : 'Records'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px] shadow-2xl bg-white/90 backdrop-blur-md border-primary/30">
              <DropdownMenuItem onClick={() => setActiveView('track')}>
                <span className="font-bold text-black">Track Moods</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveView('records')}>
                <span className="font-bold text-black">Records</span>
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
                  <h3 className="font-medium mb-4">Mood Parameters (intensity 1-10)</h3>
                  <div className="space-y-6">
                    {moodParameters.map((mood, index) => {
                      const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={key as keyof FormValues}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel className="text-base font-medium">
                                  {index + 1}. {mood} <span className="text-red-500">*</span>
                                </FormLabel>
                                <span className="text-sm font-semibold">
                                  {typeof field.value === 'number' ? field.value : 1}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[typeof field.value === 'number' ? field.value : 1]}
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
                                16. Other (describe your moods in a sentences)
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
                              <div className="flex items-center justify-between mb-2">
                                <FormLabel className="text-base font-medium">
                                  
                                </FormLabel>
                                <span className="text-sm font-semibold">
                                  {field.value || 1}
                                </span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[field.value || 1]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
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
                            {typeof record.date === 'string' 
                              ? format(new Date(record.date), "MMMM d, yyyy")
                              : format(record.date, "MMMM d, yyyy")}
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
                            const intensityValue = record[key as keyof typeof record];
                            const intensity = typeof intensityValue === 'number' ? intensityValue : 1;
                            
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
                                {typeof record.other_mood_intensity === 'number' && (
                                  <>
                                    <div 
                                      className="h-2 bg-lavender/30 rounded-full" 
                                      style={{ width: `${(record.other_mood_intensity/10)*100}%` }}
                                    />
                                    <span className="text-xs">{record.other_mood_intensity}</span>
                                  </>
                                )}
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
