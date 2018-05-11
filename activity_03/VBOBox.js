// TODO Make a configurable VBOBox

class VBOBox {
    constructor(gl) {
        this.gl = gl;

        this.floatsPerVertex = 9;
        this.camera = new Camara(new Vector3([-4, 16, 5]), new Vector3([-16, -4, 0]), new Vector3([4, -16, -5]));
        this.modelViewMatrix = new Matrix4();
        this.projMatrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.headNormalMatrix = new Matrix4();

        /***
          New Idea: make draw functions reusable.

          No more drawXXX() functions anymore inside VBOBox!
          We manage them outside the class.

          Also, though I'm now using the same shader right now. It is easy to
          switch the VBOBox using different shaders with constraints on
          glsl variables initialization.

          Eventually, I can draw different VBOs using just one VBOBox class!
        ***/

        this.initShapes();
        this.initModelBuilder();
    }

    build(vShader, fShader) {
        // We wait for users call this function manually.
        // Users should have initialized all shapes, models and draw methods
        // already before calling this method.
        this.buildShapes();
        this.initGL(vShader, fShader);
        this.initVertices();
        this.initMatrices();
        // Keep lights and materials initialization. Though no use right now.
        // I'm building this system based on the last version of project of 351-1
        this.initLights();
        this.initMaterials();

        this.lightControl = [0, 0];
    }

    /////////////// Shape System
    initShapes() {
        this.shapes = {};
    }

    addShape(name, shape, material, drawByElement = false) {
        if (this.shapes[name] != null) {
            return -1;
        }
        this.shapes[name] = {};
        this.shapes[name].shape = shape;
        this.shapes[name].material = material;
        this.shapes[name].drawByElement = drawByElement;
        return 0;
    }

    buildShapes() {
        this.materials = {};

        let vertSize = 0;
        let indicesSize = 0;
        for (let shapeName in this.shapes) {
            if (this.shapes.hasOwnProperty(shapeName)) {
                vertSize += this.shapes[shapeName].shape.verts.length;
                if (this.shapes[shapeName].drawByElement) {
                    indicesSize += this.shapes[shapeName].shape.indices.length;
                }
            }
        }
        this.vertices = new Float32Array(vertSize);
        this.indices = new Uint16Array(indicesSize);

        this.startPoints = {};
        this.vertLengths = {};

        let i = 0;

        for (let shapeName in this.shapes) {
            if (this.shapes.hasOwnProperty(shapeName)) {
                this.startPoints[shapeName] = {};
                this.startPoints[shapeName].verts = i / this.floatsPerVertex;
                let shape = this.shapes[shapeName].shape;
                this.vertLengths[shapeName] = shape.verts.length / this.floatsPerVertex;
                this.materials[shapeName] = this.shapes[shapeName].material;
                for (let j = 0; j < shape.verts.length; i++, j++) {
                    this.vertices[i] = shape.verts[j];
                }
            }
        }

        this.indexLengths = {};

        i = 0;

        for (let shapeName in this.shapes) {
            if (this.shapes.hasOwnProperty(shapeName)) {
                if (!this.shapes[shapeName].drawByElement) continue;
                this.startPoints[shapeName].indices = i;
                let shape = this.shapes[shapeName].shape;
                this.indexLengths[shapeName] = shape.indices.length;
                let startPoint = this.startPoints[shapeName].verts;
                for (let j = 0; j < shape.indices.length; i++, j++) {
                    this.indices[i] = shape.indices[j] + startPoint;
                }
            }
        }
    }

    /////////////// Shape System End


    /////////////// ModelBuilder System
    initModelBuilder() {
        this.modelBuilders = {};
    }

    addModelBuilder(name, func) {
        if (this.modelBuilders[name] != null) {
            return -1;
        }
        this.modelBuilders[name] = func;
        return 0;
    }

    drawModel(name, translation, rotatation, scale, elapsedTime) {
        // This is the part of the "draw()" function!!
        this.modelViewMatrix = popMatrix();
        pushMatrix(this.modelViewMatrix);

        // We first apply transforms to the model
        this.modelViewMatrix.translate(
            translation[0], translation[1], translation[2]);
        this.modelViewMatrix.rotate(rotatation[0], 1, 0, 0);
        this.modelViewMatrix.rotate(rotatation[1], 0, 1, 0);
        this.modelViewMatrix.rotate(rotatation[2], 0, 0, 1);
        this.modelViewMatrix.scale(scale[0], scale[1], scale[2]);

        // Then find the model's draw() and draw it.
        let drawFunc = this.modelBuilders[name];
        if (drawFunc != null)
            drawFunc(this, elapsedTime);
    }
    /////////////// ModelBuilder System End

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

    update(gl, elapsedTime, projMatrix, onUpdate) {
        this.gl = gl;

        this.rebindVertices();

        this.projMatrix = projMatrix;
        this.gl.uniformMatrix4fv(this.glProjMatrix, false, projMatrix.elements);

        // TODO Move camera out of VBO Box
        //      We only need ONE camera
        this.camera.calculateQuaternions(elapsedTime);
        this.modelViewMatrix.set(this.camera.quatMatrix);

        // We don't need those things
        // this.calcLight(elapsedTime);

        pushMatrix(this.modelViewMatrix);

        // Draw Callback. See inside Act03.js's draw() to see what's going on.
        onUpdate(this);
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
