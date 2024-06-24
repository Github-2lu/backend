const CircuitBreaker = require("opossum");
const {writeServer} = require("./newClient")

const options = {
    errorThresholdPercentage: 50,
    // failureThreshold: 2,
    timeout: 3000,
    resetTimeout: 7000
};

const breaker = new CircuitBreaker(writeServer, options);

async function checkSocket(){
    try{
        return await breaker.fire();
    }catch(err){
        return err;
    }
}

let i =0
async function check(){
    for(let i=0;i<10;i++){
        data = await checkSocket();
        console.log(`data: ${data}`);
    }
    // console.log(`res${i++}: ${await checkSocket()}`)
}

check()
