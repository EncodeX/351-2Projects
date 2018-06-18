import Geometry from '/ray_trace/geometry.js';
import * as glMatrix from '/lib/gl-matrix.js';

export default class GridPlane extends Geometry {
    constructor(z) {
        super();
        this.z = z;
        this.xGap = 1.0;
        this.yGap = 1.0;
        this.lineWidth = 0.1;
        this.lineColor = glMatrix.vec3.fromValues(0.3, 0.3, 1.0); // RGB
        this.gapColor = glMatrix.vec3.fromValues(0.96, 0.96, 0.96); // near-white
    }

    trace(ray, log = false) {
        // transform ray
        let r = ray;
        r = this.applyMatrix(r);
        // trace grid;
        let t = (this.z - r.origin[2]) / r.direction[2];
        return t;
    }

    hitTest(ray) {
        // transform ray
        let r = ray;
        r = this.applyMatrix(r);

        let t = (this.z - r.origin[2]) / r.direction[2];
        return t;
    }

    getColor(hit, ray = null) {
        let point = glMatrix.vec3.create();
        point[0] = ray.origin[0] + ray.direction[0] * hit;
        point[1] = ray.origin[1] + ray.direction[1] * hit;
        point[2] = this.z;

        if (Math.abs(point[0] - Math.round(point[0])) < this.lineWidth / 2)
            return this.material;
        if (Math.abs(point[1] - Math.round(point[1])) < this.lineWidth / 2)
            return this.material;

        if (hit < 0) {
            return Geometry.skyColor;
        } else {
            // let color = glMatrix.vec3.create();
            // glMatrix.vec3.scaleAndAdd(color, color, this.gapColor, 1 - hit);
            // glMatrix.vec3.scaleAndAdd(color, color, this.lineColor, hit);
            return this.material_2;
        }
    }

    getNormal(hitPoint) {
        return glMatrix.vec4.transformMat4(
            [], glMatrix.vec4.fromValues(0, 0, 1, 0),
            glMatrix.mat4.transpose([], glMatrix.mat4.clone(this.rayMatrix)));
    }
}
