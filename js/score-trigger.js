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
var score = 0;
var gameOver = false;
/**
@brief Score trigger

Check overlap with bullet objects to spawn confetti particles and
update the score.

This component is automatically attached to newly spawned mouse 
objects, see `mouse-spawner`.
*/
WL.registerComponent('score-trigger', {
    particles: {type: WL.Type.Object}
}, {
    init: function() {
        this.collision = this.object.getComponent('collision');
        this.soundHit = this.object.addComponent('howler-audio-source', {src: 'sfx/high-pitched-aha-103125.mp3', volume: 1.9 });
        this.soundPop = this.object.addComponent('howler-audio-source', {src: 'sfx/pop-94319.mp3', volume: 1.9 });
        this.maxOverlapDistance = 0.6;
    },
    update: function(dt) {
        try{
            let overlaps = this.collision.queryOverlaps();

            for(let i = 0; i < overlaps.length; ++i) {
                let p = overlaps[i].object.getComponent('bullet-physics');
    
                if(p && !p.scored) {
                    let bulletLocation = [];
                    p.object.getTranslationWorld(bulletLocation);
                    // console.log("bulletLocation >> ", bulletLocation);

                    let mouseLocation = [];
                    this.object.getTranslationWorld(mouseLocation);
                    // console.log("mouseLocation >> ", mouseLocation);

                    let xOverlapDistance = Math.abs(bulletLocation[0]-mouseLocation[0]);
                    let yOverlapDistance = Math.abs(bulletLocation[1]-mouseLocation[1]);
                    let zOverlapDistance = Math.abs(bulletLocation[2]-mouseLocation[2]);

                    if(xOverlapDistance < this.maxOverlapDistance && 
                        yOverlapDistance < this.maxOverlapDistance && 
                        zOverlapDistance < this.maxOverlapDistance){
                        p.scored = true;
                        this.particles.transformWorld.set(this.object.transformWorld);
                        this.particles.getComponent('confetti-particles').burst();
                        this.object.parent.destroy();
                        p.object.destroy();
        
                        ++score;
        
                        let scoreString = "";
                        if(maxTargets!=score){
                            scoreString = score+" rats down, "+(maxTargets-score)+" left";
                        }else{
                            scoreString = "Congrats, you got all the rats!";
                            victoryMusic.play();
                            bgMusic.stop();
                            mouseSound.stop();
                            resetButton.unhide();
                            showLogo();
                            gameOver = true;
    
                        }
                        
                        updateScore(scoreString);
        
                        this.soundHit.play();
                        this.soundPop.play();
        
                        updateMoveDuration();
                    }
                }
            }
        }catch(e){
            console.log("score-trigger->update() >> ",e);
        }
        
    },
});
