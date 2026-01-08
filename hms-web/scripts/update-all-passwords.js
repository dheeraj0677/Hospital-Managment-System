const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const updates = [
    // The Legendary 5
    { email: "devi.shetty@hospital.com", password: "HeartHero<3" },
    { email: "paul.farmer@hospital.com", password: "GlobalHealth!" },
    { email: "raghuram.rajan@hospital.com", password: "OncoCare2024" },
    { email: "sanjay.gupta@hospital.com", password: "BrainTrust#" },
    { email: "soumya.swaminathan@hospital.com", password: "PublicHealth@" },

    // The New 4
    { email: "arjun.mehta@hospital.com", password: "Neuro2024!" },
    { email: "sneha.rao@hospital.com", password: "PedsRock1!" },
    { email: "vikram.singh@hospital.com", password: "OrthoBone#" },
    { email: "ananya.patel@hospital.com", password: "DermaSkin$" },

    // Admin & Default
    { email: "admin@hospital.com", password: "admin123" },
    { email: "dr.smith@medicare.com", password: "password123" }
];

async function main() {
    console.log(`Updating credentials (HASHING passwords) for ${updates.length} users...`);

    for (const update of updates) {
        try {
            const hashedPassword = await bcrypt.hash(update.password, 10);

            await prisma.user.update({
                where: { email: update.email },
                data: { password: hashedPassword }
            });
            console.log(`Updated: ${update.email} -> [HASHED]`);
        } catch (e) {
            console.log(`Skipped (not found): ${update.email}`);
        }
    }

    console.log(`Update finished.`);
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
