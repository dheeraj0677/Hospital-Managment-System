"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Activity, Menu, X } from "lucide-react";

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass-dark bg-opacity-30 backdrop-blur-lg">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="bg-primary/20 p-2 rounded-lg">
                                <Activity className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                MediCare Plus
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                                Home
                            </Link>
                            <Link href="#services" className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                                Services
                            </Link>
                            <Link href="/patient/book" className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                                Book Appointment
                            </Link>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/admin/login">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">Admin</Button>
                        </Link>
                        <Link href="/doctor/login">
                            <Button variant="primary" size="sm">
                                Doctor Login
                            </Button>
                        </Link>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden glass border-t border-gray-200 dark:border-slate-800"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 hover:text-primary">
                            Home
                        </Link>
                        <Link href="#services" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 hover:text-primary">
                            Services
                        </Link>
                        <Link href="/patient/book" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary/20 hover:text-primary">
                            Book Appointment
                        </Link>
                        <div className="pt-4">
                            <Link href="/doctor/login" className="w-full">
                                <Button variant="primary" className="w-full">
                                    Doctor Login
                                </Button>
                            </Link>
                            <Link href="/admin/login" className="w-full mt-2 block text-center text-sm text-muted-foreground">
                                Admin Access
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </nav>
    );
}
