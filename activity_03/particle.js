class Particle {
    constructor() {
        this.vel = [0, 0, 0];
        this.pos = [0, 0, 0];
        this.ftot = [0, 0, 0];
        this.mass = 1;
    }
}

class Force {
    static get NONE() {
        return 0;
    }
    static get GRAV_E() {
        return 1;
    }
    static get GRAV_P() {
        return 2;
    }
    static get SPRING() {
        return 3;
    }
    static get REPULSIVE() {
        return 4;
    }
    static get MAX() {
        return 5;
    }
    constructor() {
        this.type = Force.NONE;
        this.gravE = 0;
        this.gravP = 0;
        this.k_spring = 0;
        this.length_spring = 0;
        this.index_p0 = 0;
        this.index_p1 = 0;
    }
}

class Constraint {
    static get NONE() {
        return 0;
    }
    static get WALL_CUBE() {
        return 1;
    }
    static get WALL() {
        return 2;
    }
    static get STAY() {
        return 3;
    }
    static get MAX() {
        return 4;
    }
    constructor() {
        this.type = Constraint.NONE;
        this.xmin = 0;
        this.xmax = 0;
        this.ymin = 0;
        this.ymax = 0;
        this.zmin = 0;
        this.zmax = 0;
        this.bounceLoss = 0;
        this.index_p = 0;
    }
}

class ParticleSystem {
    constructor() {
        this.state = [];
        this.stateNext = [];
        this.stateDot = [];
        this.stateDotM = [];
        this.forceSet = [];
        this.constraintSet = [];

        this.kDrag = 0.985;
        this.particleCount = 0;

        this.implicit = true;
    }

    init(partCount) {
        this.particleCount = partCount;
        for (let i = 0; i < partCount; i++) {
            let particle = new Particle();
            // particle.pos = [Math.random() * 4.0 - 2.0, Math.random() * 4.0 - 2.0, Math.random() - 0.5];
            particle.pos = [Math.random() * 1.0 - 0.5, Math.random() * 1.0 - 0.5, -1];
            if (i == 0) {
                particle.pos = [0, 0, 0.5];
            }
            // particle.pos = [0, 0, 0];
            this.state.push(particle);

            let particleNext = new Particle();
            // particleNext.pos = [Math.random() * 4.0 - 2.0, Math.random() * 4.0 - 2.0, Math.random() - 0.5];
            particleNext.pos = [Math.random() * 1.0 - 0.5, Math.random() * 1.0 - 0.5, -1];
            particle.pos = [0, 0, -1];
            if (i == 0) {
                particle.pos = [0, 0, 0.5];
            }
            // particle.pos = [0, 0, 0];
            this.stateNext.push(particleNext);

            let particleDot = new Particle();
            particleDot.mass = 0;
            this.stateDot.push(particleDot);

            let particleDotM = new Particle();
            particleDotM.mass = particle.mass;
            this.stateDotM.push(particleDotM);
            // TODO when initializing, make mass to 1 / mass
        }

        // It's more fun if we remove gravity

        let gravity = new Force();
        gravity.type = Force.GRAV_E;
        gravity.gravE = 9.832;
        gravity.gravE = 2;
        this.forceSet.push(gravity);

        // let spring = new Force();
        // spring.type = Force.SPRING;
        // spring.k_spring = 4;
        // spring.length_spring = 0.4;
        // spring.index_p0 = 0;
        // spring.index_p1 = 1;
        // this.forceSet.push(spring);

        // for (let i = 0; i < 10; i++) {
        //     for (let j = 0; j < 100; j++) {
        //         let spring = new Force();
        //         spring.type = Force.SPRING;
        //         spring.k_spring = 3;
        //         spring.length_spring = 0.4;
        //         spring.index_p0 = i * 100;
        //         spring.index_p1 = i * 100 + j;
        //         this.forceSet.push(spring);
        //
        //         if (j != 99) {
        //             let repulse = new Force();
        //             repulse.type = Force.REPULSIVE;
        //             repulse.k_spring = 0.02;
        //             repulse.length_spring = 0.6;
        //             repulse.index_p0 = i * 100 + j;
        //             repulse.index_p1 = i * 100 + j + 1;
        //             this.forceSet.push(repulse);
        //         }
        //     }
        //     if (i != 0) {
        //         let spring = new Force();
        //         spring.type = Force.REPULSIVE;
        //         spring.k_spring = 0.02;
        //         spring.length_spring = 0.6;
        //         spring.index_p0 = i * 100;
        //         spring.index_p1 = 0;
        //         this.forceSet.push(spring);
        //     }
        // }

        for (let i = 1; i < 1000; i++) {
            let spring = new Force();
            spring.type = Force.SPRING;
            spring.k_spring = 5;
            spring.length_spring = 0.1;
            spring.index_p0 = 0;
            spring.index_p1 = i;
            this.forceSet.push(spring);

            if (i != 999) {
                let repulse = new Force();
                repulse.type = Force.REPULSIVE;
                repulse.k_spring = 10;
                repulse.length_spring = 0.9;
                repulse.index_p0 = i;
                repulse.index_p1 = i - 1;
                this.forceSet.push(repulse);
            }
        }

        let cube = new Constraint();
        cube.type = Constraint.WALL_CUBE;
        cube.xmin = -2.0;
        cube.xmax = 2.0;
        cube.bounceLoss = 0.985;
        this.constraintSet.push(cube);

        let stay = new Constraint();
        stay.type = Constraint.STAY;
        stay.index_p = 0;
        this.constraintSet.push(stay);
    }

