precision mediump float;

uniform vec2 resolution;
uniform vec3 color;
uniform float time;
uniform bool isCircle;

varying vec2 fragCoord;

void main(void) {

    // bool isCircle = true;

    if(isCircle) {

        vec2 uv = fragCoord.xy / resolution;
        vec2 center = vec2(0.5, 0.5);

        float d = distance(uv, center); 
        gl_FragColor = d > 0.5 ? vec4(color * 0.0, 0.0) : vec4(color, 1);
    } else {
        gl_FragColor = vec4(color, 1);

    }
}
