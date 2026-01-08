"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return { totalPatients: 0, appointmentsToday: 0, pendingAppointments: 0 };

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id },
        include: { _count: { select: { appointments: true } } }
    });

    if (!doctor) return { totalPatients: 0, appointmentsToday: 0, pendingAppointments: 0 };

    // Total Patients = Unique patients assigned to this doctor (distinct on patientId in appointments)
    const uniquePatients = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        distinct: ['patientId'],
        select: { patientId: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await prisma.appointment.count({
        where: {
            doctorId: doctor.id,
            date: {
                gte: today,
                lt: tomorrow,
            },
        },
    });

    const pendingAppointments = await prisma.appointment.count({
        where: {
            doctorId: doctor.id,
            status: "PENDING",
        },
    });

    return {
        totalPatients: uniquePatients.length,
        appointmentsToday,
        pendingAppointments,
    };
}

export async function getRecentAppointments() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return [];

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return [];

    return await prisma.appointment.findMany({
        take: 5,
        orderBy: {
            date: 'asc',
        },
        where: {
            doctorId: doctor.id,
            date: {
                gte: new Date(), // Future appointments
            }
        },
        include: {
            patient: true,
        },
    });
}

export async function getRecentPatients() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return [];

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return [];

    // Find patients who have appointments with this doctor
    // Note: This is slightly inefficient but ensures strict filtering. 
    // Ideally we'd use a raw query or more complex join if performance matters.
    const appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        distinct: ['patientId'],
        orderBy: { date: 'desc' },
        take: 5,
        include: {
            patient: {
                include: {
                    appointments: {
                        where: { doctorId: doctor.id },
                        take: 1,
                        orderBy: { date: 'desc' }
                    }
                }
            }
        }
    });

    return appointments.map(apt => apt.patient);
}

export async function getDoctorSchedule() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return [];

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return [];

    // Return all appointments from today onwards for CURRENT doctor
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.appointment.findMany({
        orderBy: {
            date: 'asc',
        },
        where: {
            doctorId: doctor.id,
            date: {
                gte: today,
            }
        },
        include: {
            patient: true,
        },
    });
}

export async function getAppointmentHistory() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return [];

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return [];

    // Return past appointments for CURRENT doctor
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await prisma.appointment.findMany({
        orderBy: {
            date: 'desc',
        },
        where: {
            doctorId: doctor.id,
            OR: [
                { date: { lt: today } },
                { status: { in: ["COMPLETED", "CANCELLED"] } }
            ]
        },
        take: 50, // Limit history
        include: {
            patient: true,
        },
    });
}
