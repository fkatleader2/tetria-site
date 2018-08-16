tetresse.modules.animations = {
    setup() {

    },
    game: {
        setup(game) {
            var list = tetresse.modeSetting("graphicsAnimations", game);
            if (list == null || list.length == 0) return;
            list.forEach(function(ele) {
                if (this.animations[ele] == null) { tetresse.utils.error("invalid animation: " + ele); return; }
                if (this.animations[ele].setup == null) return;
                this.animations[ele].setup(game);
            }.bind(this));
        },
        playing: {
            cur: [],
            loop: null,
            time: null,
        },
        play(canvas) {
            
        }
        sources: {
            
        },
        animations: {
            linesCleared: {
                setup(game) {

                }
            }
        }
    }
};
