/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
import KmlElements from '../KmlElements';
import KmlObject from '../KmlObject';

/**
 *
 * @param options {Object}
 * @augments KmlObject
 * @constructor
 * @alias Create
 */
var Create = function (options) {
    KmlObject.call(this, options);
};

Create.prototype = Object.create(KmlObject.prototype);

Object.defineProperties(Create.prototype, {
    /**
     * All shapes which should be created with the location where they should be created.
     * @memberof Create.prototype
     * @readonly
     * @type {KmlObject[]}
     */
    shapes: {
        get: function () {
            return this._factory.all(this);
        }
    }
});

/**
 * @inheritDoc
 */
Create.prototype.getTagNames = function () {
    return ['Create'];
};

KmlElements.addKey(Create.prototype.getTagNames()[0], Create);

export default Create;