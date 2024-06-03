const sql = require("mssql");
const dotenv = require("dotenv").config({path: "./.env"});
const companyDataModel = require("./models/companyDataModel");


// var config = {
//     "user": process.env.DB_USER,
//     "password": process.env.DB_PASSWORD,
//     "server": process.env.DB_SERVER,
//     "database": process.env.DATABASE,
//     "options":{
//         "trustServerCertificate": true
//     }
// }

// async () =>{
//     try{
//         await sql.connect(config);
//         const result = await sql.query`CREATE TABLE historical_data(companyId NVARCHAR(10) NOT NULL, timeStamp INT NOT NULL, open_price DECIMAL(10, 3), close_price DECIMAL(10, 3), high_price DECIMAL(10, 3), low_price DECIMAL(10, 3), volume INT)`;
//         console.log(result);
//     }catch(e){
//         console.log(e);
//     }
// }

// sql.connect(config, err=>{
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("connection successful");
//     }
// })

// async () =>{
//     try{
//         console.log(await sql.connect(config));
//         // const result = await sql.query`CREATE TABLE historical_data(companyId NVARCHAR(10) NOT NULL, timeStamp INT NOT NULL, open_price DECIMAL(10, 3), close_price DECIMAL(10, 3), high_price DECIMAL(10, 3), low_price DECIMAL(10, 3), volume INT)`;
//         // let result2 = await sql.Request().query(`insert into historical_data (companyId, timeStamp, open_price, close_price, high_price, low_price, volume) values ("WFC", 1234, 34.5, 56.7, 45.3, 67.5, 67)`);
//         const result2 = await sql.query(`select * from historical_data`);
//         console.log(result2);
//     }catch(e){
//         console.log(e);
//     }
// }

// async function useDB(){
//     console.log(await sql.connect(config));
//     const result = await sql.query`CREATE TABLE historical_data(companyId NVARCHAR(10) NOT NULL, timeStamp INT NOT NULL, open_price DECIMAL(10, 3), close_price DECIMAL(10, 3), high_price DECIMAL(10, 3), low_price DECIMAL(10, 3), volume INT)`;
//     console.log(result);

// }

// useDB()

class MarketDBModule{
    constructor(){
        this.sql_config = {
            "user": process.env.DB_USER,
            "password": process.env.DB_PASSWORD,
            "server": process.env.DB_SERVER,
            "database": process.env.DATABASE,
            "options":{
                "trustServerCertificate": true
            }
        }

        this.globalPool = new sql.ConnectionPool(this.sql_config);
        this.pool = null;
    }

    async connectDB(){
        return new Promise((resolve, reject)=>{
            this.globalPool.connect().then((pool)=>{
                // console.log(pool);
                this.pool = pool;
                resolve();
            },
            (e)=>{
                reject(e);
            });
        });
    }

    // async createTable(){
    //     return new Promise((resolve, reject)=>{
    //         sql.query`CREATE TABLE historical_data(companyId NVARCHAR(10) NOT NULL, timeStamp INT NOT NULL, open_price DECIMAL(10, 3) NOT NULL, close_price DECIMAL(10, 3) NOT NULL, high_price DECIMAL(10, 3) NOT NULL, low_price DECIMAL(10, 3) NOT NULL, volume INT NOT NULL, PRIMARY KEY(companyId, timeStamp))`.then(result=>console.log(result));
    //     })
    // }

