/**
 * TODO:
 * - add flags to fire(event, value, flags) for not executing _preexecute, _execute, _parent
 * - set catch to require ids
 * - test without tet
 * - test anon actually gets removed
 * - test remove listener not present
 */

(function() {
    var listenerManager = function(idGenerator) {
        if (idGenerator == undefined) {
            idGenerator = new this.idManager.Generator({prepend: 'listener-', length: 10});
        }
        this.idGenerator = idGenerator;

        this.events = {};
    };

    listenerManager.prototype._managers = ['IdManager', 'ActionManager'];

    listenerManager.prototype.create = function(event, actionId, priority = 50) {
        var action, anon = false;
        if (typeof(actionId) != 'string') {
            actionId = this.actionManager.create(actionId.func, actionId.env, actionId.args);
            anon = true;
        }
        if ((action = this.idManager.get(actionId)) === undefined) return null;
        if (typeof(this.events[event]) != 'object') this.events[event] = [];

        var listener = { event: event, actionId: actionId, priority: priority, anon: anon };
        var listenerId = this.idGenerator.create(listener, 'listenerId');
        this.insert(this.events[event], listener, 'priority');

        if (action.listenerIds == undefined) action.listenerIds = {};
        action.listenerIds[listenerId] = true;
        return listenerId;
    };
    listenerManager.prototype.on = function() {
        return this.create.apply(this, arguments);
    };
    listenerManager.prototype.remove = function(listenerId) {
        if (listenerId.startsWith('action-')) return this.removeAction(listenerId);
        if (!listenerId.startsWith('listener-')) return this.removeEvent(listenerId);

        var listener = this.idManager.get(listenerId);
        if (listener === undefined) return false;

        var ret = true;
        var eventArr = this.events[listener.event];
        if (eventArr != undefined) {
            var rem = null;
            for (var i = 0; i < eventArr.length; i++) {
                if (eventArr[i].listenerId == listenerId) {
                    rem = eventArr.splice(i, 1);
                }
            }
            if (rem === null) ret = false;
            if (eventArr.length == 0) delete this.events[listener.event];
        }
        
        var action = this.idManager.get(listener.actionId);
        if (action != undefined) {
            delete action.listenerIds[listenerId];
            if (action.anon === true) {
                this.removeAction(listener.actionId);
            }
        }

        this.idManager.remove(listenerId);
        return ret;
    };
    listenerManager.prototype.removeAction = function(actionId) {
        var action = this.idManager.get(actionId);
        if (action === undefined) return false;

        for (var listenerId in action.listenerIds) {
            this.remove(listenerId);
        }

        this.idManager.remove(actionId);
        return true;
    };
    listenerManager.prototype.removeEvent = function(event) {
        var eventArr = this.events[event];
        if (typeof(eventArr) != 'object') return false;

        while (this.events[event] != undefined) {
            this.remove(this.events[event][0].listenerId);
        }

        return true;
    };

    listenerManager.prototype.fire = function(event, value) {
        var ret = {};

        if (this.events[event] === undefined) {
            if (!event.startsWith('_')) {
                ret['_noexecute'] = this.execute('_noexecute', {event: event, value: value});
            }
        } else {
            if (!event.startsWith('_')) {
                ret['_preexecute'] = this.execute('_preexecute', {event: event, value: value});
            }
            this.events[event].forEach((function(listener) {
                ret[listener.listenerId] = this.actionManager.exec(listener.actionId, value, event);
            }).bind(this));
            if (!event.startsWith('_')) {
                ret['_execute'] = this.execute('_execute', {event: event, value: value});
            }
        }
        
        return ret;
    };
    listenerManager.prototype.execute = function(event, data) { return this.fire(event, data); };

    listenerManager.prototype.insert = function(array, ele, key) {
        array.splice(this.tet.u.insertAt(array, ele, key), 0, ele);
    };

    try {
        tet.exports = listenerManager;
    } catch (e) {
        try {
            module.exports = listenerManager;
        } catch (e) {
            ListenerManager = listenerManager;
        }
    }
})();
