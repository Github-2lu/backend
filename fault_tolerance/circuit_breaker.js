const Opossum = require("opossum");

class CircuitBreaker{
    constructor(action, options, resetTimeLimit, retryNum){
        this.action = action;
        this.options = options;
        this.resetTimeLimit = resetTimeLimit;
        this.retryNum = retryNum;
        this.totalTries = 0;
        
        this.breaker = new Opossum(this.action, this.options);
    }

    async fire(){
        return new Promise( async(resolve, reject)=>{
            try{
                resolve(await this.breaker.fire());
            }catch(e){
                reject(e);
            }
        });
    }
}


module.exports = {CircuitBreaker}
