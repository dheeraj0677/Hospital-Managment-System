const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../dev.db');
const db = new sqlite3.Database(dbPath);

async function seed() {
    const email = 'dr.smith@medicare.com';
    const userId = 'user_cm5_seed_01';
    const doctorId = 'doc_cm5_seed_01';
    // We need a patient ID. Let's assume we create one or use a fixed one.
    const patientIf = 'pat_cm5_seed_001';
    const admissionId = 'adm_cm5_seed_001';

    const password = await bcrypt.hash('password123', 10);
    const now = new Date().toISOString();

    db.serialize(() => {
        // 1. Insert User (Doctor)
        db.run(`INSERT OR IGNORE INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, email, password, 'Dr. Sarah Smith', 'DOCTOR', now, now]);

        // 2. Insert Doctor Profile
        db.run(`INSERT OR IGNORE INTO Doctor (id, userId, specialization, availability) VALUES (?, ?, ?, ?)`,
            [doctorId, userId, 'Cardiology', 'Mon-Fri 09:00-17:00']);

        // 3. Insert Patient User & Profile (if not exists)
        // Need a user for patient first
        const patUserId = 'user_pat_seed_001';
        db.run(`INSERT OR IGNORE INTO User (id, email, password, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [patUserId, 'patient@example.com', password, 'John Doe', 'PATIENT', now, now]);

        db.run(`INSERT OR IGNORE INTO Patient (id, userId, name, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
            [patientIf, patUserId, 'John Doe', '555-0101', now, now]);


        // 4. Insert Admission
        // status defaults to ADMITTED if not specified, but we specify it.
        db.run(`INSERT OR IGNORE INTO Admission (id, patientId, doctorId, roomNumber, diagnosis, notes, status, admissionDate, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [admissionId, patientIf, doctorId, 'ICU-04', 'Acute Bronchitis', 'Patient stable. Monitor O2 levels every 2 hours.', 'ADMITTED', now, now, now],
            function (err) {
                if (err) {
                    console.error('Error inserting admission:', err);
                } else {
                    console.log('Admission data ensured.');
                }
            }
        );
    });

    // Wait a bit to ensure async writes finish before closing (naive but works for seed)
    setTimeout(() => {
        db.close();
    }, 1000);
}

seed();
