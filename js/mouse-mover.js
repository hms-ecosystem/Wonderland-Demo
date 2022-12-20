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
var updateMoveDuration = null;
/**
@brief Moves and rotates the mice in random directions at set intervals.
*/
WL.registerComponent('mouse-mover', {
}, {
    init: function() {
        
        this.currentPos = [0, 0, 0];
        this.object.getTranslationWorld(this.currentPos);
        this.pointA = [0, 0, 0];
        this.pointB = [0, 0, 0];

        this.rotateMoveRatio = 2;
        this.moveDuration = (Math.random()*0.7)+1.3;
        this.time = this.moveDuration/this.rotateMoveRatio;
        this.speed = 1.5;
        this.travelDistance = this.moveDuration*this.speed;

        glMatrix.vec3.add(this.pointA, this.pointA, this.currentPos);
        glMatrix.vec3.add(this.pointB, this.currentPos, [0, 0, 1.5]);

        this.savedAngle = 0;
        this.previousAngle = 0;
        this.newAngle = 0;

        this.speedLevel1 = true;
        this.speedLevel2 = true;
        this.speedLevel3 = true;

        
        this.minDistanceFromPlayer = 7;

        updateMoveDuration = function(firstShot = false){
            let targetsLeft = score/maxTargets;
            if(firstShot){
                this.moveDuration*=0.3;
                this.rotateMoveRatio++;
            }else if(targetsLeft>0.2 && this.speedLevel1){
                this.moveDuration*=0.5;
                this.rotateMoveRatio++;
                this.speedLevel1 = false;
            }else if(targetsLeft>0.5 && this.speedLevel2){
                this.moveDuration*=0.7;
                this.rotateMoveRatio++;
                this.speedLevel2 = false;
            }else if(targetsLeft>0.8 && this.speedLevel3){
                this.moveDuration*=0.7;
                this.rotateMoveRatio++;
                this.speedLevel3 = false;
            }
        }.bind(this);
    },
    update: function(dt) {
        // error checking?
        if(isNaN(dt)) return;

        // increment time on movement cycle
        this.time += dt;

        // get new angle and move location only when movement cycle is complete
        if(this.time >= this.moveDuration) {
            this.time =0;

            this.pointA = this.currentPos;

            // new position will always be the hypotenuse of x and z triangle
            let x = Math.random()*this.travelDistance;
            let z = Math.abs(Math.sqrt(Math.pow(this.travelDistance,2) - Math.pow(x,2)));

            let playerLocation = [0,0,0]
            playerLocation = getPlayerLocation();

            let xNegBoundary = this.pointA[0]<-8;
            let xPosBoundary = this.pointA[0]>13;
            let yNegBoundary = this.pointA[2]<-8;
            let yPosBoundary = this.pointA[2]>12;
            
            // keep mice within farm fence
            if(xNegBoundary || xPosBoundary || yNegBoundary || yPosBoundary){
                if(xPosBoundary){
                    x *= -1;
                }
                if(yPosBoundary){
                    z *= -1;
                }
            // move away from player if too close
            }else if(this.isPlayerClose()){
                if(this.pointA[0]<playerLocation[0]){
                    x*=-1;
                }
                if(this.pointA[2]<playerLocation[2]){
                    z*=-1;
                }
            // otherwise move in random direction
            }else{
                const randomNegative1 = Math.round(Math.random()) * 2 - 1;
                const randomNegative2 = Math.round(Math.random()) * 2 - 1;
                x *= randomNegative1
                z *= randomNegative2;
            }

            glMatrix.vec3.add(this.pointB, this.pointA, [x, 0, z]);

            this.newAngle = Math.floor(Math.random()*180);
            this.previousAngle = this.savedAngle;
        }

        this.object.resetTranslation();
        let rotateTime = this.moveDuration/this.rotateMoveRatio;
        let moveTime = this.time-this.moveDuration/this.rotateMoveRatio;
        // rotation phase
        if(this.time < rotateTime) {
            this.object.resetRotation();
            this.savedAngle = (this.time*this.newAngle)+this.previousAngle;
            this.object.rotateAxisAngleDeg([0, 0, 1], this.savedAngle);
            this.object.rotateAxisAngleDeg([1, 0, 0], 90);
        }
        // linear interpolation between old and new position
        else{
            glMatrix.vec3.lerp(this.currentPos, this.pointA, this.pointB, moveTime);
        }
        // movement phase
        this.object.translate(this.currentPos);
    },
    // check if player is too close
    isPlayerClose: function(){
        let distanceFromPlayer = glMatrix.vec3.dist(this.pointA, getPlayerLocation());
        if(distanceFromPlayer<this.minDistanceFromPlayer){
            return true;
        }else{
            return false;
        }
    },
    // Check if player is too close and run away. Puts update() into "runAwayNow" mode.
    runFromPlayer: function(playerLocation){
        if(this.isPlayerClose()){

            this.pointA = this.currentPos;

            let x = Math.random()*this.travelDistance;
            let z = Math.abs(Math.sqrt(Math.pow(this.travelDistance,2) - Math.pow(x,2)));

            if(this.pointA[0]<playerLocation[0]){
                x*=-1;
            }
            if(this.pointA[2]<playerLocation[2]){
                z*=-1;
            }

            glMatrix.vec3.add(this.pointB, this.pointA, [x, 0, z]);
            // increment time to bypass rotate phase
            this.time = this.moveDuration/this.rotateMoveRatio;
        }
    },
});
