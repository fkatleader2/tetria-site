/**
 * TODO:
 * - write tests
 * - finish unlinkTetresse
 */
(function() {
    var gravity = {
        name: 'gravity',
        _managers: ['actionManager'],
        linked: {},
        defaultSettings: {
            sdWait: 1000,
            // hdWait: null, // set a different wait time for the final hd, null to disable
            cancelLimit: 15, // number of times gravity can be cancelled (stalling)
            // timeLimit: -1, // amount of time (extra) until the piece harddrops (based on height diff and sd wait), -1 to disable
            updateFunc(tetresse) {},
        },
        initSettings(tetresse, settings) {
            var settings = this.tet.u.objFill(this.defaultSettings, settings, {type: true});
            if (tetresse.data.settings.gravity == undefined) tetresse.data.settings.gravity = {};
            tetresse.data.settings.gravity = this.tet.u.objFill(settings, tetresse.data.settings.gravity, {type: true});
        },
        linkTetresse(tetresse) {
            this.initSettings(tetresse);
            var env = this.linked[tetresse.id] = {
                tetresse: tetresse, gravityLoop: null, gravityLoopTime: -1, paused: false, started: true, tmpOffset: 0, cancelCount: 0,
                gravityFunc: function() {
                    var settings = this.tetresse.data.settings.gravity;
                    if (this.paused) return;
                    if (!this.started) {
                        if (!this.tetresse.pieceMove(0, 1)) {
                            this.tetresse.pieceDetailsHardDrop();
                            return;
                        }
                    } else {
                        this.started = false;
                    }
                    if (typeof(settings.updateFunc) == 'function') settings.updateFunc(tetresse);
                    clearTimeout(this.gravityLoop);
                    this.gravityLoop = setTimeout(this.gravityFunc.bind(this), settings.sdWait - this.tmpOffset);
                    this.gravityLoopTime = (new Date()).getTime();
                    this.tmpOffset = 0;
                }
            };
            env.actionStart = this.actionManager.create(env.gravityFunc, env);
            env.actionEnd = this.actionManager.create(function() {
                clearTimeout(this.gravityLoop);
                this.paused = true;
                this.tmpOffset = (new Date()).getTime() - this.gravityLoopTime;
                // TODO this max min?
                this.tmpOffset = Math.max(0, Math.min(this.tmpOffset, this.tetresse.data.settings.gravity.sdWait));
            }, env);
            env.actionReset = this.actionManager.create(function() {
                clearTimeout(this.gravityLoop);
                this.paused = false;
                this.started = true;
                this.tmpOffset = 0;
                this.cancelCount = 0;
            }, env);
            env.actionResetGravity = this.actionManager.create(function(_0, label) {
                if (!this.tetresse.pieceTestMove(0, 1)) {
                    if (label == 'softdrop') return;
                    this.cancelCount += 1;
                } else if (label != 'softdrop') return;
                if (this.cancelCount > this.tetresse.data.settings.gravity.cancelLimit) return;
                // clearTimeout(this.gravityLoop);
                this.started = true;
                this.gravityFunc.apply(this);
            }, env);
            tetresse.lm.on('next-first', env.actionStart);
            tetresse.lm.on('game-end', env.actionEnd);
            tetresse.lm.on('pause', env.actionEnd);
            tetresse.lm.on('resume', env.actionStart);

            tetresse.lm.on('piece-reset', env.actionReset);
            tetresse.lm.on('piece-reset', env.actionStart, 80);
            tetresse.lm.on('move-left', env.actionResetGravity);
            tetresse.lm.on('move-right', env.actionResetGravity);
            tetresse.lm.on('softdrop', env.actionResetGravity);
        },
        unlinkTetresse(tetresse) {

        },
    }


    try {
        module.exports = gravity;
    } catch (e) {
        try {
            tet.exports = gravity;
        } catch (e) {
            throw new Error('Could not load gravity module');
        }
    }
})();
