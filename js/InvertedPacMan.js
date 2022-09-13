import * as THREE from '../node_modules/three/build/three.module.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { PlayerControls } from './playerControls.js';

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

        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFShadowMap;

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
        light.position.set(-10, 25, -10);
        light.target.position.set(0, 0, 0);
        light.castShadow = true;
        light.shadow.mapSize.width = 4096 * 2;
        light.shadow.mapSize.height = 4096 * 2;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 1000;
        light.shadow.camera.left = -50;
        light.shadow.camera.right = 50;
        light.shadow.camera.top = 50;
        light.shadow.camera.bottom = -50;
        light.shadow.bias = -0.001;
        this._scene.add(light);

        this._scene.add(new THREE.CameraHelper(light.shadow.camera));

        light = new THREE.AmbientLight(0x404040);
        this._scene.add(light);

        //Add a ground plane
        const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100, 1, 1),
        new THREE.MeshPhongMaterial({
            color: 0x336600
        }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI /2;
        this._scene.add(plane);

        
        //Add a temporary cube for testing
        const cube = this.createCube(
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(3, 3.5, -3),
            0xff0000
            );
        cube.castShadow = true;
        cube.receiveShadow = true;
        this._scene.add(cube);
        
        this._RAF();
        this._camera.lookAt(new THREE.Vector3());
        
        this.createPlayer(this);
    }

    createPlayer(game){
        new GLTFLoader().load('../models/ghost.gltf', function (gltf){
            const model = gltf.scene;
            model.scale.set(0.1, 0.1, 0.1);
            // model.translateY(0.5);
            // model.translateX(5);
            model.rotateY(90);
            model.traverse(function (object){
                if (object.isMesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            })
            const controls = new OrbitControls(game._camera, game._renderer.domElement);
            // controls.enablePan = false;
            // controls.enableZoom = false;
            game._scene.add(model)
            const playerControls = new PlayerControls(model, controls, game._camera);
        });


        


        const keysPressed = {};

        document.addEventListener('keydown' , (event) => {
            if (event.shiftKey) {
                //Shift
            } else {
                (keysPressed)[event.key.toLowerCase()] = true
            }
        }, false);

        document.addEventListener('keyup' , (event) => {
            (keysPressed)[event.key.toLowerCase()] = false
        }, false);
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

        this._RAF();
        });
    }
}

new InvertedPacman();