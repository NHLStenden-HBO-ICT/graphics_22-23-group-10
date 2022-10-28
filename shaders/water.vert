
#define PHONG
uniform float time;

varying vec3 vViewPosition;
varying vec3 pos;

const float WAVE_LENGTH = 6.0;
const float AMPLITUDE = 4.0;

const float A1 = 0.3;
const float F1 = 1.3;
const float A2 = 1.0;
const float F2 = 0.1;
const float A3 = 0.1;
const float F3 = 0.4;


#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	float y1 = A1 * sin(F3 * position.x + (time * 2.0) + A2 * cos(F2 * position.z));
	float y2 = A2 * sin(F2 * position.z + time + A3 * cos(F2 * position.z + position.x));
	float newY = y1 + y2 - 0.5;
    newY += (sin((position.x / WAVE_LENGTH) + time) / AMPLITUDE) - (cos((position.z / WAVE_LENGTH) + time) / AMPLITUDE) +(cos(((position.x + position.z) / WAVE_LENGTH) + time) / AMPLITUDE);

    vec3 transformed = vec3(
        position.x,
        position.y + newY,
        position.z
    );

    pos = transformed;

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
