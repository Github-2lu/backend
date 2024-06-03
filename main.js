const dbConnection = require("./db_connect");
const MarketDBModule = require("./maketDB");
const CompanyDataModel = require("./models/companyDataModel");


async function checkDB(){
    try{
        const pool = await dbConnection.connect();
        const marketDBModule = new MarketDBModule(pool);
        // await marketDBModule.addData(new CompanyDataModel(1240, "wfa", 56, 35, 64, 46, 34));
        console.log(await marketDBModule.findByIdAndTimePeriod(1250, 1260, "wfc"));
        // await marketDBModule.createTable();
        pool.close();
    }catch(e){
        console.log(e);
    }
}

checkDB()
