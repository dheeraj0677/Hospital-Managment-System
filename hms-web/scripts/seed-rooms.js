const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing Rooms and Admissions...');
    await prisma.admission.deleteMany({});
    await prisma.room.deleteMany({});

    console.log('Building Rooms across 5 Floors...');

    // Function to create rooms
    const createRooms = async (floor, type, startNum, count, price) => {
        const rooms = [];
        for (let i = 0; i < count; i++) {
            rooms.push({
                number: `${startNum + i}`,
                floor: floor,
                type: type,
                price: price,
                status: "AVAILABLE"
            });
        }
        return rooms;
    };

    // Floor 1 & 2: General Wards (GW)
    const floor1 = await createRooms("1", "GENERAL", 101, 15, 500.0);
    const floor2 = await createRooms("2", "GENERAL", 201, 15, 500.0);

    // Floor 3: ICU & High Dependency
    const floor3 = await createRooms("3", "ICU", 301, 10, 2000.0);

    // Floor 4 & 5: Private Rooms (PR)
    const floor4 = await createRooms("4", "PRIVATE", 401, 12, 1000.0);
    const floor5 = await createRooms("5", "PRIVATE", 501, 12, 1500.0); // Luxury Suites

    const allRooms = [...floor1, ...floor2, ...floor3, ...floor4, ...floor5];

    // Bulk create rooms
    for (const room of allRooms) {
        await prisma.room.create({ data: room });
    }
    console.log(`✅ Created ${allRooms.length} rooms across 5 floors.`);

    console.log('Creating Patients and Admissions...');

    // Actors moved to Private Rooms (PR)
    const privatePatients = [
        { name: "Amitabh Bachchan", illness: "Routine Checkup", meds: "Multivitamins", roomType: "PRIVATE" },
        { name: "Shah Rukh Khan", illness: "Knee Pain", meds: "Painkillers, Physiotherapy", roomType: "PRIVATE" },
        { name: "Salman Khan", illness: "Checkup", meds: "General monitoring", roomType: "PRIVATE" },
        { name: "Aamir Khan", illness: "Fatigue", meds: "Rest, IV Fluids", roomType: "PRIVATE" },
        { name: "Akshay Kumar", illness: "Muscle Strain", meds: "Relaxants", roomType: "PRIVATE" },
        { name: "Virat Kohli", illness: "Sports Injury", meds: "Ice pack, Pain relief", roomType: "PRIVATE" },
        { name: "Sachin Tendulkar", illness: "Viral Fever", meds: "Paracetamol", roomType: "PRIVATE" },
        { name: "M.S. Dhoni", illness: "Back Pain", meds: "Physiotherapy", roomType: "PRIVATE" },
        { name: "Rohit Sharma", illness: "Flu", meds: "Antivirals", roomType: "PRIVATE" },
        { name: "Deepika Padukone", illness: "Exhaustion", meds: "Rest, Vitamins", roomType: "PRIVATE" },
        { name: "Priyanka Chopra", illness: "Allergy", meds: "Antihistamines", roomType: "PRIVATE" },
        { name: "Alia Bhatt", illness: "Dehydration", meds: "IV Fluids", roomType: "PRIVATE" }
    ];

    // Random patients for General Ward (GW) and ICU
    const otherPatients = [
        { name: "Ramesh Gupta", illness: "Dengue", meds: "IV Fluids, Paracetamol", roomType: "GENERAL" },
        { name: "Suresh Menon", illness: "Malaria", meds: "Antimalarials", roomType: "GENERAL" },
        { name: "Anita Desai", illness: "Fracture", meds: "Calcium, Painkillers", roomType: "GENERAL" },
        { name: "Kamla Devi", illness: "Pneumonia", meds: "Antibiotics", roomType: "ICU" },
        { name: "Raj Malhotra", illness: "Cardiac Arrest", meds: "Beta Blockers", roomType: "ICU" },
        { name: "Simran Singh", illness: "Asthma Attack", meds: "Nebulizer", roomType: "ICU" },
        { name: "Vijay Kumar", illness: "Food Poisoning", meds: "Antibiotics, ORS", roomType: "GENERAL" },
        { name: "Pooja Hegde", illness: "Typhoid", meds: "Antibiotics", roomType: "GENERAL" }
    ];

    const allPatients = [...privatePatients, ...otherPatients];

    // Get a doctor
    const doctor = await prisma.doctor.findFirst();
    if (!doctor) {
        console.log("No doctor found to assign!");
        return;
    }

    for (const p of allPatients) {
        // 1. Create Patient
        const patient = await prisma.patient.create({
            data: {
                name: p.name,
                medicalHistory: p.illness
            }
        });

        // 2. Find ALL available rooms of the matching type
        const availableRooms = await prisma.room.findMany({
            where: {
                type: p.roomType,
                status: "AVAILABLE"
            }
        });

        if (availableRooms.length > 0) {
            // 3. Pick a RANDOM room
            const randomIndex = Math.floor(Math.random() * availableRooms.length);
            const room = availableRooms[randomIndex];

            // 4. Create Admission
            await prisma.admission.create({
                data: {
                    patientId: patient.id,
                    doctorId: doctor.id,
                    roomId: room.id,
                    diagnosis: p.illness,
                    notes: `Medications: ${p.meds}`,
                    roomNumber: room.number,
                    floor: room.floor,
                    status: "ADMITTED"
                }
            });

            // 5. Update Room Status
            await prisma.room.update({
                where: { id: room.id },
                data: { status: "OCCUPIED" }
            });
            console.log(`Admitted ${p.name} to Room ${room.number} (${p.roomType})`);
        } else {
            console.log(`No available ${p.roomType} room for ${p.name}`);
        }
    }

    console.log('✅ Seeding Complete with Scattered Admissions!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
