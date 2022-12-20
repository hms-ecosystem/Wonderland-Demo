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
@brief Controls the bullet trajectory

Deactivates bullet updates to preserve performance. Bullets collision is also
deactivated when the bullet is on the ground. This is done to prevent the 
score-trigger going off when the mice run over the bullets.

*/
WL.registerComponent('bullet-physics', {
    speed: {type: WL.Type.Float, default: 1.0},
}, {
    init: function() {
        this.dir = new Float32Array(3);
        this.position = [0, 0, 0];
        this.object.getTranslationWorld(this.position);
        this.correctedSpeed = this.speed/6;

        this.collision = this.object.getComponent('collision', 0);
        if(!this.collision) {
            console.warn("'bullet-physics' component on object", this.object.name, "requires a collision component");
        }
    },
    update: function(dt) {
        //error checking?
        if(isNaN(dt)){
            console.log("dt is NaN");
            return;
        } 

        //update position
        this.object.getTranslationWorld(this.position);
        //deactivate bullet if through the floor
        if(this.position[1] <= floorHeight + this.collision.extents[0]) {
            this.active = false;
            this.object.getComponent('collision').active=false;
            this.destroyBullet(5000);
            return;
        }
        //deactivate bullet if travel distance too far
        if(glMatrix.vec3.length(this.position)>175){
            this.active = false;
            this.destroyBullet(0);
            return;
        }
        let newDir = [0,0,0];
        glMatrix.vec3.add(newDir, newDir, this.dir);
        glMatrix.vec3.scale(newDir, newDir, this.correctedSpeed);

        glMatrix.vec3.add(this.position, this.position, newDir);
        
        this.object.resetTranslation();
        this.object.translate(this.position);
    },
    destroyBullet: function(time){
        if(time==0){
            this.object.destroy();
        }else{
            setTimeout(()=>{
                this.object.destroy()
            }, time);
        }
    },
});
