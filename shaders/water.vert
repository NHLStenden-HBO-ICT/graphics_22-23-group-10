#include <common>
#include <shadowmap_pars_vertex>

uniform float u_time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {

	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

	vUv = uv;
	vNormal = normalize( normalMatrix * normal );
	vViewPosition = -mvPosition.xyz;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}

// varying vec3 vNormal;
// // varying vec3 vViewDir;

// void main() {
//     #include <beginnormal_vertex>
//     #include <defaultnormal_vertex>

//     #include <begin_vertex>

//     #include <worldpos_vertex>
//     #include <shadowmap_vertex>

//     vec4 result = vec4(
//         position.x,
//         cos((position.x / 2.0) + u_time) / 4.0,
//         position.z,
//         1.0
//     );

//     vec4 modelPosition = modelMatrix * result;
//     vec4 viewPosition = viewMatrix * modelPosition;
//     vec4 clipPosition = projectionMatrix * viewPosition;

//     vNormal = normalize(normalMatrix * normal);

//     gl_Position = clipPosition;
// }