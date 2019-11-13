/**
 * TODO:
 * - addSettings implement priority / alphabetical
 */
tet.exports = {
    name: 'pageSettings',
    setupPage() {
        console.log('settings h');
    },
    

    settingsList: [],
    // settingsEle: {name, groupName (null), values: {key: value}, onValueChange}
    // onValueChange(key, value, oldValue) return value changeSetting returns
    addSettings(settingsEle, priority = -1) { // priority: 0 top, 100 bottom, alphabetical at bottom for default
        this.settingsList.push(settingsEle);
    },
    changeSetting(name, key, value) {
        var settingsEle = null;
        for (var ele of this.settingsList) if (ele.name == name) settingsEle = ele;
        if (settingsEle == null) return 'invalid settings name';
        if (typeof(settingsEle.onValueChange) != 'function') return undefined;
        var oldValue = settingsEle.values[key];
        settingsEle.values[key] = value;
        return settingsEle.onValueChange(key, value, oldValue);
    }
}
