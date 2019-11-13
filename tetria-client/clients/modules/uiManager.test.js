const tet = require('../../tet.js');
var uiManager;
tet.addModule(require('../../modules/IdManager.js'));
tet.addModule(require('../../modules/ListenerManager.js'));
tet.addModule(uiManager = require('./uiManager.js'));
tet.setup();

beforeEach(() => {
    
});

test('initializes into test mode', () => {
    expect(tet.m.idManager).toBeDefined();
    expect(tet.m.uiManager).toBeDefined();
    expect(uiManager.tet).toBeDefined();
    expect(uiManager.idManager).toBeDefined();
});

describe('', () => {
    test('', () => {

    });
});