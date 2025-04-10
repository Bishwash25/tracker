import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, addWeeks, subWeeks, isBefore, isAfter } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Calculate the minimum allowed date (42 weeks ago)
const minAllowedDate = subWeeks(new Date(), 42);

// Schema for the form
const formSchema = z.object({
  lastPeriodDate: z.date({
    required_error: "Please select your last period start date.",
  }).refine(
    (date) => isAfter(date, minAllowedDate),
    {
      message: "Date cannot be more than 42 weeks in the past.",
    }
  ).refine(
    (date) => isBefore(date, new Date()),
    {
      message: "Date cannot be in the future.",
    }
  ),
});

type FormValues = z.infer<typeof formSchema>;

// Function to calculate due date (40 weeks from last period)
const calculateDueDate = (lastPeriodDate: Date): Date => {
  return addWeeks(lastPeriodDate, 40);
};

// Function to calculate pregnancy weeks
const calculatePregnancyWeeks = (lastPeriodDate: Date): number => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  
  // Handle the edge case: if we're at 41 weeks and 6 or 7 days, display as 42 weeks
  if ((weeks === 41 && days >= 6) || (weeks === 41 && days === 0 && diffDays >= 294)) {
    return 42;
  }
  
  return weeks;
};

export default function PregnancyStart() {
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  function onSubmit(data: FormValues) {
    const calculatedDueDate = calculateDueDate(data.lastPeriodDate);
    const weeks = calculatePregnancyWeeks(data.lastPeriodDate);
    
    setDueDate(calculatedDueDate);
    setPregnancyWeeks(weeks);

    // Store in localStorage for the rest of the app to use
    localStorage.setItem("lastPeriodDate", data.lastPeriodDate.toISOString());
    localStorage.setItem("dueDate", calculatedDueDate.toISOString());
    localStorage.setItem("pregnancyStartDate", new Date().toISOString());

    toast({
      title: "Information saved",
      description: "Your pregnancy information has been saved.",
    });

    // Wait a moment then navigate
    setTimeout(() => {
      navigate("/pregnancy-dashboard");
    }, 1500);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-heading font-bold text-center text-lavender mb-2">
        Let's Start Your Pregnancy Journey
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Please provide your last period start date to calculate your due date
      </p>

      <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="lastPeriodDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Last Period Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          date > new Date() || isBefore(date, minAllowedDate)
                        }
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The first day of your most recent menstrual period (maximum 42 weeks ago).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Alert className="bg-calmteal/10 border-calmteal/30">
              <AlertCircle className="h-4 w-4 text-calmteal" />
              <AlertTitle className="text-calmteal">Validation Note</AlertTitle>
              <AlertDescription className="text-sm">
                For accurate pregnancy tracking, you can only select a date between today and 42 weeks ago. If your last period was earlier than this, please consult with your healthcare provider.
              </AlertDescription>
            </Alert>
            <Button type="submit" className="w-full">
              Calculate Due Date
            </Button>
          </form>
        </Form>
      </div>

      {dueDate && pregnancyWeeks !== null && (
        <div className="bg-calmteal/10 rounded-lg p-6 text-center animate-fade-in">
          <h2 className="text-xl font-heading font-semibold mb-2">Your Pregnancy Summary</h2>
          <p className="mb-2">
            <span className="font-bold">Estimated Due Date:</span> {format(dueDate, "MMMM d, yyyy")}
          </p>
          <p className="mb-4">
            <span className="font-bold">Current Progress:</span> {pregnancyWeeks} weeks pregnant
          </p>
          <p className="text-sm text-muted-foreground">
            This is an estimate based on a standard 40-week pregnancy.
            Your healthcare provider may adjust this date.
          </p>
        </div>
      )}
    </div>
  );
}
