class Particle {
    constructor() {
        this.vel = [0, 0, 0];
        this.pos = [0, 0, 0];
        this.ftot = [0, 0, 0];
        this.color = [0, 0, 0, 1];
        this.mass = 1;
        this.size = 7;
        this.life = 1;
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
    static get FIRE_RAND() {
        return 5;
    }
    static get ROUND() {
        return 6;
    }
    static get GRAV_P_SELECT() {
        return 7;
    }
    static get CENTRIPETAL() {
        return 8;
    }
    static get BOIDS() {
        return 9;
    }
    static get MAX() {
        return 10;
    }
    constructor() {
        this.type = Force.NONE;
        this.gravE = 0;
        this.force = 0;
        this.forceFix = [0, 0, 0];
        this.k_spring = 0;
        this.length_spring = 0;
        this.direction = [0, 0, 0];
        this.index_p0 = 0;
        this.index_p1 = 0;
        this.neighbours = [];
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
    static get FIRE_RECREATOR() {
        return 4;
    }
    static get FIRE() {
        return 5;
    }
    static get WIND_RANDOMIZER() {
        return 6
    }
    static get TORNADO_DAMPING() {
        return 7;
    }
    static get BOIDS_LEADER() {
        return 8;
    }
    static get SPHERE() {
        return 9;
    }
    static get MAX() {
        return 10;
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
        this.force = null;
        this.force2 = null;
    }
}

class ParticleModel {
    static get RESET_POS_NONE() {
        return 0;
    }
    static get RESET_POS_ALL() {
        return 1;
    }
    static get RESET_POS_SPECIFIED() {
        return 2;
    }
    static get RESET_POS_MAX() {
        return 3;
    }
    static get RESET_COLOR_NONE() {
        return 0;
    }
    static get RESET_COLOR_ALL() {
        return 1;
    }
    static get RESET_COLOR_ALL_RAND() {
        return 2;
    }
    static get RESET_COLOR_SPECIFIED() {
        return 3;
    }
    static get RESET_COLOR_MAX() {
        return 4;
    }
    static get RESET_SIZE_ALL() {
        return 1;
    }
    static get RESET_SIZE_ALL_RAND() {
        return 2;
    }
    static get RESET_SIZE_SPECIFIED() {
        return 3;
    }
    static get RESET_SIZE_MAX() {
        return 4;
    }
    constructor() {
        this.forceSet = [];
        this.constraintSet = [];
        this.resetPosType = ParticleModel.RESET_POS_NONE;
        this.resetPosList = [];
        this.resetColorType = ParticleModel.RESET_COLOR_NONE;
        this.resetColorList = [];
        this.resetSizeType = ParticleModel.RESET_SIZE_NONE;
        this.resetSizeList = [];
    }
}

class ParticleSystem {
    constructor() {
        this.state = [];
        this.stateNext = [];
        this.stateDot = [];
        this.stateMid = [];
        // this.forceSet = [];
        // this.constraintSet = [];
        this.models = {
            names: []
        };
        this.currentModel = null;

        this.kDrag = 0.985;
        this.particleCount = 0;

        this.implicit = true;

        this.solvers = [this.eulerSolver, this.midPointSolver, this.verletSolver];
        this.currentSolver = this.solvers[0];
    }

    init(partCount) {
        this.particleCount = partCount;
        for (let i = 0; i < partCount; i++) {
            let particle = new Particle();
            particle.pos = [Math.random() * 8.0 - 4.0, Math.random() * 8.0 - 4.0, Math.random() * 8.0 - 4.0];
            // particle.pos = [Math.random() * 1.0 - 0.5, Math.random() * 1.0 - 0.5, -1];
            // particle.pos = [0, 0, Math.random() * 4.0 - 2.0];
            // particle.pos = [Math.random() * 1.0 - 0.5, Math.random() * 1.0 - 0.5, 0];
            // if (i == 0) {
            //     particle.pos = [0, 0, 0];
            // }
            // particle.pos = [0, 0, 0];
            this.state.push(particle);

            let particleNext = new Particle();
            particleNext.pos = [Math.random() * 8.0 - 4.0, Math.random() * 8.0 - 4.0, Math.random() * 8.0 - 4.0];
            // particleNext.pos = [Math.random() * 1.0 - 0.5, Math.random() * 1.0 - 0.5, -1];
            // particle.pos = [0, 0, Math.random() * 4.0 - 2.0];
            // particle.pos = [Math.random() * 1.0 - 0.5, Math.random() * 1.0 - 0.5, 0];
            // if (i == 0) {
            //     particle.pos = [0, 0, 0];
            // }
            // particle.pos = [0, 0, 0];
            this.stateNext.push(particleNext);

            let particleDot = new Particle();
            particleDot.mass = 0;
            this.stateDot.push(particleDot);

            let particleDotM = new Particle();
            particleDotM.mass = particle.mass;
            this.stateMid.push(particleDotM);
        }

        /***
          GRAVITY BOX
        ***/

        let gravity = new Force();
        gravity.type = Force.GRAV_E;
        gravity.gravE = 9.832;
        // gravity.gravE = 2;
        // this.forceSet.push(gravity);
        this.addNewForce('gravity_box', gravity);

        let cube = new Constraint();
        cube.type = Constraint.WALL_CUBE;
        cube.xmin = -2.0;
        cube.xmax = 2.0;
        cube.bounceLoss = 0.985;
        // this.constraintSet.push(cube);
        this.addNewConstraint('gravity_box', cube);

        this.setResetSize(`gravity_box`, ParticleModel.RESET_SIZE_ALL, [
            [0, 10]
        ]);
        this.setResetColor(`gravity_box`, ParticleModel.RESET_COLOR_ALL_RAND, []);
        this.setResetPoint(`gravity_box`, ParticleModel.RESET_POS_SPECIFIED, [
            [0, [0, 0, 0]]
        ]);

        // Set current model
        this.setCurrentModel(this.models[this.models.names[0]]);

        /***
          SPRING SPHERE
        ***/

        for (let i = 1; i < this.particleCount; i++) {
            let spring = new Force();
            spring.type = Force.SPRING;
            spring.k_spring = 5;
            spring.length_spring = 3.5;
            spring.index_p0 = 0;
            spring.index_p1 = i;
            // this.forceSet.push(spring);
            this.addNewForce(`spring_sphere`, spring);

            for (let j = i + 1; j < this.particleCount; j++) {
                let repulse = new Force();
                repulse.type = Force.REPULSIVE;
                repulse.k_spring = 20;
                repulse.length_spring = 0.5;
                repulse.index_p0 = i;
                repulse.index_p1 = j;
                // this.forceSet.push(repulse);
                this.addNewForce(`spring_sphere`, repulse);
            }
        }

        let stay = new Constraint();
        stay.type = Constraint.STAY;
        stay.index_p = 0;
        // this.constraintSet.push(stay);
        this.addNewConstraint(`spring_sphere`, stay);

        let springResetPoints = [];
        springResetPoints.push([0, [0, 0, 0]]);
        this.setResetPoint(`spring_sphere`, ParticleModel.RESET_POS_SPECIFIED, springResetPoints);
        this.setResetColor(`spring_sphere`, ParticleModel.RESET_COLOR_ALL_RAND, []);
        this.setResetSize(`spring_sphere`, ParticleModel.RESET_SIZE_ALL, [
            [0, 10]
        ]);

        /***
          FLAME
        ***/

        let flameUp = new Force();
        flameUp.type = Force.FIRE;
        flameUp.force = 0.8;
        flameUp.forceFix = [0, 0, 1];
        this.addNewForce(`flame`, flameUp);

        let flameWind = new Force();
        flameWind.type = Force.GRAV_P;
        flameWind.force = 0.3;
        flameWind.direction = [1, 0, 0];
        flameWind.forceFix = [1, 0, 0];
        this.addNewForce(`flame`, flameWind);

        for (let i = 0; i < this.particleCount; i++) {
            let flameRand = new Force();
            flameRand.type = Force.FIRE_RAND;
            flameRand.direction = [Math.random() * 0.6 - 0.3, Math.random() * 0.6 - 0.3, 0];
            flameRand.force = 0.3;
            flameRand.index_p0 = i;
            this.addNewForce(`flame`, flameRand);
        }

        let randomWind = new Constraint();
        randomWind.type = Constraint.WIND_RANDOMIZER;
        randomWind.xmin = 0;
        randomWind.xmax = 0.7;
        randomWind.zmax = 0.7;
        randomWind.force = flameWind;
        this.addNewConstraint(`flame`, randomWind);

        let sphere = new Constraint();
        sphere.type = Constraint.SPHERE;
        sphere.xmin = 0;
        sphere.ymin = 0;
        sphere.zmin = 3.3;
        sphere.xmax = 2.5;
        this.addNewConstraint(`flame`, sphere);

        let flameTop = new Constraint();
        flameTop.type = Constraint.FIRE_RECREATOR;
        flameTop.xmin = 3.0;
        flameTop.xmax = 80.0;
        flameTop.zmin = 0.0;
        flameTop.zmax = 1.0;
        this.addNewConstraint(`flame`, flameTop);

        this.setResetPoint(`flame`, ParticleModel.RESET_POS_ALL, [
            [0, [0, 0, 0]]
        ]);
        this.setResetColor(`flame`, ParticleModel.RESET_COLOR_ALL, [
            [0, [1.0, 0.2, 0.0, 1.0]]
        ]);

        /***
          TORNADO
        ***/

        // this.addNewForce(`tornado`, gravity);

        for (let i = 0; i < this.particleCount; i++) {
            let tornadoUp = new Force();
            tornadoUp.type = Force.GRAV_P_SELECT;
            tornadoUp.direction = [0, 0, 1];
            tornadoUp.forceFix = [0, 0, 1];
            tornadoUp.force = 3;
            tornadoUp.index_p0 = i;
            this.addNewForce(`tornado`, tornadoUp);

            // let upDamping = new Constraint();
            // upDamping.type = Constraint.TORNADO_DAMPING;
            // upDamping.xmax = 16;
            // upDamping.xmin = 9.832;
            // upDamping.zmax = 4;
            // upDamping.force = tornadoUp;
            // this.addNewConstraint(`tornado`, upDamping);

            let centripetal = new Force();
            let angle = 2 * Math.PI * Math.random();
            centripetal.type = Force.CENTRIPETAL;
            centripetal.force = 0.5;
            centripetal.forceFix = [Math.cos(angle), Math.sin(angle), 0];
            centripetal.index_p0 = i;
            this.addNewForce(`tornado`, centripetal);

            let upDamping = new Constraint();
            upDamping.type = Constraint.TORNADO_DAMPING;
            upDamping.xmax = 2;
            upDamping.xmin = 3;
            upDamping.ymax = 0.5;
            upDamping.zmax = 2;
            upDamping.zmin = -2;
            upDamping.force = centripetal;
            upDamping.force2 = tornadoUp;
            upDamping.index_p = i;
            this.addNewConstraint(`tornado`, upDamping);
        }

        let round = new Force();
        round.type = Force.ROUND;
        round.force = 8;
        this.addNewForce(`tornado`, round);
        this.setResetSize(`tornado`, ParticleModel.RESET_SIZE_ALL, [
            [0, 10]
        ]);
        this.setResetColor(`tornado`, ParticleModel.RESET_COLOR_ALL_RAND, []);

        /***
          BOIDS
        ***/

        for (let i = 1; i < this.particleCount; i++) {
            let boids = new Force();

            boids.type = Force.BOIDS;

            boids.force = 4;

            boids.index_p0 = i;

            let neighbours = [];
            for (let j = 0; j < 400; j++) {
                let index = Math.floor(Math.random() * (this.particleCount - 1)) + 1;
                // neighbours.push(this.getParticleIndex(i + j));
                neighbours.push(index);
            }

            for (let j = 0; j < neighbours.length; j++) {
                boids.neighbours.push(neighbours[j]);
            }

            this.addNewForce(`boids`, boids);
        }

        // this.addNewConstraint(`boids`, cube);

        let leader = new Constraint();
        leader.type = Constraint.BOIDS_LEADER;
        leader.index_p = 0;
        this.addNewConstraint(`boids`, leader);
        this.setResetSize(`boids`, ParticleModel.RESET_SIZE_ALL, [
            [0, 10]
        ]);
        this.setResetColor(`boids`, ParticleModel.RESET_COLOR_ALL_RAND, []);
    }

    updateState(elapsedTime) {
        if (!this.implicit) this.calcNextState(elapsedTime);
        this.calcForces();
        this.calcDot(elapsedTime);
        if (this.implicit) this.calcNextState(elapsedTime);
        this.calcConstraint(elapsedTime);
        this.swapState();
    }

    calcForces() {
        // reset particle forces
        for (let i = 0; i < this.particleCount; i++) {
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];
            pNext.ftot[0] = 0;
            pNext.ftot[1] = 0;
            pNext.ftot[2] = 0;

            pMid.ftot[0] = 0;
            pMid.ftot[1] = 0;
            pMid.ftot[2] = 0;

            // pMid.pos[0] = pNext.pos[0] + pDot.pos[0] * elapsedTime * 0.5;
            // pMid.pos[1] = pNext.pos[1] + pDot.pos[1] * elapsedTime * 0.5;
            // pMid.pos[2] = pNext.pos[2] + pDot.pos[2] * elapsedTime * 0.5;
        }

        // apply all forces to particles
        for (let i = 0; i < this.currentModel.forceSet.length; i++) {
            this.applyForce(this.currentModel.forceSet[i], this.stateNext);
            // this.applyForce(this.forceSet[i], this.stateMid);
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
                // p0 = particles[force.index_p0];
                // p0.ftot[0] += force.force * force.forceFix[0] * force.direction[0];
                for (let i = 0; i < particles.length; i++) {
                    p0 = particles[i];
                    for (let j = 0; j < 3; j++) {
                        p0.ftot[j] += force.force * force.forceFix[j] * force.direction[j];
                    }
                }
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
                    // console.log(`anglez: ${anglez}`);
                    p0.ftot[2] -= f * Math.sin(anglez) * zSign;
                    p1.ftot[2] += f * Math.sin(anglez) * zSign;

                    let fxy = f * Math.cos(anglez);
                    // console.log(`fz: ${f * Math.sin(anglez)} fxy: ${fxy}`);

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
                    p0.ftot[2] -= f * Math.sin(anglez) * zSign;
                    p1.ftot[2] += f * Math.sin(anglez) * zSign;

                    let fxy = f * Math.cos(anglez);

                    let angle = Math.atan2(Math.abs(yDist), Math.abs(xDist));
                    p0.ftot[0] -= fxy * Math.cos(angle) * xSign;
                    p1.ftot[0] += fxy * Math.cos(angle) * xSign;
                    p0.ftot[1] -= fxy * Math.sin(angle) * ySign;
                    p1.ftot[1] += fxy * Math.sin(angle) * ySign;
                }
                break;
            case Force.FIRE:
                for (let i = 0; i < particles.length; i++) {
                    particles[i].ftot[2] += force.force;
                }
                break;
            case Force.FIRE_RAND:
                p0 = particles[force.index_p0];
                p0.ftot[0] += force.force * force.direction[0];
                p0.ftot[1] += force.force * force.direction[1];
                break;
            case Force.ROUND:
                for (let i = 0; i < particles.length; i++) {
                    particles[i].ftot[0] += -force.force * particles[i].pos[1];
                    particles[i].ftot[1] += force.force * particles[i].pos[0];
                }
                break;
            case Force.GRAV_P_SELECT:
                {
                    p0 = particles[force.index_p0];
                    for (let j = 0; j < 3; j++) {
                        p0.ftot[j] += force.force * force.forceFix[j] * force.direction[j];
                    }
                }
                break;
            case Force.CENTRIPETAL:
                {
                    p0 = particles[force.index_p0];
                    p0.ftot[0] += force.force * force.forceFix[0];
                    p0.ftot[1] += force.force * force.forceFix[1];
                }
                break;
            case Force.BOIDS:
                {
                    let pCurr = this.state[force.index_p0];

                    let sepVec = [0, 0, 0];
                    let cohSum = [0, 0, 0];
                    let alignVec = [0, 0, 0];
                    let leaderVec = [0, 0, 0];

                    let leader = this.state[0];

                    for (let i = 0; i < force.neighbours.length; i++) {
                        let neighbour = this.state[force.neighbours[i]];

                        for (let j = 0; j < 3; j++) {
                            sepVec[j] += pCurr.pos[j] - neighbour.pos[j];
                            cohSum[j] += neighbour.pos[j];
                            alignVec[j] += pCurr.ftot[j];
                            leaderVec[j] += leader.pos[j] - pCurr.pos[j];
                        }
                    }

                    let cohVec = [0, 0, 0];

                    for (let j = 0; j < 3; j++) {
                        cohSum[j] /= force.neighbours.length;
                        cohVec[j] = cohSum[j] - pCurr.pos[j];
                    }

                    // if (force.index_p0 == 0) {
                    //     console.log(sepVec, cohVec, alignVec);
                    // }

                    sepVec = this.normalize(sepVec);
                    cohVec = this.normalize(cohVec);
                    alignVec = this.normalize(alignVec);
                    leaderVec = this.normalize(leaderVec);

                    let pNext = particles[force.index_p0];
                    for (let j = 0; j < 3; j++) {
                        pNext.ftot[j] += sepVec[j] * force.force * (Math.random() * 0.8 + 0.4);
                        pNext.ftot[j] += cohVec[j] * force.force * (Math.random() * 0.3 + 0.2);
                        pNext.ftot[j] += alignVec[j] * force.force;
                        pNext.ftot[j] += leaderVec[j] * force.force;
                        pNext.ftot[j] += (Math.random() * 0.3 - 0.15) * force.force;
                    }
                }
                break;
        }
    }

