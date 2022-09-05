function main() {
    const canvas = document.querySelector("canvas.webgl");
    const renderer = new THREE.WebGLRenderer({ canvas });

    const fov = 80;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    camera.position.z = 2;
    // camera.position.y = 1;

    const scene = new THREE.Scene();

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    scene.add(createCube(
        new THREE.Vector3(1, 1, 1),
        new THREE.Vector3(1, 0, 0),
        0x44aa88
    ))

    function render(time) {
        time *= 0.001;  // convert time to seconds
       
        // cube.rotation.x = time;
        // cube.rotation.y = time;
       
        renderer.render(scene, camera);
       
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


function createCube(size, pos, color){
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshPhongMaterial({color})
    const cube = new THREE.Mesh(geometry, material);

    cube.position = pos;

    return cube;
}