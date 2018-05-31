/////////////////////
//  Vertex Shader  //
/////////////////////

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

uniform mat4 ProjMatrix;
uniform mat4 ModelViewMatrix;
uniform mat4 NormalMatrix;
uniform mat4 HeadNormalMatrix;
uniform LightInfo GauroudLight[3];
uniform MaterialInfo GauroudMaterial;
uniform int Shading;
uniform int Lighting;
uniform int DistortSwitch;

varying vec4 FrontColor;
varying vec4 BackColor;
varying vec3 EyeNormal;
varying vec3 HeadNormal;
varying vec3 EyePosition;
varying vec3 HeadPosition;
varying float ShadingMode;
varying float LightingMode;

attribute vec3 VertexPosition;
attribute vec3 VertexNormal;
attribute vec4 VertexColor;
attribute float VertexSize;

void getEyeSpace(out vec3 norm, out vec3 hnorm, out vec3 position,
                 out vec3 hposition) {
  norm = normalize(vec3(NormalMatrix * vec4(VertexNormal, 0.0)));
  hnorm = normalize(vec3(HeadNormalMatrix * vec4(VertexNormal, 0.0)));
  position = vec3(ModelViewMatrix * vec4(VertexPosition, 1.0));
  hposition = vec3(ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0));
}

vec4 Distort(vec4 p) {
  vec2 v = p.xy / p.w;
  float theta = atan(v.y, v.x);
  float radius = length(v);

  radius = pow(radius, 2.0);
  v.x = radius * cos(theta);
  v.y = radius * sin(theta);
  p.xy = v.xy * p.w;
  return p;
}

vec4 lightV(int lightIndex, vec3 position, vec3 norm) {

  vec3 lightDir = normalize(vec3(GauroudLight[lightIndex].Position - position));
  vec3 viewDir = normalize(-position.xyz);
  vec3 reflectDir = reflect(-lightDir, norm);
  vec3 halfReflectDir = normalize(lightDir + viewDir);

  float lambertian = max(dot(lightDir, norm), 0.0);

  vec4 ambient =
      vec4(GauroudLight[lightIndex].La, 1.0) * VertexColor * GauroudMaterial.Ka;
  vec4 diffuse = vec4(lambertian * GauroudLight[lightIndex].Ld, 1.0) *
                 VertexColor * GauroudMaterial.Kd;

  float angle = max(dot(reflectDir, viewDir), 0.0);
  if (Lighting == 2)
    angle = max(dot(halfReflectDir, norm), 0.0);

  vec4 spec = vec4(0.0, 0.0, 0.0, 1.0);
  if (lambertian > 0.0)
    spec = vec4(GauroudLight[lightIndex].Ls, 1.0) * VertexColor *
           GauroudMaterial.Ks * pow(angle, GauroudMaterial.Shininess);

  return ambient + GauroudMaterial.Ke + diffuse + spec;
}

void main() {
  getEyeSpace(EyeNormal, HeadNormal, EyePosition, HeadPosition);

  FrontColor = vec4(0, 0, 0, 1);
  BackColor = vec4(0, 0, 0, 1);

  ShadingMode = float(Shading);
  LightingMode = float(Lighting);

  if (Shading == 1) {
    if (GauroudLight[0].Switch == 1) {
      FrontColor += lightV(0, EyePosition, EyeNormal);
      BackColor += lightV(0, EyePosition, -EyeNormal);
    }

    if (GauroudLight[1].Switch == 1) {
      FrontColor += lightV(1, HeadPosition, HeadNormal);
      BackColor += lightV(1, HeadPosition, -HeadNormal);
    }

    if (GauroudLight[2].Switch == 1) {
      FrontColor += lightV(2, EyePosition, EyeNormal);
      BackColor += lightV(2, EyePosition, -EyeNormal);
    }
  } else {
    FrontColor = VertexColor;
  }

  gl_Position = ProjMatrix * ModelViewMatrix * vec4(VertexPosition, 1.0);
  gl_PointSize = VertexSize;
  // FrontColor = VertexColor;
  if (DistortSwitch == 1)
    gl_Position = Distort(gl_Position);
}

