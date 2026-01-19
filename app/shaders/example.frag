// app/shaders/example.frag
// Example fragment shader with glslify pragma for modular shader imports
precision highp float;

#pragma glslify: noise = require('glsl-noise/simplex/3d')

varying vec2 vUv;
uniform float uTime;

void main() {
  float n = noise(vec3(vUv * 1.0, uTime * 0.5));
  vec3 color = vec3(n * 0.5 + 0.5);
  gl_FragColor = vec4(color, 1.0);
}
