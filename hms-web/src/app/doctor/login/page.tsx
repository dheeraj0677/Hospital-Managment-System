"use client";

import { signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion } from "framer-motion";
import { Lock, Mail, Activity, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DoctorLogin() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Attempt login using NextAuth credentials provider
        const result = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });

        if (result?.ok) {
            // Successful login
            router.push("/doctor/dashboard");
        } else {
            // Failed login
            alert("Invalid login credentials. Please check your email and password.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Background Patterns */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[150px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[150px]" />
            </div>

            <Navbar />

            <div className="container px-4 z-10 w-full max-w-md mt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/20 backdrop-blur-sm mb-4">
                            <Activity className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                            Doctor Portal
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Secure access for medical professionals
                        </p>
                    </div>

                    <Card variant="glass" className="p-8 backdrop-blur-xl border-white/40 dark:border-white/10 shadow-2xl">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <Input
                                label="Email ID"
                                type="email"
                                placeholder="dr.smith@medicare.com"
                                icon={<Mail className="h-4 w-4" />}
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="h-4 w-4" />}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span className="text-muted-foreground">Remember me</span>
                                </label>
                                <a href="#" className="text-primary hover:underline font-medium">Forgot password?</a>
                            </div>

                            <Button
                                type="submit"
                                className="w-full text-lg shadow-lg shadow-primary/20"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Sign In to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </Card>

                    <p className="text-center text-sm text-muted-foreground mt-8">
                        Need help accessing your account? <a href="#" className="text-primary hover:underline">Contact Support</a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
