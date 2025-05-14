import React, { useEffect, useState } from "react";
import { format, addDays, differenceInDays, subDays, isWithinInterval, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Droplets, Egg, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const getFertilityWindow = (periodStartDate: Date, cycleLength: number) => {
  const nextPeriodDate = addDays(periodStartDate, cycleLength);
  const ovulationDate = subDays(nextPeriodDate, 14);
  
  return {
    start: subDays(ovulationDate, 5),
    end: ovulationDate,
    ovulation: ovulationDate
  };
};

const getCyclePhase = (date: Date, periodStart: Date, periodEnd: Date, cycleLength: number) => {
  // Check if date is within period (menstruation phase)
  if (isWithinInterval(date, { start: periodStart, end: periodEnd })) {
    return "menstruation";
  }
  
  // Calculate phase boundaries similar to FertilityChart
  const follicularStart = addDays(periodStart, differenceInDays(periodEnd, periodStart) + 1);
  const ovulationStart = addDays(periodStart, Math.floor(cycleLength / 2) - 2);
  // Extend ovulation phase to include day 22 as shown in the fertility chart
  const lutealStart = addDays(periodStart, Math.floor(cycleLength / 2) + 3); // Changed from +1 to +3
  const cycleEnd = addDays(periodStart, cycleLength - 1);
  
  // Check if date is in ovulation phase
  if (date >= ovulationStart && date < lutealStart) {
    return "ovulation";
  }
  
  // Check if date is in luteal phase
  if (date >= lutealStart && date <= cycleEnd) {
    return "luteal";
  }
  
  // Check if date is in follicular phase
  if (date >= follicularStart && date < ovulationStart) {
    return "follicular";
  }
  
  // Default fallback
  return "follicular";
};

export default function PeriodDashboard() {
  const [userName, setUserName] = useState("");
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null);
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [nextPeriodDate, setNextPeriodDate] = useState<Date | null>(null);
  const [cycleDay, setCycleDay] = useState(0);
  const [nextThreeCycles, setNextThreeCycles] = useState<Array<{
    periodStart: Date;
    periodEnd: Date;
    fertility: { start: Date; end: Date };
    ovulation: Date;
  }>>([]);
  const [showNextPeriodAlert, setShowNextPeriodAlert] = useState(false);

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
      
      const today = new Date();
      const daysSinceStart = differenceInDays(today, startDate);
      setCycleDay(daysSinceStart + 1);
      
      if (storedPeriodEndDate) {
        setPeriodEndDate(new Date(storedPeriodEndDate));
      }
      
      if (storedCycleLength) {
        const cycleLen = parseInt(storedCycleLength);
        setCycleLength(cycleLen);
        
        const nextPeriod = addDays(startDate, cycleLen);
        setNextPeriodDate(nextPeriod);

        const cycles = [];
        for (let i = 0; i < 3; i++) {
          const cycleStartDate = addDays(startDate, cycleLen * i);
          const cycleEndDate = addDays(cycleStartDate, parseInt(storedPeriodLength || "5") - 1);
          const fertilityWindow = getFertilityWindow(cycleStartDate, cycleLen);
          
          cycles.push({
            periodStart: cycleStartDate,
            periodEnd: cycleEndDate,
            fertility: {
              start: fertilityWindow.start,
              end: fertilityWindow.end
            },
            ovulation: fertilityWindow.ovulation
          });
        }
        setNextThreeCycles(cycles);
      }
      
      if (storedPeriodLength) {
        setPeriodLength(parseInt(storedPeriodLength));
      }
    }

    if (periodStartDate && nextPeriodDate) {
      const daysToNextPeriod = differenceInDays(nextPeriodDate, new Date());
      setShowNextPeriodAlert(daysToNextPeriod === 1);
    }
  }, [periodStartDate, nextPeriodDate]);

  const getDayClassName = (date: Date) => {
    if (!periodStartDate) return "";
    
    const endDate = periodEndDate || addDays(periodStartDate, periodLength - 1);
    
    const phase = getCyclePhase(
      date,
      periodStartDate,
      endDate,
      cycleLength
    );
    
    switch (phase) {
      case "menstruation":
        return "bg-[#ff4d6d]/30 text-foreground hover:bg-[#ff4d6d]/50 rounded-md";
      case "ovulation":
        return "bg-[#34D399] hover:bg-[#34D399]/80 text-white rounded-md";
      case "follicular":
        return "bg-[#60A5FA]/30 text-foreground hover:bg-[#60A5FA]/50 rounded-md";
      case "luteal":
        return "bg-[#9b87f5]/20 text-foreground hover:bg-[#9b87f5]/40 rounded-md";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8">
      {/* Pop-up alert if next period is tomorrow */}
      {showNextPeriodAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Upcoming Period</AlertTitle>
          <AlertDescription>
            Your next period is expected to start <b>tomorrow</b>. Please prepare and update your period details if needed.
          </AlertDescription>
        </Alert>
      )}
      <div className="text-center md:text-left">
        <h1 className="text-4xl font-heading font-bold mb-1 text-lavender">Hello, {userName}</h1>
      </div>

      <div className="bg-gradient-to-r from-lavender/5 to-softpink/5 rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-heading font-semibold text-xl text-lavender">Your Cycle Calendar</h2>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-white/60">
              <CalendarDays className="h-3 w-3" />
              <span>{cycleLength} day cycle</span>
            </Badge>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          <Calendar
            mode="single"
            selected={new Date()}
            className="rounded-md border-0"
            modifiers={{
              menstruation: nextThreeCycles.map(cycle => ({ from: cycle.periodStart, to: cycle.periodEnd })),
              follicular: nextThreeCycles.map(cycle => {
                const follicularStart = addDays(cycle.periodStart, differenceInDays(cycle.periodEnd, cycle.periodStart) + 1);
                const ovulationStart = addDays(cycle.periodStart, Math.floor(cycleLength / 2) - 2);
                return { from: follicularStart, to: ovulationStart };
              }),
              ovulation: nextThreeCycles.map(cycle => {
                const ovulationStart = addDays(cycle.periodStart, Math.floor(cycleLength / 2) - 2);
                const lutealStart = addDays(cycle.periodStart, Math.floor(cycleLength / 2) + 2);
                return { from: ovulationStart, to: subDays(lutealStart, 1) };
              }),
              luteal: nextThreeCycles.map(cycle => {
                const lutealStart = addDays(cycle.periodStart, Math.floor(cycleLength / 2) + 2);
                const cycleEnd = addDays(cycle.periodStart, cycleLength - 1);
                return { from: lutealStart, to: cycleEnd };
              }),
              today: new Date()
            }}
            modifiersClassNames={{
              menstruation: "bg-[#ff4d6d]/30 text-foreground hover:bg-[#ff4d6d]/50 rounded-md",
              follicular: "bg-[#60A5FA]/30 text-foreground hover:bg-[#60A5FA]/50 rounded-md",
              ovulation: "bg-[#34D399] hover:bg-[#34D399]/80 text-white rounded-md",
              luteal: "bg-[#9b87f5]/20 text-foreground hover:bg-[#9b87f5]/40 rounded-md",
              today: "border border-primary font-bold"
            }}
            styles={{
              day: { margin: '1px' }
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="flex flex-col items-center justify-center bg-[#ff4d6d]/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-[#ff4d6d] mb-1">
              <Droplets className="h-4 w-4" />
              <span className="text-sm font-medium">Menstruation</span>
            </div>
            {nextPeriodDate && (
              <p className="text-xs text-center">
                Next period in {differenceInDays(nextPeriodDate, new Date())} days
                <br />
                <span className="font-semibold">{format(nextPeriodDate, "MMM d")}</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center bg-[#60A5FA]/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-[#60A5FA] mb-1">
              <Egg className="h-4 w-4" />
              <span className="text-sm font-medium">Follicular</span>
            </div>
            {periodStartDate && (
              <p className="text-xs text-center">
                {(() => {
                  const follicularStart = addDays(periodStartDate, periodLength);
                  const ovulationStart = addDays(periodStartDate, Math.floor(cycleLength / 2) - 2);
                  return (
                    <>
                      After period ends
                      <br />
                      <span className="font-semibold">
                        {format(follicularStart, "MMM d")} - {format(ovulationStart, "MMM d")}
                      </span>
                    </>
                  );
                })()}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center bg-[#34D399]/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-[#34D399] mb-1">
              <Egg className="h-4 w-4" />
              <span className="text-sm font-medium">Ovulation</span>
            </div>
            {periodStartDate && (
              <p className="text-xs text-center">
                {(() => {
                  const ovulationStart = addDays(periodStartDate, Math.floor(cycleLength / 2) - 2);
                  const lutealStart = addDays(periodStartDate, Math.floor(cycleLength / 2) + 2);
                  return (
                    <>
                      Most fertile days
                      <br />
                      <span className="font-semibold">
                        {format(ovulationStart, "MMM d")} - {format(subDays(lutealStart, 1), "MMM d")}
                      </span>
                    </>
                  );
                })()}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center bg-[#9b87f5]/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-[#9b87f5] mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Luteal Phase</span>
            </div>
            {periodStartDate && (
              <p className="text-xs text-center">
                {(() => {
                  const lutealStart = addDays(periodStartDate, Math.floor(cycleLength / 2) + 2);
                  const cycleEnd = addDays(periodStartDate, cycleLength - 1);
                  return (
                    <>
                      After ovulation
                      <br />
                      <span className="font-semibold">
                        {format(lutealStart, "MMM d")} - {format(cycleEnd, "MMM d")}
                      </span>
                    </>
                  );
                })()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Droplets className="h-4 w-4 text-softpink" />
              <span>Period Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm"> Period Started:</span>
                  <span className="font-medium">
                    {periodStartDate ? format(periodStartDate, "MMMM d, yyyy") : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Length:</span>
                  <span className="font-medium">{periodLength} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cycle Length:</span>
                  <span className="font-medium">{cycleLength} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Next Period:</span>
                  <span className="font-medium">
                    {nextPeriodDate ? format(nextPeriodDate, "MMMM d, yyyy") : "Not calculated"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-4 w-4 text-lavender" />
              <span>Cycle Phase</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {periodStartDate && (
              <div>
                {(() => {
                  const today = new Date();
                  const endDate = periodEndDate || addDays(periodStartDate, periodLength - 1);
                  const phase = getCyclePhase(today, periodStartDate, endDate, cycleLength);
                  
                  let phaseInfo = {
                    name: "",
                    description: "",
                    color: "",
                    fertility: ""
                  };
                  
                  switch (phase) {
                    case "menstruation":
                      phaseInfo = {
                        name: "Menstruation Phase",
                        description: "The beginning of your cycle when your uterine lining sheds. Focus on self-care and rest.",
                        color: "bg-[#ff4d6d]/10 text-[#ff4d6d]",
                        fertility: "0% (Very low chance of conception)"
                      };
                      break;
                    case "follicular":
                      phaseInfo = {
                        name: "Follicular Phase",
                        description: "After your period ends, follicles in your ovaries begin to mature. Your energy is increasing.",
                        color: "bg-[#60A5FA]/10 text-[#60A5FA]",
                        fertility: "0-70% (Gradually increasing)"
                      };
                      break;
                    case "ovulation":
                      phaseInfo = {
                        name: "Ovulation Phase",
                        description: "Your most fertile window. An egg is released and can be fertilized for about 24 hours.",
                        color: "bg-[#34D399]/10 text-[#34D399]",
                        fertility: "80-95% (Your most fertile window)"
                      };
                      break;
                    case "luteal":
                      phaseInfo = {
                        name: "Luteal Phase",
                        description: "After ovulation, the corpus luteum releases progesterone. You might experience PMS symptoms.",
                        color: "bg-[#9b87f5]/10 text-[#9b87f5]",
                        fertility: "5% (Very low chance of conception)"
                      };
                      break;
                  }
                  
                  return (
                    <div className={cn("p-4 rounded-lg", phaseInfo.color)}>
                      <p className="font-bold mb-1">{phaseInfo.name}</p>
                      <p className="text-sm mb-2">{phaseInfo.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: phaseInfo.color.includes("#ff4d6d") ? "#ff4d6d" : 
                          phaseInfo.color.includes("#60A5FA") ? "#60A5FA" : 
                          phaseInfo.color.includes("#34D399") ? "#34D399" : 
                          "#9b87f5" }} />
                        <p className="text-xs font-medium">Fertility: {phaseInfo.fertility}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
