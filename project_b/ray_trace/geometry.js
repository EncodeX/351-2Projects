import * as glMatrix from '/lib/gl-matrix.js';
import Material from '/ray_trace/material.js';

export default class Geometry {
    constructor() {
        this.type = Geometry.TYPE_SOLID;
        this.rayMatrix = glMatrix.mat4.create();
        this.refracIndex = 1;
        this.material = new Material(
            glMatrix.vec3.fromValues(0.3, 1.0, 1.0),
            null,
            null,
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            1.0);
        this.material_2 = new Material(
            glMatrix.vec3.fromValues(0.3, 1.0, 1.0),
            null,
            null,
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            1.0);
    }

    static get TYPE_SOLID() {
        return 0;
    }

    static get TYPE_REFLECT() {
        return 1;
    }

    static get TYPE_GLASS() {
        return 2;
    }

    setType(type) {
        this.type = type;
    }

    setRefracIndex(value) {
        this.refracIndex = value;
    }

    setMaterial(mat) {
        this.material = mat;
    }

    setSecondaryMaterial(mat) {
        this.material_2 = mat;
    }

    trace(ray) {
        // do nothing;
    }

    hitTest(ray) {
        // do nothing;
    }

    getColor(hit) {
        // do nothing
    }

    static get skyColor() {
        return new Material(
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            1.0);
    }

    applyMatrix(ray) {
        // console.log(`applying matrix?`);
        let out = ray.duplicate();
        // glMatrix.vec3.
        glMatrix.vec4.transformMat4(out.origin, out.origin, this.rayMatrix);
        glMatrix.vec4.transformMat4(out.direction, out.direction, this.rayMatrix);
        return out;
    }

    translate(x, y, z) {
        glMatrix.mat4.translate(
            this.rayMatrix,
            this.rayMatrix,
            glMatrix.vec3.fromValues(-x, -y, -z)
        );
    }

    rotate(x, y, z) {
        glMatrix.mat4.rotateZ(
            this.rayMatrix,
            this.rayMatrix,
            this.deg2rad(-z)
        );
        glMatrix.mat4.rotateY(
            this.rayMatrix,
            this.rayMatrix,
            this.deg2rad(-y)
        );
        glMatrix.mat4.rotateX(
            this.rayMatrix,
            this.rayMatrix,
            this.deg2rad(-x)
        );
    }

    scale(x, y, z) {
        if (x * y * z == 0) return;
        glMatrix.mat4.scale(
            this.rayMatrix,
            this.rayMatrix,
            glMatrix.vec3.fromValues(1.0 / x, 1.0 / y, 1.0 / z)
        );
    }

    deg2rad(x) {
        return x / 180 * Math.PI;
    }
}
