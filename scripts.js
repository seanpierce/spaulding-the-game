var docReady = callback => {
    document.readyState === "interactive" || 
    document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback)
}

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

var player,
tings,
time = 61,
pills,
platforms,
cursors,
score = 0,
scoreText,
timeText,
runSpeed = 200,
jumpSpeed = 450,
started = false

var game = new Phaser.Game(config)
var timer = setInterval(countDown, 1000)

function preload() {
    this.load.image('sky', 'assets/sky.png')
    this.load.image('ground', 'assets/platform.png')
    this.load.image('tings', 'assets/hein.png')
    this.load.image('pill', 'assets/pill.png')
    this.load.image('spaulding', 'assets/spaulding.png')
}

function create() {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup()
    platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    platforms.create(600, 400, 'ground')
    platforms.create(50, 250, 'ground')
    platforms.create(750, 220, 'ground')

    player = this.physics.add.sprite(100, 450, 'spaulding')

    player.setBounce(0.2)
    player.setCollideWorldBounds(true)
    player.body.setGravityY(200)

    this.anims.create({
        key: 'left',
        //frames: this.anims.generateFrameNumbers('spaulding', { tingt: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })

    this.anims.create({
        key: 'turn',
        //frames: [ { key: 'spaulding', frame: 4 } ],
        frameRate: 20
    })

    this.anims.create({
        key: 'right',
        //frames: this.anims.generateFrameNumbers('spaulding', { tingt: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    cursors = this.input.keyboard.createCursorKeys();

    tings = this.physics.add.group({
        key: 'tings',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    })

    tings.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    })

    pills = this.physics.add.group()
    scoreText = this.add.text(16, 16, 'Tings: 0', { 
        fontSize: '16px', 
        fill: '#000' 
    })
    timeText = this.add.text(16, 32, ('Time: ' + time), { 
        fontSize: '16px',
        fill: '#000'
    })

    this.physics.add.collider(player, platforms)
    this.physics.add.collider(tings, platforms)
    this.physics.add.collider(pills, platforms)

    this.physics.add.overlap(player, tings, collectTing, null, this)
    this.physics.add.collider(player, pills, hitPill, null, this)

    countDown()
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-1 * runSpeed)
        ///player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(runSpeed)
        //player.anims.play('right', true);
    } else {
        player.setVelocityX(0)
        //player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
        player.setVelocityY(-1 * jumpSpeed)


    if (time <= 0) {
        clearInterval(timer)
        this.physics.pause();
        player.setTint(0xff0000)
        gameOver = true
    }
}

function collectTing(player, ting) {
    ting.disableBody(true, true);

    score += 1;
    scoreText.setText('Tings: ' + score);

    if (tings.countActive(true) === 0) {
        //  A new batch of tings to collect
        tings.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        })
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var pill = pills.create(x, 16, 'pill');
        pill.setBounce(1);
        pill.setCollideWorldBounds(true);
        pill.setVelocity(Phaser.Math.Between(-200, 200), 20);
        pill.allowGravity = false;
    }


    if (tings.countActive(true) > 11) {
        runSpeed = runSpeed + 50
        //jumpSpeed = jumpSpeed + 50
    }

    if (tings.countActive(true) > 23) {
        runSpeed = runSpeed + 50
        //jumpSpeed = jumpSpeed + 50
    }

}

function hitPill(player) {
    this.physics.pause()
    player.setTint(0xff0000)
    clearInterval(timer)
    //player.anims.play('turn');
    gameOver = true;
}

function countDown() {
    time -= 1
    var color = time < 10 ? 'red' : '#000'
    timeText.style.color = color
    timeText.setText('Time: ' + time)
}

docReady(() => {
    console.log('Page loaded')
})