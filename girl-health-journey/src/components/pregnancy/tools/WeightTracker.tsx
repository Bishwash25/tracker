import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Trash2, BarChart, ChevronDown, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  note: string;
}

type ViewMode = "add" | "records" | "chart";

export default function WeightTracker({ onBack }: { onBack: () => void }) {
  const [weight, setWeight] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("add");
  const { toast } = useToast();

  useEffect(() => {
    const storedRecords = localStorage.getItem("weightRecords");
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  const handleAddRecord = () => {
    if (!weight || isNaN(parseFloat(weight))) {
      toast({
        title: "Error",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    const newRecord: WeightRecord = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      weight: parseFloat(weight),
      note: note,
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    localStorage.setItem("weightRecords", JSON.stringify(updatedRecords));

    setWeight("");
    setNote("");

    toast({
      title: "Success",
      description: "Weight record added successfully",
    });
    
    // Switch to records view after adding
    setViewMode("records");
  };

  const handleDeleteRecord = (id: string) => {
    const updatedRecords = records.filter((record) => record.id !== id);
    setRecords(updatedRecords);
    localStorage.setItem("weightRecords", JSON.stringify(updatedRecords));

    toast({
      title: "Record deleted",
      description: "Weight record removed successfully",
    });
  };

  const handleDownloadRecords = () => {
    if (records.length === 0) {
      toast({
        title: "No records to download",
        description: "Add some weight records first",
        variant: "destructive",
      });
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Download failed",
        description: "Please allow popups to download your records",
        variant: "destructive",
      });
      return;
    }

    // Create HTML content for the PDF
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Weight Records</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              color: #7e69ab;
              text-align: center;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .date {
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Weight Records</h1>
            <div class="date">Generated on: ${format(new Date(), "MMMM d, yyyy")}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              ${sortedRecords.map(record => `
                <tr>
                  <td>${format(new Date(record.date), "MMMM d, yyyy")}</td>
                  <td>${record.weight}</td>
                  <td>${record.note || "-"}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write the HTML content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
      printWindow.print();
      printWindow.close();
    };

    toast({
      title: "Download started",
      description: "Your weight records are being prepared for download",
    });
  };

  const chartData = records
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => ({
      date: format(new Date(record.date), "MMM d"),
      weight: record.weight
    }));

  const getBarColor = (index: number) => {
    const colors = ["#ff7eb6", "#7e69ab", "#6e59a5", "#fec6a1", "#d3e4fd"];
    return colors[index % colors.length];
  };

  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "add": return "Add New Weight Record";
      case "records": return "Weight Record";
      case "chart": return "Weight Chart";
      default: return "Weight Tracker";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Weight Tracker</h1>
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
                Add New Weight Record
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("records")}>
                Weight Record
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode("chart")}>
                Weight Chart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {viewMode === "add" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add New Weight Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg/lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
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
                  placeholder="Any comments about this measurement"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <Button onClick={handleAddRecord} className="w-full mt-2 bg-softpink hover:bg-softpink/90">
                <Plus className="h-4 w-4 mr-2" /> Add Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "records" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Weight History</CardTitle>
            {records.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadRecords}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No weight records yet</p>
                <Button onClick={() => setViewMode("add")} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Record
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{record.weight}</TableCell>
                        <TableCell>{record.note || "-"}</TableCell>
                        <TableCell className="flex space-x-2">
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
            <CardTitle className="text-lg">Weight Trend Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No weight records to display in chart</p>
                <Button onClick={() => setViewMode("add")} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Record
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60} 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="weight" name="Weight" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(index)} />
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
