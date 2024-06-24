const net = require("net");
const port = 8080;
const host = "127.0.0.1"

const server = net.createServer();

let i =0

server.on("connection", function(sock){
    console.log("connected: "+ i)
    if(i>1 && i<4){
        sock.destroy()
        // sock.end()
    }
    i++;
    
    sock.on("data", function(data){
        console.log("data: " + data)
        sock.write("closed write now");
    })

    sock.on("close", function(data){
        console.log("server closed")
    })
})

server.listen(port, host, ()=>{
    console.log("server listening on port " + port)
});

