/**
 * TODO:
 * - test ret of exec better
 */

const tet = require('../tet.js');
var ActionManager;
tet.addModule(require('./IdManager.js'));
tet.addModule(ActionManager = require('./ActionManager.js'));

var actionManager, actionObj, actionId;
beforeEach(() => {
    actionManager = new ActionManager();
    var func = function() {this.ret.push(arguments);};
    var env = {ret: [], b: tet.u.randString(30)};
    var args = [tet.u.randString(5), tet.u.randString(10)];
    actionObj = {func: func, env: env, args: args};
    actionId = actionManager.create(func, env, args);
});

test('loaded correctly', () => {
    expect(tet.m.actionManager).toBeDefined();
    expect(tet.o.ActionManager).toBeDefined();
    expect(tet.m.idManager).toBeDefined();
});

test('constructor uses specified id space', () => {
    var prepend = tet.u.randString(6);
    var generator = new tet.m.idManager.Generator({prepend: prepend, length: 7});
    var actionManager1 = new ActionManager(generator);
    var actionId = actionManager1.create();
    expect(actionId.startsWith(prepend)).toBe(true);
    expect(tet.m.idManager.get(actionId)).toBeDefined();
    var actionId2 = actionManager.create();
    expect(actionId).not.toBe(actionId2);
    var actionId3 = actionManager.create();
    expect(tet.m.idManager.get(actionId)).toBeDefined();
    expect(tet.m.idManager.get(actionId2)).toBeDefined();
    expect(tet.m.idManager.get(actionId3)).toBeDefined();

    // with separate ids
    var actionManagerNoArgs1 = new ActionManager();
    var env1 = {a: tet.u.randString(10)};
    var actionIdNoArgs1 = actionManagerNoArgs1.create(undefined, env1);
    var env2 = {a: tet.u.randString(10)};
    var actionIdNoArgs2 = actionManager.create(undefined, env2);

    expect(tet.m.idManager.get(actionIdNoArgs1).this).toBe(env1);
    expect(tet.m.idManager.get(actionIdNoArgs2).this).toBe(env2);
});

test('create', () => {
    var action = tet.m.idManager.get(actionId);
    expect(action.func).toBe(actionObj.func);
    expect(action.this).toBe(actionObj.env);
    expect(action.arguments).toBe(actionObj.args);
});
test('exec passes arguments first', () => {
    var action = tet.m.idManager.get(actionId);
    expect(action.this.ret.length).toBe(0);
    actionManager.exec(actionId);
    expect(action.this.ret.length).toBe(1);
    expect(action.this.ret[0].length).toBe(2);
    expect(action.this.ret[0][0]).toBe(actionObj.args[0]);
    expect(action.this.ret[0][1]).toBe(actionObj.args[1]);
});
test('exec passes arbitrary number of args', () => {
    var action = tet.m.idManager.get(actionId);
    actionManager.exec(actionId);
    var extraArg = tet.u.randString(5);
    actionManager.exec(actionId, extraArg);
    expect(action.this.ret.length).toBe(2);
    expect(action.this.ret[1].length).toBe(3);
    expect(action.this.ret[1][2]).toBe(extraArg);
    var extraArg2 = tet.u.randString(5);
    expect(actionManager.exec(actionId, extraArg, extraArg2)).toBeUndefined();
    expect(action.this.ret.length).toBe(3);
    expect(action.this.ret[2].length).toBe(4);
    expect(action.this.ret[2][3]).toBe(extraArg2);
});
test('exec throws exception if bad id', () => {
    var ret = null;
    try {
        actionManager.exec(tet.u.randString(8));
    } catch(e) {
        ret = e;
    }
    expect(ret).not.toBe(null);
});
