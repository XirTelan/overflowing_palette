precision mediump float;

uniform vec2 resolution;
uniform vec3 color;
uniform float time;
uniform float radius;
uniform float transition;

varying vec2 fragCoord;

float getColor(vec2 uv, vec2 point) {
    float d = distance(uv, point);
    return d > radius ? 0.0 : 1.0;
}

void main(void) {
    vec4 colorN = vec4(1, 1, 1, 1);
    vec2 uv = fragCoord.xy / resolution;
    float d = distance(vec2(0.5, 0.5), uv);

    if(radius == 0.0) {
        gl_FragColor = vec4(color, 1);
        return;
    }

    vec2 lt_c = vec2(radius, 1.0 - radius);
    vec2 rt_c = vec2(1.0 - radius, 1.0 - radius);
    vec2 lb_c = vec2(radius, radius);
    vec2 rb_c = vec2(1.0 - radius, radius);
    float alpha = 1.0;

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

    gl_FragColor = vec4(color * alpha, alpha);

    // gl_FragColor = mix(vec4(0, 0, 0, 0), vec4(1, 1, 1, 1), uv.y);
}
