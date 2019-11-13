/**
 * TODO
 * -
 */
(function() {
    var playableTetresse = function(htmlElement) {
        this.defaultTetresse = new this.tet.o.defaultTetresse();
        this.tetresse = this.defaultTetresse.tetresse;
        this.graphics = new this.tet.o.SvgGraphics(htmlElement);
        this.controls = tet.m.controls;
        this.gravity = null; // placeholder

        this.game.tetresse.lm.on('game-end', this.m.tet.m.actionManager.create(function() {
            console.log('game ended!');
        }));

        this.graphics.linkTetresse(this.game.tetresse);
        this.graphics.setParts(['board', 'next', 'moreNext', 'hold']);
        this.controls.linkTetresse(this.game.tetresse);
    };

    try {
        tet.exports = playableTetresse;
    } catch (e) {
        PlayableTetresse = playableTetresse;
    }

    playableTetresse.prototype.managers = ['Tetresse'];
    playableTetresse.prototype.start = function() {
        this.defaultTetresse.start.apply(this.defaultTetresse, arguments);
    };
    playableTetresse.prototype.end = function() {
        this.defaultTetresse.end.apply(this.defaultTetresse, arguments);
    };
    playableTetresse.prototype.reset = function() {
        this.defaultTetresse.reset.apply(this.defaultTetresse, arguments);
    };
    playableTetresse.prototype.pause = function() {
        // pause gravity and controls
    };
    playableTetresse.prototype.resume = function() {
        // pause gravity and controls
    };
})();
