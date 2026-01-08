"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function adminSeed() {
    // Seed Rooms
    const floors = ["1", "2", "3"];
    const roomTypes = ["GENERAL", "ICU", "PRIVATE"];

    // Create simplistic rooms: 101-110 (Gen), 201-205 (ICU), 301-305 (Private)
    // Check if rooms exist first to avoid duplicates or errors (or use upsert)

    const existingRooms = await prisma.room.count();
    if (existingRooms === 0) {
        await prisma.room.createMany({
            data: [
                // Floor 1: General
                ...Array.from({ length: 10 }, (_, i) => ({
                    number: `10${i + 1}`,
                    floor: "1",
                    type: "GENERAL",
                    price: 50.0,
                    status: "AVAILABLE"
                })),
                // Floor 2: ICU
                ...Array.from({ length: 5 }, (_, i) => ({
                    number: `20${i + 1}`,
                    floor: "2",
                    type: "ICU",
                    price: 200.0,
                    status: "AVAILABLE"
                })),
                // Floor 3: Private
                ...Array.from({ length: 5 }, (_, i) => ({
                    number: `30${i + 1}`,
                    floor: "3",
                    type: "PRIVATE",
                    price: 100.0,
                    status: "AVAILABLE"
                }))
            ]
        });
    }

    // Seed Staff
    const existingStaff = await prisma.staff.count();
    if (existingStaff === 0) {
        await prisma.staff.createMany({
            data: [
                { name: "Alice Nurse", role: "NURSE", department: "ICU", shift: "MORNING" },
                { name: "Bob Cleaner", role: "CLEANER", department: "General", shift: "EVENING" },
                { name: "Carol Reception", role: "RECEPTIONIST", department: "Front Desk", shift: "MORNING" },
                { name: "David Nurse", role: "NURSE", department: "General", shift: "NIGHT" },
            ]
        });
    }

    return { success: true };
}

export async function getRooms() {
    return await prisma.room.findMany({
        orderBy: { number: 'asc' },
        include: { admissions: { where: { status: "ADMITTED" } } }
    });
}

export async function getStaff() {
    return await prisma.staff.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function getAdminStats() {
    const totalRooms = await prisma.room.count();
    const occupiedRooms = await prisma.room.count({ where: { status: "OCCUPIED" } });
    const totalStaff = await prisma.staff.count();
    const totalPatients = await prisma.patient.count();

    return {
        totalRooms,
        occupiedRooms,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        totalStaff,
        totalPatients
    };
}

export async function createDoctor(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const specialization = formData.get("specialization") as string;
    const image = formData.get("image") as string;

    // Create User first (default password for simplicity in this demo)
    // In production, send invite email or set temp password
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: "password123", // Default password
            role: "DOCTOR"
        }
    });

    // Create Doctor Profile
    await prisma.doctor.create({
        data: {
            userId: user.id,
            specialization,
            image
        }
    });

    return { success: true };
}

export async function getAllDoctors() {
    const doctors = await prisma.doctor.findMany({
        include: { user: true }
    });

    return doctors.map(doc => ({
        id: doc.id,
        name: doc.user.name,
        email: doc.user.email,
        specialization: doc.specialization,
        image: doc.image
    }));
}

export async function getAllAppointments() {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                patient: true,
                doctor: {
                    include: { user: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        return appointments;
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return [];
    }
}

export async function updateAppointmentDate(appointmentId: string, newDate: string) {
    try {
        const dateObj = new Date(newDate);
        if (isNaN(dateObj.getTime())) throw new Error("Invalid date");

        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { date: dateObj }
        });

        revalidatePath('/admin/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to update appointment:", error);
        return { success: false, error: "Failed to update" };
    }
}
