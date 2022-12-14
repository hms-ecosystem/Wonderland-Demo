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
@brief Moves and the spawner in random directions.
*/
WL.registerComponent('spawn-mover', {
}, {
    init: function() {
        this.time = 0;
        this.currentPos = [0, 0, 0];
        this.pointA = [0, 0, 0];
        this.pointB = [0, 0, 0];

        this.moveDuration = 1;
        this.speed = 3;
        this.travelDistance = this.moveDuration*this.speed;

        glMatrix.quat2.getTranslation(this.currentPos, this.object.transformLocal);

        glMatrix.vec3.add(this.pointA, this.pointA, this.currentPos);
        glMatrix.vec3.add(this.pointB, this.currentPos, [0, 0, 1.5]);
    },
    update: function(dt) {
        if(isNaN(dt)) return;

        this.time += dt;
        if(this.time >= this.moveDuration) {
            this.time -= this.moveDuration;

            this.pointA = this.currentPos;
            let x = Math.random()*this.travelDistance;
            let z = Math.sqrt(Math.pow(this.travelDistance,2) - Math.pow(x,2));
            

            let distanceFromOrigin = glMatrix.vec3.length(this.pointA);
            if(distanceFromOrigin>20){
                if(this.pointA[0]>=14){
                    x *= -1;
                }
                if(this.pointA[2]>=14){
                    z *= -1;
                }
            }else{
                const randomNegative1 = Math.round(Math.random()) * 2 - 1;
                const randomNegative2 = Math.round(Math.random()) * 2 - 1;
                x *= randomNegative1
                z *= randomNegative2;
            }
            glMatrix.vec3.add(this.pointB, this.pointA, [x, 0, z]);
        }

        this.object.resetTranslation();
        glMatrix.vec3.lerp(this.currentPos, this.pointA, this.pointB, this.time);
        this.object.translate(this.currentPos);
    },
});
