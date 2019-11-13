/**
 * TODO
 * - test constructor if tetresse is specified
 */
(function() {
    var defaultTetresse = function(tetresse) {
        this.tetresse = tetresse == undefined ? new this.tetresseManager.Tetresse() : tetresse;
        this.lm = this.tetresse.lm;

        this.tetresse.lm.on('harddrop', this.actionManager.create(function() {
            this.pieceBoardPlace();
            this.boardCollapse();
            this.pieceNext();
        }, this.tetresse));

        // end game
        this.tetresse.data.settings.pieceResetFailLoop = true;
        this.tetresse.lm.on('pieceReset-failed', this.actionManager.create(function(ret) {
            if (ret.yInitial == this.tetresse.state.turnData.yLoc) {
                ret.yOffset -= 1;
            } else {
                ret.ret = true;
                this.end();
            }
        }, this));
    };

    try {
        module.exports = defaultTetresse;
    } catch (e) {
        try {
            tet.exports = defaultTetresse;
        } catch (e) {
            PlayableTetresse = defaultTetresse;
        }
    }

    defaultTetresse.prototype._managers = ['TetresseManager', 'ActionManager'];
    defaultTetresse.prototype.start = function() {
        this.tetresse.pieceNext();
    };
    defaultTetresse.prototype.end = function(andStart = false) {
        this.lm.fire('game-end');
        if (andStart) this.reset(true);
    };
    defaultTetresse.prototype.reset = function(andStart = false) {
        this.tetresse.resetState();
        if (andStart) this.start();
    };
})();
