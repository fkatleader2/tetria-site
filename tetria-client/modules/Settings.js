/**
 * TODO:
 * - write tests
 */
(function() {
    var settings = {
        name: 'settings',
        _managers: ['listenerManager'],
        currentProfile: "Default",
        profiles: {}, // label: Profile
        groups: {}, // {e: event, editable, ...settings...}
        get(groupLabel, key, event = false) { // returns undefined if not found
            var prof;
            if ((prof = this.profiles[this.currentProfile]) == undefined) {
                if (this.currentProfile == null) return undefined;
                prof = new this.Profile(this.currentProfile);
            }
            return prof.get(groupLabel, key, event);
        },
        set(groupLabel, key, value) {
            var o = this.get(groupLabel, key, true);
            var prev = o.v;
            o.v = value;
            if (o.e != null) this.listenerManager.fire(o.e, {newValue: value, prevValue: prev});
            if (this.groupLabel.e != null) this.listenerManager.fire(o.e, {newValue: value, prevValue: prev});
        },
        setEvent() {

        },
        Profile = function(name) {
            if (this.settings.profiles[name] != undefined) throw Error('profile name already exists');
            this.name = name;
            this.groupsLabels = {};
            this.profileLabels = []; //  profileLabels
            this.settings = this.settings;
            this.settings.profiles[this.name] = this;
        },
    };
    settings.Profile.prototype.settings = settings;
    settings.Profile.prototype.get = function(groupLabel, key, event = false) {
        var ret;
        if (this.groups[groupLabel] != undefined) {
            for (var gLabel of this.groups[groupLabel])
                if ((ret = this.settigns.groups[gLabel][key]) != undefined) return event ? ret : ret.v;
        }
        for (var pLabel of this.profileLabels)
            if ((ret = this.settings.profileLabels[pLabel].get(groupLabel, key, event)) != undefined) return ret;
        return undefined;
    };

    try {
        tet.exports = settings;
    } catch (e) {
        try {
            module.exports = settings;
        } catch (e) {
            Settings = settings;
        }
    }
})();

