/**
 * TODO:
 * - add pause / resume / reset / end / start passthrough functions
 * external settings: keybinds { eventLabel: [code1, code2, ...]}
 * eventLabel -> 
 */
(function() {
    var controls = function(listener) {
        if (this.listening === null) this.createListener();
        this.listening = true;
        this.listener = null;
        this.game = null;
        this.keys = {}; // code: {isDown: false, eventLabels: []}
        this.eventLabels = {}; // funcs to exec when key is pressed
        this.setKeybinds(this.newKeybinds(), this.newEventFuncs()); // sets keys and eventLabels
        this.repeatTimers = {}; // timers of executing keys
        this.settings = {
            arr: 25,
            das: 100,
            softdrop: 40
        };

        this.listenerActions = null;
    };

    try {
        tet.exports = controls;
    } catch (e) {
        Controls = controls;
    }

    controls.prototype._managers = ['ActionManager'];
    controls.prototype.listening = null;
    controls.prototype.linkTetresse = function(tetresse) {
        this.game = tetresse;

        this.listenerActions = {
            'controls-eRight': this.actionManager.create(function() { this.pieceDetailsMoveRight(); }, this.game),
            'controls-eLeft': this.actionManager.create(function() { this.pieceDetailsMoveLeft(); }, this.game),
            'controls-eRightAR': this.actionManager.create(function() { this.pieceDetailsMoveRightAR(); }, this.game),
            'controls-eLeftAR': this.actionManager.create(function() { this.pieceDetailsMoveLeftAR(); }, this.game),
            'controls-eHarddrop': this.actionManager.create(function() { this.pieceDetailsHardDrop(); }, this.game),
            'controls-eSoftdrop': this.actionManager.create(function() { this.pieceDetailsSoftDrop(); }, this.game),
            'controls-eRotate': this.actionManager.create(function() { this.pieceDetailsRotateCW(); }, this.game),
            'controls-eRotateCCW': this.actionManager.create(function() { this.pieceDetailsRotateCCW(); }, this.game),
            'controls-eHold': this.actionManager.create(function() { this.pieceHold(); }, this.game),
            'controls-eReset': this.actionManager.create(function() { 
                this.lm.fire('game-end');
                this.resetState();
                this.pieceNext();
            }, this.game),
            'controls-ePause': this.actionManager.create( function() { this.lm.fire('pause'); }, this.game),
            'controls-eResume': this.actionManager.create(function() { this.lm.fire('resume'); }, this.game),
        };
        for (var event in this.listenerActions) {
            this.game.lm.on(event, this.listenerActions[event]);
        }

        this.game._controls = {enabled: false, playable: false};
        this.game.lm.on('next-first', this.actionManager.create(function() {
            this.game._controls.enabled = true;
            this.game._controls.playable = true;
        }, this));
        this.game.lm.on('game-end', this.actionManager.create(function() {
            this.game._controls.enabled = false;
            this.game._controls.playable = false;
        }, this));
        this.game.lm.on('reset', this.actionManager.create(function() {
            this.game._controls.enabled = false;
            this.game._controls.playable = false;
        }, this));
        this.game.lm.on('pause', this.actionManager.create(function() {
            if (!this.game._controls.playable) return;
            this.game._controls.enabled = false;
        }, this));
        this.game.lm.on('resume', this.actionManager.create(function() {
            if (!this.game._controls.playable) return;
            this.game._controls.enabled = true;
        }, this));

        // add exec events for set keybinds
    };
    controls.prototype.getKeybinds = function(pretty = true) {
        if (!pretty) return this.keybinds;
        var ret = {};
        for (var eventLabel in this.keybinds) {
            var arr = [];
            for (var code of this.keybinds[eventLabel]) {
                arr.push(this.keyCodeToName(code));
            }
            ret[eventLabel] = arr;
        }
        return this.keybinds;
    };
    controls.prototype.setKeybinds = function(binds, funcs) {
        // funcs are corresponding funcs for eventLabels (if new ones are added)
        // todo-release convert names to codes if present
        // todo-release remove eventLabels not present in binds
        for (var eventLabel in binds) {
            if (this.eventLabels[eventLabel] !== undefined) continue;
            if (funcs[eventLabel] == undefined) {
                this.eventLabels[eventLabel] = null;
                continue;
            }
            this.eventLabels[eventLabel] = funcs[eventLabel].bind(this);
        }
        this.keys = {};
        for (var eventLabel in binds) {
            for (var key of binds[eventLabel]) {
                if (this.keys[key] == undefined) {
                    this.keys[key] = {down: false, eventLabels: [eventLabel]};
                } else {
                    this.keys[key].eventLabels.push(eventLabel);
                }
            }
        }
        this.keybinds = binds;
    };
    controls.prototype.listen = function(toggle = !this.listening) {
        if (toggle == this.listening) return;
        this.listening = toggle;
    };
    controls.prototype.createListener = function() {
        document.addEventListener('keydown', (function(e) {
            if (this.keys[e.keyCode] === undefined) return;
            if (this.keys[e.keyCode].down) return;
            if (!this.listening) return;
            this.keys[e.keyCode].down = true;
            var obj = {};
            for (var eventLabel of this.keys[e.keyCode].eventLabels) {
                this.eventLabels[eventLabel](true, obj);
            }
        }).bind(this));
        document.addEventListener('keyup', (function(e) {
            if (this.keys[e.keyCode] === undefined) return;
            if (!this.keys[e.keyCode].down) return;
            if (!this.listening) return;
            this.keys[e.keyCode].down = false;
            var obj = {};
            for (var eventLabel of this.keys[e.keyCode].eventLabels) {
                this.eventLabels[eventLabel](false, obj);
            }
        }).bind(this));
    };
    controls.prototype.uniqueAutoRepeat = function(event, initialDelay, repeatDelay, repeatEvent) {
        if (repeatEvent == undefined) repeatEvent = event;
        this.game.lm.fire('controls-' + event);
        this.repeatTimers[event] = setTimeout(this.autoRepeat.bind(this), initialDelay, repeatEvent, repeatDelay);
    };
    controls.prototype.autoRepeat = function(event, repeatDelay) {
        this.game.lm.fire('controls-' + event);
        this.repeatTimers[event] = setTimeout(this.autoRepeat.bind(this), repeatDelay, event, repeatDelay);
    };
    controls.prototype.keyCodeToName = {
        '8': 'backspace','9': 'tab','13': 'enter','16': 'shift','17': 'ctrl','18': 'alt','19': 'pause/break','20': 'caps lock','27': 'escape','32': '(space)','33': 'page up','34': 'page down','35': 'end','36': 'home','37': 'left arrow','38': 'up arrow','39': 'right arrow','40': 'down arrow','45': 'insert','46': 'delete','48': '0','49': '1','50': '2','51': '3','52': '4','53': '5','54': '6','55': '7','56': '8','57': '9','65': 'a','66': 'b','67': 'c','68': 'd','69': 'e','70': 'f','71': 'g','72': 'h','73': 'i','74': 'j','75': 'k','76': 'l','77': 'm','78': 'n','79': 'o','80': 'p','81': 'q','82': 'r','83': 's','84': 't','85': 'u','86': 'v','87': 'w','88': 'x','89': 'y','90': 'z','91': 'left window key','92': 'right window key','93': 'select key','96': 'numpad 0','97': 'numpad 1','98': 'numpad 2','99': 'numpad 3','100': 'numpad 4','101': 'numpad 5','102': 'numpad 6','103': 'numpad 7 ','104': 'numpad 8','105': 'numpad 9','106': 'multiply','107': 'add','109': 'subtract','110': 'decimal point','111': 'divide','112': 'f1','113': 'f2','114': 'f3','115': 'f4','116': 'f5','117': 'f6','118': 'f7','119': 'f8','120': 'f9','121': 'f10','122': 'f11','123': 'f12','144': 'num lock','145': 'scroll lock','186': 'semi-colon','187': 'equal sign','188': 'comma','189': 'dash','190': 'period','191': 'forward slash','192': 'grave accent','219': 'open bracket','220': 'back slash','221': 'close braket','222': 'single quote'
    };
    controls.prototype.nameToKeyCode = {
        '0':'48','1':'49','2':'50','3':'51','4':'52','5':'53','6':'54','7':'55','8':'56','9':'57','backspace':'8','tab':'9','enter':'13','shift':'16','ctrl':'17','alt':'18','pause/break':'19','caps lock':'20','escape':'27','(space)':'32','page up':'33','page down':'34','end':'35','home':'36','left arrow':'37','up arrow':'38','right arrow':'39','down arrow':'40','insert':'45','delete':'46','a':'65','b':'66','c':'67','d':'68','e':'69','f':'70','g':'71','h':'72','i':'73','j':'74','k':'75','l':'76','m':'77','n':'78','o':'79','p':'80','q':'81','r':'82','s':'83','t':'84','u':'85','v':'86','w':'87','x':'88','y':'89','z':'90','left window key':'91','right window key':'92','select key':'93','numpad 0':'96','numpad 1':'97','numpad 2':'98','numpad 3':'99','numpad 4':'100','numpad 5':'101','numpad 6':'102','numpad 7 ':'103','numpad 8':'104','numpad 9':'105','multiply':'106','add':'107','subtract':'109','decimal point':'110','divide':'111','f1':'112','f2':'113','f3':'114','f4':'115','f5':'116','f6':'117','f7':'118','f8':'119','f9':'120','f10':'121','f11':'122','f12':'123','num lock':'144','scroll lock':'145','semi-colon':'186','equal sign':'187','comma':'188','dash':'189','period':'190','forward slash':'191','grave accent':'192','open bracket':'219','back slash':'220','close braket':'221','single quote':'222'
    };
    controls.prototype.spaceToChar = function(str, str2) {
        return str.split(' ').join(str2);
    };
    controls.prototype.newKeybinds = function() {
        return {
            'right': [39],
            'left': [37],
            'harddrop': [32],
            'softdrop': [40],
            'rotate cw': [38, 88],
            'rotate ccw': [90],
            'hold': [67],
            'reset': [82],
            'pause': [80],
            'resume': [80]
        }
    };
    controls.prototype.newEventFuncs = function() {
        return {
            'right': function(down) {
                if (!this.game._controls.enabled) return;
                if (!down) {
                    clearTimeout(this.repeatTimers['eRight']);
                    clearTimeout(this.repeatTimers['eRightAR']);
                    this.repeatTimers['eRight'] = null;
                    this.repeatTimers['eRightAR'] = null;
                    if (this.repeatTimers['eLeft'] === true) {
                        this.repeatTimers['eLeft'] = null;
                        this.autoRepeat('eLeftAR', this.settings.arr);
                    }
                    return;
                }
                if (this.repeatTimers['eLeft'] != null || this.repeatTimers['eLeftAR'] != null) {
                    clearTimeout(this.repeatTimers['eLeft']);
                    clearTimeout(this.repeatTimers['eLeftAR']);
                    this.repeatTimers['eLeft'] = true;
                }
                this.uniqueAutoRepeat('eRight', this.settings.das, this.settings.arr, 'eRightAR');
            },
            'left': function(down) {
                if (!this.game._controls.enabled) return;
                if (!down) {
                    clearTimeout(this.repeatTimers['eLeft']);
                    clearTimeout(this.repeatTimers['eLeftAR']);
                    this.repeatTimers['eLeft'] = null;
                    this.repeatTimers['eLeftAR'] = null;
                    if (this.repeatTimers['eRight'] === true) {
                        this.repeatTimers['eRight'] = null;
                        this.autoRepeat('eRightAR', this.settings.arr);
                    }
                    return;
                }
                if (this.repeatTimers['eRight'] != null || this.repeatTimers['eRightAR'] != null) {
                    clearTimeout(this.repeatTimers['eRight']);
                    clearTimeout(this.repeatTimers['eRightAR']);
                    this.repeatTimers['eRight'] = true;
                }
                this.uniqueAutoRepeat('eLeft', this.settings.das, this.settings.arr, 'eLeftAR');
            },
            'harddrop': function(down) {
                if (!this.game._controls.enabled) return;
                if (down) {
                    this.game.lm.execute('controls-eHarddrop');
                }
            },
            'softdrop': function(down) {
                if (!this.game._controls.enabled) return;
                if (!down) {
                    clearTimeout(this.repeatTimers['eSoftdrop']);
                    this.repeatTimers['eSoftdrop'] = null;
                    return;
                }
                this.autoRepeat('eSoftdrop', this.settings.softdrop);
            },
            'rotate cw': function(down) {
                if (!this.game._controls.enabled) return;
                if (down) {
                    this.game.lm.execute('controls-eRotate');
                }
            },
            'rotate ccw': function(down) {
                if (!this.game._controls.enabled) return;
                if (down) {
                    this.game.lm.execute('controls-eRotateCCW');
                }
            },
            'hold': function(down) {
                if (!this.game._controls.enabled) return;
                if (down) {
                    this.game.lm.execute('controls-eHold');
                }
            },
            'reset': function(down) {
                if (down) {
                    this.game.lm.execute('controls-eReset');
                }
            },
            'pause': function(down, obj) {
                if (obj.resume == true) return;
                if (!this.game._controls.enabled) return;
                if (down) {
                    obj.pause = true;
                    this.game.lm.execute('controls-ePause');
                }
            },
            'resume': function(down, obj) {
                if (obj.pause == true) return;
                if (this.game._controls.enabled) return;
                if (down) {
                    obj.resume = true;
                    this.game.lm.execute('controls-eResume');
                }
            }
        }
    }
})();
