/* Original code by https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5
 Upgraded by BenoitPrmt | https://github.com/BenoitPrmt
*/

const myCanvas = document.getElementById('myCanvas');
let ctx = myCanvas.getContext('2d');

function createGrid() {
    const CANVA_WIDTH = myCanvas.getAttribute("width");
    const CANVA_HEIGHT = myCanvas.getAttribute("height");

    for (let i = 0; i < CANVA_WIDTH; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);

        if (i % 100 === 0) {
            ctx.strokeStyle = 'green';
        } else {
            ctx.strokeStyle = 'red';
        }

        ctx.lineTo(i, CANVA_HEIGHT);
        ctx.stroke();
    }

    for (let i = 0; i < CANVA_HEIGHT; i += 10) {
        ctx.beginPath();
        ctx.moveTo(0, i);

        if (i % 100 === 0) {
            ctx.strokeStyle = 'green';
        } else {
            ctx.strokeStyle = 'red';
        }

        ctx.lineTo(CANVA_WIDTH, i);
        ctx.stroke();
    }
}

const context = myCanvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 75
const maxPaddleY = myCanvas.height - grid - paddleHeight;

var paddleSpeed = 11;
var ballSpeed = 10;

let leftScore = 0;
let rightScore = 0;

let color_red = 170;
let color_green = 0;
let color_blue = 0;

let color_mode = "normal" // ou "reverse"
let current_color = "red" // ou "blue", "green"

const leftPaddle = {
    // start in the middle of the game on the left side
    x: grid * 2,
    y: myCanvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0
};

const rightPaddle = {
    // start in the middle of the game on the right side
    x: myCanvas.width - grid * 3,
    y: myCanvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,

    // paddle velocity
    dy: 0
};

const ball = {
    // start in the middle of the game
    x: myCanvas.width / 2,
    y: myCanvas.height / 2,
    width: grid,
    height: grid,

    // keep track of when need to reset the ball position
    resetting: false,

    // ball velocity (start going to the top-right corner)
    dx: ballSpeed,
    dy: -ballSpeed
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/fr/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

function changeColor() {
    let sign = 1
    if (color_mode === "reverse") {
        sign = -sign
    }

    if (current_color === "red") {
        color_red += sign
        if (color_red === 255) {
            current_color = "green"
        } else if (color_red === 170 && color_mode === "reverse") {
            color_mode = "normal"
        }
    } else if (current_color === "green") {
        color_green += sign
        if (color_green === 255) {
            current_color = "blue"
        } else if (color_green === 0 && color_mode === "reverse") {
            current_color = "red"
        }
    } else if (current_color === "blue") {
        color_blue += sign
        if (color_blue === 255) {
            color_mode = "reverse"
            current_color = "blue"
        } else if (color_blue === 0 && color_mode === "reverse") {
            current_color = "green"
        }
    }
}

function addScore(team) {
    if (team === "left") {
        leftScore += 1
    } else if (team === "right") {
        rightScore += 1
    }
    console.log(leftScore, rightScore);
}

// game loop
function loop() {
    requestAnimationFrame(loop);
    // RESET DRAW
    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
    // createGrid()

    // move paddles by their velocity
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;

    // prevent paddles from going through walls
    if (leftPaddle.y < grid) {
        leftPaddle.y = grid;
    }
    else if (leftPaddle.y > maxPaddleY) {
        leftPaddle.y = maxPaddleY;
    }

    if (rightPaddle.y < grid) {
        rightPaddle.y = grid;
    }
    else if (rightPaddle.y > maxPaddleY) {
        rightPaddle.y = maxPaddleY;
    }

    // draw paddles
    context.fillStyle = 'white';
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // draw score
    context.font = "bold 50px Retro Gaming";
    context.fillStyle = 'lightgrey';
    let leftScoreX = 315

    if (leftScore > 9) {
        leftScoreX -= 30
    }

    context.fillText(leftScore, leftScoreX, 70);
    context.fillText(rightScore, 400, 70);

    // move ball by its velocity
    ball.x += ball.dx;
    ball.y += ball.dy;

    // prevent ball from going through walls by changing its velocity
    if (ball.y < grid) {
        ball.y = grid;
        ball.dy *= -1;
    }
    else if (ball.y + grid > myCanvas.height - grid) {
        ball.y = myCanvas.height - grid * 2;
        ball.dy *= -1;
    }

    // reset ball if it goes past paddle (but only if we haven't already done so)
    if ((ball.x < 0 || ball.x > myCanvas.width) && !ball.resetting) {
        if (ball.x < 0) {
            console.log('left out');
            addScore("right");
        } else if (ball.x > myCanvas.width) {
            console.log('right out');
            addScore("left");
        }
        resetGame(true)
    }

    // check to see if ball collides with paddle. if they do change x velocity
    if (collides(ball, leftPaddle)) {
        ball.dx *= -1;

        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        ball.x = leftPaddle.x + leftPaddle.width;
    }
    else if (collides(ball, rightPaddle)) {
        ball.dx *= -1;

        // move ball next to the paddle otherwise the collision will happen again
        // in the next frame
        ball.x = rightPaddle.x - ball.width;
    }

    // draw ball
    changeColor()
    context.fillStyle = `rgb(${color_red}, ${color_green}, ${color_blue})`;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    // draw walls
    context.fillStyle = 'lightgrey';
    context.fillRect(0, 0, myCanvas.width, grid);
    context.fillRect(0, myCanvas.height - grid, myCanvas.width, myCanvas.height);

    // draw dotted line down the middle
    for (let i = grid; i < myCanvas.height - grid; i += grid * 2) {
        context.fillRect(myCanvas.width / 2 - grid / 2, i, grid, grid);
    }
}

function resetGame(wait) {
    ball.resetting = true;

    color_red = 170;
    color_green = 0;
    color_blue = 0;

    if (wait) {
        // give some time for the player to recover before launching the ball again
        setTimeout(() => {
            ball.resetting = false;
            ball.x = myCanvas.width / 2;
            ball.y = myCanvas.height / 2;
        }, 2000);
    } else {
        leftScore = 0;
        rightScore = 0;

        ball.resetting = false;
        ball.x = myCanvas.width / 2;
        ball.y = myCanvas.height / 2;
    }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function (e) {
    // up arrow key
    if (e.which === 38) {
        rightPaddle.dy = -paddleSpeed;
    }
    // down arrow key
    else if (e.which === 40) {
        rightPaddle.dy = paddleSpeed;
    }

    // a key
    if (e.which === 65) {
        leftPaddle.dy = -paddleSpeed;
    }
    // q key
    else if (e.which === 81) {
        leftPaddle.dy = paddleSpeed;
    }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function (e) {
    if (e.which === 38 || e.which === 40) {
        rightPaddle.dy = 0;
    }

    if (e.which === 65 || e.which === 81) {
        leftPaddle.dy = 0;
    }

    if (e.which === 88) {
        ball.dx *= -1
    }
    if (e.which === 67) {
        ball.dx *= -1
    }
});

// start the game
let startButton = document.getElementById("startButton");
let resetButton = document.getElementById("resetButton");

startButton.addEventListener("click", () => {
    requestAnimationFrame(loop);
    resetButton.hidden = false;
    startButton.hidden = true;
});

// reset the game
resetButton.addEventListener("click", () => {
    resetGame(false)
});