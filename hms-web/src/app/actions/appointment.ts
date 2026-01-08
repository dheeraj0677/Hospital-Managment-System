"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ShortUniqueId from "short-unique-id";
import { analyzeSymptoms } from "@/lib/symptom-checker";

export async function recommendDoctors(symptoms: string) {
    if (!symptoms) return { specialization: null, doctors: [] };

    const specialization = analyzeSymptoms(symptoms);

    // Find doctors with this specialization
    // Note: We used "General Physician" as default in checker, but seed might have "General" or others.
    // Adjusting query to be loose or exact based on seed.
    // For now, exact match or contains.

    const doctors = await prisma.doctor.findMany({
        where: {
            specialization: {
                contains: specialization
            }
        },
        take: 5
    });

    return { specialization, doctors };
}

const uid = new ShortUniqueId({ length: 8 });

// Helper to check availability
async function findNextAvailableSlot(doctorId: string, date: Date) {
    // Standard hours: 09:00 to 17:00 (5 PM)
    const startHour = 9;
    const endHour = 17;

    // Get all appointments for this doctor on this date
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    dayEnd.setHours(0, 0, 0, 0);

    const existingAppointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            date: {
                gte: dayStart,
                lt: dayEnd,
            },
        },
        select: {
            date: true,
        },
    });

    const bookedTimes = new Set(existingAppointments.map(appt => appt.date.getTime()));

    // Iterate through slots
    // 9:00, 9:30 ... 16:30
    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
            const slot = new Date(date);
            slot.setHours(h, m, 0, 0);

            if (!bookedTimes.has(slot.getTime())) {
                return slot;
            }
        }
    }

    return null; // No slots available
}

export async function bookAppointment(formData: FormData) {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const doctorId = formData.get("doctorId") as string;
    const dateStr = formData.get("date") as string;
    const symptoms = formData.get("symptoms") as string;

    console.log("Auto-Book Request:", { name, phone, doctorId, dateStr, symptoms });

    if (!name || !phone || !doctorId || !dateStr) {
        return { success: false, message: "Missing required fields" };
    }

    const selectedDate = new Date(dateStr);

    // Find next available slot
    const assignedTime = await findNextAvailableSlot(doctorId, selectedDate);

    if (!assignedTime) {
        return { success: false, message: "No available slots for this date. Please choose another date." };
    }

    // Generate readable token
    const token = `APT-${uid.rnd().toUpperCase()}`;

    try {
        // 1. Find or create patient
        let patient = await prisma.patient.findFirst({
            where: { phone: phone }
        });

        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    name,
                    phone,
                }
            });
        }

        // 2. Create Appointment
        await prisma.appointment.create({
            data: {
                date: assignedTime,
                reason: symptoms,
                status: "PENDING",
                doctorId: doctorId,
                patientId: patient.id,
                bookingToken: token,
            }
        });

        revalidatePath("/doctor/dashboard");

        return {
            success: true,
            message: "Appointment booked successfully!",
            bookingToken: token,
            time: assignedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

    } catch (error) {
        console.error("Booking Error:", error);
        return { success: false, message: "Failed to book appointment. Please try again." };
    }
}

export async function getAppointmentStatus(token: string) {
    if (!token) return { found: false };

    // Clean input
    const cleanToken = token.trim().toUpperCase();

    const appointment = await prisma.appointment.findUnique({
        where: { bookingToken: cleanToken },
        include: {
            doctor: {
                select: {
                    specialization: true,
                    user: { select: { name: true } }
                }
            },
            patient: { select: { name: true } }
        }
    });

    if (!appointment) return { found: false };

    return {
        found: true,
        status: appointment.status,
        date: appointment.date,
        doctor: appointment.doctor.user.name, // Assuming Doctor -> User relation
        specialization: appointment.doctor.specialization, // Assuming Doctor model has this
        patientName: appointment.patient.name,
    };
}

export async function updateAppointmentNotes(appointmentId: string, notes: string) {
    if (!appointmentId) return { success: false, message: "Invalid ID" };

    try {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { notes }
        });

        revalidatePath("/doctor/schedule");
        return { success: true, message: "Notes updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update notes" };
    }
}

export async function getDoctors() {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        return doctors.map(doc => ({
            id: doc.id,
            name: doc.user?.name || "Unknown Doctor",
            specialization: doc.specialization
        }));
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }
}

export async function updateAppointment(token: string, newDoctorId: string, newDateStr: string) {
    if (!token || !newDoctorId || !newDateStr) return { success: false, message: "Missing fields" };

    const selectedDate = new Date(newDateStr);
    const assignedTime = await findNextAvailableSlot(newDoctorId, selectedDate);

    if (!assignedTime) {
        return { success: false, message: "No slots available on this date." };
    }

    try {
        await prisma.appointment.update({
            where: { bookingToken: token },
            data: {
                doctorId: newDoctorId,
                date: assignedTime
            }
        });

        const newTime = assignedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { success: true, message: `Updated! New time: ${newTime}` };
    } catch (e) {
        return { success: false, message: "Failed to update appointment." };
    }
}

