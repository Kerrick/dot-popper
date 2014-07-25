/// <reference path="typings/pixi/pixi.d.ts" />

enum Color { White = 0xecf0f1, Black = 0x34495e, Green = 0x2ecc71, Red = 0xe74c3c }
enum Shade { White = 0xbdc3c7, Black = 0x2c3e50, Green = 0x27ae60, Red = 0xc0392b }
enum GameMode { Title, Playing, GameOver }
enum GameType { Classic, Zen }

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

class Game {
    private score: number = 0;
    private timer: number = 10 * 1000; // ms
    private loopTime: number; // ms
    private dotSize: number = 50;
    private dots: Array<Dot> = [];
    private renderer: PIXI.IPixiRenderer;
    private stage: PIXI.Stage = new PIXI.Stage(Color.White);
    private scoreLabel: PIXI.Text = new PIXI.Text('', {});
    private timerLabel: PIXI.Text = new PIXI.Text('', {});
    private scoreText: PIXI.Text = new PIXI.Text('', {});
    private timerText: PIXI.Text = new PIXI.Text('', {});

    public canvas: HTMLCanvasElement;
    public mode: GameMode = GameMode.Playing;
    public type: GameType = GameType.Classic;

    constructor(private canvasElementId: string) {
        this.canvas = <HTMLCanvasElement>document.getElementById(this.canvasElementId);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.renderer = PIXI.autoDetectRenderer(this.canvas.width, this.canvas.height, this.canvas, false, true);

        this.setupText();
        this.createDot();
        this.mainLoop();
    }

    //region Text
    private setupText(): void {
        var padding: number = 8;
        var size: number = 20;

        this.timerLabel.setText('Timer: ');
        this.timerLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(Color.Black)
        });
        this.timerLabel.position.x = padding;
        this.timerLabel.position.y = padding;
        this.stage.addChild(this.timerLabel);

        this.scoreLabel.setText('Score: ');
        this.scoreLabel.setStyle({
            font: size + 'px Helvetica',
            fill: Utils.colorToString(Color.Black)
        });
        this.scoreLabel.position.x = padding;
        this.scoreLabel.position.y = this.timerLabel.position.y + this.timerLabel.height + padding;
        this.stage.addChild(this.scoreLabel);

        this.timerText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(Shade.Black)
        });
        this.timerText.position.x = this.timerLabel.position.x + this.timerLabel.width;
        this.timerText.position.y = this.timerLabel.position.y;
        this.stage.addChild(this.timerText);

        this.scoreText.setStyle({
            font: 'bold ' + size + 'px Helvetica',
            fill: Utils.colorToString(Shade.Black)
        });
        this.scoreText.position.x = this.scoreLabel.position.x + this.scoreLabel.width;
        this.scoreText.position.y = this.scoreLabel.position.y;
        this.stage.addChild(this.scoreText);
    }
    private updateText(): void {
        this.scoreText.setText(this.score.toString());
        this.timerText.setText(Utils.timeString(this.timer));
    }
    //endregion Text

    //region Loops
    private titleLoop(): void {

    }
    private playLoop(): void {
        this.advanceTimer();
        this.updateText();
        this.dots.forEach(dot => dot.move());
    }
    private gameOverLoop(): void {
        this.updateText();
    }
    private mainLoop(): void {
        switch (this.mode) {
            case GameMode.Title:
                this.titleLoop();
                break;
            case GameMode.Playing:
                this.playLoop();
                break;
            case GameMode.GameOver:
                this.gameOverLoop();
                break;
        }
        this.renderer.render(this.stage);
        requestAnimFrame(() => this.mainLoop());
    }
    //endregion

    //region Game Logic
    private advanceTimer(): void {
        var now: number = window.performance.now();
        var passed: number = this.loopTime ? now - this.loopTime : 0;

        this.loopTime = now;
        this.timer -= passed;

        if (this.timer < 0) {
            this.timer = 0;
            this.endGame();
        }
    }
    private endGame(): void {
        alert('Game over! Your score was ' + this.score);
        this.mode = GameMode.GameOver;
    }
    private createDot(): void {
        var dot = new Dot(this, this.dotSize, this.randomDotX(), this.randomDotY());
        this.dots.unshift(dot);
        this.stage.addChildAt(dot.graphics, this.dots.indexOf(dot));
    }
    //endregion

    //region Dot-related
    private randomDotX(): number {
        return Utils.randomRange(this.dotSize, this.canvas.width - this.dotSize);
    }
    private randomDotY(): number {
        return Utils.randomRange(this.dotSize, this.canvas.height - this.dotSize);
    }
    dotPopped(dot: Dot): void {
        this.score += 1;
        this.timer += 1000;
        this.createDot();
    }
    dotPenalty(dot: Dot): void {
        this.score -= 2;
        if (this.score < 0) { this.score = 0; } // Let's not be discouraging.
        this.timer -= 2000;
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
        this.graphics.mousedown = this.graphics.touchstart = this.pop.bind(this);
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
    pop(): Dot {
        if (!this.popped) {
            this._popped = true;
            this.render();
            this.game.dotPopped(this);
        }
        else {
            this.game.dotPenalty(this);
        }
        return this;
    }
}