    updateState(elapsedTime) {
        if (!this.implicit) this.calcNextState(elapsedTime);
        this.calcForces();
        this.calcDot(elapsedTime);
        if (this.implicit) this.calcNextState(elapsedTime);
        this.calcConstraint();
        this.swapState();
    }

    calcForces() {
        // reset particle forces
        for (let i = 0; i < this.particleCount; i++) {
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pDotM = this.stateDotM[i];
            pNext.ftot[0] = 0;
            pNext.ftot[1] = 0;
            pNext.ftot[2] = 0;

            // pDotM.ftot[0] = 0;
            // pDotM.ftot[1] = 0;
            // pDotM.ftot[2] = 0;
            //
            // pDotM.pos[0] = pNext.pos[0] + pDot.pos[0] * elapsedTime * 0.5;
            // pDotM.pos[1] = pNext.pos[1] + pDot.pos[1] * elapsedTime * 0.5;
            // pDotM.pos[2] = pNext.pos[2] + pDot.pos[2] * elapsedTime * 0.5;
        }

        // apply all forces to particles
        for (let i = 0; i < this.forceSet.length; i++) {
            this.applyForce(this.forceSet[i], this.stateNext);
            // this.applyForce(this.forceSet[i], this.stateDotM);
        }
    }

    applyForce(force, particles) {
        let p0, p1, xDist, yDist, zDist, xDistSq, yDistSq, zDistSq, xyDist, l;
        switch (force.type) {
            case Force.GRAV_E:
                for (let i = 0; i < particles.length; i++) {
                    particles[i].ftot[2] -= force.gravE;
                }
                break;
            case Force.GRAV_P:
                break;
            case Force.SPRING:
                p0 = particles[force.index_p0];
                p1 = particles[force.index_p1];
                // Firstly we only calc xDist
                xDist = p0.pos[0] - p1.pos[0];
                yDist = p0.pos[1] - p1.pos[1];
                zDist = p0.pos[2] - p1.pos[2];
                xDistSq = Math.pow(xDist, 2);
                yDistSq = Math.pow(yDist, 2);
                zDistSq = Math.pow(zDist, 2);
                xyDist = Math.sqrt(xDistSq + yDistSq);
                // dist = this.getDistance(p0, p1);
                // l = Math.sqrt(xDistSq + yDistSq) - force.length_spring;);
                l = Math.sqrt(xDistSq + yDistSq + zDistSq) - force.length_spring;
                // console.log(`calculating spring, l=${l}`);
                if (l > 0) {
                    let xSign = xDist > 0 ? 1 : -1;
                    let ySign = yDist > 0 ? 1 : -1;
                    let zSign = zDist > 0 ? 1 : -1;
                    let f = l * force.k_spring;
                    // let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    let anglez = Math.atan2(Math.abs(zDist), Math.abs(xyDist));
                    p0.ftot[2] -= f * Math.cos(anglez) * zSign;
                    p1.ftot[2] += f * Math.cos(anglez) * zSign;

                    let fxy = f * Math.sin(anglez);

                    let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    p0.ftot[0] -= fxy * Math.cos(angle) * xSign;
                    p1.ftot[0] += fxy * Math.cos(angle) * xSign;
                    p0.ftot[1] -= fxy * Math.sin(angle) * ySign;
                    p1.ftot[1] += fxy * Math.sin(angle) * ySign;
                    // console.log(`calculated spring force. ${p0.ftot[0]}, ${p1.ftot[0]}`);
                } else if (Math.abs(l) > 0.1) {
                    let xSign = xDist > 0 ? 1 : -1;
                    let ySign = yDist > 0 ? 1 : -1;
                    let zSign = zDist > 0 ? 1 : -1;
                    let f = l * force.k_spring;
                    // let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    let anglez = Math.atan2(Math.abs(zDist), Math.abs(xyDist));
                    p0.ftot[2] -= f * Math.cos(anglez) * zSign * 4;
                    p1.ftot[2] += f * Math.cos(anglez) * zSign * 4;

                    let fxy = f * Math.sin(anglez);

                    let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    p0.ftot[0] -= fxy * Math.cos(angle) * xSign * 4;
                    p1.ftot[0] += fxy * Math.cos(angle) * xSign * 4;
                    p0.ftot[1] -= fxy * Math.sin(angle) * ySign * 4;
                    p1.ftot[1] += fxy * Math.sin(angle) * ySign * 4;
                }
                break;
            case Force.REPULSIVE:
                p0 = particles[force.index_p0];
                p1 = particles[force.index_p1];
                // Firstly we only calc xDist
                xDist = p0.pos[0] - p1.pos[0];
                yDist = p0.pos[1] - p1.pos[1];
                zDist = p0.pos[2] - p1.pos[2];
                xDistSq = Math.pow(xDist, 2);
                yDistSq = Math.pow(yDist, 2);
                zDistSq = Math.pow(zDist, 2);
                xyDist = Math.sqrt(xDistSq + yDistSq);
                // dist = this.getDistance(p0, p1);
                // l = Math.sqrt(xDistSq + yDistSq) - force.length_spring;);
                l = Math.sqrt(xDistSq + yDistSq + zDistSq) - force.length_spring;
                // console.log(`calculating spring, l=${l}`);
                if (l < 0) {
                    let xSign = xDist > 0 ? 1 : -1;
                    let ySign = yDist > 0 ? 1 : -1;
                    let zSign = zDist > 0 ? 1 : -1;
                    let f = l * force.k_spring;
                    // let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    let anglez = Math.atan2(Math.abs(zDist), Math.abs(xyDist));
                    p0.ftot[2] -= f * Math.cos(anglez) * zSign;
                    p1.ftot[2] += f * Math.cos(anglez) * zSign;

                    let fxy = f * Math.sin(anglez);

                    let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    p0.ftot[0] -= fxy * Math.cos(angle) * xSign;
                    p1.ftot[0] += fxy * Math.cos(angle) * xSign;
                    p0.ftot[1] -= fxy * Math.sin(angle) * ySign;
                    p1.ftot[1] += fxy * Math.sin(angle) * ySign;
                }
                break;
        }
    }

