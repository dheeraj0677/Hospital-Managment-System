const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const doctors = [
    { name: "Dr. Sarah Smith", email: "dr.smith@medicare.com", specialization: "Cardiology" },
    { name: "Dr. Sreedhar Reddy", email: "sreedhar234@gmail.com", specialization: "General Physician" },
    { name: "Dr. Devi Shetty", email: "devi.shetty@hospital.com", specialization: "Cardiothoracic Surgeon" },
    { name: "Dr. Paul Farmer", email: "paul.farmer@hospital.com", specialization: "Infectious Disease Specialist" },
    { name: "Dr. Raghuram G Rajan", email: "raghuram.rajan@hospital.com", specialization: "Breast Cancer Surgeon" },
    { name: "Dr. Sanjay Gupta", email: "sanjay.gupta@hospital.com", specialization: "Neurosurgeon" },
    { name: "Dr. Soumya Swaminathan", email: "soumya.swaminathan@hospital.com", specialization: "Pediatrician" },
    { name: "Dr. Arjun Mehta", email: "arjun.mehta@hospital.com", specialization: "Neurologist" },
    { name: "Dr. Sneha Rao", email: "sneha.rao@hospital.com", specialization: "Pediatrician" },
    { name: "Dr. Vikram Singh", email: "vikram.singh@hospital.com", specialization: "Orthopedic" },
    { name: "Dr. Ananya Patel", email: "ananya.patel@hospital.com", specialization: "Dermatologist" },
    // Additional Doctors
    { name: "Dr. Rajesh Verma", email: "rajesh.verma@hospital.com", specialization: "Oncologist" },
    { name: "Dr. Meena Kapoor", email: "meena.kapoor@hospital.com", specialization: "Psychiatrist" },
    { name: "Dr. Aditya Singh", email: "aditya.singh@hospital.com", specialization: "Endocrinologist" },
    { name: "Dr. Pooja Iyer", email: "pooja.iyer@hospital.com", specialization: "Gastroenterologist" },
    { name: "Dr. Suresh Nair", email: "suresh.nair@hospital.com", specialization: "Ophthalmologist" },
    { name: "Dr. Kavita Desai", email: "kavita.desai@hospital.com", specialization: "ENT Specialist" },
    { name: "Dr. Manoj Kumar", email: "manoj.kumar@hospital.com", specialization: "Pulmonologist" },
    { name: "Dr. Lakshmi Reddy", email: "lakshmi.reddy@hospital.com", specialization: "Nephrologist" }
];

async function main() {
    console.log(`Start seeding ${doctors.length} doctors...`);

    // Default password for everyone
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const doc of doctors) {
        // 1. Upsert User
        const user = await prisma.user.upsert({
            where: { email: doc.email },
            update: {
                name: doc.name,
                password: hashedPassword, // Ensure password is reset/set to default
                role: 'DOCTOR'
            },
            create: {
                email: doc.email,
                name: doc.name,
                password: hashedPassword,
                role: 'DOCTOR'
            }
        });

        // 2. Upsert Doctor Profile
        // We use userId to find the doctor.
        await prisma.doctor.upsert({
            where: { userId: user.id },
            update: {
                specialization: doc.specialization,
                // availability: 'Mon-Fri 09:00-17:00' // Optional: keep existing availability or update
            },
            create: {
                userId: user.id,
                specialization: doc.specialization,
                availability: 'Mon-Fri 09:00-17:00'
            }
        });

        console.log(`Processed: ${doc.name} (${doc.email})`);
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
