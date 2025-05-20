import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import FertilityChart from "./FertilityChart";
import MoodTracker from "./MoodTracker";
import PeriodFlowTracker from "./PeriodFlowTracker";
import PeriodWeightTracker from "./PeriodWeightTracker";
import { Calendar, Droplets, Smile, ChevronDown, Scale } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function PeriodInsights() {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<'cycle' | 'mood' | 'flow' | 'weight'>('cycle');
  
  const sidebarItems = [
    { id: 'cycle', label: 'Cycle Phases', icon: Calendar },
    { id: 'mood', label: 'Moods', icon: Smile },
    { id: 'flow', label: 'Period Flow', icon: Droplets },
    { id: 'weight', label: 'Weight Tracker', icon: Scale },
  ] as const;
  
  return (
    <div className="flex flex-col h-full gap-6">
      {/* Dropdown header */}
      <div className="w-full max-w-xs">
        <Select
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as 'cycle' | 'mood' | 'flow' | 'weight')}
        >
          <SelectTrigger className="w-full shadow-lg bg-gradient-to-r from-[#f8f7ff] via-[#e0e7ff] to-[#f3e8ff] border-2 border-primary/40 focus:ring-2 focus:ring-primary/60">
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent className="shadow-2xl bg-white/90 backdrop-blur-md border-primary/30">
            {sidebarItems.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                <div className="flex items-center gap-2 font-bold">
                  <item.icon className="h-4 w-4 text-black" />
                  <span className="font-bold text-black">{item.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <h1 className="text-2xl font-heading font-bold mb-8">Period Insights</h1>
        
        {activeSection === 'cycle' && <FertilityChart />}
        {activeSection === 'mood' && <MoodTracker />}
        {activeSection === 'flow' && <PeriodFlowTracker />}
        {activeSection === 'weight' && <PeriodWeightTracker />}
      </div>
    </div>
  );
}
