/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports BMNGOneImageLayer
 * @version $Id: BMNGOneImageLayer.js 2942 2015-03-30 21:16:36Z tgaskins $
 */
import RenderableLayer from '../layer/RenderableLayer';
import Sector from '../geom/Sector';
import SurfaceImage from '../shapes/SurfaceImage';

import * as WorldWind from '../constants';

/**
 * Constructs a Blue Marble image layer that spans the entire globe.
 * @alias BMNGOneImageLayer
 * @constructor
 * @augments RenderableLayer
 * @classdesc Displays a Blue Marble image layer that spans the entire globe with a single image.
 */
var BMNGOneImageLayer = function (imgSrc) {
    RenderableLayer.call(this, "Blue Marble Image");

    imgSrc = imgSrc ||
        WorldWind.configuration.baseUrl + "images/BMNG_world.topo.bathy.200405.3.2048x1024.jpg";

    var surfaceImage = new SurfaceImage(Sector.FULL_SPHERE, imgSrc);

    this.addRenderable(surfaceImage);

    this.pickEnabled = false;
    this.minActiveAltitude = 3e6;
};

BMNGOneImageLayer.prototype = Object.create(RenderableLayer.prototype);

export default BMNGOneImageLayer;