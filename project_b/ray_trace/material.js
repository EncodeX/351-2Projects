import * as glMatrix from '/lib/gl-matrix.js';

export default class Material {
    constructor(a, d, s, e, sn) {
        this.ambient = a;
        this.diffuse = d;
        this.specular = s;
        this.emissive = e;
        this.shinyness = sn;
    }
}
