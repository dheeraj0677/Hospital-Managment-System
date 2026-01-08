"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getDashboardStats, getRecentAppointments, getRecentPatients, getAppointmentHistory } from "@/app/actions/dashboard";
import {
    Users,
    Calendar,
    Activity,
    DoorClosed,
    FileText,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getAdmittedPatients, updateAdmissionNotes, dischargePatient, admitPatient, getDischargedPatients, searchPatients } from "@/app/actions/doctor";
import { Bed, ArrowRight, Save, Search, Filter } from "lucide-react";

export default function DoctorDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0,
        pendingAppointments: 0
    });
    const [viewMode, setViewMode] = useState<"overview" | "admitted" | "discharged" | "history">("overview");
    const [admittedPatients, setAdmittedPatients] = useState<any[]>([]);
    const [dischargedPatients, setDischargedPatients] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [historyAppointments, setHistoryAppointments] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [admittingApt, setAdmittingApt] = useState<any>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);

    // Direct Admission & Search State
    const [directAdmitOpen, setDirectAdmitOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Admission Form State
    const [admitForm, setAdmitForm] = useState({
        roomNumber: "",
        floor: "",
        roomType: "GENERAL",
        diagnosis: "",
        notes: ""
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const statsData = await getDashboardStats();
                const aptsData = await getRecentAppointments();
                const patientsData = await getRecentPatients();
                const historyData = await getAppointmentHistory(); // Fetch history

                const admittedData = await getAdmittedPatients();
                const dischargedData = await getDischargedPatients();

                setStats(statsData);
                setAppointments(aptsData);
                setPatients(patientsData);
                setHistoryAppointments(historyData);
                setAdmittedPatients(admittedData);
                setDischargedPatients(dischargedData);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSearch = async (val: string) => {
        setSearchQuery(val);
        if (val.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const results = await searchPatients(val);
        setSearchResults(results);
        setIsSearching(false);
    };

    const handleSelectPatient = (patient: any) => {
        setAdmittingApt({ patientId: patient.id, patient: patient });
        setSearchResults([]);
        setSearchQuery("");
        setDirectAdmitOpen(false);
        setAdmitForm({
            roomNumber: "",
            floor: "",
            roomType: "GENERAL",
            diagnosis: "",
            notes: ""
        });
    };

    const handleAdmitClick = (appointment: any) => {
        setAdmittingApt(appointment);
        setAdmitForm({
            roomNumber: "",
            floor: "",
            roomType: "GENERAL",
            diagnosis: appointment.reason || "", // Pre-fill diagnosis from reason
            notes: ""
        });
    };

    const handleAdmitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!admittingApt) return;

        const result = await admitPatient(
            admittingApt.patientId,
            admitForm.roomNumber,
            admitForm.floor,
            admitForm.diagnosis,
            admitForm.notes
        );

        if (result.success) {
            alert("Patient admitted successfully!");
            setAdmittingApt(null);
            // Refresh data
            window.location.reload();
        } else {
            alert("Failed to admit: " + result.message);
        }
    };

    const statCards = [
        { label: "Total Patients", value: stats.totalPatients.toString(), icon: Users, color: "text-blue-500", trend: "Total registered" },
        { label: "Appointments Today", value: stats.appointmentsToday.toString(), icon: Calendar, color: "text-primary", trend: "Scheduled" },
        { label: "Pending Requests", value: stats.pendingAppointments.toString(), icon: Activity, color: "text-red-500", trend: "Needs action" },
        { label: "Recovered", value: "-", icon: CheckCircle2, color: "text-green-500", trend: "Not tracked" },
    ];

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center pt-20">Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">

                {/* Search / Direct Admit Modal */}
                {directAdmitOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h3 className="text-xl font-bold">Search Patient</h3>
                                <Button variant="ghost" size="sm" onClick={() => setDirectAdmitOpen(false)}>Close</Button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Search by Name or Phone</label>
                                    <input
                                        autoFocus
                                        className="w-full p-2 rounded-md border text-sm"
                                        placeholder="Type name..."
                                        value={searchQuery}
                                        onChange={e => handleSearch(e.target.value)}
                                    />
                                    {isSearching && <p className="text-xs text-muted-foreground">Searching...</p>}
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                                    {searchResults.length === 0 && searchQuery.length > 1 && !isSearching ? (
                                        <p className="text-sm text-center text-muted-foreground py-4">No patients found</p>
                                    ) : searchResults.map(p => (
                                        <div key={p.id} className="flex justify-between items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer" onClick={() => handleSelectPatient(p)}>
                                            <div>
                                                <p className="font-bold">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.email} | {p.phone}</p>
                                            </div>
                                            <Button size="sm" variant="ghost">Select</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Admission Modal */}
                {admittingApt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border">
                                <h3 className="text-xl font-bold">Admit Patient</h3>
                                <p className="text-sm text-muted-foreground">Admitting {admittingApt.patient?.name}</p>
                            </div>
                            <form onSubmit={handleAdmitSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ward Type</label>
                                        <select
                                            className="w-full p-2 rounded-md border text-sm bg-background"
                                            value={admitForm.roomType}
                                            onChange={e => setAdmitForm({ ...admitForm, roomType: e.target.value })}
                                        >
                                            <option value="GENERAL">General Ward</option>
                                            <option value="ICU">ICU</option>
                                            <option value="PRIVATE">Private Room</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Room Number</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-md border text-sm"
                                            placeholder={admitForm.roomType === "ICU" ? "e.g. 201" : "e.g. 101"}
                                            value={admitForm.roomNumber}
                                            onChange={e => setAdmitForm({ ...admitForm, roomNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-medium">Floor</label>
                                        <input
                                            required
                                            className="w-full p-2 rounded-md border text-sm"
                                            placeholder={admitForm.roomType === "ICU" ? "e.g. 2nd Floor" : "e.g. 1st Floor"}
                                            value={admitForm.floor}
                                            onChange={e => setAdmitForm({ ...admitForm, floor: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Diagnosis</label>
                                    <input
                                        required
                                        className="w-full p-2 rounded-md border text-sm"
                                        placeholder="Admission diagnosis"
                                        value={admitForm.diagnosis}
                                        onChange={e => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Initial Notes</label>
                                    <textarea
                                        className="w-full p-2 rounded-md border text-sm h-24"
                                        placeholder="Notes for rounds..."
                                        value={admitForm.notes}
                                        onChange={e => setAdmitForm({ ...admitForm, notes: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => { setAdmittingApt(null); setSelectedPatient(null); }}>Cancel</Button>
                                    <Button type="submit">Confirm Admission</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Header with Toggles */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {session?.user?.name || "Doctor"}</p>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex space-x-1">
                        <button
                            onClick={() => setViewMode("overview")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "overview"
                                ? "bg-white dark:bg-slate-800 shadow-sm text-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setViewMode("admitted")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "admitted"
                                ? "bg-white dark:bg-slate-800 shadow-sm text-blue-600"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            In-Patient
                        </button>
                        <button
                            onClick={() => setViewMode("discharged")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "discharged"
                                ? "bg-white dark:bg-slate-800 shadow-sm text-green-600"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Discharged
                        </button>
                        <button
                            onClick={() => setViewMode("history")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "history"
                                ? "bg-white dark:bg-slate-800 shadow-sm text-purple-600"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            History
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Link href="/doctor/schedule">
                            <Button variant="outline">Full Schedule</Button>
                        </Link>
                        <Button onClick={() => setDirectAdmitOpen(true)}>Admit Walk-in</Button>
                    </div>
                </div>

                {viewMode === "overview" ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="p-6 card-hover border-none shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                                                <stat.icon className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                                {stat.trend}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Patient List */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Recent Patients</h2>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </div>

                                <div className="space-y-4">
                                    {patients.length === 0 ? (
                                        <p className="text-muted-foreground">No patients found.</p>
                                    ) : (
                                        patients.map((patient, index) => (
                                            <motion.div
                                                key={patient.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <Card className="p-0 overflow-hidden card-hover border-border/50">
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-muted-foreground">
                                                                    {patient.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-lg">{patient.name}</h3>
                                                                    <p className="text-sm text-muted-foreground flex items-center">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        {patient.appointments && patient.appointments.length > 0 ? (
                                                                            <>
                                                                                Last Visit: {new Date(patient.appointments[0].date).toLocaleDateString()}
                                                                                <span className="ml-1 text-xs opacity-70">
                                                                                    {new Date(patient.appointments[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            `Registered: ${new Date(patient.createdAt).toLocaleDateString()}`
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-blue-500 bg-blue-500/10`}>
                                                                New
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                            <div>
                                                                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                                                <div className="flex items-center font-medium">
                                                                    {patient.phone || "N/A"}
                                                                </div>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <p className="text-xs text-muted-foreground mb-1">Details</p>
                                                                <div className="flex items-center font-medium">
                                                                    <FileText className="h-4 w-4 mr-2 text-secondary" />
                                                                    Patient Record
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <Button size="sm" variant="ghost" className="w-full">Details</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Sidebar Schedule */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold">Upcoming Appointments</h2>
                                <Card className="p-6 h-fit bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                                    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-8 pl-6 pb-2">
                                        {appointments.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                                        ) : (
                                            appointments.map((apt, i) => (
                                                <div key={i} className="relative">
                                                    <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 bg-primary ring-4 ring-slate-50 dark:ring-slate-900"></span>
                                                    <p className="text-sm text-muted-foreground mb-1 font-mono">
                                                        {new Date(apt.date).toLocaleDateString()} {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <h4 className="font-bold">{apt.patient?.name || "Unknown Patient"}</h4>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <p className="text-sm text-primary">{apt.reason || "General Checkup"}</p>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                            onClick={() => handleAdmitClick(apt)}
                                                        >
                                                            Admit
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Link href="/doctor/schedule">
                                        <Button variant="outline" className="w-full mt-6">
                                            Full Calendar
                                        </Button>
                                    </Link>
                                </Card>

                                <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
                                    <h3 className="font-bold text-lg mb-2">Emergency Duty</h3>
                                    <p className="text-sm opacity-90 mb-4">You are on call for the ER unit tonight (20:00 - 08:00).</p>
                                    <Button variant="glass" size="sm" className="w-full bg-white/20 hover:bg-white/30 border-white/20">
                                        Acknowledge
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    </>
                ) : viewMode === "admitted" ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center">
                                <Bed className="mr-3 h-6 w-6 text-blue-500" />
                                Admitted Patients (In-Patient)
                            </h2>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search patients..."
                                        className="pl-9 pr-4 py-2 rounded-md border text-sm bg-background w-64"
                                    />
                                </div>
                                <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        {admittedPatients.length === 0 ? (
                            <Card className="p-12 text-center text-muted-foreground">
                                <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No admitted patients found for you.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {admittedPatients.map((admission) => (
                                    <AdmittedPatientCard key={admission.id} admission={admission} />
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Discharged View
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center">
                                <CheckCircle2 className="mr-3 h-6 w-6 text-green-500" />
                                Discharged Patients
                            </h2>
                        </div>

                        {dischargedPatients.length === 0 ? (
                            <Card className="p-12 text-center text-muted-foreground">
                                <p>No discharged patients history.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {dischargedPatients.map((admission) => (
                                    <Card key={admission.id} className="p-6 opacity-80">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg">{admission.patient?.name}</h3>
                                                <p className="text-sm text-muted-foreground">Discharged on: {new Date(admission.dischargeDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold text-green-600 bg-green-100">
                                                DISCHARGED
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {viewMode === "history" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Appointment History</h2>
                            <p className="text-muted-foreground">Detailed history of all completed appointments.</p>
                        </div>

                        {historyAppointments.length === 0 ? (
                            <Card className="p-12 text-center text-muted-foreground">
                                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No completed appointment history found.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {historyAppointments.map((apt) => (
                                    <Card key={apt.id} className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div className="flex items-center gap-4 box-border">
                                                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-white
                                                    ${apt.status === 'COMPLETED' ? 'bg-green-500' : 'bg-slate-400'}`}>
                                                    {apt.patient?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{apt.patient?.name}</h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-muted-foreground gap-1 sm:gap-3">
                                                        <span className="flex items-center">
                                                            <Calendar className="h-3 w-3 mr-1" /> {new Date(apt.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="flex items-center">
                                                            <Clock className="h-3 w-3 mr-1" /> {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                    ${apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}

function AdmittedPatientCard({ admission }: { admission: any }) {
    const [isEditing, setIsEditing] = useState(false);
    const [note, setNote] = useState(admission.notes || "");
    const [saving, setSaving] = useState(false);
    const [discharging, setDischarging] = useState(false);

    async function handleSave() {
        setSaving(true);
        await updateAdmissionNotes(admission.id, note);
        setSaving(false);
        setIsEditing(false);
    }

    async function handleDischarge() {
        if (!confirm("Are you sure you want to discharge this patient?")) return;
        setDischarging(true);
        await dischargePatient(admission.id);
        setDischarging(false);
    }

    return (
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                {admission.patient?.name?.charAt(0) || "P"}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{admission.patient?.name || "Unknown Patient"}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center">
                                    <Bed className="h-4 w-4 mr-1 text-primary" />
                                    Room: {admission.roomNumber}
                                    {admission.floor && <span className="ml-1 text-xs opacity-70">({admission.floor})</span>}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                    {admission.status}
                                </span>
                            </div>
                            <p className="mt-2 text-sm">
                                <span className="font-semibold text-foreground">Diagnosis:</span> {admission.diagnosis}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <p className="text-xs text-muted-foreground">Admitted: {new Date(admission.admissionDate).toLocaleDateString()}</p>
                        <div className="flex gap-2">
                            <Button
                                variant="danger"
                                size="sm"
                                isLoading={discharging}
                                onClick={handleDischarge}
                            >
                                Discharge
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={isEditing ? "bg-primary text-primary-foreground border-primary" : ""}
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                {isEditing ? "Cancel Rounds" : "Daily Rounds / Notes"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 -mx-6 -mb-6 p-6">
                    <h4 className="text-sm font-bold mb-3 flex items-center text-primary">
                        <FileText className="h-4 w-4 mr-2" />
                        Doctor's Notes / Medication / Progress
                    </h4>

                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea
                                className="w-full h-32 p-3 rounded-md border border-input bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Enter daily progress, vital signs, new medications..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button size="sm" onClick={handleSave} isLoading={saving}>
                                    <Save className="h-4 w-4 mr-2" /> Save Progress
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-white dark:bg-slate-950 p-3 rounded-md border border-border/50">
                            {admission.notes || "No notes recorded yet."}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
