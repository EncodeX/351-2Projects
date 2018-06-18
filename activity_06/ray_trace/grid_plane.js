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
        this.skyColor = glMatrix.vec3.fromValues(0.3, 1.0, 1.0); // cyan/bright
    }

    trace(ray) {
        // transform ray
        let r = ray;
        r = this.applyMatrix(r);
        // trace grid;
        let hit = glMatrix.vec3.create();
        let t = (this.z - r.origin[2]) / r.direction[2];
        if (t < 0) return -1;
        hit[0] = r.origin[0] + r.direction[0] * t + 0.5;
        hit[1] = r.origin[1] + r.direction[1] * t + 0.5;
        hit[2] = this.z;

        if (Math.abs(hit[0] - Math.round(hit[0])) < this.lineWidth / 2) return 1;
        if (Math.abs(hit[1] - Math.round(hit[1])) < this.lineWidth / 2) return 1;

        return 0;
    }
}
