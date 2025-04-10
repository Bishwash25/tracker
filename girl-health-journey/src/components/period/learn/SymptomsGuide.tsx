import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function SymptomsGuide() {
  const normalSymptoms = [
    "Mild to moderate cramps",
    "Breast tenderness",
    "Mood changes",
    "Bloating",
    "Fatigue",
    "Headaches",
    "Food cravings",
  ];

  const warningSymptoms = [
    {
      symptom: "Extremely heavy bleeding",
      description: "Soaking through a pad/tampon every hour for several hours",
    },
    {
      symptom: "Severe pain",
      description: "Pain that interferes with daily activities or isn't relieved by medication",
    },
    {
      symptom: "Irregular periods",
      description: "Consistently missing periods or highly irregular cycle lengths",
    },
    {
      symptom: "Unusual discharge or odor",
      description: "Changes in color, consistency, or strong unusual odors",
    },
    {
      symptom: "Post-menopausal bleeding",
      description: "Any bleeding after menopause has occurred",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Symptoms Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Normal Symptoms Section */}
          <section>
            <h3 className="font-semibold mb-3">Normal Period Symptoms</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {normalSymptoms.map((symptom, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  {symptom}
                </div>
              ))}
            </div>
          </section>

          {/* Warning Signs Section */}
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              When to Seek Medical Attention
            </h3>
            <div className="space-y-4">
              {warningSymptoms.map((item, index) => (
                <div key={index} className="border-l-4 border-red-600 pl-4">
                  <h4 className="font-semibold">{item.symptom}</h4>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
} 