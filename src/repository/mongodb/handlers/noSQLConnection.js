var format = require('string-template');
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

global.nosql_info = null;

function noSQLConnection() {
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");

    //url = format("mongodb://solum:solum1!@{host}:{port}/?authSource={authdb}", {
    //url = `mongodb://${process.env.NOSQL_USERNAME}:${process.env.NOSQL_PASSWORD}@${process.env.NOSQL_HOST}:${process.env.NOSQL_PORT}/?authSource=${process.env.NOSQL_AUTH_DB}`;
    url = format("mongodb://admin:admin123@{host}:{port}/?authSource={authdb}", {
        host: process.env.NOSQL_HOST,
        port: process.env.NOSQL_PORT,
        authdb : process.env.NOSQL_AUTH_DB
    });

    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info(url);
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");
    logger.info("------------------");

    MongoClient.connect(url, { poolSize: 1000 }, function(err, db) {
        assert.equal(null, err);
        global.nosql_info=db;
    }
    );
}

module.exports = noSQLConnection;
