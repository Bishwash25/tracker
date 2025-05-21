import React, { useState, useEffect } from "react";
import { format, differenceInDays, addDays, isWithinInterval, isSameDay, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Droplets, Clock, Save, Edit, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { USER_AUTHENTICATED_EVENT } from "@/hooks/use-auth";

// Helper to get ovulation window (3 days, ending 14 days before next period)
const getOvulationWindow = (periodStart: Date, cycleLength: number) => {
  const nextPeriod = addDays(periodStart, cycleLength);
  const ovulationEnd = subDays(nextPeriod, 14);
  const ovulationStart = subDays(ovulationEnd, 2); // 3 days: ovulationStart, ovulationEnd-1, ovulationEnd
  return { start: ovulationStart, end: ovulationEnd };
};

// Robust phase calculation for all users
const getCyclePhase = (date: Date, periodStart: Date, periodEnd: Date, cycleLength: number, periodLength: number) => {
  // Menstruation: periodStart to periodEnd (inclusive)
  if (isWithinInterval(date, { start: periodStart, end: periodEnd })) {
    return "menstruation";
  }
  // Follicular: day after periodEnd to day before ovulation
  const follicularStart = addDays(periodEnd, 1);
  const { start: ovulationStart, end: ovulationEnd } = getOvulationWindow(periodStart, cycleLength);
  if (date >= follicularStart && date < ovulationStart) {
    return "follicular";
  }
  // Ovulation: ovulationStart to ovulationEnd (inclusive)
  if (date >= ovulationStart && date <= ovulationEnd) {
    return "ovulation";
  }
  // Luteal: day after ovulationEnd to day before next period
  const lutealStart = addDays(ovulationEnd, 1);
  const cycleEnd = addDays(periodStart, cycleLength - 1);
  if (date >= lutealStart && date <= cycleEnd) {
    return "luteal";
  }
  // Default fallback
  return "follicular";
};

export default function PeriodTracking() {
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null);
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null);
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState<number | "">(28);
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownType, setCountdownType] = useState("");
  const [periodData, setPeriodData] = useState([]);
  const [userName, setUserName] = useState("");
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userId, setUserId] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Track if user has saved for the current period start date
  const [showSaveReminder, setShowSaveReminder] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserName(parsedData.name || "");
        
        // Try to get user ID from different potential sources
        if (parsedData.uid) {
          setUserId(parsedData.uid);
          console.log("Found user ID from localStorage:", parsedData.uid);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Also check Firebase Auth for current user
    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      setUserId(currentUser.uid);
      console.log("Found user ID from Firebase Auth:", currentUser.uid);
    } else {
      console.log("No current Firebase user found");
    }

    // Log if we have a user ID set
    console.log("User ID set:", userId);

    const storedPeriodStartDate = localStorage.getItem("periodStartDate");
    const storedPeriodEndDate = localStorage.getItem("periodEndDate");
    const storedCycleLength = localStorage.getItem("cycleLength");
    const storedPeriodLength = localStorage.getItem("periodLength");
    
    if (storedPeriodStartDate) {
      const startDate = new Date(storedPeriodStartDate);
      setPeriodStartDate(startDate);
      
      if (storedPeriodEndDate) {
        setPeriodEndDate(new Date(storedPeriodEndDate));
      } else if (storedPeriodLength) {
        const endDate = addDays(startDate, parseInt(storedPeriodLength) - 1);
        setPeriodEndDate(endDate);
      }
      
      // Calculate next period date
      if (storedCycleLength) {
        const nextPeriod = addDays(startDate, parseInt(storedCycleLength));
        setNextPeriodDate(nextPeriod);
      }
    }
    
    if (storedCycleLength) {
      setCycleLength(parseInt(storedCycleLength));
    }
    
    if (storedPeriodLength) {
      setPeriodLength(parseInt(storedPeriodLength));
    }

    // Load historic period data
    const storedPeriodData = localStorage.getItem("periodHistory");
    if (storedPeriodData) {
      try {
        setPeriodData(JSON.parse(storedPeriodData));
      } catch (error) {
        console.error("Error parsing period history data:", error);
      }
    }
  }, [userId]);

  // Fetch user period data from Firestore when userId changes or when auth event fires
  useEffect(() => {
    if (userId && !dataFetched) {
      fetchPeriodDataFromFirestore(userId);
    }
  }, [userId, dataFetched]);

  // Listen for authentication event
  useEffect(() => {
    const handleUserAuthenticated = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log("PeriodTracking: User authenticated event received:", userId);
      if (userId) {
        fetchPeriodDataFromFirestore(userId);
      }
    };

    window.addEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);
    return () => {
      window.removeEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);
    };
  }, []); // No dependencies needed

  // Function to fetch period data from Firestore
  const fetchPeriodDataFromFirestore = async (uid: string) => {
    try {
      console.log("Fetching period data from Firestore for user:", uid);
      
      // First try to get current period data
      const periodDataRef = doc(db, "users", uid, "periodData", "current");
      const periodDoc = await getDoc(periodDataRef);
      
      if (periodDoc.exists()) {
        const data = periodDoc.data();
        console.log("Found period data in Firestore:", data);
        
        if (data.periodStartDate) {
          const startDate = new Date(data.periodStartDate);
          setPeriodStartDate(startDate);
          localStorage.setItem("periodStartDate", data.periodStartDate);
          
          if (data.periodEndDate) {
            setPeriodEndDate(new Date(data.periodEndDate));
            localStorage.setItem("periodEndDate", data.periodEndDate);
          }
          
          if (data.cycleLength) {
            setCycleLength(data.cycleLength);
            localStorage.setItem("cycleLength", data.cycleLength.toString());
            
            // Calculate next period date
            const nextPeriod = addDays(startDate, data.cycleLength);
            setNextPeriodDate(nextPeriod);
          }
          
          if (data.periodLength) {
            setPeriodLength(data.periodLength);
            localStorage.setItem("periodLength", data.periodLength.toString());
          }
        }
      } else {
        console.log("No current period data found in Firestore");
      }
      
      // Then try to get period history data
      // const periodHistoryRef = collection(db, "users", uid, "periodHistory");
      // const historyQuery = query(periodHistoryRef, orderBy("recordedAt", "desc"), limit(50));
      // const historySnapshot = await getDocs(historyQuery);
      
      // if (!historySnapshot.empty) {
      //   const historyData = historySnapshot.docs.map(doc => {
      //     const data = doc.data();
      //     return {
      //       startDate: data.startDate,
      //       endDate: data.endDate || null,
      //       length: data.periodLength,
      //       cycleLength: data.cycleLength
      //     };
      //   });
        
      //   console.log("Found period history in Firestore:", historyData.length, "records");
      //   setPeriodData(historyData);
      //   localStorage.setItem("periodHistory", JSON.stringify(historyData));
      // } else {
      //   console.log("No period history found in Firestore");
      // }
      
      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching period data from Firestore:", error);
    }
  };

  // Set up a timer to update the current time every minute
  useEffect(() => {
    // Update immediately
    setCurrentTime(new Date());
    
    // Then update every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60000 ms = 1 minute
    
    // Clean up the interval when component unmounts
    return () => clearInterval(timer);
  }, []); // No dependencies needed

  // Log whenever userId changes
  useEffect(() => {
    console.log("User ID changed to:", userId);
  }, [userId]);

  // Calculate countdown and generate chart data
  useEffect(() => {
    if (!periodStartDate || !cycleLength || typeof cycleLength !== 'number') return;

    const periodEnd = periodEndDate || addDays(periodStartDate, periodLength - 1);
    const nextPeriodStart = addDays(periodStartDate, cycleLength);
    setNextPeriodDate(nextPeriodStart);
    
    // Check if currently on period
    if (currentTime >= periodStartDate && currentTime <= periodEnd) {
      const daysLeft = differenceInDays(periodEnd, currentTime) + 1;
      setCountdown(daysLeft);
      setCountdownType("period");
    } else {
      // Calculate days until next period
      const daysToNextPeriod = differenceInDays(nextPeriodStart, currentTime);
      setCountdown(daysToNextPeriod);
      setCountdownType("nextPeriod");
    }

    // Generate sample data for period flow chart if we're in a period
    if (currentTime >= periodStartDate && currentTime <= periodEnd) {
      const flowData = [];
      const totalDays = differenceInDays(periodEnd, periodStartDate) + 1;
      
      // Create a bell curve-like pattern for period flow
      for (let i = 0; i < totalDays; i++) {
        const day = addDays(periodStartDate, i);
        const dayNumber = i + 1;
        
        // Create a bell curve with highest flow in the middle days
        let flowIntensity = 10;
        if (dayNumber <= totalDays / 2) {
          flowIntensity = 5 + (dayNumber * 2);
        } else {
          flowIntensity = 5 + ((totalDays - dayNumber + 1) * 2);
        }
        
        // Highlight today's bar
        const isToday = differenceInDays(day, currentTime) === 0;
        
        flowData.push({
          day: format(day, "MMM d"),
          flow: flowIntensity,
          isToday
        });
      }
      
      setPeriodData(flowData);
    }

    // Auto-predict new period if today is the expected next period
    if (
      periodStartDate &&
      cycleLength &&
      periodLength &&
      nextPeriodDate &&
      format(new Date(), "yyyy-MM-dd") === format(nextPeriodDate, "yyyy-MM-dd")
    ) {
      // Only auto-set if not already set for today
      if (format(periodStartDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")) {
        const newStart = new Date();
        const newEnd = addDays(newStart, periodLength - 1);
        setPeriodStartDate(newStart);
        setPeriodEndDate(newEnd);
        setIsEditing(true); // Prompt user to save new period
        toast.info("It's time to start a new period! Please review and save your new period details.");
      }
    }
  }, [nextPeriodDate, periodStartDate, cycleLength, periodLength, currentTime, periodEndDate]); // Added periodEndDate

  const savePeriodDataToFirestore = async () => {
    // If userId not set, try to get it directly from auth
    let currentUserId = userId;
    if (!currentUserId) {
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        currentUserId = currentUser.uid;
        setUserId(currentUserId);
        console.log("Retrieved user ID directly in save function:", currentUserId);
      } else {
        console.error("Cannot save ");
        return false;
      }
    }

    try {
      // First, save directly in the user document for easy access
      const userRef = doc(db, "users", currentUserId);
      console.log("Saving to user document:", currentUserId);
      await setDoc(userRef, {
        periodDetails: {
          periodStartDate: periodStartDate ? periodStartDate.toISOString() : null,
          periodEndDate: periodEndDate ? periodEndDate.toISOString() : null,
          periodLength: periodLength,
          cycleLength: cycleLength,
          lastUpdated: new Date().toISOString()
        }
      }, { merge: true });
      
      // Continue with existing subcollection approach
      const periodDataRef = doc(db, "users", currentUserId, "periodData", "current");
      
      await setDoc(periodDataRef, {
        periodStartDate: periodStartDate ? periodStartDate.toISOString() : null,
        periodEndDate: periodEndDate ? periodEndDate.toISOString() : null,
        periodLength: periodLength,
        cycleLength: cycleLength,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Also save to period history subcollection
      if (periodStartDate) {
        const historyId = format(periodStartDate, "yyyy-MM-dd");
        const historyRef = doc(db, "users", currentUserId, "periodHistory", historyId);
        
        await setDoc(historyRef, {
          startDate: periodStartDate.toISOString(),
          endDate: periodEndDate ? periodEndDate.toISOString() : null,
          periodLength: periodLength,
          cycleLength: cycleLength,
          recordedAt: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error saving period data ", error);
      return false;
    }
  };

  const handleSave = async () => {
    if (!periodStartDate || !periodEndDate) {
      toast.error("Please set both start and end dates");
      return;
    }

    // Validation: gap between start and end date <= 8 days
    const daysGap = differenceInDays(periodEndDate, periodStartDate);
    if (daysGap > 8 || typeof cycleLength !== 'number' || cycleLength < 20 || cycleLength > 36) {
      toast.error("Please enter valid details");
      return;
    }

    // Calculate actual period length based on dates
    const actualPeriodLength = daysGap + 1;
    setPeriodLength(actualPeriodLength);

    // Save to localStorage (keep original functionality)
    localStorage.setItem("periodStartDate", periodStartDate.toISOString());
    localStorage.setItem("periodEndDate", periodEndDate.toISOString());
    localStorage.setItem("periodLength", actualPeriodLength.toString());
    localStorage.setItem("cycleLength", cycleLength.toString());

    // Save to period history
    const existingHistory = localStorage.getItem("periodHistory");
    let periodHistory = [];
    
    if (existingHistory) {
      try {
        periodHistory = JSON.parse(existingHistory);
      } catch (error) {
        console.error("Error parsing period history:", error);
      }
    }
    
    // Add current period to history if it doesn't exist yet
    const periodExists = periodHistory.some(
      period => format(new Date(period.startDate), "yyyy-MM-dd") === format(periodStartDate, "yyyy-MM-dd")
    );
    
    if (!periodExists) {
      periodHistory.push({
        startDate: periodStartDate.toISOString(),
        endDate: periodEndDate.toISOString(),
        length: actualPeriodLength,
        cycleLength: cycleLength
      });
      
      localStorage.setItem("periodHistory", JSON.stringify(periodHistory));
    }

    // Save to Firebase
    const firestoreSaveSuccess = await savePeriodDataToFirestore();

    setIsEditing(false);
    
    if (firestoreSaveSuccess) {
      toast.success("Period information saved successfully ");
    } else {
      toast.success("Period information saved");
    }

    // After successful save:
    const saveKey = `periodSaved_${format(periodStartDate, 'yyyy-MM-dd')}`;
    localStorage.setItem(saveKey, 'true');
    setShowSaveReminder(false);
  };

  // Get current cycle phase - using the same logic as PeriodDashboard for consistency
    // Use the same getFertilityWindow function as in PeriodDashboard
  const getFertilityWindow = (periodStartDate: Date, cycleLength: number) => {
    const nextPeriodDate = addDays(periodStartDate, cycleLength);
    const ovulationDate = subDays(nextPeriodDate, 14);
    
    return {
      start: subDays(ovulationDate, 5),
      end: ovulationDate,
      ovulation: ovulationDate
    };
  };

  // Updated getCyclePhase function to match scenario
  const getCyclePhase = (date: Date, PeriodStart: Date, PeriodEnd: Date, cycleLength: number, periodLength: number) => {
    // Menstruation: periodStart to periodEnd (inclusive)
    if (isWithinInterval(date, { start: PeriodStart, end: PeriodEnd })) {
      return "menstruation";
    }
    // Follicular: day after periodEnd to day before ovulation
    const follicularStart = addDays(PeriodEnd, 1);
    const { start: ovulationStart, end: ovulationEnd } = getOvulationWindow(PeriodStart, cycleLength);
    if (date >= follicularStart && date < ovulationStart) {
      return "follicular";
    }
    // Ovulation: ovulationStart to ovulationEnd (inclusive)
    if (date >= ovulationStart && date <= ovulationEnd) {
      return "ovulation";
    }
    // Luteal: day after ovulationEnd to day before next period
    const lutealStart = addDays(ovulationEnd, 1);
    const cycleEnd = addDays(PeriodStart, cycleLength - 1);
    if (date >= lutealStart && date <= cycleEnd) {
      return "luteal";
    }
    // Default fallback
    return "follicular";
  };

  const getCurrentPhase = () => {
    if (!periodStartDate || !cycleLength || typeof cycleLength !== 'number') return "Not Set";
    const periodEnd = periodEndDate || addDays(periodStartDate, periodLength - 1);
    const phase = getCyclePhase(currentTime, periodStartDate, periodEnd, cycleLength, periodLength);
    // Calculate days to next period
    let daysToNextPeriod = null;
    if (nextPeriodDate) {
      daysToNextPeriod = differenceInDays(nextPeriodDate, currentTime);
    }
    // If today is the last day before next period, force phase to luteal
    if (daysToNextPeriod === 0) {
      return "Luteal Phase";
    }
    switch (phase) {
      case "menstruation":
        return "Menstruation Phase";
      case "follicular":
        return "Follicular Phase";
      case "ovulation":
        return "Ovulation Phase";
      case "luteal":
        return "Luteal Phase";
      default:
        return "Not Set";
    }
  };
  
  // Function to get fertility information based on phase
  const getFertilityInfo = () => {
    if (!periodStartDate || !cycleLength || typeof cycleLength !== 'number') return "";
    
    const periodEnd = periodEndDate || addDays(periodStartDate, periodLength - 1);
    const phase = getCyclePhase(currentTime, periodStartDate, periodEnd, cycleLength, periodLength);
    
    switch (phase) {
      case "menstruation":
        return "0-5% (Very low chance of conception)";
      case "follicular":
        return "5-70% (Gradually increasing)";
      case "ovulation":
        return "80-95% (Your most fertile window)";
      case "luteal":
        return "5% (Very low chance of conception)";
      default:
        return "";
    }
  };

  // Function to get color based on phase - using same colors as FertilityChart
  const getPhaseColor = (phase) => {
    switch (phase) {
      case "Menstruation Phase":
        return "bg-[#ff4d6d]/20 text-[#ff4d6d]";
      case "Follicular Phase":
        return "bg-[#60A5FA]/20 text-[#60A5FA]";
      case "Ovulation Phase":
        return "bg-[#34D399]/20 text-[#34D399]";
      case "Luteal Phase":
        return "bg-[#9b87f5]/20 text-[#9b87f5]";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Function to get color for flow chart bars
  const getFlowColor = (flow, isToday) => {
    if (isToday) return "#9b87f5"; // Highlight today with lavender
    
    if (flow > 12) return "#ff4d6d"; // Heavy flow - brighter red
    if (flow > 8) return "#ff758f"; // Medium flow - brighter lighter red
    if (flow > 4) return "#ffb3c1"; // Light flow - brighter pink
    if (flow > 0) return "#ffccd5"; // Spotting - very light pink
    return "#ffdee2"; 
  };

  // Track if user has saved for the current period start date (NEW USER LOGIC)
  useEffect(() => {
    // Only show for new users (no period history)
    const periodHistoryRaw = localStorage.getItem("periodHistory");
    let isNewUser = true;
    if (periodHistoryRaw) {
      try {
        const periodHistory = JSON.parse(periodHistoryRaw);
        isNewUser = !Array.isArray(periodHistory) || periodHistory.length === 0;
      } catch (e) {
        isNewUser = true;
      }
    }
    if (!isNewUser) {
      setShowSaveReminder(false);
      return;
    }
    if (!periodStartDate || !cycleLength) return;
    const today = new Date();
    const isMenstruation = isWithinInterval(today, { start: periodStartDate, end: addDays(periodStartDate, periodLength - 1) });
    // Use a localStorage key to track if user has saved for this period start
    const saveKey = `periodSaved_${format(periodStartDate, 'yyyy-MM-dd')}`;
    const hasSaved = localStorage.getItem(saveKey) === 'true';
    if (isMenstruation && !hasSaved) {
      setShowSaveReminder(true);
    } else {
      setShowSaveReminder(false);
    }
  }, [periodStartDate, periodLength, cycleLength, currentTime]);

  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-8">
      {/* Save Reminder Alert for new menstruation phase (only for new users) */}
      {showSaveReminder && (
        <Alert variant="default" className="mb-4">
          <AlertTitle>Don't forget to save!</AlertTitle>
          <AlertDescription>
            Please do not forget to hit the <b>Save</b> button after editing your period details for this new menstruation phase.
          </AlertDescription>
        </Alert>
      )}
      
      <div>
        {/* No Period Data Alert */}
        {!periodStartDate && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No period data available</AlertTitle>
            <AlertDescription>
              Please enter your period information below to start tracking.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Period Countdown - INCREASED SIZE */}
        <div className="mt-4 bg-gradient-to-r from-lavender/10 to-softpink/10 rounded-xl shadow-md p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-lavender flex items-center justify-center gap-2">
                <Clock className="h-6 w-6" />
                {countdownType === "period" ? "Period Countdown" : "Days Until Next Period"}
              </h2>
              {/* Increased size of countdown circle */}
              <div className="mt-6 bg-white/90 backdrop-blur-sm rounded-full w-40 h-40 flex items-center justify-center shadow-md border border-lavender/20">
                <div className="text-center">
                  <span className="text-5xl font-bold text-lavender">{countdown}</span>
                  <p className="text-sm font-medium text-muted-foreground mt-1">
                    {countdownType === "period" ? "days left" : "days away"}
                  </p>
                </div>
              </div>
              
              {periodStartDate && nextPeriodDate && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <Badge variant="outline" className="bg-[#ff4d6d]/20 text-[#ff4d6d] border-[#ff4d6d]/30 text-sm font-medium py-1">
                    Next period: {format(nextPeriodDate, "MMM d, yyyy")}
                  </Badge>
                  <Badge variant="outline" className={cn(getPhaseColor(currentPhase), "font-medium py-1")}>
                    {currentPhase}
                  </Badge>
                  <div className="text-xs flex items-center gap-1">
                    <div 
                      className="h-2 w-2 rounded-full" 
                      style={{ 
                        backgroundColor: currentPhase === "Menstruation Phase" ? "#ff4d6d" : 
                          currentPhase === "Follicular Phase" ? "#60A5FA" : 
                          currentPhase === "Ovulation Phase" ? "#34D399" : 
                          "#9b87f5" 
                      }}
                    />
                    <span>Fertility: {getFertilityInfo()}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Period Flow Chart - INCREASED SIZE */}
            {periodData.length > 0 && countdownType === "period" && (
              <div className="w-full mt-6">
                <h3 className="text-xl font-semibold text-lavender mb-3">Period Flow</h3>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                  <ChartContainer className="h-[280px] w-full overflow-hidden" config={{}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={periodData} 
                        margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="day" 
                          fontSize={12}
                          tick={{ fill: '#666' }}
                          tickMargin={8}
                        />
                        <YAxis 
                          label={{ 
                            value: 'Flow', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' },
                            fontSize: 12,
                            dy: 50
                          }} 
                          fontSize={12}
                          tick={{ fill: '#666' }}
                          tickMargin={5}
                        />
                        <Tooltip 
                          formatter={(value) => [`Flow: ${value}`, '']}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Bar 
                          dataKey="flow" 
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        >
                          {periodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getFlowColor(entry.flow, entry.isToday)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                
                {/* Flow chart description */}
                <div className="mt-4 bg-white/80 p-3 rounded-lg border border-lavender/10 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">About your period flow:</p>

                  {/* Current Flow Information - Simplified */}
                  <div className="p-3 rounded-md bg-lavender/10 border border-lavender/20">
                    <h4 className="font-semibold text-foreground mb-2">Flow Intensity By Day</h4>
                    
                    {periodData.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                        {periodData.map((entry, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "p-2 rounded border text-xs",
                              entry.isToday ? "bg-lavender/20 border-lavender" : "bg-white/80 border-lavender/10"
                            )}
                          >
                            <p className="font-medium">{entry.day}:</p>
                            <div className="flex items-center mt-1">
                              <span 
                                className={cn(
                                  "px-1.5 py-0.5 rounded-full", 
                                  entry.flow > 12 ? "bg-[#ff4d6d]/20 text-[#ff4d6d]" : 
                                  entry.flow > 8 ? "bg-[#ff758f]/20 text-[#ff758f]" : 
                                  entry.flow > 4 ? "bg-[#ffb3c1]/20 text-[#ffb3c1]" : 
                                  "bg-[#ffccd5]/20 text-[#ffccd5]"
                                )}
                              >
                                {entry.flow > 12 ? "Heavy" : 
                                 entry.flow > 8 ? "Medium" : 
                                 entry.flow > 4 ? "Light" : "Spotting"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Period Details Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Droplets className="h-4 w-4 text-softpink" />
                <span>Your Period Details</span>
              </CardTitle>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <label className="text-sm text-muted-foreground">Period Start Date</label>
                      <Input
                        type="date"
                        value={periodStartDate ? format(periodStartDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => setPeriodStartDate(new Date(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm text-muted-foreground">Period End Date</label>
                      <Input
                        type="date"
                        value={periodEndDate ? format(periodEndDate, "yyyy-MM-dd") : ""}
                        onChange={(e) => setPeriodEndDate(new Date(e.target.value))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm text-muted-foreground">Period cycle (days)</label>
                      <Input
                        type="number"
                        min="18"
                        max="35"
                        value={cycleLength === "" ? "" : cycleLength}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setCycleLength("");
                          } else {
                            const num = parseInt(val);
                            if (!isNaN(num)) setCycleLength(num);
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm text-muted-foreground">Period Length (days)</label>
                      <Input
                        type="number"
                        min="2"
                        max="10"
                        value={periodLength}
                        onChange={(e) => setPeriodLength(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Period Started:</span>
                      <span className="font-medium">
                        {periodStartDate 
                          ? format(periodStartDate, "MMMM d, yyyy")
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Period Ending:</span>
                      <span className="font-medium">
                        {periodEndDate 
                          ? format(periodEndDate, "MMMM d, yyyy")
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Period Length:</span>
                      <span className="font-medium">{periodLength} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cycle Length:</span>
                      <span className="font-medium">{typeof cycleLength === "number" ? `${cycleLength} days` : "Not set"}</span>
                    </div>
                    
                    {periodStartDate && typeof cycleLength === "number" && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-sm">Next Period Expected:</span>
                        <span className="font-medium text-softpink">
                          {format(addDays(periodStartDate, cycleLength), "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Notice inside Period Details card */}
              <div className="mt-4 pt-3 border-t border-muted">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-lavender" />
                  <span>Please click <strong>Edit</strong> and then <strong>Save</strong> button to save your Period Details into history section for making Your Record more efficient.</span>
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Cycle Phase Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-lavender" />
                <span>Your Cycle Phase</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("p-4 rounded-lg", getPhaseColor(currentPhase))}>
                <h3 className="font-bold text-lg mb-2">{currentPhase}</h3>
                <p className="text-sm">
                  {currentPhase === "Menstruation Phase" && 
                    "Your body is shedding the uterine lining. Focus on self-care, rest, and gentle movement."}
                  {currentPhase === "Follicular Phase" && 
                    "Estrogen levels are rising as follicles mature. Your energy is increasing - great time for new projects!"}
                  {currentPhase === "Ovulation Phase" && 
                    "This is when pregnancy is most likely to occur. You may notice increased energy and libido."}
                  {currentPhase === "Luteal Phase" && 
                    "Progesterone rises to prepare for pregnancy. You might experience PMS symptoms as this phase progresses."}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-medium">Fertility:</span>
                  <Badge variant="outline" className="text-xs">
                    {getFertilityInfo()}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Cycle At A Glance</h3>
                <div className="overflow-x-auto pb-2">
                  <div className="flex whitespace-nowrap gap-2 min-w-max">
                    {/* Calculate phase lengths to match FertilityChart */}
                    {typeof cycleLength === "number" && typeof periodLength === "number" ? (
                      (() => {
                        // Calculate phase boundaries to match FertilityChart
                        const menstruationDays = periodLength;
                        const ovulationStart = Math.floor(cycleLength / 2) - 2;
                        const lutealStart = Math.floor(cycleLength / 2) + 1;
                        const follicularDays = Math.max(0, ovulationStart - periodLength + 1); // inclusive
                        const ovulationDays = Math.max(0, lutealStart - ovulationStart); // typically 5-6 days
                        const lutealDays = Math.max(0, cycleLength - lutealStart - 1); // Subtract 1 to fix total days
                        return (
                          <>
                            <Badge variant="outline" className="bg-[#ff4d6d]/20 text-[#ff4d6d] border-[#ff4d6d]/30">
                              Menstruation: {menstruationDays} days
                            </Badge>
                            <Badge variant="outline" className="bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/30">
                              Follicular: ~{follicularDays} days
                            </Badge>
                            <Badge variant="outline" className="bg-[#34D399]/20 text-[#34D399] border-[#34D399]/30">
                              Ovulation: ~{ovulationDays} days
                            </Badge>
                            <Badge variant="outline" className="bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30">
                              Luteal: ~{lutealDays} days
                            </Badge>
                          </>
                        );
                      })()
                    ) : (
                      <span className="text-muted-foreground">Set cycle length to see phase breakdown</span>
                    )}
                  </div>
                </div>
                {periodStartDate && typeof cycleLength === "number" && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Full cycle: {cycleLength} days
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
