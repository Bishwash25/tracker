import React, { useState, useEffect } from "react";
import { format, differenceInDays, addDays } from "date-fns";
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

export default function PeriodTracking() {
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null);
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null);
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [isEditing, setIsEditing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownType, setCountdownType] = useState("");
  const [periodData, setPeriodData] = useState([]);
  const [userName, setUserName] = useState("");
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);

  // Load user data from localStorage
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const { name } = JSON.parse(userData);
        setUserName(name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

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
  }, []);

  // Calculate countdown and generate chart data
  useEffect(() => {
    if (!periodStartDate) return;

    const today = new Date();
    const periodEnd = periodEndDate || addDays(periodStartDate, periodLength - 1);
    const nextPeriodStart = addDays(periodStartDate, cycleLength);
    setNextPeriodDate(nextPeriodStart);
    
    // Check if currently on period
    if (today >= periodStartDate && today <= periodEnd) {
      const daysLeft = differenceInDays(periodEnd, today) + 1;
      setCountdown(daysLeft);
      setCountdownType("period");
    } else {
      // Calculate days until next period
      const daysToNextPeriod = differenceInDays(nextPeriodStart, today);
      setCountdown(daysToNextPeriod);
      setCountdownType("nextPeriod");
    }

    // Generate sample data for period flow chart if we're in a period
    if (today >= periodStartDate && today <= periodEnd) {
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
        const isToday = differenceInDays(day, today) === 0;
        
        flowData.push({
          day: format(day, "MMM d"),
          flow: flowIntensity,
          isToday
        });
      }
      
      setPeriodData(flowData);
    }
  }, [periodStartDate, periodEndDate, periodLength, cycleLength]);

  const handleSave = () => {
    if (!periodStartDate || !periodEndDate) {
      toast.error("Please set both start and end dates");
      return;
    }

    // Calculate actual period length based on dates
    const actualPeriodLength = differenceInDays(periodEndDate, periodStartDate) + 1;
    setPeriodLength(actualPeriodLength);

    // Save to localStorage
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

    setIsEditing(false);
    toast.success("Period information saved successfully");
  };

  // Get current cycle phase
  const getCurrentPhase = () => {
    if (!periodStartDate) return "Not Set";
    
    const today = new Date();
    const periodEnd = periodEndDate || addDays(periodStartDate, periodLength - 1);
    const nextPeriod = addDays(periodStartDate, cycleLength);
    
    // If on period
    if (today >= periodStartDate && today <= periodEnd) {
      return "Menstrual Phase";
    }
    
    // Calculate fertility window (5 days before ovulation + ovulation day)
    const ovulationDay = addDays(nextPeriod, -14);
    const fertilityStart = addDays(ovulationDay, -5);
    const fertilityEnd = ovulationDay;
    
    if (today >= fertilityStart && today <= fertilityEnd) {
      // Check if on ovulation day specifically
      if (differenceInDays(today, ovulationDay) === 0) {
        return "Ovulation Day";
      }
      return "Fertility Window";
    }
    
    // If after period but before fertility window
    if (today > periodEnd && today < fertilityStart) {
      return "Follicular Phase";
    }
    
    // If after ovulation but before next period
    if (today > ovulationDay && today < nextPeriod) {
      return "Luteal Phase";
    }
    
    return "Calculating...";
  };

  // Function to get color based on phase
  const getPhaseColor = (phase) => {
    switch (phase) {
      case "Menstrual Phase":
        return "bg-softpink/20 text-softpink";
      case "Follicular Phase":
        return "bg-yellow-200 text-yellow-800";
      case "Fertility Window":
        return "bg-calmteal/20 text-calmteal";
      case "Ovulation Day":
        return "bg-calmteal/30 text-calmteal";
      case "Luteal Phase":
        return "bg-lavender/20 text-lavender";
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

  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-8">
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
                <div className="mt-4 flex justify-center gap-2">
                  <Badge variant="outline" className="bg-softpink/20 text-softpink border-softpink/30 text-sm font-medium py-1">
                    Next period: {format(nextPeriodDate, "MMM d, yyyy")}
                  </Badge>
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
                      <label className="text-sm text-muted-foreground">Cycle Length (days)</label>
                      <Input
                        type="number"
                        min="21"
                        max="35"
                        value={cycleLength}
                        onChange={(e) => setCycleLength(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">Last Period Started:</span>
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
                      <span className="font-medium">{cycleLength} days</span>
                    </div>
                    
                    {periodStartDate && (
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
                  {currentPhase === "Menstrual Phase" && 
                    "Your body is shedding the uterine lining. Focus on self-care, rest, and gentle movement."}
                  {currentPhase === "Follicular Phase" && 
                    "Estrogen levels are rising as follicles mature. Your energy is increasing - great time for new projects!"}
                  {currentPhase === "Fertility Window" && 
                    "This is when pregnancy is most likely to occur. You may notice increased energy and libido."}
                  {currentPhase === "Ovulation Day" && 
                    "An egg is released and can be fertilized for about 24 hours. You may feel most energetic today."}
                  {currentPhase === "Luteal Phase" && 
                    "Progesterone rises to prepare for pregnancy. You might experience PMS symptoms as this phase progresses."}
                </p>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Cycle At A Glance</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-softpink/20 text-softpink border-softpink/30">
                    Period: {periodLength} days
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
                    Follicular: ~7 days
                  </Badge>
                  <Badge variant="outline" className="bg-calmteal/20 text-calmteal border-calmteal/30">
                    Fertility: ~6 days
                  </Badge>
                  <Badge variant="outline" className="bg-lavender/20 text-lavender border-lavender/30">
                    Luteal: ~14 days
                  </Badge>
                </div>
                
                {periodStartDate && (
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
