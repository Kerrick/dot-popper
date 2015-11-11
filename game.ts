/// <reference path="typings/pixi/pixi.d.ts" />

enum Color { White = 0xecf0f1, Black = 0x34495e, Green = 0x2ecc71, Red = 0xe74c3c }
enum Shade { White = 0xbdc3c7, Black = 0x2c3e50, Green = 0x27ae60, Red = 0xc0392b }
enum GameMode { Title, Playing, GameOver }
enum GameType { Classic, Zen }
enum Defaults {
    Timer = 10 * 1000, // ms
    Score = 0,
    LastUpdate = 0, // ms
    DotSize = 50 // px
}

class Utils {
    public static colorToString(color:Color): string;
    public static colorToString(color:Shade): string;
    public static colorToString(color): string {
        return '#' + ('00000' + (color | 0).toString(16)).substr(-6);
    }

    public static randomRange(max: number, min: number = 1): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public static timeString(milliseconds: number): string {
        return Math.floor(milliseconds / 1000).toString();
    }
}

interface GameState {
    game: Game;

    loop(time: number): GameState;
    popped(dot: Dot): Dot;
    penalty(dot: Dot): Dot;
}

class TitleScreen implements GameState {
    constructor(public game: Game) {
        game.clearStage();
    }
    public loop(time: number): TitleScreen {
        return this;
    }
    public popped(dot: Dot): Dot { return dot }
    public penalty(dot: Dot): Dot { return dot }
}

class InGame implements GameState {
    private score: number = Defaults.Score;
    private timer: number = Defaults.Timer;
    private lastUpdate: number = Defaults.LastUpdate;
    private dotSize: number = Defaults.DotSize;
    private dots: Array<Dot> = [];
    private scoreLabel: PIXI.Text = new PIXI.Text('', {});
    private timerLabel: PIXI.Text = new PIXI.Text('', {});
    private scoreText: PIXI.Text = new PIXI.Text('', {});
    private timerText: PIXI.Text = new PIXI.Text('', {});

    type: GameType = GameType.Classic;

    constructor(public game: Game) {
        game.clearStage();

        this.dots = [];
        this.score = Defaults.Score;
        this.timer = Defaults.Timer;
        this.lastUpdate = Defaults.LastUpdate;

        this.setupGameText();
        this.createDot();
    }

    public loop(time: number): InGame {
        if (this.lastUpdate === Defaults.LastUpdate) {
            this.lastUpdate = time;
        }
        var deltaTime: number = time - this.lastUpdate;
        this.lastUpdate = time;

        this.advanceTimer(deltaTime);
        this.updateGameText();
        this.dots.forEach(dot => dot.move());
        return this;
    }

    //region Game Logic
    private advanceTimer(deltaTime: number): void {
        this.timer -= deltaTime;
        if (this.timer < 0) {
            this.timer = 0;
            this.game.gameOver();
        }
    }

    private createDot(): void {
        var dot = new Dot(this.game, this.dotSize, this.randomDotX(), this.randomDotY());
        this.dots.unshift(dot);
        this.game.stage.addChildAt(dot.graphics, this.dots.indexOf(dot));
    }
    //endregion

    //region UI Logic
    private setupGameText(): void {
        var padding: number = 8;
        var size: number = 20;

        this.timerLabel.setText('Timer: ');
        this.timerLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(Color.Black)
        });
        this.timerLabel.position.x = padding;
        this.timerLabel.position.y = padding;
        this.game.stage.addChild(this.timerLabel);

        this.scoreLabel.setText('Score: ');
        this.scoreLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(Color.Black)
        });
        this.scoreLabel.position.x = padding;
        this.scoreLabel.position.y = this.timerLabel.position.y + this.timerLabel.height + padding;
        this.game.stage.addChild(this.scoreLabel);

        this.timerText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(Shade.Black)
        });
        this.timerText.position.x = this.timerLabel.position.x + this.timerLabel.width;
        this.timerText.position.y = this.timerLabel.position.y;
        this.game.stage.addChild(this.timerText);

        this.scoreText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(Shade.Black)
        });
        this.scoreText.position.x = this.scoreLabel.position.x + this.scoreLabel.width;
        this.scoreText.position.y = this.scoreLabel.position.y;
        this.game.stage.addChild(this.scoreText);
    }

    private updateGameText(): void {
        this.scoreText.setText(this.score.toString());
        this.timerText.setText(Utils.timeString(this.timer));
    }
    //endregion

    //region Dot-related
    private randomDotX(): number {
        return Utils.randomRange(this.dotSize, this.game.canvas.width - this.dotSize);
    }
    private randomDotY(): number {
        return Utils.randomRange(this.dotSize, this.game.canvas.height - this.dotSize);
    }
    public popped(dot: Dot): Dot {
        dot.pop();
        this.score += 1;
        this.timer += 1000;
        this.createDot();

        return dot;
    }
    public penalty(dot: Dot): Dot {
        this.score -= 2;
        if (this.score < 0) { this.score = 0; }
        this.timer -= 2000;

        return dot;
    }
    //endregion
}

