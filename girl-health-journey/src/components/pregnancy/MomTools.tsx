import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Activity, Footprints, Timer, Utensils, Baby, Smile, Calculator } from "lucide-react";

// Import our tool components
import WeightTracker from "./tools/WeightTracker";
import ExerciseLog from "./tools/ExerciseLog";
import KickCounter from "./tools/KickCounter";
import ContractionTimer from "./tools/ContractionTimer";
import MealPlans from "./tools/MealPlans";
import GenderPredictor from "./tools/GenderPredictor";
import MoodsTracker from "./tools/MoodsTracker";
import BMICalculator from "./tools/BMICalculator";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  bgColor?: string;
}

const ToolCard = ({ icon, title, description, onClick, bgColor = "bg-softpink/10" }: ToolCardProps) => (
  <Card className="overflow-hidden transition-all hover:shadow-md cursor-pointer" onClick={onClick}>
    <CardContent className="p-4">
      <div className="flex items-center gap-4">
        <div className={`${bgColor} rounded-full p-4`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function MomTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const handleToolClick = (toolName: string) => {
    setActiveTool(toolName);
  };

  const handleBack = () => {
    setActiveTool(null);
  };

  // Render the selected tool or the tool selection screen
  if (activeTool === "weightTracker") {
    return <WeightTracker onBack={handleBack} />;
  } else if (activeTool === "exerciseLog") {
    return <ExerciseLog onBack={handleBack} />;
  } else if (activeTool === "kickCounter") {
    return <KickCounter onBack={handleBack} />;
  } else if (activeTool === "contractionTimer") {
    return <ContractionTimer onBack={handleBack} />;
  } else if (activeTool === "mealPlans") {
    return <MealPlans onBack={handleBack} />;
  } else if (activeTool === "genderPredictor") {
    return <GenderPredictor onBack={handleBack} />;
  } else if (activeTool === "moodsTracker") {
    return <MoodsTracker onBack={handleBack} />;
  } else if (activeTool === "bmiCalculator") {
    return <BMICalculator onBack={handleBack} />;
  }

  // Default view - tool selection
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Mom Tools</h1>
        <p className="text-muted-foreground">Track your health and monitor your pregnancy journey</p>
      </div>

      <Card className="bg-gray-50 border-0">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-2">Your Journey</h3>
          <p className="text-muted-foreground mb-4">
            Tracking your pregnancy helps you stay healthy and informed
          </p>
          <p className="text-sm mb-6">
            Use these tools to monitor your health and baby's development throughout your pregnancy. 
            Regular tracking helps identify patterns and ensures a healthier pregnancy journey.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <ToolCard
          icon={<Scale className="h-6 w-6 text-softpink" />}
          title="Weight Tracker"
          description="Track your pregnancy weight gain"
          onClick={() => handleToolClick("weightTracker")}
        />
        
        <ToolCard
          icon={<Calculator className="h-6 w-6 text-calmteal" />}
          title="BMI Calculator"
          description="Calculate and track your Body Mass Index"
          onClick={() => handleToolClick("bmiCalculator")}
          bgColor="bg-calmteal/10"
        />
        
        <ToolCard
          icon={<Activity className="h-6 w-6 text-lavender" />}
          title="Exercise Log"
          description="Log your pregnancy-safe workouts"
          onClick={() => handleToolClick("exerciseLog")}
          bgColor="bg-lavender/10"
        />
        
        <ToolCard
          icon={<Footprints className="h-6 w-6 text-calmteal" />}
          title="Kick Counter"
          description="Monitor your baby's movements"
          onClick={() => handleToolClick("kickCounter")}
          bgColor="bg-calmteal/10"
        />
        
        <ToolCard
          icon={<Timer className="h-6 w-6 text-softpink" />}
          title="Contraction Timer"
          description="Time your contractions during labor"
          onClick={() => handleToolClick("contractionTimer")}
        />
        
        <ToolCard
          icon={<Utensils className="h-6 w-6 text-lavender" />}
          title="Meal Plans"
          description="Healthy pregnancy meal ideas"
          onClick={() => handleToolClick("mealPlans")}
          bgColor="bg-lavender/10"
        />
        
        <ToolCard
          icon={<Baby className="h-6 w-6 text-calmteal" />}
          title="Gender Predictor"
          description="Fun gender prediction based on Chinese calendar"
          onClick={() => handleToolClick("genderPredictor")}
          bgColor="bg-calmteal/10"
        />
        
        <ToolCard
          icon={<Smile className="h-6 w-6 text-softpink" />}
          title="Moods Tracker"
          description="Track your emotional well-being during pregnancy"
          onClick={() => handleToolClick("moodsTracker")}
        />
      </div>
    </div>
  );
}
