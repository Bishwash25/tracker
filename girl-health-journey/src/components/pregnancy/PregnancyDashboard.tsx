import React, { useEffect, useState } from "react";
import { format, differenceInDays, differenceInWeeks, addDays, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Baby, Info, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Baby size comparison data by week
const babySizeData: Record<number, { 
  fruit: string, 
  lengthCm: string, 
  lengthIn: string, 
  weightG: string, 
  weightLb: string 
}> = {
  1: { fruit: "Poppy Seed", lengthCm: "0 cm", lengthIn: "0 in", weightG: "0 g", weightLb: "0 oz" },
  2: { fruit: "Poppy Seed", lengthCm: "0 cm", lengthIn: "0 in", weightG: "0 g", weightLb: "0 oz" },
  3: { fruit: "Poppy Seed", lengthCm: "0 cm", lengthIn: "0 in", weightG: "0 g", weightLb: "0 oz" },
  4: { fruit: "Poppy Seed", lengthCm: "0.1 cm", lengthIn: "0.04 in", weightG: "< 1 g", weightLb: "< 0.04 oz" },
  5: { fruit: "Apple Seed", lengthCm: "0.1-0.3 cm", lengthIn: "0.05-0.1 in", weightG: "< 1 g", weightLb: "< 0.04 oz" },
  6: { fruit: "Pea", lengthCm: "0.3-0.5 cm", lengthIn: "0.1-0.2 in", weightG: "< 1 g", weightLb: "< 0.04 oz" },
  7: { fruit: "Blueberry", lengthCm: "1-1.3 cm", lengthIn: "0.4-0.5 in", weightG: "< 1 g", weightLb: "< 0.04 oz" },
  8: { fruit: "Kidney Bean", lengthCm: "1.5 cm", lengthIn: "0.6 in", weightG: "< 1 g", weightLb: "< 0.04 oz" },
  9: { fruit: "Grape", lengthCm: "2.3 cm", lengthIn: "0.9 in", weightG: "2 g", weightLb: "0.07 oz" },
  10: { fruit: "Kumquat", lengthCm: "3 cm", lengthIn: "1.2 in", weightG: "4 g", weightLb: "0.14 oz" },
  11: { fruit: "Fig", lengthCm: "4.1 cm", lengthIn: "1.6 in", weightG: "7 g", weightLb: "0.25 oz" },
  12: { fruit: "Plum", lengthCm: "5.3 cm", lengthIn: "2.1 in", weightG: "14 g", weightLb: "0.5 oz" },
  13: { fruit: "Peach", lengthCm: "7.4 cm", lengthIn: "2.9 in", weightG: "23 g", weightLb: "0.81 oz" },
  14: { fruit: "Lemon", lengthCm: "8.6 cm", lengthIn: "3.4 in", weightG: "43 g", weightLb: "1.52 oz" },
  15: { fruit: "Apple", lengthCm: "10.2 cm", lengthIn: "4 in", weightG: "70 g", weightLb: "2.47 oz" },
  16: { fruit: "Avocado", lengthCm: "11.7 cm", lengthIn: "4.6 in", weightG: "100 g", weightLb: "3.53 oz" },
  17: { fruit: "Pear", lengthCm: "13 cm", lengthIn: "5.1 in", weightG: "140 g", weightLb: "4.94 oz" },
  18: { fruit: "Bell Pepper", lengthCm: "14.2 cm", lengthIn: "5.6 in", weightG: "190 g", weightLb: "6.7 oz" },
  19: { fruit: "Mango", lengthCm: "15.2 cm", lengthIn: "6.0 in", weightG: "240 g", weightLb: "8.47 oz" },
  20: { fruit: "Banana", lengthCm: "16.5 cm", lengthIn: "6.5 in", weightG: "300 g", weightLb: "10.58 oz" },
  21: { fruit: "Pomegranate", lengthCm: "26.7 cm", lengthIn: "10.5 in", weightG: "360 g", weightLb: "12.7 oz" },
  22: { fruit: "Papaya", lengthCm: "27.7 cm", lengthIn: "10.9 in", weightG: "454 g", weightLb: "1 lb" },
  23: { fruit: "Grapefruit", lengthCm: "29 cm", lengthIn: "11.4 in", weightG: "500 g", weightLb: "1.1 lbs" },
  24: { fruit: "Papaya", lengthCm: "30 cm", lengthIn: "11.8 in", weightG: "590 g", weightLb: "1.3 lbs" },
  25: { fruit: "Cauliflower", lengthCm: "34.5 cm", lengthIn: "13.6 in", weightG: "680 g", weightLb: "1.5 lbs" },
  26: { fruit: "Lettuce", lengthCm: "35.6 cm", lengthIn: "14 in", weightG: "770 g", weightLb: "1.7 lbs" },
  27: { fruit: "Cabbage", lengthCm: "36.6 cm", lengthIn: "14.4 in", weightG: "860 g", weightLb: "1.9 lbs" },
  28: { fruit: "Eggplant", lengthCm: "37.6 cm", lengthIn: "14.8 in", weightG: "1 kg", weightLb: "2.2 lbs" },
  29: { fruit: "Butternut Squash", lengthCm: "38.6 cm", lengthIn: "15.2 in", weightG: "1.1 kg", weightLb: "2.5 lbs" },
  30: { fruit: "Cucumber", lengthCm: "39.9 cm", lengthIn: "15.7 in", weightG: "1.3 kg", weightLb: "2.9 lbs" },
  31: { fruit: "Coconut", lengthCm: "41.1 cm", lengthIn: "16.2 in", weightG: "1.5 kg", weightLb: "3.3 lbs" },
  32: { fruit: "Jicama", lengthCm: "42.4 cm", lengthIn: "16.7 in", weightG: "1.7 kg", weightLb: "3.8 lbs" },
  33: { fruit: "Pineapple", lengthCm: "43.7 cm", lengthIn: "17.2 in", weightG: "1.9 kg", weightLb: "4.2 lbs" },
  34: { fruit: "Cantaloupe", lengthCm: "45 cm", lengthIn: "17.7 in", weightG: "2.1 kg", weightLb: "4.7 lbs" },
  35: { fruit: "Honeydew Melon", lengthCm: "46.2 cm", lengthIn: "18.2 in", weightG: "2.4 kg", weightLb: "5.3 lbs" },
  36: { fruit: "Romaine Lettuce", lengthCm: "47.5 cm", lengthIn: "18.7 in", weightG: "2.6 kg", weightLb: "5.8 lbs" },
  37: { fruit: "Swiss Chard", lengthCm: "48.5 cm", lengthIn: "19.1 in", weightG: "2.9 kg", weightLb: "6.3 lbs" },
  38: { fruit: "Winter Melon", lengthCm: "49.8 cm", lengthIn: "19.6 in", weightG: "3.1 kg", weightLb: "6.8 lbs" },
  39: { fruit: "Mini Watermelon", lengthCm: "50.7 cm", lengthIn: "20 in", weightG: "3.3 kg", weightLb: "7.3 lbs" },
  40: { fruit: "baby", lengthCm: "51.2 cm", lengthIn: "20.2 in", weightG: "3.5 kg", weightLb: "7.7 lbs" },
  41: { fruit: "baby", lengthCm: "51.2 cm", lengthIn: "20.2 in", weightG: "3.51 kg", weightLb: "7.71 lbs" },
  42: { fruit: "baby", lengthCm: "51.3 cm", lengthIn: "20.3 in", weightG: "3.5 kg", weightLb: "7.7 lbs" },
};

// Function to get pregnancy development information based on week
function getPregnancyDevelopment(week: number) {
  if (week >= 1 && week <= 12) {
    return {
      description: "Your baby's major organs are forming and your body is adjusting to pregnancy.",
      keyDevelopments: "Brain, heart, and spine formation. Morning sickness is common."
    };
  } else if (week >= 13 && week <= 28) {
    return {
      description: "Baby's features are developing and you might feel movement. Organs continue to mature.",
      keyDevelopments: "Facial features, fingers, toes. You may feel first movements (quickening)."
    };
  } else if (week >= 29 && week <= 40) {
    return {
      description: "Baby is putting on weight and preparing for delivery. Your body is preparing for labor.",
      keyDevelopments: "Rapid weight gain, lung maturation, position for birth. Braxton Hicks contractions may occur."
    };
  } else {
    return {
      description: "Week Completed.",
      keyDevelopments: "Please consult medical advice."
    };
  }
}

// Fruit emoji mapping by key weeks of each trimester
const fruitEmojis: Record<number, { emoji: string, name: string }> = {
  1: { emoji: "🌸", name: "Poppy Seed" },
  2: { emoji: "🌸", name: "Poppy Seed" },
  3: { emoji: "🌸", name: "Poppy Seed" },
  4: { emoji: "🌸", name: "Poppy Seed" },  
  5: { emoji: "🌱", name: "Apple Seed" },
  6: { emoji: "🟢", name: "Pea" },
  7: { emoji: "🫐", name: "Blueberry" },
  8: { emoji: "🫘", name: "Kidney Bean" },   
  9: { emoji: "🍇", name: "Grape" },
  10: { emoji: "🍊", name: "Kumquat" },
  11: { emoji: "🍹", name: "Fig" },
  12: { emoji: "🍑", name: "Plum" },       
  13: { emoji: "🍑", name: "Peach" },
  14: { emoji: "🍋", name: "Lemon" },
  15: { emoji: "🍎", name: "Apple" },
  16: { emoji: "🥑", name: "Avocado" },    
  17: { emoji: "🍐", name: "Pear" },
  18: { emoji: "🫑", name: "Bell Pepper" },
  19: { emoji: "🥭", name: "Mango" },
  20: { emoji: "🍌", name: "Banana" },     
  21: { emoji: "🍎", name: "Pomegranate" },
  22: { emoji: "🥭", name: "Papaya" },
  23: { emoji: "🍊", name: "Grapefruit" },
  24: { emoji: "🥭", name: "Papaya" },     
  25: { emoji: "🥦", name: "Cauliflower" },
  26: { emoji: "🥬", name: "Lettuce" },
  27: { emoji: "🥬", name: "Cabbage" },
  28: { emoji: "🍆", name: "Eggplant" },     
  29: { emoji: "🎃", name: "Butternut Squash" },
  30: { emoji: "🥒", name: "Cucumber" },
  31: { emoji: "🥥", name: "Coconut" },
  32: { emoji: "🥔", name: "Jicama" },     
  33: { emoji: "🍍", name: "Pineapple" },
  34: { emoji: "🍈", name: "Cantaloupe" },
  35: { emoji: "🍈", name: "Honeydew Melon" }, 
  36: { emoji: "🥬", name: "Romaine Lettuce" },
  37: { emoji: "🥬", name: "Swiss Chard" },
  38: { emoji: "🍈", name: "Winter Melon" },
  39: { emoji: "🍉", name: "Mini Watermelon" },
  40: { emoji: "👶", name: "baby" },    
  41: { emoji: "👶", name: "baby" },
  42: { emoji: "👶", name: "baby" } 
};

// Get the appropriate fruit emoji based on week
const getFruitForWeek = (week: number) => {
  // If the week is less than 1 or not defined, return the earliest stage
  if (week < 1) return { emoji: "🌸", name: "Poppy Seed" };
  
  // If greater than 42, return baby
  if (week > 42) return { emoji: "👶", name: "baby" };
  
  // Return the exact match for the week
  return fruitEmojis[week] || { emoji: "🌸", name: "Poppy Seed" };
};

// Function to find the week that corresponds to a specific fruit name
const getWeekForFruitName = (fruitName: string): number => {
  // Handle the "baby" case specially
  if (fruitName === "baby") return 40;
  
  // Convert babySizeData to array of [week, fruitInfo] pairs
  const entries = Object.entries(babySizeData).map(([week, info]) => [
    Number(week), 
    info
  ] as [number, { fruit: string, lengthCm: string, lengthIn: string, weightG: string, weightLb: string }]);
  
  // Find the entry where fruit matches the fruitName
  const matchingEntry = entries.find(([_, info]) => info.fruit === fruitName);
  
  // Return the matching week or fallback to a safe value
  return matchingEntry ? matchingEntry[0] : 4;
};

export default function PregnancyDashboard() {
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [weeksPregnant, setWeeksPregnant] = useState(0);
  const [daysPregnant, setDaysPregnant] = useState(0);
  const [babyInfo, setBabyInfo] = useState<{ 
    fruit: string, 
    length: string,
    lengthIn: string, 
    weight: string,
    weightLb: string 
  }>({ 
    fruit: "", 
    length: "", 
    lengthIn: "",
    weight: "",
    weightLb: ""
  });
  const [daysToGo, setDaysToGo] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [currentFruit, setCurrentFruit] = useState<{ emoji: string, name: string }>({ emoji: "🌸", name: "Poppy Seed" });
  const [currentTime, setCurrentTime] = useState(new Date());

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
  }, []);

  useEffect(() => {
    // Load data from localStorage
    const storedLastPeriodDate = localStorage.getItem("lastPeriodDate");
    const storedDueDate = localStorage.getItem("dueDate");
    
    if (storedLastPeriodDate && storedDueDate) {
      const lastPeriod = new Date(storedLastPeriodDate);
      const due = new Date(storedDueDate);
      
      setLastPeriodDate(lastPeriod);
      setDueDate(due);
    }
  }, []);

  // Calculate pregnancy progress based on current time
  useEffect(() => {
    if (!lastPeriodDate || !dueDate) return;
    
    // Calculate pregnancy progress
    const totalWeeks = differenceInWeeks(currentTime, lastPeriodDate);
    const exactDays = differenceInDays(currentTime, lastPeriodDate);
    const remainingDays = exactDays % 7;
    const daysRemaining = differenceInDays(dueDate, currentTime);
    
    // Handle edge case: if at 41 weeks and 6+ days, display as 42 weeks
    let displayWeeks = totalWeeks;
    let displayDays = remainingDays;
    
    if ((totalWeeks === 41 && remainingDays >= 6) || 
        (totalWeeks === 41 && remainingDays === 0 && exactDays >= 294)) {
      displayWeeks = 42;
      displayDays = 0;
    }
    
    // Cap weeks at 42 for display purposes
    if (displayWeeks > 42) {
      displayWeeks = 42;
      displayDays = 0;
    }
    
    setWeeksPregnant(displayWeeks);
    setDaysPregnant(displayDays);
    setDaysToGo(daysRemaining);
    
    // Get the current fruit emoji and name directly from our mapping
    const currentFruitInfo = fruitEmojis[displayWeeks] || getFruitForWeek(displayWeeks);
    setCurrentFruit(currentFruitInfo);
    
    // Get baby size comparison - use the week number that's within valid range for display
    // Cap at 42 weeks maximum
    const weekInfo = Math.min(Math.max(displayWeeks, 1), 42);
    
    // Create a consistent baby info object
    setBabyInfo({
      fruit: babySizeData[weekInfo].fruit === "baby" ? "Baby" : babySizeData[weekInfo].fruit,
      length: babySizeData[weekInfo].lengthCm,
      lengthIn: babySizeData[weekInfo].lengthIn,
      weight: babySizeData[weekInfo].weightG,
      weightLb: babySizeData[weekInfo].weightLb
    });
    
    // Calculate progress percentage - cap at 100%
    setProgressPercentage(Math.min((displayWeeks / 40) * 100, 100));
  }, [lastPeriodDate, dueDate, currentTime]);

  return (
    <div className="space-y-6">
      {/* Header with Due Date */}
      <div className="flex justify-between items-center mb-4 px-6 py-4 bg-card rounded-lg shadow-sm">
        <h1 className="text-xl font-semibold text-blue-600 flex items-center gap-2">
          <Baby className="h-5 w-5 text-blue-600" />
          Pregnancy Journey
        </h1>
        {dueDate && (
          <div className="flex items-center gap-2 bg-softpink/20 px-4 py-2 rounded-full">
            <Calendar className="h-4 w-4 text-softpink" />
            <span className="text-sm text-muted-foreground">Due Date:</span>
            <span className="font-bold text-softpink">{format(dueDate, 'MMMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {/* Week Circle and Stats */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <svg className="w-40 h-40" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#f1f1f1" 
                strokeWidth="6"
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#ff7eb6" 
                strokeWidth="6" 
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - (282.7 * progressPercentage / 100)}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold">{weeksPregnant}</div>
              <div className="text-sm text-gray-500">weeks</div>
              <div className="text-sm">+ {daysPregnant} days</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            <Card className="bg-gray-50">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-500">Trimester</div>
                <div className="text-xl font-bold">{weeksPregnant <= 12 ? "First" : weeksPregnant <= 28 ? "Second" : "Third"}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-500">{weeksPregnant >= 40 ? "Days Completed" : "Days to go"}</div>
                <div className="text-xl font-bold">
                  {weeksPregnant >= 40 ? 0 : Math.abs(daysToGo)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-500">Progress</div>
                <div className="text-xl font-bold">{Math.round(progressPercentage)}%</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Baby Development Card */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-softpink" />
                Baby Development
              </div>
              <Badge variant="outline" className="font-normal">Week {weeksPregnant}</Badge>
            </CardTitle>
            <CardDescription>
              Details about your baby's growth
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-softpink/10 rounded-full p-4">
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <span role="img" aria-label="baby size" className="text-2xl">{currentFruit.emoji}</span>
                </motion.div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {currentFruit.name.toLowerCase() === "baby" 
                    ? "Your baby is ready for birth" 
                    : "Your baby is about the size of"}
                </div>
                <div className="font-semibold">
                  {currentFruit.name.toLowerCase() === "baby" 
                    ? "Congratulations!" 
                    : currentFruit.name}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Length (head to toe)</div>
                <div className="font-semibold">
                  {babyInfo.length}
                  <span className="ml-1 text-xs text-muted-foreground">({babyInfo.lengthIn})</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Weight</div>
                <div className="font-semibold">
                  {babyInfo.weight}
                  <span className="ml-1 text-xs text-muted-foreground">({babyInfo.weightLb})</span>
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Development information is based on averages for week {weeksPregnant}
            </div>
          </CardContent>
        </Card>

        {/* Trimester Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {weeksPregnant <= 12 
                ? "First Trimester Overview" 
                : weeksPregnant <= 28 
                  ? "Second Trimester Overview" 
                  : weeksPregnant <= 40 
                    ? "Third Trimester Overview" 
                    : "Final Stage"}
            </CardTitle>
            <CardDescription>
              {weeksPregnant <= 12 
                ? "Weeks 1-12" 
                : weeksPregnant <= 28 
                  ? "Weeks 13-28" 
                  : weeksPregnant <= 40 
                    ? "Weeks 29-40" 
                    : "Week 40+"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 border-b pb-2">
                <div className="font-medium md:col-span-1">Aspect</div>
                <div className="font-medium md:col-span-4">Information</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-1 md:gap-0">
                <div className="text-amber-700 font-medium md:col-span-1">Description</div>
                <div className="md:col-span-4">{getPregnancyDevelopment(weeksPregnant).description}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-1 md:gap-0">
                <div className="text-amber-700 font-medium md:col-span-1">Key Developments</div>
                <div className="md:col-span-4">{getPregnancyDevelopment(weeksPregnant).keyDevelopments}</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-1 md:gap-0">
                <div className="text-amber-700 font-medium md:col-span-1">Current Week</div>
                <div className="md:col-span-4">{weeksPregnant} of 40</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
