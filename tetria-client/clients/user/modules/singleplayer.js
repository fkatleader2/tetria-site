tet.exports = {
    init(htmlElement) {
        this.ele = htmlElement;
    },
    name: 'singleplayer',
    _managers: ['ActionManager', 'ListenerManager', 'TetresseManager'],
    gameEle: null,
    game: null,
    gameModeEle: null,
    gameModeSelected: null,
    gameModeStats: {
        possible: {
            finesseScore: {type: 'number', value: null, label: 'Finesse Score'},
            finesseTips: {type: 'string', value: null, valueExt: null, label: 'F.Tip'},
            finesseRecorded: {type: 'string', value: null, valueExt: null, label: 'F.Rec'},
            time: {type: 'number', value: null, label: 'Time'},
            apm: {type: 'number', value: null, label: 'APM'},
            cleared: {type: 'number', value: null, label: 'Lines Cleard'},
            placed: {type: 'number', value: null, label: 'Pieces Placed'},
            marathonScore: {type: 'number', value: null, label: 'Score'},
        },
        sprint: [
            {stat: 'time', style: 'big'}, {stat: 'cleared', limit: 40}, {stat: 'placed'}, {stat: 'apm'}
        ],
        tetresse: [
            {stat: 'time', style: 'big'}, {stat: 'finesseScore'}, {stat: 'finesseTips'}, {stat: 'finesseRecorded'}, {stat: 'cleared'}, {stat: 'apm'}
        ],
        marathon: [
            {stat: 'marathonScore'}, 
        ]
    },
    setupPage() {
        this.ele = this.ele == undefined ? document.getElementById('game-singleplayer') : this.ele;

        // singleplayer game
        this.game = {
            tetresse: new this.tetresseManager.Tetresse(),
            graphics: new this.tet.o.SvgGraphics($('#game-singleplayer .tetresse')[0])
        };
        this.game.defaultTetresse = new this.tet.o.DefaultTetresse(this.game.tetresse);

        this.game.tetresse.lm.on('game-end', this.actionManager.create(function() {
            console.log('game ended!');
        }));

        this.game.graphics.linkTetresse(this.game.tetresse);
        this.game.graphics.setParts(['board', 'next', 'moreNext', 'hold']);
        var controls = new this.tet.o.Controls();
        controls.linkTetresse(this.game.tetresse);
        this.tet.m.gravity.linkTetresse(this.game.tetresse);
        // this.game.graphics.setParts(['board', 'incoming', 'next', 'moreNext', 'hold']);
        // this.game.tetresse.lm.fire(('start'));
        this.setupButtons();
        this.initStatListeners();

        this.game.tetresse.pieceNext();
    },
    setupButtons() {
        this.gameModeEle = $('#' + this.ele.id + ' .gamemode .dropdown.button')[0];
        this.gameModeEle.onclick = (function() {
            this.gameModeEle.classList.toggle('open');
            if (this.gameModeEle.classList.contains('open')) {
                this.gameModeDropdownBodyId = this.tet.m.uiManager.bodyClick((function(e) {
                    var falseClick = false;
                    for (var p of e.path) {
                        try {
                            if (p.classList.contains('dropdown')) { falseClick = true; break; }
                        } catch(e) {}
                    }
                    if (falseClick) return;
                    this.gameModeEle.classList.remove('open');
                    if (this.tet.m.uiManager.removeBodyClick(this.gameModeDropdownBodyId)) this.gameModeDropdownBodyId = null;
                }).bind(this));
            } else {
                if (this.tet.m.uiManager.removeBodyClick(this.gameModeDropdownBodyId)) this.gameModeDropdownBodyId = null;
            }
        }).bind(this);
        for (var ele of this.gameModeEle.children) {
            ele.onclick = (function(e) {
                if (!this.gameModeEle.classList.contains('open')) return;
                for (var ele of this.gameModeEle.children) {
                    if (ele.innerHTML.toLowerCase() == this.gameModeSelected) {
                        ele.classList.remove('selected');
                        break;
                    }
                }
                e.target.classList.add('selected');
                var newGameModeSelected = e.target.innerHTML.toLowerCase();
                if (newGameModeSelected == 'tetresse') {
                    this.tet.m.tetresseTetresse.removeEvents(this.game.tetresse);
                    this.tet.m.tetresseTetresse.addEvents(this.game.tetresse, {resetPieceOnFail: true});
                } else if (this.gameModeSelected == 'tetresse') {
                    this.tet.m.tetresseTetresse.removeEvents(this.game.tetresse);
                    this.tet.m.tetresseTetresse.addEvents(this.game.tetresse);
                }

                this.gameModeSelected = newGameModeSelected;
                this.reloadStats();
            }).bind(this);
            if (ele.classList.contains('selected')) {
                this.gameModeEle.click();
                ele.click();
            }
        }

        // focus
        var focusIconEle = $('#game-singleplayer .tetresse .focus')[0];
        focusIconEle.classList.remove('hidden');
        focusIconEle.onclick = (function() {
            var focusBlind = document.getElementById('focus-blind');
            while (focusBlind.childNodes.length > 0) focusBlind.removeChild(focusBlind.childNodes[0]);
            var tetresseContainer = $('#game-singleplayer .tetresse')[0];
            this.parent = tetresseContainer.parentNode;
            tetresseContainer.parentNode.removeChild(tetresseContainer);
            focusBlind.appendChild(tetresseContainer);
            focusBlind.onclick = (function() {
                var focusBlind = document.getElementById('focus-blind');
                var tetresseContainer = focusBlind.childNodes[0];
                focusBlind.removeChild(tetresseContainer);
                this.parent.insertBefore(tetresseContainer, this.parent.childNodes[1]);
                console.log(this.parent);
                focusBlind.classList.add('hidden');    
                this.focusIconEle.classList.remove('hidden');
            }).bind(this);
            focusBlind.classList.remove('hidden');
            this.focusIconEle.classList.add('hidden');
        }).bind({singleplayer: this, focusIconEle: focusIconEle});
    },
    initStatListeners() { // sets up listeners and actual stat values
        // time
        this.gameModeStats.possible.time.mech = {loop: null, interval: 70, func: function(stat, listenerManager) {
            stat.value += stat.mech.interval;
            var minutes = Math.floor(stat.value / 60000);
            var seconds = Math.floor((stat.value / 1000) % 60);
            var centiseconds = Math.floor((stat.value / 10) % 100);
            if ((minutes + '').length == 1) minutes = '0' + minutes;
            if ((seconds + '').length == 1) seconds = '0' + seconds;
            if ((centiseconds + '').length == 1) centiseconds = '0' + centiseconds;
            listenerManager.fire('stat-time-change', minutes + ':' + seconds + '.' + centiseconds);
            if (stat.limit != undefined && stat.value >= stat.limit) listenerManager.fire('game-end');
            stat.mech.loop = setTimeout(stat.mech.func, stat.mech.interval, stat, listenerManager);
        }};

        this.game.tetresse.lm.on('next-first', this.actionManager.create(function() {
            var stat = this.gameModeStats.possible.time;
            if (stat.mech.loop != null) clearTimeout(stat.mech.loop);
            stat.value = -1 * stat.mech.interval;
            stat.mech.func(stat, this.game.tetresse.lm);

            stat = this.gameModeStats.possible.cleared;
            stat.value = 0;

            stat = this.gameModeStats.possible.placed;
            stat.value = 0;
        }, this));
        this.game.tetresse.lm.on('game-end', this.actionManager.create(function() {
            var stat = this.gameModeStats.possible.time;
            if (stat.mech.loop != null) clearTimeout(stat.mech.loop);
        }, this));

        // cleared
        this.game.tetresse.lm.on('lines-cleared', this.actionManager.create(function(lines) {
            var stat = this.gameModeStats.possible.cleared;
            stat.value += lines.length;
            this.game.tetresse.lm.fire('stat-cleared-change', stat.value);
            if (stat.limit != undefined && stat.value >= stat.limit) this.game.tetresse.lm.fire('game-end');
        }, this));

        // placed
        this.game.tetresse.lm.on('piece-placed', this.actionManager.create(function() {
            var stat = this.gameModeStats.possible.placed;
            stat.value++;
            this.game.tetresse.lm.fire('stat-placed-change', stat.value);
            if (stat.limit != undefined && stat.value >= stat.limit) this.game.tetresse.lm.fire('game-end');
        }, this));

        // apm

        // finesse
        var finesseAction = this.actionManager.create(function(value) {
            var finesseTips = this.gameModeStats.possible.finesseTips;
            var finesseRecorded = this.gameModeStats.possible.finesseRecorded;
            var arrToStr = function(arr, extended = false) {
                var str = '';
                for (var e of arr) {
                    if (e.startsWith('d')) str += 'das ';
                    if (e.endsWith('r')) str += 'right';
                    if (e.endsWith('l')) str += 'left';
                    if (e == 'w') str += 'rotate';
                    if (e == 'ww') str += extended ? 'rotate 180' : '180';
                    if (e == 'cw') str += extended ? 'rotate clockwise' : 'cw';
                    if (e == 'ccw') str += extended ? 'rotate counter-clockwise' : 'ccw';
                    str += ', ';
                }
                str += 'hd';
                return str;
            };
            finesseTips.value = arrToStr(value.correct);
            finesseRecorded.value = arrToStr(value.recorded);
            finesseTips.valueExt = arrToStr(value.correct, true);
            finesseRecorded.valueExt = arrToStr(value.recorded, true);
            this.game.tetresse.lm.fire('stat-finesseRecorded-change', finesseRecorded.value);
            this.game.tetresse.lm.fire('stat-finesseTips-change', finesseTips.value);
        }, this);
        this.game.tetresse.lm.on('good-finesse', finesseAction);
        this.game.tetresse.lm.on('bad-finesse', finesseAction);
        this.game.tetresse.lm.on('bad-finesse', this.actionManager.create(function(value) {
            var finesseScore = this.gameModeStats.possible.finesseScore;
            var amount = value.amount;
            if (amount > 0) {
                finesseScore.value += amount;
                this.game.tetresse.lm.fire('stat-finesseScore-change', finesseScore.value);
            }
        }, this))
    },
    reloadStats() { // removes and re-adds specified stats
        if (this.gameModeSelected == null) return;
        if (this.gameModeStats[this.gameModeSelected] == null) {
            console.warn('invalid game mode');
            return;
        }

        // remove current stats
        var stats = $('#game-singleplayer .stats')[0];
        while (stats.children.length > 0) stats.removeChild(stats.children[stats.children.length - 1]);

        var addStat = (function(parent, spec) {
            var stat;
            if ((stat = this.gameModeStats.possible[spec.stat]) == undefined) return false;
            var div, label, value;
            if (spec.style == 'big') {
                div = value = document.createElement('div');
                value.classList.add('time');
                value.innerHTML = '-';
            } else {
                div = document.createElement('div');
                label = document.createElement('div');
                value = document.createElement('div');
                div.appendChild(label);
                div.appendChild(value);
                label.classList.add('label');
                value.classList.add('value');
                label.innerHTML = stat.label;    
                if (stat.type == 'number') value.innerHTML = 0;
                else if (stat.type == 'string') value.innerHTML = '-';
            }
            parent.appendChild(div);

            stat.limit = spec.limit;
            if (stat.valueEle != undefined) {
                this.game.tetresse.lm.remove(stat.listenerId);
                this.game.tetresse.lm.remove(stat.actionId);
                if (stat.valueEle.parentNode != null) stat.valueEle.parentNode.removeChild(stat.valueEle);
            }
            stat.valueEle = value;
            stat.actionId = this.actionManager.create(function(tet, value) {
                if (this.valueEle == undefined) {
                    this.listenerManager.remove(this.listenerId);
                    this.actionManager.remove(this.actionId);
                }
                this.valueEle.innerHTML = value;
            }, stat, [this.tet]);
            stat.listenerId = this.game.tetresse.lm.on('stat-' + spec.stat + '-change', stat.actionId);
            return true;
        }).bind(this);
        for (var spec of this.gameModeStats[this.gameModeSelected]) {
            if (!addStat(stats, spec)) console.warn('invalid stat name: %s', spec.stat);
        }
    }
};
