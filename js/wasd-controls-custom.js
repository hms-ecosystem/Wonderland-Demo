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
WL.registerComponent('wasd-controls-custom', {
    /** Movement speed in m/s. */
    speed: { type: WL.Type.Float, default: 0.1 },
    /** Object of which the orientation is used to determine forward direction */
    headObject: { type: WL.Type.Object }
}, {
    init: function() {
        this.up = false;
        this.right = false;
        this.down = false;
        this.left = false;

        window.addEventListener('keydown', this.press.bind(this));
        window.addEventListener('keyup', this.release.bind(this));
    },

    update: function() {

        if(this.up || this.right || this.down || this.left /* only move if key is pressed */){
            let direction = [0, 0, 0];

            let forwardVec = [];
            this.object.getForward(forwardVec); /* Get player forward */
            forwardVec[1]=0; /* Ignore height */
            let backVec = [0, 0, 0];

            if(forwardVec[2]==1 /* if z = +1 */){
                forwardVec[2] = this.speed;
                backVec = [0, 0, -this.speed];
            }else if(forwardVec[2]==-1 /* if z = -1 */){
                forwardVec[2] = -this.speed;
                backVec = [0, 0, this.speed];
            }else /* calculate for all other cases */ {
                let angle = glMatrix.vec3.angle([0,0,-1],forwardVec); /* Get angle relative to -Z */

                let xPolarity = -1;
                let zPolarity = -1;

                if(forwardVec[0]>0) xPolarity = 1;
                if(forwardVec[2]>0) zPolarity = 1;

                //set x-magnitude for forward and back
                forwardVec[0] = xPolarity*Math.abs(Math.sin(angle))*this.speed;
                backVec[0] = -forwardVec[0];
                //set z-magnitude for forward and back
                forwardVec[2] = zPolarity*Math.abs(Math.cos(angle))*this.speed;
                backVec[2] = -forwardVec[2];
            }
            let rightVec = [];
            this.object.getRight(rightVec);
            rightVec[1]=0;
            let leftVec = [0, 0, 0];
            if(rightVec[0]==1){
                rightVec[0] = this.speed;
                leftVec = [-this.speed, 0, 0];
            }else if(rightVec[0]==-1){
                rightVec[0] = -this.speed;
                leftVec = [this.speed, 0, 0];
            }else{
                let angle = glMatrix.vec3.angle([-1,0,0],rightVec);
                let xPolarity = -1;
                let zPolarity = -1;
                //set x-magnitude for forward and back
                if(rightVec[0]>0) xPolarity = 1;
                rightVec[0] = xPolarity*Math.abs(Math.cos(angle))*this.speed;
                leftVec[0] = -rightVec[0];
                //set z-magnitude for forward and back
                if(rightVec[2]>0) zPolarity = 1;
                rightVec[2] = zPolarity*Math.abs(Math.sin(angle))*this.speed;
                leftVec[2] = -rightVec[2];
            }

            if (this.up) glMatrix.vec3.add(direction, direction, forwardVec);
            if (this.down) glMatrix.vec3.add(direction, direction, backVec);
            if (this.left) glMatrix.vec3.add(direction, direction, leftVec);
            if (this.right) glMatrix.vec3.add(direction, direction, rightVec);

            this.headObject.translate(direction);
        }
    },

    press: function(e) {
        if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */ ) {
            this.up = true
        } else if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */ ) {
            this.right = true
        } else if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */ ) {
            this.down = true
        } else if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */ ) {
            this.left = true
        }
    },

    release: function(e) {
        if (e.keyCode === 38 /* up */ || e.keyCode === 87 /* w */ || e.keyCode === 90 /* z */ ) {
            this.up = false
        } else if (e.keyCode === 39 /* right */ || e.keyCode === 68 /* d */ ) {
            this.right = false
        } else if (e.keyCode === 40 /* down */ || e.keyCode === 83 /* s */ ) {
            this.down = false
        } else if (e.keyCode === 37 /* left */ || e.keyCode === 65 /* a */ || e.keyCode === 81 /* q */ ) {
            this.left = false
        }
    }
});