/**
  25/04/18 - Activity 03

  I decided to add some update logs here to record what I have done between
  activity submissions.

  + Finally separated VBOBox into "world box" + "particle box"! Look into
    VBOBox.js to get more info.
  + Changed number of particles to 2 temporarily to make spring system.
  ? Seems camera's rotating still have some problems. But not a big deal. Fix
    it when free.
*/


var g_gl;
var g_canvasID;

var prevTime = Date.now();
var currentTime = Date.now();
var elapsedTime = 0;

var vboGround;

var vShaderGauroud =
    '\n' +
    'struct LightInfo\n' +
    '{\n' +
    '  vec3 Position;\n' +
    '  vec3 La;\n' +
    '  vec3 Ld;\n' +
    '  vec3 Ls;\n' +
    '  int Switch;\n' +
    '};\n' +
    '\n' +
    'struct MaterialInfo\n' +
    '{\n' +
    '  vec4 Ke;\n' +
    '  vec4 Ka;\n' +
    '  vec4 Kd;\n' +
    '  vec4 Ks;\n' +
    '  float Shininess;\n' +
    '};\n' +
    '\n' +
    'uniform mat4 ProjMatrix;\n' +
    'uniform mat4 ModelViewMatrix;\n' +
    'uniform mat4 NormalMatrix;\n' +
    'uniform mat4 HeadNormalMatrix;\n' +
    'uniform LightInfo GauroudLight[3];\n' +
    'uniform MaterialInfo GauroudMaterial;\n' +
    'uniform int Shading;\n' +
    'uniform int Lighting;\n' +
    'uniform int DistortSwitch;\n' +
    '\n' +
    'varying vec4 FrontColor;\n' +
    'varying vec4 BackColor;\n' +
    'varying vec3 EyeNormal;\n' +
    'varying vec3 HeadNormal;\n' +
    'varying vec3 EyePosition;\n' +
    'varying vec3 HeadPosition;\n' +
    'varying float ShadingMode;\n' +
    'varying float LightingMode;\n' +
    '\n' +
    'attribute vec3 VertexPosition;\n' +
    'attribute vec3 VertexNormal;\n' +
    'attribute vec3 VertexColor;\n' +
    '\n' +
    'void getEyeSpace( out vec3 norm, out vec3 hnorm, out vec3 position, out vec3 hposition)\n' +
    '{\n' +
    '  norm = normalize( vec3( NormalMatrix * vec4( VertexNormal, 0.0 ) ) );\n' +
    '  hnorm = normalize( vec3( HeadNormalMatrix * vec4( VertexNormal, 0.0 ) ) );\n' +
    '  position = vec3(ModelViewMatrix * vec4(VertexPosition, 1.0));\n' +
    '  hposition = vec3( ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0) );\n' +
    '}\n' +
    '\n' +
    'vec4 Distort(vec4 p){\n' +
    '  vec2 v = p.xy / p.w;\n' +
    '  float theta  = atan(v.y,v.x);\n' +
    '  float radius = length(v);\n' +
    '\n' +
    '  radius = pow(radius, 2.0);\n' +
    '  v.x = radius * cos(theta);\n' +
    '  v.y = radius * sin(theta);\n' +
    '  p.xy = v.xy * p.w;\n' +
    '  return p;\n' +
    '}\n' +
    '\n' +
    'vec4 lightV( int lightIndex, vec3 position, vec3 norm )\n' +
    '{\n' +
    '\n' +
    '  vec3 lightDir = normalize( vec3( GauroudLight[lightIndex].Position - position ) );\n' +
    '  vec3 viewDir = normalize( -position.xyz );\n' +
    '  vec3 reflectDir = reflect( -lightDir, norm );\n' +
    '  vec3 halfReflectDir = normalize( lightDir + viewDir );\n' +
    '\n' +
    '  float lambertian = max( dot( lightDir, norm ), 0.0 );\n' +
    '\n' +
    '  vec4 ambient = vec4(GauroudLight[lightIndex].La * VertexColor, 1.0) * GauroudMaterial.Ka;\n' +
    '  vec4 diffuse = vec4(lambertian * GauroudLight[lightIndex].Ld * VertexColor, 1.0) * GauroudMaterial.Kd;\n' +
    '\n' +
    '  float angle = max( dot(reflectDir,viewDir) , 0.0 );\n' +
    '  if (Lighting == 2)\n' +
    '    angle = max( dot(halfReflectDir, norm), 0.0);\n' +
    '\n' +
    '  vec4 spec = vec4(0.0, 0.0, 0.0, 1.0);\n' +
    '  if ( lambertian > 0.0 )\n' +
    '    spec = vec4(GauroudLight[lightIndex].Ls * VertexColor, 1.0) * GauroudMaterial.Ks * pow( angle, GauroudMaterial.Shininess );\n' +
    '\n' +
    '  return ambient + GauroudMaterial.Ke  + diffuse + spec;\n' +
    '}\n' +
    '\n' +
    'void main()\n' +
    '{\n' +
    '  getEyeSpace( EyeNormal, HeadNormal, EyePosition, HeadPosition );\n' +
    // '\n' +
    // '  FrontColor = vec4(0, 0, 0, 1);\n' +
    // '  BackColor = vec4(0, 0, 0, 1);\n' +
    // '\n' +
    // '  ShadingMode = float(Shading);\n' +
    // '  LightingMode = float(Lighting);\n' +
    // '\n' +
    // '  if(Shading == 1){\n' +
    // '    if(GauroudLight[0].Switch == 1 )\n' +
    // '    {\n' +
    // '      FrontColor += lightV( 0, EyePosition, EyeNormal );\n' +
    // '      BackColor += lightV( 0, EyePosition, -EyeNormal );\n' +
    // '    }\n' +
    // '\n' +
    // '    if(GauroudLight[1].Switch == 1 )\n' +
    // '    {\n' +
    // '      FrontColor += lightV( 1, HeadPosition, HeadNormal );\n' +
    // '      BackColor += lightV( 1, HeadPosition, -HeadNormal );\n' +
    // '    }\n' +
    // '\n' +
    // '    if(GauroudLight[2].Switch == 1 )\n' +
    // '    {\n' +
    // '      FrontColor += lightV( 2, EyePosition, EyeNormal );\n' +
    // '      BackColor += lightV( 2, EyePosition, -EyeNormal );\n' +
    // '    }\n' +
    // '  }else{ FrontColor = vec4(VertexColor, 1.0); }\n' +
    '\n' +
    '  gl_Position = ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0);\n' +
    '  gl_PointSize = 7.0;\n' +
    '  FrontColor = vec4(VertexColor, 1.0);\n' +
    // '  if(DistortSwitch == 1)\n' +
    // '    gl_Position = Distort(gl_Position);\n' +
    '}\n';
