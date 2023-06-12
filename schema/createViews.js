const createViews = (db) => {
    db.query(`CREATE OR REPLACE VIEW userData as SELECT * FROM users`, (err, result) => { if (err) { console.log("[ERROR]: Error in userData") } });

    db.query(`CREATE OR REPLACE VIEW userRole as SELECT userEmail, role FROM users`, (err, result) => { if (err) { console.log("[ERROR]: Error in userRole") } });

    db.query(`CREATE OR REPLACE VIEW userPassword as SELECT userEmail, userPassword FROM users`, (err, result) => { if (err) { console.log("[ERROR]: Error in userPassword") } });

    db.query(`CREATE OR REPLACE VIEW adminData as SELECT * FROM users WHERE role = '1'`, (err, result) => { if (err) console.log("[ERROR]: Error in userData") });
}

module.exports = createViews;