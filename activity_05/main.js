// import * as glMatrix from "/lib/gl-matrix.js";
import ShapeBuilder from "/ShapeBuilder.js";
import VBOBox from "/VBOBox.js";

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

            varying vec4 FrontColor;

            attribute vec3 VertexPosition;
            attribute vec4 VertexColor;

            void main() {
              FrontColor = VertexColor;

              gl_Position = ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0);
            }`;
        this.previewFShader =
            `#ifdef GL_ES
            precision mediump float;
            #endif

            varying vec4 FrontColor;

            void main() {
              gl_FragColor = FrontColor;
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
        this.projMatrix = new Matrix4();
        this.yFov = 45;

        // VBO ground
        this.vboPreview = new VBOBox(this.gl);

        // Init vertices
        this.vboPreview.addVertexField(VBOBox.VERT_POS);
        this.vboPreview.addVertexField(VBOBox.VERT_COLOR);

        // Add new Shape here
        this.vboPreview.addShape(
            "grid_ground",
            ShapeBuilder.generateGroundGrid(
                this.vboPreview.getVertexFields(),
                this.vboPreview.getVertexSizes()
            ),
            Material(MATL_TURQUOISE), true);

        // Add new model using Shapes created above
        this.vboPreview.addModelBuilder("grid_ground", (vbo, elapsedTime) => {
            // This is "DRAW()" function for ground. No need to manage inside VBO
            // vbo.modelViewMatrix.scale(0.1, 0.1, 0.1);
            vbo.modelViewMatrix.translate(0, 0, -5);
            vbo.applyMatrices(vbo.materials["grid_ground"]);
            vbo.gl.drawElements(
                vbo.gl.LINES, vbo.indexLengths["grid_ground"],
                vbo.gl.UNSIGNED_SHORT, vbo.startPoints["grid_ground"].indices * 2);
        });
        this.vboPreview.build(this.previewVShader, this.previewFShader);


        /**
         *
         * VBO Ray view
         *
         **/

        this.vboRayview = new VBOBox(this.gl);
        this.vboRayview.addVertexField(VBOBox.VERT_POS);
        this.vboRayview.addVertexField(VBOBox.VERT_TEX);

        this.vboRayview.addShape(
            "canvas",
            ShapeBuilder.generateTextureCoord(
                this.vboRayview.getVertexFields(),
                this.vboRayview.getVertexSizes()
            ),
            Material(MATL_TURQUOISE), false);

        this.vboRayview.addModelBuilder(`canvas`, (vbo, elapsedTime) => {
            vbo.modelViewMatrix.translate(0, 0, -2.5);
            vbo.applyMatrices(vbo.materials["canvas"]);
            vbo.gl.drawArrays(vbo.gl.TRIANGLE_STRIP, vbo.startPoints["canvas"].verts, vbo.vertLengths["canvas"]);
        });

        this.vboRayview.build(this.rayviewVShader, this.rayviewFShader);
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

        let vAspect = this.gl.drawingBufferWidth / 2 / this.gl.drawingBufferHeight;
        this.projMatrix.setPerspective(
            this.yFov,
            vAspect,
            1,
            100
        );

        this.vboPreview.update(this.gl, this.elapsedTime, this.projMatrix, vbo => {
            // In every frame this function will be called, and draw following commands
            vbo.drawModel("grid_ground", [0, 0, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
        });

        this.gl.viewport(this.gl.drawingBufferWidth / 2, 0, this.gl.drawingBufferWidth / 2, this.gl.drawingBufferHeight);

        this.vboRayview.update(this.gl, this.elapsedTime, this.projMatrix, vbo => {
            vbo.drawModel("canvas", [0, 0, 0], [0, 0, 0], [1, 1, 1], this.elapsedTime);
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
                self.directionControl[2] = self.directionControl[2] == 0 ? 1 : self.directionControl[2];
                break;
            case 69: // e
                self.directionControl[2] = self.directionControl[2] == 0 ? -1 : self.directionControl[2];
                break;
            case 87: // w
                self.directionControl[1] = self.directionControl[1] == 0 ? 1 : self.directionControl[1];
                break;
            case 83: // s
                self.directionControl[1] = self.directionControl[1] == 0 ? -1 : self.directionControl[1];
                break;
            case 65: // a
                self.directionControl[0] = self.directionControl[0] == 0 ? -1 : self.directionControl[0];
                break;
            case 68: // d
                self.directionControl[0] = self.directionControl[0] == 0 ? 1 : self.directionControl[0];
                break;
            case 89: // y
                self.cameraControl[1] = self.cameraControl[1] == 0 ? 1 : self.cameraControl[1];
                break;
            case 72: // h
                self.cameraControl[1] = self.cameraControl[1] == 0 ? -1 : self.cameraControl[1];
                break;
            case 74: // j
                self.cameraControl[0] = self.cameraControl[0] == 0 ? -1 : self.cameraControl[0];
                break;
            case 76: // l
                self.cameraControl[0] = self.cameraControl[0] == 0 ? 1 : self.cameraControl[0];
                break;
            case 75: // k
                self.cameraControl[2] = self.cameraControl[2] == 0 ? -1 : self.cameraControl[2];
                break;
            case 73: // i
                self.cameraControl[2] = self.cameraControl[2] == 0 ? 1 : self.cameraControl[2];
                break;
            case 32:
                self.vboGround.switchWorldLight();
                break;
            case 66:
                self.vboGround.switchHeadLight();
                break;
            case 49:
            case 50:
            case 51:
            case 52:
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
        }
        self.vboPreview.updateKeyEvents(self.cameraControl, self.directionControl, self.lightControl);
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
            case 87: // w
                self.directionControl[1] = 0;
                break;
            case 83: // s
                self.directionControl[1] = 0;
                break;
            case 65: // a
                self.directionControl[0] = 0;
                break;
            case 68: // d
                self.directionControl[0] = 0;
                break;
            case 72: // h
                self.cameraControl[1] = 0;
                break;
            case 89: // y
                self.cameraControl[1] = 0;
                break;
            case 74: // j
                self.cameraControl[0] = 0;
                break;
            case 76: // l
                self.cameraControl[0] = 0;
                break;
            case 73: // i
                self.cameraControl[2] = 0;
                break;
            case 75: // k
                self.cameraControl[2] = 0;
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
        // vboParticle.updateKeyEvents(cameraControl, directionControl, lightControl);
    }

    changeLightInfo(value, name) {
        // console.log(`changeLightInfo for ${name}`);
        var v = Number(value);
        if (!isNaN(v))
            this.vboPreview.updateWorldLight(v, name);
    }
}