var fShaderGauroud =
    '#ifdef GL_ES\n' +
    '  precision mediump float;\n' +
    '#endif\n' +
    '\n' +
    'struct LightInfo\n' +
    '{\n' +
    '  vec3 Position;\n' +
    '  vec3 La;\n' +
    '  vec3 Ld;\n' +
    '  vec3 Ls;\n' +
    '  int Switch;\n' +
    '};\n' +
    '\n' +
    'struct MaterialInfo\n' +
    '{\n' +
    '  vec4 Ke;\n' +
    '  vec4 Ka;\n' +
    '  vec4 Kd;\n' +
    '  vec4 Ks;\n' +
    '  float Shininess;\n' +
    '};\n' +
    '\n' +
    'varying vec4 FrontColor;\n' +
    'varying vec4 BackColor;\n' +
    'varying vec3 EyeNormal;\n' +
    'varying vec3 HeadNormal;\n' +
    'varying vec3 EyePosition;\n' +
    'varying vec3 HeadPosition;\n' +
    'varying float ShadingMode;\n' +
    'varying float LightingMode;\n' +
    '\n' +
    'uniform LightInfo PhongLight[3];\n' +
    'uniform MaterialInfo PhongMaterial;\n' +
    'int Light;\n' +
    'int Shade;\n' +
    'uniform int AttenuationMode;\n' +
    '\n' +
    'vec4 lightF(vec3 Lp, vec3 La, vec3 Ld, vec3 Ls, vec3 position, vec3 norm){\n' +
    '  float dist;\n' +
    '  dist = distance(Lp, position);\n' +
    '  float att = 1.0;\n' +
    '  if(AttenuationMode == 1){ att = 1.0 / (1.0 + 0.1 * dist); }\n' +
    '  else if(AttenuationMode == 2){ att = 1.0 / (1.0 + 0.1 * dist + 0.1 * dist * dist); }\n' +
    '\n' +
    '  if (Shade == 1){\n' +
    '    if ( gl_FrontFacing )\n' +
    '      return FrontColor * att / 2.0;\n' +
    '    else\n' +
    '      return BackColor * att / 2.0;\n' +
    '  }\n' +
    '\n' +
    '  vec3 n = normalize( norm );\n' +
    '  vec3 lightDir = normalize( Lp - position );\n' +
    '  vec3 viewDir = normalize( -position );\n' +
    '  vec3 reflectDir = reflect( -lightDir, n );\n' +
    '  vec3 hr = normalize( lightDir + viewDir );\n' +
    '\n' +
    '  vec4 ambient = vec4(La, 1.0) * FrontColor * PhongMaterial.Ka;\n' +
    '\n' +
    '  float sDotN = max( dot( lightDir, n ), 0.0 );\n' +
    '  vec4 diffuse = vec4(Ld, 1.0) * FrontColor * PhongMaterial.Kd * sDotN * att;\n' +
    '\n' +
    '  float angle = max( dot(reflectDir,viewDir) , 0.0 );\n' +
    '  if(Light == 2)\n' +
    '    angle = max( dot(hr, n), 0.0);\n' +
    '  vec4 spec = vec4(Ls, 1.0) * FrontColor * PhongMaterial.Ks * pow( angle, PhongMaterial.Shininess );\n' +
    '\n' +
    '  return PhongMaterial.Ke + ambient + diffuse + spec;\n' +
    '}\n' +
    '\n' +
    'void main()\n' +
    '{\n' +
    // '  Light = int(LightingMode);\n' +
    // '  Shade = int(ShadingMode);\n' +
    // '\n' +
    // '  vec4 colorSum = vec4(0, 0, 0, 1);\n' +
    // '  vec4 color;\n' +
    // '\n' +
    // '  if ( gl_FrontFacing ){\n' +
    // '    if (PhongLight[0].Switch == 1){\n' +
    // '      color = lightF(PhongLight[0].Position, PhongLight[0].La, PhongLight[0].Ld, PhongLight[0].Ls, EyePosition, EyeNormal);\n' +
    // '      colorSum += color;\n' +
    // '    }\n' +
    // '    if (PhongLight[1].Switch == 1){\n' +
    // '      color = lightF(PhongLight[1].Position, PhongLight[1].La, PhongLight[1].Ld, PhongLight[1].Ls, HeadPosition, HeadNormal);\n' +
    // '      colorSum += color;\n' +
    // '    }\n' +
    // '    if (PhongLight[2].Switch == 1){\n' +
    // '      color = lightF(PhongLight[2].Position, PhongLight[2].La, PhongLight[2].Ld, PhongLight[2].Ls, EyePosition, EyeNormal);\n' +
    // '      colorSum += color;\n' +
    // '    }\n' +
    // '  }else{\n' +
    // '    if (PhongLight[0].Switch == 1){\n' +
    // '      color = lightF(PhongLight[0].Position, PhongLight[0].La, PhongLight[0].Ld, PhongLight[0].Ls, EyePosition, -EyeNormal);\n' +
    // '      colorSum += color;\n' +
    // '    }\n' +
    // '    if (PhongLight[1].Switch == 1){\n' +
    // '      color = lightF(PhongLight[1].Position, PhongLight[1].La, PhongLight[1].Ld, PhongLight[1].Ls, HeadPosition, -HeadNormal);\n' +
    // '      colorSum += color;\n' +
    // '    }\n' +
    // '    if (PhongLight[2].Switch == 1){\n' +
    // '      color = lightF(PhongLight[2].Position, PhongLight[2].La, PhongLight[2].Ld, PhongLight[2].Ls, EyePosition, -EyeNormal);\n' +
    // '      colorSum += color;\n' +
    // '    }\n' +
    // '  }\n' +
    // '  colorSum /= 1.1;\n' +
    // '  gl_FragColor = colorSum;\n' +
    '\n' +
    '  gl_FragColor = FrontColor;\n' +
    // '  gl_FragColor *= texture(Tex, data.TexCoord);\n' +
    '}\n' +
    '\n';

