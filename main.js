const {createServer} = require("http");
const {Server} = require("socket.io");
const DataSource = require("nedb");
const db = new DataSource();

const datas = [{companyId: "WFC", timeLine: 5, open: 56.43, close: 56.33, high: 578.5, low: 233.43, volume: 67},
        {companyId: "WFC", timeLine: 10, open: 56.43, close: 56.33, high: 578.5, low: 233.43, volume: 67},
        {companyId: "AAPL", timeLine: 15, open: 56.43, close: 56.7833, high: 578.5, low: 233.43, volume: 67},
        {companyId: "GOOG", timeLine: 20, open: 56.43, close: 56.4333, high: 578.5, low: 233.43, volume: 67}
        ];

db.insert(datas, (err, doc)=>{});

const httpServer = createServer();

const io = new Server(httpServer, {
    cors:{
        origin: "http://127.0.0.1:5050"
    }
});


let rooms = {};
let startTiming = 5;

io.on("connection", (socket)=>{
    console.log("new User joined");
    socket.on("join_room", (room)=>{
        socket.join(room);
        if(!(room in rooms)){
            rooms[room]=1;
        }
        else{
            rooms[room]++;
        }
        // console.log(rooms);

        setInterval(sendMessage, 4000);
        // console.log("hello");
    });

    socket.on("disconnecting", ()=>{
        for(const room of socket.rooms){
            if(room in rooms){
                rooms[room]--;
            }

            if(rooms[room]==0){
                delete rooms[room];
            }
        }
    })

    function sendMessage(){
        for(const [key, value] of Object.entries(rooms)){
            let queries = [];
            let compQuery = {};
            compQuery.companyId = key;
            queries.push(compQuery);
            let timeQuery = {};
            timeQuery.timeLine = startTiming;
            queries.push(timeQuery);
            console.log(queries);

            db.find({$and: queries}, (err, doc)=>{
                io.to(key).emit("message", doc);
                startTiming += 5;
            })
        }
    }
});

httpServer.listen(3000, ()=>{
    console.log("server is listening");
});