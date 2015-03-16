/* jslint node: true */

'use strict';

var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    Busboy = require('busboy');

function TransferManager(storage) {
    EventEmitter.call(this);

    this.storage = storage;
}

util.inherits(TransferManager, EventEmitter);

TransferManager.prototype.pipeFile = function pipeFile(id) {
    var sender, receiver, busboy;

    sender = this.storage.get(id, 'sender');
    receiver = this.storage.get(id, 'receiver');

    busboy = new Busboy({
        headers: sender.request.headers
    });

    busboy.on('file', function onFile(fieldname, file, filename) {
        filename = filename.toLowerCase();

        receiver.response.setHeader(
            'content-disposition',
            'attachment; filename="' + filename + '"'
        );

        file.pipe(receiver.response);
    });

    receiver.request.on('end', function onEnd() {
        sender.response.end();

        this.emit('pipeFileComplete', id);
    }.bind(this));

    sender.request.pipe(busboy);
};

module.exports = TransferManager;
