import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Share2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GenderPredictionProps {
  onBack: () => void;
}

interface PredictionRecord {
  id: string;
  motherAge: number;
  conceptionMonth: number;
  prediction: string;
  date: string;
}

type ViewMode = "predict" | "records";

export default function GenderPredictor({ onBack }: GenderPredictionProps) {
  const [motherAge, setMotherAge] = useState<number | "">("");
  const [conceptionMonth, setConceptionMonth] = useState<number | "">("");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<PredictionRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("predict");
  const { toast } = useToast();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const predictGender = () => {
    if (typeof motherAge !== 'number' || typeof conceptionMonth !== 'number') {
      toast({
        title: "Missing information",
        description: "Please enter your age and select a conception month",
        variant: "destructive"
      });
      return;
    }
    
    // Gender prediction logic
    const result = (motherAge % 2 === 0 && conceptionMonth % 2 === 0) || 
                  (motherAge % 2 !== 0 && conceptionMonth % 2 !== 0)
                   ? "Predicted Gender: Girl" 
                   : "Predicted Gender: Boy";
    
    setPrediction(result);
  };

  const saveRecord = () => {
    if (!prediction || typeof motherAge !== 'number' || typeof conceptionMonth !== 'number') return;
    
    const newRecord = {
      id: Date.now().toString(),
      motherAge,
      conceptionMonth,
      prediction,
      date: new Date().toLocaleString()
    };
    
    setSavedRecords([newRecord, ...savedRecords]);
    
    toast({
      title: "Record saved",
      description: "Your prediction has been saved",
    });
    
    // Switch to records view after saving
    setViewMode("records");
  };

  const shareRecord = (record: PredictionRecord) => {
    const text = `Based on Chinese Gender Prediction for mother age ${record.motherAge} and conception month ${months[record.conceptionMonth-1]}: ${record.prediction}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Gender Prediction Result',
        text: text,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback to WhatsApp share
      const whatsappText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    }
  };
  
  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "predict": return "Predict your baby gender";
      case "records": return "Records";
      default: return "Baby Gender Predictor";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Baby Gender Predictor</h2>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {getViewTitle()} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => setViewMode("predict")}>
                Predict your baby gender
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("records")}>
                Records
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {viewMode === "predict" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Chinese Gender Prediction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motherAge">Your Age at Conception</Label>
                  <Input 
                    id="motherAge"
                    type="number" 
                    min="18" 
                    max="50"
                    value={motherAge === "" ? "" : motherAge}
                    onChange={(e) => setMotherAge(e.target.value === "" ? "" : parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="conceptionMonth">Conception Month</Label>
                  <Select 
                    onValueChange={(value) => setConceptionMonth(parseInt(value))}
                    value={conceptionMonth === "" ? undefined : conceptionMonth.toString()}
                  >
                    <SelectTrigger id="conceptionMonth">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={predictGender}>Predict Gender</Button>
              {prediction && <Button variant="outline" onClick={saveRecord}>Save Prediction</Button>}
            </CardFooter>
          </Card>
          
          {prediction && (
            <Card className="bg-lavender/10 border-lavender/20">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">{prediction}</h3>
                <p className="text-sm text-muted-foreground">
                  This prediction is based on the Chinese Gender Calendar, which uses the mother's age and conception month.
                  <br />
                  <span className="italic">Remember: This is just for fun and is not scientifically validated.</span>
                </p>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-lg mb-2">About This Tool</h3>
              <p className="text-sm text-muted-foreground">
                The Chinese Gender Prediction method is a traditional technique that claims to predict a baby's gender
                based on the mother's age at conception and the month of conception. While many find it entertaining,
                it has no scientific basis and accuracy is around 50% (same as a random guess).
                <br /><br />
                For accurate gender determination, please consult your healthcare provider about medical options like
                ultrasound or genetic testing.
              </p>
            </CardContent>
          </Card>
        </>
      )}
      
      {viewMode === "records" && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            {savedRecords.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No predictions saved yet</p>
                <Button onClick={() => setViewMode("predict")} variant="outline">
                  Make a Prediction
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedRecords.map(record => (
                  <Card key={record.id}>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{record.prediction}</p>
                          <p className="text-sm text-muted-foreground">
                            Age: {record.motherAge}, Month: {months[record.conceptionMonth-1]}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{record.date}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => shareRecord(record)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
