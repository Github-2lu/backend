const { error } = require("console");
const net = require("net");
const {CircuitBreaker} = require("./circuit_breaker")

const port = 8080;
const host = "127.0.0.1";

const funVar = function writeServer(){
    return new Promise(function(resolve, reject){
        let client = new net.Socket();

        client.connect(port, host, ()=>{
            client.write("hello from client");
        });

        client.on("data", (data)=>{
            console.log("received from server");
            resolve(data);
            client.end();
        });

        client.on("error", (err)=>{
            reject(err);
        });
        
    })
}

async function tryWrite(circuitBreaker){
    try{
        console.log(await circuitBreaker.fire())
    }catch(e){
        console.log(e);
        setTimeout(()=>{
            tryWrite(circuitBreaker)
        }, 2000)
    }
}

const options = {
    errorThresholdPercentage: 50,
    // failureThreshold: 2,
    timeout: 3000,
}
let ciruitBreaker = new CircuitBreaker(funVar, options, 2000, 3);

tryWrite(ciruitBreaker)