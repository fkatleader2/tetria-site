/**
 * Core frontend module manager.
 * TODO
 * - in setup, check module requirements (and add required managers)
 * - utils.copy add parameters (depth, flags, etc)
 * - utils.copy better check for array type
 * - utils.objFill add parameters (nested, etc)
 * - move insertAt tests from listeners.test.js to tet.test.js
 * - test _key and _require
 */

var tet = {
	inBrowser: false,
	objects: {},
    modules: {},
    exportOrder: [],
	utils: {
		copy: null, // (obj)
		objFill: null, // (prototype, arg)
		randString: null, // (length, chars)
		random: null, // random function (Math.random or seedrandom)
        insertAt: null, // (arr, ele, sortkey) returns index to insert at
        // objInherit: null, // (parent, child, key) attaches parent key to child (or adds func calling super with correct env)
	},
	get o() { return this.objects; },
	get m() { return this.modules; },
	get u() { return this.utils; },
	set exports(module) {
		this.addModule(module, module.name);
	},
	addModule(module, name) {
		if (typeof(module) == 'function') {
			if (typeof(name) != 'string') name = module.name;
            if (name != 'seedrandom') {
                name = name[0].toUpperCase() + name.substring(1);
			}
			this.objects[name] = module;
            module.prototype.tet = tet;
            
            var moduleName;
            if (module.prototype._managers != undefined) {
                for (var m of module.prototype._managers) {
                    moduleName = m[0].toLowerCase() + m.substring(1);
                    module.prototype[moduleName] = this.modules[moduleName];
                }
            }
            if (name.endsWith('Manager')) {
				moduleName = name[0].toLowerCase() + name.substring(1);
				this.modules[moduleName] = new this.objects[name]();
            }
            name += 'o-';
        } else {
			if (typeof(name) != 'string') name = module.name;
			this.modules[name] = module;
            module.tet = tet;
            name += 'm-';
        }
        this.exportOrder.push(name);
    },
    reloadAllModules() {
        // inorder loaded
        for (var label of this.exportOrder) {
            if (label.startsWith('o-')) { // objects
                var name = label.substring(2);
                this.addModule(this.o[name], name);
            } else if (label.startsWith('m-')) { // modules

            }
        }
    },
	setup() {
		// autowire managers
		var objLoader = function(tet, objName) {
			var moduleName = objName[0].toLowerCase() + objName.substring(1);
			var objName = objName[0].toUpperCase() + objName.substring(1);
			if (tet.m[moduleName] != undefined) return true;
			if (tet.o[objName] == undefined) return false;
            if (tet.o[objName].prototype._managers != undefined) {
                for (var m of tet.o[objName].prototype._managers) {
					if (!objLoader(tet, m)) return false;
					var mModuleName = m[0].toLowerCase() + m.substring(1);
					tet.o[objName].prototype[mModuleName] = tet.m[mModuleName];
				}
			}
			return true;
		}
        for (var objName in this.objects) {
			if (objName.endsWith('Manager')) continue;
			// tet.m[moduleName] = new tet.o[objName];
            if(!objLoader(this, objName)) console.warn('failed to autowire object [%s]', objName);
		}

		// setup module managers
		for (var moduleName in this.modules) {
			if (((moduleName.endsWith('Manager') && this.objects[moduleName[0].toUpperCase() + moduleName.substring(1)] == undefined)
					|| !moduleName.endsWith('Manager')) && this.modules[moduleName]._managers != undefined) {
				for (var m of this.modules[moduleName]._managers) {
					var mModuleName = m[0].toLowerCase() + m.substring(1);
					this.modules[moduleName][mModuleName] = tet.m[mModuleName];
				}
			}
			if (!moduleName.endsWith('Manager')) continue;
			if (typeof(this.modules[moduleName].setup) != 'function') continue;
			this.modules[moduleName].setup();
		}

		// setup modules if it's present
		for (var moduleName in this.modules) {
			if (moduleName.endsWith('Manager')) continue;
			if (typeof(this.modules[moduleName].setup) != 'function') continue;
			this.modules[moduleName].setup();
		}
	}
};

try {
	module.exports = tet;
} catch (e) {
	tet.inBrowser = true;
	window.onload = tet.setup;
	document.addEventListener('DOMContentLoaded', function() {
		tet.setup();
	}, false);
}

tet.utils.random = Math.random;
tet.utils.objFill = function(prototype, arg = {}, flags = {type: false}) { // return obj with same contents as prototype (cloned) but arg overwrites existing keys
	var ret = this.copy(prototype);
	for (var v in prototype) {
		if (arg[v] == undefined) continue;
		if (flags.type) {
			if (typeof(arg[v]) == typeof(prototype[v])) ret[v] = arg[v];
			continue;
		}
		ret[v] = arg[v];
	}
	return ret;
};
tet.utils.randString = function(length = 20, chars = 'abcdefghijklmnopqrstuvwxyz') {
	var ret = '';
	for (var i = 0; i < length; i++) {
		ret += chars[Math.floor(chars.length * this.random())];
	}
	return ret;
};
tet.utils.copy = function(obj) {
	if (typeof(obj) == 'string') return obj.slice();
	if (typeof(obj) == 'boolean') return obj;
	if (typeof(obj) == 'number') return obj;
	if (typeof(obj) == 'function') return obj;
	var ret;
	if (typeof(obj) == 'object') {
		if (obj == null) return obj;
		if (typeof(obj.length) == 'number' && typeof(obj[Symbol.iterator]) === 'function') {
			ret = [];
			for (var v of obj)
				ret.push(this.copy(v));
		} else {
			ret = {};
			for (var v in obj)
				ret[v] = this.copy(obj[v]);
		}
	}
	return ret;
};
tet.utils.insertAt = function(arr, element, sortKey) {
	if (element[sortKey] === null) return arr.length;
	var target = element[sortKey];
	var start = 0;
	var end = arr.length;
	var middle = Math.floor((start + end) / 2);
	while (middle !== arr.length && middle !== 0 && arr[middle][sortKey] !== target && start < end) {
		if (target < arr[middle][sortKey]) end = middle - 1;
		else start = middle + 1;
		middle = Math.floor((start + end) / 2);
	}
	for (var i = middle; i != arr.length && arr[i][sortKey] < target; i++)
		middle++;
	return middle;
};
