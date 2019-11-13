/**
 * TODO:
 * -
 */

const tet = require('../tet.js');
var ListenerManager;
tet.addModule(require('./IdManager.js'));
tet.addModule(require('./ActionManager.js'));
tet.addModule(ListenerManager = require('./ListenerManager.js'));

test('ListenerManager was loaded correctly', () => {
    expect(tet.o.ListenerManager).toBeDefined();
    expect(tet.m.listenerManager).toBeDefined();
    expect(tet.m.actionManager).toBeDefined();
    expect(tet.m.idManager).toBeDefined();
});

var listenerManager, action, actionObj, event, actionId;
beforeEach(() => {
    listenerManager = new ListenerManager();
    action = {
        func: function() {
            this.calls.push(arguments);
        },
        this: {calls: []},
        arguments: [],
        listenerIds: {},
        anon: false
    };
    for (var i = 0; i < 5; i++) action.this[tet.u.randString(15)] = tet.u.randString(30);
    for (var i = 0; i < 3; i++) action.arguments.push(tet.u.randString(17));
    actionObj = { func: action.func, env: action.this, args: action.arguments };
    listener = {
        event: tet.u.randString(35), 
        actionId: null, 
        priority: Math.floor(Math.random() * 100), 
        listenerId: null
    };
    actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
    event = tet.u.randString(7);
});

describe('listener/action/event creation and removal', () => {
    test('listener creation with create (actionId)', () => {
        var actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
        var priority = Math.floor(Math.random() * 99 + 1);
        var listenerId = listenerManager.create(tet.u.randString(7), actionId, priority);
        var listener = tet.m.idManager.get(listenerId);
        expect(listener.priority).toBe(priority);
        expect(listener.actionId).toBe(actionId);
        expect(tet.m.idManager.get(listener.actionId).anon).toBeUndefined();
        expect(tet.m.idManager.get(listener.actionId).listenerIds[listenerId]).toBe(true);
    });
    test('listener creation with on (actionId and anon action)', () => {
        var actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
        var priority = Math.floor(Math.random() * 99 + 1);
        var listenerIdWithActionId = listenerManager.on(tet.u.randString(7), actionId, priority);
        var listener = tet.m.idManager.get(listenerIdWithActionId);
        expect(tet.m.idManager.get(listener.actionId).anon).toBeUndefined();
        var listenerIdWithAnon = listenerManager.on(tet.u.randString(7), actionObj, priority);
        listener = tet.m.idManager.get(listenerIdWithAnon);
        // expect(tet.m.idManager.get(listener.actionId).anon).toBe(true);
    });
    test('remove (listenerIds) returns false for invalid id', () => {
        expect(listenerManager.remove('listener-' + tet.u.randString(10))).toBe(false);
    });
    test('remove (listenerIds) removes from event array', () => {
        var listenerId;
        listenerId = listenerManager.on(event, actionId, 40);
        var listenerId2 = listenerManager.on(event, actionId);
        expect(listenerManager.events[event]).toBeDefined();
        expect(listenerManager.events[event][0].listenerId).toBe(listenerId);
        expect(listenerManager.events[event].length).toBe(2);
        expect(listenerManager.remove(listenerId)).toBe(true);
        expect(listenerManager.events[event][0].listenerId).toBe(listenerId2);
        expect(listenerManager.events[event].length).toBe(1);
    });
    test('remove (listenerIds) returns false when listener is not in event array', () => {
        var listenerId = listenerManager.on(event, actionId);
        listenerManager.events[event].splice(0, 1); // this is really bad (should never happen)
        expect(listenerManager.remove(listenerId)).toBe(false);
    });
    test('remove (listenerIds) empty event gets deleted', () => {
        var listenerId = listenerManager.on(event, actionId);
        expect(listenerManager.remove(listenerId)).toBe(true);
        expect(listenerManager.events[event]).toBeUndefined();
    });
    test('remove (listenerIds) listener id gets removed', () => {
        var listenerId = listenerManager.on(tet.u.randString(7), actionId);
        expect(tet.m.idManager.get(listenerId)).toBeDefined();
        expect(listenerManager.remove(listenerId)).toBe(true);
        expect(tet.m.idManager.get(listenerId)).toBeUndefined();
    });
    test('remove works on actionIds and events as well', () => {
        expect(tet.m.idManager.get(actionId)).toBeDefined();
        expect(listenerManager.remove(actionId)).toBe(true);
        expect(tet.m.idManager.get(actionId)).toBeUndefined();
        var listenerId = listenerManager.on(event, actionId);
        expect(tet.m.idManager.get(listenerId)).toBeUndefined();
        expect(listenerManager.remove(event)).toBe(false);
    });
    test('removeAction removes action id', () => {
        var actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
        expect(tet.m.idManager.get(actionId)).toBeDefined();
        expect(listenerManager.removeAction(actionId)).toBe(true);
        expect(tet.m.idManager.get(actionId)).toBeUndefined();
    });
    test('removeAction removes all listeners which use it as well', () => {
        var actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
        var listenerId = listenerManager.create(event, actionId);
        expect(tet.m.idManager.get(listenerId)).toBeDefined();
        expect(listenerManager.removeAction(actionId)).toBe(true);
        expect(tet.m.idManager.get(listenerId)).toBeUndefined();
    });
    test('removeAction returns false for invalid action', () => {
        expect(listenerManager.removeAction(tet.u.randString(7))).toBe(false);
    });
    test('removeEvent removes all attached listeners', () => {
        var actionId2 = tet.m.actionManager.create(action.func, action.this, action.arguments);
        var listenerId = listenerManager.on(event, actionId);
        var listenerId2 = listenerManager.on(event, actionId2);
        expect(tet.m.idManager.get(listenerId)).toBeDefined();
        expect(tet.m.idManager.get(listenerId2)).toBeDefined();
        expect(listenerManager.removeEvent(event)).toBe(true);
        expect(tet.m.idManager.get(listenerId)).toBeUndefined();
        expect(tet.m.idManager.get(listenerId2)).toBeUndefined();
    });
    test('removeEvent returns false when event does not have listeners', () => {
        expect(listenerManager.removeEvent(tet.u.randString(7)));
    });
    test('gets works with actionIds, listenerIds, and events', () => {
        var actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
        var listenerId = listenerManager.on(event, actionId);
        // expect(tet.m.idManager.get(event)).toBeDefined();
        expect(tet.m.idManager.get(actionId)).toBeDefined();
        expect(tet.m.idManager.get(listenerId)).toBeDefined();
        expect(tet.m.idManager.get(tet.u.randString(7))).toBeUndefined();
    });
});

