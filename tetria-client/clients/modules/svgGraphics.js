/**
 * TODO next: layouts (board, board+next, board+next+moreNext, board+next+hold, board+next+moreNext+hold, ...+incoming)
 * 
 * var g = new SVGGraphics();
 * g.linkTetresse(game);
 * g.setParts(["board", "incoming", "hold", "next", "moreNext"]);
 */
(function() {
    var svgGraphics = function(parentElement) {
        this.parent = parentElement;
        this.id = this.newId();
        this.ids[this.id] = this;
        this.game = null;

        this.svg = this.build(this.dataSVG());
        this.svg.classList.add("svgGraphics");

        var tmpDiv = document.createElement('div');
        tmpDiv.innerHTML = this.focusIcon;
        var focusIconEle = tmpDiv.children[0];
        tmpDiv.removeChild(focusIconEle);
        this.svg.appendChild(focusIconEle);

        this.parent.appendChild(this.svg);
        this.svg.addEventListener("load", this.refresh.bind(this));

        this.template = this.dataDefaultTemplate();
        this.generatedTemplate = {};
        this.settings = {
            ghost: true,
            showNext: 4
        }
    };

    try {
        tet.exports = svgGraphics;
    } catch (e) {
        SVGGraphics = svgGraphics;
    }

    svgGraphics.prototype.constructor = svgGraphics;
    svgGraphics.prototype.ids = {};
    svgGraphics.prototype.linkTetresse = function(tetresse) {
        this.game = tetresse;
        // tetresse.lm.on('')

        tetresse.lm.on('next', this.tet.m.actionManager.create(this.refreshPiece, this), 80),
        tetresse.lm.on('next', this.tet.m.actionManager.create(this.refreshNext, this), 80),
        tetresse.lm.on('next', this.tet.m.actionManager.create(this.refreshBoard, this), 80),
        tetresse.lm.on('hold', this.tet.m.actionManager.create(this.refreshPiece, this), 80),
        tetresse.lm.on('hold', this.tet.m.actionManager.create(this.refreshHold, this), 80),
        tetresse.lm.on('move', this.tet.m.actionManager.create(this.refreshPiece, this), 80),
        tetresse.lm.on('rotate', this.tet.m.actionManager.create(this.refreshPiece, this), 80),
        // game.listener.on("initcur", this.refreshPiece, {this: this, args: [game]}, 80);
        // todo set listeners
        this.refresh();
    };
    svgGraphics.prototype.setParts = function(parts, template = this.template) { // array of strings (rendered in order of array)
        this.generatedTemplate = this.parseTemplate(parts, template);
        this.refresh();
    };
    svgGraphics.prototype.refresh = function() {
        var width = window.getComputedStyle(this.parent).getPropertyValue("width");
        var height = window.getComputedStyle(this.parent).getPropertyValue("height");
        this.svg.setAttribute("width", width);
        this.svg.setAttribute("height", height);
        var width = 0;
        var height = 0;
        for (var part in this.generatedTemplate) {
            var p = this.generatedTemplate[part];
            if (width < p.x + p.width) width = p.x + p.width;
            if (height < p.y + p.height) height = p.y + p.height;
        }
        this.svg.setAttribute("viewBox", "0 0 " + width + " " + height);

        if (this.generatedTemplate == null) return;
        this.refreshBoard();
        this.refreshPiece();
        this.refreshNext();
        this.refreshHold();
        this.refreshIncoming();
    };
    svgGraphics.prototype.refreshPiece = function() {
        if (this.game == null) return;
        if (this.game.state.piece == null) return;
        if (this.generatedTemplate.board == null) return;
        this.refreshGhost();

        var ele;
        if ((ele = document.getElementById(this.svg.id + "-piece")) == null) {
            var pieceData = this.buildPiece();
            pieceData.children[0].attributes.id = this.svg.id + "-piece";
            this.svg.appendChild(ele = this.build(pieceData));
            ele = ele.children[0];
        }
        // update loc
        var xOffset = (this.game.state.turnData.xLoc) * 4;
        var yOffset = (this.game.state.turnData.yLoc - 19.5) * 4;
        ele.setAttribute("x", xOffset);
        ele.setAttribute("y", yOffset);
        // update orientation of piece
        var offsets = [];
        var layout = this.game.state.turnData.layout;
        for (var r = 0; r < layout.length; r++) {
            for (var c = 0; c < layout[0].length; c++) {
                if (layout[r][c] == 1) {
                    offsets.push({r: r, c: c});
                }
            }
        }
        for (var i = 0; i < 4; i++) {
            ele.children[i].setAttribute("x", offsets[i].c * 4);
            ele.children[i].setAttribute("y", offsets[i].r * 4);
        }

        // update color
        if (ele.classList.contains(this.game.state.piece)) return;
        ele.classList.remove("i", "j", "l", "o", "s", "t", "z", "blank", "g", "ghost", "none"); // todo-magicNumber make this a constant
        ele.classList.add(this.game.state.piece);
    };
    svgGraphics.prototype.refreshGhost = function() {
        if (this.game == null) return;
        if (this.game.state.piece == null) return;
        if (!this.settings.ghost) return;
        var ele;
        if ((ele = document.getElementById(this.svg.id + "-ghost")) == null) {
            var ghostData = this.buildPiece();
            ghostData.children[0].attributes.id = this.svg.id + "-ghost";
            ghostData.children[0].attributes.class += " ghost";
            this.svg.appendChild(ele = this.build(ghostData));
            ele = ele.children[0];
        }
        // update loc
        var xOffset = (this.game.state.turnData.xLoc) * 4;
        var yOffset = (this.game.state.turnData.yLoc + this.game.pieceMoveUntil(0, 100, false).y - 19.5) * 4;
        ele.setAttribute("x", xOffset);
        ele.setAttribute("y", yOffset);
        // update orientation of piece
        var offsets = [];
        var layout = this.game.state.turnData.layout;
        for (var r = 0; r < layout.length; r++) {
            for (var c = 0; c < layout[0].length; c++) {
                if (layout[r][c] == 1) {
                    offsets.push({r: r, c: c});
                }
            }
        }
        for (var i = 0; i < 4; i++) {
            ele.children[i].setAttribute("x", offsets[i].c * 4);
            ele.children[i].setAttribute("y", offsets[i].r * 4);
        }
    };
    svgGraphics.prototype.refreshBoard = function() {
        if (this.game == null) return;
        if (this.generatedTemplate.board == null) return;
        var ele;
        if ((ele = document.getElementById(this.svg.id + "-board")) == null) {
            var boardData = this.buildBoard(this.game.state.board);
            boardData.children[2].attributes.id = this.svg.id + "-board";
            this.svg.appendChild(this.build(boardData));
            return;
        }
        // check differences in board
        for (var r = 0; r < this.game.state.board.length; r++) {
            for (var c = 0; c < this.game.state.board[0].length; c++) {
                if ((r - 19.5) * 4 + 4 < 0) continue; // above the board
                var tile = ele.children[Math.floor(r - 18.5) * this.game.state.board[0].length + c];
                var tileClass = this.game.state.board[r][c] == "" ? "blank" : this.game.state.board[r][c];
                if (tile.classList.contains(tileClass)) continue;
                tile.classList.remove("i", "j", "l", "o", "s", "t", "z", "blank", "g", "ghost");
                tile.classList.add(tileClass);
            }
        }
    };
    svgGraphics.prototype.refreshNext = function() {
        if (this.game == null) return;
        if (this.game.state.next.length == 0) return;
        if (this.generatedTemplate.next == null) return;
        // todo-release if game cur is null, still generate border (same with morenext)
        this.refreshMoreNext();
        var ele;
        if ((ele = document.getElementById(this.svg.id + "-next")) == null) {
            var nextData = this.buildNext();
            nextData.children[2].attributes.id = this.svg.id + "-next";
            this.svg.appendChild(ele = this.build(nextData));
            ele = ele.children[2];
        }
        if (ele.classList.contains(this.game.state.next[0])) return;
        ele.classList.remove("i", "j", "l", "o", "s", "t", "z", "blank", "g", "ghost", "none"); // todo-magicNumber make this a constant
        ele.classList.add(this.game.state.next[0]);

        var offsets = [];
        var layout = this.game.data.pieces.layouts[this.game.state.next[0]];
        for (var r = 0; r < layout.length; r++) {
            for (var c = 0; c < layout[0].length; c++) {
                if (layout[r][c] == 1) {
                    offsets.push({r: r, c: c});
                }
            }
        }
        var offset = this.centerPiece(this.game.state.next[0]);
        for (var i = 0; i < 4; i++) {
            ele.children[i].setAttribute("x", offsets[i].c * 2 + offset.x);
            ele.children[i].setAttribute("y", offsets[i].r * 2 + offset.y);
        }
    };
    svgGraphics.prototype.refreshMoreNext = function() {
        if (this.generatedTemplate.moreNext == null) return;
        var ele;
        if ((ele = document.getElementById(this.svg.id + "-moreNext")) == null) {
            var moreNextData = this.buildMoreNext();
            moreNextData.children[2].attributes.id = this.svg.id + "-moreNext";
            this.svg.appendChild(ele = this.build(moreNextData));
            ele = ele.children[2];
        }
        var updateNext = (function(ele, num) {
            if (num < 1) return;
            var pieceEle = ele.children[num - 1];
            if (pieceEle.classList.contains(this.game.state.next[num])) return updateNext(ele, num - 1);
            pieceEle.classList.remove("i", "j", "l", "o", "s", "t", "z", "blank", "g", "ghost", "none");
            pieceEle.classList.add(this.game.state.next[num]);
            var offsets = [];
            var layout = this.game.data.pieces.layouts[this.game.state.next[num]];
            for (var r = 0; r < layout.length; r++) {
                for (var c = 0; c < layout[0].length; c++) {
                    if (layout[r][c] == 1) {
                        offsets.push({r: r, c: c});
                    }
                }
            }

            var offset = this.centerPiece(this.game.state.next[num]);
            for (var i = 0; i < 4; i++) {
                pieceEle.children[i].setAttribute("x", offsets[i].c * 2 + offset.x);
                pieceEle.children[i].setAttribute("y", offsets[i].r * 2 + offset.y);
            }
            updateNext(ele, num - 1);
        }).bind(this);
        updateNext(ele, this.settings.showNext - 1);
    };
    svgGraphics.prototype.refreshHold = function() {
        if (this.game == null) return;
        if (this.generatedTemplate.hold == null) return;
        var ele;
        if ((ele = document.getElementById(this.svg.id + "-hold")) == null) {
            var holdData = this.buildHold();
            holdData.children[2].attributes.id = this.svg.id + "-hold";
            this.svg.appendChild(ele = this.build(holdData));
            ele = ele.children[2];;
        }
        var hold = (this.game.state.hold == null || this.game.state.hold == "") ? "none" : this.game.state.hold;
        if (ele.classList.contains(hold)) return;
        ele.classList.remove("i", "j", "l", "o", "s", "t", "z", "blank", "g", "ghost", "none"); // todo-magicNumber make this a constant
        ele.classList.add(hold);
        if (hold == "none") return;

        var offsets = []; // todo-refactor make this its own function
        var layout = this.game.data.pieces.layouts[hold];
        for (var r = 0; r < layout.length; r++) {
            for (var c = 0; c < layout[0].length; c++) {
                if (layout[r][c] == 1) {
                    offsets.push({r: r, c: c});
                }
            }
        }
        var offset = this.centerPiece(hold);
        for (var i = 0; i < 4; i++) {
            ele.children[i].setAttribute("x", offsets[i].c * 2 + offset.x);
            ele.children[i].setAttribute("y", offsets[i].r * 2 + offset.y);
        }
    };
    svgGraphics.prototype.refreshIncoming = function() {
        if (this.game == null) return;
        if (this.game.state.incoming == null) return;
        if (this.generatedTemplate.incoming == null) return;
        var ele;
        if ((ele = document.getElementById(this.svg.id + "-incoming")) == null) {
            var incomingData = this.buildIncoming();
            incomingData.attributes.id = this.svg.id + "-incoming";
            this.svg.appendChild(ele = this.build(incomingData));
        }
        var amt = 4 * this.game.cur.incoming;
        ele.children[2].setAttribute("height", amt);
        ele.children[2].setAttribute("y", this.generatedTemplate.incoming.height - 1 - amt);
    };
    svgGraphics.prototype.centerPiece = function(piece) {
        return {
            x: piece == "i" ? 0 : (piece == "o" ? 2 : 1),
            y: piece == "i" ? 1 : 2
        }
    };
    svgGraphics.prototype.newId = function(length = 10) {
        var createId = function() {
            var ret = "";
            var chars = "abcdefghijklmnopqrstuvwxyz";
            chars += chars.toUpperCase() + "0123456789";
            for (var i = 0; i < length; i++) {
                ret += chars[Math.floor(Math.random() * chars.length)];
            }
            return ret;
        }
        var ret, attempts = 0, maxAttempts = 100;
        while (this.ids[ret = createId()] !== undefined) {
            attempts++;
            // todo-log
            if (attempts > maxAttempts) {
                console.error("[Tetresse] could not find free Id from " + maxAttempts + " attempts"); 
                break;
                // todo-release-full increment up from an ID until you find free one if this condition occurs 
            }
        }
        return ret;
    };
    svgGraphics.prototype.buildBoard = function(board) {
        var group = {
            tag: "g",
            children: [
                {
                    tag: "rect",
                    attributes: {
                        width: "42",
                        height: "84",
                        x: this.generatedTemplate.board.x, 
                        y: this.generatedTemplate.board.y,
                        style: "fill:" + this.colors.border + ";"
                    }        
                },
                {
                    tag: "rect",
                    attributes: {
                        x: this.generatedTemplate.board.x + 1, 
                        y: this.generatedTemplate.board.y + 1,
                        width: "40",
                        height: "82",
                        style: "fill:" +this.colors.background + ";"
                    }
                },
                {
                    tag:"svg", 
                    attributes: {
                        x: this.generatedTemplate.board.x + 1,
                        y: this.generatedTemplate.board.y + 1,
                    }, 
                    children: []
                }
            ]
        };

        for (var r = 0; r < board.length; r++) {
            for (var c = 0; c < board[0].length; c++) {
                var tile = this.dataTile(board[r][c]);
                tile.attributes.x = c * 4;
                tile.attributes.y = (r - 19.5) * 4
                if (tile.attributes.y + parseInt(tile.attributes.height) < 0) {
                    continue;
                }
                group.children[2].children.push(tile);
            }
        }
        return group;
    };
    svgGraphics.prototype.buildPiece = function() {
        var group = {
            tag: "svg",
            attributes: {
                width: this.generatedTemplate.board.width - 2,
                height: this.generatedTemplate.board.height - 2,
                x: this.generatedTemplate.board.x + 1,
                y: this.generatedTemplate.board.y + 1
            },
            children: [
                {
                    tag: "svg",
                    attributes: {class: "piece"},
                    children: []
                }
            ]
        };
        for (var i = 0; i < 4; i++) {
            group.children[0].children.push({tag: "rect", attributes: {width: 4, height: 4, x: 0, y: 0}});
        }
        return group;
    };
    svgGraphics.prototype.buildNext = function() {
        var group = {
            tag: "svg", 
            attributes: {
                width: this.generatedTemplate.next.width,
                height: this.generatedTemplate.next.height,
                x: this.generatedTemplate.next.x,
                y: this.generatedTemplate.next.y,
            }, 
            children: [
                {tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.next.width,
                        height: this.generatedTemplate.next.height,
                        x: 0, y: 0,
                        style: "fill:" + this.colors.border + ";"
                    }
                },
                {tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.next.width - 1,
                        height: this.generatedTemplate.next.height - 2,
                        x: 0, y: 1,
                        style: "fill:" + this.colors.background + ";"
                    }
                },
                {tag: "svg",
                    attributes: {
                        width: this.generatedTemplate.next.width - 3,
                        height: this.generatedTemplate.next.height - 4,
                        x: 1, y: 2,
                        class: "none"
                    },
                    children: [
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                    ]
                }
            ]
        };
        return group;
    };
    svgGraphics.prototype.buildMoreNext = function() {
        var height = 3 + 8 * (this.settings.showNext - 1);
        var group = {
            tag: "svg", 
            attributes: {
                width: this.generatedTemplate.moreNext.width,
                height: height,
                x: this.generatedTemplate.moreNext.x,
                y: this.generatedTemplate.moreNext.y,
            }, 
            children: [
                {tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.moreNext.width,
                        height: height,
                        x: 0, y: 0,
                        style: "fill:" + this.colors.border + ";"
                    }
                },
                {tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.moreNext.width - 1,
                        height: height - 1,
                        x: 0, y: 0,
                        style: "fill:" + this.colors.background + ";"
                    }
                },
                {tag: "svg",
                    attributes: {
                        width: this.generatedTemplate.next.width - 3,
                        height: height - 3,
                        x: 1, y: 1,
                    },
                    children: []
                }
            ]
        };
        for (var i = 0; i < this.settings.showNext - 1; i++) {
            group.children[2].children.push(
                {tag: "svg",
                    attributes: {
                        width: this.generatedTemplate.moreNext.width - 3,
                        height: this.generatedTemplate.moreNext.width - 3,
                        x: 0, y: (this.generatedTemplate.next.width - 3) * i,
                        class: "none"
                    },
                    children: [
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},        
                    ]
                }
            )
        }
        return group;
    };
    svgGraphics.prototype.buildHold = function() {
        var group = {
            tag: "svg", 
            attributes: {
                width: this.generatedTemplate.hold.width,
                height: this.generatedTemplate.hold.height,
                x: this.generatedTemplate.hold.x,
                y: this.generatedTemplate.hold.y,
            }, 
            children: [
                {tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.hold.width,
                        height: this.generatedTemplate.hold.height,
                        x: 0, y: 0,
                        style: "fill:" + this.colors.border + ";"
                    }
                },
                {tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.hold.width - 1,
                        height: this.generatedTemplate.hold.height - 2,
                        x: 1, y: 1,
                        style: "fill:" + this.colors.background + ";"
                    }
                },
                {tag: "svg",
                    attributes: {
                        width: this.generatedTemplate.hold.width - 3,
                        height: this.generatedTemplate.hold.height - 4,
                        x: 2, y: 2,
                        class: ""
                    },
                    children: [
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                        {tag: "rect", attributes: { width: 2, height: 2, x: 0, y: 0 }},
                    ]
                }
            ]
        };
        return group;
    };
    svgGraphics.prototype.buildIncoming = function() {
        return {
            tag: "svg", 
            attributes: {
                width: this.generatedTemplate.incoming.width,
                height: this.generatedTemplate.incoming.height,
                x: this.generatedTemplate.incoming.x,
                y: this.generatedTemplate.incoming.y,
            }, 
            children: [
                {
                    tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.incoming.width,
                        height: this.generatedTemplate.incoming.height,
                        x: 0, y: 0,
                        class: "border"
                    },
                    children: []
                }, 
                {
                    tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.incoming.width - 1,
                        height: this.generatedTemplate.incoming.height - 2,
                        x: 0, y: 1,
                        class: "background"
                    },
                    children: []
                }, 
                {
                    tag: "rect",
                    attributes: {
                        width: this.generatedTemplate.incoming.width - 1,
                        height: 0,
                        x: 0, y: 0,
                        class: "incoming"
                    }
                }                
            ]
        }
    };
    svgGraphics.prototype.dataTile = function(piece = "") {
        if (piece == "") piece = "blank";
        return {
            tag: "rect",
            attributes: {
                class: "tile " + piece,
                width: "4",
                height: "4",
            }    
        };
    };
    svgGraphics.prototype.dataSVG = function() {
        return {
            tag: "svg",
            attributes: {
                viewBox: "0 0 42 84",
                width: "42",
                height: "84",
                preserveAspectRatio: "xMidYMid meet",
                id: "svgGraphics-" + this.id,
                xmlns: "http://www.w3.org/2000/svg",
            },
            children: []
        };
    };
    svgGraphics.prototype.dataDefaultTemplate = function() {
        return {
            board: { width: 42, height: 84, x: 0, y: 0 },
            next: { width: 11, height: 12, x: 0, y: 10, position: ["right of incoming", "right of board"] },
            moreNext: { width: 11, height: 11, x: 0, y: 0, position: ["below next"] },
            hold: { width: 11, height: 11, x: 0, y: 10, position: ["left of board"] },
            incoming: { width: 2, height: 84, x: 0, y: 0, position: ["right of board"] }
        };
    };
    svgGraphics.prototype.parseTemplate = function(parts, template) {
        var ret = {};
        for (var part of parts) {
            if (template[part] == undefined) {
                console.warn("part %s not in template", part);
                continue;
            }
            ret[part] = {};
            ret[part].width = template[part].width;
            ret[part].height = template[part].height;
            ret[part].x = template[part].x;
            ret[part].y = template[part].y;
        }
        for (var part of parts) {
            if (template[part] == undefined) continue;
            if (template[part].position === undefined) continue;
            for (var position of template[part].position) {
                var partName = position.substring(position.lastIndexOf(" ") + 1);
                var parentPart;
                if ((parentPart = ret[partName]) === undefined) continue;
                var positionKey = position.substring(0, position.length - partName.length).trim();
                if (positionKey == "right of") {
                    ret[part].x += parentPart.x + parentPart.width;
                    ret[part].y += parentPart.y;
                } else if (positionKey == "left of") {
                    ret[part].x += parentPart.x - ret[part].width;
                    ret[part].y += parentPart.y;
                } else if (positionKey == "above") {
                    ret[part].x += parentPart.x;
                    ret[part].y += parentPart.y - ret[part].height;                    
                } else if (positionKey == "below") {
                    ret[part].x += parentPart.x;
                    ret[part].y += parentPart.y + parentPart.height;
                } else {
                    console.warn("could not recognize positionKey=%s in position [%s]", positionKey, position);
                    continue;
                }
                break;
            }
        }
        var minX = 0;
        var minY = 0;
        for (var part of parts) {
            if (template[part] == undefined) continue;
            if (minX > ret[part].x) minX = ret[part].x;
            if (minY > ret[part].y) minY = ret[part].y;
        }
        if (minX < 0 || minY < 0) {
            for (var part of parts) {
                if (template[part] == undefined) continue;
                if (minX < 0) ret[part].x += (-1 * minX);
                if (minY < 0) ret[part].y += (-1 * minY);
            }
        }
        return ret;
    };
    svgGraphics.prototype.colors = {
        pieces: {
            i: "hsl(196, 89%, 57%)",
            j: "hsl(231, 69%, 45%)",
            l: "hsl(24, 98%, 44%)",
            o: "hsl(42, 97%, 45%)",
            s: "hsl(92, 91%, 37%)",
            t: "hsl(314, 63%, 41%)",
            z: "hsl(348, 86%, 45%)",
            blank: "black",
            g: "grey",
        },
        ghost: "grey",
        background: "black",
        border: "grey"
    };
    svgGraphics.prototype.focusIcon = '<svg class="focus hidden" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="5" height="5" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" preserveAspectRatio="xMidYMid meet" viewBox="0 0 384 384">'
        + '<path class="fill-area" d="M192 107q35 0 60 25t25 60t-25 60t-60 25t-60-25t-25-60t25-60t60-25zM43 256v85h85v43H43q-18 0-30.5-12.5T0 341v-85h43zm0-213v85H0V43q0-18 12.5-30.5T43 0h85v43H43zM341 0q18 0 30.5 12.5T384 43v85h-43V43h-85V0h85zm0 341v-85h43v85q0 18-12.5 30.5T341 384h-85v-43h85z"/>'
        + '<path class="click-area" d="M0 0h384 v384 h-384z"></svg>';
    svgGraphics.prototype.build = function(json) {
        if (json.tag === undefined) return;
        var ele = document.createElementNS("http://www.w3.org/2000/svg", json.tag);
        if (json.attributes !== undefined) {
            for (var attr in json.attributes) {
                ele.setAttribute(attr, json.attributes[attr]);
            }
        }
        if (json.children !== undefined) {
            for (var child of json.children) {
                ele.appendChild(this.build(child));
            }    
        }
        return ele;
    };
})();