// app/shaders/example.vert
// Example vertex shader
precision highp float;

varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  
  vec3 pos = position;
  // Simple wave displacement example
  pos.z += sin(pos.x * 3.0 + uTime) * 0.1;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
