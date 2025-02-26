export const simpleColor = `
precision mediump float;

uniform vec2 resolution;
uniform vec3 color;
uniform float time;

varying vec2 fragCoord;

void main(void) {

    vec2 uv = fragCoord / resolution.xy;
    gl_FragColor = vec4(color.x, color.y, color.z, 1);
}`;
