const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, '../dev.db'));

db.all("SELECT * FROM Doctor", (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
    db.close();
});
