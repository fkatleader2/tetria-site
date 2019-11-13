(function() {
    var UIManager = {
        name: 'uiManager',
        _managers: ['IdManager', 'ListenerManager'],
        setup() {
            document.body.onclick = (function(e) {
                for (var v in this.bodyClickFuncs) this.bodyClickFuncs[v](e);
            }).bind(this);
            this.bodyIdManager = new this.tet.m.idManager.Generator({prepend: 'uimanager-body', length: 10});
        },
        bodyClickFuncs: {},
        bodyClick(func) { // returns id you'll need to remove it
            var id = this.bodyIdManager.create();
            this.bodyClickFuncs[id] = func;
            return id;
        },
        removeBodyClick(id) {
            var ret = this.idManager.remove(id);
            if (ret) delete this.bodyClickFuncs[id];
            return ret;
        }
    };

    try {
        tet.exports = UIManager;
    } catch (e) {
        uiManager = UIManager;
    }
})();
