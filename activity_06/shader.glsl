/////////////////////
//  Vertex Shader  //
/////////////////////

uniform mat4 ProjMatrix;
uniform mat4 ModelViewMatrix;

varying vec4 FrontColor;
varying vec2 TexCoord;

attribute vec3 VertexPosition;
attribute vec3 VertexNormal;
attribute vec4 VertexColor;
attribute float VertexSize;
attribute vec2 VertexTexture;

void main() {
  FrontColor = VertexColor;

  gl_Position = ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0);
  gl_PointSize = VertexSize;
}

///////////////////////
//  Fragment Shader  //
///////////////////////

#ifdef GL_ES
precision mediump float;
#endif

varying vec4 FrontColor;
varying vec2 TexCoord;
varying float Mode;

uniform sampler2D Sampler;

int mode;

void main() {
  mode = int(Mode);
  if (mode == 0) {
    gl_FragColor = FrontColor;
  } else {
    gl_FragColor = texture2D(Sampler, TexCoord);
  }
}
