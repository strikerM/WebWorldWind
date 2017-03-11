/*
 * Copyright (C) 2014 United States Government as represented by the Administrator of the
 * National Aeronautics and Space Administration. All Rights Reserved.
 */
/**
 * @exports SkyProgram
 */
import GpuProgram from '../shaders/GpuProgram';
import Matrix from '../geom/Matrix';
import Vec3 from '../geom/Vec3';

/**
 * Constructs a new program.
 * Initializes, compiles and links this GLSL program with the source code for its vertex and fragment shaders.
 * <p>
 * This method creates WebGL shaders for the program's shader sources and attaches them to a new GLSL program.
 * This method then compiles the shaders and then links the program if compilation is successful. Use the bind
 * method to make the program current during rendering.
 *
 * @alias SkyProgram
 * @constructor
 * @augments GpuProgram
 * @classdesc SkyProgram is a GLSL program that draws the sky component of the atmosphere.
 * @param {WebGLRenderingContext} gl The current WebGL context.
 * @throws {ArgumentError} If the shaders cannot be compiled, or linking of
 * the compiled shaders into a program fails.
 */
var SkyProgram = function (gl) {
    var vertexShaderSource =
            //'precision mediump int;\n' +

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

            'uniform mat4 mvpMatrix;\n' +
            'uniform vec3 eyePoint;\n' +
            //'uniform float eyeMagnitude;\n' + /* The eye point's magnitude */
            'uniform float eyeMagnitude2;\n' + /* eyeMagnitude^2 */
            'uniform mediump vec3 lightDirection;\n' + /* The direction vector to the light source */

            'attribute vec4 vertexPoint;\n' +

            'varying vec3 primaryColor;\n' +
            'varying vec3 secondaryColor;\n' +
            'varying vec3 direction;\n' +

            'float scaleFunc(float cos)\n' +
            '{\n' +
            '    float x = 1.0 - cos;\n' +
            '    return scaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n' +
            '}\n' +

            'void sampleSky() {\n' +
            /* Get the ray from the camera to the vertex and its length (which is the far point of
             the ray passing through the atmosphere) */
            '    vec3 point = vertexPoint.xyz;\n' +
            '    vec3 ray = point - eyePoint;\n' +
            '    float far = length(ray);\n' +
            '    ray /= far;\n' +

            '    vec3 start;\n' +
            '    float startOffset;\n' +

            //'    if (eyeMagnitude < atmosphereRadius) {\n' +
            /* Calculate the ray's starting point, then calculate its scattering offset */
            //'        start = eyePoint;\n' +
            //'        float height = length(start);\n' +
            //'        float depth = exp(scaleOverScaleDepth * (globeRadius - eyeMagnitude));\n' +
            //'        float startAngle = dot(ray, start) / height;\n' +
            //'        startOffset = depth*scaleFunc(startAngle);\n' +
            //'    } else {\n' +
            /* Calculate the closest intersection of the ray with the outer atmosphere (which is the near
             point of the ray passing through the atmosphere) */
            '        float B = 2.0 * dot(eyePoint, ray);\n' +
            '        float C = eyeMagnitude2 - atmosphereRadius2;\n' +
            '        float det = max(0.0, B*B - 4.0 * C);\n' +
            '        float near = 0.5 * (-B - sqrt(det));\n' +

            /* Calculate the ray's starting point, then calculate its scattering offset */
            '        start = eyePoint + ray * near;\n' +
            '        far -= near;\n' +
            '        float startAngle = dot(ray, start) / atmosphereRadius;\n' +
            '        float startDepth = exp(-1.0 / scaleDepth);\n' +
            '        startOffset = startDepth*scaleFunc(startAngle);\n' +
            //'    }\n' +

            /* Initialize the scattering loop variables */
            '    float sampleLength = far / SAMPLES;\n' +
            '    float scaledLength = sampleLength * scale;\n' +
            '    vec3 sampleRay = ray * sampleLength;\n' +
            '    vec3 samplePoint = start + sampleRay * 0.5;\n' +

            /* Now loop through the sample rays */
            '    vec3 frontColor = vec3(0.0, 0.0, 0.0);\n' +
            '    for(int i=0; i<SAMPLE_COUNT; i++)\n' +
            '    {\n' +
            '       float height = length(samplePoint);\n' +
            '       float depth = exp(scaleOverScaleDepth * (globeRadius - height));\n' +
            '       float lightAngle = dot(lightDirection, samplePoint) / height;\n' +
            '       float cameraAngle = dot(ray, samplePoint) / height;\n' +
            '       float scatter = (startOffset + depth*(scaleFunc(lightAngle) - scaleFunc(cameraAngle)));\n' +
            '       vec3 attenuate = exp(-scatter * (invWavelength * Kr4PI + Km4PI));\n' +
            '       frontColor += attenuate * (depth * scaledLength);\n' +
            '       samplePoint += sampleRay;\n' +
            '    }\n' +

            /* Finally, scale the Mie and Rayleigh colors and set up the varying variables for the fragment
             shader */
            '    primaryColor = frontColor * (invWavelength * KrESun);\n' +
            '    secondaryColor = frontColor * KmESun;\n' +
            '    direction = eyePoint - point;\n' +
            '}\n' +

            'void main()\n' +
            '{\n' +
            '    sampleSky();\n' +

            /* Transform the vertex point by the modelview-projection matrix */
            '    gl_Position = mvpMatrix * vertexPoint;\n' +
            '}',
        fragmentShaderSource =
            '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
            'precision highp float;\n' +
            '#else\n' +
            'precision mediump float;\n' +
            '#endif\n' +

            'const float g = -0.95;\n' +
            'const float g2 = 0.9025;\n' +
            'const float exposure = -2.0;\n' +

            'uniform mediump vec3 lightDirection;\n' +

            'varying vec3 primaryColor;\n' +
            'varying vec3 secondaryColor;\n' +
            'varying vec3 direction;\n' +

            'void main (void)\n' +
            '{\n' +
            '    float cos = dot(lightDirection, direction) / length(direction);\n' +
            '    float rayleighPhase = 0.75 * (1.0 + cos * cos);\n' +
            '    float miePhase = 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + cos * cos) / pow(1.0 + g2 - 2.0*g*cos, 1.5);\n' +
            '    vec3 color = primaryColor * rayleighPhase + secondaryColor * miePhase;\n' +
            '    color = vec3(1.0) - exp(exposure * color);\n' +
            '    gl_FragColor = vec4(color, color.b);\n' +
            //    'gl_FragColor.rgb = 1.0 - exp(-exposure * (rayleighPhase * primaryColor + miePhase * secondaryColor));\n' +
            //    'gl_FragColor.a = 1.0;\n'+
            '}';

    // Call to the superclass, which performs shader program compiling and linking.
    GpuProgram.call(this, gl, vertexShaderSource, fragmentShaderSource, ["vertexPoint"]);

    this.mvpMatrixLocation = this.uniformLocation(gl, "mvpMatrix");
    this.eyePointLocation = this.uniformLocation(gl, "eyePoint");
    //this.eyeMagnitudeLocation = this.uniformLocation(gl, "eyeMagnitude");
    this.eyeMagnitude2Location = this.uniformLocation(gl, "eyeMagnitude2");
    this.lightDirectionLocation = this.uniformLocation(gl, "lightDirection");

    this.localState = {
        mvpMatrix: null,
        lightDirection: null
    };

};

