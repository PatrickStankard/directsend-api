/* jslint node: true */

'use strict';

var Storage = require('./Storage'),
    Server = require('./Server'),
    TransferManager = require('./TransferManager'),
    _ = require('underscore');

function DirectSend(params) {
    params = params || {};

    this.maxAgeInMilliseconds = 3 * 60 * 1000; /* 3 minutes */

    this.storage = new Storage();
    this.server = new Server(this.storage);
    this.transferManager = new TransferManager(this.storage);

    _.extend(this, _.pick(params, [
        'maxAgeInMilliseconds'
    ]));

    this.server.on(
        'transferUpdate',
        this.onTransferUpdate.bind(this)
    );

    this.transferManager.on(
        'pipeFileComplete',
        this.onPipeFileComplete.bind(this)
    );

    setInterval(
        this.setIntervalStorageExpiry.bind(this),
        this.maxAgeInMilliseconds
    );
}

DirectSend.prototype.onTransferUpdate =
    function onTransferUpdate(id) {
        var hasSender, hasReceiver;

        hasSender = this.storage.exists(id, 'sender');
        hasReceiver = this.storage.exists(id, 'receiver');

        if (hasSender && hasReceiver) {
            this.transferManager.pipeFile(id);
        }
    };

DirectSend.prototype.onPipeFileComplete =
    function onPipeFileComplete(id) {
        this.storage.remove(id);
    };

DirectSend.prototype.setIntervalStorageExpiry =
    function setIntervalStorageExpiry() {
        this.storage.expireByLastModifiedDate(this.maxAgeInMilliseconds);
    };

module.exports = DirectSend;
