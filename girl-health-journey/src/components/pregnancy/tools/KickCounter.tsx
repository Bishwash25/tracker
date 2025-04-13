import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, Trash2, Footprints, BarChart, ChevronDown, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
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
  Cell
} from "recharts";

interface KickSession {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  kickCount: number;
}

type ViewMode = "add" | "records" | "chart";

export default function KickCounter({ onBack }: { onBack: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [kickCount, setKickCount] = useState(0);
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("add");
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage
    const storedSessions = localStorage.getItem("kickSessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  const handleStartSession = () => {
    setIsActive(true);
    setStartTime(new Date());
    setKickCount(0);
    toast({
      title: "Session Started",
      description: "Tap the button each time you feel a kick",
    });
  };

  const handleKick = () => {
    if (isActive) {
      setKickCount((prev) => prev + 1);
    }
  };

  const handleEndSession = () => {
    if (!isActive || !startTime) return;

    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    const durationStr = `${diffMins} min ${diffSecs} sec`;

    const newSession: KickSession = {
      id: Date.now().toString(),
      date: format(now, "yyyy-MM-dd"),
      startTime: format(startTime, "HH:mm"),
      duration: durationStr,
      kickCount: kickCount,
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem("kickSessions", JSON.stringify(updatedSessions));

    setIsActive(false);
    setStartTime(null);
    setKickCount(0);

    toast({
      title: "Session Completed",
      description: `Recorded ${kickCount} kicks in ${durationStr}`,
    });
    
    // Switch to records view after completing a session
    setViewMode("records");
  };

  const handleDeleteSession = (id: string) => {
    const updatedSessions = sessions.filter((session) => session.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem("kickSessions", JSON.stringify(updatedSessions));

    toast({
      title: "Session deleted",
      description: "Kick counter session removed successfully",
    });
  };

  const handleDownloadRecords = () => {
    if (sessions.length === 0) {
      toast({
        title: "No records to download",
        description: "Add some kick sessions first",
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
      new Date(b.date + ' ' + b.startTime).getTime() - 
      new Date(a.date + ' ' + a.startTime).getTime()
    );

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Baby Kick Records</title>
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
            .kicks {
              font-weight: bold;
            }
            .low { color: #FEC6A1; }
            .medium { color: #9b87f5; }
            .high { color: #6E59A5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Baby Kick Records</h1>
            <div class="date">Generated on: ${format(new Date(), "MMMM d, yyyy")}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Kicks</th>
              </tr>
            </thead>
            <tbody>
              ${sortedSessions.map(session => {
                const kickClass = session.kickCount <= 5 ? "low" : 
                  session.kickCount <= 10 ? "medium" : "high";
                
                return `
                  <tr>
                    <td>${format(new Date(session.date), "MMMM d, yyyy")}</td>
                    <td>${session.startTime}</td>
                    <td>${session.duration}</td>
                    <td class="kicks ${kickClass}">${session.kickCount}</td>
                  </tr>
                `;
              }).join('')}
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
      description: "Your baby kick records are being prepared for download",
    });
  };

  // Calculate elapsed time
  const [elapsedTime, setElapsedTime] = useState("00:00");
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        
        setElapsedTime(`${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // Prepare data for chart display
  const prepareChartData = () => {
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date + ' ' + a.startTime).getTime() - 
      new Date(b.date + ' ' + b.startTime).getTime()
    );
    
    // Only display the last 10 sessions in the chart
    return sortedSessions.slice(-10).map(session => ({
      date: format(new Date(session.date), "MM/dd"),
      time: session.startTime,
      kicks: session.kickCount,
      label: `${format(new Date(session.date), "MM/dd")} at ${session.startTime}`
    }));
  };

  const chartData = prepareChartData();

  // Chart colors
  const getBarColor = (value: number) => {
    // Color based on kick count
    if (value <= 5) return "#FEC6A1"; // Soft Orange
    if (value <= 10) return "#9b87f5"; // Primary Purple
    return "#6E59A5"; // Tertiary Purple
  };
  
  // Get the view title based on current mode
  const getViewTitle = () => {
    switch (viewMode) {
      case "add": return "Add Baby Kicks";
      case "records": return "Records";
      case "chart": return "Charts";
      default: return "Kick Counter";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Kick Counter</h1>
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
                Add Baby Kicks
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
            <CardTitle className="text-lg">Track Baby Movements</CardTitle>
            <CardDescription>
              Count your baby's kicks to monitor their well-being. Most healthcare providers recommend counting 10 movements within 2 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6 py-4">
              {isActive ? (
                <>
                  <div className="text-center mb-2">
                    <p className="text-muted-foreground">Time Elapsed</p>
                    <p className="text-3xl font-bold">{elapsedTime}</p>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="text-muted-foreground">Kicks Counted</p>
                    <p className="text-5xl font-bold text-calmteal">{kickCount}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <Button 
                      size="lg" 
                      className="h-24 bg-calmteal hover:bg-calmteal/90"
                      onClick={handleKick}
                    >
                      <Footprints className="h-8 w-8 mr-2" /> 
                      <span className="text-lg">Record Kick</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="h-24 border-red-300 text-red-500 hover:bg-red-50"
                      onClick={handleEndSession}
                    >
                      End Session
                    </Button>
                  </div>
                </>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full h-20 bg-calmteal hover:bg-calmteal/90"
                  onClick={handleStartSession}
                >
                  <Plus className="h-5 w-5 mr-2" /> 
                  <span className="text-lg">Start New Session</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "records" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Kick History</CardTitle>
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
                <p className="text-muted-foreground">No kick sessions recorded yet</p>
                <Button onClick={() => setViewMode("add")} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Start Your First Session
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Kicks</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions
                    .sort((a, b) => 
                      new Date(b.date + ' ' + b.startTime).getTime() - 
                      new Date(a.date + ' ' + a.startTime).getTime()
                    )
                    .map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>{format(new Date(session.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{session.startTime}</TableCell>
                        <TableCell>{session.duration}</TableCell>
                        <TableCell>{session.kickCount}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSession(session.id)}
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
            <CardTitle className="text-lg">Kick Trend Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="text-center space-y-4 py-6">
                <p className="text-muted-foreground">No kick sessions to display</p>
                <Button onClick={() => setViewMode("add")} variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Start Your First Session
                </Button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="label" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis label={{ value: 'Kicks', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} kicks`, 
                      `Session`
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar dataKey="kicks" name="Kicks" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.kicks)} />
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
