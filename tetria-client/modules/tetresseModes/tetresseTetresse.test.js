const tet = require('../../tet.js');
var tetresseTetresse;
tet.addModule(require('../IdManager.js'));
tet.addModule(require('../ActionManager.js'));
tet.addModule(require('../ListenerManager.js'));
tet.addModule(require('../TetresseManager.js'));
tet.addModule(tetresseTetresse = require('./tetresseTetresse.js'));
tet.setup();

var tetresse;
beforeEach(() => {
    tetresse = new tet.m.tetresseManager.Tetresse();
});

describe('addEvents', () => {
    test('settings save correctly', () => {
        tetresseTetresse.addEvents(tetresse, {has180: true, resetPieceOnFail: true});
        expect(tetresseTetresse.tetresses[tetresse.id]).toBeDefined();
        var action = tet.m.idManager.get(tetresseTetresse.tetresses[tetresse.id]['piece-placed']);
        expect(action).toBeDefined();
        expect(action.this.settings.has180).toBe(true);
        expect(action.this.settings.resetPieceOnFail).toBe(true);

        var tetresse2 = new tet.m.tetresseManager.Tetresse();
        tetresseTetresse.addEvents(tetresse2);
        expect(tetresseTetresse.tetresses[tetresse2.id]).toBeDefined();
        var action = tet.m.idManager.get(tetresseTetresse.tetresses[tetresse2.id]['piece-placed']);
        expect(action).toBeDefined();
        expect(action.this.settings.has180).toBe(false);
        expect(action.this.settings.resetPieceOnFail).toBe(false);
        
        var tetresse3 = new tet.m.tetresseManager.Tetresse();
        tetresseTetresse.addEvents(tetresse3, {resetPieceOnFail: true});
        expect(tetresseTetresse.tetresses[tetresse3.id]).toBeDefined();
        var action = tet.m.idManager.get(tetresseTetresse.tetresses[tetresse3.id]['piece-placed']);
        expect(action).toBeDefined();
        expect(action.this.settings.has180).toBe(false);
        expect(action.this.settings.resetPieceOnFail).toBe(true);
    });
    describe('piece-place', () => {
        var ret;
        beforeEach(() => {
            tetresseTetresse.addEvents(tetresse);
            ret = {ret: []}
            tetresse.lm.create('bad-finesse', tet.m.actionManager.create(function() {
                this.ret.push(arguments);
            }, ret));
            tetresse.pieceNext();
        });
        test('works as expected', () => {
            tetresse.pieceDetailsMoveLeft();            
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsHardDrop();
            expect(ret.ret.length).toBe(0);
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(1);
            tetresse.pieceNext();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(1);

            tetresse.pieceNext();
            tetresse.pieceDetailsRotateCW();
            tetresse.pieceDetailsRotateCCW();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(2);
        });
        test('order of actions sometimes does not matter (if equal)', () => {
            tetresse.state.next = ['i'];
            tetresse.pieceNext();
            tetresse.pieceDetailsRotateCW();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
            tetresse.pieceNext();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsRotateCW();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
        });
        test('if invalid piece, fails gracefully (returns)', () => {
            tetresse.pieceNext();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsMoveLeft();
            tetresse.pieceDetailsHardDrop();
            tetresse.state.piece = 'x';
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
        });
        test('hold resets count', () => {
            tetresse.pieceNext();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsMoveLeft();
            tetresse.pieceHold();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
        });
        test('softdrop prevents piece from firing', () => {
            tetresse.pieceNext();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsMoveLeft();
            tetresse.pieceDetailsSoftDrop();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
        });
        test('pieceReset resets the finesse record', () => {
            tetresse.pieceNext();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsMoveLeft();
            tetresse.pieceReset();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
        });
        describe('enabling resetPieceOnFail', () => {
            var tetresse2, ret2;
            beforeEach(() => {
                tetresse2 = new tet.m.tetresseManager.Tetresse();
                tetresseTetresse.addEvents(tetresse2, {resetPieceOnFail: true});
                ret2 = {ret: []}
                tetresse2.lm.create('bad-finesse', tet.m.actionManager.create(function() {
                    this.ret.push(arguments);
                }, ret2));
            });
            test('updates board correctly, re-adds piece to next', () => {
                tetresse.state.next = ['i'];
                tetresse.pieceNext();
                tetresse.pieceDetailsMoveRight();
                tetresse.pieceDetailsMoveLeft();
                tetresse.pieceDetailsHardDrop();
                tetresse.pieceBoardPlace();
                expect(ret.ret.length).toBe(1);
                expect(tetresse.state.board[39][3]).toBe('i');
                tetresse2.state.next = ['i'];
                tetresse2.pieceNext();
                tetresse2.pieceDetailsMoveRight();
                tetresse2.pieceDetailsMoveLeft();
                tetresse2.pieceDetailsHardDrop();
                tetresse2.pieceBoardPlace();
                expect(ret2.ret.length).toBe(1);
                expect(tetresse2.state.board[39][3]).not.toBe('i');
            });
            test('does not activate with correct finesse', () => {
                tetresse2.state.next = ['i'];
                tetresse2.pieceNext();
                tetresse2.pieceDetailsHardDrop();
                tetresse2.pieceBoardPlace();
                expect(ret2.ret.length).toBe(0);
                expect(tetresse2.state.board[39][3]).toBe('i');
            });
        });
        describe('enabling has180', () => {
            var tetresse2, ret2;
            beforeEach(() => {
                tetresse2 = new tet.m.tetresseManager.Tetresse();
                tetresseTetresse.addEvents(tetresse2, {has180: true});
                ret2 = {ret: []}
                tetresse2.lm.create('bad-finesse', tet.m.actionManager.create(function() {
                    this.ret.push(arguments);
                }, ret2));
            });
            test('exchanges w, w for ww (180)', () => {
                tetresse2.state.next = ['t'];
                tetresse2.pieceNext();
                tetresse2.pieceDetailsRotateCWW();
                tetresse2.pieceDetailsHardDrop();
                tetresse2.pieceBoardPlace();
                expect(ret2.ret.length).toBe(0);
            });
            test('using w,w gets marked as incorrect', () => {
                tetresse2.state.next = ['t'];
                tetresse2.pieceNext();
                tetresse2.pieceDetailsRotateCW();
                tetresse2.pieceDetailsRotateCW();
                tetresse2.pieceDetailsHardDrop();
                tetresse2.pieceBoardPlace();
                expect(ret2.ret.length).toBe(1);

                tetresse.state.next = ['t'];
                tetresse.pieceNext();
                tetresse.pieceDetailsRotateCW();
                tetresse.pieceDetailsRotateCW();
                tetresse.pieceDetailsHardDrop();
                tetresse.pieceBoardPlace();
                expect(ret.ret.length).toBe(0);
            });
        });
        test('removeEvents removes all events tetresse', () => {
            tetresseTetresse.removeEvents(tetresse);
            expect(tetresseTetresse.tetresses[tetresse.id]).toBeUndefined();
            tetresse.pieceNext();
            tetresse.pieceDetailsMoveRight();
            tetresse.pieceDetailsMoveLeft();
            tetresse.pieceDetailsHardDrop();
            tetresse.pieceBoardPlace();
            expect(ret.ret.length).toBe(0);
        });
    });
});

