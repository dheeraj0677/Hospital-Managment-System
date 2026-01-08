"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRooms, getStaff, getAdminStats, adminSeed, getAllDoctors, createDoctor, getAllAppointments, updateAppointmentDate } from "@/app/actions/admin";
import {
    LayoutDashboard,
    Bed,
    Users,
    Activity,
    LogOut,
    CheckCircle2,
    XCircle,
    UserCircle,
    Stethoscope,
    Plus,
    Upload,
    CalendarCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "staff" | "doctors" | "appointments">("overview");
    const [stats, setStats] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [showAddDoctor, setShowAddDoctor] = useState(false);

    async function loadData() {
        try {
            const statsData = await getAdminStats();
            const roomsData = await getRooms();
            const staffData = await getStaff();
            const doctorsData = await getAllDoctors();
            const appointmentsData = await getAllAppointments();
            setStats(statsData);
            setRooms(roomsData);
            setStaff(staffData);
            setDoctors(doctorsData);
            setAppointments(appointmentsData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function handleSeed() {
        setSeeding(true);
        await adminSeed();
        await loadData();
        setSeeding(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center">
                            <LayoutDashboard className="mr-3 h-8 w-8 text-primary" />
                            Hospital Administration
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage hospital resources, staff, and occupancy.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSeed}
                            disabled={seeding || (rooms.length > 0 && staff.length > 0)}
                        >
                            {seeding ? "Initializing..." : "Seed Initial Data"}
                        </Button>
                        <Button variant="danger">
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 w-fit">
                    {[
                        { id: "overview", label: "Overview", icon: Activity },
                        { id: "rooms", label: "Room Management", icon: Bed },
                        { id: "staff", label: "Staff Directory", icon: Users },
                        { id: "doctors", label: "Doctors", icon: Stethoscope },
                        { id: "appointments", label: "Appointments", icon: CalendarCheck },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                        >
                            <tab.icon className="mr-2 h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "overview" && stats && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard
                                    label="Total Rooms"
                                    value={stats.totalRooms}
                                    icon={Bed}
                                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                />
                                <StatsCard
                                    label="Occupied Rooms"
                                    value={stats.occupiedRooms}
                                    icon={XCircle}
                                    color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                />
                                <StatsCard
                                    label="Occupancy Rate"
                                    value={`${stats.occupancyRate}%`}
                                    icon={Activity}
                                    color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                />
                                <StatsCard
                                    label="Total Staff"
                                    value={stats.totalStaff}
                                    icon={Users}
                                    color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                                />
                            </div>

                            <Card className="p-6">
                                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                        <Users className="h-6 w-6" />
                                        Add New Staff
                                    </Button>
                                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                        <Bed className="h-6 w-6" />
                                        Manage Floors
                                    </Button>
                                    <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                                        <Activity className="h-6 w-6" />
                                        View Reports
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === "rooms" && (
                        <div className="space-y-8">
                            {/* Group by Floor */}
                            {Object.entries(rooms.reduce((acc, room) => {
                                (acc[room.floor] = acc[room.floor] || []).push(room);
                                return acc;
                            }, {} as Record<string, any[]>)).sort().map(([floor, floorRooms]) => (
                                <div key={floor}>
                                    <h3 className="text-xl font-bold mb-4 flex items-center">
                                        <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm mr-2">Floor {floor}</span>
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {floorRooms.map((room: any) => (
                                            <div
                                                key={room.id}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${room.status === 'OCCUPIED'
                                                    ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:border-red-900/50'
                                                    : 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:border-green-900/50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-lg">{room.number}</span>
                                                    {room.type === 'ICU' && <span className="text-[10px] font-bold bg-white/50 px-1 rounded">ICU</span>}
                                                </div>
                                                <p className="text-xs font-semibold uppercase">{room.status}</p>
                                                {room.status === 'OCCUPIED' && room.admissions && room.admissions[0] && (
                                                    <p className="text-xs mt-2 opacity-80 truncate">By: {room.admissions[0].patient?.name || 'Unknown'}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "staff" && (
                        <Card className="overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Name</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold">Department</th>
                                        <th className="px-6 py-4 font-semibold">Shift</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {staff.map((member) => (
                                        <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <td className="px-6 py-4 font-medium flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 mr-3 flex items-center justify-center font-bold text-slate-500">
                                                    {member.name.charAt(0)}
                                                </div>
                                                {member.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{member.department}</td>
                                            <td className="px-6 py-4">{member.shift}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-green-600">
                                                    <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                                    Active
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )}

                    {activeTab === "doctors" && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <Button onClick={() => setShowAddDoctor(true)}>
                                    <Plus className="h-4 w-4 mr-2" /> Add New Doctor
                                </Button>
                            </div>

                            <Card className="overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-muted-foreground uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Doctor</th>
                                            <th className="px-6 py-4 font-semibold">Specialization</th>
                                            <th className="px-6 py-4 font-semibold">Email</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {doctors.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                                <td className="px-6 py-4 font-medium flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 mr-3 overflow-hidden flex items-center justify-center font-bold text-slate-500">
                                                        {doc.image ? (
                                                            <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            doc.name?.charAt(0)
                                                        )}
                                                    </div>
                                                    {doc.name}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                                        {doc.specialization}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">{doc.email}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center text-green-600">
                                                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                                                        Active
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    )}
                </motion.div>

                {/* Appointments Tab */}
                {activeTab === "appointments" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Appointment Management</h2>
                        </div>
                        <Card className="overflow-hidden border-0 shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Doctor</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {appointments.map((apt) => (
                                            <AppointmentRow key={apt.id} apt={apt} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Add Doctor Modal */}
                {showAddDoctor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border">
                                <h3 className="text-xl font-bold">Add New Doctor</h3>
                            </div>
                            <form action={async (formData) => {
                                await createDoctor(formData);
                                setShowAddDoctor(false);
                                loadData();
                            }} className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                                    <input name="name" required className="w-full p-2 rounded-lg border bg-background" placeholder="Dr. Jane Doe" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Email</label>
                                    <input name="email" type="email" required className="w-full p-2 rounded-lg border bg-background" placeholder="doctor@hospital.com" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Specialization</label>
                                    <select name="specialization" required className="w-full p-2 rounded-lg border bg-background">
                                        <option value="">Select Specialization</option>
                                        <option value="General Physician">General Physician</option>
                                        <option value="Cardiologist">Cardiologist</option>
                                        <option value="Neurologist">Neurologist</option>
                                        <option value="Pediatrician">Pediatrician</option>
                                        <option value="Orthopedic">Orthopedic</option>
                                        <option value="Dermatologist">Dermatologist</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Profile Image URL</label>
                                    <input name="image" className="w-full p-2 rounded-lg border bg-background" placeholder="https://example.com/photo.jpg" />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setShowAddDoctor(false)}>Cancel</Button>
                                    <Button type="submit">Create Doctor</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="p-6 flex items-center space-x-4 border-none shadow-md">
            <div className={`p-4 rounded-full ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <h3 className="text-2xl font-bold">{value}</h3>
            </div>
        </Card>
    );
}

function AppointmentRow({ apt }: { apt: any }) {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    // Note: timezone handling might be tricky, simple ISO slice for now
    const [newDate, setNewDate] = useState(new Date(apt.date).toISOString().slice(0, 16));
    const [updating, setUpdating] = useState(false);

    async function handleUpdate() {
        setUpdating(true);
        const result = await updateAppointmentDate(apt.id, newDate);
        if (result.success) {
            alert("Appointment updated successfully!");
        } else {
            alert("Failed to update.");
        }
        setUpdating(false);
    }

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-foreground">{apt.patient.name}</div>
                <div className="text-sm text-muted-foreground">{apt.patient.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-foreground">{apt.doctor.user.name}</div>
                <div className="text-sm text-muted-foreground">{apt.doctor.specialization}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {new Date(apt.date).toLocaleString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="p-2 border rounded-md text-sm bg-background/50 focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        apt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {apt.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <Button size="sm" onClick={handleUpdate} disabled={updating} className="h-8">
                    {updating ? "..." : "Update"}
                </Button>
            </td>
        </tr>
    );
}
