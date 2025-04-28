import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronDown, Download, Scale } from "lucide-react";
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
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { USER_AUTHENTICATED_EVENT } from "@/hooks/use-auth";

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  note: string;
}

type ViewMode = "add" | "records" | "chart";

export default function PeriodWeightTracker() {
  const [weight, setWeight] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("add");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const { toast } = useToast();

  // Load user ID on component mount
  useEffect(() => {
    const loadUserId = async () => {
      console.log("PeriodWeightTracker component mounted, checking for user ID");
      
      // Try to get user ID from Firebase Auth
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        console.log("Found user ID :", currentUser.uid);
        setUserId(currentUser.uid);
        return;
      } else {
        console.log("No current user found");
      }
      
      // Try to get user ID from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          if (parsedData.uid) {
            console.log("Found user ID from localStorage:", parsedData.uid);
            setUserId(parsedData.uid);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else {
        console.log("No user data found in localStorage");
      }
    };
    
    loadUserId();
  }, []);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.uid) {
        console.log("Auth state changed - user ID:", user.uid);
        setUserId(user.uid);
      } else {
        console.log("Auth state changed - no user");
      }
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, []);

  // Load records from localStorage (original behavior)
  useEffect(() => {
    const storedRecords = localStorage.getItem("periodWeightRecords");
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  // Fetch weight records from Firestore when userId changes or on auth event
  useEffect(() => {
    if (userId && !dataFetched) {
      fetchWeightRecordsFromFirestore(userId);
    }
  }, [userId, dataFetched]);

  // Listen for authentication event
  useEffect(() => {
    const handleUserAuthenticated = (event: CustomEvent) => {
      const { userId } = event.detail;
      console.log("PeriodWeightTracker: User authenticated event received:", userId);
      if (userId) {
        fetchWeightRecordsFromFirestore(userId);
      }
    };

    // Add event listener
    window.addEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);

    // Clean up
    return () => {
      window.removeEventListener(USER_AUTHENTICATED_EVENT, handleUserAuthenticated as EventListener);
    };
  }, []);

  // Function to fetch weight records from Firestore
  const fetchWeightRecordsFromFirestore = async (uid: string) => {
    try {
      console.log("Fetching weight records from Firestore for user:", uid);
      
      // Get weight records from the periodWeight subcollection
      const weightRecordsRef = collection(db, "users", uid, "periodWeight");
      const recordsQuery = query(weightRecordsRef, orderBy("createdAt", "desc"), limit(50));
      const recordsSnapshot = await getDocs(recordsQuery);
      
      if (!recordsSnapshot.empty) {
        const weightRecords = recordsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            weight: data.weight,
            note: data.note || ""
          };
        });
        
        console.log("Found weight records in Firestore:", weightRecords.length, "records");
        
        // Update local state and localStorage
        setRecords(weightRecords);
        localStorage.setItem("periodWeightRecords", JSON.stringify(weightRecords));
      } else {
        console.log("No weight records found in Firestore");
      }
      
      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching weight records from Firestore:", error);
    }
  };

  // Save weight record to Firebase
  const saveWeightRecordToFirestore = async (weightData: WeightRecord) => {
    // If userId not set, try to get it directly from auth
    let currentUserId = userId;
    if (!currentUserId) {
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        currentUserId = currentUser.uid;
        setUserId(currentUserId);
        console.log("Retrieved user ID directly in save function:", currentUserId);
      } else {
        console.error("Cannot save: No user ID available");
        return false;
      }
    }

    try {
      // First, save directly in the user document for easy access
      const userRef = doc(db, "users", currentUserId);
      console.log("Saving weight record to user document:", currentUserId);
      
      // Prepare data for Firestore
      const firestoreData = {
        ...weightData,
        createdAt: new Date().toISOString()
      };
      
      // Save in the user document
      await setDoc(userRef, {
        periodWeight: {
          [weightData.id]: firestoreData
        },
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      // Also save in a subcollection for better organization
      const weightRef = doc(collection(db, "users", currentUserId, "periodWeight"), weightData.id);
      await setDoc(weightRef, firestoreData);
      
      console.log("Successfully saved weight data ");
      return true;
    } catch (error) {
      console.error("Error saving weight data:", error);
      return false;
    }
  };

  // Delete weight record from Firebase
  const deleteWeightRecordFromFirestore = async (recordId: string) => {
    if (!userId) {
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        setUserId(currentUser.uid);
      } else {
        console.error("Cannot delete: No user ID available");
        return false;
      }
    }

    const effectiveUserId = userId || auth.currentUser?.uid;
    if (!effectiveUserId) {
      console.error("Still no user ID available after retry");
      return false;
    }

    try {
      console.log("Deleting weight data for user:", effectiveUserId);
      
      // First, update the user document to remove this weight record
      const userRef = doc(db, "users", effectiveUserId);
      
      // We can't directly delete a nested field, so we need to update with a special value
      await setDoc(userRef, {
        periodWeight: {
          [recordId]: null  // Firebase will interpret this as a delete operation for this field
        }
      }, { merge: true });
      
      // Also delete from the periodWeight subcollection
      const weightRef = doc(db, "users", effectiveUserId, "periodWeight", recordId);
      await deleteDoc(weightRef);
      
      console.log("Successfully deleted weight data");
      return true;
    } catch (error) {
      console.error("Error deleting weight data:", error);
      return false;
    }
  };

  const handleAddRecord = async () => {
    if (!weight || isNaN(parseFloat(weight))) {
      toast({
        title: "Error",
        description: "Please enter a valid weight",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newRecord: WeightRecord = {
        id: Date.now().toString(),
        date: format(new Date(), "yyyy-MM-dd"),
        weight: parseFloat(weight),
        note: note,
      };

      // Save to Firebase first
      const firestoreSaveResult = await saveWeightRecordToFirestore(newRecord);
      
      // Update local storage and state
      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      localStorage.setItem("periodWeightRecords", JSON.stringify(updatedRecords));

      setWeight("");
      setNote("");

      if (firestoreSaveResult) {
        toast({
          title: "Weight record saved",
          description: "Your weight record has been saved to cloud.",
        });
      } else {
        toast({
          title: "Weight record saved locally",
          description: "Your weight record has been saved.",
        });
      }
      
      // Switch to records view after adding
      setViewMode("records");
    } catch (error) {
      console.error("Error adding weight record:", error);
      toast({
        title: "Error saving record",
        description: "There was a problem saving your record. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      // Delete from Firebase
      await deleteWeightRecordFromFirestore(id);

      // Update local storage and state
      const updatedRecords = records.filter((record) => record.id !== id);
      setRecords(updatedRecords);
      localStorage.setItem("periodWeightRecords", JSON.stringify(updatedRecords));

      toast({
        title: "Record deleted",
        description: "Weight record removed successfully",
      });
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Error deleting record",
        description: "There was a problem deleting the record.",
        variant: "destructive"
      });
    }
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
          <title>Period Weight Records</title>
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
            <h1>Period Weight Records</h1>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-lavender" />
          Period Weight Tracker
        </CardTitle>
        
        <div className="mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
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
      </CardHeader>
      <CardContent>
        {viewMode === "add" && (
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Button 
              onClick={handleAddRecord} 
              className="w-full mt-2 bg-lavender hover:bg-lavender/90"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" /> 
              {isLoading ? "Saving..." : "Add Record"}
            </Button>
          </div>
        )}

        {viewMode === "records" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">Weight History</h3>
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
            </div>
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
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{record.weight}</TableCell>
                        <TableCell>
                          {record.note && record.note.trim() !== "" ? (
                            <span className="block max-w-xs whitespace-pre-line break-words text-sm text-muted-foreground bg-muted/50 rounded p-2">{record.note}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
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
          </div>
        )}

        {viewMode === "chart" && (
          <div>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}