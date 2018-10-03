var tetria = {
    modules: {},
    curPage: "welcome",
    debug: true,
    curscroll: 1,
    /**
     * Call on page load.
     */
    init() {
        this.components.init();
    },

    /** 
     * Change the content shown to the content specified. Affects navbar and content-area.
     */
    changeContent(newContent) {
        newContent = newContent.toLowerCase();
        var prevEle = $("#content-area #content-" + this.curPage)[0];
        var curEle = $("#content-area #content-" + newContent)[0];
        var prevNav = $("#navbar-" + this.curPage)[0];
        var curNav = $("#navbar-" + newContent)[0];
        if (prevEle == null || curEle == null) { console.log("Error trying to change content"); if (this.debug) { console.trace() } return; }
        prevEle.classList.toggle("hide");
        curEle.classList.toggle("hide");
        try {
            if (prevNav !== undefined)
                prevNav.classList.toggle("active");
            curNav.classList.toggle("active");
        } catch (e) {
            console.log(e);
        }
        this.curPage = newContent;
    },

    components: {
        init() {
            this.hamburger.init();
            this.navbar.init();
            this.url.init();
            this.profbar.init();
            this.welcome.init();
        },

        url: {
            init() {
                // TODO
            },
        },

        navbar: {
            init() {
                console.log(this.curPage);
                $(".navbar ul li").on("click", function (e) {
                    if (e.target.id == "play-tetria" || e.target.id == "navbar-Play") return;
                    var arr = e.target.id.split("-");
                    var name = arr[arr.length - 1];
                    var activeEle = $("#navbar-" + name)[0];
                    $("#navbar-title")[0].innerHTML = name.substring(0, 1).toUpperCase() + name.substring(1);
                    tetria.changeContent(name);
                })

            },


        },

        profbar: {
            init() {
                this.play();
            },
            play() {
                $("#play-tetria").on("click", function (e) {
                    window.location.href = '../game/index.html';
                });

                $("#navbar-list").on("click", function(e) {
                    $("#navbar-list")[0].classList.add("mobile-hide");
                });
            }
        },

        hamburger: {
            init() {
                // navbar hamburger show navbar
                $("#navbar-hamburger").on("click", function (e) {
                    $(".navbar ul")[0].classList.toggle("mobile-hide");
                });
            },
        },

        welcome: {
            incContent() {
                console.log("Triggered");
                $("#welcome-" + tetria.curscroll) .addClass("scroll-hide");
                if(tetria.curscroll === 4){tetria.curscroll = 1}else{tetria.curscroll++};
                $("#welcome-" + tetria.curscroll).removeClass("scroll-hide");
            },
            decContent() {
                console.log("Triggered");
                $("#welcome-" + tetria.curscroll).addClass("scroll-hide");
                if(tetria.curscroll === 1){tetria.curscroll = 4}else{tetria.curscroll--};
                $("#welcome-" + tetria.curscroll).removeClass("scroll-hide");
            },
            init() {
                $("#scroll-left").click(this.decContent);
                $("#scroll-right").click(this.incContent);
            }
        },
    },

    utils: {

    }
};

$(document).ready(function (e) {
    tetria.init();
});