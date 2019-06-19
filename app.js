const app = new PIXI.Application({ backgroundColor: 0x1099bb });
view = document.body.appendChild(app.view);

var credit = new Audio('audio/credit.wav');
var pull = new Audio('audio/pull.flac');
var win = new Audio('audio/small-win.mp3');
var stopReel = new Audio('audio/stop.mp3');
var intro = new Audio('audio/intro.wav');

app.loader
    .add('bar', 'Reel/BAR.png')
    .add('2bar', 'Reel/2xBAR.png')
    .add('3bar', 'Reel/3xBAR.png')
    .add('seven', 'Reel/7.png')
    .add('cherry', 'Reel/Cherry.png')
    .add('pull', 'Reel/pull2.png')
    .load(onAssetsLoaded);

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;

var playerBalance = 5;
var playingCoinAudio = false;


/**
 * @function onAssetsLoaded 
 */
function onAssetsLoaded() {
    // Create different slot symbols.
    const slotTextures = [
        PIXI.Texture.from('3bar'),
        PIXI.Texture.from('bar'),
        PIXI.Texture.from('2bar'),
        PIXI.Texture.from('seven'),
        PIXI.Texture.from('cherry'),
    ];
    // Build the reels
    const reels = [];
    const reelContainer = new PIXI.Container();
    for (let i = 1; i < 4; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        const reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter(),
        };
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        // Build the symbols
        for (let j = 0; j < 5; j++) {
            const symbol = new PIXI.Sprite(slotTextures[j]);
            // Scale the symbol to fit symbol area.
            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }

    // Build top & bottom covers and position reelContainer
    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
    reelContainer.y = margin;
    reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);
    const top = new PIXI.Graphics();
    top.beginFill(0x176df4, 1);
    top.drawRect(0, 0, app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0x176df4, 1);
    bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

    // Build side covers
    const right = new PIXI.Graphics();
    right.beginFill(0x176df4, 1)
    right.drawRect(app.screen.width - margin, 0, margin, app.screen.height);
    const left = new PIXI.Graphics();
    left.beginFill(0x176df4, 1)
    left.drawRect(0, 0, margin, app.screen.height);

    // Build horizontal bars
    const htop = new PIXI.Graphics();
    htop.beginFill(0, 1);
    htop.drawRect(0, app.screen.height / 4, app.screen.width, 4)
    const hmid = new PIXI.Graphics();
    hmid.beginFill(0, 1);
    hmid.drawRect(0, app.screen.height / 2, app.screen.width, 4)
    const hbot = new PIXI.Graphics();
    hbot.beginFill(0, 1);
    hbot.drawRect(0, 3 * app.screen.height / 4, app.screen.width, 4)

    // Add play text
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const increaseButton = new PIXI.Text('Insert Coin', style);
    increaseButton.x = app.view.width - right.width - increaseButton.width;
    increaseButton.y = app.screen.height - margin + Math.round((margin - increaseButton.height) / 2);
    bottom.addChild(increaseButton)

    //Setting Balance
    function updateBalance(playerBalance) {
        if (playerBalance != this.initialBalance)
            bottom.removeChildren(0);
        const playText = new PIXI.Text('Balance: ' + playerBalance, style);
        playText.x = left.width;
        playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
        bottom.addChild(playText);
        bottom.addChild(increaseButton)
    }
    //Initial Balance
    updateBalance(this.playerBalance);

    function increaseBalance() {
        this.playerBalance += 1
        updateBalance(this.playerBalance);
    }

    // Add header text
    const headerText = new PIXI.Text('Slot Machine!', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    // Add Pull
    const pull = new PIXI.Sprite(PIXI.Texture.from('pull'));
    // Scale the symbol to fit symbol area.
    pull.y = app.screen.height / 2;
    pull.scale.x = pull.scale.y = 1.5 * Math.min(SYMBOL_SIZE / pull.width, SYMBOL_SIZE / pull.height);
    pull.x = app.screen.width - SYMBOL_SIZE / 2;
    pull.anchor.set(0, 0.95);

    app.stage.addChild(htop);
    app.stage.addChild(hmid);
    app.stage.addChild(hbot);
    app.stage.addChild(reelContainer);
    app.stage.addChild(top);
    app.stage.addChild(bottom);
    app.stage.addChild(left);
    app.stage.addChild(right);
    app.stage.addChild(pull);

    // Set Interactive.
    pull.interactive = true;
    pull.buttonMode = true;
    pull.addListener('pointerdown', () => {
        this.pull.play().then(this.pull.play());
        pull.scale.y *= -1;
        app.stage.addChild(pull);
        pull.interactive = false;

        setTimeout(function(){
            pull.scale.y *= -1;
            app.stage.addChild(pull);
            pull.interactive = true;
        }, 5000)

        if (this.playerBalance > 0) {
            startPlay();
        }
    });

    increaseButton.interactive = true;
    increaseButton.buttonMode = true;
    increaseButton.addListener('pointerdown', () => {
        if (!playingCoinAudio) {
            console.log('ARRá')
            this.playingCoinAudio = true;
            this.credit.play().then(
                increaseBalance(),
                this.playingCoinAudio = false
            )
        }
    });

    let running = false;

    // Function to start playing.
    function startPlay() {
        if (running) return;
        running = true;

        playerBalance -= 1;
        updateBalance(playerBalance);

        var firstReelMoves = 1;
        var secondReelMoves = 3; // n + firstReelMoves
        var thirdReelMoves = 1; // n times secondReelMoves
        var time = 1000 * 3;

        if (this.debugMode) {
            tweenTo(reels[0], 'position', reels[0].position + firstReelMoves, time,
                backout(0.5), null, 0 === reels.length - 1 ? reelsComplete : null);
            tweenTo(reels[1], 'position', reels[1].position + secondReelMoves, time,
                backout(0.5), null, 1 === reels.length - 1 ? reelsComplete : null);
            tweenTo(reels[2], 'position', reels[2].position + thirdReelMoves, time,
                backout(0.5), null, 2 === reels.length - 1 ? reelsComplete : null);
        } else {
            for (let i = 0; i < reels.length; i++) {
                const r = reels[i];
                const extra = Math.floor(Math.random() * 3);
                const target = r.position + (6 + extra) + i * 15;
                const time = 2500 + i * 600 + extra * 600;
                tweenTo(r, 'position', target, time, backout(0.5),
                    null, i === reels.length - 1 ? reelsComplete : null);
            }
        }

    }

    // Reels done handler.
    function reelsComplete() {
        running = false;
    }

    // Listen for animate update.
    app.ticker.add((delta) => {
        // Update the slots.
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            // Update blur filter y amount based on speed.
            // This would be better if calculated with time in mind also. Now blur depends on frame rate.
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            // Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
            }
        }
    });
}

// Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
const tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    tweening.push(tween);
    return tween;
}
// Listen for animate update.
app.ticker.add((delta) => {
    const now = Date.now();
    const remove = [];
    for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
            t.object[t.property] = t.target;
            if (t.complete) t.complete(t);
            remove.push(t);
        }
    }
    for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

// Basic lerp funtion.
function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

// Backout function from tweenjs.
// https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
function backout(amount) {
    return t => (--t * t * ((amount + 1) * t + amount) + 1);
}

var debugMode = false;

function setDebugMode() {
    this.debugMode = !this.debugMode;
    console.log(this.debugMode)

    if (this.debugMode) $("#hide").removeClass('hide-class');
    else $("#hide").addClass('hide-class');
}

function getBalance() {
    return this.playerBalance
}