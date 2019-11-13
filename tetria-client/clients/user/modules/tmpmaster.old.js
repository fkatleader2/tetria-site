/**
 * todo-extra: keep track of event listeners for this module
 * 
 * up next:
 *      HTML / CSS
 *          - create room menu
 *          - multiplayer view
 *          - spectator view
 *          - game chat
 *          - settings menu
 *          - login menu
 *      JS - object
 *          - game
 *          - room
 *      JS - linking
 */
tet.modules.master = {
    backupState: {
        listener: null,
        header: {selected: null},
        profile: {username: "username1"},
        views: {
            rooms: {
                eleId: "rooms"
            },
            singleplayerGame: {
                eleId: "game-singleplayer",
                game: null
            },
            multiplayerGame: {
                inRoom: false,
                eleId: "game-multiplayer"
            },
            help: {
                eleId: "help"
            }
        },
    },
    setup() {
        // reset state
        this.state = this.tet.f.copy(this.backupState);
    },
    postSetup() {
        // setup listener
        this.state.listener = this.tet.listener.newChild();

        // hide all views
        for (var viewId in this.state.views) {
            this.f.hideView(viewId);
        }

        // setup header
        var headerEles = $("#header .center .option");
        for (var headerEle of headerEles) {
            headerEle.onclick = this.api.selectHeader.bind(this.api);
            if (headerEle.classList.contains("selected")) {
                this.api.selectHeader({target: headerEle});
            }
        }

        // setup rooms
        var createPlayButtons = $("#rooms>div>div.button div");
        for (var createPlayButton of createPlayButtons) {
            createPlayButton.onclick = this.api.selectCreatePlayButton.bind(this.api);
            if (createPlayButton.classList.contains("selected")) {
                createPlayButton.classList.remove("selected");
                this.api.selectCreatePlayButton({target: createPlayButton});
            }
        }

        // setup singleplayer games
        var game = this.state.views.singleplayerGame.game = new this.tet.m.Tetresse(this.tet.listener);
        var graphics = new this.tet.m.SVGGraphics($("#game-singleplayer .tetresse")[0]);
        graphics.linkTetresse(game);
        graphics.setParts(["board", "next", "moreNext", "hold"]);
        var controls = new this.tet.m.Controls();
        controls.linkTetresse(game);
        // graphics.setParts(["board", "incoming", "next", "moreNext", "hold"]);
        game.listener.execute("start");

        var games = [];
        var boards = $("#game-multiplayer .boards .tetresse");
        for (var i = 0; i < 6; i++) {
            var g = new this.tet.m.Tetresse(this.tet.listener);
            var gr = new this.tet.m.SVGGraphics(boards[i]);
            gr.linkTetresse(g);
            gr.setParts(i == 0 ? ["board", "incoming", "next", "moreNext", "hold"] : ["board", "incoming"]);
            if (i == 0) {
                var c = new this.tet.m.Controls();
                controls.linkTetresse(g);
                g.listener.execute("start");
            }
            games.push(g);
        }
        this.state.views.multiplayerGame.games = games;


        /**
         * TODO:
         * tetresse:
         *      stall breaker
         *      gravity
         *      spin events?
         *      line clear delay
         *      (settings)
         */

        // show everything
        this.reloadState(this.state);

        var headerElement = document.getElementById("header");
        headerElement.classList.remove("hidden");
        var contentElement = document.getElementById("content");
        contentElement.classList.remove("hidden");
    },
    reloadState(state) {
        this.state = state;
        this.api.setUsername(state.profile.username);
    },
    f: {
        getHeaderId(element) {
            return element.innerHTML.toLowerCase();
        },
        getHeaderViewId(headerName) {
            var viewId = headerName;
            if (viewId === "game") {
                // viewId = this.m.state.views.multiplayerGame.inRoom ? "multiplayerGame" : "singleplayerGame";
                viewId = "multiplayerGame";
            }
            return viewId;
        },
        setHeaderUsername(username) {
            var ele = document.getElementById("header-username");
            ele.innerHTML = username;
        },
        showView(viewId) {
            return this.changeView(viewId, true);
        },
        hideView(viewId) {
            return this.changeView(viewId, false);
        },
        changeView(viewId, show) {
            var view = this.m.state.views[viewId];
            if (view === undefined) return {return: false, msg: "no state present for viewId=" + viewId};

            var ele = view.ele != undefined ? view.ele : document.getElementById(view.eleId);
            if (ele == undefined) {
                return {return: false, msg: "unable to change viewId=" + viewId + " to show=" + show + " due to undefined element"};
            }

            if (show) {
                ele.classList.remove("hidden");
            } else {
                ele.classList.add("hidden");
            }

            var event = (show ? "show" : "hide") + "-view-" + viewId;
            this.m.state.listener.execute(event);
            
            return {return: true};
        }
    },
    api: {
        setUsername(username) {
            this.m.state.profile.username = username;
            this.m.f.setHeaderUsername(username);
        },
        selectHeader(e) {
            var target = e.target;
            if (e.target.classList.contains("option")) {
                target = target.children[1];
            } else if (e.target.classList.contains("highlight")) {
                target = target.parentNode.children[1];
            }
            var headerName = this.m.f.getHeaderId(target);

            var ret;

            var selectedHeader = this.m.state.header.selected;
            if (selectedHeader !== null) {
                var selectedHeaderViewId = this.m.f.getHeaderViewId(this.m.f.getHeaderId(selectedHeader));
                if (!(ret = this.m.f.hideView(selectedHeaderViewId)).return) {
                    console.warn(ret.msg); 
                }
                selectedHeader.parentNode.classList.remove("selected");
            }

            target.parentNode.classList.add("selected");
            this.m.state.header.selected = target;
            var viewId = this.m.f.getHeaderViewId(headerName);

            if (!(ret = this.m.f.showView(viewId)).return) { 
                console.warn(ret.msg); 
                return; 
            }
        },
        selectCreatePlayButton(e) {
            if (e.target.innerHTML.toLowerCase() == "play now") {
                if (e.target.parentNode.children[0].classList.contains("selected")) {
                    this.selectCreatePlayButton({target: e.target.parentNode.children[0]});
                }
                this.selectHeader({target: $("#header>.center>div")[3]});
                return;
            }
            var createGameEle = $("#rooms .create-game")[0];
            if (e.target.classList.contains("selected")) {
                e.target.classList.remove("selected");
                createGameEle.classList.add("hidden");
            } else {
                e.target.classList.add("selected");
                createGameEle.classList.remove("hidden");


            }
            console.log("create!");
        }
    }
}

console.warn("make a different master!");