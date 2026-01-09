"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getRooms, getStaff, getAdminStats, adminSeed, getAllDoctors, createDoctor, getAllAppointments, updateAppointmentDate, createStaff, updateStaff, updateDoctor } from "@/app/actions/admin";
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
    CalendarCheck,
    Trash2
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

    // New State for Staff Management
    const [showAddStaff, setShowAddStaff] = useState<string | null>(null); // 'NURSE', 'OTHER', or null
    const [editingProfile, setEditingProfile] = useState<{
        id: string,
        type: 'DOCTOR' | 'STAFF',
        name: string,
        image: string,
        specialization?: string,
        role?: string,
        department?: string,
        shift?: string
    } | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);

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
                        <Button variant="danger" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
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
                            }, {} as Record<string, any[]>)).sort().map(([floor, floorRooms]: any) => (
                                <div key={floor}>
                                    <h3 className="text-xl font-bold mb-4 flex items-center">
                                        <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-lg text-sm mr-2">Floor {floor}</span>
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {floorRooms.map((room: any) => (
                                            <div
                                                key={room.id}
                                                onClick={() => setSelectedRoom(room)}
                                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${room.status === 'OCCUPIED'
                                                    ? 'border-red-200 bg-red-50 text-red-700 dark:bg-red-900/10 dark:border-red-900/50'
                                                    : 'border-green-200 bg-green-50 text-green-700 dark:bg-green-900/10 dark:border-green-900/50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-lg">{room.number}</span>
                                                    {room.type === 'ICU' && <span className="text-[10px] font-bold bg-white/50 px-1 rounded">ICU</span>}
                                                    {room.type === 'PRIVATE' && <span className="text-[10px] font-bold bg-purple-200 text-purple-800 px-1 rounded">PR</span>}
                                                    {room.type === 'GENERAL' && <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-1 rounded">GW</span>}
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Column 1: Doctors */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center">
                                        <Stethoscope className="mr-2 h-5 w-5 text-blue-600" />
                                        Doctors
                                    </h3>
                                    <Button size="sm" onClick={() => setShowAddDoctor(true)}>
                                        <Plus className="h-4 w-4" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {doctors.map((doc) => (
                                        <Card
                                            key={doc.id}
                                            className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer relative group"
                                            onClick={() => setEditingProfile({
                                                id: doc.id,
                                                type: 'DOCTOR',
                                                name: doc.name,
                                                image: doc.image || '',
                                                specialization: doc.specialization
                                            })}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 overflow-hidden flex-shrink-0 relative">
                                                {doc.image ? (
                                                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    doc.name?.charAt(0)
                                                )}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold truncate">{doc.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{doc.specialization}</p>
                                                <p className="text-xs text-muted-foreground truncate">{doc.email}</p>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        </Card>
                                    ))}
                                    {doctors.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                            No doctors found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 2: Nurses */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center">
                                        <UserCircle className="mr-2 h-5 w-5 text-purple-600" />
                                        Nurses
                                    </h3>
                                    <Button size="sm" onClick={() => setShowAddStaff('NURSE')}>
                                        <Plus className="h-4 w-4" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {staff.filter(s => s.role === 'NURSE').map((member) => (
                                        <Card
                                            key={member.id}
                                            className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer relative group"
                                            onClick={() => setEditingProfile({
                                                id: member.id,
                                                type: 'STAFF',
                                                name: member.name,
                                                image: member.image || '',
                                                role: member.role,
                                                department: member.department,
                                                shift: member.shift
                                            })}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 overflow-hidden flex-shrink-0 relative">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    member.name.charAt(0)
                                                )}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{member.name}</h4>
                                                <p className="text-xs text-muted-foreground">{member.department} • {member.shift}</p>
                                            </div>
                                            <div className="ml-auto flex items-center text-green-600 text-xs">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                                                Active
                                            </div>
                                        </Card>
                                    ))}
                                    {staff.filter(s => s.role === 'NURSE').length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                            No nurses found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Support Staff */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold flex items-center">
                                        <Users className="mr-2 h-5 w-5 text-orange-600" />
                                        Support Staff
                                    </h3>
                                    <Button size="sm" onClick={() => setShowAddStaff('OTHER')}>
                                        <Plus className="h-4 w-4" /> Add
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    {staff.filter(s => s.role !== 'NURSE').map((member) => (
                                        <Card
                                            key={member.id}
                                            className="p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer relative group"
                                            onClick={() => setEditingProfile({ id: member.id, type: 'STAFF', name: member.name, image: member.image || '' })}
                                        >
                                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 overflow-hidden flex-shrink-0 relative">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    member.name.charAt(0)
                                                )}
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Upload className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{member.name}</h4>
                                                <p className="text-xs text-muted-foreground">{member.role}</p>
                                                <p className="text-xs text-muted-foreground">{member.department}</p>
                                            </div>
                                            <div className="ml-auto flex items-center text-green-600 text-xs">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></div>
                                                Active
                                            </div>
                                        </Card>
                                    ))}
                                    {staff.filter(s => s.role !== 'NURSE').length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                            No other staff found.
                                        </div>
                                    )}
                                </div>
                            </div>
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

                {/* Add Staff Modal */}
                {showAddStaff && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border">
                                <h3 className="text-xl font-bold">Add New {showAddStaff === 'NURSE' ? 'Nurse' : 'Staff Member'}</h3>
                            </div>
                            <form action={async (formData) => {
                                await createStaff(formData);
                                setShowAddStaff(null);
                                loadData();
                            }} className="p-6 space-y-4">
                                <input type="hidden" name="role" value={showAddStaff === 'NURSE' ? 'NURSE' : 'RECEPTIONIST'} />
                                {/* Defaulting to RECEPTIONIST for other, user can change if we add dropdown, 
                                    but for now simplistic approach based on user request "Support Staff" */}

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                                    <input name="name" required className="w-full p-2 rounded-lg border bg-background" placeholder="John Doe" />
                                </div>

                                {showAddStaff !== 'NURSE' && (
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Role</label>
                                        <select name="role" required className="w-full p-2 rounded-lg border bg-background">
                                            <option value="RECEPTIONIST">Receptionist</option>
                                            <option value="CLEANER">Cleaner</option>
                                            <option value="ADMIN">Admin</option>
                                            <option value="SECURITY">Security</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Department</label>
                                    <input name="department" required className="w-full p-2 rounded-lg border bg-background" placeholder="e.g. ICU, General, Front Desk" />
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Shift</label>
                                    <select name="shift" required className="w-full p-2 rounded-lg border bg-background">
                                        <option value="MORNING">Morning</option>
                                        <option value="EVENING">Evening</option>
                                        <option value="NIGHT">Night</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Profile Image URL</label>
                                    <input name="image" className="w-full p-2 rounded-lg border bg-background" placeholder="https://example.com/photo.jpg" />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setShowAddStaff(null)}>Cancel</Button>
                                    <Button type="submit">Create Staff</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Edit Full Profile Modal */}
                {editingProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <h3 className="text-xl font-bold">Edit {editingProfile.type === 'DOCTOR' ? 'Doctor' : 'Staff'} Profile</h3>
                                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(null)}>
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>

                            <form action={async (formData) => {
                                const data: any = {
                                    name: formData.get("name"),
                                    image: formData.get("image")
                                };

                                if (editingProfile.type === 'DOCTOR') {
                                    data.specialization = formData.get("specialization");
                                    await updateDoctor(editingProfile.id, data);
                                } else {
                                    data.role = formData.get("role");
                                    data.department = formData.get("department");
                                    data.shift = formData.get("shift");
                                    await updateStaff(editingProfile.id, data);
                                }

                                setEditingProfile(null);
                                loadData();
                            }} className="p-6 space-y-4">

                                <div className="flex justify-center mb-6">
                                    <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative group">
                                        {editingProfile.image ? (
                                            <img src={editingProfile.image} alt={editingProfile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-bold text-slate-400">{editingProfile.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Full Name</label>
                                    <input
                                        name="name"
                                        defaultValue={editingProfile.name}
                                        required
                                        className="w-full p-2 rounded-lg border bg-background"
                                    />
                                </div>

                                {editingProfile.type === 'DOCTOR' ? (
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Specialization</label>
                                        <select
                                            name="specialization"
                                            defaultValue={editingProfile.specialization}
                                            required
                                            className="w-full p-2 rounded-lg border bg-background"
                                        >
                                            <option value="General Physician">General Physician</option>
                                            <option value="Cardiologist">Cardiologist</option>
                                            <option value="Neurologist">Neurologist</option>
                                            <option value="Pediatrician">Pediatrician</option>
                                            <option value="Orthopedic">Orthopedic</option>
                                            <option value="Dermatologist">Dermatologist</option>
                                        </select>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Role</label>
                                            <select
                                                name="role"
                                                defaultValue={editingProfile.role}
                                                required
                                                className="w-full p-2 rounded-lg border bg-background"
                                            >
                                                <option value="NURSE">Nurse</option>
                                                <option value="RECEPTIONIST">Receptionist</option>
                                                <option value="CLEANER">Cleaner</option>
                                                <option value="ADMIN">Admin</option>
                                                <option value="SECURITY">Security</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Department</label>
                                            <input
                                                name="department"
                                                defaultValue={editingProfile.department}
                                                required
                                                className="w-full p-2 rounded-lg border bg-background"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block">Shift</label>
                                            <select
                                                name="shift"
                                                defaultValue={editingProfile.shift}
                                                required
                                                className="w-full p-2 rounded-lg border bg-background"
                                            >
                                                <option value="MORNING">Morning</option>
                                                <option value="EVENING">Evening</option>
                                                <option value="NIGHT">Night</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Profile Image URL</label>
                                    <div className="flex gap-2">
                                        <input
                                            name="image"
                                            defaultValue={editingProfile.image}
                                            className="w-full p-2 rounded-lg border bg-background"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setEditingProfile(null)}>Cancel</Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Room Details Modal */}
                {selectedRoom && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">Room {selectedRoom.number}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedRoom.type} Ward - Floor {selectedRoom.floor}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedRoom(null)}>
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="p-6">
                                {selectedRoom.status === 'OCCUPIED' && selectedRoom.admissions && selectedRoom.admissions[0] ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center font-bold text-2xl text-blue-600">
                                                {selectedRoom.admissions[0].patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold">{selectedRoom.admissions[0].patient.name}</h4>
                                                <div className="flex gap-2 text-sm mt-1">
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admitted</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Diagnosis</label>
                                                <p className="font-medium text-foreground">{selectedRoom.admissions[0].diagnosis}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Medications & Notes</label>
                                                <p className="font-medium text-foreground whitespace-pre-wrap">{selectedRoom.admissions[0].notes || 'No medications listed.'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-muted-foreground uppercase">Admitted On</label>
                                                <p className="font-medium text-foreground">{new Date(selectedRoom.admissions[0].admissionDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                        <h4 className="text-lg font-bold text-green-600">Room Available</h4>
                                        <p className="text-muted-foreground mt-2">This room is clean and ready for new admissions.</p>
                                        <Button className="mt-6 w-full" onClick={() => setSelectedRoom(null)}>Close</Button>
                                    </div>
                                )}
                            </div>
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
