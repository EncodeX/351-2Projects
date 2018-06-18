import Geometry from '/ray_trace/geometry.js';
import * as glMatrix from '/lib/gl-matrix.js';

export default class Cube extends Geometry {
    constructor() {
        super();
        // a 2 * 2 * 2 cube
        this.xRange = [-1, 1];
        this.yRange = [-1, 1];
        this.zRange = [-1, 1];
        this.lineWidth = 0.05;
        this.lineColor = glMatrix.vec3.fromValues(0.2, 0.9, 0.2); // RGB
        this.faceColor = glMatrix.vec3.fromValues(0.1, 0.6, 0.1); // near-white
    }

    trace(ray) {
        // transform ray
        let r = ray;
        r = this.applyMatrix(r);

        let sign = [1, 1, 1];
        let invdir = r.direction.map((t, i) => {
            if (i == 3) return 0;
            let result = 1 / t;
            sign[i] = result < 0 ? 1 : 0;
            return result;
        });

        let txmin, tymin, tzmin, txmax, tymax, tzmax;

        txmin = (this.xRange[sign[0]] - r.origin[0]) * invdir[0];
        txmax = (this.xRange[1 - sign[0]] - r.origin[0]) * invdir[0];
        tymin = (this.yRange[sign[1]] - r.origin[1]) * invdir[1];
        tymax = (this.yRange[1 - sign[1]] - r.origin[1]) * invdir[1];

        if ((txmin > tymax) || (tymin > txmax)) return -1;
        if (tymin > txmin)
            txmin = tymin;
        if (tymax < txmax)
            txmax = tymax;

        tzmin = (this.zRange[sign[2]] - r.origin[2]) * invdir[2];
        tzmax = (this.zRange[1 - sign[2]] - r.origin[2]) * invdir[2];

        if ((txmin > tzmax) || (tzmin > txmax))
            return -1;
        if (tzmin > txmin)
            txmin = tzmin;
        if (tzmax < txmax)
            txmax = tzmax;

        return txmin;
    }

    hitTest(ray) {
        // transform ray
        return this.trace(ray);
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

        let index = 0,
            v = Math.abs(point[0]);

        if (v < Math.abs(point[1])) {
            index = 1;
            v = Math.abs(point[1]);
        }

        if (v < Math.abs(point[2])) {
            index = 2;
            v = Math.abs(point[2]);
        }

        let n = [0, 0, 0, 0];
        n[index] = point[index] / v;

        let norm = glMatrix.vec4.fromValues(...n);
        return glMatrix.vec4.transformMat4(
            [], norm,
            glMatrix.mat4.transpose([], glMatrix.mat4.clone(this.rayMatrix)));
    }
}