describe('event setup and firing', () => {
    test('basic event creation and fire', () => {
        var listenerId = listenerManager.on(event, actionId);
        var listener = tet.m.idManager.get(listenerId);
        var action = tet.m.idManager.get(listener.actionId);
        expect(action.this.calls.length).toBe(0);
        var value = {test: tet.u.randString(5)};
        listenerManager.fire(event, value);
        expect(action.this.calls.length).toBe(1);
        listenerManager.fire(event, value);
        expect(action.this.calls.length).toBe(2);
        expect(action.this.calls[0].length).toBe(3 + 2);
        expect(action.this.calls[0][4]).toBe(event);
        expect(action.this.calls[0][3]).toBe(value);
    });
    test('multiple listeners on one event fire in order', () => {
        listenerManager.on(event, actionId);
        var actionObj2 = {
            func: function(obj) {
                expect(obj.env.calls.length).toBe(0);
            },
            args: [actionObj]
        };
        var actionObj3 = {
            func: function(obj) {
                expect(obj.env.calls.length).toBe(1);
            },
            args: [actionObj]
        };
        listenerManager.on(event, actionObj2, 40);
        listenerManager.on(event, actionObj3, 60);
        listenerManager.fire(event);
    });
    test('one action works with multiple listeners when firing', () => {
        var actionId = tet.m.actionManager.create(action.func, action.this, action.arguments);
        listenerManager.create(event, actionId);
        listenerManager.create(event, actionId);
        var event2 = tet.u.randString(7);
        listenerManager.create(event2, actionId);
        expect(action.this.calls.length).toBe(0);
        listenerManager.fire(event);
        expect(action.this.calls.length).toBe(2);
        listenerManager.fire(event2);
        expect(action.this.calls.length).toBe(3);
        listenerManager.fire(event);
        expect(action.this.calls.length).toBe(5);
    });
    test('_preexecute, _execute, and _noexecute events fire', () => {
        var actionId2 = tet.m.actionManager.create();
        listenerManager.on('_preexecute', actionId);
        listenerManager.on('_execute', actionId);
        listenerManager.on('_noexecute', actionId);
        expect(action.this.calls.length).toBe(0);
        listenerManager.fire(event);
        expect(action.this.calls.length).toBe(1);
        listenerManager.on(event, actionId2);
        listenerManager.fire(event);
        expect(action.this.calls.length).toBe(3);
    });
    test('return values of actions get passed through via listener id', () => {
        var randStr = tet.u.randString(30);
        var actionId2 = tet.m.actionManager.create(function() {return this.ret;}, {ret: randStr});
        var listenerId = listenerManager.on(event, actionId2);
        var ret = listenerManager.fire(event);
        expect(ret[listenerId]).toBe(randStr);
    });
    test('return values of _parent, _preexecute, and _execute get passed through respective event labels', () => {
        var randStrPre = tet.u.randString(30);
        var actionIdPre = tet.m.actionManager.create(function() {return this.ret;}, {ret: randStrPre});
        var listenerIdPre = listenerManager.on('_preexecute', actionIdPre);
        var randStrNo = tet.u.randString(30);
        var actionIdNo = tet.m.actionManager.create(function() {return this.ret;}, {ret: randStrNo});
        var listenerIdNo = listenerManager.on('_noexecute', actionIdNo);
        var randStrExec = tet.u.randString(30);
        var actionIdExec = tet.m.actionManager.create(function() {return this.ret;}, {ret: randStrExec});
        var listenerIdExec = listenerManager.on('_execute', actionIdExec);
        var ret = listenerManager.fire(event);
        expect(ret['_noexecute']).toBeDefined();
        expect(ret['_preexecute']).toBeUndefined();
        expect(ret['_execute']).toBeUndefined();
        expect(ret['_noexecute'][listenerIdNo]).toBe(randStrNo);
        var randStr = tet.u.randString(30);
        var actionId = tet.m.actionManager.create(function() {return this.ret;}, {ret: randStr});
        var listenerId = listenerManager.on(event, actionId);
        ret = listenerManager.fire(event);
        expect(ret['_noexecute']).toBeUndefined();
        expect(ret['_preexecute']).toBeDefined();
        expect(ret['_execute']).toBeDefined();
        expect(ret['_preexecute'][listenerIdPre]).toBe(randStrPre);
        expect(ret['_execute'][listenerIdExec]).toBe(randStrExec);
        expect(ret[listenerId]).toBe(randStr);
    });
});

