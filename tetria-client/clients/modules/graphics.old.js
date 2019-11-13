tet.modules.graphics = {
    state: {
        sources: {
            imgs: {},
        }
    },
    staticState: {
        tiles: {
            all: {},
            i: {color: "hsl(196, 89%, 57%)"},
            j: {color: "hsl(231, 69%, 45%)"},
            l: {color: "hsl(24, 98%, 44%)"},
            o: {color: "hsl(42, 97%, 45%)"},
            s: {color: "hsl(92, 91%, 37%)"},
            t: {color: "hsl(314, 63%, 41%)"},
            z: {color: "hsl(348, 86%, 45%)"},
            g: {color: "grey"},
            p: {color: "#525252c0"}
        },
        border: {color: "grey"},
        background: {color: "black"},
        abilities: {color: "black"}
    },
    setup() {
        console.log("grahpics setup!")
    },
    f: {
        draw(game, canvas, loc = {x: 0, y: 0, w: 100, h: 100, t: 1, r: 0}, source = {}, animate = false) {
            [{x: 0}, {y: 0}, {w: 100}, {h: 100}, {t: 1}, {r: 0}].forEach(function(ele) {
                for (var v in ele) loc[v] = loc[v] == null ? loc[v] = ele[v] : loc[v];
            });
            if (canvas == null) { tetresse.utils.error("canvas cannot be null"); return; }
            var ctx = canvas.getContext("2d");
            ctx.beginPath();
            if (source.color != null) {
                if (source.color == "clear") {
                    ctx.clearRect(loc.x, loc.y, loc.w, loc.h);
                } else {
                    ctx.rect(loc.x, loc.y, loc.w, loc.h);
                    var color = source.color;
                    if (loc.t != 1) {
                        color = tetresse.utils.getColor(source.color)
                        color.t = loc.t;
                        color = color.getString();
                    }
                    ctx.fillStyle = color;
                    ctx.fill();
                }
            }
            if (source.src != null) { // show image
                // if (this.m.state.sources.imgs[source.src] == null || !this.m.sources.imgs[source.src].loaded) {
                //     tetresse.modules.graphics.loadImage(source.src, function(args, img) {
                //         tetresse.modules.graphics.draw(args.game, args.canvas, args.loc, args.source, args.animate);
                //     }, {game: game, canvas: canvas, loc: loc, source: source, animate: animate});
                // } else {
                //     var img = tetresse.modules.graphics.sources.imgs[source.src].img;
                //     var w = 1; var h = 1;
                //     if (img.width / img.height > loc.w / loc.h) w = h * (loc.w / loc.h); // crop width
                //     else h = w * (loc.h / loc.w); // crop height
                //     ctx.drawImage(img, 0, 0, w * img.height, h * img.height, loc.x, loc.y, loc.w, loc.h);
                // }
            }
            if (source.generate != null) { // generate
                // source.generate(game, canvas, source, loc);
            }
            if (animate && source.animate != null) { // animate (setup animation, graphics.animate is called every frame
                // var time = (new Date()).getTime();
                // var graphics = game.modules.graphics;
                // graphics.animation.active.push({src: source, loc: loc, time: time});
                // if (graphics.animation.loop == null)
                //     graphics.animation.loop = window.requestAnimationFrame(this.components.animate.bind(this, game));
            }
        },
        component: {
            tile(game, loc = {x: 0, y: 0, r: 0, c: 0, w: 2, h: 2}, content = "", hide = {top: 0, bot: 0, left: 0, right: 0}, canvas = null) { // loc in units of n, hide is percent
                hide = hide == null ? {} : hide;
                [{arr: ["x", "y", "r", "c"], val: 0, var: loc},
                {arr: ["w", "h"], val: 2, var: loc},
                {arr: ["top", "bot", "left", "right"], val: 0, var: hide}].forEach(function(ele) {
                    ele.arr.forEach(function(lbl) {
                        ele.var[lbl] = ele.var[lbl] == null ? ele.val : ele.var[lbl];
                    });
                });
    
                var graphics = game.modules.graphics;
                if (canvas == null) canvas = graphics.canvases.play;
                var n = graphics.n;
                area = {
                    x: (loc.x + loc.c * loc.w + hide.left * loc.w) * n, 
                    y: (loc.y + loc.r * loc.h + hide.top * loc.h) * n, 
                    w: (loc.w - (hide.left + hide.right) * loc.w) * n, 
                    h: (loc.h - (hide.top + hide.bot) * loc.h) * n
                };
                for (var e in area)
                    area[e] = Math.floor(area[e]);
                // todo make sources better (into obj?)
                this.p.draw(game, canvas, area, this.m.staticState.tiles[content]);
                this.p.draw(game, canvas, area, this.m.staticState.tiles.all);
            },
            piece(game, loc = {x: 0, y: 0, s: 2}, piece, arr) { // piece must be a valid piece
                if (piece == null) {console.error("piece cannot be null"); return; }
                arr = arr == null ? this.m.tet.m.tetresse.staticState.pieces.layouts[piece] : arr;
                if (arr == null) { console.error("invalid piece: " + piece); return; };
                for (var r = 0; r < arr.length; r++)
                    for (var c = 0; c < arr.length; c++)
                        if (arr[r][c] == 1) {
                            this.tile(game, {x: loc.x, y: loc.y, r: r, c: c, w: loc.s, h: loc.s}, piece);
                        }
            },
            border(game, loc = {x: 0, y: 0, w: 100, h: 100, t: .5}, canvas = null, content = null) {
                var graphics = game.modules.graphics;
                var n = graphics.n;
                var thickness = (loc.t == null ? .5 : loc.t) * n;
                loc = {x: loc.x * n, y: loc.y * n, w: loc.w * n, h: loc.h * n};
                for (var e in loc)
                    loc[e] = Math.floor(loc[e]);
                canvas = canvas == null ? game.modules.graphics.canvases.play : canvas;
                this.p.draw(game, canvas, loc, this.m.staticState.border);
                loc = {x: loc.x + thickness, y: loc.y + thickness, w: loc.w - 2 * thickness, h: loc.h - 2 * thickness};
                for (var e in loc)
                    loc[e] = Math.ceil(loc[e]);
                this.p.draw(game, canvas, loc, this.m.staticState.background);
                // if (content != null)
                //     this.p.draw(game, canvas, loc, tetresse.modules.graphics.getSource(game, content));
            },
            ability(game, tloc = {x: 0, y: 0, w: 100, h: 100}, type, canvas = null, cooldown = 0) { // TODO implement cooldown
                // var loc = {}; [{x: 0}, {y: 0}, {w: 100}, {h: 100}].forEach(function(ele) {
                //     for (var v in ele) loc[v] = tloc[v] == null ? ele[v] : tloc[v];
                // });
                // var graphics = game.modules.graphics;
                // var n = graphics.n;
                // var border = n == 1 ? 1 : .5;
                // var source = this.m.staticState.abilities;
                // if (source == null) { tetresse.utils.error("source not defined for " + game.mode + ".abilities"); return; }
                // source = source[type];
                // canvas = canvas == null ? graphics.canvases.play : canvas;
    
                // tetresse.modules.graphics.components.border(game, loc, graphics.canvases.play);
    
                // if (source == null) { tetresse.utils.error("[warning] no source for: " + game.mode + ".abilities." + type); return; }
                // if (source.src != null && !tetresse.modules.graphics.sources.imgs[source.src].loaded) {
                //     tetresse.modules.graphics.loadImage(source.src, function(args, img) {
                //         tetresse.modules.graphics.components.ability(args.game, args.loc, args.type, args.canvas, args.cooldown);
                //     }, {game: game, loc: loc, canvas: canvas, type: type, cooldown: cooldown});
                //     return;
                // }
                // loc = {x: loc.x + border, y: loc.y + border, w: loc.w - 2 * border, h: loc.h - 2 * border};
                // for (var v in loc) loc[v] *= n;
                // tetresse.modules.graphics.draw(game, graphics.canvases.play, loc, source);
            },
            sideBar(game, loc = {x: 0, y: 0, w: 1, h: 20.5}, source, amount = 0) {
                var graphics = game.modules.graphics;
                var n = graphics.n;
                var border = n == 1 ? 1 : .5;
                var borderLoc = {x: loc.x - .5, y: loc.y, w: loc.w + 2 * border, h: loc.h};
                this.border(game, borderLoc);
                loc.y += loc.h - amount - border;
                loc.h = amount;
                loc.x = n == 1 ? Math.ceil(loc.x) : loc.x;
                for (var v in loc) loc[v] = loc[v] * n;
                this.p.draw(game, graphics.canvases.play, loc, source);
            },
            board: { // todo move variables to state
                loc: {row: {weight: 50, label: "board", n: 42}, col: {weight: 50, label: "board", n: 21}},
                prev: [], // array of {r: 0, c: 0} of tiles the last piece set that will need to be overwritten
                update(game) {
                    var graphics = game.modules.graphics;
                    this.p.border(game, graphics.components.board.loc, graphics.canvases.background);

                    var hiddenRows = Math.floor(game.board.length - 20.5); // todo-magicNumber (hidden rows game setting)
                    for (var r = hiddenRows; r < game.board.length; r++) {
                        for (var c = 0; c < game.board[0].length; c++) {
                            var content = game.board[r][c];
                            this.tile(game, r, c, content);
                        }
                    }
                    this.piece(game);
                },
                piece(game) {
                    var graphics = game.modules.graphics;
                    var prev = graphics.components.board.prev;
                    while (prev.length != 0) {
                        var ele = prev.pop();
                        this.tile(game, ele.r, ele.c);
                    }
                    var cur = game.cur.layout;
                    if (cur == null || game.cur.piece == null) return;
                    if (false) { // todo-magicNumber ghost piece enabled
                        var offset = 10; // todo-error //tetresse.get("dropPiece", game)(game, {harddrop: true, pretend: true});
                        for (var r = 0; r < game.cur.layout.length; r++)
                            for (var c = 0; c < game.cur.layout[0].length; c++)
                                if (game.cur.layout[r][c] == 1) {
                                    prev.push({r: r + offset, c: c + game.cur.loc.x});
                                    this.tile(game, r + offset, c + game.cur.loc.x, "p");
                                }
                    }
                    for (var r = 0; r < game.cur.layout.length; r++)
                        for (var c = 0; c < game.cur.layout[0].length; c++)
                            if (game.cur.layout[r][c] == 1) {
                                prev.push({r: r + game.cur.loc.y, c: c + game.cur.loc.x});
                                this.tile(game, r + game.cur.loc.y, c + game.cur.loc.x, game.cur.piece);
                            }
                },
                tile(game, r, c, content = "") { // (0, 0) is top left
                    var shownHeight = tetresse.get("s.shownHeight", game);
                    r = r - Math.floor(game.board.length - shownHeight);
                    if (r < 0 || c < 0 || r > Math.ceil(shownHeight) || c > game.board[0].length) {
                        console.error("tried to update tile (" + r + ", " + c + "), which is invalid");
                        return;
                    }
                    var graphics = game.modules.graphics;
                    var n = graphics.n;
                    var border = n == 1 ? 1 : .5;
                    var loc = graphics.components.board.loc;
                    var area = {
                        x: loc.x + border,
                        y: loc.y - 1 + border,
                        r: r, c: c, w: 2, h: 2
                    };
                    this.p.tile(game, area, content, {top: r == 0 ? .5 : 0});
                }
            },
            hold: {
                loc: {row: "board", col: {weight: 30, label: "hold", n: 5.5}},
                widthN: 6, heightN: 6,
                yN: 5, // offsets from board height
                update(game) { // TODO move small tile graphic to an external method (include in board.tile?)
                    var piece = game.cur.hold;
                    var graphics = game.modules.graphics;
                    var loc = graphics.components.hold.loc;
                    var n = graphics.n;
                    var border = n == 1 ? 1 : .5;

                    var area = {x: loc.x, y: loc.y + this.yN + border, w: this.widthN, h: this.heightN};
                    this.border(game, area, graphics.canvases.play);

                    if (piece == null) return;
                    var layout = this.m.tet.m.tetresse.staticState.pieces.layouts[piece];
                    var offset = n == 1 ? 1 : (5 - layout.length) / 2;
                    var offsetY = piece == "i" ? 1 + offset : (piece == "o") ? 2 : offset * 2;
                    area = {x: loc.x + border + offset, y: loc.y + this.yN + border + offsetY};

                    this.piece(game, {x: area.x, y: area.y, s: 1}, piece);
                },
            },
            next: {
                loc: {row: "board", col: {weight: 70, label: "next", n: 6}},
                widthN: 6, heightN: 6,
                yN: 5,
                update(game) {
                    var pieces = game.cur.next;
                    var graphics = game.modules.graphics;
                    var loc = graphics.components.next.loc;
                    var n = graphics.n;
                    var border = n == 1 ? 1 : .5;
                    var numNext = tetresse.get("s.upNext", game);
                    if (numNext == 0) return;

                    var area = {x: loc.x - (border == 1 ? 0 : border), y: (loc.y + this.yN) + border, w: this.widthN, h: this.heightN};
                    area.h += 4 * (numNext - 1) + (numNext != 1 ? border : 0);

                    tetresse.modules.graphics.components.border(game, area, graphics.canvases.play);

                    area.h = 6;
                    tetresse.modules.graphics.components.border(game, area, graphics.canvases.play);

                    for (var i = 0; i < numNext; i++) {
                        if (pieces == null || pieces.length == 0 || pieces[i] == null) return;
                        var layout = tetresse.utils.pieces.layouts[pieces[i]];
                        var offset = (5 - layout.length) / 2;
                        var offsetY = pieces[i] == "i" ? 1 + offset : (pieces[i] == "o") ? 2 : offset * 2;
                        var a = {x: area.x + offset + border, y: area.y + offsetY + 4 * i + (i != 0 ? 1 : 0)};
                        tetresse.modules.graphics.components.piece(game, {x: a.x, y: a.y, s: 1}, pieces[i]);
                    }
                },
                setup(game) {
                    tetresse.on("graphicsNext", this.update.bind(this), game, "graphicsModuleNext", 50, game.listeners);
                }
            },
            abilities: {
                loc: {row: "board", col: "hold"},
                widthN: 5, heightN: 5,
                yN: 5,
                update(game) {
                    var graphics = game.modules.graphics;
                    var loc = graphics.components.abilities.loc;
                    var n = graphics.n;
                    var border = n == 1 ? 1 : .5;

                    var gridDim = tetresse.utils.grid.get(graphics.grid, {row: "board", col: "board"});
                    var offsetY = (border + tetresse.get("s.shownHeight", game)) * 2 - 10;
                    var area = {x: (loc.x + 1), y: (loc.y + offsetY) + border, w: this.widthN, h: this.heightN};
                    var passiveArea = {x: loc.x + 1, y: area.y + 6 - border, w: area.w - 2 * border, h: area.h - 2 * border};
                    
                    var abilities = tetresse.get("s.abilities", game);
                    if (abilities.length == null) { tetresse.error("the setting 'abilities' length is null in mode: game.mode"); return; }
                    for (var i = 0; i < abilities.length; i++) {
                        var ele = abilities[i];
                        var a = area;
                        if (ele.type == "passive")
                            a = passiveArea;
                        tetresse.modules.graphics.components.ability(game, a, ele.type);
                        a.y -= 6;
                    }
                }
            },
            shake: { // TODO
                loc: [
                    {row: {weight: 5, label: "northShake", n: 1}, col: "board", label: "northShake"},
                    {row: "board", col: {weight: 5, label: "eastShake", n: 1}, label: "eastShake"},
                    {row: {weight: 95, label: "southShake", n: 1}, col: "board", label: "southShake"},
                    {row: "board", col: {weight: 95, label: "westShake", n: 1}, label: "westShake"},
                ],
                update(game, force = 50, direction = "east", rebound = false) { // force is on a scale from 0 to 100

                }
            },
            background: {
                // loc: {row: "board", col: "board"},
                // update(game) {
                //     var graphics = game.modules.graphics;
                //     var ctx = graphics.canvases.background.getContext("2d");

                //     var n = graphics.n;
                //     var border = n == 1 ? 1 : n / 2;
                //     var loc = graphics.components.background.loc;
                //     var widthN = 21;
                //     var heightN = 42;
                //     var area = {x: loc.x * n + border, y: loc.y * n + border, w: widthN * n - 2 * border, h: heightN * n - 2 * border};
                //     var source = tetresse.modules.graphics.getSource(game, "background");
                //     tetresse.modules.graphics.draw(game, graphics.canvases.background, area, source);
                // },
            },
            lineclear: {
                // play(game, rows) {
                //     var graphics = game.modules.graphics;
                //     var hiddenRows = Math.floor(game.board.length - tetresse.get("s.shownHeight", game));
                //     rows.forEach(function(r) {
                //         for (var c = 0; c < game.board[0].length; c++)
                //             tetresse.modules.graphics.game.components.board.tile(game, r, c, "lineclear");
                //     });
                // },
                // setup(game) {
                //     tetresse.on("linesCleared", this.play, game, "animation", 60, game.listeners);
                // },
                // cleanup(game) {

                // }
            },
            incoming: {
                loc: {row: "board", col: {weight: 60, label: "incoming", n: 1}},
                setup(game) {
                    var graphics = game.modules.graphics;
                    graphics.components.incoming.amount = 6;
                    
                },
                update(game) {
                    var graphics = game.modules.graphics;
                    var loc = graphics.components.incoming.loc;
                    var n = graphics.n;
                    var border = n == 1 ? 1 : .5;
                    var area = {x: loc.x, y: loc.y, w: border, h: loc.h};
                    tetresse.modules.graphics.components.sideBar(game, area, tetresse.modules.graphics.getSource(game, "incoming"), graphics.components.incoming.amount);
                }
            },
            mana: {
                loc: {row: "board", col: {weight: 40, label: "mana", n: 1}},
                setup(game) {
                    var graphics = game.modules.graphics;
                    graphics.components.mana.amount = 8;
                },
                update(game) {
                    var graphics = game.modules.graphics;
                    var loc = graphics.components.mana.loc;
                    var n = graphics.n;
                    var border = n == 1 ? 1 : .5;
                    var area = {x: loc.x + border, y: loc.y, w: border, h: loc.h};
                    tetresse.modules.graphics.components.sideBar(game, area, tetresse.modules.graphics.getSource(game, "mana"), graphics.components.mana.amount);

                }
            }
        }
    },
    api: {
        gameSetup(game) {
            game.modules.graphics = {
                width: 0, height: 0, 
                n: 0, // n is unit size of hold piece (1/4 size of regular tile)
                componentWidthN: 0, // width of components in units of n
                componentHeightN: 0, // height of components in units of n
                canvases: {},
                components: {board: {pref: []}}, // game specific component settings (eg location)
                sources: {}, // tiles: "retro"
                grid: tetresse.utils.grid.create(),
                animation: {
                    loop: null,
                    active: [],
                },
                settings: {
                    disableAnimations: false,   
                }
            };

            
            game.modules.graphics.components.board.prev = [];
            this.m.tet.m.listener.api.onL("graphicsBoard", this.update.bind(this), game, "graphicsModuleBoard", 50, game.listeners);
            tetresse.on("graphicsPiece", this.piece.bind(this), game, "graphicsModulePiece", 50, game.listeners);

            // setup canvases
            [{classes: ["background"]}, {classes: ["play"]}, {classes: ["animations"]}].forEach(function(ele) {
                var canvas = document.createElement("canvas");
                ele.classes.forEach(function(label) {
                    canvas.classList.add(label);
                });
                game.div.appendChild(canvas);
                game.modules.graphics.canvases[ele.classes[0]] = canvas;
            });


            var graphics = game.modules.graphics;
            var components = tetresse.modules.graphics.game.components;

            var componentsList = tetresse.get(game.state.spectating ? "s.spectatorGraphicsComponents" : "s.graphicsComponents", game);

            componentsList.forEach(function(label) {
                if (components[label] == null) { tetresse.utils.error("invalid graphics component: " + label); return; }
                if (components[label].loc == null) return;
                var arr = components[label].loc.length == null ? [components[label].loc] : components[label].loc;
                arr.forEach(function(ele) {
                    tetresse.utils.grid.add(graphics.grid, ele);
                    graphics.components[ele.label == null ? label : ele.label] = {loc: ele};
                });
            });
            componentsList.forEach(function(label) {
                if (components[label] == null) { tetresse.utils.error("invalid graphics component: " + label); return; }
                if (components[label].loc == null) return;
                var arr = components[label].loc.length == null ? [components[label].loc] : components[label].loc;
                arr.forEach(function(ele) {
                    graphics.components[ele.label == null ? label : ele.label].loc = tetresse.utils.grid.get(graphics.grid, ele);
                });
            });
            
            componentsList.forEach(function(label) { // setup func
                var comps = tetresse.modules.graphics.game.components;
                if (comps[label] != null && comps[label].setup != null)
                    comps[label].setup(game);
            });
            
            // TODO remove later? (replace with a listener)
            this.resize(game);
        },
        cleanup(game) {
            game.div.parentNode.removeChild(game.div);
        },
        resize(game, n) {
            var graphics = game.modules.graphics;
            var gridDimensions = tetresse.utils.grid.getTotals(graphics.grid);
            if (n == null) {
                // update canvas widths
                game.div.style.width = "100%";
                game.div.style.height = "100%";
                if (typeof window.getComputedStyle !== "undefined") {
                    graphics.width = parseInt(window.getComputedStyle(game.div, null).getPropertyValue('width'));
                    graphics.height = parseInt(window.getComputedStyle(game.div, null).getPropertyValue('height'));
                } else {
                    tetresse.utils.error("[warning] browser does not support window.getComputedStyle");
                    graphics.width = game.div.clientWidth;
                    graphics.height = game.div.clientHeight;
                }

                for (var canvas in graphics.canvases) {
                    graphics.canvases[canvas].width = graphics.width;
                    graphics.canvases[canvas].height = graphics.height;
                }

                // update n
                if (gridDimensions.w / gridDimensions.h > graphics.width / graphics.height) { // width is the deciding factor
                    graphics.n = Math.floor(graphics.width / gridDimensions.w);
                    if (graphics.n / 2 != Math.floor(graphics.n / 2) && graphics.n != 1) graphics.n--;
                } else { // height is deciding factor
                    graphics.n = Math.floor(graphics.height / gridDimensions.h);
                    if (graphics.n / 2 != Math.floor(graphics.n / 2) && graphics.n != 1) graphics.n--;
                }
                if (graphics.n == 0) graphics.n = 1;
            } else { graphics.n = n; }

            // shrink canvas and game div to fit board
            graphics.width = graphics.n * gridDimensions.w;
            graphics.height = graphics.n * gridDimensions.h;
            game.div.style.width = graphics.width;
            game.div.style.height = graphics.height;
            for (canvas in graphics.canvases) {
                graphics.canvases[canvas].width = graphics.width;
                graphics.canvases[canvas].height = graphics.height;
            }

            this.update(game, true);
        },
        update(game) {
            tetresse.get(game.state.spectating ? "s.spectatorGraphicsComponents" : "s.graphicsComponents", game).forEach(function(label) {
                var comps = tetresse.modules.graphics.game.components;
                if (comps[label] != null && comps[label].update != null)
                    comps[label].update(game);
            });
        },
    }
};
