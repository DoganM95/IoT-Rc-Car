let http = require("http");
let fs = require("fs");

http.createServer(handler).listen(8080);

function handler(req, res){
    fs.readFile(__dirname + "/index.html", (err, data) => {
        if(err){
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end();
            return;
        }
        else{ //just for readability
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            res.end();
            return;
        }
    })
}