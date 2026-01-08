const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const doctors = [
    {
        name: "Dr. Arjun Mehta",
        specialization: "Neurologist",
        email: "arjun.mehta@hospital.com",
        password: "Neuro2024!",
        image: "https://i.pravatar.cc/150?u=arjun"
    },
    {
        name: "Dr. Sneha Rao",
        specialization: "Pediatrician",
        email: "sneha.rao@hospital.com",
        password: "PedsRock1!",
        image: "https://i.pravatar.cc/150?u=sneha"
    },
    {
        name: "Dr. Vikram Singh",
        specialization: "Orthopedic",
        email: "vikram.singh@hospital.com",
        password: "OrthoBone#",
        image: "https://i.pravatar.cc/150?u=vikram"
    },
    {
        name: "Dr. Ananya Patel",
        specialization: "Dermatologist",
        email: "ananya.patel@hospital.com",
        password: "DermaSkin$",
        image: "https://i.pravatar.cc/150?u=ananya"
    }
];

async function main() {
    console.log(`Start seeding ${doctors.length} additional doctors...`);

    for (const doc of doctors) {
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: doc.email },
            update: { password: doc.password }, // Update password if exists
            create: {
                email: doc.email,
                name: doc.name,
                password: doc.password,
                role: "DOCTOR"
            }
        });

        // Upsert Doctor
        await prisma.doctor.upsert({
            where: { userId: user.id },
            update: {
                specialization: doc.specialization,
                image: doc.image
            },
            create: {
                userId: user.id,
                specialization: doc.specialization,
                image: doc.image
            }
        });

        console.log(`Created: ${doc.name} (${doc.email} / ${doc.password})`);
    }

    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
