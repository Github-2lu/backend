const sql = require("mssql");
const dotenv = require("dotenv").config({path: "./.env"});
const companyDataModel = require("./models/companyDataModel");

class MarketDBModule{
    constructor(pool){
        this.pool = pool;
    }

    createTable(){
        return new Promise((resolve, reject)=>{
            this.pool.request()
            .query("CREATE TABLE historical_data (timeStamp INT, companyId NVARCHAR(10), high_price DECIMAL(10, 3), low_price DECIMAL(10, 3), open_price DECIMAL(10, 3), close_price DECIMAL(10, 3), volume INT, PRIMARY KEY(timeStamp, companyId))")
            .then(()=>{
                resolve();
            })
            .catch(e=>{
                reject(e);
            })
        });
    }

    addData(companyData){
        return new Promise((resolve, reject)=>{
            this.pool.request()
                    .input("timeStamp", sql.Int, companyData.timeStamp)
                    .input("companyId", sql.NVarChar, companyData.companyId)
                    .input("high_price", sql.Decimal, companyData.high_price)
                    .input("low_price", sql.Decimal, companyData.low_price)
                    .input("open_price", sql.Decimal, companyData.open_price)
                    .input("close_price", sql.Decimal, companyData.close_price)
                    .input("volume", sql.Decimal, companyData.volume)
                    .query("INSERT INTO historical_data (timeStamp, companyId, high_price, low_price, open_price, close_price, volume) VALUES (@timeStamp, @companyId, @high_price, @low_price, @open_price, @close_price, @volume)")
                    .then(()=>{
                        resolve();
                    })
                    .catch(e=>{
                        reject("Failed");
                    })
        });
    }

    findByIdAndTimeStamp(timeStamp, companyId){
        // console.log(timeStamp, companyId);
        return new Promise(async (resolve, reject)=>{
                // await this.pool.query `SELECT * FROM historical_data WHERE timeStamp=56`;
                this.pool.request()
                .input("timeStamp", sql.Int, timeStamp)
                .input("companyId", sql.NVarChar, companyId)
                .query("SELECT * FROM historical_data WHERE timeStamp = @timeStamp AND companyId = @companyId")
                .then((query_ops)=>{
                    if(query_ops.recordset.length == 0){
                        reject("NOT FOUND");
                    }
                    const res = query_ops.recordset[0];
                    resolve(new companyDataModel(res.timeStamp, res.companyId, res.high_price, res.low_price, res.open_price, res.close_price, res.volume));
                })
                .catch(e=>{
                    reject(e)
                })
            });
    }

    findByIdAndTimePeriod(startTime, endTime, companyId){
        // console.log(companyId, timeStamp);
        return new Promise(async (resolve, reject)=>{
                // await this.pool.query `SELECT * FROM historical_data WHERE timeStamp=56`;
                this.pool.request()
                .input("companyId", sql.NVarChar, companyId)
                .input("startTime", sql.Decimal, startTime)
                .input("endTime", sql.Decimal, endTime)
                .query("SELECT * FROM historical_data WHERE timeStamp>=@startTime AND timeStamp<=@endTime AND companyId = @companyId")
                .then((query_ops)=>{
                    // console.log(query_ops);
                    if(query_ops.recordset.length == 0){
                        reject("NOT FOUND");
                    }
                    
                    let res = []
                    query_ops.recordset.forEach(query_op=>{
                        res.push(new companyDataModel(query_op.timeStamp, query_op.companyId, query_op.high_price, query_op.low_price, query_op.open_price, query_op.close_price, query_op.volume));
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

module.exports = MarketDBModule;
