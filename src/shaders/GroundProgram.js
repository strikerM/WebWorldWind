/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports GroundProgram
 */
import GpuProgram from '../shaders/GpuProgram';
import Vec3 from '../geom/Vec3';

/**
 * Constructs a new program.
 * Initializes, compiles and links this GLSL program with the source code for its vertex and fragment shaders.
 * <p>
 * This method creates WebGL shaders for the program's shader sources and attaches them to a new GLSL program.
 * This method then compiles the shaders and then links the program if compilation is successful. Use the bind
 * method to make the program current during rendering.
 *
 * @alias GroundProgram
 * @constructor
 * @augments GpuProgram
 * @classdesc GroundProgram is a GLSL program that draws the ground component of the atmosphere.
 * @param {WebGLRenderingContext} gl The current WebGL context.
 * @throws {ArgumentError} If the shaders cannot be compiled, or linking of
 * the compiled shaders into a program fails.
 */
var GroundProgram = function (gl) {
    var vertexShaderSource =
            'precision mediump int;\n' +

            'const int FRAGMODE_GROUND_PRIMARY_TEX_BLEND = 4;\n' +
            'const int SAMPLE_COUNT = 2;\n' +
            'const float SAMPLES = 2.0;\n' +

            'const float PI = 3.141592653589;\n' +
            'const float Kr = 0.0025;\n' +
            'const float Kr4PI = 0.03141592653589;\n' +
            'const float Km = 0.0015;\n' +
            'const float Km4PI = 0.018849555921534;\n' +
            'const float ESun = 15.0;\n' +
            'const float KmESun = 0.0225;\n' +
            'const float KrESun = 0.0375;\n' +
            'const vec3 invWavelength = vec3(5.60204474633241, 9.473284437923038, 19.643802610477206);\n' +
            'const float atmosphereRadius = 6538137.0;\n' +
            'const float globeRadius = 6378137.0;\n' +
            'const float atmosphereRadius2 = 42747235430769.0;\n' + /* atmosphereRadius^2 */
            'const float scale = 0.00000625;\n' + /* 1 / (atmosphereRadius - globeRadius) */
            'const float scaleDepth = 0.25;\n' + /* The scale depth (i.e. the altitude at which
             the atmosphere's average density is found) */
            'const float scaleOverScaleDepth = 0.000025;\n' + /* fScale / fScaleDepth */

            'uniform int fragMode;\n' +
            'uniform mat4 mvpMatrix;\n' +
            'uniform mat3 texCoordMatrix;\n' +
            'uniform vec3 vertexOrigin;\n' +
            'uniform vec3 eyePoint;\n' +
            //'uniform float eyeMagnitude;\n' + /* The eye point's magnitude */
            'uniform float eyeMagnitude2;\n' + /* eyeMagnitude^2 */
            'uniform vec3 lightDirection;\n' + /* The direction vector to the light source */

            'attribute vec4 vertexPoint;\n' +
            'attribute vec2 vertexTexCoord;\n' +

            'varying vec3 primaryColor;\n' +
            'varying vec3 secondaryColor;\n' +
            'varying vec2 texCoord;\n' +

            'float scaleFunc(float cos) {\n' +
            '    float x = 1.0 - cos;\n' +
            '    return scaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n' +
            '}\n' +

            'void sampleGround() {\n' +
            /* Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the
             atmosphere) */
            '    vec3 point = vertexPoint.xyz + vertexOrigin;\n' +
            '    vec3 ray = point - eyePoint;\n' +
            '    float far = length(ray);\n' +
            '    ray /= far;\n' +

            '    vec3 start;\n' +
            //'    if (eyeMagnitude < atmosphereRadius) {\n' +
            //'        start = eyePoint;\n' +
            //'    } else {\n' +
            /* Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray
             passing through the atmosphere) */
            '        float B = 2.0 * dot(eyePoint, ray);\n' +
            '        float C = eyeMagnitude2 - atmosphereRadius2;\n' +
            '        float det = max(0.0, B*B - 4.0 * C);\n' +
            '        float near = 0.5 * (-B - sqrt(det));\n' +

            /* Calculate the ray's starting point, then calculate its scattering offset */
            '        start = eyePoint + ray * near;\n' +
            '        far -= near;\n' +
            //'}\n' +

            '    float depth = exp((globeRadius - atmosphereRadius) / scaleDepth);\n' +
            '    float eyeAngle = dot(-ray, point) / length(point);\n' +
            '    float lightAngle = dot(lightDirection, point) / length(point);\n' +
            '    float eyeScale = scaleFunc(eyeAngle);\n' +
            '    float lightScale = scaleFunc(lightAngle);\n' +
            '    float eyeOffset = depth*eyeScale;\n' +
            '    float temp = (lightScale + eyeScale);\n' +

            /* Initialize the scattering loop variables */
            '    float sampleLength = far / SAMPLES;\n' +
            '    float scaledLength = sampleLength * scale;\n' +
            '    vec3 sampleRay = ray * sampleLength;\n' +
            '    vec3 samplePoint = start + sampleRay * 0.5;\n' +

            /* Now loop through the sample rays */
            '    vec3 frontColor = vec3(0.0, 0.0, 0.0);\n' +
            '    vec3 attenuate = vec3(0.0, 0.0, 0.0);\n' +
            '    for(int i=0; i<SAMPLE_COUNT; i++)\n' +
            '    {\n' +
            '        float height = length(samplePoint);\n' +
            '        float depth = exp(scaleOverScaleDepth * (globeRadius - height));\n' +
            '        float scatter = depth*temp - eyeOffset;\n' +
            '        attenuate = exp(-scatter * (invWavelength * Kr4PI + Km4PI));\n' +
            '        frontColor += attenuate * (depth * scaledLength);\n' +
            '        samplePoint += sampleRay;\n' +
            '    }\n' +

            '    primaryColor = frontColor * (invWavelength * KrESun + KmESun);\n' +
            '    secondaryColor = attenuate + 0.15;\n' + /* Calculate the attenuation factor for the ground */
            '}\n' +

            'void main()\n ' +
            '{\n' +
            '    sampleGround();\n' +
            '    gl_Position = mvpMatrix * vertexPoint;\n' +
            '    if (fragMode == FRAGMODE_GROUND_PRIMARY_TEX_BLEND) {\n' +
            '        texCoord = (texCoordMatrix * vec3(vertexTexCoord, 1.0)).st;\n' +
            //'        texCoord = vertexTexCoord;\n' +
            '    }\n' +
            '}',
        fragmentShaderSource =
            'precision mediump float;\n' +
            'precision mediump int;\n' +

            'const int FRAGMODE_GROUND_PRIMARY = 2;\n' +
            'const int FRAGMODE_GROUND_SECONDARY = 3;\n' +
            'const int FRAGMODE_GROUND_PRIMARY_TEX_BLEND = 4;\n' +

            'uniform int fragMode;\n' +
            'uniform sampler2D texSampler;\n' +

            'varying vec3 primaryColor;\n' +
            'varying vec3 secondaryColor;\n' +
            'varying vec2 texCoord;\n' +

            'void main (void)\n' +
            '{\n' +
            '    if (fragMode == FRAGMODE_GROUND_PRIMARY) {\n' +
            '        gl_FragColor = vec4(primaryColor, 1.0);\n' +
            '    } else if (fragMode == FRAGMODE_GROUND_SECONDARY) {\n' +
            '        gl_FragColor = vec4(secondaryColor, 1.0);\n' +
            '    } else if (fragMode == FRAGMODE_GROUND_PRIMARY_TEX_BLEND) {\n' +
            '        vec4 texColor = texture2D(texSampler, texCoord);\n' +
            '        gl_FragColor = vec4(primaryColor + texColor.rgb * (1.0 - secondaryColor), 1.0);\n' +
            '    }\n' +
            '}';

    var bindings = ['vertexPoint', 'vertexTexCoord'];
    GpuProgram.call(this, gl, vertexShaderSource, fragmentShaderSource, bindings);

    this.fragModeLocation = this.uniformLocation(gl, "fragMode");
    this.mvpMatrixLocation = this.uniformLocation(gl, "mvpMatrix");
    this.texCoordMatrixLocation = this.uniformLocation(gl, "texCoordMatrix");
    this.vertexOriginLocation = this.uniformLocation(gl, "vertexOrigin");
    this.eyePointLocation = this.uniformLocation(gl, "eyePoint");
    //this.eyeMagnitudeLocation = this.uniformLocation(gl, "eyeMagnitude");
    this.eyeMagnitude2Location = this.uniformLocation(gl, "eyeMagnitude2");
    this.lightDirectionLocation = this.uniformLocation(gl, "lightDirection");
    this.textureUnitLocation = this.uniformLocation(gl, "texSampler");

    this.scratchArray9 = new Float32Array(9);

    this.FRAGMODE_SKY = 1;
    this.FRAGMODE_GROUND_PRIMARY = 2;
    this.FRAGMODE_GROUND_SECONDARY = 3;
    this.FRAGMODE_GROUND_PRIMARY_TEX_BLEND = 4;

    this.localState = {
        eyePoint: null,
        lightDirection: null,
        vertexOrigin: null,
        fragMode: null,
        mvpMatrix: null,
        texCoordMatrix: null
    };

};

