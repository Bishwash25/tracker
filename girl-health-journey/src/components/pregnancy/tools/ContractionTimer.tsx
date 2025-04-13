import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronLeft, Play, Square, Timer, Trash2, BarChart, ChevronDown, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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

interface Contraction {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number | null; // in seconds
}

interface ContractionSession {
  id: string;
  date: string;
  contractions: {
    startTime: string;
    duration: string;
    interval: string;
  }[];
  averageDuration: string;
  averageInterval: string;
}

type ViewMode = "track" | "records" | "chart";

export default function ContractionTimer({ onBack }: { onBack: () => void }) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentContraction, setCurrentContraction] = useState<Contraction | null>(null);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [sessions, setSessions] = useState<ContractionSession[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("track");
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage
    const storedSessions = localStorage.getItem("contractionSessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  // Timer for current contraction
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (currentContraction && !currentContraction.endTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffSecs = Math.floor((now.getTime() - currentContraction.startTime.getTime()) / 1000);
        const mins = Math.floor(diffSecs / 60);
        const secs = diffSecs % 60;
        
        setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [currentContraction]);

  const startContraction = () => {
    setIsTracking(true);
    setElapsedTime("00:00");
    setCurrentContraction({
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      duration: null,
    });
    
    toast({
      title: "Contraction Started",
      description: "Timer is running...",
    });
  };

  const stopContraction = () => {
    if (!currentContraction) return;
    
    const endTime = new Date();
    const durationSecs = Math.round((endTime.getTime() - currentContraction.startTime.getTime()) / 1000);
    
    const completedContraction = {
      ...currentContraction,
      endTime,
      duration: durationSecs,
    };
    
    setCurrentContraction(null);
    setContractions([...contractions, completedContraction]);
    setIsTracking(false);
    
    toast({
      title: "Contraction Ended",
      description: `Duration: ${formatDuration(durationSecs)}`,
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  const calculateInterval = (currStartTime: Date, prevStartTime: Date): string => {
    const diffSecs = Math.round((currStartTime.getTime() - prevStartTime.getTime()) / 1000);
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    return `${mins}m ${secs}s`;
  };

  const handleEndSession = () => {
    if (contractions.length === 0) {
      toast({
        title: "No contractions",
        description: "There are no contractions to save",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate average duration
    const durationsInSeconds = contractions
      .filter(c => c.duration !== null)
      .map(c => c.duration as number);
    
    const avgDuration = durationsInSeconds.length > 0
      ? Math.round(durationsInSeconds.reduce((sum, val) => sum + val, 0) / durationsInSeconds.length)
      : 0;
    
    // Calculate intervals between contractions
    const intervals: number[] = [];
    for (let i = 1; i < contractions.length; i++) {
      intervals.push(Math.round(
        (contractions[i].startTime.getTime() - contractions[i-1].startTime.getTime()) / 1000
      ));
    }
    
    const avgInterval = intervals.length > 0
      ? Math.round(intervals.reduce((sum, val) => sum + val, 0) / intervals.length)
      : 0;
    
    // Format contractions for saving
    const formattedContractions = contractions.map((c, index) => ({
      startTime: format(c.startTime, "HH:mm:ss"),
      duration: c.duration ? formatDuration(c.duration) : "N/A",
      interval: index > 0 ? calculateInterval(c.startTime, contractions[index-1].startTime) : "-"
    }));
    
    const newSession: ContractionSession = {
      id: Date.now().toString(),
      date: format(new Date(), "yyyy-MM-dd"),
      contractions: formattedContractions,
      averageDuration: formatDuration(avgDuration),
      averageInterval: formatDuration(avgInterval),
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem("contractionSessions", JSON.stringify(updatedSessions));
    
    // Reset current session
    setContractions([]);
    setCurrentContraction(null);
    
    toast({
      title: "Session Saved",
      description: `Recorded ${contractions.length} contractions`,
    });
    
    // Switch to records view after saving a session
    setViewMode("records");
  };
  
  const handleDeleteSession = (id: string) => {
    const updatedSessions = sessions.filter(session => session.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem("contractionSessions", JSON.stringify(updatedSessions));
    
    toast({
      title: "Session deleted",
      description: "Contraction session removed successfully",
    });
  };

  const handleDownloadRecords = () => {
    if (sessions.length === 0) {
      toast({
        title: "No records to download",
        description: "Add some contraction sessions first",
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
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contraction Records</title>
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
            h2 {
              color: #ff7eb6;
              margin-top: 20px;
              margin-bottom: 10px;
              font-size: 18px;
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
            .session-summary {
              background-color: #f5f5f5;
              padding: 10px;
              border-radius: 4px;
              margin-bottom: 15px;
            }
            .summary-item {
              display: inline-block;
              margin-right: 20px;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
            }
            .summary-value {
              font-weight: bold;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Contraction Records</h1>
            <div class="date">Generated on: ${format(new Date(), "MMMM d, yyyy")}</div>
          </div>
          
          ${sortedSessions.map(session => `
            <div>
              <h2>Session on ${format(new Date(session.date), "MMMM d, yyyy")}</h2>
              
              <div class="session-summary">
                <div class="summary-item">
                  <div class="summary-label">Total Contractions</div>
                  <div class="summary-value">${session.contractions.length}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Average Duration</div>
                  <div class="summary-value">${session.averageDuration}</div>
                </div>
                <div class="summary-item">
                  <div class="summary-label">Average Interval</div>
                  <div class="summary-value">${session.averageInterval}</div>
                </div>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Interval</th>
                  </tr>
                </thead>
                <tbody>
                  ${session.contractions.map(contraction => `
                    <tr>
                      <td>${contraction.startTime}</td>
                      <td>${contraction.duration}</td>
                      <td>${contraction.interval}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
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
      description: "Your contraction records are being prepared for download",
    });
  };

  const getContractionFrequency = (): string => {
    if (contractions.length < 2) return "N/A";
    
    // Get the last few contractions to check frequency
    const recentContractions = [...contractions].slice(-3);
    
    if (recentContractions.length < 2) return "N/A";
    
    // Calculate intervals between recent contractions
    const intervals: number[] = [];
    for (let i = 1; i < recentContractions.length; i++) {
      intervals.push(
        Math.round((recentContractions[i].startTime.getTime() - recentContractions[i-1].startTime.getTime()) / 60000)
      );
    }
    
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    
    // Return the average interval in minutes
    return `${Math.round(avgInterval)} minutes apart`;
  };

  // Prepare chart data for contraction sessions
  const prepareChartData = () => {
    return sessions.slice(-5).map(session => {
      // Parse the average duration into seconds
      const avgDurParts = session.averageDuration.split('m ');
      const minutes = parseInt(avgDurParts[0]);
      const seconds = parseInt(avgDurParts[1].replace('s', ''));
      const totalSeconds = minutes * 60 + seconds;
      
      // Parse average interval
      const avgIntParts = session.averageInterval.split('m ');
      const intMinutes = parseInt(avgIntParts[0]);
      const intSeconds = parseInt(avgIntParts[1].replace('s', ''));
      const intervalSeconds = intMinutes * 60 + intSeconds;
      
      return {
        date: format(new Date(session.date), "MM/dd"),
        count: session.contractions.length,
        avgDuration: totalSeconds,
        avgInterval: intervalSeconds,
        formattedDuration: session.averageDuration,
        formattedInterval: session.averageInterval
      };
    });
  };

  const chartData = prepareChartData();

  // Chart colors
  const COLORS = {
    duration: "#ff7eb6", // softpink
    interval: "#7e69ab"  // lavender
  };
  
  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "track": return "Track Labor Session";
      case "records": return "Records";
      case "chart": return "Charts";
      default: return "Contraction Timer";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Contraction Timer</h1>
        </div>
        
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="justify-between">
                {getViewTitle()} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuItem onClick={() => setViewMode("track")}>
                Track Labor Session
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

      {viewMode === "track" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Labor Session</CardTitle>
            <CardDescription>
              Time your contractions during labor. Start the timer when a contraction begins and stop when it ends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Contractions</p>
                  <p className="text-3xl font-bold">{contractions.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Frequency</p>
                  <p className="text-xl font-bold">{getContractionFrequency()}</p>
                </div>
              </div>
              
              {isTracking ? (
                <div className="flex flex-col items-center w-full space-y-4">
                  <div className="text-center">
                    <p className="text-muted-foreground">Current Contraction</p>
                    <p className="text-4xl font-bold text-softpink">{elapsedTime}</p>
                  </div>
                  <Button 
                    onClick={stopContraction}
                    className="h-20 w-full bg-red-500 hover:bg-red-600"
                  >
                    <Square className="h-5 w-5 mr-2" /> Stop Contraction
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={startContraction}
                  className="h-20 w-full bg-softpink hover:bg-softpink/90"
                >
                  <Play className="h-5 w-5 mr-2" /> Start Contraction
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleEndSession}
                className="w-full"
                disabled={contractions.length === 0}
              >
                Save Session
              </Button>
            </div>
            
            {contractions.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Current Session</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Interval</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractions.map((contraction, index) => (
                      <TableRow key={contraction.id}>
                        <TableCell>{format(contraction.startTime, "HH:mm:ss")}</TableCell>
                        <TableCell>
                          {contraction.duration ? formatDuration(contraction.duration) : "In progress..."}
                        </TableCell>
                        <TableCell>
                          {index > 0 
                            ? calculateInterval(contraction.startTime, contractions[index-1].startTime)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === "records" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Previous Sessions</CardTitle>
            {sessions.length > 0 && (
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
            {sessions.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No sessions recorded yet</p>
                <Button onClick={() => setViewMode("track")} variant="outline">
                  <Play className="h-4 w-4 mr-2" /> Start Tracking Contractions
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((session) => (
                    <Card key={session.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {format(new Date(session.date), "MMMM d, yyyy")}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-500 hover:text-red-700 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Contractions</p>
                            <p className="font-medium">{session.contractions.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Average Duration</p>
                            <p className="font-medium">{session.averageDuration}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Average Interval</p>
                            <p className="font-medium">{session.averageInterval}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {viewMode === "chart" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contraction Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No contraction data to display</p>
                <Button onClick={() => setViewMode("track")} variant="outline">
                  <Play className="h-4 w-4 mr-2" /> Start Tracking Contractions
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Count', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === "Avg Duration") return [`${value} seconds`, name];
                        if (name === "Avg Interval") return [`${value} seconds`, name];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgDuration" name="Avg Duration" fill={COLORS.duration} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="avgInterval" name="Avg Interval" fill={COLORS.interval} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="count" name="Contractions" fill="#fec6a1" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
                
                <div className="text-sm text-center text-muted-foreground">
                  Chart shows average contraction duration, interval between contractions, and total count per session
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
