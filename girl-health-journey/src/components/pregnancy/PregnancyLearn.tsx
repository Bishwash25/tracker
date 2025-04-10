import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Info, XCircle, AlertCircle, Utensils, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PregnancyLearn() {
  const [selectedTab, setSelectedTab] = useState("first");
  const [openDiseaseId, setOpenDiseaseId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(() => {
    const pregnancyInfo = localStorage.getItem('pregnancyInfo');
    if (pregnancyInfo) {
      const { dueDate } = JSON.parse(pregnancyInfo);
      if (dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const pregnancyStart = new Date(due);
        pregnancyStart.setDate(pregnancyStart.getDate() - 280); // 40 weeks back
        
        const diffTime = Math.abs(today.getTime() - pregnancyStart.getTime());
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        return diffWeeks;
      }
    }
    return 20;
  });

  const toggleDisease = (id: string) => {
    setOpenDiseaseId(openDiseaseId === id ? null : id);
  };

  const getNutritionTips = () => {
    if (1 <= currentWeek && currentWeek <= 12) {
      return {
        "Hydration": "Drink at least 8-10 glasses of water daily to stay hydrated and support amniotic fluid levels.",
        "Essential Nutrients": "Folic acid (leafy greens, fortified cereals), Vitamin B6 (bananas, nuts), Iron (lean meats, spinach).",
        "Small and Frequent Meals": "Eat small meals every 2-3 hours to manage nausea and morning sickness.",
        "Foods to Avoid": "Raw seafood, unpasteurized dairy, high-mercury fish (shark, swordfish), processed meats, excessive caffeine.",
        "Exercises": "Walking, prenatal yoga, deep breathing exercises, light stretching (avoid strenuous workouts)."
      };
    } else if (13 <= currentWeek && currentWeek <= 27) {
      return {
        "Hydration": "Increase fluid intake, include natural fruit juices and coconut water for electrolytes.",
        "Essential Nutrients": "Calcium (milk, yogurt), Vitamin D (sunlight, fortified foods), Omega-3s (salmon, walnuts), Protein (chicken, lentils).",
        "Small and Frequent Meals": "Maintain balanced meals to support baby's growth and prevent heartburn.",
        "Foods to Avoid": "Overly spicy foods, raw eggs, excessive sugar, artificial sweeteners.",
        "Exercises": "Swimming, stationary cycling, moderate strength training, prenatal pilates, pelvic floor exercises (Kegels)."
      };
    } else if (28 <= currentWeek && currentWeek <= 40) {
      return {
        "Hydration": "Stay hydrated to reduce swelling and constipation. Herbal teas (ginger, peppermint) can help digestion.",
        "Essential Nutrients": "Iron (red meat, legumes), Fiber (whole grains, fruits), Healthy Fats (avocado, nuts).",
        "Small and Frequent Meals": "Eat fiber-rich meals and avoid heavy, greasy foods to prevent bloating and reflux.",
        "Foods to Avoid": "Too much salt (causes water retention), fried foods, carbonated drinks, undercooked meats.",
        "Exercises": "Gentle stretching, prenatal yoga, deep squats, walking, cat-cow stretch for back relief."
      };
    } else {
      return {
        "Hydration": "Maintain 8–10 glasses of water daily. Hydration helps with uterine tone and reduces fatigue.",
        "Essential Nutrients": "• Magnesium: pumpkin seeds, almonds (supports muscle function)\n• Potassium: bananas, sweet potatoes (prevents cramps)\n• Iron & Vitamin C combo: beans + citrus fruits (boost energy, blood supply)",
        "Meal Strategy": "Light, frequent meals with emphasis on energy-boosting foods. Include smoothies, soups, and fiber to ease digestion.",
        "Foods to Avoid": "Greasy, fried, and overly processed foods that slow digestion. Avoid laxatives unless advised by doctor.",
        "Recommended Exercises": "Gentle walking to encourage natural labor onset, pelvic tilts, deep breathing. Avoid lying flat for long periods.",
        "Lifestyle Tips": "• Practice relaxation techniques: meditation, warm baths, gentle music\n• Stay mentally active with light reading or social interaction\n• Frequent fetal movement monitoring and regular prenatal check-ups",
        "Medical Advisory": "Discuss labor induction options with your healthcare provider. Weekly fetal monitoring and ultrasounds may be recommended."
      };
    }
  };

  const nutritionTips = getNutritionTips();
  const nutritionWeekRange = () => {
    if (1 <= currentWeek && currentWeek <= 12) {
      return "First Trimester (Weeks 1-12)";
    } else if (13 <= currentWeek && currentWeek <= 27) {
      return "Second Trimester (Weeks 13-27)";
    } else if (28 <= currentWeek && currentWeek <= 40) {
      return "Third Trimester (Weeks 28-40)";
    } else {
      return "Post-Term (Week 40+)";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Pregnancy Education</h1>
        <p className="text-muted-foreground">Learn about each trimester of your pregnancy journey</p>
      </div>
      
      <div className="w-full mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full md:w-[200px] justify-between">
              {selectedTab === "first" ? "First Trimester" : 
               selectedTab === "second" ? "Second Trimester" : "Third Trimester"} 
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[160px]">
            <DropdownMenuItem onClick={() => setSelectedTab("first")}>
              First Trimester
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTab("second")}>
              Second Trimester
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedTab("third")}>
              Third Trimester
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedTab === "first" && (
        <div className="space-y-6">
          <TrimersterOverview 
            title="First Trimester (Weeks 1-12)"
            description="The first trimester is a time of rapid development for your baby and significant changes for your body."
            keyDevelopments={[
              "Your baby's heart, brain, and spinal cord begin to develop",
              "Fingers, toes, and facial features form",
              "By week 10, all essential organs have begun to develop",
              "Your baby is about the size of a lime by the end of this trimester"
            ]}
            motherChanges={[
              "Morning sickness may begin around week 6",
              "Extreme fatigue is common",
              "Breast tenderness and sensitivity",
              "Frequent urination as the uterus grows"
            ]}
          />
          
          <RecommendationsCard 
            trimester="first"
            dos={[
              "Take a prenatal vitamin with folic acid",
              "Get plenty of rest when tired",
              "Stay hydrated with water",
              "Eat small, frequent meals to combat nausea",
              "Begin prenatal care and regular check-ups"
            ]}
            donts={[
              "Smoke, drink alcohol, or use recreational drugs",
              "Eat raw or undercooked meat, fish, or eggs",
              "Clean cat litter boxes (risk of toxoplasmosis)",
              "Take any medications without consulting your doctor",
              "Consume high-mercury fish (shark, swordfish, king mackerel)"
            ]}
            warningSymptoms={[
              "Severe abdominal pain or cramping",
              "Heavy vaginal bleeding",
              "Severe nausea and vomiting (unable to keep fluids down)",
              "High fever above 101.5°F (38.6°C)",
              "Sudden swelling of face or fingers"
            ]}
          />
        </div>
      )}
      
      {selectedTab === "second" && (
        <div className="space-y-6">
          <TrimersterOverview 
            title="Second Trimester (Weeks 13-26)"
            description="The second trimester is often called the 'golden period' of pregnancy as many early discomforts fade."
            keyDevelopments={[
              "Your baby begins to move and kick (feels like 'flutters')",
              "Gender can usually be determined by ultrasound",
              "Baby's hearing develops and they may respond to your voice",
              "Your baby is about the size of a eggplant by the end of this trimester"
            ]}
            motherChanges={[
              "Morning sickness typically decreases",
              "Energy levels often increase",
              "Noticeable baby bump appears",
              "Possible skin changes (linea nigra, melasma)"
            ]}
          />
          
          <RecommendationsCard 
            trimester="second"
            dos={[
              "Continue taking prenatal vitamins",
              "Stay physically active with doctor-approved exercises",
              "Sleep on your side, preferably the left side to improve circulation",
              "Begin planning for baby's arrival",
              "Stay well-hydrated and eat nutrient-dense foods"
            ]}
            donts={[
              "Lie flat on your back for long periods",
              "Engage in high-impact or contact sports",
              "Lift heavy objects",
              "Consume unpasteurized dairy products",
              "Skip prenatal appointments"
            ]}
            warningSymptoms={[
              "Severe headaches or changes in vision",
              "Sudden swelling in hands, feet, or face",
              "Reduced fetal movement",
              "Vaginal bleeding or fluid leakage",
              "Severe abdominal pain or contractions"
            ]}
          />
        </div>
      )}
      
      {selectedTab === "third" && (
        <div className="space-y-6">
          <TrimersterOverview 
            title="Third Trimester (Weeks 27-40)"
            description="The third trimester prepares your body and baby for birth. Your baby gains weight rapidly during this time."
            keyDevelopments={[
              "Baby opens their eyes and can perceive light",
              "Lungs fully mature in preparation for breathing",
              "Baby settles into a birth position (usually head down)",
              "Brain develops rapidly with significant growth"
            ]}
            motherChanges={[
              "Braxton Hicks contractions may begin",
              "Increased back and pelvic pain",
              "Difficulty sleeping and increased fatigue",
              "Shortness of breath as baby presses on diaphragm"
            ]}
          />
          
          <RecommendationsCard 
            trimester="third"
            dos={[
              "Prepare for labor and delivery (classes, birth plan)",
              "Rest frequently and sleep on your side",
              "Monitor fetal kick counts daily",
              "Keep all prenatal appointments",
              "Pack your hospital bag by week 36"
            ]}
            donts={[
              "Travel far from home after 36 weeks",
              "Ignore signs of preterm labor",
              "Consume excessive caffeine",
              "Wear high heels or unsupportive shoes",
              "Postpone calling your doctor if you're concerned"
            ]}
            warningSymptoms={[
              "Regular contractions before 37 weeks",
              "Sudden severe swelling in face, hands, or feet",
              "Severe headache with vision changes",
              "Decreased fetal movement",
              "Water breaking (clear fluid leakage)"
            ]}
          />
          
          <Card className="border-softpink/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Info className="h-5 w-5 mr-2 text-softpink" />
                Preparing for Labor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">Signs that labor may be approaching:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Lightening: Baby drops lower in your pelvis</li>
                <li>Loss of mucus plug or bloody show</li>
                <li>Ripening of the cervix (your doctor will monitor this)</li>
                <li>Water breaking (may be a gush or slow leak)</li>
                <li>Regular contractions that increase in intensity</li>
              </ul>
              <p className="mt-4 text-sm font-medium">When to call your doctor or go to the hospital:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Contractions 5 minutes apart, lasting 1 minute, for 1 hour (5-1-1 rule)</li>
                <li>Water breaking, even without contractions</li>
                <li>Heavy bleeding (more than spotting)</li>
                <li>Decreased fetal movement</li>
                <li>Severe, constant pain</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
          Common Pregnancy Conditions & When to Seek Help
        </h2>
        <p className="text-muted-foreground mb-4">
          Learn about common conditions that can occur during pregnancy, their symptoms, and when you should contact your healthcare provider.
        </p>
        
        <div className="grid gap-4">
          {pregnancyConditions.map((condition) => (
            <Collapsible
              key={condition.id}
              open={openDiseaseId === condition.id}
              onOpenChange={() => toggleDisease(condition.id)}
              className="border rounded-md overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-between p-4 hover:bg-muted"
                >
                  <div className="flex items-center">
                    <condition.icon className={`h-5 w-5 mr-3 ${condition.iconColor}`} />
                    <span className="font-medium">{condition.name}</span>
                  </div>
                  <span className="text-xs bg-muted rounded-full px-2 py-1">
                    {condition.trimester}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 pb-4">
                <Separator className="my-2" />
                <div className="space-y-3 pt-2">
                  <div>
                    <h4 className="font-medium text-sm">About this condition:</h4>
                    <p className="text-sm text-muted-foreground">{condition.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm">Common symptoms:</h4>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {condition.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm flex items-center text-red-500">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      When to contact your doctor:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-red-500/80">
                      {condition.whenToSeekHelp.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {condition.preventionTips && (
                    <div>
                      <h4 className="font-medium text-sm">Prevention tips:</h4>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        {condition.preventionTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
      
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-2">Important Note</h3>
          <p className="text-sm text-muted-foreground">
            This information is provided for educational purposes only and is not intended to replace 
            medical advice from your healthcare provider. Every pregnancy is unique, and you should 
            discuss any concerns or questions with your doctor or midwife.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

const pregnancyConditions = [
  {
    id: "gestational-diabetes",
    name: "Gestational Diabetes",
    trimester: "Usually diagnosed in 2nd trimester",
    description: "A form of high blood sugar that develops during pregnancy and usually disappears after giving birth. It affects how your cells use sugar (glucose).",
    symptoms: [
      "Increased thirst",
      "Frequent urination",
      "Fatigue",
      "Nausea",
      "Frequent infections",
      "Often no noticeable symptoms (detected through routine screening)"
    ],
    whenToSeekHelp: [
      "If you experience extreme thirst or hunger",
      "If you're urinating more frequently than usual",
      "If you experience blurred vision",
      "If blood sugar readings are outside your target range"
    ],
    preventionTips: [
      "Eat a balanced diet low in simple sugars",
      "Exercise regularly (with doctor's approval)",
      "Maintain a healthy pregnancy weight",
      "Attend all prenatal appointments for screening"
    ],
    icon: AlertCircle,
    iconColor: "text-amber-500"
  },
  {
    id: "preeclampsia",
    name: "Preeclampsia",
    trimester: "Usually after 20 weeks",
    description: "A pregnancy complication characterized by high blood pressure and signs of damage to organ systems, most often the liver and kidneys.",
    symptoms: [
      "High blood pressure",
      "Protein in urine (detected during prenatal visits)",
      "Swelling in face and hands",
      "Severe headaches",
      "Changes in vision, including temporary loss of vision",
      "Upper abdominal pain, usually under ribs on the right side",
      "Nausea or vomiting",
      "Decreased urine output"
    ],
    whenToSeekHelp: [
      "If you experience severe headaches",
      "If you have changes in your vision",
      "If you have severe abdominal pain",
      "If you notice sudden weight gain or significant swelling",
      "EMERGENCY: Seek immediate care if you experience seizures or severe shortness of breath"
    ],
    preventionTips: [
      "Attend all prenatal appointments",
      "Take low-dose aspirin if recommended by your doctor",
      "Manage conditions like chronic hypertension",
      "Stay well-hydrated and maintain a balanced diet"
    ],
    icon: AlertTriangle,
    iconColor: "text-red-500"
  },
  {
    id: "placenta-previa",
    name: "Placenta Previa",
    trimester: "Can be detected at any stage",
    description: "A condition where the placenta covers all or part of the cervix. It can cause severe bleeding during pregnancy and delivery.",
    symptoms: [
      "Sudden, painless vaginal bleeding (can be light to heavy)",
      "Bright red bleeding",
      "Some cases have no symptoms (detected during routine ultrasound)"
    ],
    whenToSeekHelp: [
      "EMERGENCY: Any vaginal bleeding during pregnancy should be reported immediately",
      "If you experience contractions along with bleeding",
      "If you have severe bleeding (soaking through a pad in an hour)"
    ],
    icon: AlertTriangle,
    iconColor: "text-red-500"
  },
  {
    id: "hyperemesis-gravidarum",
    name: "Hyperemesis Gravidarum",
    trimester: "Usually 1st trimester",
    description: "Severe, persistent nausea and vomiting during pregnancy—more extreme than normal morning sickness.",
    symptoms: [
      "Severe nausea and vomiting throughout the day",
      "Inability to keep food or fluids down",
      "Weight loss of more than 5% of pre-pregnancy weight",
      "Dehydration",
      "Electrolyte imbalance",
      "Fatigue and dizziness"
    ],
    whenToSeekHelp: [
      "If you can't keep any food or fluids down for 24 hours",
      "If you're losing weight",
      "If you feel dizzy or faint when standing up",
      "If you notice a decrease in urination",
      "If your vomit contains blood or is greenish (bile)"
    ],
    preventionTips: [
      "Eat small, frequent meals",
      "Avoid trigger smells and foods",
      "Try ginger supplements or acupressure bands (with doctor's approval)",
      "Stay hydrated with small sips of fluid throughout the day"
    ],
    icon: Info,
    iconColor: "text-blue-500"
  },
  {
    id: "gestational-thrombosis",
    name: "Blood Clots (Thrombosis)",
    trimester: "Any trimester, higher risk in 3rd and postpartum",
    description: "Pregnancy increases the risk of developing blood clots in the legs (deep vein thrombosis) or lungs (pulmonary embolism).",
    symptoms: [
      "Swelling, pain, tenderness in one leg",
      "Warm skin and redness in the affected area",
      "For pulmonary embolism: sudden shortness of breath, chest pain, rapid heartbeat, coughing up blood"
    ],
    whenToSeekHelp: [
      "EMERGENCY: Seek immediate medical attention for sudden shortness of breath",
      "If you notice pain, swelling, or redness in one leg",
      "If you experience chest pain or rapid breathing",
      "If you cough up blood"
    ],
    preventionTips: [
      "Stay active with doctor-approved exercises",
      "Avoid sitting or standing for long periods",
      "Wear compression stockings if recommended",
      "Drink plenty of water",
      "Move/flex your legs regularly during long trips"
    ],
    icon: AlertTriangle,
    iconColor: "text-red-500"
  },
  {
    id: "cholestasis",
    name: "Intrahepatic Cholestasis of Pregnancy",
    trimester: "Usually 3rd trimester",
    description: "A liver condition that occurs in late pregnancy and causes intense itching, particularly on the palms and soles.",
    symptoms: [
      "Intense itching, especially on palms and soles",
      "Dark urine",
      "Light-colored stools",
      "Jaundice (yellowing of skin or eyes) in some cases",
      "Fatigue or exhaustion",
      "Loss of appetite"
    ],
    whenToSeekHelp: [
      "If you experience intense itching, especially on palms and soles",
      "If you notice jaundice (yellowing of skin or eyes)",
      "If you have dark urine and light-colored stools"
    ],
    icon: Info,
    iconColor: "text-amber-500"
  },
  {
    id: "group-b-strep",
    name: "Group B Streptococcus (GBS)",
    trimester: "Tested in 3rd trimester",
    description: "A type of bacteria that can be found in the lower genital tract. GBS usually doesn't cause problems in adults but can be serious for newborns if transmitted during birth.",
    symptoms: [
      "Usually no symptoms in the mother",
      "Detected through a routine vaginal and rectal swab test between weeks 35-37"
    ],
    whenToSeekHelp: [
      "No specific symptoms to watch for",
      "Make sure to get tested at weeks 35-37 of pregnancy",
      "If you've had a baby previously affected by GBS, inform your healthcare provider"
    ],
    preventionTips: [
      "Complete GBS testing during pregnancy",
      "If positive, receive antibiotics during labor",
      "Inform all medical staff about your GBS status when you go into labor"
    ],
    icon: Info,
    iconColor: "text-blue-500"
  }
];

interface TrimersterOverviewProps {
  title: string;
  description: string;
  keyDevelopments: string[];
  motherChanges: string[];
}

function TrimersterOverview({ title, description, keyDevelopments, motherChanges }: TrimersterOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-3">Baby's Development</h3>
          <ul className="space-y-2">
            {keyDevelopments.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-3">Changes for Mom</h3>
          <ul className="space-y-2">
            {motherChanges.map((item, index) => (
              <li key={index} className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecommendationsCardProps {
  trimester: string;
  dos: string[];
  donts: string[];
  warningSymptoms: string[];
}

function RecommendationsCard({ trimester, dos, donts, warningSymptoms }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            What to Do
          </h3>
          <ul className="space-y-2">
            {dos.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            What to Avoid
          </h3>
          <ul className="space-y-2">
            {donts.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Warning Signs
          </h3>
          <ul className="space-y-2">
            {warningSymptoms.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-500 mr-2">•</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium text-red-500">
            Contact your healthcare provider immediately if you experience any of these symptoms.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
