import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
//dfsdg

export default function TermsConditions() {
  const [accepted, setAccepted] = useState(false);
  const [isOver16, setIsOver16] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAccept = () => {
    if (!accepted || !isOver16) {
      toast({
        title: "Required Action",
        description: "You must accept the terms and confirm you are over 16 years old.",
        variant: "destructive",
      });
      return;
    }
    
    // Record that terms have been accepted in localStorage
    localStorage.setItem("termsAccepted", "true");
    
    toast({
      title: "Terms Accepted",
      description: "Thank you for accepting the terms and conditions."
    });
    
    // Navigate to period start page directly instead of tracking choice
    navigate("/period-start");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-heading font-bold text-center text-lavender mb-6">
        Terms & Conditions
      </h1>
      
      <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
        <ScrollArea className="h-64 w-full rounded-md border">
          <div className="p-4 text-sm">
            <h2 className="font-bold text-lg mb-2">My Floo App Terms of Service</h2>
            
            <p className="mb-4">
              These Terms of Service govern your use of the My Floo application, 
              website, and services (collectively, "Services"). By using our Services, 
              you agree to these terms. Please read them carefully.
            </p>

            <h3 className="font-bold mb-1">1. Eligibility</h3>
            <p className="mb-4">
              You must be at least 16 years old to use our Services. If you are under 16, 
              please do not use our Services. By using our Services, you represent and warrant 
              that you are at least 16 years old.
            </p>

            <h3 className="font-bold mb-1">2. Privacy Policy</h3>
            <p className="mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, 
              use, and protect your personal information. By using our Services, you consent 
              to the data practices described in our Privacy Policy.
            </p>

            <h3 className="font-bold mb-1">3. Medical Disclaimer</h3>
            <p className="mb-4">
              The information provided through our Services is for general informational and 
              educational purposes only and is not intended as a substitute for professional 
              medical advice, diagnosis, or treatment. Always seek the advice of your physician 
              or other qualified health provider with any questions you may have regarding a 
              medical condition.
            </p>

            <h3 className="font-bold mb-1">4. Account Security</h3>
            <p className="mb-4">
              You are responsible for maintaining the security of your account and password. 
              We cannot and will not be liable for any loss or damage from your failure to 
              comply with this security obligation.
            </p>

            <h3 className="font-bold mb-1">5. Accurate Information</h3>
            <p className="mb-4">
              You agree to provide accurate, complete, and current information during the 
              registration process and to update such information to keep it accurate, 
              complete, and current.
            </p>

            <h3 className="font-bold mb-1">6. Age Restriction</h3>
            <p className="mb-4">
              Our Services are only available to users who are 16 years of age or older. 
              If we become aware that a user is under 16, we will terminate that user's 
              account and remove their personal information from our systems.
            </p>
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(!!checked)}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I have read and accept the terms and conditions
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="age"
            checked={isOver16}
            onCheckedChange={(checked) => setIsOver16(!!checked)}
          />
          <label
            htmlFor="age"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I confirm I am over 16 years old
          </label>
        </div>

        <Button 
          onClick={handleAccept} 
          className="w-full mt-6"
          disabled={!accepted || !isOver16}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
