const mysql = require('mysql2')
const logger = require('../util/logger')
const dotenv = require('dotenv');



const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true
};

logger.trace(dbConfig);

const pool = mysql.createPool(dbConfig);

pool.on('connection', function (connection) {
    logger.trace(`Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`);
});

pool.on('acquire', function (connection) {
    logger.trace('Connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
    logger.trace('Connection %d released', connection.threadId);
});

const queryString = 'SELECT * FROM `user` WHERE `firstName` = ? AND `id` > ?';
const name = 'Herman';
const isActive = 1;

pool.getConnection(function (err, connection) {
    if (err) {
        logger.error(err);
        return 1;
    }

    connection.query(queryString, [name, isActive], function (error, results, fields) {
        connection.release();
        if (error) {
            logger.error(error);
            return 1;
        }

        logger.debug('#results = ', results.length);
        logger.debug({ statusCode: 200, results: results });
    });
});

module.exports = pool;