/**
 * A string that uniquely identifies this program.
 * @type {string}
 * @readonly
 */
SkyProgram.key = "WorldWindSkyProgram";

SkyProgram.prototype = Object.create(GpuProgram.prototype);

SkyProgram.prototype.loadModelviewProjection = function (gl, matrix) {
    //changes regularly when the globe moves
    var forceLoad = false;
    if (this.localState.mvpMatrix === null) {
        forceLoad = true;
        this.localState.mvpMatrix = Matrix.fromIdentity();
    }

    if (forceLoad || !this.localState.mvpMatrix.equals(matrix)) {
        this.loadUniformMatrix(gl, matrix, this.mvpMatrixLocation);
        this.localState.mvpMatrix.copy(matrix);
    }
    //this.loadUniformMatrix(gl, matrix, this.mvpMatrixLocation);
};

SkyProgram.prototype.loadLightDirection = function (gl, vector) {
    //only changes apox. every 5 min
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

SkyProgram.prototype.loadEyePoint = function (gl, vector) {
    //changes regularly when the globe moves
    gl.uniform3f(this.eyePointLocation, vector[0], vector[1], vector[2]);
    //gl.uniform1f(this.eyeMagnitudeLocation, vector.magnitude());
    gl.uniform1f(this.eyeMagnitude2Location, vector.magnitudeSquared());
};

export default SkyProgram;