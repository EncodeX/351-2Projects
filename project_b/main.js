// import * as glMatrix from "/lib/gl-matrix.js";
import ShapeBuilder from "/shape_builder.js";
import VBOBox from "/vbo_box.js";
import * as glMatrix from '/lib/gl-matrix.js';
import Scene from '/ray_trace/scene.js';
import Image from '/ray_trace/image.js';

export default class Main {
    constructor() {
        this.prevTime = Date.now();
        this.currentTime = Date.now();
        this.elapsedTime = 0;

        this.directionControl = [0, 0, 0];
        this.cameraControl = [0, 0, 0];
        this.lightControl = [0, 0];

        this.previewVShader =
            `uniform mat4 ProjMatrix;
            uniform mat4 ModelViewMatrix;
            uniform mat4 NormalMatrix;

            varying vec4 FrontColor;
            varying vec3 NormalInterp;
            varying vec3 VertPos;

            attribute vec3 VertexPosition;
            attribute vec4 VertexColor;
            attribute vec3 VertexNormal;

            void main() {
              FrontColor = VertexColor;

              gl_Position = ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0);
              vec4 vertPos4 = ModelViewMatrix * vec4(VertexPosition, 1.0);
              VertPos = vec3(vertPos4) / vertPos4.w;
              NormalInterp = vec3(NormalMatrix * vec4(VertexNormal, 0.0));
            }`;
        this.previewFShader =
            `#ifdef GL_ES
            precision mediump float;
            #endif

            struct LightInfo {
              vec3 Position;
              vec3 La;
              vec3 Ld;
              vec3 Ls;
              int Switch;
            };

            struct MaterialInfo {
              vec4 Ke;
              vec4 Ka;
              vec4 Kd;
              vec4 Ks;
              float Shininess;
            };

            varying vec4 FrontColor;
            varying vec3 NormalInterp;
            varying vec3 VertPos;

            uniform LightInfo Light[3];
            uniform MaterialInfo Material;

            void main() {
              // first light
              vec3 normal = normalize(NormalInterp);
              vec3 lightDir = normalize(Light[1].Position - VertPos);
              vec3 reflectDir = reflect(-lightDir, normal);
              vec3 viewDir = normalize(-VertPos);

              float dist = distance(Light[1].Position, VertPos);
              float att = 1.0 / dist;

              float lambertian = max(dot(lightDir,normal), 0.0);
              float specular = 0.0;
              if(lambertian > 0.0) {
                float specAngle = max(dot(reflectDir, viewDir), 0.0);
                specular = pow(specAngle, 4.0);
              }

              float angle = max(dot(reflectDir, viewDir), 0.0);

              vec3 color = vec3(0, 0, 0);
              vec3 light = vec3(
                Light[1].La * Material.Ka.xyz +
                lambertian * Light[1].Ld * att * Material.Kd.xyz +
                specular * Light[1].Ls * att * Material.Ks.xyz * pow(angle, Material.Shininess));
              if(Light[1].Switch == 1){color += light;}

              // second light

              lightDir = normalize(Light[2].Position - VertPos);
              reflectDir = reflect(-lightDir, normal);
              lambertian = max(dot(lightDir,normal), 0.0);

              dist = distance(Light[2].Position, VertPos);
              att = 1.0 / dist;

              if(lambertian > 0.0) {
                float specAngle = max(dot(reflectDir, viewDir), 0.0);
                specular = pow(specAngle, 4.0);
              }
              light = vec3(
                Light[2].La * Material.Ka.xyz +
                lambertian * Light[2].Ld * att * Material.Kd.xyz +
                specular * Light[2].Ls * att * Material.Ks.xyz * pow(angle, Material.Shininess));
              if(Light[2].Switch == 1){color += light;}

              gl_FragColor = vec4(color.xyz, 1.0);
            }`;

        this.rayviewVShader =
            `uniform mat4 ProjMatrix;
            uniform mat4 ModelViewMatrix;

            varying vec2 TexCoord;

            attribute vec3 VertexPosition;
            attribute vec2 VertexTexture;

            void main() {
              gl_Position = ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0);
              TexCoord = VertexTexture;
            }`;
        this.rayviewFShader =
            `#ifdef GL_ES
            precision mediump float;
            #endif

            varying vec2 TexCoord;
            uniform sampler2D Sampler;

            void main() {
              gl_FragColor = texture2D(Sampler, TexCoord);
            }`;
    }

