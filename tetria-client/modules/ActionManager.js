/**
 * TODO
 * - add exec where it returns the func return value
 * - test without tet
 * - check tests (return value for exec)
 */

(function() {
    var actionManager = function(idGenerator) {
        if (idGenerator == undefined) {
            idGenerator = new this.tet.m.idManager.Generator({prepend: 'action-', length: 10});
        }
        this.idGenerator = idGenerator;
    }
    
    try {
        tet.exports = actionManager;
    } catch (e) {
        try {
            module.exports = actionManager;
        } catch (e) {
            ActionManager = actionManager;
        }
    }

    actionManager.prototype.create = function(func = function() {}, env = {}, args = []) {
        var action = { func: func, this: env, arguments: args};
        return this.idGenerator.create(action);
    };
    actionManager.prototype.exec = function(actionId) {
        var action = this.tet.m.idManager.get(actionId);
        if (action == undefined) throw new Error('bad action id: ' + JSON.stringify(actionId));
        var args = [];
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        return action.func.apply(action.this, action.arguments.concat(args));
    }
})();
