//This class is the main player logic for how a player is defined in game
class Player{
    constructor(game){
        this.game = game;
        this.width = 60;
        this.height = 60;
        this.x = game.width / 2 - this.width / 2;
        this.y = game.height - this.height - 10;
        this.speed = 5;
        this.maxHealth = 100;
        this.currentHealth = this.maxHealth;
        this.maxHitsBeforeGameOver = 5;
        this.hitsTaken = 0;
        this.bullets = [];
        this.weapon = 'primary';
        this.rotation = 0;
        this.sprite = new Image();
        this.sprite.src = 'assets/images/player.png';
    }
    update(deltaTime){
        this.movePlayer();
        this.updateLasers();
    }
    render(ctx){
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.sprite, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
        this.bullets.forEach(bullet => bullet.render(ctx));
    }
//    This function moves the player
    movePlayer(){
        if(this.game.keys['ArrowLeft']){
            this.x -= this.speed;
            if(this.x < 0) this.x = 0;
            this.rotation -= 0.1;
        }
        if(this.game.keys['ArrowRight']){
            this.x += this.speed;
            if (this.x + this.width > this.game.width) this.x = this.game.width - this.width;
            this.rotation += 0.1;
        }
        if(this.game.keys['ArrowUp']){
            this.fireLaser();
            delete this.game.keys['ArrowUp'];
        }
    }
//   this function does the logic for firing the laser from the player
    fireLaser(){
        const bullet = new Bullet(this.x + this.width / 2 - 2.5, this.y, this.game);
        this.bullets.push(bullet);
        this.game.audioManager.playSound('bullet');
    }
//    This function updates the laser in the game
    updateLasers(){
        this.bullets.forEach((bullet, index) => {
            bullet.update();
            if(bullet.markedForDeletion){
                this.bullets.splice(index, 1);
            }
        });
    }
//    This function applies damage to the player
    playerDamage(){
        this.hitsTaken++;
        this.currentHealth = Math.max(this.currentHealth - Math.max(this.maxHealth / this.maxHitsBeforeGameOver, 10), 0);
        this.updateHealthHUD();
        this.game.audioManager.playSound('hit');
        if(this.currentHealth <= 0){
            this.death();
        }
    }
//    This function updates the health bar for the player
    updateHealthHUD(){
        this.game.hud.setHealth(this.currentHealth);
    }
// This function deals with the death of the player
    death(){
        console.log('Player has died!');
        this.game.gameOver = true;
        this.game.audioManager.playSound('explosion');
    }
}
//This class is the logic for the laser/bullet in game
class Bullet{
    constructor(x, y, game){
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
        this.speed = 7;
        this.markedForDeletion = false;
        this.game = game;
    }
    update(){
        this.y -= this.speed;
        if(this.y < 0){
            this.markedForDeletion = true;
        }
    }
//    This function changes the color of the laser at each level
    render(ctx) {
        if(this.game.hud.score >= 600){
            ctx.fillStyle = 'yellow';
        }else if(this.game.hud.score >= 300){
            ctx.fillStyle = 'limegreen';
        }else{
            ctx.fillStyle = 'red';
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
//This class defines the Enemy in game for the player to play against
class Enemy {
    constructor(game){
        this.game = game;
        this.width = 60;
        this.height = 50;
        this.x = Math.random() * (game.width - this.width);
        this.y = -this.height;
        this.baseSpeed = 3;
        this.speed = this.baseSpeed;
        this.markedForDeletion = false;
        this.sprite = new Image();
        this.sprite.src = 'assets/images/enemy.png';
    }
    update(deltaTime){
        this.y += this.speed;
        if (this.y > this.game.height) {
            this.markedForDeletion = true;
        }
    }
    render(ctx){
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
    speedRate(speed){
        this.speed = speed;
    }
}
//This class is outlined for a new update where power ups may be enabled in game (user feedback needed*)
class PowerUp{
    constructor(game){
        this.game = game;
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * (game.width - this.width);
        this.y = -this.height;
        this.speed = 3;
        this.markedForDeletion = false;
        this.sprite = new Image();
        this.sprite.src = `assets/images/${this.type}.png`;
    }
    update(deltaTime){
        this.y += this.speed;
        if(this.y > this.game.height){
            this.markedForDeletion = true;
        }
    }
    render(ctx){
        ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    }
}
class HUD{
    constructor(game){
        this.game = game;
        this.font = '16px Ubuntu';
        this.color = 'lime';
        this.score = 0;
        this.health = game.player.currentHealth;
    }
    render(ctx){
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(`: ${this.score}`, 10, 20);
        this.createHealthBar(ctx);
        if(this.game.gameOver){
            ctx.font = '48px Ubuntu';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', this.game.width / 2, this.game.height / 2);
        }
    }
//    This function does the logic for displaying the health bar on the screen in game
    createHealthBar(ctx){
        const barWidth = 200;
        const barHeight = 20;
        const x = 10;
        const y = 30;
        const radius = 5;
        ctx.fillStyle = 'black';
        this.roundHealthBar(ctx, x, y, barWidth, barHeight, radius);
        ctx.fill();
        const healthWidth = (this.health / this.game.player.maxHealth) * barWidth;
        ctx.fillStyle = 'red';
        this.roundHealthBar(ctx, x, y, healthWidth, barHeight, radius);
        ctx.fill();
    }
//    This function does the logic for rounding the health bar for a better look in game
    roundHealthBar(ctx, x, y, width, height, radius){
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
    increaseScore(amount){
        this.score += amount;
    }
    setHealth(health){
        this.health = health;
    }
}
//This class is used to setup the game audio
class AudioManager{
    constructor(){
        this.sounds = {};
        this.backgroundMusic = new Audio('assets/audio/background.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.35;
        this.backgroundMusicLoaded = false;
        this.backgroundMusic.addEventListener('canplaythrough', () => {
            this.backgroundMusicLoaded = true;
        });
    }
    loadSound(name, src){
        const soundPool = [];
        for(let i = 0; i < 5; i++){
            const sound = new Audio(src);
            sound.volume = 0.5;
            soundPool.push(sound);
        }
        this.sounds[name] = soundPool;
        console.log(`Sound '${name}' loaded from '${src}'`);
    }
    playSound(name){
        const soundPool = this.sounds[name];
        if(soundPool){
            const sound = soundPool.find(s => s.paused || s.ended);
            if(sound){
                sound.currentTime = 0;
                sound.play().catch(error => console.warn(`Sound '${name}' error: ${error}`));
            }else{
                console.warn(`All inst of sound '${name}' are busy.`);
            }
        }else{
            console.warn(`Sound '${name}' not found.`);
        }
    }
    playBackgroundMusic(){
        if(this.backgroundMusicLoaded){
            this.backgroundMusic.play().catch(error => console.warn(`Background music error: ${error}`));
        }
    }
    stopBackgroundMusic(){
        this.backgroundMusic.pause();
        this.backgroundMusic.currentTime = 0;
    }
}
//This class sets up the logic for the smoke in game when a explosion occurs
class Smoke{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 20;
        this.alpha = 1.0;
        this.fadeRate = Math.random() * 0.02 + 0.03;
        this.life = Math.random() * 50 + 50;
        this.markedForDeletion = false;
        this.vx = Math.random() * 2 - 1;
        this.vy = Math.random() * 2 - 1;
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.fadeRate;
        if(this.alpha <= 0){
            this.markedForDeletion = true;
        }
    }
    render(ctx){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = 'grey';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.size, this.size * 0.6, Math.random() * Math.PI * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
//This class sets up the in game explosion logic for whenever a enemy is hit or also when the player is attacked
class Explosion{
    constructor(x, y, game){
        this.x = x;
        this.y = y;
        this.sprite = new Image();
        this.sprite.src = 'assets/images/effects/explosion.png';
        this.width = 65;
        this.height = 65;
        this.frames = 6;
        this.currentFrame = 0;
        this.frameDuration = 25;
        this.lastFrameChange = Date.now();
        this.markedForDeletion = false;
        this.smokes = [];
        this.synthSmoke();
        console.log(`Explosion created at (${x}, ${y})`);
        this.sprite.onload = () => console.log('Explosion image loaded');
    }
//    This function creates the smoke
    synthSmoke(){
        for(let i = 0; i < 15; i++){
            let angle = Math.random() * Math.PI * 2;
            let distance = Math.random() * this.width;
            let offsetX = Math.cos(angle) * distance;
            let offsetY = Math.sin(angle) * distance;
            this.smokes.push(new Smoke(this.x + offsetX, this.y + offsetY));
        }
    }
    update(){
        if(Date.now() - this.lastFrameChange > this.frameDuration){
            this.currentFrame++;
            this.lastFrameChange = Date.now();
            if(this.currentFrame >= this.frames){
                this.markedForDeletion = true;
            }
        }
        this.smokes.forEach((smoke, index) => {
            smoke.update();
            if(smoke.markedForDeletion){
                this.smokes.splice(index, 1);
            }
        });
    }
//    This function increases the effect/visual look of the smoke
    render(ctx){
        const frameWidth = this.sprite.width / this.frames;
        const radius = 30;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2 + radius, this.y - this.height / 2);
        ctx.lineTo(this.x + this.width / 2 - radius, this.y - this.height / 2);
        ctx.arc(this.x + this.width / 2 - radius, this.y - this.height / 2 + radius, radius, -Math.PI / 2, 0);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2 - radius);
        ctx.arc(this.x + this.width / 2 - radius, this.y + this.height / 2 - radius, radius, 0, Math.PI / 2);
        ctx.lineTo(this.x - this.width / 2 + radius, this.y + this.height / 2);
        ctx.arc(this.x - this.width / 2 + radius, this.y + this.height / 2 - radius, radius, Math.PI / 2, Math.PI);
        ctx.lineTo(this.x - this.width / 2, this.y - this.height / 2 + radius);
        ctx.arc(this.x - this.width / 2 + radius, this.y - this.height / 2 + radius, radius, Math.PI, -Math.PI / 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(this.sprite, frameWidth * this.currentFrame, 0, frameWidth, this.sprite.height, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        ctx.restore();
        this.smokes.forEach(smoke => smoke.render(ctx));
    }
}
//This is the main game class that sets up the logic for the flow of the game
class Game{
    constructor(){
        this.width = 640;
        this.height = 480;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.player = new Player(this);
        this.enemies = [];
        this.powerUps = [];
        this.hud = new HUD(this);
        this.audioManager = new AudioManager();
        this.explosions = [];
        this.backgroundImage = new Image();
        this.backgroundImage1 = new Image();
        this.backgroundImage2 = new Image();
        this.lastTime = 0;
        this.gameOver = false;
        this.enemySpawnInterval = 1000;
        this.lastEnemySpawn = 0;
        this.isTitleScreen = true;
        this.init();
    }
    init(){
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.backgroundImage.src = 'assets/images/levels/background.png';
        this.backgroundImage1.src = 'assets/images/levels/background1.png';
        this.backgroundImage2.src = 'assets/images/levels/background2.png';
        this.backgroundImage.onload = () => {
            this.audioManager.loadSound('bullet', 'assets/audio/bulletSound.mp3');
            this.audioManager.loadSound('hit', 'assets/audio/hitSound.mp3');
            this.audioManager.loadSound('explosion', 'assets/audio/explosionSound.mp3');
            this.audioManager.playBackgroundMusic();
            this.start();
        };
        this.addEventListeners();
    }
    start(){
        requestAnimationFrame(this.loop.bind(this));
    }
    loop(timestamp){
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.handleInput();
        if(this.hud.score >= 600){
            this.ctx.drawImage(this.backgroundImage2, 0, 0, this.width, this.height);
        }else if(this.hud.score >= 300){
            this.ctx.drawImage(this.backgroundImage1, 0, 0, this.width, this.height);
        }else{
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        }
        if(this.isTitleScreen){
            this.renderTitleScreen();
            if(this.keys['ArrowUp']){
                this.startGame();
            }
        }else if(this.gameOver){
            this.renderGameOver();
            if(this.keys['ArrowUp']){
                this.restartGame();
            }
        }else{
            this.update(deltaTime);
            this.render();
        }
        requestAnimationFrame(this.loop.bind(this));
    }
//    This function handles the in game input
   handleInput(){
       const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
       const gamepad = gamepads[0];
       if(gamepad){
           console.log('Gamepad Buttons:', gamepad.buttons.map(button => button.pressed));
           console.log('Gamepad Axes:', gamepad.axes);
           const dpadUp = gamepad.buttons[12].pressed || gamepad.axes[1] < -0.5;
           const dpadLeft = gamepad.buttons[14].pressed || gamepad.axes[0] < -0.5;
           const dpadRight = gamepad.buttons[15].pressed || gamepad.axes[0] > 0.5;
           const dpadDown = gamepad.buttons[13].pressed || gamepad.axes[1] > 0.5;
           console.log(`dpadUp: ${dpadUp}, dpadLeft: ${dpadLeft}, dpadRight: ${dpadRight}, dpadDown: ${dpadDown}`);
           this.keys['ArrowLeft'] = dpadLeft;
           this.keys['ArrowRight'] = dpadRight;
           this.keys['ArrowUp'] = dpadUp;
           this.keys['ArrowDown'] = dpadDown;
           console.log(`Keys: ${JSON.stringify(this.keys)}`);
       }
   }
    renderTitleScreen(){
        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px ArcadeFont, ubuntu';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Fiat Eliminator: BitBoy Edition', this.width / 2, this.height / 2 - 50);
        this.ctx.font = '24px ArcadeFont, ubuntu';
        this.ctx.fillText('Press Up to Start', this.width / 2, this.height / 2 + 50);
    }
    restartGame(){
        this.player = new Player(this);
        this.enemies = [];
        this.powerUps = [];
        this.explosions = [];
        this.hud.score = 0;
        this.hud.setHealth(this.player.maxHealth);
        this.gameOver = false;
        this.isTitleScreen = false;
        this.lastEnemySpawn = 0;
    }
//    This function does the logic for the (end of game/game over) logic
    renderGameOver(){
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = 'red';
        this.ctx.font = '48px ArcadeFont, ubuntu';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
        this.ctx.font = '24px ArcadeFont, ubuntu';
        this.ctx.fillText('Press Up to Restart', this.width / 2, this.height / 2 + 50);
    }
    startGame(){
        this.isTitleScreen = false;
    }
    update(deltaTime){
        this.player.update(deltaTime);
        this.updateEnemies(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateExplosions(deltaTime);
        this.checkCollisions();
        this.spawnEnemies();
    }
    render(){
        this.player.render(this.ctx);
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
        this.explosions.forEach(explosion => explosion.render(this.ctx));
        this.hud.render(this.ctx);
    }
    updateEnemies(deltaTime){
        const score = this.hud.score;
        const speedMultiplier = 1 + Math.min(Math.floor(score / 150), 4) * 0.2;
        this.enemies.forEach((enemy, index) => {
            if(score < 100){
                enemy.speedRate(enemy.baseSpeed / 2);
            }else{
                enemy.speedRate(enemy.baseSpeed * speedMultiplier);
            }
            enemy.update(deltaTime);
            if(enemy.markedForDeletion){
                this.enemies.splice(index, 1);
            }
        });
    }
    updatePowerUps(deltaTime){
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update(deltaTime);
            if(powerUp.markedForDeletion){
                this.powerUps.splice(index, 1);
            }
        });
    }
//    This function updates the explosions in game
    updateExplosions(deltaTime){
        this.explosions.forEach((explosion, index) => {
            explosion.update();
            if(explosion.markedForDeletion){
                this.explosions.splice(index, 1);
            }
        });
    }
//    This function checks for collisions in the game and applies the correct logic for each type of collision
    checkCollisions(){
        this.enemies.forEach((enemy, enemyIndex) => {
            this.player.bullets.forEach((bullet, bulletIndex) => {
                if(this.rectCollision(bullet, enemy)){
                    this.explosions.push(new Explosion(enemy.x, enemy.y));
                    this.enemies.splice(enemyIndex, 1);
                    this.player.bullets.splice(bulletIndex, 1);
                    this.hud.increaseScore(10);
                    this.audioManager.playSound('explosion');
                }
            });
            if(this.rectCollision(this.player, enemy)){
                this.player.playerDamage();
                this.enemies.splice(enemyIndex, 1);
                this.explosions.push(new Explosion(enemy.x, enemy.y));
                this.audioManager.playSound('hit');
                this.audioManager.playSound('explosion');
            }
        });
        this.powerUps.forEach((powerUp, index) => {
            if(this.rectCollision(this.player, powerUp)){
                this.powerUps.splice(index, 1);
                this.explosions.push(new Explosion(powerUp.x, powerUp.y));
                this.audioManager.playSound('hit');
            }
        });
    }
    rectCollision(a, b){
        return (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y);
    }
//    This function spawns enemies in the game for the player to shoot
    spawnEnemies(){
        this.enemySpawnRate();
        if(Date.now() - this.lastEnemySpawn > this.enemySpawnInterval){
            const enemy = new Enemy(this);
            this.enemies.push(enemy);
            this.lastEnemySpawn = Date.now();
        }
    }
//    This function sets the spawn interval for the enemies at different scores
    enemySpawnRate(){
        if(this.hud.score >= 600){
            this.enemySpawnInterval = 500;
        }else if(this.hud.score >= 300){
            this.enemySpawnInterval = 750;
        }else{
            this.enemySpawnInterval = 1000;
        }
    }
    addEventListeners() {
        document.addEventListener('keydown', (e) => {
            if(this.isTitleScreen && (e.key === 'Enter' || e.key === 'ArrowUp')){
                this.startGame();
            }else if(this.gameOver && (e.key === 'ArrowUp')){
                this.restartGame();
            }else{
                this.keys[e.key] = true;
            }
        });
        document.addEventListener('keyup', (e) => { this.keys[e.key] = false; });
    }
}
window.onload = () => new Game();