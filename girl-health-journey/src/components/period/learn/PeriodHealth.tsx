import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PeriodHealth() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Understanding Your Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <section>
              <h3 className="font-semibold mb-2">What is Menstruation?</h3>
              <p className="text-muted-foreground">
                Menstruation is a natural monthly process where the uterus sheds its lining, resulting in bleeding that typically lasts 3-7 days.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">The Menstrual Cycle</h3>
              <p className="text-muted-foreground">
                A typical menstrual cycle lasts 28 days but can range from 21-35 days. It consists of several phases: menstrual, follicular, ovulation, and luteal phase.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Maintaining Period Health</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Stay hydrated and maintain a balanced diet</li>
                <li>Exercise regularly</li>
                <li>Practice good hygiene</li>
                <li>Get adequate rest</li>
                <li>Manage stress levels</li>
              </ul>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 