/**
 * TODO:
 * - creating multiple tetresseManagers links tetresse wrongly (not serious)
 * - pieceSpawnX test for bigger pieces and different size boards
 */

const tet = require('../tet.js');
var TetresseManager;
tet.addModule(require('./IdManager.js'));
tet.addModule(require('./ActionManager.js'));
tet.addModule(require('./ListenerManager.js'));
tet.addModule(TetresseManager = require('./TetresseManager.js'));
tet.addModule(seedrandom = require('./seedrandom.min.js'), 'seedrandom');

test('setup and construct correctly', () => {
    var tetresseManager = new TetresseManager();
    var tetresse = new tetresseManager.Tetresse();
    expect(tetresse.state).toBeDefined();
});

test('tetresse gets linked to correct tetresseManager', () => {
    var tetresseManager = new TetresseManager();
    var tetresse = new tetresseManager.Tetresse();
    var tetresseManager2 = new TetresseManager();
    var tetresse2 = new tetresseManager2.Tetresse();
    var tetresse3 = new tetresseManager.Tetresse();
    expect(tetresse.tetresseManager).toBe(tetresseManager);
    expect(tetresse2.tetresseManager).toBe(tetresseManager2);
    expect(tetresse3.tetresseManager).toBe(tetresseManager2);
});

var tetresseManager;
beforeEach(() => {
    tetresseManager = new TetresseManager();
});

