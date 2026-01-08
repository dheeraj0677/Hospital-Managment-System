"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getAdmittedPatients() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return [];

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return [];

    try {
        const admissions = await prisma.admission.findMany({
            where: {
                doctorId: doctor.id,
                status: "ADMITTED",
            },
            include: {
                patient: true,
            },
            orderBy: {
                admissionDate: 'desc',
            }
        });
        return admissions;
    } catch (error) {
        console.error("Failed to fetch admitted patients:", error);
        return [];
    }
}

export async function updateAdmissionNotes(admissionId: string, notes: string) {
    if (!admissionId) return { success: false, message: "Invalid ID" };

    try {
        await prisma.admission.update({
            where: { id: admissionId },
            data: { notes }
        });

        revalidatePath("/doctor/dashboard");
        return { success: true, message: "Notes updated successfully" };
    } catch (error) {
        console.error("Update error:", error);
        return { success: false, message: "Failed to update notes" };
    }
}

export async function dischargePatient(admissionId: string) {
    if (!admissionId) return { success: false, message: "Invalid ID" };

    try {
        const admission = await prisma.admission.findUnique({ where: { id: admissionId } });
        if (!admission) return { success: false, message: "Admission not found" };

        await prisma.admission.update({
            where: { id: admissionId },
            data: {
                status: "DISCHARGED",
                dischargeDate: new Date(),
            }
        });

        // Release room if tied
        if (admission.roomId) {
            await prisma.room.update({
                where: { id: admission.roomId },
                data: { status: "AVAILABLE" }
            });
        }

        revalidatePath("/doctor/dashboard");
        revalidatePath("/admin/dashboard");
        return { success: true, message: "Patient discharged successfully" };
    } catch (error) {
        console.error("Discharge error:", error);
        return { success: false, message: "Failed to discharge patient" };
    }
}

export async function admitPatient(
    patientId: string,
    roomNumber: string,
    floor: string, // Kept for flexible input if no room found, or for validation
    diagnosis: string,
    notes?: string
) {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return { success: false, message: "Unauthorized" };

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return { success: false, message: "Doctor profile not found" };

    if (!patientId || !roomNumber || !diagnosis) {
        return { success: false, message: "Missing required fields" };
    }

    try {
        // Try to find the Room entity
        const room = await prisma.room.findUnique({
            where: { number: roomNumber }
        });

        // Use the room's floor if available, otherwise use input
        const finalFloor = room ? room.floor : floor;

        // Check if occupied
        if (room && room.status === "OCCUPIED") {
            return { success: false, message: `Room ${roomNumber} is already occupied.` };
        }

        await prisma.admission.create({
            data: {
                patientId,
                doctorId: doctor.id,
                roomNumber,
                floor: finalFloor,
                diagnosis,
                notes,
                status: "ADMITTED",
                admissionDate: new Date(),
                roomId: room ? room.id : undefined
            }
        });

        // Mark room as occupied
        if (room) {
            await prisma.room.update({
                where: { id: room.id },
                data: { status: "OCCUPIED" }
            });
        }

        revalidatePath("/doctor/dashboard");
        revalidatePath("/admin/dashboard");
        return { success: true, message: "Patient admitted successfully" };
    } catch (error) {
        console.error("Admission error:", error);
        return { success: false, message: "Failed to admit patient" };
    }
}

export async function getDischargedPatients() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) return [];

    const doctor = await prisma.doctor.findUnique({
        where: { userId: (session!.user as any).id }
    });

    if (!doctor) return [];

    try {
        const discharged = await prisma.admission.findMany({
            where: {
                doctorId: doctor.id,
                status: "DISCHARGED",
            },
            include: {
                patient: true,
            },
            orderBy: {
                dischargeDate: 'desc',
            }
        });
        return discharged;
    } catch (error) {
        console.error("Failed to fetch discharged patients:", error);
        return [];
    }
}

export async function searchPatients(query: string) {
    if (!query) return [];

    try {
        const patients = await prisma.patient.findMany({
            where: {
                OR: [
                    { name: { contains: query } }, // Case-insensitive handled by SQLite? Maybe not fully without mode: insensitive, but contains is good for now.
                    { phone: { contains: query } }
                ]
            },
            take: 5
        });
        return patients;
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
