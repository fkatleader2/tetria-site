/**
 * TODO:
 * - add test to ensure scope (global and custom) persist across different ids
 * - add test for remove
 */

const tet = require('../tet.js');
var IdManager;
tet.addModule(IdManager = require('./IdManager.js'));
tet.addModule(require('./seedrandom.min.js'), 'seedrandom');

var idManager, defaultFormat;
beforeEach(() => {
    idManager = new IdManager();
    defaultFormat = {
        prepend: '',
        length: 20,
        charset: IdManager.prototype.Generator.prototype.charsets.numericAlpha,
        flags: {random: false, readable: false, lowerCaseOnly: false, upperCaseOnly: false, includeNumbers: true},
    };
});

test('loaded into tet correctly', () => {
    expect(tet.m.idManager).toBeDefined();
    expect(tet.o.IdManager).toBeDefined();
});

describe('unit tests', () => {
    test('basic id manager use', () => {
        var obj = {}, id;
        expect(typeof(id = idManager.create(obj)) == 'string').toBe(true);
        expect(idManager.get(id)).toBe(obj);
    });
    describe('generator', () => {
        test('lowerCaseOnly and upperCaseOnly flags prefer lowercase', () => {
            defaultFormat.flags.lowerCaseOnly = defaultFormat.flags.upperCaseOnly = true;
            delete defaultFormat.charset;
            var generator = new idManager.Generator(defaultFormat);
            expect(generator.format.charset).toBe(generator.charsets['09'] + generator.charsets.az);
        });
        test('flags generate correct charset', () => {
            var generator = new idManager.Generator({flags: {includeNumbers: false}});
            expect(generator.format.charset).not.toContain('0');
            generator = new idManager.Generator({flags: {upperCaseOnly: true}});
            expect(generator.format.charset).not.toContain('a');
            generator = new idManager.Generator({flags: {readable: true}});
            expect(generator.format.charset).not.toContain('l');
        });
        test('custom charset', () => {
            var prepend = tet.u.randString(5);
            var chars = tet.u.randString(7);
            var generate = new idManager.Generator({prepend: prepend, length: 100, charset: chars});
            for (var c of generate.create().substring(prepend.length)) {
                expect(chars).toContain(c);
            }
        });  
        describe('create', () => {
            var generator;
            beforeEach(() => {
                generator = new idManager.Generator();
            });

            test('minimal parameters', () => {
                var check = ['00000000000000000000', '00000000000000000001', '00000000000000000002'];
                for (var e of check) expect(generator.create()).toBe('' + e);
            });
            test('incrementer with basic parameters', () => {
                var prepend = tet.u.randString(10);
                var generator = new idManager.Generator({prepend: prepend, length: 15});
                var check = ['000000000000000', '000000000000001', '000000000000002'];
                for (var e of check) expect(generator.create()).toBe(prepend + e);
                for (var i = 0; i < 6; i++) generator.create();
                check = ['000000000000009', '00000000000000a', '00000000000000b', '00000000000000c'];
                for (var e of check) expect(generator.create()).toBe(prepend + e);
                for (var i = 0; i < 22; i++) generator.create();
                check = ['00000000000000z', '00000000000000A', '00000000000000B', '00000000000000C'];
                for (var e of check) expect(generator.create()).toBe(prepend + e);
                for (var i = 0; i < 22; i++) generator.create();
                check = ['00000000000000Z', '000000000000010', '000000000000011', '000000000000012'];
                for (var e of check) expect(generator.create()).toBe(prepend + e);
                for (var i = 0; i < 6 + 26 * 2; i++) generator.create();
                check = ['00000000000001Z', '000000000000020', '000000000000021', '000000000000022'];
                for (var e of check) expect(generator.create()).toBe(prepend + e);
                for (var i = 0; i < 6 + 26 * 2 + (62) * 59; i++) generator.create();
                check = ['0000000000000ZZ', '000000000000100', '000000000000101', '000000000000102'];
                for (var e of check) expect(generator.create()).toBe(prepend + e);
            });
            test('space overflow first scans over beginning before throwing error', () => {
                var prepend = tet.u.randString(12);
                var generator = new idManager.Generator({prepend: prepend, length: 2});
                var id1 = generator.create();
                for (var i = 0; i < 62 * 62 - 1; i++) generator.create();
                delete idManager.space[id1];
                expect(generator.create()).toBe(id1);
                expect(generator.create.bind(generator)).toThrow();
            });
            test('random flag enabled', () => {
                var prepend = tet.u.randString(12);
                var generator = new idManager.Generator({prepend: prepend, length: 40, flags: {random: true}});
                var tmp = tet.u.random;
                var seed = tet.u.randString(30);
                var rand1 = tet.o.seedrandom(seed);
                var rand2 = tet.o.seedrandom(seed);
                for (var i = 0; i < 5; i++) {
                    tet.u.random = rand2;
                    var str = tet.u.randString(40, generator.format.charset);
                    tet.u.random = rand1;
                    expect(generator.create()).toBe(prepend + str);
                }
                tet.u.random = tmp;
            });
            test('collisions go to next available id when random flag enabled', () => {
                var prepend = tet.u.randString(12);
                var generator = new idManager.Generator({prepend: prepend, length: 40, flags: {random: true}});
    
                var tmp = tet.u.random;
                var seed = tet.u.randString(30);
                var rand1 = tet.o.seedrandom(seed);
                var rand2 = tet.o.seedrandom(seed);
    
                tet.u.random = rand1;
                var id1 = generator.create();
                tet.u.random = rand2;
                var id2 = generator.create();
                expect(id1).not.toBe(id2);
                
                tet.u.random = tmp;
            });
            test('throws error when address space is filled', () => {
                var prepend = tet.u.randString(12);
                var generator = new idManager.Generator({prepend: prepend, length: 2});
                for (var i = 0; i < 62 * 62; i++) generator.create();
                expect(generator.create.bind(generator)).toThrow('No more ids in address space: ' + prepend + '-2');
            });
            test('obj and key parameter', () => {
                var obj = {test: 'a'};
                var id = generator.create(obj, 'id');
                expect(obj.id).toBe(id);
                expect(idManager.get(id)).toBe(obj);
            });
        });
    
        test('charsets readable', () => {
            var check = ['abcijklm00slfailmnLAzIs1f0Oa', idManager.defaultGenerator.charsets.numericAlpha];
            var chars = '0ilo1';
            for (var e of check) {
                var str = e;
                for (var c of (chars + chars.toUpperCase())) str = str.split(c).join('');
                expect(idManager.defaultGenerator.charsets.readable(e)).toBe(str);
            }
        });
        test('charset reverse', () => {
            var check = [['abc', 'cba'], ['aab', 'baa']];
            for (var v of check) {
                expect(idManager.defaultGenerator.charsets.reverse(v[0])).toBe(v[1]);
            }
        });
    
        test('get object from id', () => {
            var obj = {test: 'a'};
            var id = idManager.create(obj);
            expect(idManager.get(id)).toBe(obj);
        });
    
        test('use link to get object', () => {
            var obj = {test: 'a'};
            var id = idManager.create();
            idManager.link(id, obj);
            expect(idManager.get(id)).toBe(obj);
        });  
    });
    test('multiple managers each have custom (separate) spaces', () => {
        var key = tet.u.randString(20);
        var idManager2 = new IdManager();
        var id = idManager.create();
        var id2 = idManager2.create();
        idManager2.space[key] = 1;
        expect(Object.keys(idManager.space).length).toBe(2);
        expect(Object.keys(idManager2.space).length).toBe(3);
        expect(idManager.space[key]).toBeUndefined();
        expect(idManager2.space[key]).toBeDefined();
    });
});
