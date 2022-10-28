import * as THREE from "../node_modules/three/build/three.module.js";
import { LoadingScreen } from "./LoadingScreen.js";
import { EffectComposer } from "../node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../node_modules/three/examples/jsm/postprocessing/UnrealBloomPass";
import { Player } from "./Player.js";
import { Skybox } from "./Skybox.js";
import { Level } from "./Level.js";
import { Pacman } from "./Pacman.js";
import { Menu } from "./Menu";

THREE.Cache.enabled = true;

const DEBUG_MODE = false;

const LEVEL_TO_LOAD = "test";

let self;

class InvertedPacman {
	playerPacmanCollision = new Event("playerPacmanCollision");
	paused = false;

	constructor() {
		self = this;
		this.menu = new Menu();
		document.getElementById("play_button").addEventListener("click", () => {
			this.startGame();
			document.getElementById("main_menu").remove();
		});
	}

	startGame() {
		LoadingScreen.init();
		LoadingScreen.set("Initializing...");
		this.update();

		this._init();
	}

	addToScene(object) {
		this.scene.add(object);
	}

	_init() {
		console.log("Initializing Inverted Pacman...");

		this._initRenderer();
		this._initScene();

		addEventListener("pause", self.pauseGame);
	}

	_initRenderer() {
		LoadingScreen.set("Creating renderer...");
		const canvas = document.querySelector("canvas.webgl");
		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
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
		LoadingScreen.set("Creating level...\n(This might take a while!)");
		this.scene = new THREE.Scene();

		const addSun = () => {
			const mapSize = Level.getMapSize;

			// console.log(mapSize);

			this.sun = new THREE.DirectionalLight(0xffffff);
			this.sun.position.set(100, 0, -500);
			this.sun.target.position.set(
				(mapSize.x * Level.getScaleFactor) / 2,
				0,
				(mapSize.y * Level.getScaleFactor) / 2
			);
			this.sun.castShadow = true;
			this.sun.shadow.mapSize.width = 40960;
			this.sun.shadow.mapSize.height = 40960;
			this.sun.shadow.camera.near = 0.1;
			this.sun.shadow.camera.far = 1000;
			this.sun.shadow.camera.left = -mapSize.x * Level.getScaleFactor;
			this.sun.shadow.camera.right = mapSize.x * Level.getScaleFactor;
			this.sun.shadow.camera.top = mapSize.y * Level.getScaleFactor;
			this.sun.shadow.camera.bottom = -mapSize.y * Level.getScaleFactor;
			this.sun.shadow.bias = -0.0001;

			this.scene.add(this.sun.target);
			this.scene.add(this.sun);
		};

		this.scene.fog = new THREE.Fog(0x0c0908, 0, 50);

		let light = new THREE.HemisphereLight(0xa5dfe8, 0x12782d, 0.5);
		// let light = new THREE.AmbientLight(0xbfd7d9, 0.3);
		this.scene.add(light);

		addEventListener("skyboxLoaded", () => {
			this.scene.add(this.skybox.skyGeometry);
		});

		Level.load(LEVEL_TO_LOAD);

		addEventListener("levelLoaded", () => {
			addSun();

			this.scene.add(Level.getLevel);
			this.skybox = new Skybox();

			this._initPlayer();
		});
	}

	_initPostProcessing() {
		LoadingScreen.set("Applying post processing...");
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
		this.scene.add(new THREE.AxesHelper());

		Level.addHelpers();
	}

	_initPlayer() {
		LoadingScreen.set("Creating player...");
		this.player = new Player();

		addEventListener("playerLoaded", () => {
			this.scene.add(this.player.getModel);
			this.scene.add(this.player.getCameraBase);

			this._OnWindowResize();

			this._initPostProcessing();

			this._initPacman();

			if (DEBUG_MODE) this._addDebugShapes();
		});
	}

	_initPacman() {
		LoadingScreen.set("Creating Pacman...");
		this.pacman = new Pacman(this.player.getModel.children[0]);

		addEventListener("pacmanLoaded", () => {
			this.scene.add(this.pacman.getPacmanModel);
			LoadingScreen.remove();
			this.ready = true;
			console.log(this.pacman.model);
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

		if (this.player.boundingBox.intersectsBox(this.pacman.boundingBox)) {
			dispatchEvent(this.playerPacmanCollision);
		}
	}

	updateFog() {
		const lightLevel = this.skybox.getLightIntensity;

		this.scene.fog.far = map(lightLevel, 0, 1, 50, 2000);
	}

	pauseGame() {
		self.paused = !self.paused;
		console.log("Paused: " + self.paused);
		if (!self.paused) self.update(true);
	}

	clock = new THREE.Clock();

	update(deltaReset) {
		requestAnimationFrame(() => {
			if (!this.ready) {
				this.update();
				return;
			}
			let delta = this.clock.getDelta();
			if (this.paused) return;
			if (deltaReset) delta = 0;

			this.player.update(
				delta,
				this.clock.getElapsedTime(),
				this.skybox.getLightIntensity
			);

			this.pacman.update(delta, this.player.getPosition, this.player.model);

			this.skybox.update(delta, this.sun);

			Level.water.update(this.clock.getElapsedTime());

			for (let i = 0; i < Level.coins.length; i++) {
				Level.coins[i].update(delta, this.clock.getElapsedTime());
			}

			this.updateFog();

			console.log("Update");

			this.checkPlayerPacmanCollision();
			this.composer.render(delta);
			this.update();
		});
	}
}

new InvertedPacman();

const map = (value, x1, y1, x2, y2) =>
	((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
