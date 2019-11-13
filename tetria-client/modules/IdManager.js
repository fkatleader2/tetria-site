/**
 * var idSpace = {};
 * var IdManager = new IdManager(idSpace);
 * idManager.create() // creates ID with default generator
 * var generator = idManager.Generator(rules)
 * generator.create() // creates ID
 */

/**
 * TODO:
 * - add basic tet object for when this gets loaded without tet
 * - auto grow flag (so when space fills up, increase length by 1)
 * - auto cleanup after time period (callback and reset prevId?)
 */
(function() {
    var idManager = function(idSpace = {}) {
        this.space = idSpace;
        this.Generator.prototype.idManager = this;
        this.defaultGenerator = new this.Generator();

        if (this.space._prevIds === undefined) this.space._prevIds = {};
    };

    idManager.prototype.link = function(id, obj) {
        if (this.space[id] === undefined) return false;
        this.space[id] = obj;
        return true;
    };
    idManager.prototype.create = function(obj, key) {
        return this.defaultGenerator.create(obj, key);
    };
    idManager.prototype.get = function(id) {
        return this.space[id];
    };
    idManager.prototype.remove = function(id) {
        if (this.space[id] === undefined) return false;
        delete this.space[id];
        return true;
    };

    var generator = function(format) {
        this.format = this.idManager.tet.u.objFill({
            prepend: '', length: 20, charset: '',
            flags: {random: false, readable: false, lowerCaseOnly: false, upperCaseOnly: false, includeNumbers: true}
        }, format, {type: true});
        if (this.format.charset == '') {
            this.format.charset = this.charsets.alpha;
            if (this.format.flags.lowerCaseOnly) this.format.charset = this.charsets.az;
            else if (this.format.flags.upperCaseOnly) this.format.charset = this.charsets.AZ;
            if (this.format.flags.includeNumbers) this.format.charset = this.charsets['09'] + this.format.charset;
            if (this.format.flags.readable) this.format.charset = this.charsets.readable(this.format.charset);
        }
        this.idManager = this.idManager;
    };
    idManager.prototype.Generator = generator;

    generator.prototype.charsets = {
        az: 'abcdefghijklmnopqrstuvwxyz',
        '09': '0123456789',
        '10': '1234567890',
        get AZ() { return this.az.toUpperCase(); },
        get alpha() { return this.az + this.AZ; },
        get alphaNumeric() { return this.alpha + this['09']; },
        get numericAlpha() { return this['09'] + this.alpha; },
        readable(str) {
            var chars = 'ilo10';
            return str.replace(new RegExp('[' + chars.toUpperCase() + chars + ']', 'g'), '');
        },
        reverse(str) {
            return str.split('').reverse().join('');
        }
    };
    generator.prototype.create = function(obj, key) {
        var chars = this.format.charset;
        var ret = '';
        if (this.format.flags.random) {
            ret = this.idManager.tet.u.randString(this.format.length, this.format.charset);
        } else {
            var prevId;
            if ((prevId = this.idManager.space._prevIds[this.format.prepend + this.format.length]) === undefined) {
                for (var i = 0; i < this.format.length; i++) ret += chars[0];
            } else {
                ret = prevId;
                for (var i = ret.length - 1; i >= 0; i--) {
                    if (ret[i] != chars[chars.length - 1]) {
                        ret = ret.substring(0, i) + chars[chars.indexOf(ret[i]) + 1] + ret.substring(i + 1);
                        break;
                    }
                    ret = ret.substring(0, i) + chars[0] + ret.substring(i + 1);
                    if (i == 0) {
                        ret = '';
                        for (var i = 0; i < this.format.length; i++) ret += chars[0];
                        break;
                    }
                }
            }
        }
        // find next available ret (increment ret)
        var prevRet = ret;
        var overflow = false;
        var i;
        for (i = ret.length - 1; this.idManager.space[this.format.prepend + ret] !== undefined && i >= 0;) {
            // find next place that can be incremented
            i = ret.length - 1;
            while (ret[i] == chars[chars.length - 1] && i >= 0) {
                ret = ret.slice(0, i) + chars[0] + ret.slice(i + 1);
                i--;
            }

            if (i == -1 && !overflow) {
                overflow = true;
                i = ret.length - 1;
            }
            if (overflow && prevRet == ret) {
                throw new Error('No more ids in address space: ' + this.format.prepend + '-' + this.format.length);
            }
            ret = ret.slice(0, i) + chars[chars.indexOf(ret[i]) + 1] + ret.slice(i + 1);
        }
        if (!this.format.flags.random) {
            this.idManager.space._prevIds[this.format.prepend + this.format.length] = ret;
        }
        ret = this.format.prepend + ret;
        this.idManager.space[ret] = obj === undefined ? null : obj;
        if (typeof(key) == 'string') obj[key] = ret;
        return ret;
    };


    try {
        tet.exports = idManager;
    } catch (e) {
        try {
            module.exports = idManager;
        } catch (e) {
            IdManager = idManager;
        }
    }
})();