    calcDot(elapsedTime) {
        this.currentSolver(elapsedTime);
    }

    eulerSolver(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pCurr = this.state[i];
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];

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

    midPointSolver(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pCurr = this.state[i];
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];

            // acc
            pDot.vel[0] = pNext.ftot[0] * pNext.mass;
            pDot.vel[1] = pNext.ftot[1] * pNext.mass;
            pDot.vel[2] = pNext.ftot[2] * pNext.mass;

            // vel
            pMid.vel[0] = pDot.vel[0] * elapsedTime;
            pMid.vel[1] = pDot.vel[1] * elapsedTime;
            pMid.vel[2] = pDot.vel[2] * elapsedTime;

            pMid.pos[0] = pNext.pos[0] + pMid.vel[0] * elapsedTime * 0.5;
            pMid.pos[1] = pNext.pos[1] + pMid.vel[1] * elapsedTime * 0.5;
            pMid.pos[2] = pNext.pos[2] + pMid.vel[2] * elapsedTime * 0.5;
        }

        for (let i = 0; i < this.currentModel.forceSet.length; i++) {
            this.applyForce(this.currentModel.forceSet[i], this.stateMid);
        }

        for (let i = 0; i < this.particleCount; i++) {
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];
            let pNext = this.stateNext[i];
            // acc
            pDot.vel[0] = pMid.ftot[0] * pNext.mass;
            pDot.vel[1] = pMid.ftot[1] * pNext.mass;
            pDot.vel[2] = pMid.ftot[2] * pNext.mass;

            // vel
            pDot.pos[0] += pDot.vel[0] * elapsedTime;
            pDot.pos[1] += pDot.vel[1] * elapsedTime;
            pDot.pos[2] += pDot.vel[2] * elapsedTime;

            pDot.pos[0] *= this.kDrag;
            pDot.pos[1] *= this.kDrag;
            pDot.pos[2] *= this.kDrag;
        }
    }

    verletSolver(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pCurr = this.state[i];
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];

            // i acc
            pDot.vel[0] = pNext.ftot[0] * pNext.mass;
            pDot.vel[1] = pNext.ftot[1] * pNext.mass;
            pDot.vel[2] = pNext.ftot[2] * pNext.mass;

            // i + 1 vel
            pMid.vel[0] = pDot.vel[0] * elapsedTime;
            pMid.vel[1] = pDot.vel[1] * elapsedTime;
            pMid.vel[2] = pDot.vel[2] * elapsedTime;

            // i + 1 pos
            pMid.pos[0] = pNext.pos[0] + pMid.vel[0] * elapsedTime * 1.5;
            pMid.pos[1] = pNext.pos[1] + pMid.vel[1] * elapsedTime * 1.5;
            pMid.pos[2] = pNext.pos[2] + pMid.vel[2] * elapsedTime * 1.5;
        }

        for (let i = 0; i < this.currentModel.forceSet.length; i++) {
            this.applyForce(this.currentModel.forceSet[i], this.stateMid);
        }

        for (let i = 0; i < this.particleCount; i++) {
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];
            let pNext = this.stateNext[i];
            // i + 1 acc
            pMid.vel[0] = pMid.ftot[0] * pNext.mass;
            pMid.vel[1] = pMid.ftot[1] * pNext.mass;
            pMid.vel[2] = pMid.ftot[2] * pNext.mass;

            // vel
            pDot.pos[0] += (pDot.vel[0] + pMid.vel[0]) * 0.5 * elapsedTime;
            pDot.pos[1] += (pDot.vel[1] + pMid.vel[1]) * 0.5 * elapsedTime;
            pDot.pos[2] += (pDot.vel[2] + pMid.vel[2]) * 0.5 * elapsedTime;

            pDot.pos[0] *= this.kDrag;
            pDot.pos[1] *= this.kDrag;
            pDot.pos[2] *= this.kDrag;
        }
    }

    calcNextState(elapsedTime) {
        for (let i = 0; i < this.particleCount; i++) {
            let pNext = this.stateNext[i];
            let pDot = this.stateDot[i];
            let pMid = this.stateMid[i];

            pNext.pos[0] += pDot.pos[0] * elapsedTime;
            pNext.pos[1] += pDot.pos[1] * elapsedTime;
            pNext.pos[2] += pDot.pos[2] * elapsedTime;
        }
    }

    calcConstraint(elapsedTime) {
        for (let i = 0; i < this.currentModel.constraintSet.length; i++) {
            this.applyConstraint(this.currentModel.constraintSet[i], elapsedTime);
        }
    }

    applyConstraint(constraint, elapsedTime) {
        switch (constraint.type) {
            case Constraint.WALL_CUBE:
                for (let i = 0; i < this.particleCount; i++) {
                    let pNext = this.stateNext[i];
                    let pDot = this.stateDot[i];
                    for (let j = 0; j < 3; j++) {
                        if (pNext.pos[j] <= constraint.xmin && pDot.pos[j] <= 0.0) {
                            pNext.pos[j] = constraint.xmin;
                            pDot.pos[j] = pNext.vel[j] * constraint.bounceLoss;
                            pDot.pos[j] = pDot.pos[j] <= 0.0 ? -pDot.pos[j] : pDot.pos[j];
                        } else if (pNext.pos[j] >= constraint.xmax && pDot.pos[j] >= 0.0) {
                            pNext.pos[j] = constraint.xmax;
                            pDot.pos[j] = pNext.vel[j] * constraint.bounceLoss;
                            pDot.pos[j] = pDot.pos[j] >= 0.0 ? -pDot.pos[j] : pDot.pos[j];
                        }
                    }
                }
                break;
            case Constraint.WALL:
                break;
            case Constraint.STAY:
                {
                    let pNext = this.stateNext[constraint.index_p];
                    let pCurr = this.state[constraint.index_p];
                    for (let j = 0; j < 3; j++) {
                        pNext.pos[j] = pCurr.pos[j];
                    }
                }
                break;
            case Constraint.FIRE_RECREATOR:
                for (let i = 0; i < this.particleCount; i++) {
                    let pNext = this.stateNext[i];
                    let pCurr = this.state[i];

                    // if (i == 0) {
                    //     console.log(`${pNext.life} ${pCurr.life}`);
                    // }
                    if (pCurr.life > pNext.life) {
                        pNext.pos[2] = constraint.zmin;
                        pNext.pos[0] = 0;
                        pNext.pos[1] = 0;
                        pCurr.size = constraint.xmax;
                        pCurr.life = 0;
                        pNext.life = (Math.random() * 0.5 + 0.5) * constraint.xmin;
                        for (let j = 0; j < 3; j++) {
                            pCurr.color[j] = pNext.color[j];
                        }
                        pCurr.color[3] = 0.5;
                    } else {
                        let progress = pCurr.life / pNext.life;
                        progress = progress < 0 ? 0 : progress;
                        pCurr.life += elapsedTime;
                        for (let j = 0; j < 3; j++) {
                            pCurr.color[j] = pNext.color[j] * (1 - progress);
                        }
                        pCurr.color[3] = progress * 0.5 + 0.5;
                        pCurr.size = constraint.xmax * (1 - progress);
                    }
                }
                break;
            case Constraint.WIND_RANDOMIZER:
                constraint.xmin += elapsedTime;
                if (constraint.xmin > constraint.xmax) {
                    constraint.xmax = (0.7 * Math.random() + 0.3) * constraint.zmax;
                    constraint.xmin = 0;
                    constraint.force.force = 1.5 * Math.random();
                    constraint.force.forceFix = [Math.random(), Math.random(), Math.random() * 0.3];
                    constraint.force.direction = [
                        Math.random() > 0.5 ? 1 : -1,
                        Math.random() > 0.5 ? 1 : -1,
                        Math.random() > 0.5 ? 1 : -1
                    ];
                }
                break;
            case Constraint.TORNADO_DAMPING:
                {
                    let pNext = this.stateNext[constraint.index_p];
                    let pDot = this.stateDot[constraint.index_p];
                    // let distXY = Math.sqrt(Math.pow(pCurr.pos[0], 2) + Math.pow(pCurr.pos[1], 2));
                    // let distZ = pCurr.pos[2] + 2;
                    // if (distZ < 0.1) {
                    //     force.force = constraint.xmax * ((2 - distXY) / 2);
                    // } else {
                    //     force.force = constraint.xmax * ((2 - distXY) / 2 + (4 - distZ) / 4);
                    // }
                    // force.force -= constraint.xmin;
                    if (pNext.pos[2] > constraint.zmax) {
                        pNext.pos[0] = 0;
                        pNext.pos[1] = 0;
                        pNext.pos[2] = constraint.zmin;

                        pDot.pos[0] = 0;
                        pDot.pos[1] = 0;
                        pDot.pos[2] = 0;

                        let force = constraint.force;
                        let angle = 2 * Math.PI * Math.random();
                        force.forceFix = [Math.cos(angle), Math.sin(angle), 0];
                        force.force = constraint.ymax + Math.random() * 0.2 - 0.1;
                        constraint.zmax = constraint.xmax + Math.random() - 0.5;

                        let force2 = constraint.force2;
                        force2.force = constraint.xmin + Math.random() - 0.5;
                    }
                }
                break;
            case Constraint.BOIDS_LEADER:
                {
                    let pNext = this.stateNext[constraint.index_p];
                    let pCurr = this.state[constraint.index_p];

                    constraint.xmin += elapsedTime;
                    constraint.xmin = constraint.xmin > 5.0 ? 0 : constraint.xmin;
                    let angle = constraint.xmin / 5.0 * Math.PI * 2;
                    pNext.pos[0] = Math.cos(angle) * 4.0;
                    pNext.pos[1] = Math.sin(angle) * 4.0;
                    pNext.pos[2] = Math.cos(angle) * 2.0;
                }
                break;
            case Constraint.SPHERE:
                {
                    for (let i = 0; i < this.particleCount; i++) {
                        let pNext = this.stateNext[i];
                        let pCurr = this.state[i];

                        // [x,y,z]min = sphere center
                        // xmax = radius
                        let vec = [0, 0, 0];
                        vec[0] = constraint.xmin - pNext.pos[0];
                        vec[1] = constraint.ymin - pNext.pos[1];
                        vec[2] = constraint.zmin - pNext.pos[2];

                        let dist = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
                        let length = Math.sqrt(Math.pow(pNext.vel[0], 2) + Math.pow(pNext.vel[1], 2) + Math.pow(pNext.vel[2], 2));

                        if (dist <= constraint.xmax && vec[2] >= 0) {
                            let cos = vec[0] * pNext.vel[0] + vec[1] * pNext.vel[1] + vec[1] * pNext.vel[1];
                            cos /= dist * length;

                            let cDist = length * cos;
                            let vecNorm = this.normalize(vec);
                            // if (i == 0) console.log(`before: ${pNext.vel}`);
                            // if (i == 0) console.log(`vec before: ${vecNorm}`);
                            for (let j = 0; j < 3; j++) {
                                vecNorm[j] *= cDist;
                                pNext.vel[j] -= vecNorm[j];
                                if (j < 2) pNext.vel[j] *= 15;
                                pNext.pos[j] = pCurr.pos[j] + pNext.vel[j] * elapsedTime;
                            }
                            // if (i == 0) console.log(`vec: ${vecNorm}`);
                            // if (i == 0) console.log(`after:  ${pNext.vel}`);
                        }
                    }
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

    addNewForce(modelName, force) {
        if (this.models[modelName] == null) {
            this.models[modelName] = new ParticleModel();
            this.models.names.push(modelName);
        }

        this.models[modelName].forceSet.push(force);
    }

    addNewConstraint(modelName, constraint) {
        if (this.models[modelName] == null) {
            this.models[modelName] = new ParticleModel();
            this.models.names.push(modelName);
        }

        this.models[modelName].constraintSet.push(constraint);
    }

    setResetPoint(modelName, resetType, resetPoints) {
        if (this.models[modelName] == null) {
            this.models[modelName] = new ParticleModel();
            this.models.names.push(modelName);
        }

        this.models[modelName].resetPosType = resetType;
        this.models[modelName].resetPosList = resetPoints;
    }

    setResetColor(modelName, resetType, resetColors) {
        if (this.models[modelName] == null) {
            this.models[modelName] = new ParticleModel();
            this.models.names.push(modelName);
        }

        this.models[modelName].resetColorType = resetType;
        this.models[modelName].resetColorList = resetColors;
    }

    setResetSize(modelName, resetType, resetSizes) {
        if (this.models[modelName] == null) {
            this.models[modelName] = new ParticleModel();
            this.models.names.push(modelName);
        }

        this.models[modelName].resetSizeType = resetType;
        this.models[modelName].resetSizeList = resetSizes;
    }

    setCurrentModel(model) {
        this.currentModel = model;

        switch (this.currentModel.resetPosType) {
            case ParticleModel.RESET_POS_ALL:
                let resetPos = this.currentModel.resetPosList[0][1];
                for (let i = 0; i < this.particleCount; i++) {
                    let pNext = this.stateNext[i];
                    let pCurr = this.state[i];
                    for (let j = 0; j < 3; j++) {
                        pNext.pos[j] = resetPos[j];
                        pCurr.pos[j] = resetPos[j];
                    }
                }
                break;
            case ParticleModel.RESET_POS_SPECIFIED:
                for (let i = 0; i < this.currentModel.resetPosList.length; i++) {
                    let resetPos = this.currentModel.resetPosList[i][1];
                    let pNext = this.stateNext[this.currentModel.resetPosList[i][0]];
                    let pCurr = this.state[this.currentModel.resetPosList[i][0]];
                    for (let j = 0; j < 3; j++) {
                        pNext.pos[j] = resetPos[j];
                        pCurr.pos[j] = resetPos[j];
                    }
                }
                break;
        }

        switch (this.currentModel.resetColorType) {
            case ParticleModel.RESET_COLOR_ALL:
                let resetColor = this.currentModel.resetColorList[0][1];
                for (let i = 0; i < this.particleCount; i++) {
                    let pCurr = this.state[i];
                    let pNext = this.stateNext[i];
                    for (let j = 0; j < 4; j++) {
                        pCurr.color[j] = resetColor[j];
                        pNext.color[j] = resetColor[j];
                    }
                }
                break;
            case ParticleModel.RESET_COLOR_ALL_RAND:
                for (let i = 0; i < this.particleCount; i++) {
                    let pCurr = this.state[i];
                    let pNext = this.stateNext[i];
                    let color = [1.0, Math.random(), Math.random(), 1.0];
                    for (let j = 0; j < 4; j++) {
                        pCurr.color[j] = color[j];
                        pNext.color[j] = color[j];
                    }
                }
                break;
            case ParticleModel.RESET_POS_SPECIFIED:
                for (let i = 0; i < this.currentModel.resetColorList.length; i++) {
                    let resetColor = this.currentModel.resetColorList[i][1];
                    let pCurr = this.state[this.currentModel.resetColorList[i][0]];
                    let pNext = this.stateNext[this.currentModel.resetColorList[i][0]];
                    for (let j = 0; j < 4; j++) {
                        pCurr.color[j] = resetColor[j];
                        pNext.color[j] = resetColor[j];
                    }
                }
                break;
        }

        switch (this.currentModel.resetSizeType) {
            case ParticleModel.RESET_SIZE_ALL:
                let resetSize = this.currentModel.resetSizeList[0][1];
                for (let i = 0; i < this.particleCount; i++) {
                    let pCurr = this.state[i];
                    pCurr.size = resetSize;
                }
                break;
            case ParticleModel.RESET_SIZE_ALL_RAND:
                for (let i = 0; i < this.particleCount; i++) {
                    let pCurr = this.state[i];
                    let resetSize = this.currentModel.resetSizeList[0][1];
                    pCurr.size = Math.random() * resetSize;
                }
                break;
            case ParticleModel.RESET_SIZE_SPECIFIED:
                for (let i = 0; i < this.currentModel.resetSizeList.length; i++) {
                    let resetSize = this.currentModel.resetSizeList[i][1];
                    let pCurr = this.state[this.currentModel.resetSizeList[i][0]];
                    pCurr.size = resetSize;
                }
                break;
        }
    }

    getParticleIndex(index) {
        if (index < 0) {
            index += this.particleCount;
        } else if (index >= this.particleCount) {
            index -= this.particleCount;
        }

        return index;
    }

    normalize(vec) {
        let k = Math.pow(vec[0] + 0.00001, 2) + Math.pow(vec[1] + 0.00001, 2) +
            Math.pow(vec[2] + 0.00001, 2);
        k = Math.sqrt(k);
        let res = [0, 0, 0];
        res[0] = vec[0] / k;
        res[1] = vec[1] / k;
        res[2] = vec[2] / k;
        return res;
    }

    changeModel(index) {
        this.setCurrentModel(this.models[this.models.names[index]]);
    }

    getDistance(p0, p1) {
        let sq_x = Math.pow(p0[0], 2) + Math.pow(p1[0], 2);
        let sq_y = Math.pow(p0[1], 2) + Math.pow(p1[1], 2);
        let sq_z = Math.pow(p0[2], 2) + Math.pow(p1[2], 2);
        return Math.sqrt(sq_x + sq_y + sq_z);
    }

    switchImplicit() {
        this.implicit = !this.implicit;
    }

    switchSolver(index) {
        this.currentSolver = this.solvers[index];
    }
}
