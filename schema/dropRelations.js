const dropTables = (db) => {
    db.query("DROP TABLE userCompressedFiles", (err, result) => {
        if (err) {
            console.log("[ERROR]: userCompressedFiles relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped userCompressedFiles relation.");
        }
    });
    db.query("DROP TABLE userFiles", (err, result) => {
        if (err) {
            console.log("[ERROR]: userFiles relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped userFiles relation.");
        }
    });
    db.query("DROP TABLE files", (err, result) => {
        if (err) {
            console.log("[ERROR]: files relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped files relation.");
        }
    });

    db.query("DROP TABLE compressedFiles", (err, result) => {
        if (err) {
            console.log("[ERROR]: compressedFiles relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped compressedFiles relation.");
        }
    });
    
    db.query("DROP TABLE loginData", (err, result) => {
        if (err) {
            console.log("[ERROR]: loginData relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped loginData relation.");
        }
    });

    db.query("DROP TABLE users", (err, result) => {
        if (err) {
            console.log("[ERROR]: users relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped users relation.");
        }
    });

    db.query("DROP TABLE roles", (err, result) => {
        if (err) {
            console.log("[ERROR]: roles relation does not exist. Failed to drop.");
        }
        else {
            console.log("[MESSAGE]: Dropped roles relation.");
        }
    });
}

module.exports = dropTables;