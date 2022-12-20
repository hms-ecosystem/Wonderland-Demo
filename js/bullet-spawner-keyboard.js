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
var bulletSpawnerKeyboard = null;
var shotCount = 0;
var firstShot = false;
/**
@brief Spawns a new bullet object when the player presses the spacebar.
*/
WL.registerComponent('bullet-spawner-keyboard', {
    bulletMesh: {type: WL.Type.Mesh},
    bulletMaterial: {type: WL.Type.Material},
    bulletSpeed: {type: WL.Type.Float, default: 1.0},
}, {
    init: function(){
        this.spacebar = false;

        window.addEventListener('keydown', this.press.bind(this));
        window.addEventListener('keyup', this.release.bind(this));
    },
    start: function() {
        this.bullets = [];
        this.nextIndex = 0;
        this.lastShotTime = 0;

        bulletSpawner = this.object;
        this.soundClick = this.object.addComponent('howler-audio-source', {src: 'sfx/9mm-pistol-shoot-short-reverb-7152.mp3', volume: 0.5 });
    },

    update: function(){
        if(this.spacebar){
            let currentTime = Date.now();
            let lastShotTimeGap = Math.abs(currentTime-this.lastShotTime);

            if(lastShotTimeGap>500){
                try{
                    const dir = [0, 0, 0];
                    this.object.getForward(dir);

                    this.launch(dir);
                    this.lastShotTime=currentTime;
                    this.soundClick.play();
                }catch(e){
                    console.log("keyboard shoot >> ", e);
                }
                
            }
        }
    },
    launch: function(dir) {
        let bullet = this.spawnBullet();

        bullet.object.transformLocal.set(this.object.transformWorld);
        bullet.object.setDirty();
        bullet.physics.dir.set(dir);

        bullet.physics.scored = false;
        bullet.physics.active = true;

        shotCount++;
        updateCounter();

        if(!firstShot){
            hideLogo();
            updateMoveDuration(true);
            firstShot = true;
        }
    },
    spawnBullet:function(){
        const obj = WL.scene.addObject();

        const mesh = obj.addComponent('mesh');
        mesh.mesh = this.bulletMesh;
        mesh.material = this.bulletMaterial;

        obj.scale([0.05,0.05,0.05]);

        mesh.active = true;

        const col = obj.addComponent('collision');
        col.shape = WL.Collider.Sphere;
        col.extents[0] = 0.05;
        col.group = (1 << 0);
        col.active = true;

        const physics = obj.addComponent('bullet-physics', {
            speed: this.bulletSpeed,
        });
        physics.active = true;

        return {
            object: obj,
            physics: physics
        };
    },
    press: function(e) {
        if (e.keyCode === 32 /* spacebar */) {
            this.spacebar = true;
        }
    },

    release: function(e) {
        if (e.keyCode === 32 /* spacebar */ ) {
            this.spacebar = false;
        }
    },
});