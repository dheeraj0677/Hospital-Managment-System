import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'dr.smith@medicare.com';
    const password = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Dr. Sarah Smith',
            password,
            role: 'DOCTOR',
            doctorProfile: {
                create: {
                    specialization: 'Cardiology',
                    availability: 'Mon-Fri 09:00-17:00'
                }
            }
        },
    });

    console.log({ user });
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
