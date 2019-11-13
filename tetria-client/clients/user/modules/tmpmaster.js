(function() {
    var master = {
        name: 'master',
        // _managers: ['ListenerManager'],
        eles: {},
        setup() {
            console.log('master setup');
            var components = ['rooms', 'singleplayer', 'multiplayer', 'header'];
            for (var v of components) {
                this[v].m = this;
            }

            this.eles.content = document.getElementById('content');
            this.eles.rooms = document.getElementById('rooms');
            this.eles.singleplayer = document.getElementById('game-singleplayer');
            this.eles.multiplayer = document.getElementById('game-multiplayer');
            this.eles.header = document.getElementById('header');
            
            for (var ele of ['header', 'content', 'rooms']) {
                this.eles[ele].classList.remove('hidden');
            }
            for (var v of components) {
                if (typeof(this[v].setup) == 'function') this[v].setup();
            }
        },
        header: {
            selectable: {},
            selected: null,
            setup() {
                var eles = $('#header>.center')[0].children;
                for (var ele of eles) {
                    if (!ele.classList.contains('option')) continue;

                    ele.onclick = (function(e) {
                        var ele;
                        for (ele of e.path) if (ele.classList.contains('option')) break;
                        var label = ele.children[1].innerHTML.toLowerCase();
                        if (this.selected != null) {
                            this.selected.classList.remove('selected');
                        }
                        if (this.selected != ele) {
                            this.m.tet.m.listenerManager.fire('header-tab-select', label);
                        }
                        this.selected = ele;
                        ele.classList.add('selected');
                        this.m.tet.m.listenerManager.fire('header-tab-select-' + label);
                    }).bind(this);

                    this.selectable[ele.children[1].innerHTML.toLowerCase()] = ele;
                    if (ele.classList.contains('selected')) {
                        ele.click();
                    }
                }
            }
        },
        rooms: {
            ele: null,
            setup() {
                this.ele = document.getElementById('rooms');
                this.m.tet.m.listenerManager.on('header-tab-select', 
                    this.m.tet.m.actionManager.create(function(value, event) {
                        if (value == 'rooms') this.ele.classList.remove('hidden');
                        else this.ele.classList.add('hidden');
                    }, this));
            }
        },
        singleplayer: {
            setup() {
                this.ele = document.getElementById('game-singleplayer');
                this.navigateActionId = this.m.tet.m.actionManager.create(function(value, event) {
                    if (value == 'game') {
                        if (!this.m.multiplayer.active) {
                            this.ele.classList.remove('hidden');
                            return;
                        } else {
                            this.m.multiplayer.ele.classList.remove('hidden');
                        }
                    } 
                    this.ele.classList.add('hidden');
                }, this);
                this.navigateListenerId = this.m.tet.m.listenerManager.create('header-tab-select', this.navigateActionId);
                this.m.tet.m.singleplayer.init(this.ele);
                this.m.tet.m.singleplayer.setupPage();    
                this.m.tet.m.pageSettings.setupPage();    
            },
        },
        multiplayer: {
            active: false,
            ele: null,
            setup() {
                this.ele = document.getElementById('game-multiplayer');
            }
        }
    }

    tet.exports = master;
})();
