/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports GeoTiffUtil
 */
import ArgumentError from '../../error/ArgumentError';
import Logger from '../../util/Logger';
import TiffConstants from './TiffConstants';

var GeoTiffUtil = {

    // Get bytes from an arraybuffer depending on the size.
    getBytes: function (geoTiffData, byteOffset, numOfBytes, isLittleEndian, isSigned) {
        if (numOfBytes <= 0) {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "GeoTiffReader", "getBytes", "noBytesRequested"));
        }
        else if (numOfBytes <= 1) {
            if (isSigned) {
                return geoTiffData.getInt8(byteOffset, isLittleEndian);
            }
            else {
                return geoTiffData.getUint8(byteOffset, isLittleEndian);
            }
        }
        else if (numOfBytes <= 2) {
            if (isSigned) {
                return geoTiffData.getInt16(byteOffset, isLittleEndian);
            }
            else {
                return geoTiffData.getUint16(byteOffset, isLittleEndian);
            }
        }
        else if (numOfBytes <= 3) {
            if (isSigned) {
                return geoTiffData.getInt32(byteOffset, isLittleEndian) >>> 8;
            }
            else {
                return geoTiffData.getUint32(byteOffset, isLittleEndian) >>> 8;
            }
        }
        else if (numOfBytes <= 4) {
            if (isSigned) {
                return geoTiffData.getInt32(byteOffset, isLittleEndian);
            }
            else {
                return geoTiffData.getUint32(byteOffset, isLittleEndian);
            }
        }
        else if (numOfBytes <= 8) {
            return geoTiffData.getFloat64(byteOffset, isLittleEndian);
        }
        else {
            throw new ArgumentError(
                Logger.logMessage(Logger.LEVEL_SEVERE, "GeoTiffReader", "getBytes", "tooManyBytesRequested"));
        }
    },

    // Get sample value from an arraybuffer depending on the sample format.
    getSampleBytes: function (geoTiffData, byteOffset, numOfBytes, sampleFormat, isLittleEndian) {
        var res;

        switch (sampleFormat) {
        case TiffConstants.SampleFormat.UNSIGNED:
            res = this.getBytes(geoTiffData, byteOffset, numOfBytes, isLittleEndian, false);
            break;
        case TiffConstants.SampleFormat.SIGNED:
            res = this.getBytes(geoTiffData, byteOffset, numOfBytes, isLittleEndian, true);
            break;
        case TiffConstants.SampleFormat.IEEE_FLOAT:
            if (numOfBytes == 3) {
                res = geoTiffData.getFloat32(byteOffset, isLittleEndian) >>> 8;
            }
            else if (numOfBytes == 4) {
                res = geoTiffData.getFloat32(byteOffset, isLittleEndian);
            }
            else if (numOfBytes == 8) {
                res = geoTiffData.getFloat64(byteOffset, isLittleEndian);
            }
            else {
                Logger.log(Logger.LEVEL_WARNING, "Do not attempt to parse the data  not handled: " +
                    numOfBytes);
            }
            break;
        case TiffConstants.SampleFormat.UNDEFINED:
        default:
            res = this.getBytes(geoTiffData, byteOffset, numOfBytes, isLittleEndian, false);
            break;
        }

        return res;
    },

    // Converts canvas to an image.
    canvasToTiffImage: function (canvas) {
        var image = new Image();
        image.src = canvas.toDataURL();
        return image;
    },

    // Get RGBA fill style for a canvas context as a string.
    getRGBAFillValue: function (r, g, b, a) {
        if (typeof a === 'undefined') {
            a = 1.0;
        }
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    },

    // Get the tag value as a string.
    getTagValueAsString: function (tagName, tagValue) {
        for (var property in tagName) {
            if (tagName[property] === tagValue) {
                return property;
            }
        }
        return undefined;
    },

    // Clamp color sample from color sample value and number of bits per sample.
    clampColorSample: function (colorSample, bitsPerSample) {
        var multiplier = Math.pow(2, 8 - bitsPerSample);
        return Math.floor((colorSample * multiplier) + (multiplier - 1));
    },

    // Clamp color sample for elevation data from elevation sample values.
    clampColorSampleForElevation: function (elevationSample, minElevation, maxElevation) {
        var slope = 255 / (maxElevation - minElevation);
        return Math.round(slope * (elevationSample - minElevation))
    },

    // Get min and max geotiff sample values.
    getMinMaxGeotiffSamples: function (geotiffSampleArray, noDataValue) {
        var min = Infinity;
        var max = -Infinity;
        for (var i = 0; i < geotiffSampleArray.length; i++) {
            for (var j = 0; j < geotiffSampleArray[i].length; j++) {
                for (var k = 0; k < geotiffSampleArray[i][j].length; k++) {
                    if (geotiffSampleArray[i][j][k] == noDataValue) {
                        continue;
                    }

                    if (geotiffSampleArray[i][j][k] > max) {
                        max = geotiffSampleArray[i][j][k];
                    }
                    if (geotiffSampleArray[i][j][k] < min) {
                        min = geotiffSampleArray[i][j][k];
                    }
                }
            }
        }

        return {max: max, min: min};
    }
};

export default GeoTiffUtil;