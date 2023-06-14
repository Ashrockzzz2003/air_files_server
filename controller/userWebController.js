const { db } = require('../connection')

const webTokenGenerator = require('../middleware/webTokenGenerator');
const webTokenValidator = require('../middleware/webTokenValidator');

const fs = require('fs');
const validator = require('validator');
const multer = require('multer')
const upload = multer({ dest: 'userFiles/' })
var zip = require('express-zip');

module.exports = {
    // get userData from token and files from req.files
    testResponse: async (req, res) => {
        return res.status(200).send({
            "message": "CONNECTION ESTABLISHED. Welcome AirFiles user!",
		"team": ["Ashwin Narayanan S", "Deepak Menan R", "A S Sreepadh", "Arjun P"]
        });
    },

    userUploadFile: [
        webTokenValidator,
        upload.single('files'),
        async (req, res) => {
            if (req.userEmail == undefined || req.file == undefined || req.body == undefined) {
                return res.status(400).send('BAD REQUEST');
            }

            let db_connection = await db.promise().getConnection();

            try {

                const userFiles = JSON.parse(req.body.userFiles);

                for (let i = 0; i < userFiles.length; i++) {
                    const timeStamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    db_connection.query(`INSERT INTO files (fileName, fileSize, createdAt) VALUES (?, ?, ?)`, [userFiles[i].fileName, userFiles[i].fileSize, timeStamp]);

                    let [file] = await db_connection.query(`SELECT fileID FROM files WHERE fileName = ? AND fileSize = ? AND createdAt = ?`, [userFiles[i].fileName, userFiles[i].fileSize, timeStamp]);

                    db_connection.query(`INSERT INTO userFiles (userEmail, fileID, updatedAt) VALUES (?, ?, ?)`, [req.userEmail, file[0].fileID, timeStamp]);
                }

                const timeStamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

                db_connection.query(`INSERT INTO compressedFiles (fileID, createdAt) VALUES (?, ?)`, [req.file.filename, timeStamp]);

                db_connection.query(`INSERT INTO userCompressedFiles (userEmail, fileID, updatedAt) VALUES (?, ?, ?)`, [req.userEmail, req.file.filename, timeStamp]);

                return res.status(200).send('FILE UPLOADED');

            } catch (err) {
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                fs.appendFileSync(`error_logs/errorLogs.txt`, `[ERROR, userUploadFile, ${now}]: ${err}\n\n`);
                return res.status(500).send('INTERNAL SERVER ERROR');
            }
        },
    ],

    getUserFiles: [
        webTokenValidator,
        async (req, res) => {
            if (req.userEmail == undefined) {
                return res.status(400).send('BAD REQUEST');
            }

            let db_connection = await db.promise().getConnection();

            try {
                let [userFiles] = await db_connection.query(`SELECT * FROM userFiles WHERE userEmail = ?`, [req.userEmail]);
                if (userFiles.length === 0) {
                    return res.status(200).send('NO FILES FOUND');
                } else {
                    let files = [];
                    for (let i = 0; i < userFiles.length; i++) {
                        let [file] = await db_connection.query(`SELECT * FROM files WHERE fileID = ?`, [userFiles[i].fileID]);
                        files.push(file[0]);
                    }

                    return res.status(200).json(files);
                }
            } catch (err) {
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                fs.appendFileSync(`error_logs/errorLogs.txt`, `[ERROR, getUserFiles, ${now}]: ${err}\n\n`);
                return res.status(500).send('INTERNAL SERVER ERROR');
            }
        }
    ],

    sendCompressedUserFiles: [
        webTokenValidator,
        async (req, res) => {
            if (req.userEmail == undefined) {
                return res.status(400).send('BAD REQUEST');
            }

            let db_connection = await db.promise().getConnection();

            try {
                let [userFiles] = await db_connection.query(`SELECT * FROM userCompressedFiles WHERE userEmail = ?`, [req.userEmail]);

                if (userFiles.length === 0) {
                    return res.status(200).send('NO FILES FOUND');
                } else {
                    let files = [];
                    for (let i = 0; i < userFiles.length; i++) {
                        let [file] = await db_connection.query(`SELECT * FROM compressedFiles WHERE fileID = ?`, [userFiles[i].fileID]);
                        files.push({
                            path: `userFiles/${file[0].fileID}`,
                            name: file[0].fileID
                        });
                    }

                    // zip files and send
                    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                    const zipFileName = `${req.userEmail}_${now}.zip`;

                    res.set('Content-Type', 'application/zip');
                    res.set('Content-Disposition', `attachment; filename=${zipFileName}`);

                    res.zip(files, zipFileName, (err) => {
                        if (err) {
                            console.log('Error sending files:', err);
                        } else {
                            console.log('Files sent successfully');
                        }
                    });
                }
            } catch (err) {
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                fs.appendFileSync(`error_logs/errorLogs.txt`, `[ERROR, sendCompressedUserFiles, ${now}]: ${err}\n\n`);
                return res.status(500).send('INTERNAL SERVER ERROR');
            }
        }
    ],

    userLogin: async (req, res) => {
        if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
            return res.status(400).send('BAD REQUEST');
        };

        if (req.body.userEmail === '' || req.body.userPassword === '') {
            return res.status(400).send('INVALID USEREMAIL OR PASSWORD');
        };

        // todo: PREVENT SQL INJECTION

        let db_connection = await db.promise().getConnection();
        try {
            let [user] = await db_connection.query(`SELECT * FROM userData WHERE userEmail = ? AND userPassword = ?`, [req.body.userEmail, req.body.userPassword]);

            if (user.length === 0) {
                return res.status(404).send('INVALID USEREMAIL OR PASSWORD');
            } else {
                const token = await webTokenGenerator({
                    userEmail: user[0].userEmail,
                    fullName: user[0].fullName,
                    role: user[0].role,
                    createdAt: user[0].createdAt,
                    lastSignIn: user[0].lastSignIn
                });

                db_connection.query(`UPDATE userData SET lastSignIn = ? WHERE userEmail = ?`, [new Date().toISOString().slice(0, 19).replace('T', ' '), user[0].userEmail]);
                db_connection.query(`INSERT INTO loginData (userEmail, loginTime) VALUES (?, ?)`, [user[0].userEmail, new Date().toISOString().slice(0, 19).replace('T', ' ')]);

                res.json({
                    userEmail: user[0].userEmail,
                    fullName: user[0].fullName,
                    role: user[0].role,
                    createdAt: user[0].createdAt,
                    lastSignIn: user[0].lastSignIn,
                    SECRET_TOKEN: token
                });
            }
        } catch (err) {
            console.log(err);
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            now.setUTCHours(now.getUTCHours() + 5);
            now.setUTCMinutes(now.getUTCMinutes() + 30);
            const istTime = now.toISOString().slice(0, 19).replace('T', ' ');
            fs.appendFileSync(`error_logs/errorLogs.txt`, `[ERROR, userLogin, ${istTime}]: ${err}\n\n`);
            return res.status(500).send('INTERNAL SERVER ERROR');
        } finally {
            db_connection.release();
        }
    },

    // without email verification
    userRegister: async (req, res) => {
        if (req.body.userEmail === undefined || req.body.userPassword === undefined || req.body.fullName === undefined) {
            return res.status(400).send('BAD REQUEST');
        }

        if (req.body.userEmail === '' || req.body.userPassword === '' || req.body.fullName === '') {
            return res.status(400).send('INVALID USEREMAIL OR PASSWORD OR FULLNAME');
        }

        if (!validator.isEmail(req.body.userEmail)) {
            return res.status(400).send('INVALID USEREMAIL');
        }

        let db_connection = await db.promise().getConnection();
        try {
            let [user] = await db_connection.query(`SELECT * FROM userData WHERE userEmail = ?`, [req.body.userEmail]);

            if (user.length !== 0) {
                return res.status(409).send('USER ALREADY EXISTS');
            } else {
                db_connection.query(`INSERT INTO userData (userEmail, userPassword, fullName, createdAt, role) VALUES (?, ?, ?, ?, ?)`, [req.body.userEmail, req.body.userPassword, req.body.fullName, new Date().toISOString().slice(0, 19).replace('T', ' '), '0']);
                return res.status(200).send('USER REGISTERED');
            }
        }
        catch (err) {
            console.log(err);
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            now.setUTCHours(now.getUTCHours() + 5);
            now.setUTCMinutes(now.getUTCMinutes() + 30);
            const istTime = now.toISOString().slice(0, 19).replace('T', ' ');
            fs.appendFileSync(`error_logs/errorLogs.txt`, `[ERROR, userRegister, ${istTime}]: ${err}\n\n`);
            return res.status(500).send('INTERNAL SERVER ERROR');
        }
        finally {
            db_connection.release();
        }
    }
}
