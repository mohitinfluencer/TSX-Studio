"use client";

import { CheckCircle2, Rocket, Layout, Zap, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

const steps = [
    {
        title: "Project Creation",
        description: "Initialize your first production-grade animation project.",
        icon: <Layout className="w-6 h-6" />,
    },
    {
        title: "Code Injection",
        description: "Paste your TSX code. We'll handle the heuristic safety scanning.",
        icon: <Rocket className="w-6 h-6" />,
    },
    {
        title: "Cloud Export",
        description: "Submit to our render queue. Get high-quality MP4/MOV in minutes.",
        icon: <Zap className="w-6 h-6" />,
    },
    {
        title: "Share & Grow",
        description: "Invite your team and earn credits through our referral engine.",
        icon: <Share2 className="w-6 h-6" />,
    },
];

export function OnboardingWizard() {
    const [currentStep, setCurrentStep] = useState(0);

    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            toast.success("Onboarding complete! Welcome to the Studio.");
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-card/50 border border-white/5 rounded-[40px] p-12 text-center space-y-12 shadow-2xl">
                <div className="space-y-4">
                    <div className="w-20 h-20 rounded-[30px] bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-lg shadow-primary/10">
                        {steps[currentStep].icon}
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic tracking-tight">{steps[currentStep].title}</h2>
                        <p className="text-muted-foreground leading-relaxed">{steps[currentStep].description}</p>
                    </div>
                </div>

                <div className="flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? "w-8 bg-primary" : "w-2 bg-white/10"
                                }`}
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-4 pt-4">
                    <Button onClick={next} className="h-14 rounded-2xl font-black italic text-lg shadow-xl shadow-primary/30">
                        {currentStep === steps.length - 1 ? "ENTER THE STUDIO" : "CONTINUE JOURNEY"}
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground text-xs uppercase tracking-widest font-black" asChild>
                        <Link href="/dashboard">Skip Onboarding</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
