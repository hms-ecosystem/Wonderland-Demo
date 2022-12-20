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

/* Global functions used to toggle logo visibility */
var hideLogo = null;
var showLogo = null;
/**
@brief All this file does is hide and show the game logo.
*/
WL.registerComponent('game-logo', {
}, {
    init: function() {
        /** hide logo when the 1st shot is fired */
        hideLogo = function(){
            this.object.getComponent('mesh').active=false;
        }.bind(this);

        /** show logo when the game ends */
        showLogo = function(){
            this.object.getComponent('mesh').active=true;
        }.bind(this);
    },
});