const net = require("net");
const Opossum = require("opossum");

const port = 8080;
const host = "127.0.0.1";

const client = new net.Socket();

async function clientConnection(){
        client.connect(port, host, ()=>{
                console.log("connected");
            client.write("hello from client");
        })
    
        // client.on("close", ()=>{
        //     console.log("closed");
        // })
        client.on("error", (e)=>{
            throw new Error("server not found")
        })
}

const circuitBreaker = new Opossum(clientConnection, {
    failureThreshold: 2,
    openTimeout: 2000,
    fallback: ()=>{
        console.warn("circuit breaker tripped");
    }
});

async function runCircuit(){
    try{
        const response = await circuitBreaker.fire()
        return response;
    }catch(error){
        console.error("error occurred");
    }
}

async function circuit(){
    for(let i=0;i<10;i++)
        console.log(`data: ${await runCircuit()}`)
}
circuit()
// clientConnection()