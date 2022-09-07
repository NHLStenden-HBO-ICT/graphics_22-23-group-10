import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class InvertedPacman{
    constructor(){
        this._Init();
    }

    _Init(){
        console.log("Initializing game...")
        const canvas = document.querySelector("canvas.webgl");
        this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this._renderer.setClearColor(0xD4E6F1, 1);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.setSize(innerWidth, innerHeight);

        window.addEventListener("resize", () => {
            this._OnWindowResize();
        }, false);

        const fov = 80;
        const aspect = 2;
        const near = 0.1;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(5, 10, 15);

        this._scene = new THREE.Scene();

        let light = new THREE.DirectionalLight(0xFFFFFF);
        light.position.set(100, 100, 100);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.bias = -0.01;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 1.0;
        light.shadow.camera.far = 500;
        light.shadow.camera.left = 200;
        light.shadow.camera.right = -200;
        light.shadow.camera.top = 200;
        light.shadow.camera.bottom = -200;
        this._scene.add(light);
        light = new THREE.AmbientLight(0x404040);
        this._scene.add(light);

        const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        new THREE.MeshPhongMaterial({
            color: 0x336600
        }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI /2;
        this._scene.add(plane);

        const cube = this.createCube(
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(0, 0.5, 0),
            0xff0000
            );
        
        this._scene.add(cube);
        this._RAF();

        console.log(this._scene.children)
    }

    createCube(size, pos, color) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshPhongMaterial({ color })
        const cube = new THREE.Mesh(geometry, material);
    
        cube.position.set(pos.x, pos.y, pos.z);
    
        return cube;
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        }
    
    _RAF(time) {
        requestAnimationFrame(() => {
        this._renderer.render(this._scene, this._camera);
        time *= 0.001;

        this._camera.lookAt(new THREE.Vector3());


        this._RAF();
        });
    }
}

const game = new InvertedPacman();