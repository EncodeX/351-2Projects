import Geometry from '/ray_trace/geometry.js';
import * as glMatrix from '/lib/gl-matrix.js';

export default class Sphere extends Geometry {
    constructor() {
        super();
        // a sphere of r = 1 at 0, 0, 0
        this.radius = 1;
        this.lineWidth = 0.05;
        this.lineColor = glMatrix.vec3.fromValues(0.2, 0.9, 0.2); // RGB
        this.faceColor = glMatrix.vec3.fromValues(0.9, 0.5, 0.5); // near-white
    }

    trace(ray, log = true) {
        // transform ray
        let r = ray;
        r = this.applyMatrix(r);

        let r2s = glMatrix.vec4.create();
        glMatrix.vec4.subtract(r2s, glMatrix.vec4.fromValues(0, 0, 0, 1), r.origin);

        let L2 = glMatrix.vec3.dot(r2s, r2s);

        if (L2 <= 1.0) {
            return -1;
        }

        let tcaS = glMatrix.vec3.dot(r.direction, r2s);

        if (tcaS < 0) {
            return -1;
        }

        let DL2 = glMatrix.vec3.dot(r.direction, r.direction);
        let tca2 = tcaS * tcaS / DL2;

        let LM2 = L2 - tca2;
        if (LM2 > 1.0) return -1;

        let L2hc = 1.0 - LM2;

        let t0 = tcaS / DL2 - Math.sqrt(L2hc / DL2);

        return t0;
    }

    hitTest(ray) {
        // transform ray
        return this.trace(ray, false);
    }

    getColor(hit, ray = null) {
        if (hit < 0) {
            return Geometry.skyColor;
        } else {
            return this.material;
        }
    }

    getNormal(hitPoint) {
        // transform ray
        let r = hitPoint.ray;
        r = this.applyMatrix(r);

        let point = glMatrix.vec4.scaleAndAdd(
            [],
            glMatrix.vec4.clone(r.origin),
            glMatrix.vec4.clone(r.direction),
            hitPoint.t
        );

        let norm = glMatrix.vec4.fromValues(point[0], point[1], point[2], 0);
        return glMatrix.vec4.transformMat4(
            [], norm,
            glMatrix.mat4.transpose([], glMatrix.mat4.clone(this.rayMatrix)));
    }
}