class GameOver implements GameState {
    constructor(public game: Game) { }

    public loop(time: number): GameOver {
        return this;
    }
    public popped(dot: Dot): Dot { return dot }
    public penalty(dot: Dot): Dot { return dot }
}

class Game {
    private renderer: PIXI.IPixiRenderer;
    public stage: PIXI.Stage = new PIXI.Stage(Color.White);
    public canvas: HTMLCanvasElement;
    public mode:StatmeMode;

    constructor(private canvasElementId: string) {
        this.canvas = <HTMLCanvasElement>document.getElementById(this.canvasElementId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.renderer = PIXI.autoDetectRenderer(this.canvas.width, this.canvas.height, this.canvas, false, true);

        this.titleScreen();
        this.loop();
    }

    //region PIXI Management
    clearStage(): PIXI.Stage {
        if (this.stage.children.length > 0) {
            this.stage.removeChildren();
        }
        this.renderer.render(this.stage);
        return this.stage;
    }
    //endregion

    //region Game Mode Methods
    public titleScreen(): TitleScreen {
        this.mode = new TitleScreen(this);

        // TODO: Make a real title screen
        window.setTimeout(function() { this.play(); }.bind(this), 1000);

        return this.mode;
    }
    public play(): InGame {
        this.mode = new InGame(this);
        return this.mode;
    }
    public gameOver(): GameOver {
        this.mode = new GameOver(this);

        // TODO: Make a real game over screen
        window.setTimeout(function() { this.titleScreen(); }.bind(this), 3000);

        return this.mode;
    }
    //endregion

    //region Loops
    private loop(time = 0): Game {
        this.mode.loop(time);
        this.renderer.render(this.stage);
        requestAnimationFrame((time) => this.loop(time));
        return this;
    }
    //endregion
}

class Dot {
    private _popped: boolean = false;
    private horizontalVelocity: number = Dot.randomVelocity();
    private verticalVelocity: number = Dot.randomVelocity();
    private borderSize: number = 3;
    private _graphics: PIXI.Graphics = new PIXI.Graphics();

    constructor(private game: Game, private size: number, x: number, y: number) {
        this.graphics.hitArea = new PIXI.Circle(0, 0, this.size);
        this.graphics.interactive = true;
        this.graphics.mousedown = this.graphics.touchstart = this.click.bind(this);
        this.graphics.position.x = x;
        this.graphics.position.y = y;
        this.render();
    }

    private static randomVelocity(): number {
        var sign = Math.random() < 0.5 ? 1 : -1;
        return sign * Utils.randomRange(0, 5);
    }

    get popped(): boolean {
        return this._popped;
    }
    get graphics(): PIXI.Graphics {
        return this._graphics;
    }
    get color(): Color {
        return this.popped ? Color.Red : Color.Green;
    }
    get shade(): Shade {
        return Shade[Color[this.color]];
    }

    move(): Dot {
        var newX: number = this.graphics.position.x + this.horizontalVelocity;
        var newY: number = this.graphics.position.y + this.verticalVelocity;
        if (this.size > newX || newX > this.game.canvas.width - this.size) {
            this.horizontalVelocity *= -1;
        }
        if (this.size > newY || newY > this.game.canvas.height - this.size) {
            this.verticalVelocity *= -1;
        }

        this.graphics.position.y = newY;
        this.graphics.position.x = newX;
        return this;
    }
    render(): Dot {
        this.graphics.clear();

        // 'border' of the circle
        this.graphics.beginFill(this.shade);
        this.graphics.drawCircle(0, 0, this.size);
        // main circle
        this.graphics.beginFill(this.color);
        this.graphics.drawCircle(0, 0, this.size - this.borderSize);

        return this;
    }
    click(): Dot {
        if (!this.popped) {
            this.game.mode.popped(this);
            this.render();
        }
        else {
            this.game.mode.penalty(this);
        }
        return this;
    }
    pop(): Dot {
        this._popped = true;
        return this;
    }
}
