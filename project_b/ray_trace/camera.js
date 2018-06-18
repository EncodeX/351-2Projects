import * as glMatrix from '/lib/gl-matrix.js';

export default class Camera {
    constructor(cameraPos, cameraRightVec, cameraLookVec) {
        this.directionControl = [0, 0, 0];
        this.cameraControl = [0, 0, 0];

        this.cameraPos = cameraPos;

        this.cameraRightVec = glMatrix.vec3.create();
        glMatrix.vec3.normalize(this.cameraRightVec, cameraRightVec);

        this.cameraLookVec = glMatrix.vec3.create();
        glMatrix.vec3.normalize(this.cameraLookVec, cameraLookVec);

        this.cameraHeadVec = glMatrix.vec3.create();
        glMatrix.vec3.cross(this.cameraHeadVec, this.cameraRightVec, this.cameraLookVec);

        this.cRight = glMatrix.vec3.clone(this.cameraRightVec);

        this.cLook = glMatrix.vec3.clone(this.cameraLookVec);

        this.cHead = glMatrix.vec3.clone(this.cameraHeadVec);

        let lookAtMatrix = glMatrix.mat4.create();
        glMatrix.mat4.lookAt(
            lookAtMatrix,
            cameraPos, [0, 0, 0].map((_, i) => cameraPos[i] + cameraLookVec[i]),
            this.cameraHeadVec
        );

        this.qNew = glMatrix.quat.create();
        this.qBase = glMatrix.quat.fromMat3([], glMatrix.mat3.fromMat4([], lookAtMatrix));
        this.qTot = glMatrix.quat.create();
        this.qTotMirror = glMatrix.quat.create();
        this.quatMatrix = glMatrix.mat4.create();

        this.rotateSpeed = 15; // degree per sec
        this.moveSpeed = 2; // unit per sec

        /**
          Init Ray tracing camera here
        **/

        this.left = -1.0;
        this.right = 1.0;
        this.top = 1.0;
        this.bottom = -1.0;
        this.near = 1.0;
        this.far = 100;
    }

    updateCamera(elapsedTime) {
        if (this.directionControl[2] != 0) {
            this.rotateY(this.rotateSpeed * elapsedTime * this.directionControl[2]);
        }

        if (this.directionControl[1] != 0) {
            this.rotateZ(this.rotateSpeed * elapsedTime * this.directionControl[1]);
        }

        if (this.directionControl[0] != 0) {
            this.rotateX(this.rotateSpeed * elapsedTime * this.directionControl[0]);
        }


        if (this.cameraControl[2] != 0) {
            this.cameraPos[0] += this.cLook[0] *
                this.moveSpeed * elapsedTime * this.cameraControl[2];
            this.cameraPos[1] += this.cLook[1] *
                this.moveSpeed * elapsedTime * this.cameraControl[2];
            this.cameraPos[2] += this.cLook[2] *
                this.moveSpeed * elapsedTime * this.cameraControl[2];
        }

        if (this.cameraControl[1] != 0) {
            this.cameraPos[0] += this.cHead[0] *
                this.moveSpeed * elapsedTime * this.cameraControl[1];
            this.cameraPos[1] += this.cHead[1] *
                this.moveSpeed * elapsedTime * this.cameraControl[1];
            this.cameraPos[2] += this.cHead[2] *
                this.moveSpeed * elapsedTime * this.cameraControl[1];
        }

        if (this.cameraControl[0] != 0) {
            this.cameraPos[0] += this.cRight[0] *
                this.moveSpeed * elapsedTime * this.cameraControl[0];
            this.cameraPos[1] += this.cRight[1] *
                this.moveSpeed * elapsedTime * this.cameraControl[0];
            this.cameraPos[2] += this.cRight[2] *
                this.moveSpeed * elapsedTime * this.cameraControl[0];
        }

        // let qTemp = glMatrix.quat.create();
        // glMatrix.quat.mul(qTemp, this.qBase, this.qTot);
        //
        // glMatrix.mat4.fromQuat(this.quatMatrix, qTemp);
        // glMatrix.mat4.translate(
        //     this.quatMatrix, this.quatMatrix, this.cameraPos.map(x => -x)
        // );
        glMatrix.mat4.lookAt(
            this.quatMatrix,
            this.cameraPos, [0, 0, 0].map((_, i) => this.cameraPos[i] + this.cLook[i]),
            this.cHead
        );
    }

    getPosition() {
        return glMatrix.vec4.fromValues(...this.cameraPos, 1.0);
    }

