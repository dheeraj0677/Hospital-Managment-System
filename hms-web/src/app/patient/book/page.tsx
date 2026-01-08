"use client";

import { bookAppointment, recommendDoctors, getDoctors } from "@/app/actions/appointment";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, CheckCircle2, Stethoscope, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function BookingPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successData, setSuccessData] = useState({ token: "", time: "" });

    // Smart Booking State
    const [symptoms, setSymptoms] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [recommendation, setRecommendation] = useState<{ specialization: string | null, doctors: any[] } | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [doctors, setDoctors] = useState<any[]>([]);

    useEffect(() => {
        getDoctors().then(setDoctors);
    }, []);

    const handleAnalyze = async () => {
        if (symptoms.length < 3) return;
        setAnalyzing(true);
        try {
            const result = await recommendDoctors(symptoms);
            setRecommendation(result);
            setShowModal(true);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSelectDoctor = (doc: any) => {
        setSelectedDoctor(doc);
        setShowModal(false);
    };

    const handleSubmit = async (formData: FormData) => {
        if (!selectedDoctor) return;

        setIsSubmitting(true);
        // Append selected doctor ID manually since it's now state-based
        formData.append("doctorId", selectedDoctor.id);

        const result = await bookAppointment(formData);
        setIsSubmitting(false);

        if (result.success) {
            setSuccessData({
                token: result.bookingToken || "",
                time: result.time || ""
            });
            setShowSuccess(true);
        } else {
            alert(result.message);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="max-w-md w-full p-8 text-center space-y-6 border-none shadow-2xl">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                            <p className="text-muted-foreground">Your appointment has been scheduled.</p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                                <span className="text-sm text-muted-foreground">Doctor</span>
                                <span className="font-bold">{selectedDoctor?.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                                <span className="text-sm text-muted-foreground">Time Slot</span>
                                <span className="font-bold font-mono">{successData.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Booking ID</span>
                                <span className="font-bold font-mono text-primary text-lg">{successData.token}</span>
                            </div>
                        </div>

                        <div className="grid gap-3">
                            <Button variant="outline" onClick={() => window.location.href = '/patient/track'}>
                                Track Status
                            </Button>
                            <Button onClick={() => window.location.reload()}>
                                Book Another
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[50%] rounded-full bg-secondary/10 blur-[120px]" />
            </div>

            <Navbar />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-4">
                        Smart Appointment Booking
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Tell us your symptoms, and we'll match you with the right specialist.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card variant="glass" className="p-8">
                            <form action={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input
                                        name="name"
                                        label="Patient Name"
                                        placeholder="John Doe"
                                        required
                                        icon={<User className="h-4 w-4" />}
                                    />
                                    <Input
                                        name="phone"
                                        label="Phone Number"
                                        placeholder="+1 (555) 000-0000"
                                        type="tel"
                                        required
                                    />
                                </div>

                                {/* Symptom Checker Section */}
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2">
                                        <label className="text-sm font-medium text-foreground/80">Reason for Visit / Symptoms</label>
                                        <div className="flex gap-2">
                                            <input
                                                name="reason"
                                                className="flex-1 h-12 rounded-xl border border-input bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border-slate-200 dark:border-slate-800"
                                                placeholder="e.g. I have a severe headache and dizziness"
                                                value={symptoms}
                                                onChange={(e) => setSymptoms(e.target.value)}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAnalyze}
                                                variant="primary"
                                                disabled={analyzing || symptoms.length < 3}
                                            >
                                                {analyzing ? (
                                                    <span className="animate-spin mr-2">⏳</span>
                                                ) : <Sparkles className="w-4 h-4 mr-2" />}
                                                Analyze
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-slate-50 dark:bg-slate-950 px-2 text-muted-foreground">Or Select Manually</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-foreground/80 mb-2 block">Choose a Doctor</label>
                                        <select
                                            className="w-full h-12 rounded-xl border border-input bg-white/50 dark:bg-slate-900/50 px-3 py-1 text-sm"
                                            onChange={(e) => {
                                                const doc = doctors.find(d => d.id === e.target.value);
                                                if (doc) setSelectedDoctor(doc);
                                            }}
                                            value={selectedDoctor?.id || ""}
                                        >
                                            <option value="">-- Select Doctor --</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.id}>
                                                    {doc.name} - {doc.specialization}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Selected Doctor Display */}
                                    <AnimatePresence>
                                        {selectedDoctor && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-4 bg-primary/10 border border-primary/20 rounded-xl"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                                                            <Stethoscope className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">Consulting with</p>
                                                            <p className="text-primary font-bold">{selectedDoctor.name}</p>
                                                            <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
                                                        </div>
                                                    </div>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedDoctor(null)}>Change</Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground/80">Date</label>
                                        <div className="relative">
                                            <input
                                                name="date"
                                                type="date"
                                                className="w-full h-12 rounded-xl border border-input bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border-slate-200 dark:border-slate-800"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex items-end pb-2">
                                        <p className="text-xs text-muted-foreground">Time will be assigned automatically based on availability.</p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                                    variant="primary"
                                    isLoading={isSubmitting}
                                    disabled={!selectedDoctor}
                                >
                                    {selectedDoctor ? "Confirm Booking" : "Please Analyze Symptoms & Select Doctor"}
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* Information Sidebar */}
                    <div className="hidden md:block space-y-6">
                        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/10">
                            <h3 className="font-bold text-lg mb-2 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-primary" />
                                Opening Hours
                            </h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex justify-between">
                                    <span>Mon - Fri</span>
                                    <span className="font-medium text-foreground">09:00 - 17:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Saturday</span>
                                    <span className="font-medium text-foreground">09:00 - 14:00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sunday</span>
                                    <span className="font-medium text-foreground">Emergency Only</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-none bg-slate-900 text-white shadow-xl">
                            <h3 className="font-bold text-lg mb-4">Emergency?</h3>
                            <p className="text-slate-300 text-sm mb-6">
                                For immediate medical attention, please call our emergency hotline or visit our casualty department.
                            </p>
                            <Button className="w-full bg-red-500 hover:bg-red-600 text-white border-none">
                                Call 911-HOSPITAL
                            </Button>
                        </Card>
                    </div>
                </div>
            </motion.div>

            {/* Recommendation Modal */}
            <AnimatePresence>
                {showModal && recommendation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="text-primary h-5 w-5" />
                                    AI Recommendation
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">Based on "{symptoms}"</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                    <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2">
                                        <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Suggested Specialist</p>
                                        <p className="text-lg font-bold">{recommendation.specialization}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Available Doctors</h4>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {recommendation.doctors.length > 0 ? (
                                            recommendation.doctors.map((doc: any) => (
                                                <div
                                                    key={doc.id}
                                                    onClick={() => handleSelectDoctor(doc)}
                                                    className="flex items-center justify-between p-3 rounded-lg border hover:border-primary cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                                            {doc.name?.charAt(0) || "D"}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-white">Select</Button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-sm text-muted-foreground py-4">
                                                No specific doctors found. Please try "General Physician".
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t bg-slate-50 dark:bg-slate-900 flex justify-end">
                                <Button variant="ghost" onClick={() => setShowModal(false)}>Close</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
