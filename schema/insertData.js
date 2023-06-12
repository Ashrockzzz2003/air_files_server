const insertData = (db) => {
    db.query(`INSERT INTO roles values ('1', 'ADMIN')`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Data Inserted into roles table.");
        }
    });

    db.query(`INSERT INTO roles values ('0', 'USER')`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Data Inserted into roles table.");
        }
    });

    db.query(`INSERT INTO users values ('admin@airfiles.in', 'admin@pass', 'Ashwin Narayanan S', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}', NULL, '1')`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Admin Data Inserted into users table.");
        }
    });

    for (let i = 1; i <= 20; i++) {
        db.query(`INSERT INTO users values ('USER_${i}@airfiles.in', 'SAFEPASSWORD${i}', 'USER_${i}', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}', NULL, '0')`, (err, result) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("[MESSAGE]: Data Inserted into users table.");
            }
        });
    }
}

module.exports = insertData;