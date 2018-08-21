var docReady = callback => {
    document.readyState === "interactive" || 
    document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback)
}

// set audio in global scope
var splash = new Audio()
splash.src = 'assets/splash.mp3'
splash.loop = true
splash.playbackRate = 1.25

function startGame() {
    document.getElementById('intro').style.display = "none"
    document.getElementById('game-container').style.display = "inherit"
    splash.pause()

    document.body.removeEventListener("click", startGame)

    var winMessage = document.getElementById('win')
    var loseMessage = document.getElementById('lose')

    var config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        transparent: true,
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
        },
        stage: {
            scale: { 
                pageAlignHorizontally: true,
                pageAlignVeritcally: true
            }
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
    context

    var game = new Phaser.Game(config)

    var theme = new Audio()
    theme.src = 'assets/main-theme.mp3' || 'assets/main-theme.ogg'
    theme.loop = true
    var timer = setInterval(countDown, 1000)
    var slowDown

    function preload() {
        //this.load.image('sky', 'assets/waterfall.gif')
        this.load.image('ground', 'assets/platform.png')
        this.load.image('tings', 'assets/hein.png')
        this.load.image('pill', 'assets/pill.png')
        this.load.image('spaulding', 'assets/spaulding.png')
        this.load.image('logo', 'assets/logo.png')
        this.load.audio('tingSound','assets/ting.mp3')
    }
    
    function create() {
        context = this
        //this.add.image(400, 300, 'sky')
        this.add.image(680, 50, 'logo')
        this.sound.add('tingSound')

        theme.play()

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
            fill: '#000',
            backgroundColor: 'white'
        })
        timeText = this.add.text(16, 32, ('Time: ' + time), { 
            fontSize: '16px',
            fill: '#000',
            backgroundColor: 'white'
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

            if (score >= 50)
                winGame()
            else 
                loseGame()

            gameOver = true
        }
    }

    function collectTing(player, ting) {
        ting.disableBody(true, true)

        this.sound.play('tingSound')

        score += 1
        var color = score >= 50 ? '#FFD700' : '#000'
        scoreText.style.color = color
        scoreText.setText('Tings: ' + score)

        if (tings.countActive(true) === 0) {
            runSpeed += 100
            theme.playbackRate += 0.25
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
    }

    function hitPill(player) {
        this.physics.pause()
        player.setTint(0xff0000)
        clearInterval(timer)
        //player.anims.play('turn');
        if (score >= 50)
            winGame()
        else 
            loseGame()

        gameOver = true;
    }

    function countDown() {
        time -= 1
        var color = time < 10 ? 'red' : '#000'
        timeText.style.color = color
        timeText.setText('Time: ' + time)
    }

    function winGame() {
        theme.playbackRate = 1
        winMessage.style.display = 'inherit'
    }

    function loseGame() {
        slowDown = setInterval(function() {
            if (theme.playbackRate > 0.1)
                theme.playbackRate -= 0.1
            else 
                clearInterval(slowDown)
        }, 250)
        loseMessage.style.display = 'inherit'
    }

    function playAgain() {
        clearInterval(slowDown)
        theme.pause()
        theme.currentTime = 0
        theme.playbackRate = 1
        winMessage.style.display = 'none'
        loseMessage.style.display = 'none'
        runSpeed = 200
        score = 0
        time = 61
        timer = setInterval(countDown, 1000)
        theme.play()
        countDown()
        context.scene.restart()
    }
    
    var classname = document.getElementsByClassName("play-again")

    for (var i = 0; i < classname.length; i++) {
        classname[i].addEventListener('click', playAgain, false)
    }
}

function goAway() {
    window.location.href = 'https://www.google.com/search?q=poop&oq=poop'
}

const showCard1 = () => {
    return new Promise((resolve) => {
        var div = document.createElement("div")
        var html = `<h1>COMING SEPTEMBER 8TH, 2018</h1>`
        div.innerHTML = html
        div.classList.add('card')
        document.body.appendChild(div)
        setTimeout(() => {
            div.classList.add('fadeIn')
        }, 500)
        setTimeout(() => {
            div.classList.remove('fadeIn')
        }, 2500)
        setTimeout(() => {
            resolve()
            document.body.removeChild(div)
        }, 4500)
    })
}

const showCard2 = () => {
    return new Promise((resolve) => {
        var img = document.createElement("img")
        img.src = 'assets/sr-presents.png'
        img.classList.add('card')
        document.body.appendChild(img)
        setTimeout(() => {
            img.classList.add('fadeIn')
        }, 500)
        setTimeout(() => {
            img.classList.remove('fadeIn')
        }, 2500)
        setTimeout(() => {
            resolve()
            document.body.removeChild(img)
        }, 4500)
    })
}

const flash = () => {
    return new Promise((resolve) => {
        var x = 0;
        var intervalID = setInterval(() => {
            document.body.style.background = x % 2 == 0 ? 'black' : 'white';

            if (++x === 16) {
                window.clearInterval(intervalID)
                document.body.style.backgroundImage = "url('assets/waterfall.gif')"
                document.body.style.backgroundSize = 'cover'
                resolve()
            }
        }, 100)
    })
}

function startSplashMusic() {
    splash.play()
}

function showSplash() {
    document.getElementById('intro').style.display = 'inherit'
    document.getElementById('darken').style.display = 'inherit'
    document.body.classList.add('background')
    startSplashMusic()
}

function type(input) {
    var arr = input.split('');
    var currentLetter = 0;
    var typeInterval = setInterval(function() {
        var span = document.createElement('span')
        span.innerText = arr[currentLetter]
        document.getElementById("spaulding-intro-text").appendChild(span)
        currentLetter += 1;

        // stop interval when message ends
        if (currentLetter >= arr.length) { 
            clearInterval(typeInterval)

            var options = document.createElement('div')
            options.innerHTML = `
                <button onclick="goAway()">NO</button>
                <button onclick="startGame()">YES</button>
            `
            document.getElementById("spaulding-intro-text").appendChild(options)
        }
    }, 75);
}

function spauldingIntro() {
    document.getElementById('intro').innerHTML = ''
    var html = `
        <div id="spaulding-intro">
            <img src="assets/win.png">
            <p id="spaulding-intro-text"></p>
        </div>
    `

    document.getElementById('intro').innerHTML = html

    var text =
        'Whats up world? It\'s me, world-famous DJ and international playboy, Spaulding! I\'m headed out to Spoiler Island 3 with the rest of the players, but I can\'t show up empty handed! Can you help me collect 50 tingers?'

    type(text)
}

docReady(() => {
    showCard1()
    .then(() => {
        showCard2()
        .then(() => {
            flash()
            .then(() => {
                showSplash()
            }) 
        })
    })
    //document.body.addEventListener("click", startGame)
})
