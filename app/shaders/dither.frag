// app/shaders/dither.frag
// Ordered dithering (Bayer matrix) fragment shader - creates classic retro dithering effect
precision highp float;

uniform sampler2D uTexture;
uniform float uDitherScale;
uniform float uColorLevels;
uniform vec2 uResolution;

varying vec2 vUv;

// Helper function for 2x2 Bayer Matrix
// Returns value in range [0, 3]
// Map:
// 0 2
// 3 1
float bayer2(vec2 c) {
    c = floor(c);
    float x = mod(c.x, 2.0);
    float y = mod(c.y, 2.0);
    
    // Optimized math for 2x2 Bayer: 0, 2, 3, 1
    // Simple conditional is efficient for 2x2
    if (x == 0.0 && y == 0.0) return 0.0;
    if (x == 1.0 && y == 0.0) return 2.0;
    if (x == 0.0 && y == 1.0) return 3.0;
    return 1.0;
}

// 8x8 Bayer matrix using recursive definition (loop-free)
float bayerMatrix8x8(vec2 position) {
    float v = 0.0;
    
    // The value is built recursively. 
    // The finest coordinate bit (x%2) actually contributes to the High bits of the value 
    // to create the high-frequency checkerboard pattern.
    
    // Layer 1 (Finest detail - 1x1 scale) -> Contributes values 0, 16, 32, 48
    v += bayer2(position) * 16.0;
    
    // Layer 2 (2x2 scale) -> Contributes values 0, 4, 8, 12
    v += bayer2(position / 2.0) * 4.0;
    
    // Layer 3 (Coarsest detail - 4x4 scale) -> Contributes values 0, 1, 2, 3
    v += bayer2(position / 4.0) * 1.0;
    
    // Normalize 0-63 to 0.0-1.0
    return v / 64.0;
}

// Quantize color to limited palette
vec3 quantize(vec3 color, float levels) {
    return floor(color * levels + 0.5) / levels;
}

void main() {
    // Sample original texture
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Get screen position for dithering pattern
    vec2 screenPos = vUv * uResolution / uDitherScale;
    
    // Get dither threshold from Bayer matrix
    float threshold = bayerMatrix8x8(screenPos) - 0.5;
    
    // Apply dithering offset before quantization
    float spread = 1.0 / uColorLevels;
    vec3 dithered = texColor.rgb + threshold * spread;
    
    // Quantize to limited color palette
    vec3 finalColor = quantize(dithered, uColorLevels);
    
    gl_FragColor = vec4(finalColor, texColor.a);
}
