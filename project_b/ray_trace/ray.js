import * as glMatrix from '/lib/gl-matrix.js';

export default class Ray {
    constructor(ori, dir) {
        this.origin = ori;
        this.direction = dir;
    }

    duplicate() {
        return new Ray(
            glMatrix.vec4.clone(this.origin),
            glMatrix.vec4.clone(this.direction)
        );
    }
}
