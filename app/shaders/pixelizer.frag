// app/shaders/pixelizer.frag
// Pixelizer fragment shader - creates retro pixel art effect
precision highp float;

uniform sampler2D uTexture;
uniform float uPixelSize;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
  // Calculate pixel grid size
  vec2 pixelSize = vec2(uPixelSize) / uResolution;
  
  // Snap UV coordinates to pixel grid
  vec2 pixelatedUv = floor(vUv / pixelSize) * pixelSize + pixelSize * 0.5;
  
  // Sample texture at pixelated coordinates
  vec4 color = texture2D(uTexture, pixelatedUv);
  
  gl_FragColor = color;
}
