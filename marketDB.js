const DataStore = require("nedb");
const fs = require("fs");

class MarketDB{
    constructor(){
        this.db = new DataStore();
    }

    addData(datas){
        return new Promise((resolve, reject)=>{
            this.db.insert(datas, (err, doc)=>{
                err?reject(err):resolve(doc);
            });
        });
    }

    findAll(){
        this.db.find({}, (err, doc)=>{
            console.log(doc);
        });
    }

    async findByIdTimeStampAndDB(comapnyId, timeStamp){
        const fileName = await this.loadDatabase(timeStamp);
        const prevDb = new DataStore({filename: `./backups/${fileName}`, autoload: true});

        let companyQuery = {};
        companyQuery.companyId = comapnyId;

        let timeQuery = {};
        timeQuery.timeStamp = timeStamp;
        
        let query = [];
        query.push(companyQuery, timeQuery);

        return new Promise((resolve, reject)=>{
            prevDb.findOne({$and: query}, {_id: 0}, (err, doc)=>{
                if(err){
                    reject(err);
                }
                else if(doc == null){
                    reject("Not Found");
                }
                else{
                    resolve(doc);
                }
            });
        });
    }

    findByIdAndTimeStamp(comapnyId, timeStamp){
        let companyQuery = {};
        companyQuery.companyId = comapnyId;

        let timeQuery = {};
        timeQuery.timeStamp = timeStamp;
        
        let query = [];
        query.push(companyQuery, timeQuery);
        return new Promise((resolve, reject)=>{
            this.db.findOne({$and: query}, {_id: 0}, async (err, doc)=>{
                if(err){
                    reject(err);
                }
                else if(doc == null){
                    reject("Not Found");
                }
                else{
                    resolve(doc);
                }
            });
        });
    }

    findByIdAndTimePeriod(companyId, startTime, endTime){
        let companyQuery = {};
        companyQuery.companyId = companyId;

        let startTimeQuery = {};
        startTimeQuery.timeStamp={};
        startTimeQuery.timeStamp.$gte = startTime;

        let endTimeQuery = {};
        endTimeQuery.timeStamp = {};
        endTimeQuery.timeStamp.$lte = endTime;

        let query = [];
        query.push(companyQuery, startTimeQuery, endTimeQuery);

        this.db.find({$and: query}, {_id: 0}, (err, doc)=>{
            console.log(doc);
        })
    }

    findAllCompanies(){
        let companiesSet = new Set();
        return new Promise((resolve, reject)=>{
            this.db.find({}, {_id: 0, timeStamp: 0, open:0, close:0, high: 0, low:0}, (err, docs)=>{
                if(err){
                    reject(err);
                }
                else{
                    docs.forEach((doc)=>{
                        companiesSet.add(doc.comapnyId);
                    });
                    resolve([...companiesSet]);
                }
            });
        });

    }

    loadDatabase(timeStamp){
        // fs.readdirSync("./backups").forEach(file=>{ 
        //     const minTimeStamp = parseInt(file.split("-")[1]);
        //     const maxTimeStamp = parseInt(file.split("-")[2].split(".")[0]);
        //     console.log(minTimeStamp, maxTimeStamp, timeStamp);
        //     // if((timeStamp>=minTimeStamp)){
        //     //     return file;
        //     // }
        //     return file;
        //     // console.log(timeStamp<=maxTimeStamp);
        // });
        // return null;

        return new Promise((resolve, reject)=>{
            fs.readdir("./backups", (err, files)=>{
                if(err){
                    reject(err);
                }
                else{
                    files.forEach((file)=>{
                        const minTimeStamp = parseInt(file.split("-")[1]);
                        const maxTimeStamp = parseInt(file.split("-")[2].split(".")[0]);
                        // console.log(minTimeStamp, maxTimeStamp, timeStamp);
                        if(timeStamp>=minTimeStamp && timeStamp<=maxTimeStamp){
                            resolve(file);
                        }
                    });
                    reject("Not Found");
                }
            })
        })
    }

    backup(){
        this.db.find({}).sort({timeStamp: 1}).exec((err, docs)=>{
            // console.log(docs);
            const minTimeStamp = docs[0].timeStamp;
            const maxTimeStamp = docs[docs.length -1].timeStamp;

            const writer = fs.createWriteStream(`./backups/marketData-${minTimeStamp}-${maxTimeStamp}.bak`, {flags: "a"});

            let dataInStrings = [];

            docs.map((doc)=>dataInStrings.push(JSON.stringify(doc)));

            writer.write(dataInStrings.join("\n") + "\n");

            writer.on("finish", ()=>{
                this.db.remove({}, {multi: 1}, (err, num)=>{
                    console.log(`${num} of data removed`);
                });
            });

            writer.end();
        })
    }
}

const marketDB = new MarketDB();

const datas = [{companyId: "WFC", timeStamp: 5, open: 56.43, close: 56.33, high: 578.5, low: 233.43, volume: 67},
        {companyId: "WFC", timeStamp: 10, open: 56.43, close: 56.33, high: 578.5, low: 233.43, volume: 67},
        {companyId: "AAPL", timeStamp: 15, open: 56.43, close: 56.7833, high: 578.5, low: 233.43, volume: 67},
        {companyId: "GOOG", timeStamp: 20, open: 56.43, close: 56.4333, high: 578.5, low: 233.43, volume: 67},
        {companyId: "WFC", timeStamp: 10, open: 56.43, close: 56.33, high: 578.5, low: 233.43, volume: 67},
        ];

marketDB.addData(datas);

// marketDB.findMax();

// marketDB.findAll();
// marketDB.findAllCompanies();
// marketDB.findByIdAndTimeStamp("WFC", 10);
// marketDB.findByIdAndTimePeriod("WFC", 5, 20);
// marketDB.backup();
// marketDB.loadDatabase();
// marketDB.findByIdAndTimeStamp("Wfc", 15);

async function find(comapnyId, timeStamp){
    try{
    console.log(await marketDB.findByIdAndTimeStamp(comapnyId, timeStamp));
    }
    catch(e){
        if(e === "Not Found"){
            try{
                console.log(await marketDB.findByIdTimeStampAndDB(comapnyId, timeStamp));
            }
            catch(e){
                console.log(e);
            }
        }
    }
}

find("WFC", 20);

module.exports = marketDB;