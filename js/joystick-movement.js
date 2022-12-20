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
 * Basic movement with W/A/S/D keys.
 */
WL.registerComponent('joystick-movement', {
    /** Movement speed in m/s. */
    moveSpeed: { type: WL.Type.Float, default: 0.1 },
    turnAngle: { type: WL.Type.Float, default: 30.0 },
    /** Object of which the orientation is used to determine forward direction */
    headObject: { type: WL.Type.Object }
}, {
    init: function() {
        this.lastTurnTime = 0;
        this.anglePerTurn = 30;
        this.turnIntervalTime = 100;

        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;
    },

    start: function() {
        this.headObject = this.headObject || this.object;
        WL.onXRSessionStart.push(this.setupVREvents.bind(this));
    },

    update: function() {
        if(this.gamepad && this.gamepad.axes) {
            // x-axis (right is positive)
            let currentTime = Date.now();
            let lastTurnTimeGap = Math.abs(currentTime-this.lastTurnTime);

            this.left = false;
            this.right = false;
            if(this.gamepad.axes[2]>0){
                this.left = true;
            }else if(this.gamepad.axes[2]<0){
                this.right = true;
            }
            

            // y-axis (up is negative)
            this.up = false;
            this.down = false;
            if(this.gamepad.axes[3]>0){
                this.down = true;
            }else if(this.gamepad.axes[3]<0){
                this.up = true;
            }

            let direction = [0, 0, 0];
            let angle = 0;

            if (this.up) direction[2] -= 1.0;
            if (this.down) direction[2] += 1.0;
            if (this.left) angle = -this.anglePerTurn;
            if (this.right) angle = this.anglePerTurn;
            
            let xStrength = Math.abs(this.gamepad.axes[2]);
            let yStrength = Math.abs(this.gamepad.axes[3]);

            if(yStrength>xStrength){
                // console.log("y-axis movement");
                glMatrix.vec3.normalize(direction, direction);
                direction[2] *= this.moveSpeed;
                glMatrix.vec3.transformQuat(direction, direction, this.headObject.transformWorld);
                this.headObject.translate(direction);
            }else if(lastTurnTimeGap>this.turnIntervalTime){
                this.headObject.rotateAxisAngleDegObject([0, 1, 0], angle);
                this.lastTurnTime = currentTime;
            }
        }
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

                if(inputSource.handedness == "left") {
                    this.gamepad = inputSource.gamepad;
                }
            }
        }

        s.addEventListener('inputsourceschange', function(e) {
            // console.log("inputsourceschange");
            // console.log("e.added", e.added);

            if(e.added && e.added.length) {
                for(let i = 0; i < e.added.length; i++) {
                    let inputSource = e.added[i];
                    if(inputSource.handedness == "left") {
                        this.gamepad = inputSource.gamepad;
                        console.log("left gamepad added");
                    }
                }
            }
        }.bind(this));
    },
});