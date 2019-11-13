/**
 * TODO
 * - in finesseFunc, real error message when invalid piece (or state)
 * - better way to reset piece (than unplace it)
 * - test bad-finesse listener action arguments that are put
 * - test constructor setting das weight
 * - bug: piece reset also resets the hold (failing a piece will allow you to re-hold)
 */
(function() {
    var tetresseTetresse = {
        name: 'tetresseTetresse',
        _managers: ['ActionManager'],
        tetresses: {},
        addEvents(tetresse, settings) {
            settings = this.tet.u.objFill({
                resetPieceOnFail: false,
                has180: false,
                dasWeight: 1
            }, settings, {type: true});
            if (this.tetresses[tetresse.id]) this.removeEvents(tetresse);
            var turnObj = {record: [], softDrop: false};
            this.tetresses[tetresse.id] = {};
            this.tetresses[tetresse.id]['piece-placed'] = this.actionManager.create(function() {
                if (!this.turnObj.softDrop) {
                    var state = this.tetresse.state;
                    var correct = this.finesseFunc(state.piece, state.turnData.xLoc, state.turnData.rot, {has180: this.settings.has180});
                    if (correct == null) return;
                    var countDas = function(arr) { var c = 0; arr.forEach((e) => { if (e.startsWith('d')) c++}); return c; };
                    var amtCorrect = correct.length + countDas(correct) * (this.settings.dasWeight - 1);
                    var amtRecorded = this.turnObj.record.length + countDas(this.turnObj.record) * (this.settings.dasWeight - 1);
                    if (amtCorrect >= amtRecorded) {
                        this.tetresse.lm.fire('good-finesse', {correct: correct, recorded: this.turnObj.record});
                    } else {
                        this.tetresse.lm.fire('bad-finesse', {correct: correct, recorded: this.turnObj.record, amount: amtRecorded - amtCorrect});
                        if (this.settings.resetPieceOnFail) { // this is so jank (remove piece from board and reset piece)
                            for (var r = 0; r < state.turnData.layout.length; r++) {
                                for (var c = 0; c < state.turnData.layout[0].length; c++) {
                                    if (state.turnData.layout[r][c] == 1) {
                                        state.board[r + state.turnData.yLoc][c + state.turnData.xLoc] = '';
                                    }
                                }
                            }
                            state.next.splice(0, 0, state.piece);
                        }
                    }
                }
            }, {tetresse: tetresse, settings: settings, turnObj: turnObj, finesseFunc: this.finesseFunc});
            this.tetresses[tetresse.id]['hold'] = this.actionManager.create(function(amount) {
                this.record = [];
                this.softDrop = false;
            }, turnObj);
            this.tetresses[tetresse.id]['next'] = this.actionManager.create(function(amount) {
                this.record = [];
                this.softDrop = false;
            }, turnObj);
            this.tetresses[tetresse.id]['piece-reset'] = this.actionManager.create(function(amount) {
                this.record = [];
                this.softDrop = false;
            }, turnObj);
            // add for hold and reset
            this.tetresses[tetresse.id]['rotate'] = this.actionManager.create(function(amount) {
                if (amount == -1) this.record.push('ccw');
                else if (amount == 1) this.record.push('cw');
                else if (amount == 2) this.record.push('ww');
                else console.log('unrecord rotation amount: ' + amount);
            }, turnObj);
            this.tetresses[tetresse.id]['move'] = this.actionManager.create(function(_, e) {
                var l; 
                if (e == 'move-left') l = 'l'; 
                else if (e == 'move-right') l = 'r'; 
                else if (e == 'move-leftAR') l = 'dl'; 
                else if (e == 'move-rightAR') l = 'dr'; 
                if (e.endsWith('AR')) {
                    for (var i = this.record.length - 1; i >= 0; i--) {
                        var r = this.record[i];
                        if (r == l) return;
                        if (r.indexOf('w') != -1) continue;
                        break;
                    }

                    for (var i = this.record.length - 1; i >= 0; i--)
                        if (this.record[i] == l[1]) this.record.splice(i, 1);
                }
                this.record.push(l); 
            }, turnObj);
            this.tetresses[tetresse.id]['softdrop'] = this.actionManager.create(function() {
                this.softDrop = true;
            }, turnObj);

            tetresse.lm.on('piece-placed', this.tetresses[tetresse.id]['piece-placed'], 20);
            tetresse.lm.on('hold', this.tetresses[tetresse.id]['hold']);
            tetresse.lm.on('next', this.tetresses[tetresse.id]['next']);
            tetresse.lm.on('piece-reset', this.tetresses[tetresse.id]['piece-reset']);
            tetresse.lm.on('rotate', this.tetresses[tetresse.id]['rotate']);
            tetresse.lm.on('move-right', this.tetresses[tetresse.id]['move']);
            tetresse.lm.on('move-left', this.tetresses[tetresse.id]['move']);
            tetresse.lm.on('move-rightAR', this.tetresses[tetresse.id]['move']);
            tetresse.lm.on('move-leftAR', this.tetresses[tetresse.id]['move']);
            tetresse.lm.on('softdrop', this.tetresses[tetresse.id]['softdrop']);
        },
        removeEvents(tetresse) {
            if (this.tetresses[tetresse.id] == undefined) return;
            for (var event in this.tetresses[tetresse.id]) {
                tetresse.lm.remove(this.tetresses[tetresse.id][event]);
            }
            delete this.tetresses[tetresse.id];
        },
        finesseFunc(piece, x, r, settings = {}) { // r: between 0 and 4
            settings = {...{has180: false}, ...settings};
            var loc = x, rot = r;
            if (piece == 'i') {
                if (r == 1) loc += 2;
                if (r == 3) { loc += 1; rot = 1; }
                if (rot == 2) rot = 0;
            }
            if (piece == 'o') rot = 0;
            if (('sz').indexOf(piece) != -1) {
                if (rot == 2) rot = 0;
                if (rot == 0) piece = 'j';
                else { 
                    piece = 's';
                    if (rot == 1) loc += 1;
                    rot = 0;
                }
            }
            if (('jlt').indexOf(piece) != -1) {
                piece = 'j';
                if (rot == 1) loc += 1;
            }

            var guide = { // d: das, l: left, r: right, w: rotate, cw: clockwise, ccw: counterclockwise, ww: 180
                i: [
                    [["dl"],["l","l"],["l"],[],["r"],["r","r"],["dr"]], // 0 rotation
                    [
                        ["w","dl"],["dl","ccw"],["dl","cw"],["l","ccw"],["ccw"],
                        ["cw"],["r","cw"],["dr","ccw"],["dr","cw"],["w","dr"],
                    ], // 1 rotation
                ],
                j: [
                    [["dl"],["l","l"],["l"],[],["r"],["r","r"],["dr","l"],["dr"]], // 0
                    [
                        ["cw","dl"],["dl","cw"],["l","l","cw"],["l","cw"],["cw"],
                        ["r","cw"],["r","r","cw"],["dr","l","cw"],["dr","cw"]
                    ], // 1
                    (settings.has180 ? [
                        ["dl","ww"],["l","l","ww"],["l","ww"],["ww"],
                        ["r","ww"],["r","r","ww"],["dr","l","ww"],["dr","ww"]
                    ] : [
                        ["dl","w","w"],["l","l","w","w"],["l","w","w"],["w","w"],
                        ["r","w","w"],["r","r","w","w"],["dr","l","w","w"],["dr","w","w"]
                    ]), // 2
                    [
                        ["dl","ccw"],["l","l","ccw"],["l","ccw"],["ccw"],
                        ["r","ccw"],["r","r","ccw"],["dr","l","ccw"],["dr","ccw"],["ccw","dr"]
                    ] // 3
                ],
                o: [[["dl"],["dl","r"],["l","l"],["l"],[],["r"],["r","r"],["dr","l"],["dr"]]],
                s: [[
                    ["w","dl"],["dl","cw"],["l","ccw"],["ccw"],["cw"],
                    ["r","cw"],["r","r","cw"],["dr","ccw"],["w","dr"]
                ]],
            };
            if (guide[piece] == undefined) return null;
            if (rot < 0 || rot >= guide[piece].length) return null;
            if (loc < 0 || loc >= guide[piece][rot].length) return null;
            return guide[piece][rot][loc];
        }
    };

    try {
        module.exports = tetresseTetresse;
    } catch (e) {
        try {
            tet.exports = tetresseTetresse;
        } catch (e) {
            PlayableTetresse = tetresseTetresse;
        }
    }
})();