///////////////////////
//  Fragment Shader  //
///////////////////////

#ifdef GL_ES
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
varying vec4 BackColor;
varying vec3 EyeNormal;
varying vec3 HeadNormal;
varying vec3 EyePosition;
varying vec3 HeadPosition;
varying float ShadingMode;
varying float LightingMode;

uniform LightInfo PhongLight[3];
uniform MaterialInfo PhongMaterial;
int Light;
int Shade;
uniform int AttenuationMode;

vec4 lightF(vec3 Lp, vec3 La, vec3 Ld, vec3 Ls, vec3 position, vec3 norm) {
  float dist;
  dist = distance(Lp, position);
  float att = 1.0;
  if (AttenuationMode == 1) {
    att = 1.0 / (1.0 + 0.1 * dist);
  } else if (AttenuationMode == 2) {
    att = 1.0 / (1.0 + 0.1 * dist + 0.1 * dist * dist);
  }

  if (Shade == 1) {
    if (gl_FrontFacing)
      return FrontColor * att / 2.0;
    else
      return BackColor * att / 2.0;
  }

  vec3 n = normalize(norm);
  vec3 lightDir = normalize(Lp - position);
  vec3 viewDir = normalize(-position);
  vec3 reflectDir = reflect(-lightDir, n);
  vec3 hr = normalize(lightDir + viewDir);

  vec4 ambient = vec4(La, 1.0) * FrontColor * PhongMaterial.Ka;

  float sDotN = max(dot(lightDir, n), 0.0);
  vec4 diffuse = vec4(Ld, 1.0) * FrontColor * PhongMaterial.Kd * sDotN * att;

  float angle = max(dot(reflectDir, viewDir), 0.0);
  if (Light == 2)
    angle = max(dot(hr, n), 0.0);
  vec4 spec = vec4(Ls, 1.0) * FrontColor * PhongMaterial.Ks *
              pow(angle, PhongMaterial.Shininess);

  return PhongMaterial.Ke + ambient + diffuse + spec;
}

void main() {
  Light = int(LightingMode);
  Shade = int(ShadingMode);

  vec4 colorSum = vec4(0, 0, 0, 1);
  vec4 color;

  if (gl_FrontFacing) {
    if (PhongLight[0].Switch == 1) {
      color = lightF(PhongLight[0].Position, PhongLight[0].La, PhongLight[0].Ld,
                     PhongLight[0].Ls, EyePosition, EyeNormal);
      colorSum += color;
    }
    if (PhongLight[1].Switch == 1) {
      color = lightF(PhongLight[1].Position, PhongLight[1].La, PhongLight[1].Ld,
                     PhongLight[1].Ls, HeadPosition, HeadNormal);
      colorSum += color;
    }
    if (PhongLight[2].Switch == 1) {
      color = lightF(PhongLight[2].Position, PhongLight[2].La, PhongLight[2].Ld,
                     PhongLight[2].Ls, EyePosition, EyeNormal);
      colorSum += color;
    }
  } else {
    if (PhongLight[0].Switch == 1) {
      color = lightF(PhongLight[0].Position, PhongLight[0].La, PhongLight[0].Ld,
                     PhongLight[0].Ls, EyePosition, -EyeNormal);
      colorSum += color;
    }
    if (PhongLight[1].Switch == 1) {
      color = lightF(PhongLight[1].Position, PhongLight[1].La, PhongLight[1].Ld,
                     PhongLight[1].Ls, HeadPosition, -HeadNormal);
      colorSum += color;
    }
    if (PhongLight[2].Switch == 1) {
      color = lightF(PhongLight[2].Position, PhongLight[2].La, PhongLight[2].Ld,
                     PhongLight[2].Ls, EyePosition, -EyeNormal);
      colorSum += color;
    }
  }
  // colorSum /= 1.1;
  gl_FragColor = colorSum;

  // gl_FragColor = FrontColor;
  // gl_FragColor *= texture(Tex, data.TexCoord);
}
