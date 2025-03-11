precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 screenResolution;
uniform vec2 textureResolution;

uniform vec3 color;
uniform vec3 colorToTransform;

uniform float transition;
uniform bool isSimple;

uniform sampler2D iChannel0; // main texture
uniform sampler2D iChannel1; //mask

float SPEED = 0.05;
float BORDER_THICKNESS = 0.1;
vec3 BORDER_COLOR = vec3(0.953, 0.824, 0.224);

float CELL_SIZE = 147.2;
float GRID_OFFSET_X = 0.0;
float GRID_OFFSET_Y = 95.0;

vec3 RED_COLOR = vec3(1, 0.302, 0.275);
vec3 GREEN_COLOR = vec3(0.357, 0.8, 0.498);
vec3 BLUE_COLOR = vec3(0.451, 0.682, 1.0);
vec3 YELLOW_COLOR = vec3(0.969, 0.961, 0.549);

varying vec2 fragCoord;

float perlinNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float p1 = 21.154;
    float p2 = 667.546;
    float p3 = 4687.564;

    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = dot(i + vec2(0.0, 0.0), vec2(p1, p2));
    float b = dot(i + vec2(1.0, 0.0), vec2(p1, p2));
    float c = dot(i + vec2(0.0, 1.0), vec2(p1, p2));
    float d = dot(i + vec2(1.0, 1.0), vec2(p1, p2));

    a = fract(sin(a) * p3);
    b = fract(sin(b) * p3);
    c = fract(sin(c) * p3);
    d = fract(sin(d) * p3);

    float x1 = mix(a, b, u.x);
    float x2 = mix(c, d, u.x);
    return mix(x1, x2, u.y);
}

vec2 fluidDistortion(vec2 uv, float time) {
    float n = perlinNoise(uv * 7.0 + time);
    float angle = n * 6.28318;
    vec2 offset = vec2(cos(angle), sin(angle)) * 0.1;
    return offset;
}
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
vec3 getColorDuringTransition(vec2 uv) {

    float noiseValue = texture2D(iChannel1, uv).x;

    float diff = abs(noiseValue - transition);

    vec2 pixelCoord = gl_FragCoord.xy;

    vec2 gridIndex = floor(vec2(pixelCoord.x + GRID_OFFSET_X, pixelCoord.y + GRID_OFFSET_Y) / CELL_SIZE);

    float index = floor(hash(gridIndex) * 4.0);

    vec3 selected = colorToTransform;
    if(!isSimple) {

        if(index == 0.0) {
            selected = RED_COLOR;
        } else if(index == 1.0) {
            selected = GREEN_COLOR;
        } else if(index == 2.0) {
            selected = BLUE_COLOR;
        } else {
            selected = YELLOW_COLOR;
        }
    }

    float borderFactor = smoothstep(0.0, BORDER_THICKNESS, diff);
    vec3 finalColor;
    if(noiseValue >= transition) {
        finalColor = mix(BORDER_COLOR, color, borderFactor);
    } else {
        finalColor = mix(BORDER_COLOR, selected, borderFactor);
    }

    float brightnessFactor = smoothstep(BORDER_THICKNESS * 0.5, BORDER_THICKNESS, diff);
    vec3 brightBorder = mix(finalColor * vec3(1.5), finalColor, brightnessFactor);

    if(diff < BORDER_THICKNESS) {
        return brightBorder;
    } else {
        return (noiseValue >= transition) ? mix(selected, color, borderFactor) : selected;
    }
}

void main(void) {
    vec2 uv = fragCoord.xy / resolution;

    vec2 uv2 = gl_FragCoord.xy / vec2(screenResolution);
    uv2 = uv2 * textureResolution / screenResolution;

    float timeFactor = time * SPEED;

    vec2 warp = fluidDistortion(uv2, timeFactor);
    vec2 distortedUV = uv2 + warp;

    vec3 finalColor = color;

    finalColor = getColorDuringTransition(uv);

    vec4 textureColor = texture2D(iChannel0, vec2(distortedUV.x - timeFactor, distortedUV.y));
    gl_FragColor = vec4(finalColor * textureColor.xyz * 1.0, 1.0);

}
