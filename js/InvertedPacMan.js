import * as THREE from "../node_modules/three/build/three.module.js";
import { Player } from "./Player.js";

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
	}

	_initRenderer() {
		const canvas = document.querySelector("canvas.webgl");
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		this.renderer.setClearColor(0xd4e6f1, 1);
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

		let light = new THREE.DirectionalLight(0xffffff);
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
		this.scene.add(light);

		this.scene.add(new THREE.CameraHelper(light.shadow.camera));

		light = new THREE.HemisphereLight(0x404040, 0x12782d, 0.5);
		this.scene.add(light);

		//Add a ground plane
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(100, 100, 1, 1),
			new THREE.MeshPhongMaterial({
				color: 0x336600,
			})
		);
		plane.castShadow = false;
		plane.receiveShadow = true;
		plane.rotation.x = -Math.PI / 2;
		this.scene.add(plane);
	}

	_initPlayer(rendererDomElement) {
		this.player = new Player(rendererDomElement);

		addEventListener("playerLoaded", () => {
			this.scene.add(this.player.getPlayerModel);
		});
	}

	_OnWindowResize() {
		this.player.camera.aspect = window.innerWidth / window.innerHeight;
		this.player.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	clock = new THREE.Clock();

	_RAF(time) {
		requestAnimationFrame(() => {
			this.renderer.render(this.scene, this.player.camera);

			let delta = this.clock.getDelta();
			this.player.update(delta);

			this._RAF();
		});
	}
}

new InvertedPacman();
