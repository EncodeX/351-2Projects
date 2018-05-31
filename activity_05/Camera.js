export default class Camera {
    constructor(cameraPos, cameraRightVec, cameraLookVec) {
        this.directionControl = [0, 0, 0];
        this.cameraControl = [0, 0, 0];

        this.cameraPos = cameraPos;

        this.cameraRightVec = new Vector3(
                [
                    cameraRightVec.elements[0],
                    cameraRightVec.elements[1],
                    cameraRightVec.elements[2]
                ])
            .normalize();
        this.cameraLookVec = new Vector3(
                [
                    cameraLookVec.elements[0],
                    cameraLookVec.elements[1],
                    cameraLookVec.elements[2]
                ])
            .normalize();
        this.cameraHeadVec =
            this.cross(this.cameraRightVec, this.cameraLookVec)
            .normalize();

        this.cRight = new Vector3(
                [
                    cameraRightVec.elements[0],
                    cameraRightVec.elements[1],
                    cameraRightVec.elements[2]
                ])
            .normalize();
        this.cLook = new Vector3(
                [
                    cameraLookVec.elements[0],
                    cameraLookVec.elements[1],
                    cameraLookVec.elements[2]
                ])
            .normalize();
        this.cHead =
            this.cross(this.cameraRightVec, this.cameraLookVec)
            .normalize();

        let lookAtMatrix = new Matrix4();
        lookAtMatrix.setLookAt(
            cameraPos.elements[0], cameraPos.elements[1], cameraPos.elements[2],
            cameraPos.elements[0] + cameraLookVec.elements[0],
            cameraPos.elements[1] + cameraLookVec.elements[1],
            cameraPos.elements[2] + cameraLookVec.elements[2],
            this.cameraHeadVec.elements[0], this.cameraHeadVec.elements[1], this.cameraHeadVec.elements[2]
        );

        this.qNew = new Quaternion(0, 0, 0, 1);
        this.qBase = this.matToQuat(lookAtMatrix);
        this.qTot = new Quaternion(0, 0, 0, 1);
        this.qTotMirror = new Quaternion(0, 0, 0, 1);
        this.viewMatrix = new Matrix4();
        this.quatMatrix = new Matrix4();

        this.rotateSpeed = 10; // degree per sec
        this.moveSpeed = 2; // unit per sec

        // console.log(this.cLook);
    }

    cross(v1, v2) {
        return new Vector3(
            [
                v1.elements[1] * v2.elements[2] - v1.elements[2] * v2.elements[1],
                v1.elements[2] * v2.elements[0] - v1.elements[0] * v2.elements[2],
                v1.elements[0] * v2.elements[1] - v1.elements[1] * v1.elements[0]
            ]
        );
    }

    matToQuat(matrix) {
        let result = new Quaternion(0, 0, 0, 1);

        /**
          // found on http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/

          float tr = m00 + m11 + m22

          if (tr > 0) {
            float S = sqrt(tr+1.0) * 2; // S=4*qw
            qw = 0.25 * S;
            qx = (m21 - m12) / S;
            qy = (m02 - m20) / S;
            qz = (m10 - m01) / S;
          } else if ((m00 > m11)&(m00 > m22)) {
            float S = sqrt(1.0 + m00 - m11 - m22) * 2; // S=4*qx
            qw = (m21 - m12) / S;
            qx = 0.25 * S;
            qy = (m01 + m10) / S;
            qz = (m02 + m20) / S;
          } else if (m11 > m22) {
            float S = sqrt(1.0 + m11 - m00 - m22) * 2; // S=4*qy
            qw = (m02 - m20) / S;
            qx = (m01 + m10) / S;
            qy = 0.25 * S;
            qz = (m12 + m21) / S;
          } else {
            float S = sqrt(1.0 + m22 - m00 - m11) * 2; // S=4*qz
            qw = (m10 - m01) / S;
            qx = (m02 + m20) / S;
            qy = (m12 + m21) / S;
            qz = 0.25 * S;
          }
        **/

        /**
          MATRIX INDEX:
          [
            m00 =  0, m01 =  4, m02 =  8, m03 = 12,
            m10 =  1, m11 =  5, m12 =  9, m13 = 13,
            m20 =  2, m21 =  6, m22 = 10, m23 = 14,
            m30 =  3, m31 =  7, m32 = 11, m33 = 15
          ]
        **/

        let e = matrix.elements;

        let tr = e[0] + e[5] + e[10];

        if (tr > 0) {
            let S = Math.sqrt(tr + 1.0) * 2;
            result.w = 0.25 * S;
            result.x = (e[6] - e[9]) / S;
            result.y = (e[8] - e[2]) / S;
            result.z = (e[1] - e[4]) / S;
        } else if (e[0] > e[5] && e[0] > e[10]) {
            let S = Math.sqrt(1.0 + e[0] - e[5] - e[10]) * 2;
            result.w = (e[6] - e[9]) / S;
            result.x = 0.25 * S;
            result.y = (e[4] + e[1]) / S;
            result.z = (e[8] + e[2]) / S;
        } else if (e[0] > e[5] && e[0] > e[10]) {
            let S = Math.sqrt(1.0 + e[5] - e[0] - e[10]) * 2;
            result.w = (e[8] - e[2]) / S;
            result.x = (e[4] + e[1]) / S;
            result.y = 0.25 * S;
            result.z = (e[9] + e[6]) / S;
        } else {
            let S = Math.sqrt(1.0 + e[10] - e[0] - e[5]) * 2;
            result.w = (e[1] - e[4]) / S;
            result.x = (e[8] + e[2]) / S;
            result.y = (e[9] + e[6]) / S;
            result.z = 0.25 * S;
        }

        return result;
    }

    getLookAtPos(cp, lv) {
        return new Vector3([
            cp.elements[0] + lv.elements[0],
            cp.elements[1] + lv.elements[1],
            cp.elements[2] + lv.elements[2]
        ]);
    }

    multiplyVec3(q, vec, result) {
        var tempVec = q.multiplyVector3({
            x: vec.elements[0],
            y: vec.elements[1],
            z: vec.elements[2]
        });
        result.elements[0] = tempVec.x;
        result.elements[1] = tempVec.y;
        result.elements[2] = tempVec.z;
    }

    calculateQuaternions(elapsedTime) {
        var qTemp;

        if (this.directionControl[2] != 0) {
            qTemp = new Quaternion(0, 0, 0, 1);

            this.qNew.setFromAxisAngle(0.0, 0.0, 1.0, -this.rotateSpeed * elapsedTime * this.directionControl[2]);
            qTemp.multiply(this.qNew, this.qTot);
            this.qTot.copy(qTemp);

            this.qNew.setFromAxisAngle(0.0, 0.0, 1.0, this.rotateSpeed * elapsedTime * this.directionControl[2]);
            qTemp.multiply(this.qNew, this.qTotMirror);
            this.qTotMirror.copy(qTemp);
        }

        if (this.directionControl[1] != 0) {
            qTemp = new Quaternion(0, 0, 0, 1);

            this.qNew.setFromAxisAngle(1.0, 0.0, 0.0, -this.rotateSpeed * elapsedTime * this.directionControl[1]);
            qTemp.multiply(this.qNew, this.qTot);
            this.qTot.copy(qTemp);

            this.qNew.setFromAxisAngle(1.0, 0.0, 0.0, this.rotateSpeed * elapsedTime * this.directionControl[1]);
            qTemp.multiply(this.qNew, this.qTotMirror);
            this.qTotMirror.copy(qTemp);
        }

        if (this.directionControl[0] != 0) {
            qTemp = new Quaternion(0, 0, 0, 1);

            this.qNew.setFromAxisAngle(0.0, 1.0, 0.0, this.rotateSpeed * elapsedTime * this.directionControl[0]);
            qTemp.multiply(this.qNew, this.qTot);
            this.qTot.copy(qTemp);

            this.qNew.setFromAxisAngle(0.0, 1.0, 0.0, -this.rotateSpeed * elapsedTime * this.directionControl[0]);
            qTemp.multiply(this.qNew, this.qTotMirror);
            this.qTotMirror.copy(qTemp);
        }

        // this.multiplyVec3(this.qTotMirror, this.cameraHeadVec, this.cHead);
        this.multiplyVec3(this.qTotMirror, this.cameraLookVec, this.cLook);
        this.multiplyVec3(this.qTotMirror, this.cameraRightVec, this.cRight);
        this.cHead = this.cross(this.cRight, this.cLook);


        if (this.cameraControl[1] != 0) {
            this.cameraPos.elements[0] += this.cLook.elements[0] *
                this.moveSpeed * elapsedTime * this.cameraControl[1];
            this.cameraPos.elements[1] += this.cLook.elements[1] *
                this.moveSpeed * elapsedTime * this.cameraControl[1];
            this.cameraPos.elements[2] += this.cLook.elements[2] *
                this.moveSpeed * elapsedTime * this.cameraControl[1];
        }

        if (this.cameraControl[0] != 0) {
            this.cameraPos.elements[0] += this.cRight.elements[0] *
                this.moveSpeed * elapsedTime * this.cameraControl[0];
            this.cameraPos.elements[1] += this.cRight.elements[1] *
                this.moveSpeed * elapsedTime * this.cameraControl[0];
            this.cameraPos.elements[2] += this.cRight.elements[2] *
                this.moveSpeed * elapsedTime * this.cameraControl[0];
        }

        if (this.cameraControl[2] != 0) {
            this.cameraPos.elements[0] += this.cHead.elements[0] *
                this.moveSpeed * elapsedTime * this.cameraControl[2];
            this.cameraPos.elements[1] += this.cHead.elements[1] *
                this.moveSpeed * elapsedTime * this.cameraControl[2];
            this.cameraPos.elements[2] += this.cHead.elements[2] *
                this.moveSpeed * elapsedTime * this.cameraControl[2];
        }

        let qRotation = new Quaternion(0, 0, 0, 1);
        qTemp = new Quaternion(0, 0, 0, 1);
        qTemp.multiply(this.qBase, this.qTot);

        this.quatMatrix.setFromQuat(qTemp.x, qTemp.y, qTemp.z, qTemp.w);
        this.quatMatrix.translate(-this.cameraPos.elements[0], -this.cameraPos.elements[1], -this.cameraPos.elements[2]);
    }
}
