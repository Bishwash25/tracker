import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommonConditions() {
  const conditions = [
    {
      name: "PCOS (Polycystic Ovary Syndrome)",
      description: "A hormonal disorder causing enlarged ovaries with small cysts. Common symptoms include irregular periods, excess hair growth, acne, and weight gain.",
      symptoms: ["Irregular periods", "Weight gain", "Acne", "Excess hair growth", "Difficulty getting pregnant"],
    },
    {
      name: "Endometriosis",
      description: "A condition where tissue similar to the uterine lining grows outside the uterus, causing pain and potential fertility issues.",
      symptoms: ["Severe menstrual cramps", "Chronic pelvic pain", "Pain during intercourse", "Heavy periods", "Fatigue"],
    },
    {
      name: "PMS (Premenstrual Syndrome)",
      description: "A combination of symptoms that many women get about a week or two before their period.",
      symptoms: ["Mood swings", "Breast tenderness", "Food cravings", "Fatigue", "Irritability"],
    },
    {
      name: "Amenorrhea",
      description: "The absence of menstrual periods, either having never started or stopping for several months.",
      symptoms: ["Missed periods", "Headache", "Vision changes", "Milk discharge from breasts", "Excess facial hair"],
    },
  ];

  const bloodColors = [
    {
      color: "Bright Red",
      description: "Fresh blood that's flowing quickly, often seen at the beginning of your period. Usually normal and nothing to worry about.",
      meaning: "Typically indicates fresh, healthy blood flow during the early part of your period.",
      whenToConsult: "If accompanied by heavy clots or if you're soaking through pads/tampons quickly (less than 2 hours), consult a doctor."
    },
    {
      color: "Dark Red/Brown",
      description: "Older blood that has had time to oxidize, commonly seen near the end of your period.",
      meaning: "Normal, especially at the beginning or end of your period. It's simply blood that has taken longer to leave your uterus.",
      whenToConsult: "Generally no cause for concern unless there's a foul smell or unusual consistency."
    },
    {
      color: "Black",
      description: "Very old blood that has had time to oxidize completely.",
      meaning: "Usually normal and occurs most often at the beginning or end of your period when the flow is slower.",
      whenToConsult: "If it has a foul smell or continues for several days, consider speaking with a healthcare provider."
    },
    {
      color: "Pink",
      description: "Blood mixed with cervical fluid or a light flow.",
      meaning: "May indicate low estrogen levels, especially if seen regularly. Sometimes appears during spotting or at the beginning/end of periods.",
      whenToConsult: "If it occurs regularly or is accompanied by other symptoms like fatigue or missed periods."
    },
    {
      color: "Orange",
      description: "Blood mixed with cervical fluid or possibly an infection.",
      meaning: "Sometimes normal if it's just a mixture of blood and cervical fluid, but could indicate an infection.",
      whenToConsult: "If accompanied by unusual odor, itching, or discomfort, as it may indicate an infection."
    },
    {
      color: "Gray",
      description: "Possibly indicating an infection such as bacterial vaginosis.",
      meaning: "Not normal for period blood. Gray discharge or blood is often a sign of infection.",
      whenToConsult: "Should be evaluated by a healthcare provider as soon as possible, especially if accompanied by itching, burning, or foul odor."
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conditions">Common Conditions</TabsTrigger>
          <TabsTrigger value="blood-colors">Period Blood Colors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="conditions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Menstrual Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {conditions.map((condition, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{condition.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <p className="text-muted-foreground">{condition.description}</p>
                        <div>
                          <h4 className="font-semibold mb-2">Common Symptoms:</h4>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {condition.symptoms.map((symptom, idx) => (
                              <li key={idx}>{symptom}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blood-colors" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Understanding Period Blood Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                The color of your menstrual blood can provide insights about your health. Here's what different colors might mean:
              </p>
              <Accordion type="single" collapsible className="w-full">
                {bloodColors.map((item, index) => (
                  <AccordionItem key={index} value={`color-${index}`}>
                    <AccordionTrigger>{item.color}</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div>
                          <h4 className="font-semibold">Description:</h4>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">What it means:</h4>
                          <p className="text-muted-foreground">{item.meaning}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">When to consult a doctor:</h4>
                          <p className="text-muted-foreground">{item.whenToConsult}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <div className="mt-6 p-4 bg-lavender/10 rounded-lg">
                <h4 className="font-semibold mb-2">Important Note:</h4>
                <p className="text-sm text-muted-foreground">
                  While variations in period blood color are usually normal, significant changes in color, smell, or consistency accompanied by other symptoms like severe pain, fever, or unusual bleeding patterns should be discussed with a healthcare provider.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 