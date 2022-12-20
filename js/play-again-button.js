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
var resetButton = null;
/**
@brief Shootable button to restart the game. 

Resets spawner location, SFX, music, and scoreboard. Player position 
does not reset.

button.js from WastePaperBin-AR wasn't working properly. Changed 
implementation to have the button respond to collision events from the 
player's bullets.
*/
WL.registerComponent('play-again-button', {
}, {
    init: function() {
        this.collision = this.object.getComponent('collision');
        this.soundPop = this.object.addComponent('howler-audio-source', {src: 'sfx/pop-94319.mp3', volume: 1.9 });
    },
    start: function() {
        resetButton = this;
        this.hide();

    },
    restart: function() {
        try{
            for(let i = 0; i < mouseSpawner.targets.length; ++i) {
                mouseSpawner.targets[i].destroy();
                mouseSpawner.object.resetTranslation();
                mouseSpawner.object.translate([-3,0,-3]);
            }
        }catch(e){
            console.log("play-again-button >> restart >> ", e);
        }
        mouseSpawner.targets = [];

        victoryMusic.stop();
        bgMusic.play();

        gameOver = false;
        shotCount = 0;
        score = 0;
        updateCounter();
        updateScore(`Eliminate all ${maxTargets} rats.`);
        firstShot = false;

        this.hide();
    },
    hide: function() {
        this.object.children[0].getComponent('mesh').active = false;
        this.object.children[1].getComponent('text').active = false;
        this.active = false;
    },
    unhide: function() {
        this.object.children[0].getComponent('mesh').active = true;
        this.object.children[1].getComponent('text').active = true;
        this.active = true;
    },
    update: function(dt) {
        let overlaps = this.collision.queryOverlaps();
        for(let i = 0; i < overlaps.length; ++i) {
            let p = overlaps[i].object.getComponent('bullet-physics');
            if(p){
                this.restart();
                this.soundPop.play();
            }
        }
    },
});
