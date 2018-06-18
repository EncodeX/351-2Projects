import Image from '/ray_trace/image.js';
import Ray from '/ray_trace/ray.js';
import Geometry from '/ray_trace/geometry.js';
import Light from '/ray_trace/light.js';
import Material from '/ray_trace/material.js';
import HitPoint from '/ray_trace/hit_point.js';
import GridPlane from '/ray_trace/grid_plane.js';
import Cube from '/ray_trace/cube.js';
import Sphere from '/ray_trace/sphere.js';
import * as glMatrix from '/lib/gl-matrix.js';

export default class Scene {
    constructor(camera, image) {
        // init here
        this.image = image;
        this.camera = camera;
        this.shapes = [];

        this.initShapes();
        this.shapes = this.sceneShapeSet[0];

        this.camera.rotateX(90);
        // this.camera.rotateZ(45);
        // this.camera.rotateY(45);

        this.lights = [];
        this.lights.push(new Light(
            glMatrix.vec4.fromValues(0, -2, 2, 1),
            glMatrix.vec4.fromValues(0, 1, -1, 0),
            glMatrix.vec3.fromValues(1.0, 1.0, 1.0),
            glMatrix.vec3.fromValues(8.0, 8.0, 8.0),
            glMatrix.vec3.fromValues(8.0, 8.0, 8.0)
        ));
        this.lights.push(new Light(
            glMatrix.vec4.fromValues(-5, 2, 5, 1),
            glMatrix.vec4.fromValues(3, 4, 0, 0),
            glMatrix.vec3.fromValues(1.0, 1.0, 1.0),
            glMatrix.vec3.fromValues(5.0, 5.0, 5.0),
            glMatrix.vec3.fromValues(8.0, 8.0, 8.0)
        ));
        this.lightSwitch = [true, true];
    }

    static get SAMPLING_NONE() {
        return 0;
    }
    static get SAMPLING_SUPER() {
        return 1;
    }
    static get SAMPLING_JITTER() {
        return 2;
    }

