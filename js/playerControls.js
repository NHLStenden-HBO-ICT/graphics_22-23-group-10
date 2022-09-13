import * as THREE from '../node_modules/three/build/three.module.js';

export class PlayerControls{

    Actions = Object.freeze({
        IDLE: Symbol(0),
        WALK: Symbol(1)
    });
    
    orbitControl;
    camera;
    model;
    currentAction = this.Actions.IDLE;

    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuaternion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();

    walkVelocity = 2;

    constructor(model, orbitControl, camera){
        this.model = model;
        this.orbitControl = orbitControl;
        this.camera = camera;
    }

    update(delta, keysPressed){
        const directionPressed = DIRECTIONS.some(key => keysPressed[key] == true)

        if (directionPressed){
            this.currentAction = this.Actions.WALK;
        }
        else{
            this.currentAction = this.Actions.IDLE;
        }


        if (this.currentAction == this.Actions.WALK){
            let cameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            )

            let directionOffset = this.directionOffset(keysPressed);
            this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, cameraDirection + directionOffset);
            this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);
        }
    }

    directionOffset(keysPressed) {
        var directionOffset = 0 // w
        if (keysPressed[W]) {
        if(keysPressed[A]) {
        directionOffset = Math.PI / 4 // w+a
        } else if (keysPressed[D]) {
        directionOffset = - Math.PI /4 // w+d
        }
        else if(keysPressed[S]) { I
        if(keysPressed[A]) {
        directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
        } else if(keysPressed[D]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
        } else {
        directionOffset = Math.PI // S
        }
        } else if(keysPressed[A]) {
        directionOffset = Math.PI / 2 // a
        } else if (keysPressed[D]) {
        directionOffset = - Math.PI / 2 // d
        }
        return directionOffset
    }}
}