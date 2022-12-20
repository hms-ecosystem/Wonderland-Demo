/*
    Copyright 2021. Futurewei Technologies Inc. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    http:  www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
/**
 * Teleport VR locomotion.
 *
 * Disabled for nonVR use.
 * 
 * See [Teleport Example](/showcase/teleport).
 */
 WL.registerComponent('teleport-custom', {
    /** Object that will be placed as indiciation forwhere the player will teleport to. */
    teleportIndicatorMeshObject: { type: WL.Type.Object },
    /** Root of the player, the object that will be positioned on teleportation. */
    camRoot: { type: WL.Type.Object },
    /** Left eye for use in VR*/
    eyeLeft: { type: WL.Type.Object },
    /** Right eye for use in VR*/
    eyeRight: { type: WL.Type.Object },
    /** Handedness for VR cursors to accept trigger events only from respective controller. */
    handedness: {type: WL.Type.Enum, values: ['input component', 'left', 'right', 'none'], default: 'input component'},
    /** Collision group of valid "floor" objects that can be teleported on */
    floorGroup: { type: WL.Type.Int, default: 1 },
    /** How far the thumbstick needs to be pushed to have the teleport target indicator show up */
    thumbstickActivationThreshhold: { type: WL.Type.Float, default: -0.7 },
    /** How far the thumbstick needs to be released to execute the teleport */
    thumbstickDeactivationThreshhold: { type: WL.Type.Float, default: 0.3 },
    /** Offset to apply to the indicator object, e.g. to avoid it from Z-fighting with the floor */
    indicatorYOffset: { type: WL.Type.Float, default: 0.01 },

    /** Mode for raycasting, whether to use PhysX or simple collision components */
    rayCastMode: {type: WL.Type.Enum, values: ['collision', 'physx'], default: 'collision'},
    /** Max distance for PhysX raycast */
    maxDistance: { type: WL.Type.Float, default: 100.0 },
}, {
    init: function() {
        this._prevThumbstickAxis = new Float32Array(2);
        this._tempVec = new Float32Array(3);
        this._tempVec0 = new Float32Array(3);
        this._currentIndicatorRotation = 0;

        this.input = this.object.getComponent('input');
        if(!this.input) {
            console.error(this.object.name, "generic-teleport-component.js: input component is required on the object")
            return;
        }
        if(!this.teleportIndicatorMeshObject) {
            console.error(this.object.name, 'generic-teleport-component.js: Teleport indicator mesh is missing');
            return;
        }
        if(!this.camRoot) {
            console.error(this.object.name, 'generic-teleport-component.js: camRoot not set');
            return;
        }
        this.isIndicating = false;

        this.indicatorHidden = true;
        this.hitSpot = new Float32Array(3);
        this._hasHit = false;

        this._extraRotation = 0;
        this._currentStickAxes = new Float32Array(2);
    },

    start: function() {
        if(this.handedness == 0) {
            const inputComp = this.object.getComponent('input');
            if(!inputComp) {
                console.warn('teleport component on object', this.object.name,
                    'was configured with handedness "input component", ' +
                    'but object has no input component.');
            } else {
                this.handedness = inputComp.handedness;
                this.input = inputComp;
            }
        } else {
            this.handedness = ['left', 'right'][this.handedness - 1];
        }

        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
        this.teleportIndicatorMeshObject.active = false;
    },

    /* Get current camera Y rotation */
    _getCamRotation: function() {
        this.eyeLeft.getForward(this._tempVec);
        this._tempVec[1] = 0;
        glMatrix.vec3.normalize(this._tempVec, this._tempVec);
        return Math.atan2(this._tempVec[0], this._tempVec[2]);
    },

    update: function() {
        let inputLength = 0;
        if(this.gamepad && this.gamepad.axes) {
            this._currentStickAxes[0] = this.gamepad.axes[2];
            this._currentStickAxes[1] = this.gamepad.axes[3];
            inputLength = Math.abs(this._currentStickAxes[0]) + Math.abs(this._currentStickAxes[1]);
        }

        if(!this.isIndicating && this._prevThumbstickAxis[1] >= this.thumbstickActivationThreshhold && this._currentStickAxes[1] < this.thumbstickActivationThreshhold) {
            this.isIndicating = true;
        } else if(this.isIndicating && inputLength < this.thumbstickDeactivationThreshhold) {
            this.isIndicating = false;
            this.teleportIndicatorMeshObject.active = false;

            if(this._hasHit) {
                this._teleportPlayer(this.hitSpot, this._extraRotation);
            }
        }

        if(this.isIndicating && this.teleportIndicatorMeshObject && this.input) {
            const origin = this._tempVec0;
            glMatrix.quat2.getTranslation(origin, this.object.transformWorld);

            const direction = this.object.getForward(this._tempVec)
            let rayHit = this.rayHit = (this.rayCastMode == 0) ?
                WL.scene.rayCast(origin, direction, 1 << this.floorGroup) :
                WL.physics.rayCast(origin, direction, 1 << this.floorGroup, this.maxDistance);
            if(rayHit.hitCount > 0) {
                this.indicatorHidden = false;

                this._extraRotation = Math.PI + Math.atan2(this._currentStickAxes[0], this._currentStickAxes[1]);
                this._currentIndicatorRotation = this._getCamRotation() + (this._extraRotation - Math.PI);
                this.teleportIndicatorMeshObject.resetTranslationRotation();
                this.teleportIndicatorMeshObject.rotateAxisAngleRad([0, 1, 0], this._currentIndicatorRotation);

                this.teleportIndicatorMeshObject.translate(rayHit.locations[0]);
                this.teleportIndicatorMeshObject.translate([0.0, this.indicatorYOffset, 0.0]);
                this.teleportIndicatorMeshObject.active = true;

                this.hitSpot.set(rayHit.locations[0]);
                this._hasHit = true;
            } else {
                if(!this.indicatorHidden) {
                    this.teleportIndicatorMeshObject.active = false;
                    this.indicatorHidden = true;
                }
                this._hasHit = false;
            }
        }

        this._prevThumbstickAxis.set(this._currentStickAxes);
    },
    setupVREvents: function(s) {
        /* If in VR, one-time bind the listener */
        this.session = s;
        s.addEventListener('end', function() {
            /* Reset cache once the session ends to rebind select etc, in case
             * it starts again */
            this.gamepad = null;
            this.session = null;
        }.bind(this));

        if(s.inputSources && s.inputSources.length) {
            for(let i = 0; i < s.inputSources.length; i++) {
                let inputSource = s.inputSources[i];

                if(inputSource.handedness == this.handedness) {
                    this.gamepad = inputSource.gamepad;
                }
            }
        }

        s.addEventListener('inputsourceschange', function(e) {
            if(e.added && e.added.length) {
                for(let i = 0; i < e.added.length; i++) {
                    let inputSource = e.added[i];
                    if(inputSource.handedness == this.handedness) {
                        this.gamepad = inputSource.gamepad;
                    }
                }
            }
        }.bind(this));
    },
    _teleportPlayer: function(newPosition, rotationToAdd) {
        this.camRoot.rotateAxisAngleRad([0, 1, 0], rotationToAdd);

        const p = this._tempVec;
        const p1 = this._tempVec0;

        if(this.session) {
            this.eyeLeft.getTranslationWorld(p);
            this.eyeRight.getTranslationWorld(p1);

            glMatrix.vec3.add(p, p, p1);
            glMatrix.vec3.scale(p, p, 0.5);
        } else {
            this.cam.getTranslationWorld(p);
        }

        this.camRoot.getTranslationWorld(p1);
        glMatrix.vec3.sub(p, p1, p);
        p[0] += newPosition[0];
        p[1] = newPosition[1];
        p[2] += newPosition[2];

        this.camRoot.setTranslationWorld(p);
    },
});