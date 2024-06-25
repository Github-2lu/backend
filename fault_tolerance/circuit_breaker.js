const Opossum = require("opossum");

class CircuitBreaker{
    constructor({func, errorThresholdPercentage, timeout, resetTimeOut, totalTries, retryTime}){
        
        this.breaker = new Opossum(func, {
            timeout: timeout,
            errorThresholdPercentage: errorThresholdPercentage,
            resetTimeout: resetTimeOut
        });

        this.totalTries = totalTries;
        this.resetTimeOut = resetTimeOut;
        this.retryTime = retryTime;
    }

    async fire(){
            try{
                let res = await this.breaker.fire();
                return {"status": 1, "data": res};
            }catch(e){
                return {"status": 0, "error": e.message};
            }ac
    }

    async run(){
        // let res = await this.fire();
        // if(res["status"]==1){
        //     return res;
        // }

        // let i=1;
        // let intervalId = setInterval(async ()=>{
        //     res = await this.fire();
        //     if(res["status"]==1){
        //         clearInterval(intervalId);
        //         return res;
        //     }
        //     i++;
        //     if(i>=this.totalTries){
        //         clearInterval(intervalId);
        //         return res;
        //     }
        // }, this.resetTimeOut);

        return new Promise(async (resolve, reject)=>{
            let res = await this.fire();
            console.log(res["status"])
            if(res["status"]==1){
                resolve(res["data"]);
            }
            else if(this.totalTries<=1){
                reject(res["error"]);
            }
            else{
                let i=1
                let intervalId = setInterval(async ()=>{
                    res = await this.fire();
                    console.log(res["status"])
                    if(res["status"]==1){
                        clearInterval(intervalId);
                        resolve(res["data"]);
                    }
                    i++;
                    if(i>=this.totalTries){
                        clearInterval(intervalId);
                        reject(res["error"]);
                    }
                }, this.retryTime)
            }
        })
    }
}


module.exports = {CircuitBreaker}
