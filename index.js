const express = require('express');
const helmet = require('helmet');
const createTables = require('./schema/createRelations');
const dropTables = require('./schema/dropRelations');
const cluster = require('cluster');
const { pid } = require('process');
const insertData = require('./schema/insertData');
const server = express();
const cors = require('cors');
const userWebRouter = require('./routes/userWeb');
const adminWebRouter = require('./routes/adminWeb');
const { generateKey } = require('./RSA/keyGen');
const createViews = require('./schema/createViews');
const establishConnection = require('./initializeConnection.js');
const fs = require('fs');
const { hostname } = require('os');

const concurrencyLimit = 10;
const PORT = 3000;

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use('/api/userWeb', userWebRouter);
server.use('/api/adminWeb', adminWebRouter);


if (cluster.isMaster) {
    console.log(`[MESSAGE]: Master ${process.pid} is running.`);
    db = establishConnection();

    const initializeOne = () => {
        dropTables(db[0]);
        createTables(db[0]);
        createViews(db[0]);

        if (fs.existsSync('./RSA/public_key.pem') && fs.existsSync('./RSA/private_key.pem')) {
            console.log("[MESSAGE]: Key Exists");
        } else {
            generateKey();
        }

        console.log("[MESSAGE]: Initialization Step 1 done.");
    }

    const initializeTwo = () => {
        insertData(db[0]);
        console.log("[MESSAGE]: Initialization Step 2 done.");
    }

    initializeOne(); // Run only once in production
    initializeTwo(); // Run only once in production

	server.listen(PORT, (err) => {
        if (err) {
            console.log('[ERROR]: Error starting server.');
        } else {
            console.log(`[MESSAGE]: Process ${pid} listening on PORT ${PORT}`);
        }
    	});
} else {
    server.listen(PORT, (err) => {
        if (err) {
            console.log('[ERROR]: Error starting server.');
        } else {
            console.log(`[MESSAGE]: Process ${pid} listening on PORT ${PORT}`);
        }
    })
}
