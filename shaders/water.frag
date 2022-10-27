#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

vec3 color = vec3(0.0, 0.0, 1.0);

// varying vec3 vNormal;

// void main() {
//     DirectionalLightShadow directionalLight = directionalLightShadows[0];

//     float shadow = getShadow(
//         directionalShadowMap[0],
//         directionalLight.shadowMapSize,
//         directionalLight.shadowBias,
//         directionalLight.shadowRadius,
//         vDirectionalShadowCoord[0]
//     );

// 	float NdotL = dot(vNormal, directionalLights[0].direction);
//     float lightIntensity = smoothstep(0.0, 3.0, NdotL * shadow);
//     vec3 light = directionalLights[0].color * lightIntensity;
// 	vec3 hemiLight = hemisphereLights[0].skyColor;

//     gl_FragColor = vec4(color * (light + hemiLight + vec3(0.2, 0.2, 0.2)), 1.0);
// }

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {

	// vec4 tColor = texture2D( texture, vUv );
	// vec4 tColor2 = texture2D( texture2, vUv );

	// hack in a fake pointlight at camera location, plus ambient
	vec3 normal = normalize( vNormal );
	vec3 lightDir = normalize( vViewPosition );

	float dotProduct = max( dot( normal, lightDir ), 0.0 ) + 0.2;

	gl_FragColor = vec4( color * dotProduct, 1.0 );

}