    getDirection(p, height, width) {
        let out = glMatrix.vec3.create();
        let px = (p[0] - 0.5 * height) / (0.5 * height);
        let py = (p[1] - 0.5 * width) / (0.5 * width);
        glMatrix.vec3.scaleAndAdd(out, out, this.cLook, 1.0);
        glMatrix.vec3.scaleAndAdd(out, out, this.cRight, px);
        glMatrix.vec3.scaleAndAdd(out, out, this.cHead, py);
        // glMatrix.vec3.normalize(out, out);
        return glMatrix.vec4.fromValues(...out, 0.0);
    }

    rotateX(deg) {
        let qTemp = glMatrix.quat.create();

        glMatrix.quat.fromEuler(this.qNew, -deg, 0, 0);
        glMatrix.quat.mul(qTemp, this.qNew, this.qTot);
        glMatrix.quat.copy(this.qTot, qTemp);

        // glMatrix.quat.copy(this.qTot, this.qNew);

        glMatrix.quat.fromEuler(this.qNew, deg, 0, 0);
        glMatrix.quat.mul(qTemp, this.qNew, this.qTotMirror);
        glMatrix.quat.copy(this.qTotMirror, qTemp);

        // glMatrix.quat.copy(this.qTotMirror, this.qNew);

        // glMatrix.quat.rotateX(this.qTot, this.qTot, this.deg2rad(-deg));
        // glMatrix.quat.rotateX(this.qTotMirror, this.qTotMirror, this.deg2rad(deg));

        // glMatrix.vec3.transformQuat(this.cLook, this.cLook, this.qTotMirror);
        // glMatrix.vec3.transformQuat(this.cRight, this.cRight, this.qTotMirror);
        glMatrix.vec3.transformQuat(this.cLook, this.cameraLookVec, this.qTotMirror);
        glMatrix.vec3.transformQuat(this.cRight, this.cameraRightVec, this.qTotMirror);
        glMatrix.vec3.cross(this.cHead, this.cRight, this.cLook);
    }

    rotateY(deg) {
        let qTemp = glMatrix.quat.create();

        glMatrix.quat.fromEuler(this.qNew, 0, -deg, 0);
        glMatrix.quat.mul(qTemp, this.qNew, this.qTot);
        glMatrix.quat.copy(this.qTot, qTemp);

        // glMatrix.quat.copy(this.qTot, this.qNew);

        glMatrix.quat.fromEuler(this.qNew, 0, deg, 0);
        glMatrix.quat.mul(qTemp, this.qNew, this.qTotMirror);
        glMatrix.quat.copy(this.qTotMirror, qTemp);

        // glMatrix.quat.copy(this.qTotMirror, this.qNew);

        // glMatrix.quat.rotateY(this.qTot, this.qTot, this.deg2rad(-deg));
        // glMatrix.quat.rotateY(this.qTotMirror, this.qTotMirror, this.deg2rad(deg));

        // glMatrix.vec3.transformQuat(this.cLook, this.cLook, this.qTotMirror);
        // glMatrix.vec3.transformQuat(this.cRight, this.cRight, this.qTotMirror);
        glMatrix.vec3.transformQuat(this.cLook, this.cameraLookVec, this.qTotMirror);
        glMatrix.vec3.transformQuat(this.cRight, this.cameraRightVec, this.qTotMirror);
        glMatrix.vec3.cross(this.cHead, this.cRight, this.cLook);
    }

    rotateZ(deg) {
        let qTemp = glMatrix.quat.create();

        glMatrix.quat.fromEuler(this.qNew, 0, 0, deg);
        glMatrix.quat.mul(qTemp, this.qNew, this.qTot);
        glMatrix.quat.copy(this.qTot, qTemp);

        // glMatrix.quat.copy(this.qTot, this.qNew);

        glMatrix.quat.fromEuler(this.qNew, 0, 0, -deg);
        glMatrix.quat.mul(qTemp, this.qNew, this.qTotMirror);
        glMatrix.quat.copy(this.qTotMirror, qTemp);

        // glMatrix.quat.copy(this.qTotMirror, this.qNew);

        // glMatrix.quat.rotateZ(this.qTot, this.qTot, this.deg2rad(-deg));
        // glMatrix.quat.rotateZ(this.qTotMirror, this.qTotMirror, this.deg2rad(deg));

        // glMatrix.vec3.transformQuat(this.cLook, this.cLook, this.qTotMirror);
        // glMatrix.vec3.transformQuat(this.cRight, this.cRight, this.qTotMirror);
        glMatrix.vec3.transformQuat(this.cLook, this.cameraLookVec, this.qTotMirror);
        glMatrix.vec3.transformQuat(this.cRight, this.cameraRightVec, this.qTotMirror);
        glMatrix.vec3.cross(this.cHead, this.cRight, this.cLook);
    }

    deg2rad(x) {
        return x / 180 * Math.PI;
    }
}
