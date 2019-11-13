/**
 * TODO
 * - find search function 
 */
(function() {
    var labelTree = function(idGenerator) {
        if (idGenerator == undefined) {
            idGenerator = new this.idManager.Generator({prepend: 'labelTree-', length: 10});
        }
        this.idGenerator = idGenerator;
        this.labels = {};
        this.rootId = this.create('root');
    };

    try {
        tet.exports = labelTree;
    } catch (e) {
        try {
            module.exports = labelTree;
        } catch (e) {
            LabelTree = labelTree;
        }
    }

    labelTree.prototype._managers = ['IdManager'];
    
    labelTree.prototype.get = function(identifier) {
        if (identifier == undefined) return undefined;
        var ret;
        if (identifier.startsWith(this.idGenerator.format.prepend)) {
            if ((ret = this.idManager.get(identifier)) != undefined) return ret;
        }
        var ids = this.getIdsFromLabel(identifier);
        if (ids.length == 0) return undefined;
        return this.get(ids[0]);
    };
    labelTree.prototype.getLabel = function(id) {
        var ret = this.get(id);
        return ret == undefined ? undefined : ret.label;
    };
    labelTree.prototype.getIdsFromLabel = function(label) {
        var ret = this.labels[label];
        return ret === undefined ? [] : ret;
    };
    labelTree.prototype.create = function(label, parentIdentifier = this.rootId) {
        var parent = this.get(parentIdentifier);
        if (parent == undefined) {
            if (this.rootId != undefined) return null;
            parent = {};
        }

        var newObj = {parentId: parent.id, childIds: {}, label: label};
        var newId = this.idGenerator.create(newObj, 'id');

        if (parent.childIds != undefined) parent.childIds[newId] = newObj;

        if (label != undefined) {
            if (this.labels[label] == undefined) this.labels[label] = [];
            this.labels[label].push(newId);    
        }
        return newId;
    };

    labelTree.prototype.related = function(idA, idB) { // returns 1 if A is ancestor of B, -1 if B is ancestor of A, 0 if not related, 2 if the same
        var a = idA, b = idB, node;
        if (a == b) return 2;
        while (a != this.rootId && (node = this.get(a)).parentId != b) a = node.parentId;
        if (node != undefined) {
            if (node.parentId == b) return -1;
        }
        a = idA, node = undefined;
        while (b != this.rootId && (node = this.get(b)).parentId != a) b = node.parentId;
        if (node != undefined) {
            if (node.parentId == a) return 1;
        }
        return 0;
    };
    labelTree.prototype.sameOrAncestor = function(idA, idB) {
        return this.related(idB, idA) > 0;
    };

    labelTree.prototype.find = function(path, generate = false, nodeId = this.rootId) {
        return undefined;
        var findWithinNode = function(path, generate, nodeId) {
            if ('. '.indexOf(path[0]) == -1) path = ' ' + path;
            var node = this.get(nodeId);
            var selector = path[0];
            path = path.substring(1);
            var nextKey = Math.min(
                path.indexOf('.') == -1 ? Math.MAX_SAFE_INTEGER : path.indexOf('.'), 
                path.indexOf(' ') == -1 ? Math.MAX_SAFE_INTEGER : path.indexOf(' '));
            // todo what if nether space or .
            var label = path.substring(0, nextKey);
            var nextPath = path.substring(nextKey);
        
            var ids = this.getIdsFromLabel(label);
            var ret;
            if (selector == '.') { // search only within this node
                for (var id in node) {
                    if (ids.indexOf(id)) {
                        ret = this.find(nextPath, false, id);
                        if (ret != undefined) return ret;
                    }
                }
                if (!generate) return undefined;
                else return this.find(nextPath, true, id);
            } 
            // search within this node and all child nodes
            // check this level
            var ret = this.find('.' + label + nextPath, false, nodeId);
            if (ret != undefined) return ret;
            // check all levels below
            for (var id in node) {
                ret = this.find(' ' + label + nextPath, false, id);
                if (ret != undefined) return ret;
            }
            // generate at this level
            if (generate) return this.find('.' + label + nextPath, true, nodeId);
            return undefined;
        };

        if (path[0] == '.') return findWithinNode(path, generate, nodeId);
        path = path.trim();
        var ids = this.getIdsFromLabel(label);
        var nextKey = Math.min(
            path.indexOf('.') == -1 ? Math.MAX_SAFE_INTEGER : path.indexOf('.'), 
            path.indexOf(' ') == -1 ? Math.MAX_SAFE_INTEGER : path.indexOf(' '));
        if (nextKey == Math.MAX_SAFE_INTEGER) {
            if (ids == undefined) {
                if (generate) return this.add(path, nodeId);
                return undefined;
            }
        }

        var label = path.substring(0, nextKey);
        var nextPath = path.substring(nextKey);
        for (var id of ids) {
            var ret = findWithinNode(nextPath, false, id);
            if (ret != undefined) return ret;
        }
        if (generate) return findWithinNode(nextPath, true, ids[0]);
        return undefined;
    };
})();
