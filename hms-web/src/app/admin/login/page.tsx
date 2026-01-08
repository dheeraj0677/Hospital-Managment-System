"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLogin() {
    const [email, setEmail] = useState("admin@hospital.com");
    const [password, setPassword] = useState("admin123");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // For now, we simulate admin login by using the doctor credentials but checking role on dashboard
            // Ideally, we'd have a separate credentials set.
            // Using the hardcoded doctor for now as "Admin" in this demo context or adding an admin user.
            // But let's try to sign in.

            // NOTE: In a real app, we'd create a specific Admin user.
            // For this demo, let's assume we can login.
            // Actually, let's just use the simplified flow where we redirect to dashboard if successful
            // Or use a hardcoded check if we haven't seeded an admin user yet.

            // Mock login for demo purposes if backend isn't ready with admin user
            if (email === "admin@hospital.com" && password === "admin123") {
                // Determine layout
                router.push("/admin/dashboard");
            } else {
                setError("Invalid credentials (try admin@hospital.com / admin123)");
            }
        } catch (err) {
            setError("Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-center items-center bg-slate-900 text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/20 z-0"></div>
                <div className="relative z-10 max-w-md text-center">
                    <ShieldAlert className="h-20 w-20 mx-auto mb-6 text-blue-400" />
                    <h1 className="text-4xl font-bold mb-4">Hospital Administration</h1>
                    <p className="text-blue-100 text-lg">
                        Secure access for hospital administrators to manage facility resources, staff, and operations.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
                <Card className="w-full max-w-md p-8 border-none shadow-xl bg-white dark:bg-slate-900">
                    <div className="text-center mb-8">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Admin Login</h2>
                        <p className="text-sm text-muted-foreground">Please sign in to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="name@hospital.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 rounded-lg border bg-background focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white"
                            isLoading={loading}
                        >
                            Access Dashboard
                        </Button>

                        <div className="text-center mt-4">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                                Return to Hospital Home
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
