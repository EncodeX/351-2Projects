class Particle {
    constructor() {
        this.vel = [0, 0, 0];
        this.pos = [0, 0, 0];
        this.ftot = [0, 0, 0];
        this.mass = 1;
    }
}

class ParticleState {
    constructor() {
        this.particles = [];
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
    static get MAX() {
        return 3;
    }
    constructor() {
        this.type = Force.NONE;
        this.gravE = 0;
        this.gravP = 0;
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
    static get MAX() {
        return 3;
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
    }
}

class ParticleSystem {
    constructor() {
        this.nextState = [];
        this.currState = [];
        this.currStateDot = [];
        this.forceSet = [];
        this.constraintSet = [];

        this.kDrag = 0.985;
        this.particleCount = 0;
    }

    init(partCount) {
        this.particleCount = partCount;
        for (let i = 0; i < partCount; i++) {
            let particleNow = new Particle();
            particleNow.pos = [Math.random() * 4.0 - 2.0, Math.random() * 4.0 - 2.0, Math.random() - 0.5];
            this.currState.push(particleNow);

            let particlePrev = new Particle();
            particlePrev.pos = [Math.random() * 4.0 - 2.0, Math.random() * 4.0 - 2.0, Math.random() - 0.5];
            this.nextState.push(particlePrev);

            let particleDot = new Particle();
            particleDot.mass = 0;
            this.currStateDot.push(particleDot);
        }

        let gravity = new Force();
        gravity.type = Force.GRAV_E;
        gravity.gravE = 9.832;
        this.forceSet.push(gravity);

        let cube = new Constraint();
        cube.type = Constraint.WALL_CUBE;
        cube.xmin = -2.0;
        cube.xmax = 2.0;
        cube.bounceLoss = 0.985;
        this.constraintSet.push(cube);
    }

    updateStatePreRender() {
        this.calcForces();
        this.calcDot();
    }

    updateStatePostRender(elapsedTime) {
        this.calcNextState(elapsedTime);
        this.calcConstraint();
        this.swapState();
    }

    swapState() {
        for (let i = 0; i < this.particleCount; i++) {
            let pDot = this.currStateDot[i];
            let pCurr = this.currState[i];
            let pNext = this.nextState[i];

            pCurr.pos[0] = pNext.pos[0];
            pCurr.pos[1] = pNext.pos[1];
            pCurr.pos[2] = pNext.pos[2];

            pCurr.vel[0] = pNext.vel[0];
            pCurr.vel[1] = pNext.vel[1];
            pCurr.vel[2] = pNext.vel[2];
        }
    }

    calcForces() {
        // reset particle forces
        for (let i = 0; i < this.particleCount; i++) {
            let particle = this.currState[i];
            particle.ftot[0] = 0;
            particle.ftot[1] = 0;
            particle.ftot[2] = 0;
        }

        // apply all forces to particles
        for (let i = 0; i < this.forceSet.length; i++) {
            this.applyForce(this.forceSet[i], this.currState);
        }
    }

    applyForce(force, particles) {
        switch (force.type) {
            case Force.GRAV_E:
                for (let i = 0; i < particles.length; i++) {
                    particles[i].ftot[2] -= force.gravE;
                }
                break;
            case Force.GRAV_P:
                break;
        }
    }

    calcDot() {
        for (let i = 0; i < this.particleCount; i++) {
            let pCur = this.currState[i];
            let pDot = this.currStateDot[i];

            pDot.pos[0] = pCur.vel[0];
            pDot.pos[1] = pCur.vel[1];
            pDot.pos[2] = pCur.vel[2];

            pDot.pos[0] *= this.kDrag;
            pDot.pos[1] *= this.kDrag;
            pDot.pos[2] *= this.kDrag;

            // TODO upgrade it to use d mass / d t
            pDot.vel[0] = pCur.ftot[0] / pCur.mass;
            pDot.vel[1] = pCur.ftot[1] / pCur.mass;
            pDot.vel[2] = pCur.ftot[2] / pCur.mass;
        }
    }

    calcNextState(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pCurr = this.currState[i];
            let pNext = this.nextState[i];
            let pDot = this.currStateDot[i];

            pNext.pos[0] = pCurr.pos[0] + pDot.pos[0] * elapsedTime;
            pNext.pos[1] = pCurr.pos[1] + pDot.pos[1] * elapsedTime;
            pNext.pos[2] = pCurr.pos[2] + pDot.pos[2] * elapsedTime;

            pNext.vel[0] = pCurr.vel[0] + pDot.vel[0] * elapsedTime;
            pNext.vel[1] = pCurr.vel[1] + pDot.vel[1] * elapsedTime;
            pNext.vel[2] = pCurr.vel[2] + pDot.vel[2] * elapsedTime;

            // pNext.vel[0] *= this.kDrag;
            // pNext.vel[1] *= this.kDrag;
            // pNext.vel[2] *= this.kDrag;
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
                    let pCurr = this.currState[i];
                    let pNext = this.nextState[i];
                    for (let j = 0; j < 3; j++) {
                        if (pNext.pos[j] < constraint.xmin && pNext.vel[j] < 0.0) {
                            pNext.pos[j] = constraint.xmin;
                            pNext.vel[j] = pCurr.vel[j] * constraint.bounceLoss;
                            pNext.vel[j] = pNext.vel[j] < 0.0 ? -pNext.vel[j] : pNext.vel[j];
                        } else if (pNext.pos[j] > constraint.xmax && pNext.vel[j] > 0.0) {
                            pNext.pos[j] = constraint.xmax;
                            pNext.vel[j] = pCurr.vel[j] * constraint.bounceLoss;
                            pNext.vel[j] = pNext.vel[j] > 0.0 ? -pNext.vel[j] : pNext.vel[j];
                        }
                    }
                }
                break;
            case Constraint.WALL:
                break;
        }
    }

    addForce() {
        for (let j = 0; j < this.particleCount; j++) {
            let pCurr = this.currState[j];
            for (let i = 0; i < 3; i++) {
                let v = Math.random() * 4.0 + 5.0;
                pCurr.vel[i] += pCurr.vel[i] > 0.0 ? v : -v;
            }
        }
    }
}
