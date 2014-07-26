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

var Utils = (function () {
    function Utils() {
    }
    Utils.colorToString = function (color) {
        return '#' + ('00000' + (color | 0).toString(16)).substr(-6);
    };

    Utils.randomRange = function (max, min) {
        if (typeof min === "undefined") { min = 1; }
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    Utils.timeString = function (milliseconds) {
        return Math.floor(milliseconds / 1000).toString();
    };
    return Utils;
})();

var Game = (function () {
    function Game(canvasElementId) {
        this.canvasElementId = canvasElementId;
        this.score = 0;
        this.timer = 10 * 1000;
        this.lastUpdate = 0;
        this.dotSize = 50;
        this.dots = [];
        this.stage = new PIXI.Stage(15528177 /* White */);
        this.scoreLabel = new PIXI.Text('', {});
        this.timerLabel = new PIXI.Text('', {});
        this.scoreText = new PIXI.Text('', {});
        this.timerText = new PIXI.Text('', {});
        this.mode = 1 /* Playing */;
        this.type = 0 /* Classic */;
        this.canvas = document.getElementById(this.canvasElementId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.renderer = PIXI.autoDetectRenderer(this.canvas.width, this.canvas.height, this.canvas, false, true);

        this.setupText();
        this.createDot();
        this.mainLoop();
    }
    //region Text
    Game.prototype.setupText = function () {
        var padding = 8;
        var size = 20;

        this.timerLabel.setText('Timer: ');
        this.timerLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(3426654 /* Black */)
        });
        this.timerLabel.position.x = padding;
        this.timerLabel.position.y = padding;
        this.stage.addChild(this.timerLabel);

        this.scoreLabel.setText('Score: ');
        this.scoreLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(3426654 /* Black */)
        });
        this.scoreLabel.position.x = padding;
        this.scoreLabel.position.y = this.timerLabel.position.y + this.timerLabel.height + padding;
        this.stage.addChild(this.scoreLabel);

        this.timerText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(2899536 /* Black */)
        });
        this.timerText.position.x = this.timerLabel.position.x + this.timerLabel.width;
        this.timerText.position.y = this.timerLabel.position.y;
        this.stage.addChild(this.timerText);

        this.scoreText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(2899536 /* Black */)
        });
        this.scoreText.position.x = this.scoreLabel.position.x + this.scoreLabel.width;
        this.scoreText.position.y = this.scoreLabel.position.y;
        this.stage.addChild(this.scoreText);
    };
    Game.prototype.updateText = function () {
        this.scoreText.setText(this.score.toString());
        this.timerText.setText(Utils.timeString(this.timer));
    };

    //endregion Text
    //region Loops
    Game.prototype.titleLoop = function (deltaTime) {
    };
    Game.prototype.playLoop = function (deltaTime) {
        this.advanceTimer(deltaTime);
        this.updateText();
        this.dots.forEach(function (dot) {
            return dot.move();
        });
    };
    Game.prototype.gameOverLoop = function (deltaTime) {
        this.updateText();
    };
    Game.prototype.mainLoop = function (time) {
        var _this = this;
        if (typeof time === "undefined") { time = 0; }
        var deltaTime = time - this.lastUpdate;
        this.lastUpdate = time;
        switch (this.mode) {
            case 0 /* Title */:
                this.titleLoop(deltaTime);
                break;
            case 1 /* Playing */:
                this.playLoop(deltaTime);
                break;
            case 2 /* GameOver */:
                this.gameOverLoop(deltaTime);
                break;
        }
        this.renderer.render(this.stage);
        requestAnimationFrame(function (time) {
            return _this.mainLoop(time);
        });
    };

    //endregion
    //region Game Logic
    Game.prototype.advanceTimer = function (deltaTime) {
        this.timer -= deltaTime;
        if (this.timer < 0) {
            this.timer = 0;
            this.mode = 2 /* GameOver */;
        }
    };
    Game.prototype.createDot = function () {
        var dot = new Dot(this, this.dotSize, this.randomDotX(), this.randomDotY());
        this.dots.unshift(dot);
        this.stage.addChildAt(dot.graphics, this.dots.indexOf(dot));
    };

    //endregion
    //region Dot-related
    Game.prototype.randomDotX = function () {
        return Utils.randomRange(this.dotSize, this.canvas.width - this.dotSize);
    };
    Game.prototype.randomDotY = function () {
        return Utils.randomRange(this.dotSize, this.canvas.height - this.dotSize);
    };
    Game.prototype.dotPopped = function (dot) {
        if (this.mode === 1 /* Playing */) {
            dot.pop();
            this.score += 1;
            this.timer += 1000;
            this.createDot();
        }
    };
    Game.prototype.dotPenalty = function (dot) {
        if (this.mode === 1 /* Playing */) {
            this.score -= 2;
            if (this.score < 0) {
                this.score = 0;
            }
            this.timer -= 2000;
        }
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
            this.game.dotPopped(this);
            this.render();
        } else {
            this.game.dotPenalty(this);
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
