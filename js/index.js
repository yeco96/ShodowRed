function Level(plan) {
    this.width = plan[0].length;
    this.height = plan.length;
    this.grid = [];
    this.actors = [];

    for (var y = 0; y < this.height; y++) {
        var line = plan[y],
            gridLine = [];
        for (var x = 0; x < this.width; x++) {
            var ch = line[x],
                fieldType = null;
            var Actor = actorChars[ch];
            if (Actor)
                this.actors.push(new Actor(new Vector(x, y), ch));
            else if (ch == "x")
                fieldType = "wall";
            else if (ch == "!")
                fieldType = "lava";
            gridLine.push(fieldType);
        }
        this.grid.push(gridLine);
    }

    this.player = this.actors.filter(function(actor) {
        return actor.type == "player";
    })[0];
    this.status = this.finishDelay = null;
}
Level.prototype.isFinished = function() {
    return this.status != null && this.finishDelay < 0;
};

Level.prototype.obstacleAt = function(pos, size) {




    var xStart = Math.floor(pos.x);
    var xEnd = Math.ceil(pos.x + size.x);
    var yStart = Math.floor(pos.y);
    var yEnd = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0)
        return "wall";
    if (yEnd > this.height)
        return "lava";
    for (var y = yStart; y < yEnd; y++) {
        for (var x = xStart; x < xEnd; x++) {
            var fieldType = this.grid[y][x];
            if (fieldType) return fieldType;
        }
    }
};

Level.prototype.actorAt = function(actor) {
    for (var i = 0; i < this.actors.length; i++) {
        var other = this.actors[i];
        if (other != actor &&
            actor.pos.x + actor.size.x > other.pos.x &&
            actor.pos.x < other.pos.x + other.size.x &&
            actor.pos.y + actor.size.y > other.pos.y &&
            actor.pos.y < other.pos.y + other.size.y)
            return other;
    }
};

Level.prototype.animate = function(step, keys) {
    if (this.status != null)
        this.finishDelay -= step;

    while (step > 0) {
        var thisStep = Math.min(step, maxStep);
        this.actors.forEach(function(actor) {
            actor.act(thisStep, this, keys);
        }, this);
        step -= thisStep;
    }
};

Level.prototype.playerTouched = function(type, actor) {




    var livesSpan = document.getElementById('lives');
    livesSpan.textContent = lives;



    var contador = 0;
    for (var i = 0; i < this.actors.length; i++) {
        if (this.actors[i].type == 'coin') {
            contador++;
        }
    }

    var monedasSpan = document.getElementById('monedas');
    monedasSpan.textContent = contador;




    if ((type == "lava" || type == "enemigo" || type == "bolafuego" || type == "enemigogrande" || type == "enemigostatico") && this.status == null) {
        this.status = "lost";
        this.finishDelay = 1;
    } else if (type == "coin") {
        this.actors = this.actors.filter(function(other) {

            return other != actor;

        });
        if (!this.actors.some(function(actor) {
                console.log('move');
                return actor.type == "coin";
            })) {
            this.status = "won";
            this.finishDelay = 1;
        }
    } else if (type == "vida") {
        this.actors = this.actors.filter(function(other) {

            return other != actor;

        });
        if (!this.actors.some(function(actor) {

                lives++;
                return actor.type == "coin";
            })) {

        }
    }
};

function elt(name, className) {
    var elt = document.createElement(name);
    if (className) elt.className = className;
    return elt;
}

function flipHorizontally(context, around) {
    context.translate(around, 0);
    context.scale(-1, 1);
    context.translate(-around, 0);
}


function trackKeys(codes) {
    var pressed = Object.create(null);

    function handler(event) {
        if (codes.hasOwnProperty(event.keyCode)) {
            var down = event.type == "keydown";
            pressed[codes[event.keyCode]] = down;
            event.preventDefault();
        }
    }
    addEventListener("keydown", handler);
    addEventListener("keyup", handler);

    pressed.unregister = function() {
        removeEventListener("keydown", handler);
        removeEventListener("keyup", handler);
    };
    return pressed;
}


function runAnimation(frameFunc) {
    var lastTime = null;

    function frame(time) {
        var stop = false;
        if (lastTime != null) {
            var timeStep = Math.min(time - lastTime, 100) / 1000;
            stop = frameFunc(timeStep) === false;
        }
        lastTime = time;
        if (!stop)
            requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);


function runLevel(level, Display, andThen) {
    var display = new Display(document.body, level);
    var running = "yes";

    function handleKey(event) {
        if (event.keyCode == 27) {
            if (running == "no") {
                running = "yes";
                runAnimation(animation);
                var gameStatus = document.getElementById('over');
                gameStatus.textContent = '';
            } else if (running == "pausing") {
                running = "yes";
            } else if (running == "yes") {
                running = "pausing";
                var gameStatus = document.getElementById('over');
                gameStatus.textContent = 'PAUSA';
            }
        }
    }
    addEventListener("keydown", handleKey);
    var arrows = trackKeys(arrowCodes);

    function animation(step) {
        if (running == "pausing") {
            running = "no";
            return false;
        }

        level.animate(step, arrows);
        display.drawFrame(step);
        if (level.isFinished()) {
            display.clear();
            removeEventListener("keydown", handleKey);
            arrows.unregister();
            if (andThen)
                andThen(level.status);
            return false;
        }
    }
    runAnimation(animation);
}


function runGame(plans, Display) {



    var livesSpan = document.getElementById('lives');
    var gameStatus = document.getElementById('over');
    var info = document.getElementById('info');

    function startLevel(n) {
        livesSpan.textContent = lives;
        runLevel(new Level(plans[n]), Display, function(status) {
            if (status == 'lost') {
                lives--;
                if (lives == 0) {
                    
                    if (n != 0) {
                        startLevel(n - 1);
                        lives = 3;
                    }else{
                    gameStatus.textContent = 'Fin del Juego';
                    info.textContent = '';
                    console.log('Fin del Juego');
                    }
                } else {
                    startLevel(n);
                }
            } else if (n < plans.length - 1) {
                startLevel(n + 1);
            } else {
                gameStatus.textContent = 'Has Ganado!';
                console.log('Has Ganado!');
            }
        });
    }
    startLevel(0);
}




runGame(GAME_LEVELS, DOMDisplay);