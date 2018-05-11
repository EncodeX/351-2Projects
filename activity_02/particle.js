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
        this.state = [];
        this.stateDot = [];
        this.forceSet = [];
        this.constraintSet = [];

        this.kDrag = 0.985;
        this.particleCount = 0;
    }

    init(partCount) {
        this.particleCount = partCount;
        for (let i = 0; i < partCount; i++) {
            let particle = new Particle();
            particle.pos = [Math.random() * 4.0 - 2.0, Math.random() * 4.0 - 2.0, Math.random() - 0.5];
            this.state.push(particle);

            let particleDot = new Particle();
            particleDot.mass = 0;
            this.stateDot.push(particleDot);
            // TODO when initializing, make mass to 1 / mass
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

    updateState(elapsedTime) {
        this.calcForces();
        this.calcDot(elapsedTime);
        this.calcNextState(elapsedTime);
        this.calcConstraint();
        this.swapState();
    }

    swapState() {
        for (let i = 0; i < this.particleCount; i++) {
            let pDot = this.stateDot[i];
            let pNext = this.state[i];

            pNext.vel[0] = pDot.pos[0];
            pNext.vel[1] = pDot.pos[1];
            pNext.vel[2] = pDot.pos[2];
        }
    }

    calcForces() {
        // reset particle forces
        for (let i = 0; i < this.particleCount; i++) {
            let particle = this.state[i];
            particle.ftot[0] = 0;
            particle.ftot[1] = 0;
            particle.ftot[2] = 0;
        }

        // apply all forces to particles
        for (let i = 0; i < this.forceSet.length; i++) {
            this.applyForce(this.forceSet[i], this.state);
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

    calcDot(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pNext = this.state[i];
            let pDot = this.stateDot[i];

            // TODO upgrade it and use d mass / d t
            pDot.vel[0] = pNext.ftot[0] * pNext.mass;
            pDot.vel[1] = pNext.ftot[1] * pNext.mass;
            pDot.vel[2] = pNext.ftot[2] * pNext.mass;

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
            let pNext = this.state[i];
            let pDot = this.stateDot[i];

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
                    let pNext = this.state[i];
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
        }
    }

    addForce() {
        for (let j = 0; j < this.particleCount; j++) {
            let pDot = this.stateDot[j];
            for (let i = 0; i < 3; i++) {
                let v = Math.random() * 4.0 + 5.0;
                pDot.pos[i] += pDot.pos[i] > 0.0 ? v : -v;
            }
        }
    }
}
