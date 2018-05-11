class VBOBox {
    constructor(gl, vShader, fShader) {
        this.gl = gl;

        this.floatsPerVertex = 9;
        this.yFov = 35;
        // rightVec(x, y, 0) = lookVec(y, -x, 0)
        this.camera = new Camara(new Vector3([-4, 16, 5]), new Vector3([-16, -4, 0]), new Vector3([4, -16, -5]));
        this.modelViewMatrix = new Matrix4();
        this.projMatrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.headNormalMatrix = new Matrix4();

        this.initParticle();
        this.initShapes();
        this.initGL(vShader, fShader);
        this.initVertices();
        this.initMatrices();
        this.initLights();
        this.initMaterials();

        // ANIMATION
        this.isAnimPaused = false;
        this.pauseCorrection = 1;

        this.trainAnimTime = 8;
        this.trainCurrentTime = 0;
        this.trainAngle = 0;

        this.barrierAnimTime = 8;
        this.barrierCurrentTime = 0;
        this.barrierAngles = [0, 0];

        this.sphereAnimTime = 60;
        this.sphereCurrentTime = 0;
        this.sphereAngle = 0;

        this.lightControl = [0, 0];
    }

    initShapes() {
        this.materials = {};

        const ground = ShapeBuilder.makeGroundGrid();
        this.materials.ground = Material(MATL_TURQUOISE);

        const partVerts = ShapeBuilder.makeParticles(this.ballCount);

        let vertSize = ground.verts.length + partVerts.length;
        let indicesSize = ground.indices.length;
        this.vertices = new Float32Array(vertSize);
        this.indices = new Uint16Array(indicesSize);

        this.startPoints = {};
        this.vertLengths = {};

        let i = 0;

        this.startPoints.ground = {};
        this.startPoints.ground.verts = i / this.floatsPerVertex;
        // console.log(`ground starts at ${i} with length ${ground.verts.length}`);
        for (let j = 0; j < ground.verts.length; i++, j++) {
            this.vertices[i] = ground.verts[j];
        }

        this.startPoints.particle = {};
        this.startPoints.particle.verts = i / this.floatsPerVertex;
        this.vertLengths.particle = partVerts.length / this.floatsPerVertex;
        for (let j = 0; j < partVerts.length; i++, j++) {
            this.vertices[i] = partVerts[j];
        }

        this.indexLengths = {};

        i = 0;

        this.startPoints.ground.indices = i;
        this.indexLengths.ground = ground.indices.length;
        // console.log(`ground indices starts at ${i} with length ${this.indexLengths.ground}`);
        for (let j = 0; j < ground.indices.length; i++, j++) {
            this.indices[i] = ground.indices[j] +
                this.startPoints.ground.verts;
        }
    }

    initGL(vShader, fShader) {
        this.program = createProgram(this.gl, vShader, fShader);
        if (!this.program) {
            console.log('Failed to intialize shaders.');
            return;
        }
        this.gl.program = this.program;

        this.vertexBuffer = this.gl.createBuffer();
        if (!this.vertexBuffer) {
            console.log(this.constructor.name +
                '.init() failed to create VBO in GPU. Bye!');
            return;
        }

        this.indexBuffer = this.gl.createBuffer();
        if (!this.indexBuffer) {
            console.log(this.constructor.name +
                '.init() failed to create VBO indices in GPU. Bye!');
        }
    }

    initVertices() {
        // init buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices,
            this.gl.DYNAMIC_DRAW);

        // init vertices
        this.fSize = this.vertices.BYTES_PER_ELEMENT;

        this.glVertexPosition = this.gl.getAttribLocation(this.program, `VertexPosition`);
        this.glVertexColor = this.gl.getAttribLocation(this.program, `VertexColor`);
        this.glVertexNormal = this.gl.getAttribLocation(this.program, `VertexNormal`);

        if (this.glVertexPosition < 0) {
            console.log('Failed to get the storage location of VertexPosition');
            return;
        }
        if (this.glVertexColor < 0) {
            console.log('Failed to get the storage location of VertexColor');
            return;
        }
        if (this.glVertexNormal < 0) {
            console.log('Failed to get the storage location of VertexNormal');
            return;
        }

        this.gl.vertexAttribPointer(
            this.glVertexPosition, 3, this.gl.FLOAT, false, this.fSize * 9, 0);
        this.gl.vertexAttribPointer(
            this.glVertexColor, 3, this.gl.FLOAT, false, this.fSize * 9, this.fSize * 3);
        this.gl.vertexAttribPointer(
            this.glVertexNormal, 3, this.gl.FLOAT, false, this.fSize * 9, this.fSize * 6);

        this.gl.enableVertexAttribArray(this.glVertexNormal);
        this.gl.enableVertexAttribArray(this.glVertexColor);
        this.gl.enableVertexAttribArray(this.glVertexPosition);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices,
            this.gl.DYNAMIC_DRAW);
    }

    rebindVertices() {
        this.gl.useProgram(this.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        this.glVertexPosition = this.gl.getAttribLocation(this.program, `VertexPosition`);
        this.glVertexColor = this.gl.getAttribLocation(this.program, `VertexColor`);
        this.glVertexNormal = this.gl.getAttribLocation(this.program, `VertexNormal`);

        this.gl.vertexAttribPointer(
            this.glVertexPosition, 3, this.gl.FLOAT, false, this.fSize * 9, 0);
        this.gl.vertexAttribPointer(
            this.glVertexColor, 3, this.gl.FLOAT, false, this.fSize * 9, this.fSize * 3);
        this.gl.vertexAttribPointer(
            this.glVertexNormal, 3, this.gl.FLOAT, false, this.fSize * 9, this.fSize * 6);

        this.gl.enableVertexAttribArray(this.glVertexNormal);
        this.gl.enableVertexAttribArray(this.glVertexColor);
        this.gl.enableVertexAttribArray(this.glVertexPosition);
    }

    initMatrices() {
        this.glModelViewMatrix = this.gl.getUniformLocation(this.program, `ModelViewMatrix`);
        if (!this.glModelViewMatrix) {
            console.log('Failed to get the storage location of ModelViewMatrix');
            return;
        }

        this.glProjMatrix = this.gl.getUniformLocation(this.program, `ProjMatrix`);
        if (!this.glProjMatrix) {
            console.log('Failed to get the storage location of ProjMatrix');
            return;
        }

        this.glNormalMatrix = this.gl.getUniformLocation(this.program, 'NormalMatrix');
        if (!this.glNormalMatrix) {
            console.log('Failed to get GPU storage location for NormalMatrix');
            return;
        }

        this.glHeadNormalMatrix = this.gl.getUniformLocation(this.program, 'HeadNormalMatrix');
        if (!this.glHeadNormalMatrix) {
            console.log('Failed to get GPU storage location for NormalMatrix');
            return;
        }
    }

    initLights() {
        this.gl.useProgram(this.program);
        this.glPos0 = this.gl.getUniformLocation(this.program, 'GauroudLight[0].Position');
        this.glAmbient0 = this.gl.getUniformLocation(this.program, 'GauroudLight[0].La');
        this.glDiffuse0 = this.gl.getUniformLocation(this.program, 'GauroudLight[0].Ld');
        this.glSpec0 = this.gl.getUniformLocation(this.program, 'GauroudLight[0].Ls');
        this.glSwitch0 = this.gl.getUniformLocation(this.program, 'GauroudLight[0].Switch');

        this.glPos1 = this.gl.getUniformLocation(this.program, 'GauroudLight[1].Position');
        this.glAmbient1 = this.gl.getUniformLocation(this.program, 'GauroudLight[1].La');
        this.glDiffuse1 = this.gl.getUniformLocation(this.program, 'GauroudLight[1].Ld');
        this.glSpec1 = this.gl.getUniformLocation(this.program, 'GauroudLight[1].Ls');
        this.glSwitch1 = this.gl.getUniformLocation(this.program, 'GauroudLight[1].Switch');

        this.glPos2 = this.gl.getUniformLocation(this.program, 'GauroudLight[2].Position');
        this.glAmbient2 = this.gl.getUniformLocation(this.program, 'GauroudLight[2].La');
        this.glDiffuse2 = this.gl.getUniformLocation(this.program, 'GauroudLight[2].Ld');
        this.glSpec2 = this.gl.getUniformLocation(this.program, 'GauroudLight[2].Ls');
        this.glSwitch2 = this.gl.getUniformLocation(this.program, 'GauroudLight[2].Switch');

        this.glPPos0 = this.gl.getUniformLocation(this.program, 'PhongLight[0].Position');
        this.glPAmbient0 = this.gl.getUniformLocation(this.program, 'PhongLight[0].La');
        this.glPDiffuse0 = this.gl.getUniformLocation(this.program, 'PhongLight[0].Ld');
        this.glPSpec0 = this.gl.getUniformLocation(this.program, 'PhongLight[0].Ls');
        this.glPSwitch0 = this.gl.getUniformLocation(this.program, 'PhongLight[0].Switch');

        this.glPPos1 = this.gl.getUniformLocation(this.program, 'PhongLight[1].Position');
        this.glPAmbient1 = this.gl.getUniformLocation(this.program, 'PhongLight[1].La');
        this.glPDiffuse1 = this.gl.getUniformLocation(this.program, 'PhongLight[1].Ld');
        this.glPSpec1 = this.gl.getUniformLocation(this.program, 'PhongLight[1].Ls');
        this.glPSwitch1 = this.gl.getUniformLocation(this.program, 'PhongLight[1].Switch');

        this.glPPos2 = this.gl.getUniformLocation(this.program, 'PhongLight[2].Position');
        this.glPAmbient2 = this.gl.getUniformLocation(this.program, 'PhongLight[2].La');
        this.glPDiffuse2 = this.gl.getUniformLocation(this.program, 'PhongLight[2].Ld');
        this.glPSpec2 = this.gl.getUniformLocation(this.program, 'PhongLight[2].Ls');
        this.glPSwitch2 = this.gl.getUniformLocation(this.program, 'PhongLight[2].Switch');


        this.glAttenuationMode = this.gl.getUniformLocation(this.program, 'AttenuationMode');
        this.glDistortSwitch = this.gl.getUniformLocation(this.program, 'DistortSwitch');

        this.headLight = {};
        this.worldLight = {};
        this.worldLight2 = {};

        this.headLight.pos = [0.0, 0.0, 0.0];
        this.headLight.ambient = [0.4, 0.4, 0.4];
        this.headLight.diffuse = [0.7, 0.7, 0.7];
        this.headLight.specular = [1.0, 1.0, 1.0];
        this.headLight.switch = 0;

        this.worldLight.pos = [6.0, 12.0, 3.0];
        this.worldLight.ambient = [2.4, 2.4, 2.4];
        this.worldLight.diffuse = [1.5, 1.5, 1.5];
        this.worldLight.specular = [0.2, 0.2, 0.2];
        this.worldLight.switch = 1;

        this.worldLight2.pos = [0, 12.0, 4.0];
        this.worldLight2.ambient = [0.4, 0.4, 0.4];
        this.worldLight2.diffuse = [1.0, 1.0, 1.0];
        this.worldLight2.specular = [1.0, 1.0, 1.0];
        this.worldLight2.switch = 0;

        this.attenuationMode = 0;
        this.distortSwitch = 0;
    }

    applyLights() {
        this.gl.uniform3fv(this.glPos0, this.worldLight.pos);
        this.gl.uniform3fv(this.glAmbient0, this.worldLight.ambient);
        this.gl.uniform3fv(this.glDiffuse0, this.worldLight.diffuse);
        this.gl.uniform3fv(this.glSpec0, this.worldLight.specular);
        this.gl.uniform1i(this.glSwitch0, this.worldLight.switch);

        this.gl.uniform3fv(this.glPPos0, this.worldLight.pos);
        this.gl.uniform3fv(this.glPAmbient0, this.worldLight.ambient);
        this.gl.uniform3fv(this.glPDiffuse0, this.worldLight.diffuse);
        this.gl.uniform3fv(this.glPSpec0, this.worldLight.specular);
        this.gl.uniform1i(this.glPSwitch0, this.worldLight.switch);

        this.gl.uniform3fv(this.glPos1, this.headLight.pos);
        this.gl.uniform3fv(this.glAmbient1, this.headLight.ambient);
        this.gl.uniform3fv(this.glDiffuse1, this.headLight.diffuse);
        this.gl.uniform3fv(this.glSpec1, this.headLight.specular);
        this.gl.uniform1i(this.glSwitch1, this.headLight.switch);

        this.gl.uniform3fv(this.glPPos1, this.headLight.pos);
        this.gl.uniform3fv(this.glPAmbient1, this.headLight.ambient);
        this.gl.uniform3fv(this.glPDiffuse1, this.headLight.diffuse);
        this.gl.uniform3fv(this.glPSpec1, this.headLight.specular);
        this.gl.uniform1i(this.glPSwitch1, this.headLight.switch);

        this.gl.uniform3fv(this.glPos2, this.worldLight2.pos);
        this.gl.uniform3fv(this.glAmbient2, this.worldLight2.ambient);
        this.gl.uniform3fv(this.glDiffuse2, this.worldLight2.diffuse);
        this.gl.uniform3fv(this.glSpec2, this.worldLight2.specular);
        this.gl.uniform1i(this.glSwitch2, this.worldLight2.switch);

        this.gl.uniform3fv(this.glPPos2, this.worldLight2.pos);
        this.gl.uniform3fv(this.glPAmbient2, this.worldLight2.ambient);
        this.gl.uniform3fv(this.glPDiffuse2, this.worldLight2.diffuse);
        this.gl.uniform3fv(this.glPSpec2, this.worldLight2.specular);
        this.gl.uniform1i(this.glPSwitch2, this.worldLight2.switch);

        this.gl.uniform1i(this.glAttenuationMode, this.attenuationMode);
        this.gl.uniform1i(this.glDistortSwitch, this.distortSwitch);
    }

    initMaterials() {
        this.gl.useProgram(this.program);
        this.glMaterialKe = this.gl.getUniformLocation(this.program, 'GauroudMaterial.Ke');
        this.glMaterialKa = this.gl.getUniformLocation(this.program, 'GauroudMaterial.Ka');
        this.glMaterialKd = this.gl.getUniformLocation(this.program, 'GauroudMaterial.Kd');
        this.glMaterialKs = this.gl.getUniformLocation(this.program, 'GauroudMaterial.Ks');
        this.glMaterialS = this.gl.getUniformLocation(this.program, 'GauroudMaterial.Shininess');

        this.glPMaterialKe = this.gl.getUniformLocation(this.program, 'PhongMaterial.Ke');
        this.glPMaterialKa = this.gl.getUniformLocation(this.program, 'PhongMaterial.Ka');
        this.glPMaterialKd = this.gl.getUniformLocation(this.program, 'PhongMaterial.Kd');
        this.glPMaterialKs = this.gl.getUniformLocation(this.program, 'PhongMaterial.Ks');
        this.glPMaterialS = this.gl.getUniformLocation(this.program, 'PhongMaterial.Shininess');

        // init mode here
        this.glLightingMode = this.gl.getUniformLocation(this.program, 'Lighting');
        this.glShdingMode = this.gl.getUniformLocation(this.program, 'Shading');
        this.gl.uniform1i(this.glLightingMode, 2);
        this.gl.uniform1i(this.glShdingMode, 2);
    }

    applyMatrices(material) {
        this.normalMatrix.setInverseOf(this.modelViewMatrix);
        this.normalMatrix.transpose();
        this.headNormalMatrix.setInverseOf(
            this.concat(this.projMatrix, this.modelViewMatrix));
        this.headNormalMatrix.transpose();

        this.gl.uniformMatrix4fv(
            this.glModelViewMatrix, false, this.modelViewMatrix.elements);
        this.gl.uniformMatrix4fv(
            this.glNormalMatrix, false, this.normalMatrix.elements);
        this.gl.uniformMatrix4fv(
            this.glHeadNormalMatrix, false, this.headNormalMatrix.elements);

        this.gl.uniform4fv(this.glMaterialKe, material.emissive);
        this.gl.uniform4fv(this.glMaterialKa, material.ambient);
        this.gl.uniform4fv(this.glMaterialKd, material.diffuse);
        this.gl.uniform4fv(this.glMaterialKs, material.specular);
        this.gl.uniform1f(this.glMaterialS, material.shiny);

        this.gl.uniform4fv(this.glPMaterialKe, material.emissive);
        this.gl.uniform4fv(this.glPMaterialKa, material.ambient);
        this.gl.uniform4fv(this.glPMaterialKd, material.diffuse);
        this.gl.uniform4fv(this.glPMaterialKs, material.specular);
        this.gl.uniform1f(this.glPMaterialS, material.shiny);

        this.applyLights();
    }

    update(gl, elapsedTime) {
        this.gl = gl;
        this.camera.calculateQuaternions(elapsedTime);
        this.calcLight(elapsedTime);
        this.calcAnim(elapsedTime);

        this.rebindVertices();
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.vAspect = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
        this.projMatrix.setPerspective(
            this.yFov,
            this.vAspect,
            1,
            100
        );

        this.gl.uniformMatrix4fv(this.glProjMatrix, false, this.projMatrix.elements);

        this.modelViewMatrix.set(this.camera.quatMatrix);

        pushMatrix(this.modelViewMatrix);

        this.modelViewMatrix.translate(0, 0, -0.04);
        this.drawGround();

        this.modelViewMatrix = popMatrix();
        pushMatrix(this.modelViewMatrix);
        this.modelViewMatrix.translate(0, 0, 2.0);
        this.drawParticles();
    }

    drawGround() {
        this.modelViewMatrix.scale(0.1, 0.1, 0.1);

        this.applyMatrices(this.materials.ground);

        this.gl.drawElements(
            this.gl.LINES, this.indexLengths.ground,
            this.gl.UNSIGNED_SHORT, this.startPoints.ground.indices * 2);
    }

    drawTrain(x, y, angleOffset) {
        this.modelViewMatrix.rotate(this.trainAngle - angleOffset, 0, 0, 1);
        // this.modelViewMatrix.rotate(angleOffset, 0, 0, 1);
        this.gl.drawElements(this.gl.POINTS, 0, this.gl.UNSIGNED_SHORT, 0);

        this.modelViewMatrix.translate(x, y, 0.2);
        this.modelViewMatrix.scale(0.6, 0.2, 0.2);

        this.applyMatrices(this.materials.cubes[1]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[1],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[1] * 2);

        pushMatrix(this.modelViewMatrix);

        this.modelViewMatrix.scale(1 / 0.6, 1 / 0.2, 1 / 0.2);
        this.modelViewMatrix.translate(0.42, 0.12, -0.04);
        this.modelViewMatrix.scale(0.1, 0.1, 0.16);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix.scale(1 / 0.1, 1 / 0.1, 1 / 0.16);
        this.modelViewMatrix.translate(-0.28, 0.0, 0.06);
        this.modelViewMatrix.scale(0.1, 0.1, 0.1);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix.scale(1 / 0.1, 1 / 0.1, 1 / 0.1);
        this.modelViewMatrix.translate(-0.28, 0.0, 0.0);
        this.modelViewMatrix.scale(0.1, 0.1, 0.1);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix.scale(1 / 0.1, 1 / 0.1, 1 / 0.1);
        this.modelViewMatrix.translate(-0.28, 0.0, -0.06);
        this.modelViewMatrix.scale(0.1, 0.1, 0.16);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix = popMatrix();

        this.modelViewMatrix.scale(1 / 0.6, 1 / 0.2, 1 / 0.2);
        this.modelViewMatrix.translate(0.42, -0.12, -0.04);
        this.modelViewMatrix.scale(0.1, 0.1, 0.16);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix.scale(1 / 0.1, 1 / 0.1, 1 / 0.16);
        this.modelViewMatrix.translate(-0.28, 0.0, 0.06);
        this.modelViewMatrix.scale(0.1, 0.1, 0.1);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix.scale(1 / 0.1, 1 / 0.1, 1 / 0.1);
        this.modelViewMatrix.translate(-0.28, 0.0, 0.0);
        this.modelViewMatrix.scale(0.1, 0.1, 0.1);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);

        this.modelViewMatrix.scale(1 / 0.1, 1 / 0.1, 1 / 0.1);
        this.modelViewMatrix.translate(-0.28, 0.0, -0.06);
        this.modelViewMatrix.scale(0.1, 0.1, 0.16);

        this.applyMatrices(this.materials.cubes[3]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[3],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[3] * 2);
    }

    drawTree() {
        this.modelViewMatrix.translate(0.0, 0.0, 0.1);
        this.modelViewMatrix.scale(0.1, 0.1, 0.1); // 1 unit : (10, 10, 10)

        this.normalMatrix.setInverseOf(this.modelViewMatrix);
        this.normalMatrix.transpose();

        this.applyMatrices(this.materials.cubes[1]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[2],
            this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[2] * 2);

        this.modelViewMatrix.scale(10, 10, 10);
        this.modelViewMatrix.translate(0.0, 0.0, 0.18);
        this.modelViewMatrix.scale(0.4, 0.4, 0.125); // 1 unit : (2.5, 2.5, 8)

        this.normalMatrix.setInverseOf(this.modelViewMatrix);
        this.normalMatrix.transpose();

        this.applyMatrices(this.materials.spheres[1]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.spheres[1],
            this.gl.UNSIGNED_SHORT, this.startPoints.spheres.indices[1] * 2);

        this.modelViewMatrix.scale(2.5, 2.5, 8);
        this.modelViewMatrix.translate(0.0, 0.0, 0.2);
        this.modelViewMatrix.scale(0.3, 0.3, 0.125); // 1 unit : (1/0.3, 1/0.3, 8)

        this.applyMatrices(this.materials.spheres[1]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.spheres[1],
            this.gl.UNSIGNED_SHORT, this.startPoints.spheres.indices[1] * 2);

        this.modelViewMatrix.scale(1 / 0.3, 1 / 0.3, 8);
        this.modelViewMatrix.translate(0.0, 0.0, 0.2);
        this.modelViewMatrix.scale(0.2, 0.2, 0.125); // 1 unit : (5, 5, 8)

        this.applyMatrices(this.materials.spheres[1]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.spheres[1],
            this.gl.UNSIGNED_SHORT, this.startPoints.spheres.indices[1] * 2);
    }

    drawBarrier(index) {
        this.modelViewMatrix.translate(0.0, 0.0, 0.4);
        this.modelViewMatrix.scale(0.1, 0.1, 0.4); // 1 unit : (10, 10, 2.5)

        this.normalMatrix.setInverseOf(this.modelViewMatrix);
        this.normalMatrix.transpose();

        this.applyMatrices(this.materials.cylinder);

        // this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.cubes[0],
        //     this.gl.UNSIGNED_SHORT, this.startPoints.cubes.indices[0] * 2);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.cylinder.verts, // start at this vertex number, and
            this.vertLengths.cylinder); // draw this many vertices.

        this.modelViewMatrix.scale(10, 10, 2.5);
        this.modelViewMatrix.translate(0.0, 0.0, 0.3);
        this.modelViewMatrix.rotate(90 * this.barrierAngles[index], 0, 1, 0);
        this.modelViewMatrix.translate(-0.25, 0, 0);
        this.modelViewMatrix.scale(0.25, 0.02, 0.02); // 1 unit : (4, 50, 50)

        this.applyMatrices(this.materials.cylinder);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.cylinder.verts, // start at this vertex number, and
            this.vertLengths.cylinder); // draw this many vertices.

        this.modelViewMatrix.scale(4, 50, 50);
        this.modelViewMatrix.translate(-0.25, 0.0, 0.0);
        this.modelViewMatrix.rotate(-45 * this.barrierAngles[index], 0, 1, 0);
        this.modelViewMatrix.translate(-0.25, 0, 0);
        this.modelViewMatrix.scale(0.25, 0.02, 0.02); // 1 unit : (4, 50, 50)

        this.applyMatrices(this.materials.cylinder);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.cylinder.verts, // start at this vertex number, and
            this.vertLengths.cylinder); // draw this many vertices.

        this.modelViewMatrix.scale(4, 50, 50);
        this.modelViewMatrix.translate(-0.25, 0.0, 0.0);
        this.modelViewMatrix.rotate(-45 * this.barrierAngles[index], 0, 1, 0);
        this.modelViewMatrix.translate(-0.25, 0, 0);
        this.modelViewMatrix.scale(0.25, 0.02, 0.02); // 1 unit : (4, 50, 50)

        this.applyMatrices(this.materials.cylinder);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.cylinder.verts, // start at this vertex number, and
            this.vertLengths.cylinder); // draw this many vertices.
    }

    drawParticles() {

        this.applyMatrices(this.materials.ground);

        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.vertices);
        this.gl.drawArrays(this.gl.POINTS, this.startPoints.particle.verts, this.vertLengths.particle);
    }

    drawShpere(index) {
        this.modelViewMatrix.translate(this.posNow[index][0], this.posNow[index][1], this.posNow[index][2]);
        this.modelViewMatrix.scale(0.04, 0.04, 0.04);
        // this.modelViewMatrix.rotate(this.sphereAngle, 0, 0, 1);

        this.applyMatrices(this.materials.spheres[0]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.spheres[0],
            this.gl.UNSIGNED_SHORT, this.startPoints.spheres.indices[0] * 2);
    }

    drawShperes() {
        // this.modelViewMatrix.scale(0.01, 0.01, 0.01);
        this.modelViewMatrix.rotate(this.sphereAngle, 0, 0, 1);

        this.applyMatrices(this.materials.spheres[0]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.spheres[0],
            this.gl.UNSIGNED_SHORT, this.startPoints.spheres.indices[0] * 2);

        this.modelViewMatrix.rotate(this.sphereAngle * 2, 0, 0, 1);
        this.modelViewMatrix.translate(1.5, 0, 0);
        this.modelViewMatrix.rotate(this.sphereAngle * 6, 0, 0, 1);
        this.modelViewMatrix.scale(0.3, 0.3, 0.3);

        this.applyMatrices(this.materials.spheres[2]);

        this.gl.drawElements(this.gl.TRIANGLES, this.indexLengths.spheres[0],
            this.gl.UNSIGNED_SHORT, this.startPoints.spheres.indices[0] * 2);
    }

    drawTorus() {
        this.modelViewMatrix.rotate(this.sphereAngle * 3, 1, 1, 0);

        this.applyMatrices(this.materials.torus);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.torus.verts, // start at this vertex number, and
            this.vertLengths.torus); // draw this many vertices.

        pushMatrix(this.modelViewMatrix);

        this.modelViewMatrix.translate(1.6, 0, 0);
        this.modelViewMatrix.rotate(90, 1, 0, 0);

        this.applyMatrices(this.materials.torus);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.torus.verts, // start at this vertex number, and
            this.vertLengths.torus); // draw this many vertices.

        this.modelViewMatrix = popMatrix();
        pushMatrix(this.modelViewMatrix);

        this.modelViewMatrix.translate(-1.6, 0, 0);
        this.modelViewMatrix.rotate(90, 1, 0, 0);

        this.applyMatrices(this.materials.torus);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.torus.verts, // start at this vertex number, and
            this.vertLengths.torus); // draw this many vertices.

        this.modelViewMatrix = popMatrix();
        pushMatrix(this.modelViewMatrix);

        this.modelViewMatrix.translate(0, 0, 2.5);
        this.modelViewMatrix.rotate((this.sphereAngle - 45) * 5, 0, 1, 1);
        this.modelViewMatrix.scale(0.6, 0.6, 0.6);

        this.applyMatrices(this.materials.torus);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.torus.verts, // start at this vertex number, and
            this.vertLengths.torus); // draw this many vertices.

        this.modelViewMatrix = popMatrix();
        pushMatrix(this.modelViewMatrix);

        this.modelViewMatrix.translate(0, 0, -2.5);
        this.modelViewMatrix.rotate((this.sphereAngle - 135) * 5, 0, 1, 1);
        this.modelViewMatrix.scale(0.6, 0.6, 0.6);

        this.applyMatrices(this.materials.torus);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, // use this drawing primitive, and
            this.startPoints.torus.verts, // start at this vertex number, and
            this.vertLengths.torus); // draw this many vertices.

    }

    calcAnim(elapsedTime) {
        if (this.isAnimPaused) {
            this.pauseCorrection = 0;
        } else {
            this.pauseCorrection = 1;
        }
        this.calcParticles(elapsedTime);
    }

    calcTrainAngle(elapsedTime) {
        this.trainCurrentTime += elapsedTime * this.pauseCorrection;
        this.trainCurrentTime = this.trainCurrentTime >= this.trainAnimTime ?
            this.trainCurrentTime - 8 : this.trainCurrentTime;
        this.trainAngle = this.trainCurrentTime / this.trainAnimTime * 360;
    }

    calcBarrierAngle(elapsedTime) {
        this.barrierCurrentTime += elapsedTime * this.pauseCorrection;
        this.barrierCurrentTime = this.barrierCurrentTime >= this.barrierAnimTime ?
            this.barrierCurrentTime - 8 : this.barrierCurrentTime;
        var temp = Math.abs(this.barrierCurrentTime - 4);
        if (temp >= 2 && temp <= 3) {
            this.barrierAngles[0] = 3 - temp;
        } else if (temp >= 3 && temp <= 4) {
            this.barrierAngles[0] = 0;
        } else {
            this.barrierAngles[0] = 1;
        }
        if (temp <= 2 && temp >= 1) {
            this.barrierAngles[1] = temp - 1;
        } else if (temp <= 1) {
            this.barrierAngles[1] = 0;
        } else {
            this.barrierAngles[1] = 1;
        }
    }

    calcShpereAngle(elapsedTime) {
        this.sphereCurrentTime += elapsedTime * this.pauseCorrection;
        this.sphereCurrentTime = this.sphereCurrentTime >= this.sphereAnimTime ?
            this.sphereCurrentTime - 120 : this.sphereCurrentTime;
        this.sphereAngle = this.sphereCurrentTime / this.sphereAnimTime * 360;
    }

    initParticle() {
        this.ballCount = 1000;

        this.particleSystem = new ParticleSystem();
        this.particleSystem.init(this.ballCount);
    }

    calcParticles(elapsedTime) {
        let startPoint = this.startPoints.particle.verts * this.floatsPerVertex;
        for (let i = 0; i < this.particleSystem.particleCount; i++) {
            let particle = this.particleSystem.state[i];
            for (let j = 0; j < 3; j++) {
                this.vertices[startPoint + i * 9 + j] = particle.pos[j];
            }
        }
        this.particleSystem.updateState(elapsedTime);
    }

    calcLight(elapsedTime) {
        // this.worldLight2.pos = [this.worldLight2.pos[0] - x, this.worldLight2.pos[1] - y, this.worldLight2.pos[2]];
        if (this.lightControl[1] != 0) {
            this.worldLight2.pos[1] += 2 * elapsedTime * this.lightControl[1];
        }

        if (this.lightControl[0] != 0) {
            this.worldLight2.pos[0] += 2 * elapsedTime * this.lightControl[0];
        }
    }

    updateKeyEvents(camera, direction, light) {
        this.camera.cameraControl = camera;
        this.camera.directionControl = direction;
        this.lightControl = light;
    }

    switchWorldLight() {
        this.worldLight.switch = this.worldLight.switch == 1 ? 0 : 1;
    }

    switchHeadLight() {
        this.headLight.switch = this.headLight.switch == 1 ? 0 : 1;
    }

    switchLightShading(mode) {
        switch (mode) {
            case 0:
                this.gl.uniform1i(this.glLightingMode, 1);
                this.gl.uniform1i(this.glShdingMode, 1);
                break;
            case 1:
                this.gl.uniform1i(this.glLightingMode, 2);
                this.gl.uniform1i(this.glShdingMode, 1);
                break;
            case 2:
                this.gl.uniform1i(this.glLightingMode, 1);
                this.gl.uniform1i(this.glShdingMode, 2);
                break;
            case 3:
                this.gl.uniform1i(this.glLightingMode, 2);
                this.gl.uniform1i(this.glShdingMode, 2);
                break;
        }
    }

    updateWorldLight(value, name) {
        if (name == "posX") {
            this.worldLight.pos[0] = value;
        } else if (name == "posY") {
            this.worldLight.pos[1] = value;
        } else if (name == "posZ") {
            this.worldLight.pos[2] = value;
        } else if (name == "aR") {
            this.worldLight.ambient[0] = value;
        } else if (name == "aG") {
            this.worldLight.ambient[1] = value;
        } else if (name == "aB") {
            this.worldLight.ambient[2] = value;
        } else if (name == "dR") {
            this.worldLight.diffuse[0] = value;
        } else if (name == "dG") {
            this.worldLight.diffuse[1] = value;
        } else if (name == "dB") {
            this.worldLight.diffuse[2] = value;
        } else if (name == "sR") {
            this.worldLight.specular[0] = value;
        } else if (name == "sG") {
            this.worldLight.specular[1] = value;
        } else if (name == "sB") {
            this.worldLight.specular[2] = value;
        }
    }

    updateAttenuation(value) {
        this.attenuationMode = value;
    }

    switchDistortion() {
        this.distortSwitch = this.distortSwitch == 0 ? 1 : 0;
    }

    flingBall() {
        this.particleSystem.addForce();
    }

    concat(matA, matB) {
        var newMat = new Matrix4(matA);
        return newMat.concat(matB);
    }
}