function main() {
    g_canvasID = document.getElementById('webgl');
    g_gl = getWebGLContext(g_canvasID);
    if (!g_gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    initVBOs();

    g_gl.clearColor(0.05, 0.2, 0.05, 0.5);
    g_gl.enable(g_gl.DEPTH_TEST);
    g_gl.depthFunc(g_gl.LEQUAL);
    g_gl.clearDepth(1.0);

    drawResize();
    drawResize();

    window.addEventListener("keydown", keyDownHandler, false);
    window.addEventListener("keyup", keyUpHandler, false);

    var tick = function () {
        var time = Date.now();
        prevTime = currentTime;
        currentTime = time;
        elapsedTime = (currentTime - prevTime) * 0.001;

        draw(g_gl);
        requestAnimationFrame(tick, g_canvasID);
    };
    tick();
}

function initVBOs() {
    // init projection
    projMatrix = new Matrix4();
    yFov = 35;

    // VBO ground
    vboGround = new VBOBox(g_gl);
    // Add new Shape here
    vboGround.addShape("grid_ground", ShapeBuilder.makeGroundGrid(), Material(MATL_TURQUOISE), true);

    // Add new model using Shapes created above
    vboGround.addModelBuilder("grid_ground", (vbo, elapsedTime) => {
        // This is "DRAW()" function for ground. No need to manage inside VBO
        vbo.modelViewMatrix.scale(0.1, 0.1, 0.1);
        vbo.applyMatrices(vbo.materials["grid_ground"]);
        vbo.gl.drawElements(
            vbo.gl.LINES, vbo.indexLengths["grid_ground"],
            vbo.gl.UNSIGNED_SHORT, vbo.startPoints["grid_ground"].indices * 2);
    });
    vboGround.build(vShaderGauroud, fShaderGauroud);

    // VBO particle
    vboParticle = new VBOBox(g_gl);
    particleCount = 1000;
    particleSystem = new ParticleSystem();
    particleSystem.init(particleCount);
    vboParticle.addShape("particles", ShapeBuilder.makeParticles(particleCount), Material(MATL_TURQUOISE), false);

    let partAngle = 0,
        partDuration = 60,
        partCurrTime = 0;

    vboParticle.addModelBuilder("particles", (vbo, elapsedTime) => {
        let startPoint = vbo.startPoints["particles"].verts * 9;
        for (let i = 0; i < particleSystem.particleCount; i++) {
            let particle = particleSystem.state[i];
            for (let j = 0; j < 3; j++) {
                vbo.vertices[startPoint + i * 9 + j] = particle.pos[j];
            }
        }
        particleSystem.updateState(elapsedTime);

        let calculated = calcAngle(partCurrTime, elapsedTime, partDuration);
        console.log(calculated);

        partCurrTime = calculated.currentTime;
        partAngle = calculated.angle;

        vbo.modelViewMatrix.rotate(partAngle, 0, 0, 1);

        vbo.applyMatrices(vbo.materials["particles"]);
        vbo.gl.bufferSubData(vbo.gl.ARRAY_BUFFER, 0, vbo.vertices);
        vbo.gl.drawArrays(vbo.gl.POINTS, vbo.startPoints["particles"].verts, vbo.vertLengths["particles"]);
    });
    vboParticle.build(vShaderGauroud, fShaderGauroud);
}

function calcAngle(currentTime, elapsedTime, duration) {
    currentTime += elapsedTime;
    currentTime = currentTime >= duration ? currentTime - 120 : currentTime;
    return {
        currentTime: currentTime,
        angle: currentTime / duration * 360
    };
}

function draw(gl) {
    // Clear on-screen HTML-5 <canvas> object:
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    vAspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    projMatrix.setPerspective(
        yFov,
        vAspect,
        1,
        100
    );

    vboGround.update(gl, elapsedTime, projMatrix, vbo => {
        // In every frame this function will be called, and draw following commands
        vbo.drawModel("grid_ground", [0, 0, -0.04], [0, 0, 0], [1, 1, 1], elapsedTime);
    });

    vboParticle.update(gl, elapsedTime, projMatrix, vbo => {
        vbo.drawModel("particles", [0, 0, 2.0], [0, 0, 0], [1, 1, 1], elapsedTime);
    });
}

function drawResize() {
    g_gl = getWebGLContext(g_canvasID);
    g_canvasID.width = innerWidth;
    g_canvasID.height = innerHeight;
    draw(g_gl);
}

var directionControl = [0, 0, 0];
var cameraControl = [0, 0, 0];
var lightControl = [0, 0];

function keyDownHandler(e) {
    switch (e.keyCode) {
        case 81: // q
            directionControl[2] = directionControl[2] == 0 ? 1 : directionControl[2];
            break;
        case 69: // e
            directionControl[2] = directionControl[2] == 0 ? -1 : directionControl[2];
            break;
        case 87: // w
            directionControl[1] = directionControl[1] == 0 ? 1 : directionControl[1];
            break;
        case 83: // s
            directionControl[1] = directionControl[1] == 0 ? -1 : directionControl[1];
            break;
        case 65: // a
            directionControl[0] = directionControl[0] == 0 ? -1 : directionControl[0];
            break;
        case 68: // d
            directionControl[0] = directionControl[0] == 0 ? 1 : directionControl[0];
            break;
        case 89: // y
            cameraControl[1] = cameraControl[1] == 0 ? 1 : cameraControl[1];
            break;
        case 72: // h
            cameraControl[1] = cameraControl[1] == 0 ? -1 : cameraControl[1];
            break;
        case 74: // j
            cameraControl[0] = cameraControl[0] == 0 ? -1 : cameraControl[0];
            break;
        case 76: // l
            cameraControl[0] = cameraControl[0] == 0 ? 1 : cameraControl[0];
            break;
        case 75: // k
            cameraControl[2] = cameraControl[2] == 0 ? -1 : cameraControl[2];
            break;
        case 73: // i
            cameraControl[2] = cameraControl[2] == 0 ? 1 : cameraControl[2];
            break;
        case 32:
            vboGround.switchWorldLight();
            break;
        case 66:
            vboGround.switchHeadLight();
            break;
        case 49:
        case 50:
        case 51:
        case 52:
            vboGround.switchLightShading(e.keyCode - 49);
            break;
        case 55:
        case 56:
        case 57:
            vboGround.updateAttenuation(e.keyCode - 55);
            break;
        case 53:
            vboGround.switchDistortion();
            break;
        case 37: // ←
            lightControl[0] = lightControl[0] == 0 ? -1 : lightControl[0];
            break;
        case 39: // →
            lightControl[0] = lightControl[0] == 0 ? 1 : lightControl[0];
            break;
        case 38: // ↑
            lightControl[1] = lightControl[1] == 0 ? 1 : lightControl[1];
            break;
        case 40: // ↓
            lightControl[1] = lightControl[1] == 0 ? -1 : lightControl[1];
            break;
        case 82: // r
            particleSystem.addForce();
            break;
        case 67: // c
            particleSystem.switchSolver();
            break;
    }
    vboGround.updateKeyEvents(cameraControl, directionControl, lightControl);
    vboParticle.updateKeyEvents(cameraControl, directionControl, lightControl);
}

function keyUpHandler(e) {
    // console.log(cameraPos);
    switch (e.keyCode) {
        case 81: // q
            directionControl[2] = 0;
            break;
        case 69: // e
            directionControl[2] = 0;
            break;
        case 87: // w
            directionControl[1] = 0;
            break;
        case 83: // s
            directionControl[1] = 0;
            break;
        case 65: // a
            directionControl[0] = 0;
            break;
        case 68: // d
            directionControl[0] = 0;
            break;
        case 72: // h
            cameraControl[1] = 0;
            break;
        case 89: // y
            cameraControl[1] = 0;
            break;
        case 74: // j
            cameraControl[0] = 0;
            break;
        case 76: // l
            cameraControl[0] = 0;
            break;
        case 73: // i
            cameraControl[2] = 0;
            break;
        case 75: // k
            cameraControl[2] = 0;
            break;
        case 37: // ←
            lightControl[0] = 0;
            break;
        case 39: // →
            lightControl[0] = 0;
            break;
        case 38: // ↑a
            lightControl[1] = 0;
            break;
        case 40: // ↓
            lightControl[1] = 0;
            break;
    }
    vboGround.updateKeyEvents(cameraControl, directionControl, lightControl);
    vboParticle.updateKeyEvents(cameraControl, directionControl, lightControl);
}

function changeLightInfo(value, name) {
    // console.log(`changeLightInfo for ${name}`);
    var v = Number(value);
    if (!isNaN(v))
        vboGround.updateWorldLight(v, name);
}
