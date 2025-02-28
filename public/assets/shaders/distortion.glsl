precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D iChannel0;

float speed = 0.05;
float darkOverlay = 0.7;
varying vec2 fragCoord;

float perlinNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = dot(i + vec2(0.0, 0.0), vec2(12.9898, 78.233));
    float b = dot(i + vec2(1.0, 0.0), vec2(12.9898, 78.233));
    float c = dot(i + vec2(0.0, 1.0), vec2(12.9898, 78.233));
    float d = dot(i + vec2(1.0, 1.0), vec2(12.9898, 78.233));

    a = fract(sin(a) * 43758.5453);
    b = fract(sin(b) * 43758.5453);
    c = fract(sin(c) * 43758.5453);
    d = fract(sin(d) * 43758.5453);

    float x1 = mix(a, b, u.x);
    float x2 = mix(c, d, u.x);
    return mix(x1, x2, u.y);
}

vec2 fluidDistortion(vec2 uv, float time) {
    float n = perlinNoise(uv * 5.0 + time);
    float angle = n * 6.28318;
    vec2 offset = vec2(cos(angle), sin(angle)) * 0.05;
    return offset;
}

void main(void) {
    vec2 uv = fragCoord.xy / resolution;

    float timeFactor = time * speed;
    vec2 warp = fluidDistortion(uv, timeFactor);

    vec2 distortedUV = uv + warp;

    float d = distance(vec2(0.5, 0.5), uv);

    float edgeWidth = 0.1;
    float blendFactor = smoothstep(0.5 - edgeWidth, 0.5 + edgeWidth, d);
    vec2 blendedUV = mix(distortedUV, uv, blendFactor);

    vec4 textureColor = texture2D(iChannel0, blendedUV);

    gl_FragColor = vec4(mix(textureColor.xyz, vec3(0.0, 0.0, 0.0), darkOverlay), 1);

}