    addData(companyData){
            // datas.forEach(async (data)=>{
            //     try{
            //         await  sql.query`INSERT INTO historical_data (companyId, timeStamp, open_price, close_price, high_price, low_price, volume) values (${data.companyId}, ${data.timeStamp}, ${data.open_price}, ${data.close_price}, ${data.high_price}, ${data.low_price}, ${data.volume})`;
            //     }catch(e){
                    
            //     }
            // });
            return new Promise((resolve, reject)=>{
                this.pool.request()
                        .input("companyId", sql.NVarChar, companyData.companyId)
                        .input("timeStamp", sql.Int, companyData.timeStamp)
                        .input("high_price", sql.Decimal, companyData.high_price)
                        .input("low_price", sql.Decimal, companyData.low_price)
                        .input("open_price", sql.Decimal, companyData.open_price)
                        .input("close_price", sql.Decimal, companyData.close_price)
                        .input("volume", sql.Decimal, companyData.volume)
                        .query("INSERT INTO historical_data (companyId, timeStamp, high_price, low_price, open_price, close_price, volume) VALUES (@companyId, @timeStamp, @high_price, @low_price, @open_price, @close_price, @volume)")
                        .then(()=>{
                            resolve();
                        })
                        .catch(e=>{
                            reject("Failed");
                        })
            })

            // return new Promise((resolve, reject)=>{
            //         // await  sql.query`INSERT INTO historical_data (companyId, timeStamp, open_price, close_price, high_price, low_price, volume) values (${data.companyId}, ${data.timeStamp}, ${data.open_price}, ${data.close_price}, ${data.high_price}, ${data.low_price}, ${data.volume})`;
                        
            //         });
    }

    async findByIdAndTimeStamp(companyId, timeStamp){
        // console.log(companyId, timeStamp);
        return new Promise(async (resolve, reject)=>{
                // await this.pool.query `SELECT * FROM historical_data WHERE timeStamp=56`;
                this.pool.request()
                .input("timeStamp", sql.Int, timeStamp)
                .input("companyId", sql.NVarChar, companyId)
                .query("SELECT * FROM historical_data WHERE companyId = @companyId AND timeStamp = @timeStamp")
                .then((query_ops)=>{
                    const res = query_ops.recordset[0];
                    resolve(new companyDataModel(res.companyId, res.timeStamp, res.high_price, res.low_price, res.open_price, res.close_price, res.volume));
                })
                .catch(e=>{
                    reject("NOT FOUND")
                })
            });
    }

    async findByIdAndTimePeriod(companyId, startTime, endTime){
        // console.log(companyId, timeStamp);
        return new Promise(async (resolve, reject)=>{
                // await this.pool.query `SELECT * FROM historical_data WHERE timeStamp=56`;
                this.pool.request()
                .input("companyId", sql.NVarChar, companyId)
                .input("startTime", sql.Decimal, startTime)
                .input("endTime", sql.Decimal, endTime)
                .query("SELECT * FROM historical_data WHERE companyId = @companyId AND timeStamp>=@startTime AND timeStamp<=@endTime")
                .then((query_ops)=>{
                    // console.log(query_ops);
                    let res = []
                    query_ops.recordset.forEach(query_op=>{
                        res.push(new companyDataModel(query_op.companyId, query_op.timeStamp, query_op.high_price, query_op.low_price, query_op.open_price, query_op.close_price, query_op.volume));
                    })
                    // const res = query_ops.recordset[0];
                    resolve(res);
                })
                .catch(e=>{
                    reject(e);
                })
            });
    }

    backup(){
        //close the connection sql.close();
    }
}

const marketDBModule = new MarketDBModule();

async function useDB(){
    try{
        marketDBModule.connectDB().then(async()=>{
            // let res = await marketDBModule.findByIdAndTimePeriod("WFC", 1230, 1240)
            try{
                await marketDBModule.addData(new companyDataModel("WFC", 1240, 56.4, 78.5, 45.4, 56.6, 67));
            }catch(e){
                console.log(e);
            }
            // console.log(res);
        });
        // console.log(await marketDBModule.findByIdAndTimeStamp("WFC", 1234));
    }catch(e){
        console.log("ERROR");
    }
    // console.log(res);
    // res = await marketDBModule.createTable();
    // console.log(res);
    // res = await marketDBModule.addData({companyId: "WFE", timeStamp: 1234, open_price: 45.3, close_price: 56.4, high_price: 67.4, low_price: 32.2, volume: 56});
    // console.log(res);
}

useDB();