describe('finesseFunc', () => { // (piece, x, r, settings)
    test('basic functionality', () => {
        expect(tetresseTetresse.finesseFunc('i', 0, 0)).toEqual(['dl']);
    });
    test('invalid piece or args returns null', () => {
        expect(tetresseTetresse.finesseFunc('x', 0, 0)).toBe(null);
        expect(tetresseTetresse.finesseFunc('o', -5, 0)).toBe(null);
        expect(tetresseTetresse.finesseFunc('i', 0, -1)).toBe(null);
    });
    describe('pieces', () => {
        describe('i', () => {
            test('rot 0 vs rot 2 does not matter', () => {
                expect(tetresseTetresse.finesseFunc('i', 0, 0)).toEqual(['dl']);
                expect(tetresseTetresse.finesseFunc('i', 0, 2)).toEqual(['dl']);
            });
            test('rot 1 and rot 3 have correct offsets', () => {
                expect(tetresseTetresse.finesseFunc('i', -2, 1)).not.toBe(null);
                expect(tetresseTetresse.finesseFunc('i', -3, 1)).toBe(null);
                expect(tetresseTetresse.finesseFunc('i', -1, 3)).not.toBe(null);
                expect(tetresseTetresse.finesseFunc('i', -2, 3)).toBe(null);
            });
            test('prefer l,l to dl,r', () => {
                expect(tetresseTetresse.finesseFunc('i', 1, 0)).toEqual(['l', 'l']);                
            });
        });
        describe('o', () => {
            test('any rotation is ok', () => {
                for (var i = -10; i < 10; i++) {
                    expect(tetresseTetresse.finesseFunc('o', 0, i)).not.toBe(null);
                }
            });
            test('correct x offset', () => {
                expect(tetresseTetresse.finesseFunc('o', 0, 0)).toEqual(['dl']);                
                expect(tetresseTetresse.finesseFunc('o', -1, 0)).toBe(null);                
            });
        });
        describe('horizontal symmetry (sz)', () => {
            test('s vs z does not matter', () => {
                for (var r = 0; r < 4; r++) {
                    for (var i = 0; i < 7; i++) {
                        expect(tetresseTetresse.finesseFunc('s', i, r)).toEqual(tetresseTetresse.finesseFunc('z', i, r));
                    }    
                }
            });
            test('correct x offset', () => {
                expect(tetresseTetresse.finesseFunc('s', 0, 0)).toEqual(['dl']);                
                expect(tetresseTetresse.finesseFunc('s', -1, 0)).toBe(null);                
            });
        });
        describe('no symmetry (jlt)', () => {
            test('j vs l vs t does not matter', () => {
                for (var r = 0; r < 4; r++) {
                    for (var i = 0; i < 7; i++) {
                        var match = tetresseTetresse.finesseFunc('j', i, r)
                        expect(tetresseTetresse.finesseFunc('l', i, r)).toEqual(match);
                        expect(tetresseTetresse.finesseFunc('t', i, r)).toEqual(match);
                    }    
                }
            });
            test('correct x offset', () => {
                expect(tetresseTetresse.finesseFunc('s', 0, 0)).toEqual(['dl']);                
                expect(tetresseTetresse.finesseFunc('s', -1, 0)).toBe(null);                
            });
        });
    });

    describe('settings has180', () => {
        test('exchanges with correct 180', () => {
            expect(tetresseTetresse.finesseFunc('t', 0, 2, {has180: true})).toContain('ww');                
            expect(tetresseTetresse.finesseFunc('t', 0, 2)).not.toContain('ww');
        });
        test('leaves other things the same', () => {
            expect(tetresseTetresse.finesseFunc('t', 0, 1)).not.toContain('ww');
        });
    });
});
