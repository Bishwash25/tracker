
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Schema for the form
const formSchema = z.object({
  periodStartDate: z.date({
    required_error: "Please select your period start date.",
  }),
  cycleLength: z.string().min(1, "Please select your average cycle length."),
  periodLength: z.string().min(1, "Please select your average period length."),
});

type FormValues = z.infer<typeof formSchema>;

export default function PeriodStart() {
  const [predictedEndDate, setPredictedEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleLength: "28",
      periodLength: "5",
    },
  });

  function onSubmit(data: FormValues) {
    // Calculate predicted end date
    const endDate = addDays(data.periodStartDate, parseInt(data.periodLength));
    setPredictedEndDate(endDate);

    // Store in localStorage for the rest of the app to use
    localStorage.setItem("periodStartDate", data.periodStartDate.toISOString());
    localStorage.setItem("periodEndDate", endDate.toISOString());
    localStorage.setItem("cycleLength", data.cycleLength);
    localStorage.setItem("periodLength", data.periodLength);

    toast({
      title: "Information saved",
      description: "Your period information has been saved.",
    });

    // Wait a moment then navigate
    setTimeout(() => {
      navigate("/period-dashboard");
    }, 1500);
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-heading font-bold text-center text-lavender mb-2">
        Let's Start Your Period Tracking
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Please provide information about your menstrual cycle
      </p>

      <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="periodStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Period Start Date</FormLabel>
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
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    The first day of your current or most recent period.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cycleLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Cycle Length</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 15 }, (_, i) => i + 21).map((days) => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The number of days from the first day of one period to the first day of the next.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="periodLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Period Length</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period length" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 2).map((days) => (
                        <SelectItem key={days} value={days.toString()}>
                          {days} days
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How many days your period typically lasts.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Start Tracking
            </Button>
          </form>
        </Form>
      </div>

      {predictedEndDate && (
        <div className="bg-softpink/10 rounded-lg p-6 text-center animate-fade-in">
          <h2 className="text-xl font-heading font-semibold mb-2">Your Period Summary</h2>
          <p className="mb-4">
            <span className="font-bold">Predicted End Date:</span> {format(predictedEndDate, "MMMM d, yyyy")}
          </p>
          <p className="text-sm text-muted-foreground">
            This is an estimate based on your provided information.
            You can always adjust this in your profile settings.
          </p>
        </div>
      )}
    </div>
  );
}
