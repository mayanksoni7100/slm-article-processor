var pgp = require('pg-promise')();
var { getNamespace } = require('cls-hooked');
var fs = require('fs');
const moment = require('moment');

let connectionMap;
let connectionObjMap = new Map();
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
  return new Promise(async function (resolved, rejected) {
    let tenants;
  try {
      if(process.env.TENANT_DB_SOURCE == 'FILE'){
        tenants = JSON.parse(fs.readFileSync(`${process.cwd()}/assets/clientDbList.json`, 'utf8'));
      }else{
        if(global.rdbms_info == null){
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
        }

        /* loading all tenants information */
        tenants = await global.rdbms_info.any(`SELECT * FROM e_customer`, '');
      }
    } catch (e) {
      tenants = [];
      logger.error('PostgreSQL Connection Error');
      logger.error(e);  
      resolved(false);
      return;
    }  
    
    connectionMap = tenants
      .map(tenant => {
        let tenantConf= createConnectionConfig(tenant);
        let justDBConnection = {
          host: tenantConf.host,
          port: tenantConf.port,
          user: tenantConf.user,
          // password: tenantConf.password, //Password no need to consider for uniqueness
          database: tenantConf.database,
          // ssl: tenantConf.ssl
        }
        let tenantConfString= JSON.stringify(justDBConnection);
          if(!connectionObjMap.has(tenantConfString)){
            connectionObjMap.set(tenantConfString, pgp(tenantConf));
            return {
              [tenant.code]: connectionObjMap.get(tenantConfString)
            }
          }else{
            return {
              [tenant.code]: connectionObjMap.get(tenantConfString)
            };
          }
      })
      .reduce((prev, next) => {
        return Object.assign({}, prev, next);
      }, {});
      global.customers = tenants.map(tenant => {
        return {
            id: tenant.id,
            code: tenant.code,
            name: tenant.name,
            max_images: tenant.max_images,
            batch_services: tenant.batch_services,
            timezone: tenant.time_zone,
            description: tenant.description,
            register_date: tenant.register_date,
            is_active: tenant.is_active,
            stores: tenant.stores,
            labels: tenant.labels,
            usersLimit: tenant.users_limit,
            articles: tenant.articles,
            aimsManagerDevices: tenant.aims_manager,
            lcdDevices: tenant.lcd_devices,
            reportDetails: tenant.report_details,
            packages: tenant.packages,
            pickcelAccountId: tenant.pickcel_account_id,
            expiry_date: tenant.expiry_date ? moment(tenant.expiry_date).format('YYYY-MM-DD') : tenant.expiry_date
        };
      });
    resolved(true);
  });    
}

/**
   *  Create configuration object for the given tenant.
   **/
 function createConnectionConfig(tenant) {
    let ssl = null;
    if(process.env.RDBMS_SSL){
        ssl = process.env.RDBMS_SSL;
    }

    if(tenant.rdbms_info.ssl == true){
      ssl = true;
    }else if(tenant.rdbms_info.ssl == false){
      ssl = false;
    }

    return {
        host: tenant.rdbms_info.host, //, '20.194.61.108', //
        port: tenant.rdbms_info.port,
        user: tenant.rdbms_info.username,
        password: tenant.rdbms_info.password,
        database: tenant.rdbms_info.databaseName,
        ssl: ssl,
        application_name: tenant.rdbms_info.connectionName,
        max: tenant.rdbms_info.maxPoolSize,
        min: tenant.rdbms_info.minPoolSize,
        idleTimeoutMillis: tenant.rdbms_info.idleConnTimeout
    }
  }
  
  /**
   * Get the connection information (knex instance) for the given tenant's customerCode.
   */
  export function getConnectionBycustomerCode(customerCode) {
    if (connectionMap) {
      return connectionMap[customerCode];
    }
  }
  /**
   * Get the connection information (knex instance) for current context. Here we have used a
   * getNamespace from 'continuation-local-storage'. This will let us get / set any
   * information and binds the information to current request context.
   */
   export function getConnection() {
    let conn;
    try {
      let nameSpace = getNamespace('api_service_unique_context');
      conn = nameSpace.get('connection');
      if (!conn) {
        logger.info('Connection is not set for any tenant database so returning global rdbms obj.');
        conn = global.rdbms_info;
      }      
    } catch (error) {
      logger.info('Connection is not set for any tenant database so returning global rdbms obj.');
      conn = global.rdbms_info;
    }
    return conn;
  }
