/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */

import WWUtil from './util/WWUtil';

export const VERSION = '0.0.0';

export const ABSOLUTE = 'absolute';

export const AFTER_REDRAW = 'afterRedraw';

export const BEFORE_REDRAW = 'beforeRedraw';

export const BEGAN = 'began';

export const CANCELLED = 'cancelled';

export const CHANGED = 'changed';

export const CLAMP_TO_GROUND = 'clampToGround';

export const EARTH_RADIUS = 6371e3;

export const EAST = 'east';

export const ENDED = 'ended';

export const FAILED = 'failed';

export const GREAT_CIRCLE = 'greatCircle';

export const LINEAR = 'linear';

export const MULTI_POINT = 'multiPoint';

export const NORTH = 'north';

export const NULL = 'null';

export const OFFSET_FRACTION = 'fraction';

export const OFFSET_INSET_PIXELS = 'insetPixels';

export const OFFSET_PIXELS = 'pixels';

export const POINT = 'point';

export const POLYLINE = 'polyline';

export const POLYGON = 'polygon';

export const POSSIBLE = 'possible';

export const RECOGNIZED = 'recognized';

export const REDRAW_EVENT_TYPE = 'WorldWindRedraw';

export const RELATIVE_TO_GLOBE = 'relativeToGlobe';

export const RELATIVE_TO_GROUND = 'relativeToGround';

export const RELATIVE_TO_SCREEN = 'relativeToScreen';

export const RHUMB_LINE = 'rhumbLine';

export const SOUTH = 'south';

export const WEST = 'west';

export const configuration = {
    gpuCacheSize: 250e6,
    baseUrl: (WWUtil.worldwindlibLocation()) || (WWUtil.currentUrlSansFilePart() + '/../')
};

export const BingMapsKey = null;
