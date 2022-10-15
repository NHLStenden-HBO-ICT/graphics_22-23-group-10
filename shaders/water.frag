#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

vec3 color = vec3(0.0, 0.0, 1.0);

varying vec3 vNormal;

void main() {
    DirectionalLightShadow directionalLight = directionalLightShadows[0];

    float shadow = getShadow(
        directionalShadowMap[0],
        directionalLight.shadowMapSize,
        directionalLight.shadowBias,
        directionalLight.shadowRadius,
        vDirectionalShadowCoord[0]
    );

	float NdotL = dot(vNormal, directionalLights[0].direction);
    float lightIntensity = smoothstep(0.0, 3.0, NdotL * shadow);
    vec3 light = directionalLights[0].color * lightIntensity;
	vec3 hemiLight = hemisphereLights[0].skyColor;

    gl_FragColor = vec4(color * (light + hemiLight + vec3(0.2, 0.2, 0.2)), 1.0);
}