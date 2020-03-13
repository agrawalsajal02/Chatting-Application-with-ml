var express = require("express");
var app = express();
var http = require("http").Server(app);
var socket = require("socket.io");
var io = socket(http);
const request = require('request');

app.get("/", function (req, res) {
    //res.send("hello there ");


    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    var tt = `http://api.ipstack.com/223.230.143.25?access_key=17ebb2b4b9ca92e45770bf8b1fcbdfe5`
    request.get(tt, function (err, dat) {
        var obj = JSON.parse(dat.body);
        var msg = `"ml chat application"|"${obj.region_name}"|"${obj.city}|"${ip}"`;
        var fullmsg = "https://www.fast2sms.com/dev/bulk?authorization=ejdkgTpc0ZuCsH5vL7OFSRwPyaG6UMQtWlYhnIXmqoA9f2xJb8LrCxtquT71KJegEi2NYVvcbRnkSowh&sender_id=FSTSMS&language=english&route=qt&numbers=" + "8084561973" + "&message=19086&variables={DD}|{EE}|{CC}|{FF}&variables_values=" + encodeURIComponent(msg);
        request.get(fullmsg, function (err, body) {
            if (err) {
                console.log("err in sending msg ");
            } else {

                console.log("sms send to guest");
            }
        });


    })
    res.sendFile(__dirname + "/index.html");
});
const port = process.env.PORT || 1234

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

http.listen(port, function () {
    //after server is creater it tell whether server is created or not
    console.log("Server is created with port 1234");
})