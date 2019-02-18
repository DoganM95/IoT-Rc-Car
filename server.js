var http = require('http');

//create a server object:
console.log("listening on port 8080")
http.createServer(function (req, res) {
    console.log("inHandler")
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('Hello World!');
    res.end();
}).listen(8080);