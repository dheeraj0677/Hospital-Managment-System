"use client";

import { useState, useEffect } from "react";
import { getAppointmentStatus, getDoctors, updateAppointment } from "@/app/actions/appointment";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Calendar, User, Stethoscope, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TrackAppointmentPage() {
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [appointment, setAppointment] = useState<any>(null);
    const [error, setError] = useState("");

    // Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [newDate, setNewDate] = useState("");
    const [updateMessage, setUpdateMessage] = useState("");

    useEffect(() => {
        // Pre-fill token from URL if present (e.g. ?id=APT-XYZ)
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (id) {
            setToken(id);
            handleTrack(id);
        }

        // Fetch doctors for editing
        getDoctors().then(setDoctors);
    }, []);

    async function handleTrack(idOverride?: string) {
        const searchToken = idOverride || token;
        if (!searchToken) return;

        setLoading(true);
        setError("");
        setAppointment(null);
        setUpdateMessage("");

        try {
            const result = await getAppointmentStatus(searchToken);
            if (result.found) {
                setAppointment(result);
            } else {
                setError("Appointment not found. Please check your Booking ID.");
            }
        } catch (e) {
            setError("Failed to fetch details.");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdate() {
        if (!selectedDoctorId || !newDate) {
            setUpdateMessage("Please select a doctor and date.");
            return;
        }

        setLoading(true);
        try {
            const result = await updateAppointment(token, selectedDoctorId, newDate);
            if (result.success) {
                setUpdateMessage(result.message);
                setIsEditing(false);
                // Refresh data
                handleTrack();
            } else {
                setUpdateMessage(result.message);
            }
        } catch (e) {
            setUpdateMessage("Update failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative bg-slate-50 dark:bg-slate-950">
            <Navbar />

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Track Appointment</h1>
                    <p className="text-muted-foreground">Enter your Booking ID to view details or reschedule.</p>
                </div>

                <Card className="p-8 mb-8">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Enter Booking ID (e.g. APT-ABC12345)"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="flex-1 text-lg font-mono uppercase"
                        />
                        <Button onClick={() => handleTrack()} disabled={loading} isLoading={loading}>
                            <Search className="w-4 h-4 mr-2" />
                            Track
                        </Button>
                    </div>
                    {error && <p className="text-red-500 mt-4 flex items-center"><AlertCircle className="w-4 h-4 mr-2" /> {error}</p>}
                </Card>

                {appointment && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="p-8 border-l-4 border-l-primary">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center">
                                        <User className="w-6 h-6 mr-3 text-primary" />
                                        {appointment.patientName}
                                    </h2>
                                    <p className="text-muted-foreground mt-1">Status: <span className="font-bold uppercase text-primary">{appointment.status}</span></p>
                                </div>
                                {!isEditing && (
                                    <Button variant="outline" onClick={() => setIsEditing(true)}>Reschedule / Edit</Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl mb-6">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Doctor</p>
                                    <p className="font-bold text-lg flex items-center">
                                        <Stethoscope className="w-4 h-4 mr-2 text-blue-500" />
                                        {appointment.doctor}
                                    </p>
                                    <p className="text-sm text-slate-500 ml-6">{appointment.specialization}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
                                    <p className="font-bold text-lg flex items-center">
                                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                                        {new Date(appointment.date).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="border-t pt-6"
                                >
                                    <h3 className="font-bold mb-4">Reschedule Appointment</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">New Doctor</label>
                                            <select
                                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                                                onChange={(e) => setSelectedDoctorId(e.target.value)}
                                            >
                                                <option value="">Select Doctor</option>
                                                {doctors.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">New Date</label>
                                            <Input type="date" onChange={(e) => setNewDate(e.target.value)} />
                                            <p className="text-xs text-muted-foreground mt-1">Time assigned automatically.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button onClick={handleUpdate} isLoading={loading}>Confirm Changes</Button>
                                    </div>
                                    {updateMessage && (
                                        <p className={`mt-3 text-center font-bold ${updateMessage.includes("Updated") ? "text-green-600" : "text-red-500"}`}>
                                            {updateMessage}
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
