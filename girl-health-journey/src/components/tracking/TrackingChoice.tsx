import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Baby } from "lucide-react";
import { motion } from "framer-motion";

export default function TrackingChoice() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const { name } = JSON.parse(userData);
        setUserName(name);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-heading font-bold text-center text-lavender mb-2">
        {userName ? `Welcome, ${userName}!` : 'Choose Your Tracking Journey'}
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        {userName ? 'Choose your health tracking journey' : 'Select a tracking option to get started'}
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full border-2 hover:border-softpink">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-softpink/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarDays className="h-8 w-8 text-softpink" />
              </div>
              <CardTitle className="text-xl text-softpink">Period Tracking</CardTitle>
              <CardDescription>
                Track your menstrual cycle, symptoms, and fertility windows
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Monitor your cycle and predict upcoming periods</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Track your mood, symptoms, and energy levels</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Identify patterns and get personalized insights</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-softpink">•</span>
                  <span>Understand your fertility window better</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-softpink hover:bg-softpink/80"
                onClick={() => navigate("/period-start")}
              >
                Start Period Tracking
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="h-full border-2 hover:border-calmteal">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-calmteal/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Baby className="h-8 w-8 text-calmteal" />
              </div>
              <CardTitle className="text-xl text-calmteal">Pregnancy Tracking</CardTitle>
              <CardDescription>
                Track your pregnancy journey, symptoms, and baby development
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Monitor your pregnancy progress week by week</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Track symptoms, appointments, and health metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Learn about your baby's development</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-calmteal">•</span>
                  <span>Prepare for labor and delivery</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-calmteal hover:bg-calmteal/80"
                onClick={() => navigate("/pregnancy-start")}
              >
                Start Pregnancy Tracking
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
