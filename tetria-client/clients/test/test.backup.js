var testPaths = [
	"../../tet.test.js",
	"../../modules/listeners.test.js"
];

/**
 * todo:
 * - add node support (move some of these funcs to shared folder)
 * - add events for entire file passing
 * - add events for test progression / completion
 * - incorperate with ui
 * - support nested tests
 * - func tests
 */

var filePaths = {
	// "path": { loaded: false, onload: [{func1, args1}, ...] }
};

var tests = {};
var tet = {modules: {}};
var testsResults = {};
var globalTestVars = {
	startTestsTimeout: null,
	startTestsTimeoutWait: 3000, // in milliseconds
};

function setup() {
	var count = 0;
	var onload = function() {
		count++;
		if (count == testPaths.length) startTests(count);
	};
	for (var path of testPaths) {
		getFile(path, onload);
	}
	globalTestVars.startTestsTimeout = setTimeout(startTests, globalTestVars.startTestsTimeoutWait);
}

/**
 * Gets a file and calls the onload function once it loads.
 * @path is path to file
 * @onload callback function that gets called once the function loads
 * @args array of arguments fed to callback function
 * @parent (optional) is the parent of the path, if specified will convert @path to be relative
 */
function getFile(path, onload, args = [], parent, returnCompleted = false) {
	if (parent != undefined) path = parent.substring(0, parent.lastIndexOf('/') + 1) + path;

	if (filePaths[path] != undefined) {
		if (returnCompleted) return true;
		if (filePaths[path].loaded) {
			onload();
		} else {
			filePaths[path].onload.push({f: onload, a: args});
		}
		return;
	}
	filePaths[path] = { loaded: false, onload: [{f: onload, a: args}] };
	var head = document.getElementsByTagName("head")[0];
	var ele = document.createElement("script");
	ele.type = "text/javascript";
	ele.src = path;
	ele.onload = function(e) {
		var path = e.path[0].getAttribute("src");
		for (var f of filePaths[path].onload) 
			if (typeof(f.f) == "function") f.f.apply(null, args.concat(e));
		delete filePaths[path].onload;
	}
	head.appendChild(ele);
	if (returnCompleted) return false;
}

function startTests(count) {
	clearTimeout(globalTestVars.startTestsTimeout);
	if (count == undefined) {
		console.warn("Failed to load some files (see above GET errors)");
	}

	for (var testPath of testPaths) {
		var name = testPath.substring(testPath.lastIndexOf("/") + 1);
		name = name.substring(0, name.indexOf(".test"));
		if (tests[name] == undefined) {
			console.warn("[startTests] could not find tests for path=%s, expected=%s", path, name);
			continue;
		}
		tests[name].path = testPath;
	}

	unitTests();
	funcTests();
}

function unitTests(file, test) {
	if (file == undefined) {
		for (var f in tests) {
			unitTests(f);
		}
		return;
	}
	if (tests[file] == undefined) { console.warn("[unitTests] test file=%s not present", file); return; }
	if (tests[file].path != undefined) // auto-load base file for unit tests
		if (!getFile(tests[file].path.replace(".test.", "."), unitTests, [file, test], undefined, true))
			return; // wait for required file to load

	var excludedKeys = ["setup", "cleanup", "requires"];
	var unit = tests[file].unit;
	if (unit == undefined) { console.log("[unitTests] no tests found for file=%s", file); return; }
	if (testsResults[file] == undefined) testsResults[file] = {};
	if (test == undefined) { // run all tests in file
		var retEarly = false;
		if (tests[file].requires != undefined) {
			retEarly = true;
			for (var v of tests[file].requires)
				getFile(v, unitTests, [file], tests[file].path);
		}
		if (unit.requires != undefined) {
			retEarly = true;
			for (var v of unit.requires)
				getFile(v, unitTests, [file], tests[file].path);
		}
		if (retEarly) return;
		for (var t in unit) {
			if (excludedKeys.indexOf(t) != -1) continue;
			unitTests(file, t);
		}
	} else if (excludedKeys.indexOf(t) == -1) { // run specific test
		var env = runKey(unit, "setup");
		var res;
		try {
			testsResults[file][test] = "setup";
			res = runKey(unit, test, env);
			testsResults[file][test] = "running"
			if (res === undefined) res = "Passed";
			else if (typeof(res) == "boolean") res = res ? "Passed" : "Failed";
			else if (typeof(res) == "object") res = JSON.stringify(res);
		} catch (e) {
			res = "ERROR\n\t" + e.message;
			console.log(e.stack); // to get stack as well
		}
		testsResults[file][test] = res;
		printTestResults(file, test, res);
		runKey(unit, "cleanup");
	} else {
		console.warn("[unitTests] test name=%s in file=%s cannot be a keyword", test, file);
	}
}

function funcTests(file, test) {

}

function runKey(obj, key, env = null) { // runs key with params (if specified)
	if (obj[key] == undefined) return;
	if (typeof(obj[key]) == "function") return obj[key].apply(env, []);
	else if (typeof(obj[key]) == "object") {
		if (typeof(obj[key].func) == undefined) return;
		if (typeof(obj[key].args) != "object") {
			console.warn("\t[runKey] key=%s args must be an array of arguments", key);
			return;
		}
		return obj[key].func.apply(env, obj[key].args);
	}
}

function printTestResults(file, test, res) {
	// console.log("[unitTests] file=%s test=%s result=%s", file, test, res);
	// console.log("[unitTests] [%s] [%s] result=%s", file, test, res);
	var colors = {
		passed: "background: #96e296;",
		failed: "background: #d07474;",
		default: "background: #e0d47b;"
	}
	var color = "default";
	for (var c in colors) {
		if (res.toLowerCase().startsWith(c)) {
			color = c;
			break;
		}
	}
	console.log("%c[unitTests] [%s] [%s] %s", colors[color], file, test, res);
}

function testCopy(obj) {
	if (typeof(obj) == "string") return obj.slice();
	if (typeof(obj) == "boolean") return obj;
	if (typeof(obj) == "number") return obj;
	var ret;
	if (typeof(obj) == "object") {
		if (typeof(obj.length) == "number") {
			ret = [];
			for (var v of obj)
				ret.push(testCopy(v));
		} else {
			ret = {};
			for (var v in obj)
				ret[v] = testCopy(obj[v]);
		}
	}
	return ret;
}




