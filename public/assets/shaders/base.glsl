precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 screenResolution;

uniform vec3 color;

uniform vec2 startPoint;
uniform vec2 curPoint;

uniform vec3 colorToTransform;

uniform bool active;
uniform vec2 activeOffset;

uniform bool transparent;
uniform float radius;
uniform float transition;

uniform sampler2D iChannel0; // main texture
uniform sampler2D iChannel1; //cell noise
uniform sampler2D iChannel2; // cell noise diagonal
uniform sampler2D iChannel3; // cell noise center

float speed = 0.05;
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
    float n = perlinNoise(uv * 7.0 + time);
    float angle = n * 6.28318;
    vec2 offset = vec2(cos(angle), sin(angle)) * 0.1;
    return offset;
}

int getDirection(vec2 start, vec2 end) {
    vec2 delta = end - start; 

    // Directions:
    // 1 = Up, 2 = Down, 3 = Left, 4 = Right, 
    // 5 = Up-Left, 6 = Up-Right, 7 = Down-Left, 8 = Down-Right, 0 = Same Position

    if(start == end) {
        return 0;
    }

    if(delta.x == 0.0 && delta.y > 0.0) {
        return 4;
    }
    if(delta.x == 0.0 && delta.y < 0.0) {
        return 3;
    }
    if(delta.y == 0.0 && delta.x > 0.0) {
        return 1;
    }
    if(delta.y == 0.0 && delta.x < 0.0) {
        return 2;
    }

    if(delta.x > 0.0 && delta.y > 0.0) {
        return 8;
    }
    if(delta.x > 0.0 && delta.y < 0.0) {
        return 7;
    }
    if(delta.x < 0.0 && delta.y > 0.0) {
        return 5;
    }
    if(delta.x < 0.0 && delta.y < 0.0) {
        return 6;
    }
    return 0;
}

vec3 getColorDuringTransition(vec2 uv) {
    int direction = getDirection(startPoint, curPoint);

    vec2 center = vec2(0.5, 0.5);

    float angle = 0.0;

    if(direction == 1 || direction == 7) {
        angle = -1.5708;
    }

    if(direction == 2 || direction == 5) {
        angle = 1.5708;
    }
    if(direction == 3 || direction == 6) {
        angle = 1.5708 * 2.0;
    }

    if(angle != 0.0) {

    // Rotation matrix
        float cosTheta = cos(angle);
        float sinTheta = sin(angle);
        mat2 rotationMatrix = mat2(cosTheta, -sinTheta, sinTheta, cosTheta);

    // Apply rotation
        uv = rotationMatrix * (uv - center);
        uv += center;
    // Translate back
    }

    float noiseValue;

    if(direction == 0) {
        noiseValue = texture2D(iChannel3, uv).x;
    } else if(direction >= 5) {
        noiseValue = texture2D(iChannel2, uv).x;
    } else {
        noiseValue = texture2D(iChannel1, uv).x;
    }

    float diff = abs(noiseValue - transition);

    if(diff < borderThickness) {
        return borderColor;
    } else {
        return (noiseValue >= transition) ? color : colorToTransform;
    }
}

float getAlphaOnCorners(vec2 uv) {
    vec2 lt_c = vec2(radius, 1.0 - radius);
    vec2 rt_c = vec2(1.0 - radius, 1.0 - radius);
    vec2 lb_c = vec2(radius, radius);
    vec2 rb_c = vec2(1.0 - radius, radius);

    if(uv.x <= lt_c.x && uv.y >= lt_c.y) {
        return getColor(uv, lt_c);
    }

    if(uv.x >= rt_c.x && uv.y >= rt_c.y) {
        return getColor(uv, rt_c);
    }
    if(uv.x <= lb_c.x && uv.y <= lb_c.y) {
        return getColor(uv, lb_c);
    }
    if(uv.x >= rb_c.x && uv.y <= rb_c.y) {
        return getColor(uv, rb_c);
    }
    return 1.0;
}

void main(void) {

    vec2 uv = fragCoord.xy / resolution;

    float d = distance(vec2(0.5, 0.5), uv);

    float alpha = getAlphaOnCorners(uv);

    float overAlpha = 0.0;

    if(alpha != 0.0 && active)
        overAlpha = mix(vec3(0.0), vec3(1.0), smoothstep(activeOffset.x, activeOffset.y, d)).x;

    //window space
    vec2 uv2 = gl_FragCoord.xy / vec2(screenResolution);

    float timeFactor = time * speed;

    vec2 warp = fluidDistortion(uv2, timeFactor);
    vec2 distortedUV = uv2 + warp;

    vec3 finalColor = color;

    if(transition > 0.0 && transition < 1.0) {
        finalColor = getColorDuringTransition(uv);
    }

    if(transparent) {
        gl_FragColor = vec4(color * overAlpha * 2.0, overAlpha);
        return;
    }
    vec4 textureColor = texture2D(iChannel0, vec2(distortedUV.x + timeFactor, distortedUV.y));
    gl_FragColor = vec4(finalColor * alpha * lighten(textureColor.xyz, 0.2) + overAlpha, alpha);

}
