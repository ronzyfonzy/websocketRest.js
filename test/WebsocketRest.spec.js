"use strict";

var should = require('chai').should();
var WebsocketRest = require('../src');

var WebSocket = require('ws');
var user = require('./modules/user');
var device = require('./modules/device');

var WebSocketServer = require('ws').Server;
var socketServer = new WebSocketServer({port: 8080});

describe('WebsocketRest', function () {

    var socket;
    var websocketRest;

    before(function(done){

        websocketRest = new WebsocketRest(socketServer,'0.0.0');
        websocketRest.registerModule('user',user);
        websocketRest.registerModule('device',device);
        websocketRest.initMsgListener();
        done();
    });

    beforeEach(function (done) {

        socket = new WebSocket('http://localhost:8080');

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

    describe('Socket send functions',function(){
        it('should responde with error on bad request',function(done){
            socket.on('message', function (msg) {
                msg.should.be.equal(JSON.stringify({
                    "apiVersion" : "0.0.0",
                    "error" : {
                        "code" : 400,
                        "message" : "Bad Request",
                        "errors": ["Keys: [module,method,body] not in request!"]
                    }
                }));
                done();
            });
            socket.send(JSON.stringify({
            }));

        });

        it('should responde on client msg', function (done) {
            socket.on('message',function(msg){
                msg.should.be.equal(JSON.stringify({
                    "apiVersion": "0.0.0",
                    "data": "user.GetUser"
                }));
                done();
            });

            socket.send(JSON.stringify({
                module: 'user',
                method: 'getUser',
                body: 'sdlafjasldkf'
            }));

        });
    })
});
