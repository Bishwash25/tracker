import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

export default function PeriodDosAndDonts() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Period Do's & Don'ts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Do's Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Do's
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                  <span>Change pads/tampons every 4-6 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                  <span>Stay hydrated and eat nutritious foods</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                  <span>Exercise moderately if you feel up to it</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                  <span>Use a heating pad for cramps</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                  <span>Keep track of your cycle</span>
                </li>
              </ul>
            </div>

            {/* Don'ts Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                Don'ts
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-1 text-red-600" />
                  <span>Skip meals or dehydrate yourself</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-1 text-red-600" />
                  <span>Use scented products</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-1 text-red-600" />
                  <span>Wear tight, uncomfortable clothing</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-1 text-red-600" />
                  <span>Ignore unusual symptoms</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 mt-1 text-red-600" />
                  <span>Use expired menstrual products</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 