/// <reference path="typings/pixi/pixi.d.ts" />
var Color;
(function (Color) {
    Color[Color["White"] = 0xecf0f1] = "White";
    Color[Color["Black"] = 0x34495e] = "Black";
    Color[Color["Green"] = 0x2ecc71] = "Green";
    Color[Color["Red"] = 0xe74c3c] = "Red";
})(Color || (Color = {}));
var Shade;
(function (Shade) {
    Shade[Shade["White"] = 0xbdc3c7] = "White";
    Shade[Shade["Black"] = 0x2c3e50] = "Black";
    Shade[Shade["Green"] = 0x27ae60] = "Green";
    Shade[Shade["Red"] = 0xc0392b] = "Red";
})(Shade || (Shade = {}));
var GameMode;
(function (GameMode) {
    GameMode[GameMode["Title"] = 0] = "Title";
    GameMode[GameMode["Playing"] = 1] = "Playing";
    GameMode[GameMode["GameOver"] = 2] = "GameOver";
})(GameMode || (GameMode = {}));
var GameType;
(function (GameType) {
    GameType[GameType["Classic"] = 0] = "Classic";
    GameType[GameType["Zen"] = 1] = "Zen";
})(GameType || (GameType = {}));
var Defaults;
(function (Defaults) {
    Defaults[Defaults["Timer"] = 10 * 1000] = "Timer";
    Defaults[Defaults["Score"] = 0] = "Score";
    Defaults[Defaults["LastUpdate"] = 0] = "LastUpdate";
    Defaults[Defaults["DotSize"] = 50] = "DotSize"; // px
})(Defaults || (Defaults = {}));
var Utils = (function () {
    function Utils() {
    }
    Utils.colorToString = function (color) {
        return '#' + ('00000' + (color | 0).toString(16)).substr(-6);
    };
    Utils.randomRange = function (max, min) {
        if (min === void 0) { min = 1; }
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    Utils.timeString = function (milliseconds) {
        return Math.floor(milliseconds / 1000).toString();
    };
    return Utils;
})();
var TitleScreen = (function () {
    function TitleScreen(game) {
        this.game = game;
        game.clearStage();
    }
    TitleScreen.prototype.loop = function (time) {
        return this;
    };
    TitleScreen.prototype.popped = function (dot) {
        return dot;
    };
    TitleScreen.prototype.penalty = function (dot) {
        return dot;
    };
    return TitleScreen;
})();
var InGame = (function () {
    function InGame(game) {
        this.game = game;
        this.score = 0 /* Score */;
        this.timer = Defaults.Timer;
        this.lastUpdate = 0 /* LastUpdate */;
        this.dotSize = 50 /* DotSize */;
        this.dots = [];
        this.scoreLabel = new PIXI.Text('', {});
        this.timerLabel = new PIXI.Text('', {});
        this.scoreText = new PIXI.Text('', {});
        this.timerText = new PIXI.Text('', {});
        this.type = 0 /* Classic */;
        game.clearStage();
        this.dots = [];
        this.score = 0 /* Score */;
        this.timer = Defaults.Timer;
        this.lastUpdate = 0 /* LastUpdate */;
        this.setupGameText();
        this.createDot();
    }
    InGame.prototype.loop = function (time) {
        if (this.lastUpdate === 0 /* LastUpdate */) {
            this.lastUpdate = time;
        }
        var deltaTime = time - this.lastUpdate;
        this.lastUpdate = time;
        this.advanceTimer(deltaTime);
        this.updateGameText();
        this.dots.forEach(function (dot) { return dot.move(); });
        return this;
    };
    //region Game Logic
    InGame.prototype.advanceTimer = function (deltaTime) {
        this.timer -= deltaTime;
        if (this.timer < 0) {
            this.timer = 0;
            this.game.gameOver();
        }
    };
    InGame.prototype.createDot = function () {
        var dot = new Dot(this.game, this.dotSize, this.randomDotX(), this.randomDotY());
        this.dots.unshift(dot);
        this.game.stage.addChildAt(dot.graphics, this.dots.indexOf(dot));
    };
    //endregion
    //region UI Logic
    InGame.prototype.setupGameText = function () {
        var padding = 8;
        var size = 20;
        this.timerLabel.setText('Timer: ');
        this.timerLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(3426654 /* Black */)
        });
        this.timerLabel.position.x = padding;
        this.timerLabel.position.y = padding;
        this.game.stage.addChild(this.timerLabel);
        this.scoreLabel.setText('Score: ');
        this.scoreLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(3426654 /* Black */)
        });
        this.scoreLabel.position.x = padding;
        this.scoreLabel.position.y = this.timerLabel.position.y + this.timerLabel.height + padding;
        this.game.stage.addChild(this.scoreLabel);
        this.timerText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(2899536 /* Black */)
        });
        this.timerText.position.x = this.timerLabel.position.x + this.timerLabel.width;
        this.timerText.position.y = this.timerLabel.position.y;
        this.game.stage.addChild(this.timerText);
        this.scoreText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(2899536 /* Black */)
        });
        this.scoreText.position.x = this.scoreLabel.position.x + this.scoreLabel.width;
        this.scoreText.position.y = this.scoreLabel.position.y;
        this.game.stage.addChild(this.scoreText);
    };
    InGame.prototype.updateGameText = function () {
        this.scoreText.setText(this.score.toString());
        this.timerText.setText(Utils.timeString(this.timer));
    };
    //endregion
    //region Dot-related
    InGame.prototype.randomDotX = function () {
        return Utils.randomRange(this.dotSize, this.game.canvas.width - this.dotSize);
    };
    InGame.prototype.randomDotY = function () {
        return Utils.randomRange(this.dotSize, this.game.canvas.height - this.dotSize);
    };
    InGame.prototype.popped = function (dot) {
        dot.pop();
        this.score += 1;
        this.timer += 1000;
        this.createDot();
        return dot;
    };
    InGame.prototype.penalty = function (dot) {
        this.score -= 2;
        if (this.score < 0) {
            this.score = 0;
        }
        this.timer -= 2000;
        return dot;
    };
    return InGame;
})();
var GameOver = (function () {
    function GameOver(game) {
        this.game = game;
    }
    GameOver.prototype.loop = function (time) {
        return this;
    };
    GameOver.prototype.popped = function (dot) {
        return dot;
    };
    GameOver.prototype.penalty = function (dot) {
        return dot;
    };
    return GameOver;
})();
var Game = (function () {
    function Game(canvasElementId) {
        this.canvasElementId = canvasElementId;
        this.stage = new PIXI.Stage(15528177 /* White */);
        this.canvas = document.getElementById(this.canvasElementId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.renderer = PIXI.autoDetectRenderer(this.canvas.width, this.canvas.height, this.canvas, false, true);
        this.titleScreen();
        this.loop();
    }
    //region PIXI Management
    Game.prototype.clearStage = function () {
        if (this.stage.children.length > 0) {
            this.stage.removeChildren();
        }
        this.renderer.render(this.stage);
        return this.stage;
    };
    //endregion
    //region Game Mode Methods
    Game.prototype.titleScreen = function () {
        this.mode = new TitleScreen(this);
        // TODO: Make a real title screen
        window.setTimeout(function () {
            this.play();
        }.bind(this), 1000);
        return this.mode;
    };
    Game.prototype.play = function () {
        this.mode = new InGame(this);
        return this.mode;
    };
    Game.prototype.gameOver = function () {
        this.mode = new GameOver(this);
        // TODO: Make a real game over screen
        window.setTimeout(function () {
            this.titleScreen();
        }.bind(this), 3000);
        return this.mode;
    };
    //endregion
    //region Loops
    Game.prototype.loop = function (time) {
        var _this = this;
        if (time === void 0) { time = 0; }
        this.mode.loop(time);
        this.renderer.render(this.stage);
        requestAnimationFrame(function (time) { return _this.loop(time); });
        return this;
    };
    return Game;
})();
var Dot = (function () {
    function Dot(game, size, x, y) {
        this.game = game;
        this.size = size;
        this._popped = false;
        this.horizontalVelocity = Dot.randomVelocity();
        this.verticalVelocity = Dot.randomVelocity();
        this.borderSize = 3;
        this._graphics = new PIXI.Graphics();
        this.graphics.hitArea = new PIXI.Circle(0, 0, this.size);
        this.graphics.interactive = true;
        this.graphics.mousedown = this.graphics.touchstart = this.click.bind(this);
        this.graphics.position.x = x;
        this.graphics.position.y = y;
        this.render();
    }
    Dot.randomVelocity = function () {
        var sign = Math.random() < 0.5 ? 1 : -1;
        return sign * Utils.randomRange(0, 5);
    };
    Object.defineProperty(Dot.prototype, "popped", {
        get: function () {
            return this._popped;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dot.prototype, "graphics", {
        get: function () {
            return this._graphics;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dot.prototype, "color", {
        get: function () {
            return this.popped ? 15158332 /* Red */ : 3066993 /* Green */;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dot.prototype, "shade", {
        get: function () {
            return Shade[Color[this.color]];
        },
        enumerable: true,
        configurable: true
    });
    Dot.prototype.move = function () {
        var newX = this.graphics.position.x + this.horizontalVelocity;
        var newY = this.graphics.position.y + this.verticalVelocity;
        if (this.size > newX || newX > this.game.canvas.width - this.size) {
            this.horizontalVelocity *= -1;
        }
        if (this.size > newY || newY > this.game.canvas.height - this.size) {
            this.verticalVelocity *= -1;
        }
        this.graphics.position.y = newY;
        this.graphics.position.x = newX;
        return this;
    };
    Dot.prototype.render = function () {
        this.graphics.clear();
        // 'border' of the circle
        this.graphics.beginFill(this.shade);
        this.graphics.drawCircle(0, 0, this.size);
        // main circle
        this.graphics.beginFill(this.color);
        this.graphics.drawCircle(0, 0, this.size - this.borderSize);
        return this;
    };
    Dot.prototype.click = function () {
        if (!this.popped) {
            this.game.mode.popped(this);
            this.render();
        }
        else {
            this.game.mode.penalty(this);
        }
        return this;
    };
    Dot.prototype.pop = function () {
        this._popped = true;
        return this;
    };
    return Dot;
})();
//# sourceMappingURL=game.js.map