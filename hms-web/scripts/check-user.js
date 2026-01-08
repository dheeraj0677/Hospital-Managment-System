const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../dev.db');
const db = new sqlite3.Database(dbPath);

const email = 'dr.smith@medicare.com';
const password = 'password123';

db.get(`SELECT * FROM User WHERE email = ?`, [email], async (err, row) => {
    if (err) {
        console.error('Database error:', err);
        return;
    }

    if (!row) {
        console.log('User NOT found in database.');
    } else {
        console.log('User FOUND:', {
            id: row.id,
            email: row.email,
            role: row.role,
            passwordHash: row.password.substring(0, 10) + '...' // Print first few chars
        });

        const isMatch = await bcrypt.compare(password, row.password);
        console.log('Password comparison result:', isMatch ? 'MATCH' : 'FAIL');
    }

    db.close();
});
