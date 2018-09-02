var docReady = callback => {
    document.readyState === "interactive" || 
    document.readyState === "complete" ? callback() : document.addEventListener("DOMContentLoaded", callback)
}

// set audio in global scope
var splash = new Audio()
splash.src = 'assets/splash.mp3'
splash.loop = true
splash.playbackRate = 1.25

var sfxIntro = new Audio()
sfxIntro.src = 'assets/SFX-intro-01.mp3'
sfxIntro.loop = true

var sfxFlash = new Audio()
sfxFlash.src = 'assets/SFX-flash-in.mp3'

function startGame() {
    document.getElementById('start').style.display = "none"
    document.getElementById('intro').style.display = "none"
    document.getElementById('darken').style.display = 'inherit'
    document.getElementById('game-container').style.display = "block"
    document.body.style.backgroundImage = "url('assets/waterfall.gif')"
    document.body.style.backgroundSize = 'cover'

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
        parent: 'game-container'
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

    function moveRight() {
        cursors.right.isDown = true
    }

    function moveLeft() {
        cursors.left.isDown = true
    }

    function jump() {
        cursors.up.isDown = true
        player.body.touching.down = true
    }

    function stopMovement() {
        cursors.right.isDown = false
        cursors.left.isDown = false
        cursors.up.isDown = false
        player.body.touching.down = false
    }

    document.getElementById('move-right').addEventListener('touchstart', function() {
        moveRight()
    })

    document.getElementById('move-left').addEventListener('touchstart', function() {
        moveLeft()
    })

    document.getElementById('jump').addEventListener('touchstart', function() {
        jump()
    })

    document.getElementById('move-right').addEventListener('touchend', function() {
        stopMovement()
    })

    document.getElementById('move-left').addEventListener('touchend', function() {
        stopMovement()
    })

    document.getElementById('jump').addEventListener('touchend', function() {
        stopMovement()
    })

    function update() {
        if (!theme.paused||!theme.currentTime) {
            theme.play()
        }

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
    window.location.href = 'info.html'
}

function startIntro() {
    sfxIntro.play()
    document.getElementById('start').style.display = 'none'
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
    sfxIntro.pause()
    sfxFlash.play()
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
            options.id = 'options'
            options.innerHTML = `
                <button onclick="goAway()">NO</button>
                <button onclick="startGame()">YES</button>
            `
            document.getElementById("spaulding-intro-text").appendChild(options)
        }
    }, 60);
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

function goToInfo() {
    window.location.href="info.html"
}

docReady(() => {
    var param = window.location.search
    if (param.indexOf('intro=false') > -1) {
        startGame()
    }

    window.mobilecheck = function() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };

    var isMobile = window.mobilecheck()
    console.log(isMobile)
    if (!isMobile) {
        document.getElementById('mobile-buttons').style.display = 'none'
    }

})
