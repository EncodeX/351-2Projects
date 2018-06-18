import * as glMatrix from '/lib/gl-matrix.js';

export default class HitPoint {
    constructor(ori, dir, shape, ray, t) {
        this.origin = ori;
        this.direction = dir;
        this.shape = shape;
        this.ray = ray;
        this.t = t;
    }
}
