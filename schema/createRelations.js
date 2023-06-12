const createTables = (db) => {
    db.query(`CREATE TABLE roles (
        role varchar(1) PRIMARY KEY,
        roleName varchar(200) NOT NULL,
        CONSTRAINT check_role CHECK (role IN ('0', '1'))
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created roles table.");
        }
    });

    db.query(`CREATE TABLE users (
        userEmail varchar(200) PRIMARY KEY, 
        userPassword varchar(100) NOT NULL,
        fullName varchar(200) NOT NULL,
        createdAt varchar(500) NOT NULL, 
        lastSignIn varchar(500),
        role varchar(1) NOT NULL,
        FOREIGN KEY (role) REFERENCES roles(role)
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created users table.");
        }
    });

    db.query(`CREATE TABLE loginData (
        userEmail varchar(200) NOT NULL,
        loginTime varchar(500) NOT NULL,
        FOREIGN KEY (userEmail) REFERENCES users (userEmail)
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created loginData table.");
        }
    });

    db.query(`CREATE TABLE compressedFiles (
        fileID varchar(200) NOT NULL,
        PRIMARY KEY (fileID),
        createdAt varchar(500) NOT NULL
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created compressedFiles table.");
        }
    });

    db.query(`CREATE TABLE files (
        fileID INT UNSIGNED AUTO_INCREMENT NOT NULL,
        PRIMARY KEY (fileID),
        fileName varchar(200) NOT NULL,
        fileSize varchar(200) NOT NULL,
        createdAt varchar(500) NOT NULL
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created files table.");
        }
    });

    db.query(`CREATE TABLE userCompressedFiles (
        userEmail varchar(200) NOT NULL,
        fileID varchar(200) NOT NULL,
        updatedAt varchar(500) NOT NULL,
        FOREIGN KEY (userEmail) REFERENCES users (userEmail),
        FOREIGN KEY (fileID) REFERENCES compressedFiles (fileID)
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created userCompressedFiles table.");
        }
    });

    db.query(`CREATE TABLE userFiles (
        userEmail varchar(200) NOT NULL,
        fileID INT UNSIGNED NOT NULL,
        updatedAt varchar(500) NOT NULL,
        FOREIGN KEY (userEmail) REFERENCES users (userEmail),
        FOREIGN KEY (fileID) REFERENCES files (fileID)
    )`, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("[MESSAGE]: Created userFiles table.");
        }
    });
}

module.exports = createTables;