var stomp = require('../lib/stomp');

// support version 1.1 and 1.2
// Set debug to true for more verbose output.
// login and passcode are optional (required by rabbitMQ)
var stomp_args = {
    port: 61613,
    host: 'localhost',
    /* additional header */
    debug: false,
    // 'client-id': 'my-client-id',
    // 'accept-version': stomp.VERSIONS.V1_0,
    // 'heart-beat': '5000,5000',
};

// 'activemq.prefetchSize' is optional.
// case multi-dest/Wildcards recommended to set ack to : client-individual
var headers = {
    id: 1,
    destination: ['/queue/test-4', '/queue/test-5'],
    ack: 'client-individual',
    'activemq.prefetchSize': '10'
};

var messages = 0;

var client = new stomp.Stomp(stomp_args);

// start connection with active-mq
client.connect();

client.on('connected', function() {
    console.log('[AMQ] Connected');
    client.subscribe(headers, function(params) {

    });
});

client.on('disconnected', function(err) {
    console.log('[AMQ] Disconnected');
});

var queue = [];

client.on('message', function(frame) {
    messages++;

    var message = frame.body[0];
    var messageId = frame.headers['message-id'];
    var subscription = frame.headers.subscription;

    for (const key in frame.headers) {
        if (frame.headers.hasOwnProperty(key))
            console.log(`[${messages}] ${key} : [${frame.headers[key]}]`);
    }

    console.log(`[${messages}] body : ${message}`);

    client.send({
        destination: '/queue/received',
        expires: 0,
        priority: 9,
        persistent: true,
        'content-type': "text/plain",
        body: message,
    }, false);

    client.ack(frame.headers);
});

client.on('error', function(error_frame) {
    console.log('[AMQ] ERROR : ' + error_frame.headers.message);
    client.disconnect();
});

function unsubscribe(callback) {
    client.unsubscribe(headers);
    setTimeout(callback, 100);
}

function disconnect() {
    unsubscribe(function() {
        setTimeout(function() {
            client.disconnect()
        }, 500);
    });
}

setTimeout(unsubscribe, 10000);

// exist process on SIGINT
process.on('SIGINT', function() {
    disconnect();
});

process.on('SIGTERM', function() {
    disconnect();
});