import React from "react";
import AuthForm from "@/components/auth/AuthForm";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Hero section */}
      <div className="flex-1 bg-lavender/10 p-8 flex flex-col justify-center items-center text-center md:text-left md:items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-lavender mb-4">
            Her Health
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-6">
            Your personal companion for period tracking
          </p>
          <ul className="space-y-3 mb-8 text-left">
            <li className="flex items-start">
              <span className="text-lavender mr-2 text-xl">•</span>
              <span>Track your cycle with accurate predictions</span>
            </li>
            <li className="flex items-start">
              <span className="text-lavender mr-2 text-xl">•</span>
              <span>Monitor mood and symptom patterns throughout your cycle</span>
            </li>
            <li className="flex items-start">
              <span className="text-lavender mr-2 text-xl">•</span>
              <span>Get personalized health insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-lavender mr-2 text-xl">•</span>
              <span>Access educational resources tailored to your journey</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <AuthForm />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
