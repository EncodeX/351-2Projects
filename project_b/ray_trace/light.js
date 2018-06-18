import * as glMatrix from '/lib/gl-matrix.js';

export default class Light {
    constructor(ori, dir, a, d, s) {
        this.origin = ori;
        this.direction = dir;

        this.ambient = a;
        this.diffuse = d;
        this.specular = s;
    }
}