describe('utils', () => {
    // insert(array, ele, key)
    describe('insert', () => {
        test('no elements', () => {
            var arr = [], ele = {a: 12};
            listenerManager.insert(arr, ele, 'a');
            expect(arr).toEqual([ele]);
        });    
        test('multiple elements adding to end', () => {
            var arr = [], nums = [5, 10, 15], key = tet.u.randString(5), obj;
            for (var n of nums) { obj = {}; obj[key] = n; arr.push(obj); }
            obj = {}; obj[key] = 20;
            listenerManager.insert(arr, obj, key);
            expect(arr.length).toEqual(4);
            expect(arr[3][key]).toBe(20);
        });
        test('multiple elements adding to beginning', () => {
            var arr = [], nums = [5, 10, 15], key = tet.u.randString(5), obj;
            for (var n of nums) { obj = {}; obj[key] = n; arr.push(obj); }
            obj = {}; obj[key] = 3;
            listenerManager.insert(arr, obj, key);
            expect(arr.length).toEqual(4);
            expect(arr[0][key]).toBe(3);
        });
        test('multiple elements adding to middle', () => {
            var arr = [], nums = [5, 10, 15], key = tet.u.randString(5), obj;
            for (var n of nums) { obj = {}; obj[key] = n; arr.push(obj); }
            obj = {}; obj[key] = 13;
            listenerManager.insert(arr, obj, key);
            expect(arr.length).toEqual(4);
            expect(arr[2][key]).toBe(13);
        });
        test('multiple elements adding a duplicate works', () => {
            var arr = [], nums = [5, 10, 15], key = tet.u.randString(5), obj;
            for (var n of nums) { obj = {}; obj[key] = n; arr.push(obj); }
            arr[1]['test'] = false;
            obj = {test: true}; obj[key] = 10;
            listenerManager.insert(arr, obj, key);
            expect(arr.length).toEqual(4);
            expect(arr[2][key]).toBe(10);
            expect(arr[1][key]).toBe(10);
            expect(arr[2].test || arr[1].test).toBe(true);
        });
        test('basic tests', () => {
            var arr = [{a: 40}], ele = {a: 50};
            listenerManager.insert(arr, ele, 'a');
            expect(arr).toEqual([{a: 40}, {a: 50}]);
        });
    });
});
