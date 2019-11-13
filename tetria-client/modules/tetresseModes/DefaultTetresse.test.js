/**
 * TODO:
 * - finish writing these tests
 */

const tet = require('../../tet.js');
var DefaultTetresse;
tet.addModule(require('../IdManager.js'));
tet.addModule(require('../ActionManager.js'));
tet.addModule(require('../ListenerManager.js'));
tet.addModule(require('../TetresseManager.js'));
tet.addModule(DefaultTetresse = require('./DefaultTetresse.js'));

var defaultTetresse;
beforeEach(() => {
    defaultTetresse = new DefaultTetresse();
});

test('test', () => {

});

describe('tetresse', () => {
    test('harddrop spawns next piece', () => {
        defaultTetresse.start();
        var piece = defaultTetresse.tetresse.state.piece;
        defaultTetresse.tetresse.pieceDetailsSoftDrop();
        expect(defaultTetresse.tetresse.state.piece).toBe(piece);
        defaultTetresse.tetresse.pieceDetailsHardDrop();
        expect(defaultTetresse.tetresse.state.piece).not.toBe(piece);
        piece = defaultTetresse.tetresse.state.piece;
        defaultTetresse.tetresse.pieceDetailsSoftDrop();
        expect(defaultTetresse.tetresse.state.piece).toBe(piece);
    });
    test('piece reset failes tries one higher then fails', () => {
        defaultTetresse.tetresse.state.piece = 'o';
        expect(defaultTetresse.tetresse.pieceReset()).toBe(true);
        defaultTetresse.tetresse.state.board[21][4] = 'i';
        var y = defaultTetresse.tetresse.state.turnData.yLoc;
        expect(defaultTetresse.tetresse.pieceReset()).toBe(true);
        expect(defaultTetresse.tetresse.state.turnData.yLoc).toBe(y);
        defaultTetresse.tetresse.state.board[20][4] = 'i';
        expect(defaultTetresse.tetresse.pieceReset()).toBe(true);
        expect(defaultTetresse.tetresse.state.turnData.yLoc).toBe(y - 1);
        defaultTetresse.tetresse.state.board[19][4] = 'i';
        expect(defaultTetresse.tetresse.pieceReset()).toBe(false);
        defaultTetresse.tetresse.state.next = ['o'];
        expect(defaultTetresse.tetresse.pieceNext()).toBe(false);
        expect(defaultTetresse.tetresse.state.piece).toBe('o');
    });
    describe('default', () => {
        test('start', () => {

        });
        test('end', () => {

        });
        test('reset', () => {

        });
        test('endStart', () => {

        });
        test('resetStart', () => {

        });
    });
});