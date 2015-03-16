/* jslint node: true */

'use strict';

var crypto = require('crypto'),
    _ = require('underscore');

function Storage() {
    this.storage = {};
}

Storage.prototype.generateId = function generateId() {
    var id = crypto.randomBytes(8).toString('hex');

    if (this.exists(id)) {
        return this.generateId();
    }

    return id;
};

Storage.prototype.exists = function exists(id, key) {
    var doesExist = _.has(this.storage, id) &&
                    _.isObject(this.storage[id]);

    if (key && doesExist === true) {
        doesExist = _.has(this.storage[id], key);
    }

    return doesExist;
};

Storage.prototype.create = function create() {
    var id, now;

    id = this.generateId();
    now = new Date();

    this.storage[id] = {
        _createdDate: now,
        _lastModifiedDate: now
    };

    return id;
};

Storage.prototype.get = function read(id, key) {
    if (!this.exists(id, key)) {
        return null;
    }

    return this.storage[id][key];
};

Storage.prototype.set = function update(id, key, value, overwrite) {
    if (!this.exists(id)) {
        return false;
    }

    if (this.exists(id, key) && !overwrite) {
        return false;
    }

    this.storage[id][key] = value;
    this.storage[id]._lastModifiedDate = new Date();

    return true;
};

Storage.prototype.update = function update(id, key, value) {
    return this.set(id, key, value, true);
};

Storage.prototype.remove = function remove(id, key) {
    if (key) {
        if (!this.exists(id, key)) {
            return false;
        }

        this.storage[id][key] = null;
        this.storage[id]._lastModifiedDate = new Date();

        return true;
    }

    if (!this.exists(id)) {
        return false;
    }

    this.storage[id] = null;

    return true;
};

Storage.prototype.ids = function ids() {
    return _.chain(this.storage).keys().filter(function(id) {
        return this.exists(id);
    }, this).value();
};

Storage.prototype.createdDate = function createdDate(id) {
    if (!this.exists(id)) {
        return null;
    }

    return this.storage[id]._createdDate;
};

Storage.prototype.lastModifiedDate = function createdDate(id) {
    if (!this.exists(id)) {
        return null;
    }

    return this.storage[id]._lastModifiedDate;
};

Storage.prototype.expireByLastModifiedDate = function(maxAgeInMilliseconds) {
    var now, ids;

    now = new Date();
    ids = this.ids();

    _.each(ids, function eachIds(id) {
        var lastModifiedDate, ageInMilliseconds;

        lastModifiedDate = this.lastModifiedDate(id);
        ageInMilliseconds = now.getTime() - lastModifiedDate.getTime();

        if (ageInMilliseconds >= maxAgeInMilliseconds) {
            this.remove(id);
        }
    }, this);
};

module.exports = Storage;
