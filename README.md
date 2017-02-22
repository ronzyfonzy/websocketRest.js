[![websocket-rest Logo](https://www.pubnub.com/blog/wp-content/uploads/2015/01/websockets-vs-rest-api.png)](http://github.com/urosjarc/websocket-rest.com/)

  Fast, opinionated, minimalist websocket rest framework for [node](http://nodejs.org).

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Windows Build][appveyor-image]][appveyor-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

```js

	var websocketRest = require('websocket-rest');
	var server = require('https').createServer();
	
	var WebSocketServer = require('ws').Server;
	var webSocketServer = new WebSocketServer({
		server: server
	});	
   	
	websocketRest.init(webSocketServer, 0.0,1);
	websocketRest.logger(<winston logger instance>);
	websocketRest.registerModule('device',{
		ping : function(req,socket){
			socket.data('Pong',200);
		}
	});
	
	websocketRest.registerOnConnectUrl('/client/connect',function(socket,doConnect){
		socket.info('Connection success!',200);
		doConnect();
	});
	websocketRest.registerOnCloseUrl('/client/connect',function(socket){
		socket.info('Nooooooooo! Wait!',200);
	});
	
	websocketRest.initServer();
	app.listen(3000);
```

```js

	var WebSocket = require('ws');
	
	var client = new WebSocket('http://localhost:3000/client/connect');
	
	client.on('message',function(msg){
		console.log(JSON.parse(msg));
	});
```

## Installation

```bash
$ npm install websocket-rest
```

## Internal working

## Todo

	* Add permmisions on which methods and modules socker from url can connect...


