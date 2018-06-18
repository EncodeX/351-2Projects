import * as glMatrix from '/lib/gl-matrix.js';

export default class Geometry {
    constructor() {
        this.type = -1;
        this.rayMatrix = glMatrix.mat4.create();
    }

    trace(ray) {
        // do nothing;
    }

    applyMatrix(ray) {
        // console.log(`applying matrix?`);
        let out = ray.duplicate();
        // glMatrix.vec3.
        glMatrix.vec4.transformMat4(ray.origin, ray.origin, this.rayMatrix);
        glMatrix.vec4.transformMat4(ray.direction, ray.direction, this.rayMatrix);
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
        glMatrix.mat4.rotateX(
            this.rayMatrix,
            this.rayMatrix,
            this.deg2rad(-x)
        );
        glMatrix.mat4.rotateY(
            this.rayMatrix,
            this.rayMatrix,
            this.deg2rad(-y)
        );
        glMatrix.mat4.rotateZ(
            this.rayMatrix,
            this.rayMatrix,
            this.deg2rad(-z)
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
