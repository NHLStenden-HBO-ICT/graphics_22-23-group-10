#include <common>
#include <shadowmap_pars_vertex>

uniform float u_time;

varying vec3 vNormal;
// varying vec3 vViewDir;

void main() {
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>

    #include <begin_vertex>

    #include <worldpos_vertex>
    #include <shadowmap_vertex>

    // Wave on lower part
    vec4 result;
    if (position.y < 0.0){
        result = vec4(
            position.x + cos((position.x * 4.0) + u_time * 5.0) / 1.0 * 0.2,
            position.y, 
            position.z, // + cos((position.z * 5.0) + u_time * 2.0) / 1.0 * 0.2,
            1.0
        );
    }
    else{
        result = vec4(position.x, position.y, position.z, 1.0);
    }

    vec4 modelPosition = modelMatrix * result;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    vNormal = normalize(normalMatrix * normal);
    // vViewDir = normalize(-viewPosition.xyz);

    gl_Position = clipPosition;

}