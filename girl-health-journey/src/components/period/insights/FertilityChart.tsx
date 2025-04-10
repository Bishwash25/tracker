import React, { useState, useEffect } from "react";
import { format, addDays, eachDayOfInterval, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { CalendarDays, Info } from "lucide-react";

type PhaseType = "menstruation" | "follicular" | "ovulation" | "luteal";

interface CycleDay {
  date: Date;
  day: number;
  phase: PhaseType;
  fertility: number; // 0-100 score
  label: string;
}

const getPhaseColor = (phase: PhaseType) => {
  switch (phase) {
    case "menstruation": return "#ff4d6d"; // brighter red
    case "follicular": return "#60A5FA"; // blue
    case "ovulation": return "#34D399"; // green
    case "luteal": return "#9b87f5"; // brightened lavender
    default: return "#CBD5E1"; // gray
  }
};

const getPhaseName = (phase: PhaseType) => {
  switch (phase) {
    case "menstruation": return "Menstruation";
    case "follicular": return "Follicular";
    case "ovulation": return "Ovulation";
    case "luteal": return "Luteal";
    default: return "Unknown";
  }
};

export default function FertilityChart() {
  const [cycleData, setCycleData] = useState<CycleDay[]>([]);
  
  useEffect(() => {
    // Get period data from localStorage
    const periodStart = localStorage.getItem("periodStartDate") 
      ? new Date(localStorage.getItem("periodStartDate") as string)
      : new Date();
    
    const periodLength = localStorage.getItem("periodLength")
      ? parseInt(localStorage.getItem("periodLength") as string)
      : 5;
    
    const cycleLength = localStorage.getItem("cycleLength")
      ? parseInt(localStorage.getItem("cycleLength") as string)
      : 28;
    
    // Calculate phases
    const follicularStart = addDays(periodStart, periodLength);
    const ovulationStart = addDays(periodStart, Math.floor(cycleLength / 2) - 2);
    const lutealStart = addDays(periodStart, Math.floor(cycleLength / 2) + 1);
    const cycleEnd = addDays(periodStart, cycleLength - 1);
    
    // Create data for entire cycle
    const days = eachDayOfInterval({ start: periodStart, end: cycleEnd });
    
    const data: CycleDay[] = days.map((date, index) => {
      let phase: PhaseType = "follicular";
      let fertility = 0;
      
      // Determine phase and fertility score
      if (index < periodLength) {
        phase = "menstruation";
        fertility = 0;
      } else if (date >= ovulationStart && date < lutealStart) {
        phase = "ovulation";
        fertility = 95; // High fertility
      } else if (date >= lutealStart) {
        phase = "luteal";
        fertility = 5;
      } else if (date >= follicularStart && date < ovulationStart) {
        phase = "follicular";
        // Gradually increasing fertility
        const daysIntoFollicular = differenceInDays(date, follicularStart);
        const follicularLength = differenceInDays(ovulationStart, follicularStart);
        fertility = Math.min(70, Math.floor((daysIntoFollicular / follicularLength) * 70));
      }
      
      // 2 days before ovulation also have high fertility
      if (differenceInDays(ovulationStart, date) <= 2 && differenceInDays(ovulationStart, date) > 0) {
        fertility = 80; // High fertility before ovulation
      }
      
      return {
        date,
        day: index + 1,
        phase,
        fertility,
        label: format(date, "MMM d")
      };
    });
    
    setCycleData(data);
  }, []);

  // Format for chart
  const chartData = cycleData.map(day => ({
    day: day.day,
    label: day.label,
    fertility: day.fertility,
    phase: day.phase,
    phaseName: getPhaseName(day.phase),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarDays className="h-5 w-5 text-lavender" />
          Fertility Prediction & Cycle Phases
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Improved responsive chart container */}
        <div className="w-full overflow-hidden">
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
              >
                <defs>
                  {cycleData
                    .filter((day, i, arr) => i === 0 || day.phase !== arr[i - 1].phase)
                    .map((day) => (
                      <linearGradient
                        key={day.phase}
                        id={`color-${day.phase}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={getPhaseColor(day.phase)}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={getPhaseColor(day.phase)}
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  minTickGap={5}
                  tickMargin={8}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                  tickCount={6}
                  tickMargin={5}
                  width={30}
                  label={{ 
                    value: 'Fertility', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 10, textAnchor: 'middle' },
                    dy: 40
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    
                    const data = payload[0].payload;
                    
                    return (
                      <div className="rounded-lg border border-border/50 bg-background p-3 text-sm shadow-xl">
                        <p className="font-medium">{data.label}</p>
                        <p className="text-muted-foreground">Day {data.day} of cycle</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: getPhaseColor(data.phase) }}
                          />
                          <span className="font-medium">{data.phaseName} Phase</span>
                        </div>
                        <p className="mt-1 font-semibold">Fertility: {data.fertility}%</p>
                      </div>
                    );
                  }}
                />
                {cycleData
                  .reduce<{ phase: PhaseType; days: CycleDay[] }[]>((acc, day) => {
                    const lastGroup = acc[acc.length - 1];
                    
                    if (!lastGroup || lastGroup.phase !== day.phase) {
                      acc.push({ phase: day.phase, days: [day] });
                    } else {
                      lastGroup.days.push(day);
                    }
                    
                    return acc;
                  }, [])
                  .map((group) => {
                    const startDay = group.days[0].day;
                    const endDay = group.days[group.days.length - 1].day;
                    
                    return (
                      <Area
                        key={`${group.phase}-${startDay}`}
                        type="monotone"
                        dataKey="fertility"
                        data={chartData.slice(startDay - 1, endDay)}
                        stroke={getPhaseColor(group.phase)}
                        fillOpacity={1}
                        fill={`url(#color-${group.phase})`}
                        strokeWidth={2}
                      />
                    );
                  })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["menstruation", "follicular", "ovulation", "luteal"] as PhaseType[]).map((phase) => (
            <div key={phase} className="flex items-center gap-2 text-sm">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: getPhaseColor(phase) }}
              />
              <span>{getPhaseName(phase)}</span>
            </div>
          ))}
        </div>
      </CardContent>
      
      {/* Add detailed description */}
      <CardFooter className="flex flex-col pt-0">
        <div className="mt-4 p-4 bg-white rounded-lg border border-lavender/20 shadow-sm text-sm space-y-3">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-lavender shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-base">Understanding Your Fertility Chart</h4>
              <p className="text-muted-foreground mt-1">
                This chart visualizes your menstrual cycle phases and estimated fertility levels throughout your cycle.
              </p>
            </div>
          </div>
          
          {/* Detailed Cycle Breakdown */}
          <div className="mt-4 space-y-4 border-t pt-4">
            <h4 className="font-semibold">Your Current Cycle Breakdown</h4>
            
            {cycleData.length > 0 && (
              <div className="space-y-3">
                {/* Menstruation Phase */}
                {(() => {
                  const menstruationDays = cycleData.filter(day => day.phase === "menstruation");
                  if (menstruationDays.length === 0) return null;
                  
                  const startDate = format(menstruationDays[0].date, "MMM d");
                  const endDate = format(menstruationDays[menstruationDays.length - 1].date, "MMM d");
                  
                  return (
                    <div className="p-3 bg-[#ff4d6d]/10 rounded-md">
                      <h5 className="font-medium flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#ff4d6d]"></div>
                        <span>Menstruation Phase</span>
                      </h5>
                      <p className="text-xs mt-1">
                        Your period is from <span className="font-semibold">{startDate}</span> to <span className="font-semibold">{endDate}</span> (Days 1-{menstruationDays.length})
                      </p>
                      <p className="text-xs mt-1">Fertility: <span className="font-semibold">0%</span> (Very low chance of conception)</p>
                    </div>
                  );
                })()}
                
                {/* Follicular Phase */}
                {(() => {
                  const follicularDays = cycleData.filter(day => day.phase === "follicular");
                  if (follicularDays.length === 0) return null;
                  
                  const startDate = format(follicularDays[0].date, "MMM d");
                  const endDate = format(follicularDays[follicularDays.length - 1].date, "MMM d");
                  const minFertility = Math.min(...follicularDays.map(d => d.fertility));
                  const maxFertility = Math.max(...follicularDays.map(d => d.fertility));
                  
                  return (
                    <div className="p-3 bg-[#60A5FA]/10 rounded-md">
                      <h5 className="font-medium flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#60A5FA]"></div>
                        <span>Follicular Phase</span>
                      </h5>
                      <p className="text-xs mt-1">
                        From <span className="font-semibold">{startDate}</span> to <span className="font-semibold">{endDate}</span> (Days {follicularDays[0].day}-{follicularDays[follicularDays.length - 1].day})
                      </p>
                      <p className="text-xs mt-1">Fertility: <span className="font-semibold">{minFertility}% to {maxFertility}%</span> (Gradually increasing)</p>
                    </div>
                  );
                })()}
                
                {/* Ovulation Phase */}
                {(() => {
                  const ovulationDays = cycleData.filter(day => day.phase === "ovulation");
                  if (ovulationDays.length === 0) return null;
                  
                  const startDate = format(ovulationDays[0].date, "MMM d");
                  const endDate = format(ovulationDays[ovulationDays.length - 1].date, "MMM d");
                  
                  return (
                    <div className="p-3 bg-[#34D399]/10 rounded-md">
                      <h5 className="font-medium flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#34D399]"></div>
                        <span>Ovulation Phase</span>
                      </h5>
                      <p className="text-xs mt-1">
                        From <span className="font-semibold">{startDate}</span> to <span className="font-semibold">{endDate}</span> (Days {ovulationDays[0].day}-{ovulationDays[ovulationDays.length - 1].day})
                      </p>
                      <p className="text-xs mt-1">Fertility: <span className="font-semibold">80% to 95%</span> (Your most fertile window)</p>
                      <p className="text-xs mt-1 text-[#34D399] font-medium">This is your optimal time for conception.</p>
                    </div>
                  );
                })()}
                
                {/* Luteal Phase */}
                {(() => {
                  const lutealDays = cycleData.filter(day => day.phase === "luteal");
                  if (lutealDays.length === 0) return null;
                  
                  const startDate = format(lutealDays[0].date, "MMM d");
                  const endDate = format(lutealDays[lutealDays.length - 1].date, "MMM d");
                  
                  return (
                    <div className="p-3 bg-[#9b87f5]/10 rounded-md">
                      <h5 className="font-medium flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#9b87f5]"></div>
                        <span>Luteal Phase</span>
                      </h5>
                      <p className="text-xs mt-1">
                        From <span className="font-semibold">{startDate}</span> to <span className="font-semibold">{endDate}</span> (Days {lutealDays[0].day}-{lutealDays[lutealDays.length - 1].day})
                      </p>
                      <p className="text-xs mt-1">Fertility: <span className="font-semibold">5%</span> (Very low chance of conception)</p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div>
              <p className="font-medium text-sm">Menstruation Phase <span className="text-[#ff4d6d]">(Red)</span></p>
              <p className="text-xs text-muted-foreground">
                The beginning of your cycle when your uterine lining sheds. Fertility is very low during this phase.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-sm">Follicular Phase <span className="text-[#60A5FA]">(Blue)</span></p>
              <p className="text-xs text-muted-foreground">
                After your period ends, follicles in your ovaries begin to mature. Fertility gradually increases.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-sm">Ovulation Phase <span className="text-[#34D399]">(Green)</span></p>
              <p className="text-xs text-muted-foreground">
                Your most fertile window (peak ~95%). An egg is released and can be fertilized for about 24 hours.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-sm">Luteal Phase <span className="text-[#9b87f5]">(Purple)</span></p>
              <p className="text-xs text-muted-foreground">
                After ovulation, the corpus luteum releases progesterone. Fertility drops significantly.
              </p>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