/**
 * A string that uniquely identifies this program.
 * @type {string}
 * @readonly
 */
GroundProgram.key = "WorldWindGroundProgram";

// Inherit from AtmosphereProgram.
GroundProgram.prototype = Object.create(GpuProgram.prototype);

GroundProgram.prototype.loadFragMode = function (gl, fragMode) {
    gl.uniform1i(this.fragModeLocation, fragMode);
};

GroundProgram.prototype.loadModelviewProjection = function (gl, matrix) {
    //changes all the time
    this.loadUniformMatrix(gl, matrix, this.mvpMatrixLocation);
};

GroundProgram.prototype.loadVertexOrigin = function (gl, vector) {
    //doesn't change
    var forceLoad = false;
    if (this.localState.vertexOrigin === null) {
        this.localState.vertexOrigin = new Vec3(0, 0, 0);
        forceLoad = true;
    }
    if (forceLoad || !this.localState.vertexOrigin.equals(vector)) {
        gl.uniform3f(this.vertexOriginLocation, vector[0], vector[1], vector[2]);
        this.localState.vertexOrigin.copy(vector);
    }
};

GroundProgram.prototype.loadLightDirection = function (gl, vector) {
    //changes aprox every 5 min.
    var forceLoad = false;
    if (this.localState.lightDirection === null) {
        this.localState.lightDirection = new Vec3(0, 0, 0);
        forceLoad = true;
    }
    if (forceLoad || !this.localState.lightDirection.equals(vector)) {
        gl.uniform3f(this.lightDirectionLocation, vector[0], vector[1], vector[2]);
        this.localState.lightDirection.copy(vector);
    }
};

GroundProgram.prototype.loadEyePoint = function (gl, vector) {
    //changes on globe move
    gl.uniform3f(this.eyePointLocation, vector[0], vector[1], vector[2]);
    //gl.uniform1f(this.eyeMagnitudeLocation, vector.magnitude());
    gl.uniform1f(this.eyeMagnitude2Location, vector.magnitudeSquared());
};

GroundProgram.prototype.loadTexMatrix = function (gl, matrix) {
    //never changes
    /*var forceLoad = false;
     if (this.localState.texCoordMatrix === null) {
     this.localState.texCoordMatrix = Matrix3.fromIdentity();
     forceLoad = true;
     }
     if (forceLoad || !this.localState.texCoordMatrix.equals(matrix)) {

     this.localState.texCoordMatrix.copy(matrix);
     }*/

    matrix.columnMajorComponents(this.scratchArray9);
    gl.uniformMatrix3fv(this.texCoordMatrixLocation, false, this.scratchArray9);
};

GroundProgram.prototype.loadTextureUnit = function (gl, unit) {
    gl.uniform1i(this.textureUnitLocation, unit - gl.TEXTURE0);
};

export default GroundProgram;