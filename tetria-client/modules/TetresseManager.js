/**
 * TODO
 * - add different bag randomizers to next
 * - pieceBoardTestNotOutOfBounds make more efficient (only check out of bounds portions)
 * - pieceReset log invalid setting
 * - test settings (valid board spawn config, etc)
 * - remake pieceRotateMatrix to return rotated matrix (and make it not only squares)
 * - add functionality for multiple players playing on one board
 * - add ability functions
 * - test tetresse listener manager (or redo it)
 * - test prenext listener can end next
 * - test new tetresse id gets added on create
 * - add test for pieceDetailsRotateCWW and CCWW
 * - test pieceResetFailLoop flag
 */
(function() {
    var tetresseManager = function(idGenerator) {
        if (idGenerator == undefined) {
            idGenerator = new this.idManager.Generator({prepend: 'tetresse-', length: 10});
        }
        this.idGenerator = idGenerator;
    
        this.events = {};
        this.Tetresse.prototype.tetresseManager = this;
    };
    
    tetresseManager.prototype._managers = ['IdManager', 'ListenerManager'];
    
    tetresseManager.prototype.data = {
        settings: {
            boardWidth: 10,
            boardHeight: 40,
            playHeight: 20,
            generateNext: 4,
            softdrop: 40,
            holdsPerTurn: 1, // number of holds allowed per turn (-1 for unlimited)
            pieceSpawnX: 'center-left', // 'center-right', 'right', 'left'
            pieceSpawnY: 19, // top row is 0
            // endGamePushPieceUp: 1, // number of rows above the piece it is able to spawn
            pieceResetFailLoop: false
        },
        pieces: {
            layouts: {
                i: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
                j: [[1,0,0],[1,1,1],[0,0,0]],
                l: [[0,0,1],[1,1,1],[0,0,0]],
                o: [[1,1],[1,1]],
                s: [[0,1,1],[1,1,0],[0,0,0]],
                t: [[0,1,0],[1,1,1],[0,0,0]],
                z: [[1,1,0],[0,1,1],[0,0,0]]
            },
            rotationChart: {
                default: [
                    [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]], // 0>>1
                    [[0,0], [1,0], [1,-1], [0,2], [1,2]], // 1>>2
                    [[0,0], [1,0], [1,1], [0,-2], [1,-2]], // 2>>3
                    [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]] // 3>>0
                ],
                i: [
                    [[0,0], [-2,0], [1,0], [-2,-1], [1,2]], // 0>>1
                    [[0,0], [-1,0], [2,0], [-1,2], [2,-1]], // 1>>2
                    [[0,0], [2,0], [-1,0], [2,1], [-1,-2]], // 2>>3
                    [[0,0], [1,0], [-2,0], [1,-2], [-2,1]] // 3>>0
                ]
            },
            colors: {
                i: "hsl(196, 89%, 57%)",
                j: "hsl(231, 69%, 45%)",
                l: "hsl(24, 98%, 44%)",
                o: "hsl(42, 97%, 45%)",
                s: "hsl(92, 91%, 37%)",
                t: "hsl(314, 63%, 41%)",
                z: "hsl(348, 86%, 45%)",
                blank: "black",
                g: "grey",
            }
        },
    }
    
    var tetresse = function() {
        this.data = this.tetresseManager.tet.u.copy(this.tetresseManager.data);
        this.state = {};
        this.lm = new this.tetresseManager.tet.o.ListenerManager();
        this.tetresseManager.idGenerator.create(this, 'id');
        this.resetState();
        this.tetresseManager = this.tetresseManager;
    };
    tetresseManager.prototype.Tetresse = tetresse;
    
    tetresse.prototype.resetState = function() {
        this.state.piece = null;
        this.state.hold = null;
        this.state.next = [];
        this.state.incoming = 0;
        this.state.abilities = {};
        this.state.turnData = {}; // see piece reset
        this.boardReset();
        this.pieceReset();
        this.lm.fire('reset');
        // this.tetresseManager.listenerManager.fire('resetState', this.state);
    };
    tetresse.prototype.boardReset = function() {
        var board = [];
        for (var r = 0; r < this.data.settings.boardHeight; r++) {
            var arr = [];
            for (var c = 0; c < this.data.settings.boardWidth; c++) {
                arr.push('');
            }
            board.push(arr);
        }
    
        this.state.board = board;
    };
    tetresse.prototype.pieceReset = function() {
        var retVal = true;
        this.state.turnData.xLoc = 0;
        this.state.turnData.yLoc = 0;
        this.state.turnData.rot = 0;
        this.state.turnData.xTotal = 0;
        this.state.turnData.yTotal = 0;
        this.state.turnData.rotTotal = 0;

        this.state.turnData.stalls = 0;
        this.state.turnData.hold = 0;

        var ret;
        if (this.state.piece == null) {
            this.state.turnData.layout = null;
        } else {
            this.state.turnData.layout = this.tetresseManager.tet.u.copy(this.data.pieces.layouts[this.state.piece]);
            if (this.data.settings.pieceSpawnX.startsWith('center')) {
                var boardWidth = this.state.board[0].length;
                var layoutWidth = this.state.turnData.layout[0].length;
                this.state.turnData.xLoc = boardWidth / 2 - layoutWidth / 2;
                if (this.data.settings.pieceSpawnX.endsWith('-right')) {
                    this.state.turnData.xLoc = Math.ceil(this.state.turnData.xLoc);
                } else if (this.data.settings.pieceSpawnX.endsWith('-left')) {
                    this.state.turnData.xLoc = Math.floor(this.state.turnData.xLoc);
                }
                // todo could log invalid setting here as well
            } else if (this.data.settings.pieceSpawnX == 'right') {
                this.state.turnData.xLoc = this.state.board[0].length - this.state.turnData.layout[0].length;
            } else if (this.data.settings.pieceSpawnX != 'left') {
                // todo log invalid setting here
            }
            this.state.turnData.yLoc = this.data.settings.pieceSpawnY;
            if (this.data.settings.pieceResetFailLoop) {
                if (!this.pieceBoardTestValid(this.state.turnData.xLoc, this.state.turnData.yLoc, this.state.turnData.layout)) {
                    var xInitial = this.state.turnData.xLoc;
                    var yInitial = this.state.turnData.yLoc;
                    do {
                        ret = {ret: false, xOffset: 0, yOffset: 0, xInitial: xInitial, yInitial: yInitial};
                        this.lm.fire('pieceReset-failed', ret);
                        if (ret.ret) { retVal = false; break; }
                        this.state.turnData.xLoc += ret.xOffset;
                        this.state.turnData.yLoc += ret.yOffset;
                    } while (!this.pieceBoardTestValid(this.state.turnData.xLoc, this.state.turnData.yLoc, this.state.turnData.layout))
                }    
            }
        }
        this.lm.fire('piece-reset');
        if (!retVal) this.lm.fire('pieceReset-failed', ret);
        return retVal;
    };
    tetresse.prototype.pieceNext = function() {
        var first = this.state.next.length == 0;
        while (this.state.next.length < this.data.settings.generateNext + 1) {
            var pieces = this.getPieces();
            this.pieceShuffle(pieces);
            this.state.next = this.state.next.concat(pieces);
        }
        if (this.state.next.length != 0) {
            this.state.piece = this.state.next.splice(0, 1)[0];
        } else {
            this.state.piece = null;
        }
        if (!this.pieceReset()) return false;
        if (first) this.lm.fire('next-first');
        this.lm.fire('next');
        return this.state.piece != null;
    };
    tetresse.prototype.getPieces = function() { return ['i', 'j', 'l', 'o', 's', 't', 'z']; }
    tetresse.prototype.pieceShuffle = function(arr) {
        try {
            if (typeof(arr.length) != 'number') return false;
        } catch (e) { return false; }
        // Fisher-Yates shuffle
        var m = arr.length, t, i;
        while (m) {
            i = Math.floor(this.tetresseManager.tet.u.random() * m--);
            t = arr[m];
            arr[m] = arr[i];
            arr[i] = t;
        }
        return true;
    };
    tetresse.prototype.pieceHold = function(test = false) {
        if (!this.pieceTestHold()) return false;
        var temp = this.state.hold;
        this.state.hold = this.state.piece;
        this.state.piece = temp;
        var holdNum = this.state.turnData.hold + 1;
        if (this.state.piece == null) this.pieceNext();
        else this.pieceReset();
        this.state.turnData.hold = holdNum;
        this.lm.fire('hold');
        return true;
    };
    tetresse.prototype.pieceTestHold = function() {
        if (this.data.settings.holdsPerTurn != -1) {
            if (this.state.turnData.hold >= this.data.settings.holdsPerTurn) return false;
        }
        return true;
    };
    tetresse.prototype.pieceMove = function(xOffset, yOffset) {
        if (!this.pieceTestMove(xOffset, yOffset)) return false;
        this.state.turnData.xLoc += xOffset;
        this.state.turnData.yLoc += yOffset;
        this.state.turnData.xTotal += Math.abs(xOffset);
        this.state.turnData.yTotal += Math.abs(yOffset);
        this.lm.fire('move', {xOffset: xOffset, yOffset: yOffset});
        return true;
    };
    tetresse.prototype.pieceMoveUntil = function(xOffset, yOffset, setPiece = true) {
        var ret = {
            ret: true,
            x: 0,
            y: 0
        }
        for (ret.x = 0; Math.abs(ret.x) < Math.abs(xOffset); xOffset < 0 ? ret.x-- : ret.x++) {
            if (!this.pieceTestMove(ret.x, 0)) {
                ret.ret = false;
                ret.x += xOffset < 0 ? 1 : -1
                break;
            }
        }
        for (ret.y = 0; Math.abs(ret.y) < Math.abs(yOffset); yOffset < 0 ? ret.y-- : ret.y++) {
            if (!this.pieceTestMove(ret.x, ret.y)) {
                ret.ret = false;
                ret.y += yOffset < 0 ? 1 : -1;
                break;
            }
        }
        if (setPiece) this.pieceMove(ret.x, ret.y);
        return ret;
    };
    tetresse.prototype.pieceMoveAbsolute = function(x, y, addToTotal = true) {
        if (addToTotal) return this.pieceMove(x - this.state.turnData.xLoc, y - this.state.turnData.yLoc);
        if (!this.pieceTestMoveAbsolute(x, y)) return false;
        this.state.turnData.xLoc = x;
        this.state.turnData.yLoc = y;
        this.lm.fire('move');
        return true;
    };
    tetresse.prototype.pieceTestMove = function(xOffset, yOffset) {
        return this.pieceTestMoveAbsolute(this.state.turnData.xLoc + xOffset, this.state.turnData.yLoc + yOffset);
    };
    tetresse.prototype.pieceTestMoveAbsolute = function(x, y) {
        return this.pieceBoardTestValid(x, y, this.state.turnData.layout);
    };
    tetresse.prototype.pieceRotate = function(amount) {
        var rotateTest = this.pieceTestRotate(amount);
        if (!rotateTest.ret) return false;
        this.state.turnData.layout = rotateTest.layout;
        this.state.turnData.xLoc += rotateTest.xOffset;
        this.state.turnData.yLoc += rotateTest.yOffset;
        this.state.turnData.xTotal += rotateTest.xOffset;
        this.state.turnData.yTotal += rotateTest.yOffset;
        var amt = (amount % 4 + 4) % 4;
        this.state.turnData.rot = (this.state.turnData.rot + amt) % 4;
        this.state.turnData.rotTotal += Math.abs(amount % 4);
        this.lm.fire('rotate', amount);
        return true;
    };
    tetresse.prototype.pieceRotateMatrix = function(arr, amount = 0) { // rotates array provided cw (square)
        try {
            if (arr.length != arr[0].length || typeof(amount) != 'number') return false;
        } catch (e) { return false; }
        var i, j, temp;
        for (amount = (amount % 4 + 4) % 4; amount !== 0; amount--) {
            for (i = 0; i < arr.length / 2; i++) {
                temp = [];
                for (j = 0; j < arr[i].length; j++)
                    temp.push(arr[i][j]);
                arr[i] = arr[arr.length - 1 - i];
                arr[arr.length - 1 - i] = temp;
            }
            for (i = 0; i < arr.length; i++) {
                for (j = 0; j < i; j++) {
                    temp = arr[i][j];
                    arr[i][j] = arr[j][i];
                    arr[j][i] = temp;
                }
            }
        }
        return true;
    };
    tetresse.prototype.pieceTestRotate = function(amount) {
        var ret = {
            ret: false, // whether or not amount specified is possible
            xOffset: 0,
            yOffset: 0,
            layout: this.tetresseManager.tet.u.copy(this.state.turnData.layout)
        };
        this.pieceRotateMatrix(ret.layout, amount);

        var amt = (amount % 4 + 4) % 4;
        var rotationChart = this.data.pieces.rotationChart[this.state.piece === 'i' ? 'i' : 'default'];
        var rotNum = amount >= 0 ? (this.state.turnData.rot + amt + 3) % 4 : (amt + this.state.turnData.rot) % 4;
        var x, y, xOff, yOff;
        for (var i = 0; i < rotationChart[rotNum].length; i++) {
            x = this.state.turnData.xLoc + (xOff = rotationChart[rotNum][i][0] * Math.sign(amount));
            y = this.state.turnData.yLoc + (yOff = (-1) * rotationChart[rotNum][i][1] * Math.sign(amount));
            if (this.pieceBoardTestValid(x, y, ret.layout)) {
                ret.ret = true;
                ret.xOffset = xOff;
                ret.yOffset = yOff;
                break;
            }
        }
        if (ret.xOffset === 0) ret.xOffset = 0;
        if (ret.yOffset === 0) ret.yOffset = 0;
        return ret;
    };
    tetresse.prototype.pieceBoardTestValid = function(x, y, layout) {
        return this.pieceBoardTestNotOutOfBounds(x, y, layout) && this.pieceBoardTestNotOverlap(x, y, layout);
    };
    tetresse.prototype.pieceBoardTestNotOutOfBounds = function(x, y, layout) {
        for (var r = 0; r < layout.length; r++) {
            for (var c = 0; c < layout[0].length; c++) {
                if (layout[r][c] != 0) {
                    if (y + r < 0 || y + r >= this.state.board.length) return false;
                    if (x + c < 0 || x + c >= this.state.board[0].length) return false;    
                }
            }
        }
        return true;
    };
    tetresse.prototype.pieceBoardTestNotOverlap = function(x, y, layout) {
        for (var r = y < 0 ? Math.abs(y) : 0; r < layout.length && y + r < this.state.board.length; r++) {
            for (var c = x < 0 ? Math.abs(x) : 0; c < layout[0].length && x + c < this.state.board[0].length; c++) {
                if (layout[r][c] != 0) {
                    if (this.state.board[y + r][x + c] != '') return false;
                }
            }
        }
        return true;
    };
    tetresse.prototype.pieceDetailsMoveLeft = function() {
        this.lm.fire('move-left');
        return this.pieceMove(-1, 0);
    };
    tetresse.prototype.pieceDetailsMoveRight = function() {
        this.lm.fire('move-right');
        return this.pieceMove(1, 0);
    };
    tetresse.prototype.pieceDetailsMoveLeftAR = function() {
        this.lm.fire('move-leftAR');
        return this.pieceMove(-1, 0);
    };
    tetresse.prototype.pieceDetailsMoveRightAR = function() {
        this.lm.fire('move-rightAR');
        return this.pieceMove(1, 0);
    };
    tetresse.prototype.pieceDetailsRotateCW = function() {
        return this.pieceRotate(1);
    };
    tetresse.prototype.pieceDetailsRotateCCW = function() {
        return this.pieceRotate(-1);
    };
    tetresse.prototype.pieceDetailsRotateCWW = function() {
        return this.pieceRotate(2);
    };
    tetresse.prototype.pieceDetailsRotateCCWW = function() {
        return this.pieceRotate(-2);
    };
    tetresse.prototype.pieceDetailsSoftDrop = function() {
        this.lm.fire('softdrop');
        return this.pieceMove(0, 1);
    };
    tetresse.prototype.pieceDetailsHardDrop = function() {
        var ret = this.pieceMoveUntil(0, this.data.settings.boardHeight + this.state.turnData.layout[0].length)
        this.lm.fire('harddrop');
        return ret;
    };
    tetresse.prototype.pieceBoardPlace = function() {
        var layout = this.state.turnData.layout;
        for (var r = 0; r < layout.length; r++) {
            var row = r + this.state.turnData.yLoc;
            if (row < 0 || row >= this.state.board.length) continue;
            for (var c = 0; c < layout[r].length; c++) {
                if (layout[r][c] == 0) continue;
                var col = c + this.state.turnData.xLoc;
                if (col < 0 || col >= this.state.board[row].length) continue;
                this.state.board[row][col] = this.state.piece;
            }
        }
        this.lm.fire('piece-placed');
    };
    tetresse.prototype.boardCollapse = function() {
        var filledRows = [];
        for (var r = this.state.board.length - 1; r >= 0; r--) {
            if (this.boardTestFilledRow(r)) {
                filledRows.push({row: r, value: this.state.board.splice(r, 1)[0]})
            }
        }
        for (var i = 0; i < filledRows.length; i++) {
            var arr = [];
            for (var c = 0; c < filledRows[i].value.length; c++) arr.push('');
            this.state.board.splice(0, 0, arr);
        }

        if (filledRows.length > 0) this.lm.fire('lines-cleared', filledRows);
        return filledRows;
    };
    tetresse.prototype.boardTestFilledRow = function(r) {
        if (r < 0 || r > this.state.board.length) return false;
        var row = this.state.board[r];
        for (var e of row) {
            if (e == '') return false;
        }
        return true;
    };
    tetresse.prototype.boardToString = function() {
        var ret = '';
        for (var row of this.state.board) {
            for (var ele of row) {
                if (ele.length == 0) {
                    ret += ' ';
                } else {
                    ret += ele;
                }
            }
            ret += '\n';
        }
        return ret.substring(0, ret.length - 1);
    };

    try {
        tet.exports = tetresseManager;
    } catch (e) {
        try {
            module.exports = tetresseManager;
        } catch (e) {
            TetresseManager = tetresseManager;
        }
    }
})();
