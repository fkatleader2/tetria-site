
(function() {
    /**
     * TODO:
     * - change action to use actionManager
     */
    var resizeCanvases = {
        name: 'canvasResizer',
        tmp: {},
        elements: [],
        settings: {
            useWaitTime: false,
            waitTime: 100
        },
        addEle(ele, action) {
            this.elements.push({e: ele, f: action});
            this.resize();
        },
        resizeFunc() {
            if (this.settings.useWaitTime) {
                var time = (new Date()).getTime();
                if (this.tmp.lastUpdate == undefined) this.tmp.lastUpdate = 0;
                if (this.tmp.lastUpdate + this.settings.waitTime > time) {
                    if (this.tmp.timeout == null) this.timeout = setTimeout(this.resize, 1000);
                    return;
                } else {
                    clearTimeout(this.tmp.timeout);
                    this.tmp.timeout = null;
                }
                this.tmp.lastUpdate = time;
            }
            for (var e of this.elements) {
                var canvas = e.e;
                var ele = canvas.parentNode;
                canvas.width = parseInt(window.getComputedStyle(ele).width);
                canvas.height = parseInt(window.getComputedStyle(ele).height);
                if (canvas.width == canvas.height && canvas.width == 0) {
                    this.timeout = setTimeout(resize, 1000);
                }
                e.f(canvas);
            }
        },
    }
    resizeCanvases.resize = resizeCanvases.resizeFunc.bind(resizeCanvases);

    try {
        tet.exports = resizeCanvases;
    } catch (e) {
        canvasResizer = resizeCanvases;
    }
})();

canvases = [];
function setup() {
    canvases = document.querySelectorAll('canvas');
    canvasResizer.addEle(canvases[0], draw);
    window.onresize = canvasResizer.resize;
    // canvasResizer.settings.useWaitTime = true;
};

function draw(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.rect(10, 20, 20, 20);
    ctx.stroke();
}
