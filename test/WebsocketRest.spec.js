"use strict";

var should = require('chai').should();
var WebsocketRest = require('../bin');

var WebSocket = require('ws');
var test = require('./modules/test');

var WebSocketServer = require('ws').Server;
var socketServer = new WebSocketServer({port: 9000});

describe('WebsocketRest', function () {

    var socket;
    var websocketRest;

    before(function(done){

        websocketRest = new WebsocketRest(socketServer,'0.0.0');
        websocketRest.registerModule('test',test);
        websocketRest.init();
        done();
    });

    beforeEach(function (done) {
		websocketRest.onClose(function(){});
		websocketRest.setOnConnect(function(){});

        socket = new WebSocket('http://localhost:9000?param0=param');

        socket.on('open',function(){
            done();
        });

    });

    afterEach(function (done) {
        // Cleanup
        socket.on('close',function(){
            done();
        });

        socket.close();

    });

	describe('registerModule',function(){
		it('should not call methods with private in name',function(done){
			socket.on('message', function (msg) {
				msg.should.be.equal(JSON.stringify({
                    "apiVersion" : "0.0.0",
					"method" : "connect",
					"module" : "event",
					"code": 405,
					"error" : {
						"message": "Method Not Allowed",
						"errors": ["You can not call private methods!"]
					}
                }));
				done();
			});
			socket.send(JSON.stringify({
				"module": 'test',
				"method": 'privateMethod'
			}));
		});
	});

    describe('send functions',function(){
        it('should responde with error on bad request',function(done){
            socket.on('message', function (msg) {
                msg.should.be.equal(JSON.stringify({
                    "apiVersion" : "0.0.0",
					"method" : "connect",
					"module" : "event",
					"code" : 400,
                    "error" : {
                        "message" : "Bad Request",
                        "errors": ["Keys: [module,method] not in request!"]
                    }
                }));
                done();
            });
            socket.send();

        });

        it('data should be in socket', function (done) {
            socket.on('message',function(msg){
                msg.should.be.equal(JSON.stringify({
                    "apiVersion": "0.0.0",
					method: 'dataResponse',
					module: 'test',
					code : 200,
                    "data": "dataResponse"
                }));
                done();
            });

            socket.send(JSON.stringify({
                module: 'test',
                method: 'dataResponse',
                data: 'test.dataResponse'
            }));
        });

		it('error should be in socket',function(done){
			socket.on('message',function(msg){
				msg.should.be.equal(JSON.stringify({
					"apiVersion": "0.0.0",
					method: 'errorResponse',
					module: 'test',
					"code": 500,
					"error" : {
						"message": "errorResponse",
						"errors": [
							"error0",
							"error1"
						]
					}
				}));
				done();
			});

			socket.send(JSON.stringify({
				module: 'test',
				method: 'errorResponse',
				data: 'test.errorResponse'
			}));

		})
    });

	describe('additional keys',function(){

		it('should have address',function(done){
			socket.on('message', function (msg) {
				msg.should.be.equal("127.0.0.1");
				done();
			});
			socket.send(JSON.stringify({
				module : 'test',
				method : 'returnAddress'
			}));
		});

		it('should have key',function(done){
			socket.on('message', function (msg) {
				msg.should.be.a("string");
				done();
			});
			socket.send(JSON.stringify({
				module : 'test',
				method : 'returnKey'
			}));
		});

		it('should have returnParams', function (done) {
			socket.on('message', function (msg) {
				msg.should.be.equal(JSON.stringify({
					"apiVersion" : "0.0.0",
					'method': 'returnParams',
					'module': 'test',
					code: 200,
					"data" : {
						"param0" : "param"
					}
				}));
				done();
			});
			socket.send(JSON.stringify({
				'module': 'test',
				'method': 'returnParams'
			}));
		});

		it('should have returnHeaders', function (done) {
			socket.on('message', function (msg) {
				msg.should.be.equal(JSON.stringify({
					"apiVersion": "0.0.0",
					'method': 'returnHeaders',
					'module': 'test',
					code: 200,
					"data": "localhost:9000"
				}));
				done();
			});
			socket.send(JSON.stringify({
				'module': 'test',
				'method': 'returnHeaders'
			}));
		});

		it('should have connectedAt', function (done) {
			socket.on('message', function (msg) {
				JSON.parse(msg).data.should.be.a("string");
				done();
			});
			socket.send(JSON.stringify({
				'module': 'test',
				'method': 'connectedAt'
			}));
		});
	});

	describe('getConnectedClient',function(){
		it('should return socket',function(done){
			socket.on('message', function () {
				var key = socket._socket._httpMessage._headers['sec-websocket-key'];
				WebsocketRest.getConnectedClient(key).key.should.be.equal(key);
				done();
			});
			socket.send();
		});
	})
});
