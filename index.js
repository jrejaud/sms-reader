const PushBullet = require('pushbullet');
const pusher = new PushBullet('--INSERT--YOUR--PUSHBULLET--API--TOKEN--HERE');
const http = require("http");
const auth = require("basic-auth");

const PASSWORD = "your_password";
let lastMessage = {};

function startPusherSMSStream() {
  const stream = pusher.stream();
  stream.connect();

    stream.on('connect', () => {
        console.log("Stream connected");
    });

    stream.on('message', (message) => {
        if (isThisIncomingSMS(message)) {
            const data = message.push.notifications[0];
            lastMessage.title = data.title;
            lastMessage.body = data.body;
            console.log("Got SMS", lastMessage);
        }
    });
}

function isThisIncomingSMS(message) {
    if (message.type === "push" && message.push.type === "sms_changed" && message.push.notifications.length != 0) {
        return true;
    }
    return false;
}

function startServer() {
    http.createServer((req, res) => {
        const authData = auth(req);

        if (!authData) {
            //No password
            res.writeHead(401, {'Content-Type': 'text/html'});
            res.end();
            return console.log("No Password provided");
        }

        if (authData.pass !== PASSWORD) {
            //Bad password
            res.writeHead(401, {'Content-Type': 'text/html'});
            res.end();
            return console.log("Bad Password");
        }

        //Password is good, return the last message!
        const lastMessage = getLastMessage();

        if (Object.keys(lastMessage).length < 1) {
            //No Message
            res.writeHead(500, {'Content-Type': 'text/html'});
            res.end();
            return console.log("No Last Message");
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(JSON.stringify({
            'title': lastMessage.title,
            'message': lastMessage.body
        }));
        res.end();
    }).listen(8080);
    console.log("Server Started");
}

function getLastMessage() {
    return lastMessage;
}

startPusherSMSStream();
startServer();
