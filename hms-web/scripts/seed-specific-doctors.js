const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const doctors = [
    { name: "Dr. Devi Shetty", specialization: "Cardiothoracic Surgeon", email: "devi.shetty@hospital.com", image: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Devi_Shetty.jpg" },
    { name: "Dr. Paul Farmer", specialization: "Infectious Disease Specialist", email: "paul.farmer@hospital.com", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Paul_Farmer_2015.jpg/800px-Paul_Farmer_2015.jpg" },
    { name: "Dr. Raghuram G Rajan", specialization: "Breast Cancer Surgeon", email: "raghuram.rajan@hospital.com", image: "https://upload.wikimedia.org/wikipedia/commons/0/05/Raghuram_Rajan_IMF_2015.jpg" },
    { name: "Dr. Sanjay Gupta", specialization: "Neurosurgeon", email: "sanjay.gupta@hospital.com", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Sanjay_Gupta_2011.jpg/800px-Sanjay_Gupta_2011.jpg" },
    { name: "Dr. Soumya Swaminathan", specialization: "Pediatrician", email: "soumya.swaminathan@hospital.com", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Soumya_Swaminathan_%28IMG_6615%29.jpg/800px-Soumya_Swaminathan_%28IMG_6615%29.jpg" }
];

async function main() {
    console.log(`Start seeding ${doctors.length} doctors...`);

    for (const doc of doctors) {
        // Upsert User
        const user = await prisma.user.upsert({
            where: { email: doc.email },
            update: {},
            create: {
                email: doc.email,
                name: doc.name,
                password: "password123", // Default password
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

        console.log(`Created/Updated: ${doc.name}`);
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
