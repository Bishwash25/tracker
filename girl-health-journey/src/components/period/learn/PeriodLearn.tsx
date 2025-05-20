import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, CheckCircle, AlertCircle, Stethoscope } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import PeriodHealth from "./PeriodHealth";
import PeriodDosAndDonts from "./PeriodDosAndDonts";
import CommonConditions from "./CommonConditions";
import SymptomsGuide from "./SymptomsGuide";

export default function PeriodLearn() {
  const [activeSection, setActiveSection] = useState<'health' | 'dosdonts' | 'conditions' | 'symptoms'>('health');
  
  const sectionItems = [
    { id: 'health', label: 'Period Health', icon: Heart },
    { id: 'dosdonts', label: "Period Do's & Don'ts", icon: CheckCircle },
    { id: 'conditions', label: 'Common Conditions', icon: AlertCircle },
    { id: 'symptoms', label: 'Symptoms Guide', icon: Stethoscope },
  ] as const;

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Dropdown header */}
      <div className="w-full max-w-xs">
        <Select
          value={activeSection}
          onValueChange={(value) => setActiveSection(value as 'health' | 'dosdonts' | 'conditions' | 'symptoms')}
        >
          <SelectTrigger className="w-full shadow-lg bg-gradient-to-r from-[#f8f7ff] via-[#e0e7ff] to-[#f3e8ff] border-2 border-primary/40 focus:ring-2 focus:ring-primary/60">
            <SelectValue placeholder="Select topic" />
          </SelectTrigger>
          <SelectContent className="shadow-2xl bg-white/90 backdrop-blur-md border-primary/30">
            {sectionItems.map((item) => (
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
        <h1 className="text-2xl font-heading font-bold mb-4">Women's Health Education</h1>
        <p className="text-muted-foreground mb-8">
          Learn about menstrual health, common conditions, and when to seek medical attention.
        </p>
        
        {activeSection === 'health' && <PeriodHealth />}
        {activeSection === 'dosdonts' && <PeriodDosAndDonts />}
        {activeSection === 'conditions' && <CommonConditions />}
        {activeSection === 'symptoms' && <SymptomsGuide />}
      </div>
    </div>
  );
}
