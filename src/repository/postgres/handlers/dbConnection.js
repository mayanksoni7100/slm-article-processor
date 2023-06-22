var pgp = require('pg-promise')();
const typesBuiltins = {
    BOOL: 16,
    BYTEA: 17,
    CHAR: 18,
    INT8: 20,
    INT2: 21,
    INT4: 23,
    REGPROC: 24,
    TEXT: 25,
    OID: 26,
    TID: 27,
    XID: 28,
    CID: 29,
    JSON: 114,
    XML: 142,
    PG_NODE_TREE: 194,
    SMGR: 210,
    PATH: 602,
    POLYGON: 604,
    CIDR: 650,
    FLOAT4: 700,
    FLOAT8: 701,
    ABSTIME: 702,
    RELTIME: 703,
    TINTERVAL: 704,
    CIRCLE: 718,
    MACADDR8: 774,
    MONEY: 790,
    MACADDR: 829,
    INET: 869,
    ACLITEM: 1033,
    BPCHAR: 1042,
    VARCHAR: 1043,
    DATE: 1082,
    TIME: 1083,
    TIMESTAMP: 1114,
    TIMESTAMPTZ: 1184,
    INTERVAL: 1186,
    TIMETZ: 1266,
    BIT: 1560,
    VARBIT: 1562,
    NUMERIC: 1700,
    REFCURSOR: 1790,
    REGPROCEDURE: 2202,
    REGOPER: 2203,
    REGOPERATOR: 2204,
    REGCLASS: 2205,
    REGTYPE: 2206,
    UUID: 2950,
    TXID_SNAPSHOT: 2970,
    PG_LSN: 3220,
    PG_NDISTINCT: 3361,
    PG_DEPENDENCIES: 3402,
    TSVECTOR: 3614,
    TSQUERY: 3615,
    GTSVECTOR: 3642,
    REGCONFIG: 3734,
    REGDICTIONARY: 3769,
    JSONB: 3802,
    REGNAMESPACE: 4089,
    REGROLE: 4096
};

/* Returning number as a number instead of string */
pgp.pg.types.setTypeParser(typesBuiltins.INT8, function (value) {
    return parseInt(value);
});

/* Returning database timestamp value as is, without any conversion */
pgp.pg.types.setTypeParser(typesBuiltins.TIMESTAMP, function (stringValue) {
    return stringValue;
});

// timeout every query after 60 seconds
pgp.pg.defaults.query_timeout = process.env.RDBMS_QUERY_TIMEOUT;

global.rdbms_info = null;

export function dbConnection() {
    return new Promise(resolve => {
        try{
            let ssl = null;
            if(process.env.RDBMS_SSL){
                ssl = process.env.RDBMS_SSL;
            }
            global.rdbms_info = pgp({
                host: process.env.RDBMS_HOST,
                port: process.env.RDBMS_PORT,
                user: process.env.RDBMS_USERNAME,
                password: process.env.RDBMS_PASSWORD,
                database: process.env.RDBMS_DB_NAME,
                ssl: ssl,
                application_name: process.env.RDMBS_CONN_NAME,
                max: process.env.RDBMS_MAX_POOL_SIZE,
                min: process.env.RDBMS_MIN_POOL_SIZE,
                idleTimeoutMillis: process.env.RDBMS_IDLE_CONN_TIME_OUT
            });
            resolve(true);
        }catch(err){
            logger.error(`PostgreSQL Database Connection Error`);
            logger.error(err);
            resolve(false);
        }
    });
}