    calcDot(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pDotM = this.stateDotM[i];

            // acc
            pDot.vel[0] = pNext.ftot[0] * pNext.mass;
            pDot.vel[1] = pNext.ftot[1] * pNext.mass;
            pDot.vel[2] = pNext.ftot[2] * pNext.mass;

            // vel
            pDot.pos[0] += pDot.vel[0] * elapsedTime;
            pDot.pos[1] += pDot.vel[1] * elapsedTime;
            pDot.pos[2] += pDot.vel[2] * elapsedTime;

            pDot.pos[0] *= this.kDrag;
            pDot.pos[1] *= this.kDrag;
            pDot.pos[2] *= this.kDrag;
        }
    }

    calcNextState(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pDotM = this.stateDotM[i];

            pNext.pos[0] += pDot.pos[0] * elapsedTime;
            pNext.pos[1] += pDot.pos[1] * elapsedTime;
            pNext.pos[2] += pDot.pos[2] * elapsedTime;
        }
    }

    calcConstraint() {
        for (let i = 0; i < this.constraintSet.length; i++) {
            this.applyConstraint(this.constraintSet[i]);
        }
    }

    applyConstraint(constraint) {
        switch (constraint.type) {
            case Constraint.WALL_CUBE:
                for (let i = 0; i < this.particleCount; i++) {
                    let pNext = this.stateNext[i];
                    let pDot = this.stateDot[i];
                    for (let j = 0; j < 3; j++) {
                        if (pNext.pos[j] < constraint.xmin && pDot.pos[j] < 0.0) {
                            pNext.pos[j] = constraint.xmin;
                            pDot.pos[j] = pNext.vel[j] * constraint.bounceLoss;
                            pDot.pos[j] = pDot.pos[j] < 0.0 ? -pDot.pos[j] : pDot.pos[j];
                        } else if (pNext.pos[j] > constraint.xmax && pDot.pos[j] > 0.0) {
                            pNext.pos[j] = constraint.xmax;
                            pDot.pos[j] = pNext.vel[j] * constraint.bounceLoss;
                            pDot.pos[j] = pDot.pos[j] > 0.0 ? -pDot.pos[j] : pDot.pos[j];
                        }
                    }
                }
                break;
            case Constraint.WALL:
                break;
            case Constraint.STAY:
                let pNext = this.stateNext[constraint.index_p];
                let pCurr = this.state[constraint.index_p];
                for (let j = 0; j < 3; j++) {
                    pNext.pos[j] = pCurr.pos[j];
                }
                break;
        }
    }

    swapState() {
        for (let i = 0; i < this.particleCount; i++) {
            let pCurr = this.state[i];
            let pDot = this.stateDot[i];
            let pNext = this.stateNext[i];

            pNext.vel[0] = pDot.pos[0];
            pNext.vel[1] = pDot.pos[1];
            pNext.vel[2] = pDot.pos[2];

            pCurr.pos[0] = pNext.pos[0];
            pCurr.pos[1] = pNext.pos[1];
            pCurr.pos[2] = pNext.pos[2];

            pCurr.vel[0] = pNext.vel[0];
            pCurr.vel[1] = pNext.vel[1];
            pCurr.vel[2] = pNext.vel[2];
        }
    }

    addForce() {
        for (let j = 0; j < this.particleCount; j++) {
            let pDot = this.stateDot[j];
            for (let i = 0; i < 3; i++) {
                let v = Math.random() * 4.0 + 5.0;
                pDot.pos[i] += pDot.pos[i] > 0.0 ? v : -v;
            }
            // let v = Math.random() * 4.0 + 5.0;
            // pDot.pos[0] += pDot.pos[0] > 0.0 ? v : -v;
        }
    }

    getDistance(p0, p1) {
        let sq_x = Math.pow(p0[0], 2) + Math.pow(p1[0], 2);
        let sq_y = Math.pow(p0[1], 2) + Math.pow(p1[1], 2);
        let sq_z = Math.pow(p0[2], 2) + Math.pow(p1[2], 2);
        return Math.sqrt(sq_x + sq_y + sq_z);
    }
}
