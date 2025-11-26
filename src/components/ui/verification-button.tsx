"use client";

import { useState } from "react";
import { Button } from "./button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle, Loader, Rocket } from "lucide-react";

export function VerificationButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { toast } = useToast();

  const handleVerify = async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/seo/verify", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred.");
      }

      setStatus("success");
      toast({
        title: "Verification Successful!",
        description: "Your site has been verified and registered with Google Search Console.",
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error: any) {
      setStatus("error");
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Could not complete the verification process.",
        action: <AlertTriangle />,
      });
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <p className="text-sm text-center text-muted-foreground">
        Automate the entire Google verification and registration process.
      </p>
      <Button
        onClick={handleVerify}
        disabled={status === "loading" || status === "success"}
        className="w-full max-w-xs"
      >
        {status === "loading" && <Loader className="w-4 h-4 mr-2 animate-spin" />}
        {status === "success" && <CheckCircle className="w-4 h-4 mr-2" />}
        {status === "error" && <Rocket className="w-4 h-4 mr-2" />}
        {status === "idle" && <Rocket className="w-4 h-4 mr-2" />}
        {status === "loading" ? "Verifying..." : status === "success" ? "Verified Successfully" : "Verify & Register Site"}
      </Button>
    </div>
  );
}
