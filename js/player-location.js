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

/* Global function used by mouse-mover to get player's current location */
var getPlayerLocation = null;
/**
@brief Returns the player's current location.
*/
WL.registerComponent('player-location', {
}, {
    init: function() {
        this.playerLocation = [0, 0, 0];
        this.object.getTranslationWorld(this.playerLocation);
        /** Used by mouse-mover to run away from the player if they get too close to any mice. */
        getPlayerLocation = function(){
            return this.playerLocation;
        }.bind(this);
    },
    update: function(){
        let currentLocation = [0, 0, 0];
        this.object.getTranslationWorld(currentLocation);

        let locationDistance = glMatrix.vec3.dist(currentLocation, this.playerLocation);
        if(locationDistance != 0){
            this.playerLocation=currentLocation;
            try{
                for(let i = 0; i < mouseSpawner.targets.length; ++i) {
                    let mouseMoverComponent = mouseSpawner.targets[i].getComponent('mouse-mover');
                    mouseMoverComponent.runFromPlayer(currentLocation);;
                }
            }catch(e){
                console.log("player-location >> get mouse >> ", e);
            }
        }
    }
});
