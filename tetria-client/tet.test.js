const tet = require('./tet.js');

describe('tet importing modules', () => {
    var randName;
    beforeEach(() => {
        randName = tet.utils.randString();
    });
    test('standard object', () => {
        var module = { name: randName };
        tet.exports = module;
        expect(tet.modules[randName]).toBe(module);
        expect(tet.objects[randName]).toBeUndefined();
        expect(module.tet).toBeDefined();
    });
    test('standard function', () => {
        var func = function() {};
        tet.exports = func;
        console.log(tet.objects);
        expect(tet.objects['Func']).toBe(func);
        expect(tet.modules['Func']).toBeUndefined();
        expect(func.prototype.tet).toBeDefined();
    });
    test('addModule with name', () => {
        var randName2 = tet.utils.randString();
        var module = { name: randName };
        tet.addModule(module, randName2);
        expect(tet.modules[randName2]).toBe(module);
        expect(tet.modules[randName]).toBeUndefined();
        expect(module.tet).toBeDefined();
    });
    test('addModule without name', () => {
        var module = { name: randName };
        tet.addModule(module);
        expect(tet.modules[randName]).toBe(module);
        expect(module.tet).toBeDefined();
    });
});

test('tet shortcuts', () => {
    expect(tet.modules).toBeDefined();
    expect(tet.modules).toBe(tet.m);
    expect(tet.objects).toBe(tet.o);
    expect(tet.utils).toBe(tet.u);
    // expect(tet.global).toBe(tet.g);    
});

describe('utils functions', () => {
    test('got set within tet.utils', () => {
        for (var v in tet.utils) {
            expect(typeof(tet.utils[v])).toBe('function');
        }
    });
    describe('randString', () => {
        test('string that generates changes', () => {
            expect(tet.utils.randString()).not.toBe(tet.utils.randString());
        });
        test('parameter length changes length', () => {
            expect(tet.utils.randString().length).toBe(20);
            expect(tet.utils.randString(1).length).toBe(1);
            expect(tet.utils.randString(50).length).toBe(50);
        });
        test('parameter chars changes chars', () => {
            expect(tet.utils.randString(undefined, '1')).toContain('1');
            var chars = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var str = tet.utils.randString(undefined, chars);
            for (var i = 0; i < str.length; i++) {
                expect(chars).toContain(str[i]);
            }
        });
    });
    describe('objFill', () => {
        test('simple arguments, default flags', () => {
            var template = {
                a: 1, b: true, c: 'test', d: [1, 2, 3, 4]
            };
            var arg = {
                a: 3, c: 'test2', e: 'nope'
            };
            var ret = tet.utils.copy(template);
            ret.a = 3;
            ret.c = 'test2';
            expect(tet.utils.objFill(template, arg)).toEqual(ret);
        });
        test('minimal arguments', () => {
            expect(tet.utils.objFill({}, {})).toEqual({});
            expect(tet.utils.objFill({a: 2})).toEqual({a: 2});
        });
        test('string keys', () => {
            var template = { func: function() {}, env: {}, args: [] };
            var env = tet.u.randString(30);
            var func = function() { return this; };
            var arg = { func: func, env: env };
            var argRet = tet.utils.objFill(template, arg);
            expect(argRet).toEqual({func: func, env: env, args: []});
        });
        test('TODO type flag', () => {

        });
    });
    describe('copy', () => {
        test('basic types', () => {
            expect(tet.utils.copy(undefined)).toBe(undefined);
            expect(tet.utils.copy(null)).toBe(null);
            expect(tet.utils.copy(4)).toBe(4);
            expect(tet.utils.copy('')).toEqual('');
            expect(tet.utils.copy('hello there')).toBe('hello there');
            expect(tet.utils.copy([])).toEqual([]);
            expect(tet.utils.copy([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
            expect(tet.utils.copy({})).toEqual({});
            var obj = {a: 1, b: 'hello', c: [3]};
            expect(tet.utils.copy(obj)).toEqual(obj);
            expect(tet.utils.copy(obj)).not.toBe(obj);
        });
        test('nested object', () => {
            var obj = {
                a: 1,
                b: {
                    c: 3, d: '1df',
                    e: [1, 2, {5: 6}],
                },
            };
            expect(tet.utils.copy(obj)).toEqual(obj);
            expect(tet.utils.copy(obj)).not.toBe(obj);
        });
    });
});
