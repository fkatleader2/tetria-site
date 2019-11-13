/**
 * TODO:
 * -
 */

const tet = require('../tet.js');
var LabelTree;
tet.addModule(require('./IdManager.js'));
tet.addModule(LabelTree = require('./LabelTree.js'));

test('constructor', () => {
    var labelTreeNoArgs = new LabelTree();
    expect(labelTreeNoArgs.rootId.startsWith('labelTree-')).toBe(true);
    expect(labelTreeNoArgs.labels).toEqual({'root': [labelTreeNoArgs.rootId]});

    var prepend = tet.u.randString(5);
    var generator = new tet.m.idManager.Generator({prepend: prepend, length: 5});
    var labelTreeArgs = new LabelTree(generator);
    expect(labelTreeArgs.rootId.startsWith(prepend)).toBe(true);
    expect(labelTreeArgs.labels).toEqual({'root': [labelTreeArgs.rootId]});
});

describe('functions', () => {
    var labelTree, ida, idb, idaa;
    beforeEach(() => {
        labelTree = new LabelTree();
        ida = labelTree.create('a');
        idb = labelTree.create('b');
        idaa = labelTree.create('aa', ida);
    });

    describe('get', () => {
        test('by id', () => {
            var node = labelTree.get(idb);
            expect(node).toBeDefined();
            expect(node.parentId).toBe(labelTree.rootId);
            expect(node.id).toBe(idb);
            expect(node.childIds).toEqual({});
            node = labelTree.get(idaa);
            expect(node).toBeDefined();
            expect(node.parentId).toBe(ida);
            expect(node.id).toBe(idaa);
            expect(node.childIds).toEqual({});
            node = labelTree.get(ida);
            expect(node).toBeDefined();
            expect(node.parentId).toBe(labelTree.rootId);
            expect(node.id).toBe(ida);
            expect(node.childIds[idaa]).toBe(labelTree.get(idaa));
        });
        test('by label', () => {
            expect(labelTree.get('root')).toBe(labelTree.get(labelTree.rootId));
            expect(labelTree.get('a')).toBe(labelTree.get(ida));
            expect(labelTree.get('aa')).toBe(labelTree.get(idaa));
        });
    });
    test('getLabel', () => {
        expect(labelTree.getLabel(ida)).toBe('a');
        expect(labelTree.getLabel(idaa)).toBe('aa');
    });
    test('getIdsFromLabel', () => {
        expect(labelTree.getIdsFromLabel('a')).toEqual([ida]);
        var ida2 = labelTree.create('a', 'b');
        expect(labelTree.getIdsFromLabel('a')).toEqual([ida, ida2]);
    });
    describe('create', () => {
        test('no parentIdentifier', () => {
            var id;
            expect(id = labelTree.create('a')).not.toBe(null);
            expect(labelTree.get(id)).toBeDefined();
        });
        test('id as parentIdentifier', () => {
            var id;
            expect(id = labelTree.create('a', ida)).not.toBe(null);
            expect(labelTree.get(id)).toBeDefined();
            expect(labelTree.get(id).parentId).toBe(ida);
            expect(labelTree.get(ida).childIds[id]).toBeDefined();
        });
        test('label as parentIdentifier', () => {
            var id;
            expect(id = labelTree.create('a', 'b')).not.toBe(null);
            expect(labelTree.get(id)).toBeDefined();
            expect(labelTree.get(id).parentId).toBe(labelTree.get('b').id);
            expect(labelTree.get('a')).toBeDefined();
            expect(labelTree.get('b').childIds[id]).toBeDefined();
        });
        test('label as parentIdentifier with mulitple same labels', () => {
            var id;
            expect(id = labelTree.create('a', 'a')).not.toBe(null);
            expect(labelTree.get(id)).toBeDefined();
            expect(labelTree.get(id).parentId).toBe(labelTree.get('a').id);
            expect(labelTree.get('a')).toBeDefined();
            expect(labelTree.get('a').childIds[id]).toBeDefined();
        });
        test('invalid parentIdentifier', () => {
            expect(labelTree.create('a', tet.u.randString(20))).toBe(null);
        });
        test('no label provided does not add label', () => {
            var id;
            var labelsCopy = tet.u.copy(labelTree.labels);
            expect(id = labelTree.create(undefined, 'b')).not.toBe(null);
            expect(labelTree.labels).toEqual(labelsCopy);
        });
    });
    describe('related', () => { // a > b: 1, a == b: 2, a < b: -1, a !! b: 0 (closer to root is higher)
        test('descendant', () => {
            expect(labelTree.related(ida, idaa)).toBe(1);
        });    
        test('ancestor', () => {
            expect(labelTree.related(idaa, ida)).toBe(-1);
        });    
        test('same', () => {
            expect(labelTree.related(ida, ida)).toBe(2);
        });    
        test('not related', () => {
            expect(labelTree.related(ida, idb)).toBe(0);
        });    
    })
    test('sameOrAncestor', () => {
        expect(labelTree.sameOrAncestor(ida, idaa)).toBe(false);
        expect(labelTree.sameOrAncestor(idaa, ida)).toBe(true);
        expect(labelTree.sameOrAncestor(ida, ida)).toBe(true);
        expect(labelTree.sameOrAncestor(ida, idb)).toBe(false);
    });
});
