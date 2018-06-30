const stomp = require('node-stomp');

// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
let stomp_args = {
    port: 61613,
    host: 'localhost',
    debug: false,
    login: 'guest',
    passcode: 'guest',
};

// 'activemq.prefetchSize' is optional.
// Specified number will 'fetch' that many messages
// and dump it to the client.
let headers = {
    destination: ['/queue/test_q1', '/queue/test_q2'],
    ack: 'client',
    // 'activemq.prefetchSize': '10'
};

let messages = 0;

let client = new stomp.Stomp(stomp_args);

client.IsConnected = false;
client.IsSubscribed = false;
client.AllowReconnect = true;

// start connection with active-mq
client.connect();

client.on('connected', function() {
    console.log('[AMQ] Connected');
    client.subscribe(headers);
    client.IsConnected = true;
    client.IsSubscribed = true;
});

client.on('disconnected', function() {
    console.log('[AMQ] Disconnected');
    client.IsConnected = false;
    client.IsSubscribed = false;
});

client.on('message', function(message) {
    if (client.IsSubscribed == true) {
        messages++;

        console.log("received message : " + message.body[0]);

        client.ack(message.headers['message-id']);
    } else {
        console.log("[AMQ] status : Unsubscribed");
    }
});

client.on('error', function(error_frame) {
    if (Object.keys(error_frame).length > 0) {
        if (error_frame.hasOwnProperty('headers')) {
            console.log('[AMQ] message : ' + error_frame.headers['message']);
        }
    }
    client.disconnect();
});

client.on('receipt', function(receipt) {
    console.log("[AMQ] RECEIPT : " + receipt);
});

process.on("exit", function() {
    console.log('[AMQ] No. of consumed [' + messages + '] messages');
});

// exist process on SIGINT
process.on('SIGINT', function() {
    client.IsSubscribed = false;
    client.AllowReconnect = false;
    setTimeout(() => {
        client.unsubscribe(headers);
        client.disconnect();
    }, 2000);
});

process.on('SIGTERM', function() {
    client.IsSubscribed = false;
    client.AllowReconnect = false;
    setTimeout(() => {
        client.unsubscribe(headers);
        client.disconnect();
    }, 2000);
});

function reconnect() {
    if (client.AllowReconnect && client.IsConnected === false) {
        client.connect();
    }
}

setInterval(reconnect, 5000);