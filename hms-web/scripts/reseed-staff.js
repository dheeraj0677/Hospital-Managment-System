const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing existing staff...');
    await prisma.staff.deleteMany({});

    const indianStaff = [
        // Nurses (15)
        { name: "Anjali Sharma", role: "NURSE", department: "ICU", shift: "MORNING" },
        { name: "Priya Patel", role: "NURSE", department: "Pediatrics", shift: "EVENING" },
        { name: "Kavita Reddy", role: "NURSE", department: "General", shift: "NIGHT" },
        { name: "Sneha Gupta", role: "NURSE", department: "Emergency", shift: "MORNING" },
        { name: "Meera Iyer", role: "NURSE", department: "Cardiology", shift: "EVENING" },
        { name: "Riya Singh", role: "NURSE", department: "Neurology", shift: "MORNING" },
        { name: "Pooja Verma", role: "NURSE", department: "Orthopedics", shift: "EVENING" },
        { name: "Neha Kapoor", role: "NURSE", department: "ICU", shift: "NIGHT" },
        { name: "Divya Nair", role: "NURSE", department: "General", shift: "MORNING" },
        { name: "Sanya Malhotra", role: "NURSE", department: "Pediatrics", shift: "EVENING" },
        { name: "Ishita Desai", role: "NURSE", department: "Emergency", shift: "NIGHT" },
        { name: "Roshni Khan", role: "NURSE", department: "Cardiology", shift: "MORNING" },
        { name: "Tanvi Shah", role: "NURSE", department: "Neurology", shift: "EVENING" },
        { name: "Kiran Bedi", role: "NURSE", department: "Orthopedics", shift: "NIGHT" },
        { name: "Pallavi Joshi", role: "NURSE", department: "General", shift: "MORNING" },

        // Support Staff (15)
        { name: "Rajesh Kumar", role: "CLEANER", department: "General", shift: "MORNING" },
        { name: "Suresh Singh", role: "SECURITY", department: "Main Gate", shift: "NIGHT" },
        { name: "Deepak Verma", role: "RECEPTIONIST", department: "Front Desk", shift: "MORNING" },
        { name: "Amit Yadav", role: "WARD_BOY", department: "General", shift: "EVENING" },
        { name: "Lakshmi Narayanan", role: "CLEANER", department: "ICU", shift: "NIGHT" },
        { name: "Rahul Mehta", role: "WARD_BOY", department: "Emergency", shift: "MORNING" },
        { name: "Sunil Kumar", role: "SECURITY", department: "Parking", shift: "EVENING" },
        { name: "Mahendra Yadav", role: "CLEANER", department: "General", shift: "NIGHT" },
        { name: "Vikram Malhotra", role: "RECEPTIONIST", department: "Front Desk", shift: "MORNING" },
        { name: "Rohit Verma", role: "WARD_BOY", department: "ICU", shift: "EVENING" },
        { name: "Harish Patel", role: "CLEANER", department: "Pediatrics", shift: "NIGHT" },
        { name: "Ravi Desai", role: "SECURITY", department: "Emergency", shift: "MORNING" },
        { name: "Jatin Shah", role: "WARD_BOY", department: "Orthopedics", shift: "EVENING" },
        { name: "Shikhar Gupta", role: "CLEANER", department: "Neurology", shift: "NIGHT" },
        { name: "Kunal Joshi", role: "RECEPTIONIST", department: "Admin Block", shift: "MORNING" }
    ];

    console.log('🌱 Seeding new Indian staff...');

    for (const staff of indianStaff) {
        await prisma.staff.create({
            data: staff
        });
    }

    console.log('✅ Done! Added 10 new staff members.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
