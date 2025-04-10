import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Trash2, BarChart, ChevronDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";

interface ExerciseRecord {
  id: string;
  date: string;
  type: string;
  duration: number;
  intensity: string;
  note: string;
}

type ViewMode = "add" | "records" | "chart";

const exerciseTypes = [
  "Walking",
  "Swimming",
  "Prenatal Yoga",
  "Stationary Cycling",
  "Light Strength Training",
  "Stretching",
  "Pelvic Floor Exercises",
  "Other"
];

const intensityLevels = ["Low", "Moderate", "High"];

export default function ExerciseLog({ onBack }: { onBack: () => void }) {
  const [exerciseType, setExerciseType] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [intensity, setIntensity] = useState<string>("Low");
  const [note, setNote] = useState<string>("");
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("add");
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage
    const storedRecords = localStorage.getItem("exerciseRecords");
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  const handleAddRecord = () => {
    if (!exerciseType) {
      toast({
        title: "Error",
        description: "Please select an exercise type",
        variant: "destructive",
      });
      return;
    }

    if (!duration || isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid duration",
        variant: "destructive",
      });
      return;
    }

    const newRecord: ExerciseRecord = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      type: exerciseType,
      duration: parseFloat(duration),
      intensity: intensity,
      note: note,
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem("exerciseRecords", JSON.stringify(updatedRecords));

    setExerciseType("");
    setDuration("");
    setIntensity("Low");
    setNote("");

    toast({
      title: "Success",
      description: "Exercise record added successfully",
    });
    
    // Switch to records view after adding
    setViewMode("records");
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter((record) => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem("exerciseRecords", JSON.stringify(updatedRecords));

    toast({
      title: "Record deleted",
      description: "Exercise record removed successfully",
    });
  };

  // Prepare data for chart - group exercises by type
  const prepareChartData = () => {
    const exerciseMap = new Map<string, number>();
    
    records.forEach(record => {
      const current = exerciseMap.get(record.type) || 0;
      exerciseMap.set(record.type, current + record.duration);
    });
    
    return Array.from(exerciseMap, ([type, duration]) => ({ type, duration }));
  };

  const chartData = prepareChartData();

  // Custom colors for chart
  const COLORS = ['#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#33C3F0', '#0FA0CE'];
  
  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "add": return "Add New Exercise";
      case "records": return "Records";
      case "chart": return "Charts";
      default: return "Exercise Log";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Exercise Log</h1>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {getViewTitle()} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => setViewMode("add")}>
                Add New Exercise
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("records")}>
                Records
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("chart")}>
                Charts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === "add" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Exercise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exerciseType">Exercise Type</Label>
                  <Select value={exerciseType} onValueChange={setExerciseType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exercise type" />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="intensity">Intensity</Label>
                  <Select value={intensity} onValueChange={setIntensity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      {intensityLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="text"
                    value={format(new Date(), "MMMM d, yyyy")}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  placeholder="How did you feel during/after this exercise?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button onClick={handleAddRecord} className="w-full mt-2 bg-lavender hover:bg-lavender/90">
                <Plus className="h-4 w-4 mr-2" /> Add Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "records" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exercise History</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No exercise records yet</p>
                <Button onClick={() => setViewMode("add")} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Exercise
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Intensity</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{record.type}</TableCell>
                        <TableCell>{record.duration} min</TableCell>
                        <TableCell>{record.intensity}</TableCell>
                        <TableCell>{record.note || "-"}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
      
      {viewMode === "chart" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exercise Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No exercise records to display</p>
                <Button onClick={() => setViewMode("add")} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Exercise
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} minutes`, 'Duration']} />
                  <Legend />
                  <Bar dataKey="duration" name="Total Duration" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
