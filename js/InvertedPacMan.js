import * as THREE from "../node_modules/three/build/three.module.js";
import { EffectComposer } from "../node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass";
import { Player } from "./Player.js";
import { Skybox } from "./Skybox.js";
import { Level } from "./Level.js";
import { Pacman } from "./Pacman.js";

THREE.Cache.enabled = true;

const DEBUG_MODE = false;

const LEVEL_TO_LOAD = "test2";

class InvertedPacman {
	playerPacmanCollision = new Event("playerPacmanCollision");

	constructor() {
		this._init();

		this.update();
	}

	_init() {
		console.log("Initializing Inverted Pacman...");

		this._initRenderer();
		this._initScene();
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

		this.scene.fog = new THREE.Fog(0x0c0908, 0, 50);

		this.sun = new THREE.DirectionalLight(0xffffff);
		this.sun.position.set(0, 1, 0);
		this.sun.target.position.set(0, 0, 0);
		this.sun.castShadow = true;
		this.sun.shadow.mapSize.width = 40960;
		this.sun.shadow.mapSize.height = 40960;
		this.sun.shadow.camera.near = 0.1;
		this.sun.shadow.camera.far = 1000;
		this.sun.shadow.camera.left = -200;
		this.sun.shadow.camera.right = 200;
		this.sun.shadow.camera.top = 200;
		this.sun.shadow.camera.bottom = -200;
		this.sun.shadow.bias = -0.0001;
		this.scene.add(this.sun);

		let light = new THREE.HemisphereLight(0xa5dfe8, 0x12782d, 0.5);
		// let light = new THREE.AmbientLight(0xbfd7d9, 0.3);
		this.scene.add(light);

		this.skybox = new Skybox();

		addEventListener("skyboxLoaded", () => {
			this.scene.add(this.skybox.skyGeometry);
		});

		Level.load(LEVEL_TO_LOAD);

		addEventListener("levelLoaded", () => {
			this.scene.add(Level.getLevel);

			this._initPlayer();

			this._initPacman();
		});
	}

	_initPostProcessing() {
		this.composer = new EffectComposer(this.renderer);
		const renderPass = new RenderPass(this.scene, this.player.camera);
		const unrealBloom = new UnrealBloomPass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			1,
			0.1,
			0.99
		);

		this.composer.addPass(renderPass);
		this.composer.addPass(unrealBloom);
	}

	_addDebugShapes() {
		this.playerBoxHelper = new THREE.Box3Helper(
			this.player.boundingBox,
			0xff0000
		);
		this.pacmanBoxHelper = new THREE.Box3Helper(
			this.pacman.boundingBox,
			0xff0000
		);
		this.scene.add(this.playerBoxHelper);
		this.scene.add(this.pacmanBoxHelper);

		this.scene.add(new THREE.CameraHelper(this.sun.shadow.camera));

		this.scene.add(new THREE.SpotLightHelper(this.player.lamp));

		Level.addHelpers();
	}

	_initPlayer() {
		this.player = new Player();

		addEventListener("playerLoaded", () => {
			this.scene.add(this.player.getModel);
			this.scene.add(this.player.getCameraBase);

			this._OnWindowResize();

			this.ready = true;

			this._initPostProcessing();

			if (DEBUG_MODE) this._addDebugShapes();
		});
	}

	_initPacman() {
		this.pacman = new Pacman();

		addEventListener("pacmanLoaded", () => {
			this.scene.add(this.pacman.getPacmanModel);
		});
	}

	_OnWindowResize() {
		this.player.camera.aspect = window.innerWidth / window.innerHeight;
		this.player.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	checkPlayerPacmanCollision() {
		if (!this.player.ready || !this.pacman.ready) {
			return;
		}

		this.player.boundingBox.setFromObject(this.player.model);
		this.pacman.boundingBox.setFromObject(this.pacman.model);

		// this.playerBoxHelper.box = this.player.boundingBox;
		// this.pacmanBoxHelper.box = this.pacman.boundingBox;

		if (this.player.boundingBox.intersectsBox(this.pacman.boundingBox)) {
			dispatchEvent(this.playerPacmanCollision);
		}
	}

	updateFog() {
		const lightLevel = this.skybox.getLightIntensity;

		this.scene.fog.far = map(lightLevel, 0, 1, 50, 500);
	}

	clock = new THREE.Clock();

	update() {
		requestAnimationFrame(() => {
			if (!this.ready) {
				this.update();
				return;
			}
			let delta = this.clock.getDelta();

			this.player.update(
				delta,
				this.clock.getElapsedTime(),
				this.skybox.getLightIntensity
			);

			this.pacman.update(delta, this.player.getPosition, this.player.model);

			this.skybox.update(delta, this.sun);

			this.updateFog();

			this.checkPlayerPacmanCollision();

			this.scene.remove(this.line);

			const points = [];
			points.push(this.pacman.raycastOrigin);
			points.push(this.pacman.raycastEnd);

			const material = new THREE.LineBasicMaterial({
				color: 0xee00ff,
				linewidth: 10,
			});
			const geom = new THREE.BufferGeometry().setFromPoints(points);
			this.line = new THREE.Line(geom, material);
			// this.line.position.set(this.pacman.model.position);
			this.scene.add(this.line);

			// console.log(this.line);

			// this.renderer.render(this.scene, this.player.camera);
			this.composer.render(delta);
			this.update();
		});
	}
}

new InvertedPacman();

const map = (value, x1, y1, x2, y2) =>
	((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
