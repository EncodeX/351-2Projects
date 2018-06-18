import Image from '/ray_trace/image.js';
import Ray from '/ray_trace/ray.js';
import GridPlane from '/ray_trace/grid_plane.js';
import * as glMatrix from '/lib/gl-matrix.js';

export default class Scene {
    constructor(camera) {
        // init here
        this.image = new Image();
        this.camera = camera;
        this.shape = new GridPlane(-5.0);

        // this.shape.translate(0.1, 0, 0);
        this.shape.scale(2, 2, 2);
        // this.shape.rotate(-90, 0, 0);
    }

    refreshImage() {
        // trace here
        for (let i = 0; i < this.image.height; i++) {
            for (let j = 0; j < this.image.width; j++) {
                let hitList = [];
                let steps = 4,
                    sum = [0, 0];
                let step = 1 / steps;

                // TODO separate hit test and color, as well as sampling method

                // No sampling
                // let dir = this.camera.getDirection(
                //     glMatrix.vec2.fromValues(i + 0.5, j + 0.5));
                // let ray = new Ray(this.camera.getPosition(), dir);
                // hitList.push(this.shape.trace(ray));

                // Super sampling
                // for (let k = 0; k < steps; k++) {
                //     for (let l = 0; l < steps; l++) {
                //         let dir = this.camera.getDirection(
                //             glMatrix.vec2.fromValues(
                //                 i + sum[0] + step / 2,
                //                 j + sum[1] + step / 2
                //             ));
                //         let ray = new Ray(this.camera.getPosition(), dir);
                //         hitList.push(this.shape.trace(ray));
                //
                //         sum[1] += step;
                //     }
                //     sum[0] += step;
                //     sum[1] = 0;
                // }

                // Jitter sampling
                for (let k = 0; k < steps; k++) {
                    for (let l = 0; l < steps; l++) {
                        let dir = this.camera.getDirection(
                            glMatrix.vec2.fromValues(
                                i + sum[0] + Math.random() * step,
                                j + sum[1] + Math.random() * step
                            ));
                        let ray = new Ray(this.camera.getPosition(), dir);
                        hitList.push(this.shape.trace(ray));

                        sum[1] += step;
                    }
                    sum[0] += step;
                    sum[1] = 0;
                }

                let hit = hitList.reduce((i, j) => i + j) / hitList.length;

                if (hit < 0) {
                    this.image.setFLoatColor(
                        [j, i],
                        this.shape.skyColor
                    );
                } else {
                    let color = glMatrix.vec3.create();
                    glMatrix.vec3.scaleAndAdd(color, color, this.shape.gapColor, 1 - hit);
                    glMatrix.vec3.scaleAndAdd(color, color, this.shape.lineColor, hit);
                    this.image.setFLoatColor(
                        [j, i],
                        color
                    );
                }
            }
        }
        this.image.float2Int();
    }
}
