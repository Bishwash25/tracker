import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CalendarDays, Calendar, Droplets, Trash2, FileText, Droplet, Smile, Scale, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
import { Separator } from "@/components/ui/separator";
import jsPDF from "jspdf";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_AUTHENTICATED_EVENT } from "@/hooks/use-auth";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";

interface PeriodHistoryRecord {
  startDate: string;
  endDate: string;
  length: number;
  cycleLength: number;
  notes?: string;
}

interface FlowRecord {
  id: string;
  date: string;
  periodWeek: string;
  padsChanged: number;
  flow: string;
  color: string;
  painLevel: number;
  notes?: string;
  periodDay: string;
  bodyTemperature?: string;
  temperatureUnit?: string;
}

interface MoodRecord {
  id: string;
  date: string;
  notes?: string;
  other_mood_description?: string;
  other_mood_intensity: number;
  [key: string]: any; // For dynamic mood fields
}

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  weightUnit: string;
  notes?: string;
  source?: string;
}

// Define mood parameters for display (same as in MoodTracker)
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

export default function PeriodHistory() {
  const [periodHistory, setPeriodHistory] = useState<PeriodHistoryRecord[]>([]);
  const [flowRecords, setFlowRecords] = useState<FlowRecord[]>([]);
  const [moodRecords, setMoodRecords] = useState<MoodRecord[]>([]);
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState("period");
  const [currentPeriod, setCurrentPeriod] = useState<{
    startDate: string | null;
    endDate: string | null;
    length: number;
    cycleLength: number;
    notes?: string;
  }>({
    startDate: null,
    endDate: null,
    length: 0,
    cycleLength: 0
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadUserId = async () => {
      console.log("PeriodHistory component mounted, checking for user ID");
      
      // Try to get user ID from Firebase Auth
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        console.log("Found user ID in PeriodHistory:", currentUser.uid);
        setUserId(currentUser.uid);
        return;
      } else {
        console.log("No current user found in PeriodHistory");
      }
      
      // Try to get user ID from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          if (parsedData.uid) {
            console.log("Found user ID from localStorage in PeriodHistory:", parsedData.uid);
            setUserId(parsedData.uid);
          }
        } catch (error) {
          console.error('Error parsing user data in PeriodHistory:', error);
        }
      } else {
        console.log("No user data found in localStorage");
      }
    };
    
    loadUserId();
  }, []);
  
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

  useEffect(() => {
    if (userId && !dataFetched) {
      fetchPeriodHistoryFromFirestore(userId);
    }
  }, [userId, dataFetched]);

  useEffect(() => {
    // Listen for authentication event
    const handleUserAuthenticated = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log("PeriodHistory: User authenticated event received:", userId);
      if (userId) {
        fetchPeriodHistoryFromFirestore(userId);
      }
    };

    // Add event listener
    window.addEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);

    // Clean up
    return () => {
      window.removeEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);
    };
  }, []);

  const loadData = () => {
    // Load current period details
    const storedStartDate = localStorage.getItem("periodStartDate");
    const storedEndDate = localStorage.getItem("periodEndDate");
    const storedPeriodLength = localStorage.getItem("periodLength");
    const storedCycleLength = localStorage.getItem("cycleLength");

    if (storedStartDate && storedEndDate && storedPeriodLength && storedCycleLength) {
      setCurrentPeriod({
        startDate: storedStartDate,
        endDate: storedEndDate,
        length: parseInt(storedPeriodLength),
        cycleLength: parseInt(storedCycleLength)
      });
    }

    // Load period history
    const storedHistory = localStorage.getItem("periodHistory");
    if (storedHistory) {
      try {
        const history = JSON.parse(storedHistory) as PeriodHistoryRecord[];
        setPeriodHistory(history.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        ));
      } catch (error) {
        console.error("Error parsing period history:", error);
      }
    }
    
    // Load flow records
    const storedFlowRecords = localStorage.getItem("periodFlowTracking");
    if (storedFlowRecords) {
      try {
        const records = JSON.parse(storedFlowRecords) as FlowRecord[];
        setFlowRecords(records.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        console.error("Error parsing flow records:", error);
      }
    }
    
    // Load mood records
    const storedMoodRecords = localStorage.getItem("moodTrackingComprehensive");
    if (storedMoodRecords) {
      try {
        const records = JSON.parse(storedMoodRecords) as MoodRecord[];
        setMoodRecords(records.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      } catch (error) {
        console.error("Error parsing mood records:", error);
      }
    }
    
    // Load weight records from both period and pregnancy tracking
    let allWeightRecords: WeightRecord[] = [];
    
    // Load period weight records
    const storedPeriodWeightRecords = localStorage.getItem("periodWeightRecords");
    if (storedPeriodWeightRecords) {
      try {
        const records = JSON.parse(storedPeriodWeightRecords) as WeightRecord[];
        allWeightRecords = [...allWeightRecords, ...records];
      } catch (error) {
        console.error("Error parsing period weight records:", error);
      }
    }
    
    // Load pregnancy weight records
    const storedPregnancyWeightRecords = localStorage.getItem("pregnancyWeightTracking");
    if (storedPregnancyWeightRecords) {
      try {
        const records = JSON.parse(storedPregnancyWeightRecords) as WeightRecord[];
        const convertedRecords = records.map(record => ({
          ...record,
          source: "pregnancy",
          weightUnit: record.weightUnit || "kg", // Add default unit if missing
          notes: record.notes // Use the correct property name
        }));
        allWeightRecords = [...allWeightRecords, ...convertedRecords];
      } catch (error) {
        console.error("Error parsing pregnancy weight records:", error);
      }
    }
    
    // Also check the original pregnancy weight records (different format)
    const storedOriginalWeightRecords = localStorage.getItem("weightRecords");
    if (storedOriginalWeightRecords) {
      try {
        const records = JSON.parse(storedOriginalWeightRecords);
        const convertedRecords = records.map((record: any) => ({
          id: record.id || Date.now().toString(),
          date: record.date,
          weight: record.weight,
          weightUnit: "kg", // Default unit
          notes: record.note,
          source: "pregnancy"
        }));
        allWeightRecords = [...allWeightRecords, ...convertedRecords];
      } catch (error) {
        console.error("Error parsing original weight records:", error);
      }
    }
    
    // Sort all weight records by date
    setWeightRecords(allWeightRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const handleDeleteRecord = (index: number) => {
    const updatedHistory = [...periodHistory];
    updatedHistory.splice(index, 1);
    setPeriodHistory(updatedHistory);
    
    // Update localStorage
    localStorage.setItem("periodHistory", JSON.stringify(updatedHistory));
    toast.success("Record deleted successfully");
  };
  
  const handleDeleteFlowRecord = (id: string) => {
    const updatedRecords = flowRecords.filter(record => record.id !== id);
    setFlowRecords(updatedRecords);
    
    // Update localStorage
    localStorage.setItem("periodFlowTracking", JSON.stringify(updatedRecords));
    toast.success("Flow record deleted successfully");
  };

  const handleDeleteMoodRecord = (id: string) => {
    const updatedRecords = moodRecords.filter(record => record.id !== id);
    setMoodRecords(updatedRecords);
    
    // Update localStorage
    localStorage.setItem("moodTrackingComprehensive", JSON.stringify(updatedRecords));
    toast.success("Mood record deleted successfully");
  };

  const handleDeleteWeightRecord = (id: string) => {
    const recordToDelete = weightRecords.find(record => record.id === id);
    const updatedRecords = weightRecords.filter(record => record.id !== id);
    setWeightRecords(updatedRecords);
    
    // Update localStorage based on the source of the record
    if (recordToDelete?.source === 'pregnancy') {
      // Update pregnancy weight records
      const pregnancyRecords = weightRecords.filter(r => r.source === 'pregnancy' && r.id !== id);
      localStorage.setItem("pregnancyWeightTracking", JSON.stringify(pregnancyRecords));
    } else {
      // Update period weight records
      const periodRecords = weightRecords.filter(r => r.source !== 'pregnancy' && r.id !== id);
      localStorage.setItem("periodWeightRecords", JSON.stringify(periodRecords));
    }
    
    toast.success("Weight record deleted successfully");
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Health History', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Add current date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Current period details
      if (currentPeriod.startDate) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Current Period Details', margin, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Start Date: ${format(new Date(currentPeriod.startDate), 'yyyy-MM-dd')}`, margin, yPos);
        yPos += 7;

        if (currentPeriod.endDate) {
          doc.text(`End Date: ${format(new Date(currentPeriod.endDate), 'yyyy-MM-dd')}`, margin, yPos);
        } else {
          doc.text('End Date: Not ended yet', margin, yPos);
        }
        yPos += 7;

        doc.text(`Cycle Length: ${currentPeriod.cycleLength} days`, margin, yPos);
        yPos += 7;

        doc.text(`Period Length: ${currentPeriod.length} days`, margin, yPos);
        yPos += 7;

        if (currentPeriod.notes) {
          doc.text('Notes:', margin, yPos);
          yPos += 5;
          
          const noteLines = doc.splitTextToSize(currentPeriod.notes, pageWidth - (margin * 2));
          for (let i = 0; i < noteLines.length; i++) {
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(noteLines[i], margin, yPos);
            yPos += 5;
          }
          yPos += 2;
        }
        
        yPos += 10;
      }

      // Historical period data
      if (periodHistory.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Period History', margin, yPos);
        yPos += 10;

        periodHistory.forEach((record, index) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`Period #${periodHistory.length - index}`, margin, yPos);
          yPos += 7;

          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          doc.text(`Start Date: ${format(new Date(record.startDate), 'yyyy-MM-dd')}`, margin, yPos);
          yPos += 7;

          if (record.endDate) {
            doc.text(`End Date: ${format(new Date(record.endDate), 'yyyy-MM-dd')}`, margin, yPos);
          } else {
            doc.text('End Date: Not ended yet', margin, yPos);
          }
          yPos += 7;

          doc.text(`Cycle Length: ${record.cycleLength} days`, margin, yPos);
          yPos += 7;

          doc.text(`Period Length: ${record.length} days`, margin, yPos);
          yPos += 7;

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
      } else {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'italic');
        doc.text('No period history records available.', margin, yPos);
        yPos += 10;
      }

      // Add Flow Records
      if (flowRecords.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        // Add a separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Flow Records', margin, yPos);
        yPos += 10;

        flowRecords.forEach((record) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Date: ${format(new Date(record.date), 'yyyy-MM-dd')}`, margin, yPos);
          yPos += 7;

          doc.setFont('helvetica', 'normal');
          doc.text(`Flow: ${record.flow}`, margin, yPos);
          yPos += 7;

          doc.text(`Color: ${record.color}`, margin, yPos);
          yPos += 7;
          
          doc.text(`Period Day: ${record.periodDay || "Not specified"}`, margin, yPos);
          yPos += 7;

          doc.text(`Pain Level: ${record.painLevel}/10`, margin, yPos);
          yPos += 7;

          doc.text(`Pads/Tampons Changed: ${record.padsChanged}`, margin, yPos);
          yPos += 7;

          // Add body temperature if it exists
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
      }

      // Add Mood Records
      if (moodRecords.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        // Add a separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Mood Records', margin, yPos);
        yPos += 10;

        moodRecords.forEach((record) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Date: ${format(new Date(record.date), 'yyyy-MM-dd')}`, margin, yPos);
          yPos += 7;

          doc.setFont('helvetica', 'normal');
          if (record.other_mood_description) {
            doc.text(`Overall Mood: ${record.other_mood_description} (${record.other_mood_intensity}/100)`, margin, yPos);
            yPos += 7;
          }

          // Add all mood parameters with intensity values
          doc.setFont('helvetica', 'bold');
          doc.text('Mood Parameters:', margin, yPos);
          yPos += 7;
          
          doc.setFont('helvetica', 'normal');
          
          // Process each mood parameter
          moodParameters.forEach(param => {
            // Convert parameter name to the key used in the record
            const key = param.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const intensity = record[key] || 0;
            
            // Only include parameters with non-zero intensity
            if (intensity > 0) {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              
              doc.text(`${param}: ${intensity}/100`, margin, yPos);
              yPos += 5;
            }
          });
          
          yPos += 5;

          // Add notes if present
          if (record.notes) {
            if (yPos > 260) {
              doc.addPage();
              yPos = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.text('Notes:', margin, yPos);
            yPos += 5;
            
            doc.setFont('helvetica', 'normal');
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
      }

      // Add Weight Records
      if (weightRecords.length > 0) {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        // Add a separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Weight Records', margin, yPos);
        yPos += 10;

        weightRecords.forEach((record) => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Date: ${format(new Date(record.date), 'yyyy-MM-dd')}`, margin, yPos);
          yPos += 7;

          doc.setFont('helvetica', 'normal');
          doc.text(`Weight: ${record.weight} ${record.weightUnit || 'kg'}`, margin, yPos);
          yPos += 7;

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
      }

      // Save the PDF
      const fileName = `your-record-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      toast.success("PDF Downloaded", {
        description: `Your health history has been saved as ${fileName}`
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  // Sort weight records based on sort direction
  const sortedWeightRecords = [...weightRecords].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  // Calculate weight changes
  const weightRecordsWithChanges = sortedWeightRecords.map((record, index, array) => {
    if (index === array.length - 1) {
      return { ...record, change: 0 };
    }
    
    const currentWeight = record.weight;
    const previousWeight = array[index + 1].weight;
    const change = currentWeight - previousWeight;
    
    return { ...record, change };
  });

  const fetchPeriodHistoryFromFirestore = async (uid: string) => {
    try {
      console.log("Fetching period history from Firestore for user:", uid);
      let historyUpdated = false;
      
      // Get period history
      const periodHistoryRef = collection(db, "users", uid, "periodHistory");
      const historyQuery = query(periodHistoryRef, orderBy("recordedAt", "desc"), limit(50));
      const historySnapshot = await getDocs(historyQuery);
      
      if (!historySnapshot.empty) {
        const historyData = historySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            startDate: data.startDate,
            endDate: data.endDate || null,
            length: data.periodLength,
            cycleLength: data.cycleLength,
            notes: data.notes || ""
          };
        });
        
        console.log("Found period history in Firestore:", historyData.length, "records");
        setPeriodHistory(historyData);
        localStorage.setItem("periodHistoryRecords", JSON.stringify(historyData));
        historyUpdated = true;
      }
      
      // Get flow records
      const flowRecordsRef = collection(db, "users", uid, "flowRecords");
      const flowQuery = query(flowRecordsRef, orderBy("date", "desc"), limit(50));
      const flowSnapshot = await getDocs(flowQuery);
      
      if (!flowSnapshot.empty) {
        const flowData = flowSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            periodWeek: data.periodWeek || "",
            padsChanged: data.padsChanged || 0,
            flow: data.flow || "",
            color: data.color || "",
            painLevel: data.painLevel || 0,
            notes: data.notes || "",
            periodDay: data.periodDay || "",
            bodyTemperature: data.bodyTemperature || "",
            temperatureUnit: data.temperatureUnit || ""
          };
        });
        
        console.log("Found flow records in Firestore:", flowData.length, "records");
        setFlowRecords(flowData);
        localStorage.setItem("periodFlowRecords", JSON.stringify(flowData));
      }
      
      // Get mood records
      const moodRecordsRef = collection(db, "users", uid, "moods");
      const moodQuery = query(moodRecordsRef, orderBy("createdAt", "desc"), limit(50));
      const moodSnapshot = await getDocs(moodQuery);
      
      if (!moodSnapshot.empty) {
        const moodData = moodSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            notes: data.notes || "",
            other_mood_description: data.other_mood_description || "",
            other_mood_intensity: data.other_mood_intensity || 0,
            ...Object.keys(data)
              .filter(key => key.includes('_') && !['other_mood_description', 'other_mood_intensity'].includes(key))
              .reduce((obj, key) => ({ ...obj, [key]: data[key] }), {})
          };
        });
        
        console.log("Found mood records in Firestore:", moodData.length, "records");
        setMoodRecords(moodData);
        localStorage.setItem("periodMoodRecords", JSON.stringify(moodData));
      }
      
      // Get weight records
      const weightRecordsRef = collection(db, "users", uid, "periodWeight");
      const weightQuery = query(weightRecordsRef, orderBy("createdAt", "desc"), limit(50));
      const weightSnapshot = await getDocs(weightQuery);
      
      if (!weightSnapshot.empty) {
        const weightData = weightSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            weight: data.weight || 0,
            weightUnit: data.weightUnit || "kg",
            notes: data.note || "",
            source: data.source || "manual"
          };
        });
        
        console.log("Found weight records in Firestore:", weightData.length, "records");
        setWeightRecords(weightData);
        localStorage.setItem("periodWeightRecords", JSON.stringify(weightData));
      }
      
      setDataFetched(true);
      
      // If we updated any data, refresh the charts
      if (historyUpdated) {
        setTimeout(() => {
          calculateAverages();
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching period history from Firestore:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-heading font-bold">Your Health History</h1>
          <p className="text-muted-foreground">
            View and track your historical health data in one place.
          </p>
        </div>
        
        <div>
          <Button 
            onClick={handleDownloadPDF}
            variant="default" 
            className="gap-2"
            disabled={periodHistory.length === 0 && !currentPeriod.startDate && flowRecords.length === 0 && moodRecords.length === 0 && weightRecords.length === 0}
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="w-full">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="period">
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-2" />
                <span>Period Details</span>
              </div>
            </SelectItem>
            <SelectItem value="mood">
              <div className="flex items-center">
                <Smile className="h-4 w-4 mr-2" />
                <span>Mood Records</span>
              </div>
            </SelectItem>
            <SelectItem value="flow">
              <div className="flex items-center">
                <Droplet className="h-4 w-4 mr-2" />
                <span>Flow Records</span>
              </div>
            </SelectItem>
            <SelectItem value="weight">
              <div className="flex items-center">
                <Scale className="h-4 w-4 mr-2" />
                <span>Weight Records</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      
        <ScrollArea className="h-[500px] mt-6">
          {activeTab === "period" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Period Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentPeriod.startDate ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Last Period Started:</span>
                        <span className="font-medium">
                          {format(new Date(currentPeriod.startDate), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Period Ending:</span>
                        <span className="font-medium">
                          {format(new Date(currentPeriod.endDate!), "MMMM d, yyyy")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm">Period Length:</span>
                        <span className="font-medium">{currentPeriod.length} days</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm">Cycle Length:</span>
                        <span className="font-medium">{currentPeriod.cycleLength} days</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-softpink/20 text-softpink border-softpink/30">
                          Period: {currentPeriod.length} days
                        </Badge>
                        <Badge variant="outline" className="bg-lavender/20 text-lavender border-lavender/30">
                          Cycle: {currentPeriod.cycleLength} days
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No current period data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Period History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Your historical period data, showing past cycles and patterns.
                  </p>
                  
                  {periodHistory.length > 0 ? (
                    <div className="space-y-4">
                      {periodHistory.map((period, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-softpink" />
                              <h3 className="font-semibold">Period #{periodHistory.length - index}</h3>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this period record from your history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteRecord(index)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Start Date:</p>
                              <p className="font-medium">{format(new Date(period.startDate), "MMMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">End Date:</p>
                              <p className="font-medium">{format(new Date(period.endDate), "MMMM d, yyyy")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration:</p>
                              <p className="font-medium">{period.length} days</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Cycle Length:</p>
                              <p className="font-medium">{period.cycleLength} days</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No period history data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "mood" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mood Tracking History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    View your mood patterns and emotional health over time.
                  </p>
                  {moodRecords.length > 0 ? (
                    <div className="space-y-6">
                      {moodRecords.map((record) => (
                        <Card key={record.id} className="overflow-hidden">
                          <CardHeader className="py-3 bg-muted/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Smile className="h-4 w-4 text-lavender" />
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
                                      onClick={() => handleDeleteMoodRecord(record.id)}
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
                            <ScrollArea className="h-[250px] pr-4">
                              <div className="space-y-3">
                                {moodParameters.map((mood, index) => {
                                  const key = mood.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                  const intensity = record[key] || 0;
                                  
                                  return (
                                    <div key={key} className="grid grid-cols-[1fr,120px] gap-2">
                                      <div className="text-sm font-medium">
                                        {index + 1}. {mood}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="h-2 bg-lavender/30 rounded-full flex-1" 
                                          style={{ width: `${intensity}%` }}
                                        >
                                          <div 
                                            className="h-full bg-lavender rounded-full" 
                                            style={{ width: `${intensity}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-semibold w-8 text-right">{intensity}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {record.other_mood_description && (
                                  <div className="grid grid-cols-[1fr,120px] gap-2">
                                    <div className="text-sm font-medium">
                                      16. Other: {record.other_mood_description}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="h-2 bg-lavender/30 rounded-full flex-1"
                                      >
                                        <div 
                                          className="h-full bg-lavender rounded-full" 
                                          style={{ width: `${record.other_mood_intensity}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-semibold w-8 text-right">{record.other_mood_intensity}</span>
                                    </div>
                                  </div>
                                )}
                                
                                {record.notes && (
                                  <div className="mt-4 pt-4 border-t">
                                    <h4 className="text-sm font-semibold mb-2">Notes:</h4>
                                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{record.notes}</p>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No mood records available. Add mood records in the Period Insights page.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "flow" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flow Records History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Your complete history of period flow tracking data.
                  </p>
                  
                  {flowRecords.length > 0 ? (
                    <div className="space-y-4">
                      {flowRecords.map((record) => (
                        <div key={record.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Droplet className="h-4 w-4 text-softpink" />
                              <h3 className="font-medium">{format(new Date(record.date), "MMMM d, yyyy")}</h3>
                              <Badge variant="outline" className="ml-1 bg-lavender/10 text-lavender">
                                {record.periodDay}
                              </Badge>
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this flow record from your history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteFlowRecord(record.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                            <div>
                              <p className="text-muted-foreground">Flow:</p>
                              <p className="font-medium">{record.flow}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Color:</p>
                              <p className="font-medium">{record.color}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pain Level:</p>
                              <p className="font-medium">{record.painLevel}/10</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Pads/Tampons:</p>
                              <p className="font-medium">{record.padsChanged}</p>
                            </div>
                          </div>
                          
                          {record.notes && (
                            <div className="mt-2 text-sm">
                              <p className="text-muted-foreground">Notes:</p>
                              <p className="p-2 bg-muted rounded-md">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No flow records available. Add flow records in the Period Insights page.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "weight" && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Weight History</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={toggleSortDirection}
                    className="gap-1"
                  >
                    {sortDirection === 'desc' ? (
                      <>Newest First <ArrowDown className="h-3 w-3" /></>
                    ) : (
                      <>Oldest First <ArrowUp className="h-3 w-3" /></>
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">
                    Your weight tracking history with changes over time.
                  </p>
                  
                  {weightRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>Change</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-[80px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weightRecordsWithChanges.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              {record.weight} {record.weightUnit || "kg"}
                            </TableCell>
                            <TableCell>
                              {record.change !== 0 ? (
                                <div className="flex items-center gap-1">
                                  {record.change > 0 ? (
                                    <>
                                      <ArrowUp className="h-3 w-3 text-red-500" />
                                      <span className="text-red-500">+{record.change.toFixed(1)}</span>
                                    </>
                                  ) : record.change < 0 ? (
                                    <>
                                      <ArrowDown className="h-3 w-3 text-green-500" />
                                      <span className="text-green-500">{record.change.toFixed(1)}</span>
                                    </>
                                  ) : (
                                    <Minus className="h-3 w-3" />
                                  )}
                                </div>
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </TableCell>
                            <TableCell>
                              {record.notes || "-"}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete weight record?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete this weight record from your history.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteWeightRecord(record.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No weight records available. Add weight records in the Period Insights page.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}