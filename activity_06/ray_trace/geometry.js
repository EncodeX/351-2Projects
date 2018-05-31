import * as glMatrix from '/lib/gl-matrix.js';

export default class Geometry {
    constructor() {
        this.type = -1;
    }

    trace(ray) {
        // do nothing;
    }

    applyMatrix(ray) {
        // console.log(`applying matrix?`);
        let out = ray.duplicate();
        // glMatrix.vec3.
        return out;
    }
}
