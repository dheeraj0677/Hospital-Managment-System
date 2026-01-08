"use client";

import { useEffect, useState } from "react";
import { getDoctorSchedule } from "@/app/actions/dashboard";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Calendar, Clock, User, FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function SchedulePage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSchedule() {
            try {
                const data = await getDoctorSchedule();
                setAppointments(data);
            } catch (error) {
                console.error("Failed to fetch schedule", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, []);

    // Group by date
    const groupedAppointments = appointments.reduce((groups, appt) => {
        const date = new Date(appt.date).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(appt);
        return groups;
    }, {} as Record<string, any[]>);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/doctor/dashboard">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Full Schedule</h1>
                        <p className="text-muted-foreground">Manage your upcoming appointments.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading schedule...</div>
                ) : appointments.length === 0 ? (
                    <Card className="p-12 text-center text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming appointments found.</p>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedAppointments).map(([date, appts]) => (
                            <div key={date}>
                                <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" /> {date}
                                </h3>
                                <div className="space-y-4">
                                    {appts.map((apt: any) => (
                                        <AppointmentCard key={apt.id} apt={apt} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { updateAppointmentNotes } from "@/app/actions/appointment";
import { Pill, Save, X } from "lucide-react";

function AppointmentCard({ apt }: { apt: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(apt.notes || "");
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        await updateAppointmentNotes(apt.id, note);
        setSaving(false);
        setIsEditing(false);
    }

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow border-none shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xl font-bold font-mono">
                            {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <User className="h-4 w-4 mr-1" />
                            {apt.patient?.name || "Unknown Patient"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-slate-100 text-slate-700'
                            }`}>
                            {apt.status}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            ID: {apt.bookingToken || "N/A"}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(!isEditing)}
                        className={isEditing ? "bg-primary text-primary-foreground" : ""}
                    >
                        <Pill className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {apt.reason && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-foreground/80">
                    <span className="font-semibold">Reason:</span> {apt.reason}
                </div>
            )}

            {/* Prescriptions / Notes Section */}
            {(isEditing || apt.notes) && (
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                    <h4 className="flex items-center text-sm font-bold text-yellow-700 dark:text-yellow-500 mb-2">
                        <Pill className="h-4 w-4 mr-2" />
                        Prescription / Doctor's Notes
                    </h4>

                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea
                                className="w-full h-24 p-2 rounded-md border border-input bg-white dark:bg-slate-900 text-sm"
                                placeholder="Enter prescribed medications, dosage, and other notes..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleSave} disabled={saving}>
                                    <Save className="h-4 w-4 mr-2" /> Save Note
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{apt.notes}</p>
                    )}
                </div>
            )}
        </Card>
    );
}
