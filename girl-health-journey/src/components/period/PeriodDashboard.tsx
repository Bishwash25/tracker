import React, { useEffect, useState } from "react";
import { format, addDays, differenceInDays, subDays, isWithinInterval, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Droplets, Egg, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

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
  if (isWithinInterval(date, { start: periodStart, end: periodEnd })) {
    return "period";
  }
  
  const fertilityWindow = getFertilityWindow(periodStart, cycleLength);
  
  if (isWithinInterval(date, { start: fertilityWindow.start, end: fertilityWindow.end })) {
    return "fertility";
  }
  
  if (isSameDay(date, fertilityWindow.ovulation)) {
    return "ovulation";
  }
  
  if (isWithinInterval(date, { 
    start: addDays(fertilityWindow.ovulation, 1), 
    end: subDays(addDays(periodStart, cycleLength), 1) 
  })) {
    return "luteal";
  }
  
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
  }, []);

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
      case "period":
        return "bg-softpink/30 text-foreground hover:bg-softpink/50 rounded-md";
      case "ovulation":
        return "bg-calmteal hover:bg-calmteal/80 text-white rounded-md";
      case "fertility":
        return "bg-calmteal/30 text-foreground hover:bg-calmteal/50 rounded-md";
      case "luteal":
        return "bg-lavender/20 text-foreground hover:bg-lavender/40 rounded-md";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8">
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
              period: nextThreeCycles.map(cycle => ({ from: cycle.periodStart, to: cycle.periodEnd })),
              fertility: nextThreeCycles.map(cycle => ({ from: cycle.fertility.start, to: cycle.fertility.end })),
              ovulation: nextThreeCycles.map(cycle => cycle.ovulation),
              today: new Date()
            }}
            modifiersClassNames={{
              period: "bg-softpink/30 text-foreground hover:bg-softpink/50 rounded-md",
              fertility: "bg-calmteal/30 text-foreground hover:bg-calmteal/50 rounded-md",
              ovulation: "bg-calmteal hover:bg-calmteal/80 text-white rounded-md",
              today: "border border-primary font-bold"
            }}
            styles={{
              day: { margin: '1px' }
            }}
          />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="flex flex-col items-center justify-center bg-softpink/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-softpink mb-1">
              <Droplets className="h-4 w-4" />
              <span className="text-sm font-medium">Period</span>
            </div>
            {nextPeriodDate && (
              <p className="text-xs text-center">
                Next period in {differenceInDays(nextPeriodDate, new Date())} days
                <br />
                <span className="font-semibold">{format(nextPeriodDate, "MMM d")}</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center bg-calmteal/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-calmteal mb-1">
              <Egg className="h-4 w-4" />
              <span className="text-sm font-medium">Fertility</span>
            </div>
            {periodStartDate && (
              <p className="text-xs text-center">
                {(() => {
                  const fertility = getFertilityWindow(periodStartDate, cycleLength);
                  return (
                    <>
                      Fertile window
                      <br />
                      <span className="font-semibold">
                        {format(fertility.start, "MMM d")} - {format(fertility.end, "MMM d")}
                      </span>
                    </>
                  );
                })()}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center justify-center bg-calmteal/20 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-calmteal mb-1">
              <Egg className="h-4 w-4" />
              <span className="text-sm font-medium">Ovulation</span>
            </div>
            {periodStartDate && (
              <p className="text-xs text-center">
                {(() => {
                  const fertility = getFertilityWindow(periodStartDate, cycleLength);
                  return (
                    <>
                      Ovulation day
                      <br />
                      <span className="font-semibold">
                        {format(fertility.ovulation, "MMM d")}
                      </span>
                    </>
                  );
                })()}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-center justify-center bg-lavender/10 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 text-lavender mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Luteal Phase</span>
            </div>
            {periodStartDate && (
              <p className="text-xs text-center">
                {(() => {
                  const fertility = getFertilityWindow(periodStartDate, cycleLength);
                  const lutealStart = addDays(fertility.ovulation, 1);
                  const lutealEnd = subDays(addDays(periodStartDate, cycleLength), 1);
                  return (
                    <>
                      After ovulation
                      <br />
                      <span className="font-semibold">
                        {format(lutealStart, "MMM d")} - {format(lutealEnd, "MMM d")}
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
                    color: ""
                  };
                  
                  switch (phase) {
                    case "period":
                      phaseInfo = {
                        name: "Menstrual Phase",
                        description: "Your body is shedding the uterine lining. Focus on self-care and rest.",
                        color: "bg-softpink/10 text-softpink"
                      };
                      break;
                    case "follicular":
                      phaseInfo = {
                        name: "Follicular Phase",
                        description: "Estrogen levels rise as follicles in the ovaries mature. Energy levels often increase.",
                        color: "bg-yellow-100 text-yellow-700"
                      };
                      break;
                    case "fertility":
                      phaseInfo = {
                        name: "Fertile Window",
                        description: "This is when pregnancy is most likely to occur if you have unprotected sex.",
                        color: "bg-calmteal/10 text-calmteal"
                      };
                      break;
                    case "ovulation":
                      phaseInfo = {
                        name: "Ovulation Day",
                        description: "An egg is released from the ovary and can be fertilized for about 24 hours.",
                        color: "bg-calmteal/20 text-calmteal"
                      };
                      break;
                    case "luteal":
                      phaseInfo = {
                        name: "Luteal Phase",
                        description: "Progesterone rises to prepare for potential pregnancy. You might experience PMS symptoms.",
                        color: "bg-lavender/10 text-lavender"
                      };
                      break;
                  }
                  
                  return (
                    <div className={cn("p-4 rounded-lg", phaseInfo.color)}>
                      <p className="font-bold mb-1">{phaseInfo.name}</p>
                      <p className="text-sm">{phaseInfo.description}</p>
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