    initShapes() {
        this.sceneShapeSet = [];
        let newShapeSet = [];
        let ground = new GridPlane(-5);
        // ground.setType(Geometry.TYPE_REFLECT);

        // ground.rotate(90, 0, 0);
        // ground.translate(0, 0, 2);

        // MATL_BLU_PLASTIC
        ground.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.05, 0.05, 0.05),
            glMatrix.vec3.fromValues(0.0, 0.2, 0.6),
            glMatrix.vec3.fromValues(0.1, 0.2, 0.3),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            5
        ));
        // MATL_GRN_PLASTIC
        ground.setSecondaryMaterial(new Material(
            glMatrix.vec3.fromValues(0.25, 0.25, 0.25),
            glMatrix.vec3.fromValues(0.4, 0.4, 0.4),
            glMatrix.vec3.fromValues(0.774597, 0.774597, 0.774597),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            76.8
        ));

        newShapeSet.push(ground);

        let cube = new Cube();

        cube.rotate(45, 45, 0);
        // cube.rotate(30, 0, 0);
        // cube.rotate(0, 45, 0);
        cube.scale(0.7, 0.7, 0.7);
        cube.translate(-3, 5, -2);
        // cube.scale(1, 1, 0.3);
        cube.setType(Geometry.TYPE_SOLID);
        // MATL_BRASS
        cube.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.329412, 0.223529, 0.027451),
            glMatrix.vec3.fromValues(0.780392, 0.568627, 0.113725),
            glMatrix.vec3.fromValues(0.992157, 0.941176, 0.807843),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            27.8974
        ));

        newShapeSet.push(cube);

        cube = new Cube();
        cube.translate(2, 7, -2);
        // cube.scale(1, 1, 0.3);
        cube.setType(Geometry.TYPE_SOLID);
        // MATL_BRASS
        cube.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.329412, 0.223529, 0.027451),
            glMatrix.vec3.fromValues(0.780392, 0.568627, 0.113725),
            glMatrix.vec3.fromValues(0.992157, 0.941176, 0.807843),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            27.8974
        ));

        newShapeSet.push(cube);

        cube = new Cube();
        cube.scale(0.3, 0.6, 0.2);
        cube.translate(1.4, 2, -0.5);
        // cube.scale(1, 1, 0.3);
        cube.setType(Geometry.TYPE_SOLID);
        // MATL_BRASS
        cube.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.329412, 0.223529, 0.027451),
            glMatrix.vec3.fromValues(0.780392, 0.568627, 0.113725),
            glMatrix.vec3.fromValues(0.992157, 0.941176, 0.807843),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            27.8974
        ));

        newShapeSet.push(cube);

        let sphere = new Sphere();

        // sphere.rotate(45, 45, 0);
        sphere.scale(0.6, 0.6, 0.6);
        sphere.translate(0, 2, -0.1);
        // sphere.scale(1, 1, 0.3);
        sphere.setType(Geometry.TYPE_GLASS);
        // sphere.setType(Geometry.TYPE_REFLECT);
        sphere.setRefracIndex(1.6);
        // MATL_GRN_PLASTIC
        sphere.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.05, 0.05, 0.05),
            glMatrix.vec3.fromValues(0.0, 0.6, 0.0),
            glMatrix.vec3.fromValues(0.2, 0.2, 0.2),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            60
        ));

        newShapeSet.push(sphere);

        let sphere2 = new Sphere();

        sphere2.scale(2, 2, 1);
        sphere2.translate(2, 5, 2);
        sphere2.setType(Geometry.TYPE_REFLECT);
        // sphere2.setType(Geometry.TYPE_GLASS);
        // MATL_GRN_PLASTIC
        sphere2.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.05, 0.05, 0.05),
            glMatrix.vec3.fromValues(0.0, 0.6, 0.0),
            glMatrix.vec3.fromValues(0.2, 0.2, 0.2),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            60
        ));

        newShapeSet.push(sphere2);
        this.sceneShapeSet.push(newShapeSet);

        // 2nd scene
        newShapeSet = [];
        newShapeSet.push(ground);
        let s = new Sphere();
        s.translate(1.2, 2.5, 0);
        s.setType(Geometry.TYPE_REFLECT);
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.05, 0.05, 0.05),
            glMatrix.vec3.fromValues(0.0, 0.6, 0.0),
            glMatrix.vec3.fromValues(0.2, 0.2, 0.2),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            60
        ));
        newShapeSet.push(s);
        s = new Sphere();
        s.translate(-1.2, 2.5, 0);
        s.setType(Geometry.TYPE_REFLECT);
        // MATL_CHROME
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.25, 0.25, 0.25),
            glMatrix.vec3.fromValues(0.4, 0.4, 0.4),
            glMatrix.vec3.fromValues(0.774597, 0.774597, 0.774597),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            76.8
        ));
        newShapeSet.push(s);
        s = new Sphere();
        s.translate(1.2, 5, 0);
        s.setType(Geometry.TYPE_REFLECT);
        // MATL_COPPER_SHINY
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.2295, 0.08825, 0.0275),
            glMatrix.vec3.fromValues(0.5508, 0.2118, 0.066),
            glMatrix.vec3.fromValues(0.580594, 0.223257, 0.0695701),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            51.2
        ));
        newShapeSet.push(s);
        cube = new Cube();
        cube.translate(-1.2, 5, 0);
        cube.setType(Geometry.TYPE_REFLECT);
        // MATL_BRASS
        cube.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.329412, 0.223529, 0.027451),
            glMatrix.vec3.fromValues(0.780392, 0.568627, 0.113725),
            glMatrix.vec3.fromValues(0.992157, 0.941176, 0.807843),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            27.8974
        ));
        newShapeSet.push(cube);
        this.sceneShapeSet.push(newShapeSet);

        // 3rd scene
        newShapeSet = [];
        newShapeSet.push(ground);
        s = new Sphere();
        s.translate(1.2, 5, 0);
        s.setType(Geometry.TYPE_GLASS);
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.05, 0.05, 0.05),
            glMatrix.vec3.fromValues(0.0, 0.6, 0.0),
            glMatrix.vec3.fromValues(0.2, 0.2, 0.2),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            60
        ));
        newShapeSet.push(s);
        s = new Sphere();
        s.translate(-1.2, 2.5, 0);
        s.setType(Geometry.TYPE_GLASS);
        // MATL_CHROME
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.25, 0.25, 0.25),
            glMatrix.vec3.fromValues(0.4, 0.4, 0.4),
            glMatrix.vec3.fromValues(0.774597, 0.774597, 0.774597),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            76.8
        ));
        newShapeSet.push(s);
        s = new Sphere();
        s.translate(-1.2, 5, 0);
        s.setType(Geometry.TYPE_GLASS);
        // MATL_COPPER_SHINY
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.2295, 0.08825, 0.0275),
            glMatrix.vec3.fromValues(0.5508, 0.2118, 0.066),
            glMatrix.vec3.fromValues(0.580594, 0.223257, 0.0695701),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            51.2
        ));
        newShapeSet.push(s);
        cube = new Cube();
        cube.translate(1.2, 2.5, 0);
        cube.setType(Geometry.TYPE_GLASS);
        // MATL_BRASS
        cube.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.329412, 0.223529, 0.027451),
            glMatrix.vec3.fromValues(0.780392, 0.568627, 0.113725),
            glMatrix.vec3.fromValues(0.992157, 0.941176, 0.807843),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            27.8974
        ));
        newShapeSet.push(cube);
        this.sceneShapeSet.push(newShapeSet);

        // 4th scene
        newShapeSet = [];
        newShapeSet.push(ground);
        s = new Sphere();
        s.scale(3, 3, 0.05);
        s.translate(0, 8, -4);
        s.setType(Geometry.TYPE_GLASS);
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.05, 0.05, 0.05),
            glMatrix.vec3.fromValues(0.0, 0.6, 0.0),
            glMatrix.vec3.fromValues(0.2, 0.2, 0.2),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            60
        ));
        newShapeSet.push(s);
        s = new Sphere();
        s.translate(0, 5, -2);
        s.setType(Geometry.TYPE_REFLECT);
        // MATL_CHROME
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.25, 0.25, 0.25),
            glMatrix.vec3.fromValues(0.4, 0.4, 0.4),
            glMatrix.vec3.fromValues(0.774597, 0.774597, 0.774597),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            76.8
        ));
        newShapeSet.push(s);
        s = new Sphere();
        s.scale(10, 0.1, 10);
        s.translate(0, 13, -1);
        s.setType(Geometry.TYPE_REFLECT);
        // MATL_COPPER_SHINY
        s.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.2295, 0.08825, 0.0275),
            glMatrix.vec3.fromValues(0.5508, 0.2118, 0.066),
            glMatrix.vec3.fromValues(0.580594, 0.223257, 0.0695701),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            51.2
        ));
        newShapeSet.push(s);
        cube = new Cube();
        cube.scale(0.8, 0.8, 0.8);
        cube.translate(4, 8, -4);
        cube.setType(Geometry.TYPE_SOLID);
        // MATL_BRASS
        cube.setMaterial(new Material(
            glMatrix.vec3.fromValues(0.329412, 0.223529, 0.027451),
            glMatrix.vec3.fromValues(0.780392, 0.568627, 0.113725),
            glMatrix.vec3.fromValues(0.992157, 0.941176, 0.807843),
            glMatrix.vec3.fromValues(0.0, 0.0, 0.0),
            27.8974
        ));
        newShapeSet.push(cube);
        this.sceneShapeSet.push(newShapeSet);
    }

    traceRay(hitPoint, method, steps, i, j) {
        let hitList = [],
            hitPoints = [],
            rayList = [];
        let sum = [0, 0];
        let step = 1 / steps;
        switch (method) {
            case Scene.SAMPLING_NONE:
                let time = hitPoint.shape.trace(hitPoint.ray);
                hitPoints.push(new HitPoint(
                    glMatrix.vec4.scaleAndAdd(
                        [],
                        glMatrix.vec4.clone(hitPoint.ray.origin),
                        glMatrix.vec4.clone(hitPoint.ray.direction),
                        time),
                    glMatrix.vec4.clone(hitPoint.ray.direction),
                    hitPoint.shape,
                    hitPoint.ray.duplicate(),
                    time
                ));
                break;
            case Scene.SAMPLING_SUPER:
                // Super sampling
                for (let k = 0; k < steps; k++) {
                    for (let l = 0; l < steps; l++) {
                        let dir = this.camera.getDirection(
                            glMatrix.vec2.fromValues(
                                i + sum[0] + step / 2,
                                j + sum[1] + step / 2
                            ),
                            this.image.height - 1,
                            this.image.width - 1
                        );
                        let ray = new Ray(this.camera.getPosition(), dir);
                        let time = hitPoint.shape.trace(ray);
                        hitPoints.push(new HitPoint(
                            glMatrix.vec4.scaleAndAdd(
                                [],
                                glMatrix.vec4.clone(ray.origin),
                                glMatrix.vec4.clone(ray.direction),
                                time),
                            glMatrix.vec4.clone(ray.direction),
                            hitPoint.shape,
                            ray.duplicate(),
                            time
                        ));

                        sum[1] += step;
                    }
                    sum[0] += step;
                    sum[1] = 0;
                }
                break;
            case Scene.SAMPLING_JITTER:
                // Jitter sampling
                for (let k = 0; k < steps; k++) {
                    for (let l = 0; l < steps; l++) {
                        let dir = this.camera.getDirection(
                            glMatrix.vec2.fromValues(
                                i + sum[0] + Math.random() * step,
                                j + sum[1] + Math.random() * step
                            ),
                            this.image.height - 1,
                            this.image.width - 1
                        );
                        let ray = new Ray(this.camera.getPosition(), dir);
                        let time = hitPoint.shape.trace(ray);
                        hitPoints.push(new HitPoint(
                            glMatrix.vec4.scaleAndAdd(
                                [],
                                glMatrix.vec4.clone(ray.origin),
                                glMatrix.vec4.clone(ray.direction),
                                time),
                            glMatrix.vec4.clone(ray.direction),
                            hitPoint.shape,
                            ray.duplicate(),
                            time
                        ));

                        sum[1] += step;
                    }
                    sum[0] += step;
                    sum[1] = 0;
                }
                break;
        }
        return hitPoints;
    }

    getColor(hitPoint, method, steps, i, j, recursive, isOriginalRay = true, fromInside = false) {
        let hitPoints = this.traceRay(hitPoint, method, steps, i, j);

        if (recursive < 1 || hitPoint.shape.type != Geometry.TYPE_REFLECT) {
            switch (hitPoint.shape.type) {
                case Geometry.TYPE_SOLID:
                    return this.calcLightShadow(hitPoints);
                case Geometry.TYPE_GLASS:
                    // calc glass ray
                    return this.calcGlassColor(hitPoint, hitPoints, recursive, fromInside);
                case Geometry.TYPE_REFLECT:
                    return this.calcLightShadow(hitPoints);
            }
        }

        // Generate new hitpoint

        let color = glMatrix.vec3.fromValues(0, 0, 0);
        hitPoints.forEach((p, index) => {
            let N = p.shape.getNormal(p);
            let V = p.ray.direction.map(i => -i);

            let C = glMatrix.vec4.scale(
                [],
                glMatrix.vec4.clone(N),
                glMatrix.vec3.dot(glMatrix.vec4.clone(V), glMatrix.vec4.clone(N))
            );

            let R = glMatrix.vec3.subtract(
                [],
                glMatrix.vec3.scale([], glMatrix.vec4.clone(C), 2),
                glMatrix.vec3.clone(V)
            );

            R = glMatrix.vec4.fromValues(...R, 0);

            let newRay = new Ray(
                glMatrix.vec4.clone(p.origin),
                glMatrix.vec4.clone(R)
            );
            let newHit = this.findHitPoint(newRay);

            if (newHit == null) {
                // let c = this.calcLightShadow(hitPoints);
                // glMatrix.vec3.scaleAndAdd(color, color, c, 1 / hitPoints.length);
                glMatrix.vec3.scaleAndAdd(color, color, Geometry.skyColor.ambient, 0.5 / hitPoints.length);
                let c = this.calcLightShadow([hitPoint]);
                glMatrix.vec3.scaleAndAdd(color, color, c, 0.5 / hitPoints.length);
            } else {
                let c = this.getColor(newHit, Scene.SAMPLING_NONE, 1, 0, 0, recursive - 1, false);
                glMatrix.vec3.scaleAndAdd(color, color, c, 0.5 / hitPoints.length);
                c = this.calcLightShadow([hitPoint]);
                glMatrix.vec3.scaleAndAdd(color, color, c, 0.5 / hitPoints.length);
            }
        });

        return color;
    }

    refreshImage(recursive, method = Scene.SAMPLING_NONE, steps = 1) {
        // trace here
        for (let i = 0; i < this.image.height; i++) {
            for (let j = 0; j < this.image.width; j++) {
                // No sampling
                let dir = this.camera.getDirection(
                    glMatrix.vec2.fromValues(i, j),
                    this.image.height - 1,
                    this.image.width - 1
                );
                let ray = new Ray(this.camera.getPosition(), dir);

                // trace every shape
                let hitPoint = this.findHitPoint(ray);

                if (hitPoint == null) {
                    this.image.setFLoatColor(
                        [j, i],
                        Geometry.skyColor.ambient
                    );
                } else {
                    // do reflection / shadowing
                    let color = this.getColor(hitPoint, method, steps, i, j, recursive);
                    this.image.setFLoatColor([j, i], color);
                }
            }
        }
        this.image.float2Int();
    }

    calcLightShadow(hitPoints) {
        let color = glMatrix.vec3.fromValues(0, 0, 0);
        // Test shadow here
        this.lights.forEach((l, i) => {
            // let hitCount = 0;
            if (!this.lightSwitch[i]) return;
            hitPoints.forEach((p, index) => {
                // link lights and test
                let ori = glMatrix.vec4.scaleAndAdd([], p.origin, p.direction, -Math.pow(10, -14));
                p.origin = ori;
                let shadowRay = new Ray(
                    glMatrix.vec4.clone(p.origin),
                    glMatrix.vec4.subtract(
                        [], glMatrix.vec4.clone(l.origin), glMatrix.vec4.clone(p.origin))
                );
                // console.log(p, hitPoint.origin);
                let shadowHit = this.findHitPoint(shadowRay);
                let hitMaterial = p.shape.getColor(
                    p.t,
                    p.ray);

                glMatrix.vec3.scaleAndAdd(color, color, hitMaterial.emissive, 1 / hitPoints.length);

                glMatrix.vec3.scaleAndAdd(color, color,
                    glMatrix.vec3.multiply(
                        [],
                        glMatrix.vec3.clone(hitMaterial.ambient),
                        glMatrix.vec3.clone(l.ambient)),
                    1 / hitPoints.length);

                if (shadowHit == null) {
                    // calc lighting
                    let d = glMatrix.vec3.length(
                        shadowRay.direction
                    );
                    // distance
                    let att = 1 / d;
                    let L = glMatrix.vec3.normalize([], glMatrix.vec4.clone(shadowRay.direction));
                    let N = glMatrix.vec3.normalize([], p.shape.getNormal(p));
                    let V = glMatrix.vec3.normalize([], p.direction.map(i => -i));

                    let C = glMatrix.vec3.scale(
                        [],
                        glMatrix.vec3.clone(N),
                        glMatrix.vec3.dot(glMatrix.vec3.clone(L), glMatrix.vec3.clone(N))
                    );

                    let R = glMatrix.vec3.subtract(
                        [],
                        glMatrix.vec3.scale([], glMatrix.vec3.clone(C), 2),
                        glMatrix.vec3.clone(L)
                    );

                    // R = glMatrix.vec4.fromValues(...R, 0);

                    glMatrix.vec3.scaleAndAdd(
                        color, color,
                        glMatrix.vec3.multiply(
                            [],
                            glMatrix.vec3.clone(hitMaterial.diffuse),
                            glMatrix.vec3.clone(l.diffuse)),
                        Math.max(0, glMatrix.vec3.dot(N, L)) * att / hitPoints.length
                    );

                    glMatrix.vec3.scaleAndAdd(
                        color, color,
                        glMatrix.vec3.multiply(
                            [],
                            glMatrix.vec3.clone(hitMaterial.specular),
                            glMatrix.vec3.clone(l.specular)),
                        Math.pow(
                            Math.max(0, glMatrix.vec3.dot(R, V)),
                            hitMaterial.shinyness
                        ) * att / hitPoints.length
                    );
                }
            });
        });
        return color;
    }

    calcGlassColor(hitPoint, hitPoints, recursive, fromInside) {
        let color = glMatrix.vec3.fromValues(0, 0, 0);
        hitPoints.forEach(p => {
            let ori = glMatrix.vec4.normalize([], glMatrix.vec4.scaleAndAdd([], p.origin, p.direction, Math.pow(10, -14)));
            p.origin = ori;
            let N = glMatrix.vec3.normalize([], p.shape.getNormal(p));
            let _N = N.map(i => -i);
            if (fromInside) {
                N = N.map(i => -i);
                _N = _N.map(i => -i);
            }
            let r = fromInside ? p.shape.refracIndex : 1 / p.shape.refracIndex;
            // let r = p.shape.refracIndex;
            let c = glMatrix.vec3.dot(glMatrix.vec3.clone(_N), glMatrix.vec3.clone(p.direction));
            let A = glMatrix.vec3.scale([], glMatrix.vec3.clone(p.direction), r);
            let B = glMatrix.vec3.scale(
                [], glMatrix.vec3.clone(N),
                r * c - Math.sqrt(1 - Math.pow(r, 2) * (1 - Math.pow(c, 2)))
            );
            let newDir = glMatrix.vec3.add([], A, B);
            let newRay = new Ray(
                glMatrix.vec4.clone(p.origin),
                glMatrix.vec4.fromValues(...newDir, 0)
            );
            let newHit = this.findHitPoint(newRay);

            if (newHit == null) {
                let c = this.calcLightShadow(hitPoints);
                glMatrix.vec3.scaleAndAdd(color, color, Geometry.skyColor.ambient, 0.8 / hitPoints.length);
                c = this.calcLightShadow([hitPoint]);
                glMatrix.vec3.scaleAndAdd(color, color, c, 0.2 / hitPoints.length);
            } else {
                let c = this.getColor(newHit, Scene.SAMPLING_NONE, 1, 0, 0, recursive, false, !fromInside);
                glMatrix.vec3.scaleAndAdd(color, color, c, 0.8 / hitPoints.length);
                c = this.calcLightShadow([hitPoint]);
                glMatrix.vec3.scaleAndAdd(color, color, c, 0.2 / hitPoints.length);
            }
        });
        return color;
    }

    findHitPoint(ray) {
        let minDist = Number.MAX_VALUE;
        let hitTarget;
        this.shapes.forEach(shape => {
            let testHit = shape.hitTest(ray);
            if (testHit > 0 && testHit < minDist) {
                hitTarget = shape;
                minDist = testHit;
            }
        });
        if (hitTarget == null) return null;

        let hp = new HitPoint(
            glMatrix.vec4.scaleAndAdd(
                [],
                glMatrix.vec4.clone(ray.origin),
                glMatrix.vec4.clone(ray.direction),
                minDist),
            glMatrix.vec4.clone(ray.direction),
            hitTarget,
            ray.duplicate(),
            minDist
        );

        return hp;
    }

    switchScene(index) {
        this.shapes = this.sceneShapeSet[index];
    }

    switchLight(i) {
        this.lightSwitch[i] = !this.lightSwitch[i];
    }
}
