/* jslint node: true */

'use strict';

var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    os = require('os'),
    restify = require('restify');

function Server(storage) {
    EventEmitter.call(this);

    this.storage = storage;
    this.server = restify.createServer();

    this.server.use(restify.CORS());
    this.server.use(restify.gzipResponse());

    this.server.post(
        '/transfer',
        this.createTransfer.bind(this)
    );

    this.server.post(
        '/transfer/:id',
        this.ensureTransferExists.bind(this),
        this.setTransferSender.bind(this),
        this.onTransferUpdate.bind(this)
    );

    this.server.get(
        '/transfer/:id',
        this.ensureTransferExists.bind(this),
        this.setTransferReceiver.bind(this),
        this.onTransferUpdate.bind(this)
    );

    this.server.listen(process.env.DIRECTSEND_PORT || 8080);
}

util.inherits(Server, EventEmitter);

Server.prototype.createTransfer =
    function createTransfer(request, response, next) {
        var id = this.storage.create();

        response.send(200, {
            id: id,
            hostname: os.hostname()
        });

        next();
    };

Server.prototype.ensureTransferExists =
    function ensureTransferExists(request, response, next) {
        var exists = this.storage.exists(request.params.id);

        if (exists === false) {
            return response.send(404);
        }

        next();
    };

Server.prototype.setTransferSender =
    function setTransferSender(request, response, next) {
        var success = this.storage.set(request.params.id, 'sender', {
            request: request,
            response: response
        });

        if (success === false) {
            return response.send(500);
        }

        next();
    };


Server.prototype.setTransferReceiver =
    function setTransferReceiver(request, response, next) {
        var success = this.storage.set(request.params.id, 'receiver', {
            request: request,
            response: response
        });

        if (success === false) {
            return response.send(500);
        }

        next();
    };

Server.prototype.onTransferUpdate =
    function onTransferUpdate(request, response, next) {
        this.emit('transferUpdate', request.params.id);

        next();
    };

module.exports = Server;