    start() {
        this.canvas = document.getElementById('canvas');
        this.gl = getWebGLContext(this.canvas);
        if (!this.gl) {
            console.log('Failed to get the rendering context for WebGL');
            return;
        }

        this.initVBOs();

        this.gl.clearColor(0.01176470588, 0.662745098, 0.9568627451, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.clearDepth(1.0);

        this.drawResize();
        this.drawResize();

        window.addEventListener("keydown", e => this.keyDownHandler(e, this), false);
        window.addEventListener("keyup", e => this.keyUpHandler(e, this), false);

        // this.rayScene.refreshImage();

        var tick = () => {
            var time = Date.now();
            this.prevTime = this.currentTime;
            this.currentTime = time;
            this.elapsedTime = (this.currentTime - this.prevTime) * 0.001;

            this.draw();
            requestAnimationFrame(tick, this.canvas);
        };
        tick();
    }

    initVBOs() {
        // init projection
        // this.projMatrix = glMatrix.mat4.create();
        // this.yFov = 45;

        // VBO ground
        this.vboPreview = new VBOBox(this.gl, [0, 0, 0]);

        // Init vertices
        this.vboPreview.addVertexField(VBOBox.VERT_POS);
        this.vboPreview.addVertexField(VBOBox.VERT_COLOR);
        this.vboPreview.addVertexField(VBOBox.VERT_NORMAL);

        // Add new Shape here
        this.vboPreview.addShape(
            "grid_ground",
            ShapeBuilder.generateGroundGrid(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes()
            ),
            Ayerdi_Material(MATL_BLU_PLASTIC), true);
        this.vboPreview.addShape(
            "s0_cube",
            ShapeBuilder.generateCube(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes(), [0.0, 1.0, 0.0]
            ),
            Ayerdi_Material(MATL_BRASS), true);
        this.vboPreview.addShape(
            "s0_sphere",
            ShapeBuilder.generateSphere(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes(), 13, [0.0, 0.0, 1.0]
            ),
            Ayerdi_Material(MATL_GRN_PLASTIC), true);
        this.vboPreview.addShape(
            "s1_sphere0",
            ShapeBuilder.generateSphere(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes(), 13, [0.0, 0.0, 1.0]
            ),
            Ayerdi_Material(MATL_GRN_PLASTIC), true);
        this.vboPreview.addShape(
            "s1_sphere1",
            ShapeBuilder.generateSphere(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes(), 13, [0.0, 0.0, 1.0]
            ),
            Ayerdi_Material(MATL_CHROME), true);
        this.vboPreview.addShape(
            "s1_sphere2",
            ShapeBuilder.generateSphere(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes(), 13, [0.0, 0.0, 1.0]
            ),
            Ayerdi_Material(MATL_COPPER_SHINY), true);
        this.vboPreview.addShape(
            "s1_cube",
            ShapeBuilder.generateCube(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes(), [0.0, 1.0, 0.0]
            ),
            Ayerdi_Material(MATL_BRASS), true);

        // Add new model using Shapes created above
        this.vboPreview.addModelBuilder("grid_ground", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // vbo.modelViewMatrix.scale(0.1, 0.1, 0.1);
            glMatrix.mat4.translate(vbo.modelViewMatrix, vbo.modelViewMatrix, [0, 0, 0]);
            vbo.applyMatrices(vbo.materials["grid_ground"]);
            vbo.gl.drawElements(
                vbo.gl.LINES, vbo.indexLengths["grid_ground"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["grid_ground"].indices * 2);
        });
        this.vboPreview.addModelBuilder("s0_cube", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // glMatrix.mat4.rotate(vbo.modelViewMatrix, vbo.modelViewMatrix, [45, 45, 0]);
            // glMatrix.mat4.rotateX(vbo.modelViewMatrix, vbo.modelViewMatrix, this.deg2rad(45));
            // glMatrix.mat4.rotateY(vbo.modelViewMatrix, vbo.modelViewMatrix, this.deg2rad(45));
            vbo.applyMatrices(vbo.materials["s0_cube"]);
            vbo.gl.drawElements(
                vbo.gl.TRIANGLES, vbo.indexLengths["s0_cube"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["s0_cube"].indices * 2);
        });
        this.vboPreview.addModelBuilder("s0_sphere", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // glMatrix.mat4.rotate(vbo.modelViewMatrix, vbo.modelViewMatrix, [45, 45, 0]);
            vbo.applyMatrices(vbo.materials["s0_sphere"]);
            vbo.gl.drawElements(
                vbo.gl.TRIANGLES, vbo.indexLengths["s0_sphere"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["s0_sphere"].indices * 2);
        });
        this.vboPreview.addModelBuilder("s1_sphere0", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // glMatrix.mat4.rotate(vbo.modelViewMatrix, vbo.modelViewMatrix, [45, 45, 0]);
            vbo.applyMatrices(vbo.materials["s1_sphere0"]);
            vbo.gl.drawElements(
                vbo.gl.TRIANGLES, vbo.indexLengths["s1_sphere0"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["s1_sphere0"].indices * 2);
        });
        this.vboPreview.addModelBuilder("s1_sphere1", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // glMatrix.mat4.rotate(vbo.modelViewMatrix, vbo.modelViewMatrix, [45, 45, 0]);
            vbo.applyMatrices(vbo.materials["s1_sphere1"]);
            vbo.gl.drawElements(
                vbo.gl.TRIANGLES, vbo.indexLengths["s1_sphere1"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["s1_sphere1"].indices * 2);
        });
        this.vboPreview.addModelBuilder("s1_sphere2", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // glMatrix.mat4.rotate(vbo.modelViewMatrix, vbo.modelViewMatrix, [45, 45, 0]);
            vbo.applyMatrices(vbo.materials["s1_sphere2"]);
            vbo.gl.drawElements(
                vbo.gl.TRIANGLES, vbo.indexLengths["s1_sphere2"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["s1_sphere2"].indices * 2);
        });
        this.vboPreview.addModelBuilder("s1_cube", (vbo, elapsedTime) => {
            vbo.applyMatrices(vbo.materials["s1_cube"]);
            vbo.gl.drawElements(
                vbo.gl.TRIANGLES, vbo.indexLengths["s1_cube"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["s1_cube"].indices * 2);
        });
        this.vboPreview.build(this.previewVShader, this.previewFShader);

        // this.vboPreview.camera.rotateX(90);


        /**
         *
         * VBO Ray view
         *
         **/

        this.vboRayview = new VBOBox(this.gl, [0, 0, 0]);
        this.vboRayview.addVertexField(VBOBox.VERT_POS);
        this.vboRayview.addVertexField(VBOBox.VERT_TEX);

        this.vboRayview.addShape(
            "canvas",
            ShapeBuilder.generateTextureCoord(
                this.vboRayview.getVertexFields(),
                this.vboRayview.getVertexSizes()
            ),
            Ayerdi_Material(MATL_TURQUOISE), false);

        this.vboRayview.addModelBuilder(`canvas`, (vbo, elapsedTime) => {
            // let vertexSize = vbo.floatsPerVertex;
            // let startPoint = vbo.startPoints["canvas"].verts * vertexSize;
            // let posOffset = vbo.getVertexStartIndex(VBOBox.VERT_TEX);

            vbo.gl.texSubImage2D(vbo.gl.TEXTURE_2D,
                0,
                0, 0,
                this.rayScene.image.width,
                this.rayScene.image.height,
                vbo.gl.RGB,
                vbo.gl.UNSIGNED_BYTE,
                this.rayScene.image.intBuffer);

            glMatrix.mat4.translate(vbo.modelViewMatrix, vbo.modelViewMatrix, [0, 0, 0]);
            vbo.applyMatrices(vbo.materials["canvas"]);
            // vbo.gl.bufferSubData(vbo.gl.ARRAY_BUFFER, 0, vbo.vertices);
            vbo.gl.drawArrays(vbo.gl.TRIANGLE_STRIP, vbo.startPoints["canvas"].verts, vbo.vertLengths["canvas"]);
        });

        this.initRayTrace();
        this.vboRayview.setTextureImage(this.rayScene.image);

        this.vboRayview.build(this.rayviewVShader, this.rayviewFShader);
    }

    initRayTrace() {
        this.image = new Image(512, 512);
        // TODO switch scene
        this.rayScene = new Scene(this.vboPreview.camera, this.image);

        this.sceneIndex = 0;
    }

    calcAngle(currentTime, elapsedTime, duration) {
        currentTime += elapsedTime;
        currentTime = currentTime >= duration ? currentTime - 120 : currentTime;
        return {
            currentTime: currentTime,
            angle: currentTime / duration * 360
        };
    }

    draw() {
        // Clear on-screen HTML-5 <canvas> object:
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth / 2, this.gl.drawingBufferHeight);

        this.vboPreview.update(this.gl, this.elapsedTime, vbo => {
            // In every frame this function will be called, and draw following commands
            vbo.drawModel("grid_ground", [0, 0, -5], [0, 0, 0], [1, 1, 1], this.elapsedTime);
            switch (this.sceneIndex) {
                case 0:
                    vbo.drawModel("s0_cube", [-3, 5, -2], [45, 45, 0], [0.7, 0.7, 0.7], this.elapsedTime);
                    vbo.drawModel("s0_cube", [2, 7, -2], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s0_cube", [1.4, 2, -0.5], [0, 0, 0], [0.3, 0.6, 0.2], this.elapsedTime);
                    vbo.drawModel("s0_sphere", [0, 2, -0.1], [0, 0, 0], [0.6, 0.6, 0.6], this.elapsedTime);
                    vbo.drawModel("s0_sphere", [2, 5, 2], [0, 0, 0], [2, 2, 1], this.elapsedTime);
                    break;
                case 1:
                    vbo.drawModel("s1_cube", [-1.2, 5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere0", [1.2, 2.5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere1", [-1.2, 2.5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere2", [1.2, 5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    break;
                case 2:
                    vbo.drawModel("s1_cube", [1.2, 2.5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere0", [1.2, 5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere1", [-1.2, 2.5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere2", [-1.2, 5, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    break;
                case 3:
                    vbo.drawModel("s1_cube", [4, 8, -4], [0, 0, 0], [0.8, 0.8, 0.8], this.elapsedTime);
                    vbo.drawModel("s1_sphere0", [0, 8, -4], [0, 0, 0], [3, 3, 0.05], this.elapsedTime);
                    vbo.drawModel("s1_sphere1", [0, 5, -2], [0, 0, 0], [1, 1, 1], this.elapsedTime);
                    vbo.drawModel("s1_sphere2", [0, 13, -1], [0, 0, 0], [10, 0.1, 10], this.elapsedTime);
                    break;
            }
        });

        this.gl.viewport(this.gl.drawingBufferWidth / 2, 0, this.gl.drawingBufferWidth / 2, this.gl.drawingBufferHeight);

        this.vboRayview.update(this.gl, this.elapsedTime, vbo => {
            vbo.drawModel("canvas", [0, 0, -1], [0, 0, 0], [1, 1, 1], this.elapsedTime);
        });
    }

    drawResize() {
        this.gl = getWebGLContext(this.canvas);
        if (innerWidth > innerHeight * 2) {
            this.canvas.width = innerHeight * 2;
            this.canvas.height = innerHeight;
        } else {
            this.canvas.width = innerWidth;
            this.canvas.height = innerWidth / 2;
        }
        this.draw();
    }

    keyDownHandler(e, self) {
        switch (e.keyCode) {
            case 81: // q
                self.directionControl[2] = self.directionControl[2] == 0 ? -1 : self.directionControl[2];
                break;
            case 69: // e
                self.directionControl[2] = self.directionControl[2] == 0 ? 1 : self.directionControl[2];
                break;
            case 65: // a
                self.directionControl[1] = self.directionControl[1] == 0 ? -1 : self.directionControl[1];
                break;
            case 68: // d
                self.directionControl[1] = self.directionControl[1] == 0 ? 1 : self.directionControl[1];
                break;
            case 87: // w
                self.directionControl[0] = self.directionControl[0] == 0 ? 1 : self.directionControl[0];
                break;
            case 83: // s
                self.directionControl[0] = self.directionControl[0] == 0 ? -1 : self.directionControl[0];
                break;
            case 89: // y
                self.cameraControl[2] = self.cameraControl[2] == 0 ? 1 : self.cameraControl[2];
                break;
            case 72: // h
                self.cameraControl[2] = self.cameraControl[2] == 0 ? -1 : self.cameraControl[2];
                break;
            case 74: // j
                self.cameraControl[0] = self.cameraControl[0] == 0 ? -1 : self.cameraControl[0];
                break;
            case 76: // l
                self.cameraControl[0] = self.cameraControl[0] == 0 ? 1 : self.cameraControl[0];
                break;
            case 75: // k
                self.cameraControl[1] = self.cameraControl[1] == 0 ? -1 : self.cameraControl[1];
                break;
            case 73: // i
                self.cameraControl[1] = self.cameraControl[1] == 0 ? 1 : self.cameraControl[1];
                break;
            case 32:
                self.vboGround.switchWorldLight();
                break;
                // case 66:
                //     self.vboGround.switchHeadLight();
                //     break;
            case 49:
            case 50:
            case 51:
            case 52:
                break;
            case 53:
                // vboGround.switchLightShading(e.keyCode - 49);
                // particleSystem.changeModel(e.keyCode - 49);
                break;
            case 55:
            case 56:
            case 57:
                self.vboGround.updateAttenuation(e.keyCode - 55);
                break;
            case 54:
                self.vboGround.switchDistortion();
                break;
            case 37: // ←
                self.lightControl[0] = self.lightControl[0] == 0 ? -1 : self.lightControl[0];
                break;
            case 39: // →
                self.lightControl[0] = self.lightControl[0] == 0 ? 1 : self.lightControl[0];
                break;
            case 38: // ↑
                self.lightControl[1] = self.lightControl[1] == 0 ? 1 : self.lightControl[1];
                break;
            case 40: // ↓
                self.lightControl[1] = self.lightControl[1] == 0 ? -1 : self.lightControl[1];
                break;
            case 82: // r
                // particleSystem.addForce();
                break;
            case 77: // m
                // particleSystem.switchImplicit();
                break;
            case 90: // z
                // particleSystem.switchSolver(0);
                break;
            case 88: // x
                // particleSystem.switchSolver(1);
                break;
            case 67: // c
                // particleSystem.switchSolver(2);
                break;
                // case 86: // v
                //     particleSystem.switchSolver(3);
                //     break;
                // case 66: // b
                //     particleSystem.switchSolver(4);
                //     break;
                // case 78: // n
                //     particleSystem.switchSolver(5);
                //     break;
            case 84: // t
                self.rayScene.refreshImage();
                break;
            case 71:
                self.rayScene.refreshImage(Scene.SAMPLING_SUPER, 2);
                break;
            case 66:
                self.rayScene.refreshImage(Scene.SAMPLING_JITTER, 4);
                break;
        }
        self.vboPreview.updateKeyEvents(self.cameraControl, self.directionControl, self.lightControl);
        // self.vboRayview.updateKeyEvents(self.cameraControl, self.directionControl, self.lightControl);
        // vboParticle.updateKeyEvents(cameraControl, directionControl, lightControl);
    }

    keyUpHandler(e, self) {
        // console.log(cameraPos);
        switch (e.keyCode) {
            case 81: // q
                self.directionControl[2] = 0;
                break;
            case 69: // e
                self.directionControl[2] = 0;
                break;
            case 65: // a
                self.directionControl[1] = 0;
                break;
            case 68: // d
                self.directionControl[1] = 0;
                break;
            case 87: // w
                self.directionControl[0] = 0;
                break;
            case 83: // s
                self.directionControl[0] = 0;
                break;
            case 72: // h
                self.cameraControl[2] = 0;
                break;
            case 89: // y
                self.cameraControl[2] = 0;
                break;
            case 74: // j
                self.cameraControl[0] = 0;
                break;
            case 76: // l
                self.cameraControl[0] = 0;
                break;
            case 73: // i
                self.cameraControl[1] = 0;
                break;
            case 75: // k
                self.cameraControl[1] = 0;
                break;
            case 37: // ←
                self.lightControl[0] = 0;
                break;
            case 39: // →
                self.lightControl[0] = 0;
                break;
            case 38: // ↑a
                self.lightControl[1] = 0;
                break;
            case 40: // ↓
                self.lightControl[1] = 0;
                break;
        }
        self.vboPreview.updateKeyEvents(self.cameraControl, self.directionControl, self.lightControl);
        // self.vboRayview.updateKeyEvents(self.cameraControl, self.directionControl, self.lightControl);
        // vboParticle.updateKeyEvents(cameraControl, directionControl, lightControl);
    }

    changeLightInfo(value, name) {
        // console.log(`changeLightInfo for ${name}`);
        var v = Number(value);
        if (!isNaN(v))
            this.vboPreview.updateWorldLight(v, name);
    }

    deg2rad(x) {
        return x / 180 * Math.PI;
    }

    applyJitter(n, r) {
        this.rayScene.refreshImage(r, Scene.SAMPLING_JITTER, n);
    }

    applySuper(n, r) {
        this.rayScene.refreshImage(r, Scene.SAMPLING_SUPER, n);
    }

    applyNoSamp(r) {
        this.rayScene.refreshImage(r);
    }

    switchScene(i) {
        this.sceneIndex = i;
        this.rayScene.switchScene(i);
    }

    switchLight(i) {
        this.vboPreview.switchLight(i);
        this.rayScene.switchLight(i);
    }
}
