import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Scale, 
  Activity, 
  Footprints, 
  Timer, 
  Calculator, 
  Smile, 
  Baby,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart,
  History,
  CalendarDays,
  LineChart,
  Dumbbell,
  SmilePlus,
  FileText,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";

// Types for the records
interface BaseRecord {
  id: string;
  date: string | Date;
}

interface WeightRecord extends BaseRecord {
  weight: number;
  weightUnit: string;
  notes?: string;
}

interface BMIRecord extends BaseRecord {
  height: number;
  heightUnit: string;
  weight: number;
  weightUnit: string;
  bmi: number;
  category: string;
}

interface ExerciseRecord extends BaseRecord {
  type: string;
  duration: number;
  intensity: string;
  notes?: string;
}

interface KickRecord extends BaseRecord {
  count: number;
  duration: number;
  notes?: string;
}

interface ContractionRecord extends BaseRecord {
  startTime: string;
  endTime: string;
  duration: number;
  interval?: number;
  intensity: string;
  notes?: string;
}

interface MoodRecord extends BaseRecord {
  [key: string]: any; // For dynamic mood parameters
}

interface GenderPredictionRecord extends BaseRecord {
  maternalAge: number;
  conceptionMonth: number;
  prediction: string;
}

// Component to display a history item of any type
function HistoryItem({ item, onDelete }: { item: { record: any; type: string; date: Date }, onDelete: (id: string, type: string) => void }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const getIcon = () => {
    switch (item.type) {
      case "weight":
        return <Scale className="h-5 w-5 text-softpink" />;
      case "bmi":
        return <Calculator className="h-5 w-5 text-calmteal" />;
      case "exercise":
        return <Activity className="h-5 w-5 text-lavender" />;
      case "kick":
        return <Footprints className="h-5 w-5 text-calmteal" />;
      case "contraction":
        return <Timer className="h-5 w-5 text-softpink" />;
      case "mood":
        return <Smile className="h-5 w-5 text-softpink" />;
      case "gender":
        return <Baby className="h-5 w-5 text-calmteal" />;
      default:
        return <History className="h-5 w-5" />;
    }
  };

  const getBadge = () => {
    switch (item.type) {
      case "weight":
        return (
          <Badge variant="outline" className="bg-softpink/10 text-softpink">
            Weight
          </Badge>
        );
      case "bmi":
        return (
          <Badge variant="outline" className="bg-calmteal/10 text-calmteal">
            BMI
          </Badge>
        );
      case "exercise":
        return (
          <Badge variant="outline" className="bg-lavender/10 text-lavender">
            Exercise
          </Badge>
        );
      case "kick":
        return (
          <Badge variant="outline" className="bg-calmteal/10 text-calmteal">
            Kicks
          </Badge>
        );
      case "contraction":
        return (
          <Badge variant="outline" className="bg-softpink/10 text-softpink">
            Contractions
          </Badge>
        );
      case "mood":
        return (
          <Badge variant="outline" className="bg-softpink/10 text-softpink">
            Mood
          </Badge>
        );
      case "gender":
        return (
          <Badge variant="outline" className="bg-calmteal/10 text-calmteal">
            Gender
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Record
          </Badge>
        );
    }
  };

  const renderDetails = () => {
    switch (item.type) {
      case "weight":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Weight:</span>
              <span>{item.record.weight} {item.record.weightUnit}</span>
            </div>
            {item.record.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="text-muted-foreground">{item.record.notes}</p>
              </div>
            )}
          </div>
        );
      
      case "bmi":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">BMI:</span>
              <span>{item.record.bmi?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Category:</span>
              <span>{item.record.category}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Height:</span>
              <span>{item.record.height} {item.record.heightUnit}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Weight:</span>
              <span>{item.record.weight} {item.record.weightUnit}</span>
            </div>
          </div>
        );
      
      case "exercise":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Type:</span>
              <span>{item.record.type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Duration:</span>
              <span>{item.record.duration} minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Intensity:</span>
              <span>{item.record.intensity}</span>
            </div>
            {item.record.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="text-muted-foreground">{item.record.notes}</p>
              </div>
            )}
          </div>
        );
      
      case "kick":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Kick Count:</span>
              <span>{item.record.kickCount || item.record.count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Duration:</span>
              <span>{item.record.duration} minutes</span>
            </div>
          </div>
        );
      
      case "contraction":
        return (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Contractions:</span>
              <span>{item.record.contractions?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Average Duration:</span>
              <span>{item.record.averageDuration || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Average Interval:</span>
              <span>{item.record.averageInterval || "N/A"}</span>
            </div>
          </div>
        );
      
      case "mood":
        return (
          <div className="space-y-2">
            {/* Mood parameters with intensity */}
            {Object.entries(item.record)
              .filter(([key, value]) => 
                typeof value === 'number' && 
                key !== 'date' && 
                key !== 'id' &&
                value > 0
              )
              .map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span>{String(value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-softpink h-2 rounded-full" 
                      style={{ width: `${Number(value)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            }
            
            {/* Other mood if present */}
            {item.record.other_mood_description && (
              <div>
                <span className="font-medium">Other:</span>
                <p className="text-muted-foreground">{item.record.other_mood_description}</p>
              </div>
            )}
            
            {item.record.notes && (
              <div>
                <span className="font-medium">Notes:</span>
                <p className="text-muted-foreground">{item.record.notes}</p>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div>No detailed information available</div>
        );
    }
  };

  return (
    <Card className="overflow-hidden mb-4">
      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getIcon()}
              {getBadge()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {format(new Date(item.date), "MMMM d, yyyy")}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Record</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this {item.type} record? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(item.record.id, item.type)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full mt-2 flex items-center justify-center">
              {showDetails ? (
                <>Show less <ChevronUp className="ml-2 h-4 w-4" /></>
              ) : (
                <>View details <ChevronDown className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {renderDetails()}
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

export default function PregnancyHistory() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("all");
  const [allRecords, setAllRecords] = useState<{ record: any; type: string; date: Date }[]>([]);

  // Load all data on component mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = () => {
    // Weight records
    const weightRecords = JSON.parse(localStorage.getItem("weightRecords") || "[]");
    const weightData = weightRecords.map((record: any) => ({
      record,
      type: "weight",
      date: new Date(record.date)
    }));
    
    // BMI records
    const bmiRecords = JSON.parse(localStorage.getItem("pregnancyBMIRecords") || "[]");
    const bmiData = bmiRecords.map((record: any) => ({
      record,
      type: "bmi",
      date: new Date(record.date)
    }));

    // Exercise records
    const exerciseRecords = JSON.parse(localStorage.getItem("exerciseRecords") || "[]");
    const exerciseData = exerciseRecords.map((record: any) => ({
      record,
      type: "exercise",
      date: new Date(record.date)
    }));

    // Kick counter records
    const kickRecords = JSON.parse(localStorage.getItem("kickSessions") || "[]");
    const kickData = kickRecords.map((record: any) => ({
      record,
      type: "kick",
      date: new Date(record.date)
    }));

    // Contraction records
    const contractionRecords = JSON.parse(localStorage.getItem("contractionSessions") || "[]");
    const contractionData = contractionRecords.map((record: any) => ({
      record,
      type: "contraction",
      date: new Date(record.date)
    }));

    // Mood records
    const moodRecords = JSON.parse(localStorage.getItem("pregnancyMoodTracking") || "[]");
    const moodData = moodRecords.map((record: any) => ({
      record,
      type: "mood",
      date: new Date(record.date)
    }));

    // Combine all records
    const combined = [
      ...weightData,
      ...bmiData,
      ...exerciseData,
      ...kickData,
      ...contractionData,
      ...moodData
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date (newest first)

    setAllRecords(combined);
  };

  // Add delete record functionality
  const handleDeleteRecord = (id: string, type: string) => {
    // Remove from state first for immediate UI update
    const updatedRecords = allRecords.filter(record => 
      !(record.type === type && record.record.id === id)
    );
    setAllRecords(updatedRecords);
    
    // Update localStorage based on record type
    try {
      let storageKey = "";
      switch (type) {
        case "weight":
          storageKey = "weightRecords";
          break;
        case "bmi":
          storageKey = "pregnancyBMIRecords";
          break;
        case "exercise":
          storageKey = "exerciseRecords";
          break;
        case "kick":
          storageKey = "kickSessions";
          break;
        case "contraction":
          storageKey = "contractionSessions";
          break;
        case "mood":
          storageKey = "pregnancyMoodTracking";
          break;
        default:
          console.error(`Unknown record type: ${type}`);
          return;
      }
      
      // Get current records from storage
      const currentRecords = JSON.parse(localStorage.getItem(storageKey) || "[]");
      // Filter out the deleted record
      const updatedStorageRecords = currentRecords.filter((record: any) => record.id !== id);
      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedStorageRecords));
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} record deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type} record:`, error);
      toast.error(`Failed to delete ${type} record. Please try again.`);
      // Reload records to restore state
      loadRecords();
    }
  };

  // Filter records based on active tab
  const filteredRecords = activeTab === "all"
    ? allRecords
    : allRecords.filter(item => item.type === activeTab);

  // Group records by date for timeline view
  const groupedByDate = filteredRecords.reduce((groups, item) => {
    const date = format(item.date, "MMMM d, yyyy");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {} as { [key: string]: typeof filteredRecords });

  // Define the options
  const options = [
    { value: "all", label: "All Records", icon: <CalendarDays className="mr-2 h-4 w-4" /> },
    { value: "weight", label: "Weight", icon: <Scale className="mr-2 h-4 w-4" /> },
    { value: "bmi", label: "BMI", icon: <LineChart className="mr-2 h-4 w-4" /> },
    { value: "exercise", label: "Exercise", icon: <Dumbbell className="mr-2 h-4 w-4" /> },
    { value: "kick", label: "Kick Count", icon: <Footprints className="mr-2 h-4 w-4" /> },
    { value: "contraction", label: "Contractions", icon: <Timer className="mr-2 h-4 w-4" /> },
    { value: "mood", label: "Mood", icon: <SmilePlus className="mr-2 h-4 w-4" /> }
  ];

  // Add download functionality
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Add title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Pregnancy Health History', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Add current date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd')}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Create sections for each record type if they exist
      const recordTypes = [
        { type: "weight", title: "Weight Records", records: allRecords.filter(r => r.type === "weight") },
        { type: "bmi", title: "BMI Records", records: allRecords.filter(r => r.type === "bmi") },
        { type: "exercise", title: "Exercise Records", records: allRecords.filter(r => r.type === "exercise") },
        { type: "kick", title: "Kick Count Records", records: allRecords.filter(r => r.type === "kick") },
        { type: "contraction", title: "Contraction Records", records: allRecords.filter(r => r.type === "contraction") },
        { type: "mood", title: "Mood Records", records: allRecords.filter(r => r.type === "mood") }
      ];

      // Loop through each record type and add to PDF
      recordTypes.forEach(({ title, records }) => {
        if (records.length === 0) return;

        // Add a new page if we're running out of space
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        // Add separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        // Add section title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPos);
        yPos += 10;

        // Sort records by date
        const sortedRecords = [...records].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Add each record
        sortedRecords.forEach(item => {
          if (yPos > 260) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(`Date: ${format(new Date(item.date), 'yyyy-MM-dd')}`, margin, yPos);
          yPos += 7;

          doc.setFont('helvetica', 'normal');
          
          // Add relevant details based on record type
          switch (item.type) {
            case "weight":
              doc.text(`Weight: ${item.record.weight} ${item.record.weightUnit}`, margin, yPos);
              yPos += 7;
              break;
            case "bmi":
              doc.text(`BMI: ${item.record.bmi?.toFixed(1)}`, margin, yPos);
              yPos += 7;
              doc.text(`Category: ${item.record.category}`, margin, yPos);
              yPos += 7;
              break;
            case "exercise":
              doc.text(`Type: ${item.record.type}`, margin, yPos);
              yPos += 7;
              doc.text(`Duration: ${item.record.duration} minutes`, margin, yPos);
              yPos += 7;
              doc.text(`Intensity: ${item.record.intensity}`, margin, yPos);
              yPos += 7;
              break;
            case "kick":
              doc.text(`Kick Count: ${item.record.kickCount || item.record.count}`, margin, yPos);
              yPos += 7;
              doc.text(`Duration: ${item.record.duration} minutes`, margin, yPos);
              yPos += 7;
              break;
            case "contraction":
              doc.text(`Contractions: ${item.record.contractions?.length || 0}`, margin, yPos);
              yPos += 7;
              doc.text(`Average Duration: ${item.record.averageDuration || "N/A"}`, margin, yPos);
              yPos += 7;
              doc.text(`Average Interval: ${item.record.averageInterval || "N/A"}`, margin, yPos);
              yPos += 7;
              
              // Add individual contraction details if available
              if (item.record.contractions && item.record.contractions.length > 0) {
                doc.text(`Contraction Details:`, margin, yPos);
                yPos += 7;
                
                item.record.contractions.forEach((contraction, idx) => {
                  if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                  }
                  doc.text(`#${idx+1}: Duration - ${contraction.duration}, Interval - ${contraction.interval}`, margin, yPos);
                  yPos += 5;
                });
                yPos += 2;
              }
              break;
            case "mood":
              Object.entries(item.record)
                .filter(([key, value]) => 
                  typeof value === 'number' && 
                  key !== 'id' &&
                  value > 0
                )
                .forEach(([key, value]) => {
                  if (yPos > 270) {
                    doc.addPage();
                    yPos = 20;
                  }
                  doc.text(`${key.replace(/([A-Z])/g, ' $1').trim()}: ${value}/100`, margin, yPos);
                  yPos += 7;
                });
              break;
          }

          // Add notes if present
          if (item.record.notes) {
            if (yPos > 260) {
              doc.addPage();
              yPos = 20;
            }
            doc.text('Notes:', margin, yPos);
            yPos += 5;
            
            const noteLines = doc.splitTextToSize(item.record.notes, pageWidth - (margin * 2));
            for (let i = 0; i < noteLines.length; i++) {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(noteLines[i], margin, yPos);
              yPos += 5;
            }
          }
          
          yPos += 10;
        });
      });

      // Save the PDF
      const fileName = `pregnancy-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      toast.success("PDF Downloaded", {
        description: `Your pregnancy health history has been saved as ${fileName}`
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Pregnancy Health Records</h1>
          <p className="text-muted-foreground">View all your pregnancy health tracking data in one place</p>
        </div>
        
        <div>
          <Button 
            onClick={handleDownloadPDF}
            variant="default" 
            className="gap-2"
            disabled={allRecords.length === 0}
          >
            <FileText className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="w-full">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center">
                  {option.icon}
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-6">
          {filteredRecords.length > 0 ? (
            <ScrollArea className={`${isMobile ? "h-[70vh]" : "h-[65vh]"} pr-4`}>
              {Object.entries(groupedByDate).map(([date, items]) => (
                <div key={date} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{date}</h3>
                  </div>
                  
                  {items.map((item) => (
                    <HistoryItem 
                      key={`${item.type}-${item.record.id}`} 
                      item={item} 
                      onDelete={handleDeleteRecord}
                    />
                  ))}
                  
                  {date !== Object.keys(groupedByDate).pop() && <Separator className="my-6" />}
                </div>
              ))}
            </ScrollArea>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No {activeTab === 'all' ? 'records' : `${activeTab} records`} found.</p>
                <p className="text-sm mt-2">
                  {activeTab === 'all' 
                    ? 'Start using the tracking tools to build your health history.' 
                    : `Use the ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tool to add data.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 