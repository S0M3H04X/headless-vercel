// app/shaders/dither.frag
// Ordered dithering (Bayer matrix) fragment shader - creates classic retro dithering effect
precision highp float;

uniform sampler2D uTexture;
uniform float uDitherScale;
uniform float uColorLevels;
uniform vec2 uResolution;

varying vec2 vUv;

// 8x8 Bayer matrix for ordered dithering
float bayerMatrix8x8(vec2 position) {
    int x = int(mod(position.x, 8.0));
    int y = int(mod(position.y, 8.0));
    
    // Bayer 8x8 matrix values normalized to 0-1
    float matrix[64];
    matrix[0] = 0.0/64.0;   matrix[1] = 32.0/64.0;  matrix[2] = 8.0/64.0;   matrix[3] = 40.0/64.0;
    matrix[4] = 2.0/64.0;   matrix[5] = 34.0/64.0;  matrix[6] = 10.0/64.0;  matrix[7] = 42.0/64.0;
    matrix[8] = 48.0/64.0;  matrix[9] = 16.0/64.0;  matrix[10] = 56.0/64.0; matrix[11] = 24.0/64.0;
    matrix[12] = 50.0/64.0; matrix[13] = 18.0/64.0; matrix[14] = 58.0/64.0; matrix[15] = 26.0/64.0;
    matrix[16] = 12.0/64.0; matrix[17] = 44.0/64.0; matrix[18] = 4.0/64.0;  matrix[19] = 36.0/64.0;
    matrix[20] = 14.0/64.0; matrix[21] = 46.0/64.0; matrix[22] = 6.0/64.0;  matrix[23] = 38.0/64.0;
    matrix[24] = 60.0/64.0; matrix[25] = 28.0/64.0; matrix[26] = 52.0/64.0; matrix[27] = 20.0/64.0;
    matrix[28] = 62.0/64.0; matrix[29] = 30.0/64.0; matrix[30] = 54.0/64.0; matrix[31] = 22.0/64.0;
    matrix[32] = 3.0/64.0;  matrix[33] = 35.0/64.0; matrix[34] = 11.0/64.0; matrix[35] = 43.0/64.0;
    matrix[36] = 1.0/64.0;  matrix[37] = 33.0/64.0; matrix[38] = 9.0/64.0;  matrix[39] = 41.0/64.0;
    matrix[40] = 51.0/64.0; matrix[41] = 19.0/64.0; matrix[42] = 59.0/64.0; matrix[43] = 27.0/64.0;
    matrix[44] = 49.0/64.0; matrix[45] = 17.0/64.0; matrix[46] = 57.0/64.0; matrix[47] = 25.0/64.0;
    matrix[48] = 15.0/64.0; matrix[49] = 47.0/64.0; matrix[50] = 7.0/64.0;  matrix[51] = 39.0/64.0;
    matrix[52] = 13.0/64.0; matrix[53] = 45.0/64.0; matrix[54] = 5.0/64.0;  matrix[55] = 37.0/64.0;
    matrix[56] = 63.0/64.0; matrix[57] = 31.0/64.0; matrix[58] = 55.0/64.0; matrix[59] = 23.0/64.0;
    matrix[60] = 61.0/64.0; matrix[61] = 29.0/64.0; matrix[62] = 53.0/64.0; matrix[63] = 21.0/64.0;
    
    int index = y * 8 + x;
    
    // WebGL 1.0 compatible indexing
    for (int i = 0; i < 64; i++) {
        if (i == index) return matrix[i];
    }
    return 0.0;
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
