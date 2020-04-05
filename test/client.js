var stomp = require("../lib/stomp");
var assert = require('assert');

describe('Client', function() {
    var stomp_args = {
        port: 61613,
        host: 'localhost',
        debug: false
    }

    var receipt = false;
    var client = null;

    describe('#initialize', function() {
        it('should initialize client with default arguments', function(done) {
            client = new stomp.Stomp();
            assert.strictEqual(client.host, '127.0.0.1');
            assert.strictEqual(client.port, 61613);
            assert.strictEqual(client.debug, undefined);
            assert.strictEqual(client.ssl, false);
            done();
        });

        it('should initialize client from object', function(done) {
            client = new stomp.Stomp(stomp_args);
            assert.strictEqual(client.host, stomp_args.host);
            assert.strictEqual(client.port, stomp_args.port);
            assert.strictEqual(client.debug, stomp_args.debug);
            assert.strictEqual(client.ssl, false);
            done();
        });
    });

});
