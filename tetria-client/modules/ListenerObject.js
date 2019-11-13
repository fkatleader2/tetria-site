(function() {
    var listenerObject = function(obj, generator, listenerManager = this.listenerManager) {
        if (generator == undefined) {
            generator = this.prototype.generator;
            if (generator == undefined) generator = new this.idManager.Generator({prepend: 'objectListener-', length: 10});
        }
        if (this.prototype.generator == undefined) {
            this.prototype.generator = generator;
        }

        this.generator = generator;
        this.id = this.generator.create(this);
        this.listenerManager = listenerManager;
        this.listeners = {};
        this.init(obj);
    };

    listenerObject.prototype._managers = ['idManager', 'listenerManager'];

    listenerObject.prototype.init = function(obj) {
        var setupFunc = function(obj, objRet, path) {
            if (typeof(obj) != 'object') return;
            for (var key in obj) {
                if (typeof(obj[key]) == 'string') {
                    Object.defineProperty(objRet, key, {
                        get : function () {}
                    });
                    this.listeners[this.listenerManager.on(this.id + '-' + path)]
                }
    
            }

        };
        this.obj = {};
        setupFunc.apply(this, [obj, this.obj, '']);
    };
    listenerObject.prototype.remove = function() {
        // remove all listeners used
    };

    try {
        tet.exports = listenerObject;
    } catch (e) {
        try {
            module.exports = listenerObject;
        } catch (e) {
            ListenerObject = listenerObject;
        }
    }
})();