describe('tetresse unit tests', () => {
    var tetresse;
    beforeEach(() => {
        tetresse = new tetresseManager.Tetresse();
    });

    describe('resetState', () => {
        test('basic state gets reset', () => {
            tetresse.state.board = [tet.u.randString(1)];
            tetresse.state.piece = tet.u.randString(2);
            tetresse.state.hold = tet.u.randString(2);
            tetresse.state.next = [tet.u.randString(1), tet.u.randString(1)];
            tetresse.state.incoming = 4;
            var abilityName;
            tetresse.state.abilities[abilityName = tet.u.randString(5)] = tet.u.randString(3);
            tetresse.resetState();
            expect(tetresse.state.board.length).not.toBe(1);
            expect(tetresse.state.piece).toBe(null);
            expect(tetresse.state.hold).toBe(null);
            expect(tetresse.state.next.length).toBe(0);
            expect(tetresse.state.incoming).toBe(0);
            expect(tetresse.state.abilities[abilityName]).toBeUndefined();            
        });
        test('reads settings for board size', () => {
            expect(tetresse.state.board.length).toBe(40);
            expect(tetresse.state.board[0].length).toBe(10);
            tetresse.data.settings.boardHeight = Math.floor(tet.u.random() * 100 + 1);
            tetresse.data.settings.boardWidth = Math.floor(tet.u.random() * 100 + 1);
            tetresse.resetState();
            expect(tetresse.state.board.length).toBe(tetresse.data.settings.boardHeight);
            expect(tetresse.state.board[0].length).toBe(tetresse.data.settings.boardWidth);
        });
    });
    describe('pieceRotateMatrix', () => {
        var arrs;
        beforeEach(() => {
            arrs = {};
            for (var i = 2; i <= 5; i++) {
                var count = 1;
                var arr = [];
                for (var r = 0; r < i; r++) {
                    var a = [];
                    for (var c = 0; c < i; c++) {
                        a.push(count);
                        count++;
                    }
                    arr.push(a);
                }
                arrs[i + 'x' + i] = arr;
            }
        });
        test('basic default rotation (0 rotation) works', () => {
            expect(arrs['3x3']).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
            expect(tetresse.pieceRotateMatrix(arrs['3x3'])).toBe(true);
            expect(arrs['3x3']).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        });
        test('returns false for invalid input', () => {
            expect(tetresse.pieceRotateMatrix()).toBe(false);
            expect(tetresse.pieceRotateMatrix([[1, 2]])).toBe(false);
            expect(tetresse.pieceRotateMatrix([[1], [2]])).toBe(false);
            expect(tetresse.pieceRotateMatrix([[2]], '1')).toBe(false);
        });
        test('single cw rotation', () => {
            expect(tetresse.pieceRotateMatrix(arrs['3x3'], 1)).toBe(true);
            expect(arrs['3x3']).toEqual([
                [7, 4, 1], 
                [8, 5, 2], 
                [9, 6, 3]]);
        });
        test('varying size matricies', () => {
            expect(tetresse.pieceRotateMatrix(arrs['2x2'], 1)).toBe(true);
            expect(arrs['2x2']).toEqual([
                [3, 1], 
                [4, 2]]);
            expect(tetresse.pieceRotateMatrix(arrs['4x4'], 1)).toBe(true);
            expect(arrs['4x4']).toEqual([
                [13, 9, 5, 1], 
                [14, 10, 6, 2],
                [15, 11, 7, 3],
                [16, 12, 8, 4]]);
            expect(tetresse.pieceRotateMatrix(arrs['5x5'], 1)).toBe(true);
            expect(arrs['5x5']).toEqual([
                [21, 16, 11, 6, 1], 
                [22, 17, 12, 7, 2],
                [23, 18, 13, 8, 3],
                [24, 19, 14, 9, 4],
                [25, 20, 15, 10, 5]]);
            });
        test('multiple rotations', () => {
            expect(tetresse.pieceRotateMatrix(arrs['3x3'], 2)).toBe(true);
            expect(arrs['3x3']).toEqual([
                [9, 8, 7], 
                [6, 5, 4], 
                [3, 2, 1]]);
            expect(tetresse.pieceRotateMatrix(arrs['3x3'], 4)).toBe(true);
            expect(arrs['3x3']).toEqual([
                [9, 8, 7], 
                [6, 5, 4], 
                [3, 2, 1]]);
            expect(tetresse.pieceRotateMatrix(arrs['3x3'], 8)).toBe(true);
            expect(arrs['3x3']).toEqual([
                [9, 8, 7], 
                [6, 5, 4], 
                [3, 2, 1]]);
        });
        test('negative rotations', () => {
            expect(tetresse.pieceRotateMatrix(arrs['3x3'], -1)).toBe(true);
            expect(arrs['3x3']).toEqual([
                [3, 6, 9], 
                [2, 5, 8], 
                [1, 4, 7]]);
        });
    });
    describe('pieceShuffle', () => {
        var rand1, rand2, arr, arr2;
        beforeEach(() => {
            var str = tet.u.randString(32);
            rand1 = new seedrandom(str);
            rand2 = new seedrandom(str);
            arr = [];
            for (var i = 0; i < Math.floor(Math.random() * 5 + 10); i++) {
                arr.push(tet.u.randString(1));
            }
            arr2 = tet.u.copy(arr);
        });
        test('uses tet random', () => {
            tet.u.random = rand1;
            expect(tetresse.pieceShuffle(arr)).toBe(true);
            tet.u.random = rand2;
            expect(tetresse.pieceShuffle(arr2)).toBe(true);
            expect(arr).toEqual(arr2);
        });
        test('invalid args returns false', () => {
            expect(tetresse.pieceShuffle()).toBe(false);
            expect(tetresse.pieceShuffle({})).toBe(false);
        });
        test('suffle tends to change the array', () => {
            var numSame = 0;
            for (var count = 0; count < 100; count++) {
                tet.u.random = rand1;
                expect(tetresse.pieceShuffle(arr)).toBe(true);
                tet.u.random = rand2;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] == arr2[i]) numSame++;
                }
                expect(tetresse.pieceShuffle(arr2)).toBe(true);
                expect(arr).toEqual(arr2);
            }
            expect(numSame).toBeLessThan(arr.length * 100);
        });
    });
    describe('pieceHold', () => {
        test('basic', () => {
            tetresse.pieceNext();
            expect(tetresse.pieceHold()).toBe(true);   
            expect(tetresse.pieceHold()).toBe(false);
        });
        test('multiple holds per turn', () => {
            tetresse.pieceNext();
            tetresse.data.settings.holdsPerTurn = 4;
            expect(tetresse.state.turnData.hold).toBe(0);
            expect(tetresse.pieceHold(true)).toBe(true);
            expect(tetresse.state.turnData.hold).toBe(1);
            expect(tetresse.pieceHold(true)).toBe(true);
            expect(tetresse.state.turnData.hold).toBe(2);
            expect(tetresse.pieceHold(true)).toBe(true);
            expect(tetresse.state.turnData.hold).toBe(3);
            expect(tetresse.pieceHold()).toBe(true);
            expect(tetresse.state.turnData.hold).toBe(4);
            expect(tetresse.pieceHold()).toBe(false);
            expect(tetresse.state.turnData.hold).toBe(4);
        });
        test('unlimited holds per turn', () => {
            tetresse.pieceNext();
            tetresse.data.settings.holdsPerTurn = -1;
            expect(tetresse.pieceHold()).toBe(true);
            expect(tetresse.state.turnData.hold).toBe(1);
            for (var i = 0; i < 100; i++) {
                expect(tetresse.pieceHold()).toBe(true);
            }
            expect(tetresse.state.turnData.hold).toBe(101);
        });
    });
    describe('pieceMove', () => { // todo test continuous
        beforeEach(() => {
            tetresse.state.piece = 'o';
            tetresse.pieceReset();
        });
        test('basic', () => {
            expect(tetresse.pieceMove(1, 0)).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(5);
            expect(tetresse.state.turnData.xTotal).toBe(1);
            expect(tetresse.state.turnData.yTotal).toBe(0);
            expect(tetresse.pieceMove(-1, 0)).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(4);
            expect(tetresse.state.turnData.xTotal).toBe(2);
            expect(tetresse.state.turnData.yTotal).toBe(0);
            expect(tetresse.pieceMove(-1, 0)).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(3);
            expect(tetresse.state.turnData.xTotal).toBe(3);
            expect(tetresse.state.turnData.yTotal).toBe(0);
            expect(tetresse.pieceMove(0, 1)).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(20);
            expect(tetresse.state.turnData.xTotal).toBe(3);
            expect(tetresse.state.turnData.yTotal).toBe(1);
            expect(tetresse.pieceMove(0, 1)).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(21);
            expect(tetresse.state.turnData.xTotal).toBe(3);
            expect(tetresse.state.turnData.yTotal).toBe(2);
            expect(tetresse.pieceMove(0, -1)).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(20);
            expect(tetresse.state.turnData.xTotal).toBe(3);
            expect(tetresse.state.turnData.yTotal).toBe(3);
        });
        test('jump sideways', () => {
            expect(tetresse.pieceMove(3, 0)).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(7);
            expect(tetresse.pieceMove(-3, 0)).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(4);
            expect(tetresse.pieceMove(-3, 0)).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(1);
            expect(tetresse.state.turnData.xTotal).toBe(9);
            expect(tetresse.state.turnData.yTotal).toBe(0);
        });
        test('jump down', () => {
            expect(tetresse.pieceMove(0, 5)).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(24);
            expect(tetresse.pieceMove(0, 5)).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(29);
            expect(tetresse.pieceMove(0, -4)).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(25);
            expect(tetresse.state.turnData.xTotal).toBe(0);
            expect(tetresse.state.turnData.yTotal).toBe(14);
        });
        test('out of bounds', () => {
            expect(tetresse.pieceMove(10, 0)).toBe(false);
            expect(tetresse.state.turnData.xTotal).toBe(0);
            expect(tetresse.state.turnData.yTotal).toBe(0);
        });
        test('overlap', () => {
            tetresse.state.board[0][0] = 'i';
            expect(tetresse.pieceMove(-4, -19)).toBe(false);
            expect(tetresse.state.turnData.xTotal).toBe(0);
            expect(tetresse.state.turnData.yTotal).toBe(0);
        });
        describe('pieceMoveUntil', () => {
            var ret;
            beforeEach(() => {
                ret = {ret: true, x: 4, y: 0};
            });
            test('basic with correct return', () => {
                expect(tetresse.pieceMoveUntil(4, 0)).toEqual(ret);
                ret.x = -8;
                expect(tetresse.pieceMoveUntil(-8, 0)).toEqual(ret);
                ret.x = 0;
                ret.y = 4;
                expect(tetresse.pieceMoveUntil(0, 4)).toEqual(ret);
                ret.y = -23;
                expect(tetresse.pieceMoveUntil(0, -23)).toEqual(ret);
                ret.y = 38;
                expect(tetresse.pieceMoveUntil(0, 38)).toEqual(ret);
            });
            test('stops moving partway', () => {
                ret.ret = false;
                expect(tetresse.pieceMoveUntil(7, 0)).toEqual(ret);
                ret.x = -8;
                expect(tetresse.pieceMoveUntil(-14, 0)).toEqual(ret);
                ret.x = 0;
                ret.ret = true;
                ret.y = 4;
                expect(tetresse.pieceMoveUntil(0, 4)).toEqual(ret);
                ret.ret = false;
                ret.y = -23;
                expect(tetresse.pieceMoveUntil(0, -40)).toEqual(ret);
                ret.y = 38;
                expect(tetresse.pieceMoveUntil(0, 50)).toEqual(ret);
            });
            test('stops moving immediately', () => {
                ret.ret = false;
                expect(tetresse.pieceMoveUntil(7, 0)).toEqual(ret);
                ret.x = 0;
                expect(tetresse.pieceMoveUntil(7, 0)).toEqual(ret);
                ret.x = -8;
                expect(tetresse.pieceMoveUntil(-14, 0)).toEqual(ret);
                ret.x = 0;
                expect(tetresse.pieceMoveUntil(-14, 0)).toEqual(ret);
                ret.ret = true;
                ret.y = 4;
                expect(tetresse.pieceMoveUntil(0, 4)).toEqual(ret);
                ret.ret = false;
                ret.y = -23;
                expect(tetresse.pieceMoveUntil(0, -40)).toEqual(ret);
                ret.y = 0;
                expect(tetresse.pieceMoveUntil(0, -40)).toEqual(ret);
                ret.y = 38;
                expect(tetresse.pieceMoveUntil(0, 50)).toEqual(ret);
                ret.y = 0;
                expect(tetresse.pieceMoveUntil(0, 50)).toEqual(ret);
            });
        });
        describe('pieceMoveAbsolute', () => {
            test('basic with total included', () => {
                expect(tetresse.pieceMoveAbsolute(8, 7)).toBe(true);
                expect(tetresse.state.turnData.xLoc).toBe(8);
                expect(tetresse.state.turnData.yLoc).toBe(7);
                expect(tetresse.state.turnData.xTotal).toBe(4);
                expect(tetresse.state.turnData.yTotal).toBe(12);                
                expect(tetresse.pieceMoveAbsolute(0, 14)).toBe(true);
                expect(tetresse.state.turnData.xLoc).toBe(0);
                expect(tetresse.state.turnData.yLoc).toBe(14);
                expect(tetresse.state.turnData.xTotal).toBe(12);
                expect(tetresse.state.turnData.yTotal).toBe(19);
            });
            test('basic with total not included', () => {
                expect(tetresse.pieceMoveAbsolute(8, 7, false)).toBe(true);
                expect(tetresse.state.turnData.xLoc).toBe(8);
                expect(tetresse.state.turnData.yLoc).toBe(7);
                expect(tetresse.state.turnData.xTotal).toBe(0);
                expect(tetresse.state.turnData.yTotal).toBe(0);                
                expect(tetresse.pieceMoveAbsolute(0, 14, false)).toBe(true);
                expect(tetresse.state.turnData.xLoc).toBe(0);
                expect(tetresse.state.turnData.yLoc).toBe(14);
                expect(tetresse.state.turnData.xTotal).toBe(0);
                expect(tetresse.state.turnData.yTotal).toBe(0);  
            });
        });
        describe('pieceTestMove', () => {

        });
        describe('pieceTestMoveAbsolute', () => {
    
        });
    });
    describe('pieceRotate', () => {
        var tArr = [[[0,1,0],[1,1,1],[0,0,0]]];
        for (var i = 0; i < 3; i++) {
            tArr.push(tet.u.copy(tArr[i]));
            TetresseManager.prototype.Tetresse.prototype.pieceRotateMatrix(tArr[i + 1], 1);
        }
        beforeEach(() => {
            tetresse.state.piece = 't';
            tetresse.pieceReset();
        });
        test('basic rotation increments correct values', () => {
            expect(tetresse.state.turnData.xLoc).toBe(3);
            expect(tetresse.state.turnData.yLoc).toBe(19);
            expect(tetresse.pieceRotate(1)).toBe(true);
            expect(tetresse.state.turnData.layout).toEqual(tArr[1]);
            expect(tetresse.state.turnData.rot).toBe(1);
            expect(tetresse.state.turnData.rotTotal).toBe(1);
            expect(tetresse.state.turnData.xLoc).toBe(3);
            expect(tetresse.state.turnData.yLoc).toBe(19);
            expect(tetresse.state.turnData.xTotal).toBe(0);
            expect(tetresse.state.turnData.yTotal).toBe(0);
            expect(tetresse.pieceRotate(-1)).toBe(true);
            expect(tetresse.state.turnData.layout).toEqual(tArr[0]);
            expect(tetresse.state.turnData.rot).toBe(0);
            expect(tetresse.state.turnData.rotTotal).toBe(2);
        });
        test('rotation works on multiple rotates', () => {

        });
        test('rotation works on amounts greater than 4', () => {
            tetresse.pieceRotate(15);
            expect(tetresse.state.turnData.rot).toBe(3);
            expect(tetresse.state.turnData.rotTotal).toBe(3);
            tetresse.pieceRotate(-13);
            expect(tetresse.state.turnData.rot).toBe(2);
            expect(tetresse.state.turnData.rotTotal).toBe(4);
        });
        test('kicks increment correct values as well', () => {
            tetresse.state.turnData.xLoc = 0;
            tetresse.state.turnData.yLoc = 0;
            tetresse.state.board = [
                ['i', '','i'],
                [ '', '', ''],
                ['i','i', ''],
                ['i', '', ''],
                ['i','i', '']
            ];
            expect(tetresse.pieceRotate(-1)).toBe(true);
            expect(tetresse.state.turnData.layout).toEqual(tArr[3]);
            expect(tetresse.state.turnData.rot).toBe(3);
            expect(tetresse.state.turnData.rotTotal).toBe(1);
            expect(tetresse.state.turnData.xLoc).toBe(1);
            expect(tetresse.state.turnData.yLoc).toBe(2);
            expect(tetresse.state.turnData.xTotal).toBe(1);
            expect(tetresse.state.turnData.yTotal).toBe(2);
        });
        describe('pieceTestRotate', () => {
            var ret;
            beforeEach(() => {
                ret = {ret: true, xOffset: 0, yOffset: 0, layout: tet.u.copy(tArr[1])};
            });
            test('basic valid rotation', () => {
                expect(tetresse.state.turnData.xLoc).toBe(3);
                expect(tetresse.state.turnData.yLoc).toBe(19);
                expect(tetresse.pieceTestRotate(1)).toEqual(ret);
                expect(tetresse.state.turnData.layout).toEqual(tArr[0]);
                expect(tetresse.state.turnData.rot).toBe(0);
                expect(tetresse.state.turnData.rotTotal).toBe(0);
                expect(tetresse.state.turnData.xLoc).toBe(3);
                expect(tetresse.state.turnData.yLoc).toBe(19);
                expect(tetresse.state.turnData.xTotal).toBe(0);
                expect(tetresse.state.turnData.yTotal).toBe(0);
                ret.layout = tArr[3];
                expect(tetresse.pieceTestRotate(-1)).toEqual(ret);
                expect(tetresse.state.turnData.layout).toEqual(tArr[0]);
                expect(tetresse.state.turnData.rot).toBe(0);
                expect(tetresse.state.turnData.rotTotal).toBe(0);
            });
            test('basic invalid rotation', () => {
                tetresse.state.turnData.xLoc = 0;
                tetresse.state.turnData.yLoc = 0;
                tetresse.state.board = [
                    ['','',''],
                    ['','',''],
                    ['i','i','i']
                ];
                ret.ret = false;
                expect(tetresse.pieceTestRotate(1)).toEqual(ret);
                ret.layout = tArr[3];
                expect(tetresse.pieceTestRotate(-1)).toEqual(ret);
            });
            test('tspin', () => {
                tetresse.state.turnData.xLoc = 0;
                tetresse.state.turnData.yLoc = 0;
                tetresse.state.board = [
                    ['i','','i'],
                    ['','',''],
                    ['i','','i']
                ];
                expect(tetresse.pieceTestRotate(1)).toEqual(ret);
                ret.layout = tArr[3];
                expect(tetresse.pieceTestRotate(-1)).toEqual(ret);
            });
            describe('kicks', () => {
                test('tspin tripple', () => {
                    tetresse.state.turnData.xLoc = 0;
                    tetresse.state.turnData.yLoc = 0;
                    tetresse.state.board = [
                        ['i', '','i'],
                        [ '', '', ''],
                        ['i','i', ''],
                        ['i', '', ''],
                        ['i','i', '']
                    ];
                    ret.layout = tArr[3];
                    ret.xOffset = 1;
                    ret.yOffset = 2;
                    expect(tetresse.pieceTestRotate(-1)).toEqual(ret);
                    tetresse.state.turnData.rot = 3;
                    tetresse.state.turnData.xLoc = 1;
                    tetresse.state.turnData.yLoc = 2;
                    tetresse.state.turnData.layout = ret.layout;
                    ret.layout = tArr[0];
                    ret.xOffset = -1;
                    ret.yOffset = -2;
                    expect(tetresse.pieceTestRotate(1)).toEqual(ret);
                });
                test('tspin tripple open', () => {
                    tetresse.state.turnData.xLoc = 1;
                    tetresse.state.turnData.yLoc = 1;
                    tetresse.state.board = [
                        ['', '', '', ''],
                        ['', '', '','i'],
                        ['', '', '', ''],
                        ['','i','i', ''],
                        ['','i', '', ''],
                        ['','i','i', '']
                    ];
                    ret.layout = tArr[3];
                    ret.xOffset = 1;
                    ret.yOffset = 2;
                    expect(tetresse.pieceTestRotate(-1)).toEqual(ret);
                    tetresse.state.turnData.rot = 3;
                    tetresse.state.turnData.xLoc = 2;
                    tetresse.state.turnData.yLoc = 3;
                    tetresse.state.turnData.layout = ret.layout;
                    ret.layout = tArr[0];
                    ret.xOffset = -1;
                    ret.yOffset = -2;
                    expect(tetresse.pieceTestRotate(1)).toEqual(ret);
                });
                test('tspin double kick into place', () => {
                    tetresse.state.turnData.xLoc = -1;
                    tetresse.state.turnData.yLoc = 0;
                    tetresse.state.turnData.rot = 1;
                    tetresse.state.turnData.layout = tArr[1];
                    tetresse.state.board = [
                        [ '', '', ''],
                        [ '', '','i'],
                        [ '', '', ''],
                        ['i', '','i'],
                    ];
                    ret.layout = tArr[2];
                    ret.xOffset = 1;
                    ret.yOffset = 1;
                    expect(tetresse.pieceTestRotate(1)).toEqual(ret);
                    tetresse.state.turnData.rot = 2;
                    tetresse.state.turnData.xLoc = 0;
                    tetresse.state.turnData.yLoc = 1;
                    tetresse.state.turnData.layout = ret.layout;
                    ret.layout = tArr[1];
                    ret.xOffset = 0;
                    ret.yOffset = 0;
                    expect(tetresse.pieceTestRotate(-1)).toEqual(ret);
                });
            });

        });
    });
    describe('pieceNext', () => {
        test('basic next on empty state', () => {
            expect(tetresse.pieceNext()).toBe(true);
            expect(tetresse.state.next.length).toBe(6);
        });
        test('when piece is set and next is empty still generates', () => {
            tetresse.state.piece = 'l';
            expect(tetresse.pieceNext()).toBe(true);
            expect(tetresse.state.next.length).toBe(6);
        });
        test('when generateNext is -1 pieces never generate', () => {
            tetresse.data.settings.generateNext = -1;
            expect(tetresse.pieceNext()).toBe(false);
            expect(tetresse.state.next.length).toBe(0);
            expect(tetresse.state.piece).toBe(null);
        });
        test('generateNext setting generates correct number', () => {
            tetresse.data.settings.generateNext = 7;
            expect(tetresse.pieceNext()).toBe(true);
            expect(tetresse.state.next.length).toBe(13);
            expect(tetresse.state.piece).not.toBe(null);
            tetresse.data.settings.generateNext = 19;
            expect(tetresse.pieceNext()).toBe(true);
            expect(tetresse.state.next.length).toBe(19);
            tetresse.data.settings.generateNext = 26;
            expect(tetresse.pieceNext()).toBe(true);
            expect(tetresse.state.next.length).toBe(32);
        });
        test('calls pieceReset afterwards', () => {
            tetresse.data.settings.pieceSpawnX = 'left';
            expect(tetresse.pieceNext()).toBe(true);
            tetresse.state.turnData.xLoc = 2;
            expect(tetresse.pieceNext()).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(0);
        });
    });
    describe('pieceReset', () => {
        test('basic piece reset', () => {
            var turnData = {
                xLoc: 0,
                yLoc: 0,
                rot: 0,
                xTotal: 0,
                yTotal: 0,
                rotTotal: 0,
                stalls: 0,
                hold: 0,
                layout: 0
            }
            for (var key in turnData) { turnData[key] = 100 * Math.random(); }
            tetresse.state.turnData = turnData;
            tetresse.pieceReset();
            for (var key in turnData) {
                if (key == 'layout') expect(tetresse.state.turnData[key]).toBe(null);
                else expect(tetresse.state.turnData[key]).toBe(0);
            }
        });
        test('with non null current piece', () => {
            tetresse.state.piece = 'o';
            tetresse.pieceReset();
            expect(tetresse.state.turnData.layout).toEqual([[1,1],[1,1]]);
        });
        test('takes from this tetresse data and not other tetresse data', () => {
            tetresse.data.pieces.layouts.o = [1,2];
            expect(tetresseManager.data.pieces.layouts.o).toEqual([[1,1],[1,1]]);
            tetresse.state.piece = 'o';
            tetresse.pieceReset();
            expect(tetresse.state.turnData.layout).toEqual([1,2]);
        });
        describe('setting pieceSpawnX gets set correctly', () => {
            var correct, maxCorrect;
            beforeEach(() => {
                correct = {
                    wide4: { center: 3, left: 0, right: 6, 'center-left': 3, 'center-right': 3 },
                    wide3: { center: 3.5, left: 0, right: 7, 'center-left': 3, 'center-right': 4 },
                    wide2: { center: 4, left: 0, right: 8, 'center-left': 4, 'center-right': 4 },
                    wide1: { center: 4.5, left: 0, right: 9, 'center-left': 4, 'center-right': 5 },
                };
                maxCorrect = 4;
                for (var i = 1; i <= maxCorrect; i++) {
                    var arr = [];
                    for (var j = 0; j < i; j++) {
                        var tmpArr = [];
                        for (var k = 0; k < i; k++) {
                            tmpArr.push(1);
                        }
                        arr.push(tmpArr);
                    }
                    correct['wide' + i].layout = arr;
                }
            });
            test('center', () => {
                tetresse.data.settings.pieceSpawnX = 'center';
                for (var i = 1; i <= maxCorrect; i++) {
                    tetresse.data.pieces.layouts['wide' + i] = correct['wide' + i].layout;
                    tetresse.state.piece = 'wide' + i;
                    tetresse.pieceReset();
                    expect(tetresse.state.turnData.xLoc).toBe(correct['wide' + i].center);
                }
            });
            test('center-left', () => {
                tetresse.data.settings.pieceSpawnX = 'center-left';
                for (var i = 1; i <= maxCorrect; i++) {
                    tetresse.data.pieces.layouts['wide' + i] = correct['wide' + i].layout;
                    tetresse.state.piece = 'wide' + i;
                    tetresse.pieceReset();
                    expect(tetresse.state.turnData.xLoc).toBe(correct['wide' + i]['center-left']);
                }
            });
            test('center-right', () => {
                tetresse.data.settings.pieceSpawnX = 'center-left';
                for (var i = 1; i <= maxCorrect; i++) {
                    tetresse.data.pieces.layouts['wide' + i] = correct['wide' + i].layout;
                    tetresse.state.piece = 'wide' + i;
                    tetresse.pieceReset();
                    expect(tetresse.state.turnData.xLoc).toBe(correct['wide' + i]['center-left']);
                }
            });
            test('right', () => {
                tetresse.data.settings.pieceSpawnX = 'right';
                for (var i = 1; i <= maxCorrect; i++) {
                    tetresse.data.pieces.layouts['wide' + i] = correct['wide' + i].layout;
                    tetresse.state.piece = 'wide' + i;
                    tetresse.pieceReset();
                    expect(tetresse.state.turnData.xLoc).toBe(correct['wide' + i]['right']);
                }
            });
            test('left', () => {
                tetresse.data.settings.pieceSpawnX = 'left';
                for (var i = 1; i <= maxCorrect; i++) {
                    tetresse.data.pieces.layouts['wide' + i] = correct['wide' + i].layout;
                    tetresse.state.piece = 'wide' + i;
                    tetresse.pieceReset();
                    expect(tetresse.state.turnData.xLoc).toBe(correct['wide' + i]['left']);
                }
            });
            test('default behavior', () => {
                tetresse.data.settings.pieceSpawnX = tet.u.randString(6);
                for (var i = 1; i <= maxCorrect; i++) {
                    tetresse.data.pieces.layouts['wide' + i] = correct['wide' + i].layout;
                    tetresse.state.piece = 'wide' + i;
                    tetresse.pieceReset();
                    expect(tetresse.state.turnData.xLoc).toBe(correct['wide' + i].left);
                }
            });
        });
        test('pieceSpawnY gets set correctly', () => {
            tetresse.state.piece = 'i';
            tetresse.pieceReset();
            expect(tetresse.state.turnData.yLoc).toBe(19);
            tetresse.data.settings.pieceSpawnY = 30;
            tetresse.pieceReset();
            expect(tetresse.state.turnData.yLoc).toBe(30);
        });
    });
    describe('pieceTestHold', () => {

    });
    describe('pieceBoardTestValid', () => {
        var threeArr = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        test('basic', () => {
            expect(tetresse.pieceBoardTestValid(0, 0, threeArr)).toBe(true);
            expect(tetresse.pieceBoardTestValid(-1, 0, threeArr)).toBe(false);
            tetresse.state.board[0][0] = 'i';
            expect(tetresse.pieceBoardTestValid(0, 0, threeArr)).toBe(false);
        });
    });
    describe('pieceBoardTestNotOutOfBounds', () => {
        var threeArr = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
        test('basic valid', () => {
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, 0, threeArr)).toBe(true);
        });
        test('on left', () => {
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, 0, threeArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOutOfBounds(-1, 0, threeArr)).toBe(false);
        });
        test('on right', () => {
            expect(tetresse.pieceBoardTestNotOutOfBounds(7, 0, threeArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOutOfBounds(8, 0, threeArr)).toBe(false);
        });
        test('on top', () => {
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, 0, threeArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, -1, threeArr)).toBe(false);
        });
        test('on bottom', () => {
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, 37, threeArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, 38, threeArr)).toBe(false);
        });
        test('layout out of bounds, piece in bounds', () => {
            validArr = [[0, 1, 1], [0, 1, 1], [0, 1, 1]];
            expect(tetresse.pieceBoardTestNotOutOfBounds(0, 0, validArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOutOfBounds(-1, 0, validArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOutOfBounds(-2, 0, validArr)).toBe(false);
        });
    });
    describe('pieceBoardTestNotOverlap', () => {
        var threeArr = [[0, 1, 1], [0, 1, 1], [0, 1, 1]];
        test('basic valid', () => {
            expect(tetresse.pieceBoardTestNotOverlap(0, 0, threeArr)).toBe(true);
        });
        test('valid partial overlap', () => {
            tetresse.state.board[0][0] = 'i';
            expect(tetresse.pieceBoardTestNotOverlap(0, 0, threeArr)).toBe(true);
        });
        test('invalid overlap', () => {
            tetresse.state.board[0][1] = 'i';
            expect(tetresse.pieceBoardTestNotOverlap(0, 0, threeArr)).toBe(false);
        });
        test('valid partially over the board edge', () => {
            var leftArr = [[0, 1, 1], [0, 1, 1], [0, 1, 1]];
            var topArr = [[0, 0, 0], [1, 1, 1], [1, 1, 1]];
            var rightArr = [[1, 1, 0], [0, 1, 0], [0, 1, 0]];
            var botArr = [[1, 1, 1], [1, 1, 1], [0, 0, 0]];
            expect(tetresse.pieceBoardTestNotOverlap(-1, 0, leftArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOverlap(0, -1, topArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOverlap(8, 0, rightArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOverlap(0, 38, botArr)).toBe(true);
            // off the board
            expect(tetresse.pieceBoardTestNotOverlap(-10, 0, leftArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOverlap(0, -10, topArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOverlap(80, 0, rightArr)).toBe(true);
            expect(tetresse.pieceBoardTestNotOverlap(0, 380, botArr)).toBe(true);
        });
    });
    describe('detail functions', () => {
        var xLoc, yLoc;
        beforeEach(() => {
            tetresse.pieceNext();
            xLoc = tetresse.state.turnData.xLoc;
            yLoc = tetresse.state.turnData.yLoc;
        });
        test('move right', () => {
            expect(tetresse.pieceDetailsMoveRight()).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(xLoc + 1);
        });
        test('move left', () => {
            expect(tetresse.pieceDetailsMoveLeft()).toBe(true);
            expect(tetresse.state.turnData.xLoc).toBe(xLoc - 1);
        });
        test('rotate CW', () => {
            expect(tetresse.pieceDetailsRotateCW()).toBe(true);
            expect(tetresse.state.turnData.rot).toBe(1);
        });
        test('rotate CCW', () => {
            expect(tetresse.pieceDetailsRotateCCW()).toBe(true);
            expect(tetresse.state.turnData.rot).toBe(3);
        });
        test('soft drop', () => {
            expect(tetresse.pieceDetailsSoftDrop()).toBe(true);
            expect(tetresse.state.turnData.yLoc).toBe(yLoc + 1);
        });
        test('hard drop', () => {
            tetresse.state.piece = 'o';
            tetresse.pieceReset();
            var ret = {
                ret: false,
                x: 0,
                y: 19,
            }
            expect(tetresse.pieceDetailsHardDrop()).toEqual(ret);
            expect(tetresse.state.turnData.yLoc).toBe(38);
        });
    });
    describe('boardTestFilledRow', () => {
        test('basic filled row', () => {
            tetresse.state.board = [['a','b','c']];
            expect(tetresse.boardTestFilledRow(0)).toBe(true);
        });
        test('not filled row mixed', () => {
            tetresse.state.board = [['a','b',''],['','b','c'],['a','','c']];
            expect(tetresse.boardTestFilledRow(0)).toBe(false);
            expect(tetresse.boardTestFilledRow(1)).toBe(false);
            expect(tetresse.boardTestFilledRow(2)).toBe(false);
        });
        test('invalid row number', () => {
            expect(tetresse.boardTestFilledRow(-1)).toBe(false);
            expect(tetresse.boardTestFilledRow(100)).toBe(false);
        });
    });
    describe('pieceBoardPlace', () => {
        var board;
        beforeEach(() => {
            board = [
                ['','','',''],
                ['','','',''],
                ['','','',''],
                ['','','',''],
            ];
            tetresse.state.board = tet.u.copy(board);
            tetresse.state.piece = 'o';
            tetresse.pieceReset();
            tetresse.state.turnData.xLoc = 0;
            tetresse.state.turnData.yLoc = 0;
        });
        test('basic piece place', () => {
            tetresse.pieceBoardPlace();
            expect(tetresse.state.board).toEqual([['o','o','',''],['o','o','',''],['','','',''],['','','','']]);
            tetresse.state.turnData.xLoc = 2;
            tetresse.state.turnData.yLoc = 2;
            tetresse.pieceBoardPlace();
            expect(tetresse.state.board).toEqual([['o','o','',''],['o','o','',''],['','','o','o'],['','','o','o']]);
        });
        test('over edge of board piece place', () => {
            tetresse.state.turnData.xLoc = -1;
            tetresse.state.turnData.yLoc = -1;
            tetresse.pieceBoardPlace();
            expect(tetresse.state.board).toEqual([['o','','',''],['','','',''],['','','',''],['','','','']]);
        });
        test('overwrite piece place', () => {
            tetresse.state.board[0][0] = 'p';
            tetresse.state.board[3][3] = 'p';
            tetresse.pieceBoardPlace();
            expect(tetresse.state.board).toEqual([['o','o','',''],['o','o','',''],['','','',''],['','','','p']]);
        });
    });
    describe('boardCollapse', () => {
        test('basic collapse', () => {
            tetresse.state.board = [['a', 'a'],['b',''],['c','c']];
            var ret = [{row: 2, value: ['c','c']},{row: 0, value: ['a','a']}];
            expect(tetresse.boardCollapse()).toEqual(ret);
            expect(tetresse.state.board).toEqual([['', ''],['', ''],['b','']]);
        });
        test('no rows', () => {
            tetresse.state.board = [['', 'a'],['b',''],['c','']];
            var ret = [];
            expect(tetresse.boardCollapse()).toEqual(ret);
            expect(tetresse.state.board).toEqual([['', 'a'],['b', ''],['c','']]);
        });
        test('all rows', () => {
            tetresse.state.board = [['a', 'a'],['b','b'],['c','c']];
            var ret = [{row: 2, value: ['c','c']},{row: 1, value: ['b','b']},{row: 0, value: ['a','a']}];
            expect(tetresse.boardCollapse()).toEqual(ret);
            expect(tetresse.state.board).toEqual([['', ''],['', ''],['','']]);
        });
    });
    describe('boardToString', () => {
        test('basic format', () => {
            tetresse.state.board = [
                ['t', 'h', 'i', '', 's'],
                ['i', 's'],
                ['', 't', '', '', 'e', 's', 't', '']
            ];
            expect(tetresse.boardToString()).toBe('thi s\nis\n t  est ');
        });
    });
});
