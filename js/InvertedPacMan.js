import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "../node_modules/three/build/three.module.js";
import { Player } from "./Player.js";
import { Skybox } from "./Skybox.js";

THREE.Cache.enabled = true;

class InvertedPacman {
	constructor() {
		this._init();

		this._RAF();
	}

	_init() {
		console.log("Initializing Inverted Pacman...");

		this._initRenderer();
		this._initScene();
		this._initPlayer(this.renderer.domElement);
		// this._initDebugCam();
		this._OnWindowResize();
	}

	_initRenderer() {
		const canvas = document.querySelector("canvas.webgl");
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		// this.renderer.setClearColor(0xd4e6f1, 1);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(innerWidth, innerHeight);

		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFShadowMap;

		window.addEventListener(
			"resize",
			() => {
				this._OnWindowResize();
			},
			false
		);
	}

	_initScene() {
		this.scene = new THREE.Scene();

		this.sun = new THREE.DirectionalLight(0xffffff);
		this.sun.position.set(0, 1, 0);
		this.sun.target.position.set(0, 0, 0);
		this.sun.castShadow = true;
		this.sun.shadow.mapSize.width = 4096 * 2;
		this.sun.shadow.mapSize.height = 4096 * 2;
		this.sun.shadow.camera.near = 0.1;
		this.sun.shadow.camera.far = 1000;
		this.sun.shadow.camera.left = -50;
		this.sun.shadow.camera.right = 50;
		this.sun.shadow.camera.top = 50;
		this.sun.shadow.camera.bottom = -50;
		this.sun.shadow.bias = -0.0001;
		this.scene.add(this.sun);

		// this.scene.add(new THREE.CameraHelper(light.shadow.camera));

		let light = new THREE.HemisphereLight(0x404040, 0x12782d, 0.5);
		this.scene.add(light);

		//Add a ground plane
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(100, 100, 1, 1),
			new THREE.MeshPhongMaterial({
				color: 0x336600,
			})
		);
		// plane.castShadow = false;
		plane.receiveShadow = true;
		plane.rotation.x = -Math.PI / 2;
		this.scene.add(plane);

		this.skybox = new Skybox();

		addEventListener("skyboxLoaded", () => {
			this.scene.add(this.skybox.skyGeometry);
		});
	}

	_initPlayer(rendererDomElement) {
		this.player = new Player(rendererDomElement);

		addEventListener("playerLoaded", () => {
			this.scene.add(this.player.getPlayerModel);
		});
	}

	_initDebugCam() {
		const fov = 80;
		const aspect = 2;
		const near = 0.1;
		const far = 1000.0;
		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.camera.position.set(0, 10, 10);
		this.camera.lookAt(new THREE.Vector3());

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
	}

	_OnWindowResize() {
		this.player.camera.aspect = window.innerWidth / window.innerHeight;
		this.player.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	clock = new THREE.Clock();

	_RAF() {
		requestAnimationFrame(() => {
			this.renderer.render(this.scene, this.player.camera);
			// this.renderer.render(this.scene, this.camera);
			let delta = this.clock.getDelta();
			// delta = THREE.getDelta();

			this.player.update(delta);
			this.skybox.update(delta, this.sun);

			this._RAF();
			console.log(THREE.getFPS());
		});
	}
}

new InvertedPacman();
