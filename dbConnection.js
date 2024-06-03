const sql = require("mssql");
const dotenv = require("dotenv").config({path: "./.env"});

// create a global pooling
// security in connection
// using max one pooling so others can't connect
// sql injection does not work
// all db connection information is in .env file
// as we are using parameterized query so query caching is done perfectly
// here we are using timeStamp and companyId as primary key so the datas are sorted and that columns are used in clustering index
// by timeStamp first and then inside a timeStamp companyId will be sorted. As common
// db operations are storing or fetching data using timeStamp and comapnyId so the query will be much faster
// and a comapny will have many timeStamps data but in a timeStamp we will have around 200 companies
// so sorting the data using timeStamp later companyId will give faster query result
// here non clustering index is not used so no extra disk space and no additional index table update while inserting, deleting and updating
// check if view can be implemented in this db
// backup database
// create separate user and grant them limited aceess to database like only add and select no update and delete access

class DBConnection{
    constructor(){
        this.sql_config = {
            "user": process.env.DB_USER,
            "password": process.env.DB_PASSWORD,
            "server": process.env.DB_SERVER,
            "database": process.env.DATABASE,
            "options":{
                "trustServerCertificate": true,
                "encrypt": true
            },
            "pool": {
                "max": 5,
                "min": 0,
                "idleTimeoutMillis": 1000
            }
        }
    }

    connect(){
        const globalPool = new sql.ConnectionPool(this.sql_config);
        return new Promise((resolve, reject)=>{
            globalPool.connect().then((pool)=>{
                // console.log(pool);
                resolve(pool);
            })
            .catch((e)=>{
                reject(e);
            })
        });
    }
}

const dbConnection = new DBConnection();

module.exports = dbConnection;
