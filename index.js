var express = require("express");
var app = express();
var http = require("http").Server(app);
var socket = require("socket.io");
var io = socket(http);
const request = require('request');

app.get("/", function (req, res) {
    //res.send("hello there ");
    res.sendFile(__dirname + "/index.html");
});

var users = [];
var onlineuser = [];
io.on("connection", function (socket) {
    users.push(socket);
    console.log("new user connected" + users.length);
    socket.on("disconnect", function () {
        users.splice(users.indexOf(socket), 1);
        onlineuser.splice(onlineuser.indexOf(socket.username), 1);
        console.log("user is disconnected" + users.length);
    });

    function updateuser() {
        //return active user to frontend, all aline user will see that active user
        console.log("here");
        io.sockets.emit("get user", onlineuser)
    }
    socket.on("new user", function (data) {
        socket.username = data;
        onlineuser.push(socket.username);
        console.log(" user connected " + socket.username);
        updateuser();
    });
    socket.on("msg", function (name, msg) {

        request.post('https://nlp-prediction.herokuapp.com/predictapi', {
            json: {
                messge: msg
            }
        }, (error, res, body) => {
            if (error) {
                console.error(error)
                return
            }
            console.log(body);
            msg = msg + '  { ' + body + ' } ';
            io.sockets.emit("rmsg", {
                name: name,
                msg: msg
            });

            console.log(name + " and " + msg);

        })



    });

})

http.listen(1234, function () {
    //after server is creater it tell whether server is created or not
    console.log("Server is created with port 1234");
})