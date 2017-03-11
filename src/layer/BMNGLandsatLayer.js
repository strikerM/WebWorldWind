/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports BMNGLandsatLayer
 * @version $Id: BMNGLandsatLayer.js 3403 2015-08-15 02:00:01Z tgaskins $
 */
import Location from '../geom/Location';
import Sector from '../geom/Sector';
import TiledImageLayer from '../layer/TiledImageLayer';
import WmsUrlBuilder from '../util/WmsUrlBuilder';

/**
 * Constructs a combined Blue Marble and Landsat image layer.
 * @alias BMNGLandsatLayer
 * @constructor
 * @augments TiledImageLayer
 * @classdesc Displays a combined Blue Marble and Landsat image layer that spans the entire globe.
 */
var BMNGLandsatLayer = function () {
    TiledImageLayer.call(this,
        Sector.FULL_SPHERE, new Location(45, 45), 10, "image/jpeg", "BMNGLandsat256", 256, 256);

    this.displayName = "Blue Marble & Landsat";
    this.pickEnabled = false;

    this.urlBuilder = new WmsUrlBuilder("https://worldwind25.arc.nasa.gov/wms",
        "BlueMarble-200405,esat", "", "1.3.0");
};

BMNGLandsatLayer.prototype = Object.create(TiledImageLayer.prototype);

export default BMNGLandsatLayer;