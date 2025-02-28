precision mediump float;

uniform vec2 resolution;
uniform vec3 color;
uniform vec3 colorToTransform;
uniform float time;
uniform bool active;
uniform bool transparent;
uniform float radius;
uniform float transition;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

float speed = 0.1;
float borderThickness = 0.05;
vec3 borderColor = vec3(1.0);

varying vec2 fragCoord;

float getColor(vec2 uv, vec2 point) {
    float d = distance(uv, point);
    return d > radius ? 0.0 : 1.0;
}

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

vec3 lighten(vec3 color, float factor) {
    return mix(color, vec3(1.0), factor);
}

vec2 fluidDistortion(vec2 uv, float time) {
    float n = perlinNoise(uv * 5.0 + time);
    float angle = n * 6.28318;
    vec2 offset = vec2(cos(angle), sin(angle)) * 0.1;
    return offset;
}

void main(void) {

    vec2 uv = fragCoord.xy / resolution;

    vec2 lt_c = vec2(radius, 1.0 - radius);
    vec2 rt_c = vec2(1.0 - radius, 1.0 - radius);
    vec2 lb_c = vec2(radius, radius);
    vec2 rb_c = vec2(1.0 - radius, radius);

    float d = distance(vec2(0.5, 0.5), uv);
    // smoothstep()
    float alpha = 1.0;
    // float alpha = 1.0;

    if(uv.x <= lt_c.x && uv.y >= lt_c.y) {
        alpha = getColor(uv, lt_c);
    }

    if(uv.x >= rt_c.x && uv.y >= rt_c.y) {
        alpha = getColor(uv, rt_c);
    }
    if(uv.x <= lb_c.x && uv.y <= lb_c.y) {
        alpha = getColor(uv, lb_c);
    }
    if(uv.x >= rb_c.x && uv.y <= rb_c.y) {
        alpha = getColor(uv, rb_c);
    }
    float overAlpha = 0.0;

    if(alpha != 0.0 && active)
        overAlpha = mix(vec3(0.0), vec3(1.0), smoothstep(0.4, 0.8, d)).x;
    //window space
    vec2 uv2 = gl_FragCoord.xy / vec2(1024, 768);

    float timeFactor = time * speed;

    vec2 warp = fluidDistortion(uv2, timeFactor);
    vec2 distortedUV = uv2 + warp;
    float noiseValue = texture2D(iChannel1, uv).x;

    vec3 finalColor;

    float diff = abs(noiseValue - transition);

    if(transition > 0.0 && transition < 1.0 && diff < borderThickness) {
        finalColor = borderColor;
    } else {
        finalColor = (noiseValue >= transition) ? color : colorToTransform;
    }

    if(transparent) {
        gl_FragColor = vec4(color * overAlpha * 2.0, overAlpha);
        return;
    }
    vec4 textureColor = texture2D(iChannel0, vec2(distortedUV.x + timeFactor * 0.1, distortedUV.y));
    gl_FragColor = vec4(finalColor * alpha * lighten(textureColor.xyz, 0.4) + overAlpha, alpha);

}
