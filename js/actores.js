var wobbleSpeed = 8;
var wobbleDist = 0.07;

function Vector(x, y) {
    this.x = x;
    this.y = y;
}

Vector.prototype.plus = function(other) {
    return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.times = function(factor) {
    return new Vector(this.x * factor, this.y * factor);
}

var actorChars = {
    '@': Player,
    'o': Coin,
    '=': bolafuego,
    '|': Lava,
    'v': Lava,
    'c': Vida,
    'e': enemigo,
    'i': enemigostatico,
    'G': enemigogrande
};

function Player(pos) {
    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
}
Player.prototype.type = "player";

Player.prototype.moveX = function(step, level, keys) {

    this.speed.x = 0;
    if (keys.left) this.speed.x -= playerXSpeed;
    if (keys.right) this.speed.x += playerXSpeed;

    var motion = new Vector(this.speed.x * step, 0);
    var newPos = this.pos.plus(motion);
    var obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle)
        level.playerTouched(obstacle);
    else
        this.pos = newPos;
};

Player.prototype.moveY = function(step, level, keys) {
    this.speed.y += step * gravity;
    var motion = new Vector(0, this.speed.y * step);
    var newPos = this.pos.plus(motion);
    var obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
        level.playerTouched(obstacle);
        if ((keys.up || keys.up2) && this.speed.y > 0)
            this.speed.y = -jumpSpeed;
        else
            this.speed.y = 0;
    } else {
        this.pos = newPos;
    }
};

Player.prototype.act = function(step, level, keys) {
    this.moveX(step, level, keys);
    this.moveY(step, level, keys);

    var otherActor = level.actorAt(this);
    if (otherActor)
        level.playerTouched(otherActor.type, otherActor);

    if (level.status == "lost") {
        this.pos.y += step;
        this.size.y -= step;
    }
};


function Lava(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "+") {
        this.speed = new Vector(2, 0);
    } else if (ch == '|') {
        this.speed = new Vector(0, 2);
    } else if (ch == 'v') {
        this.speed = new Vector(0, 3);
        this.repeatPos = pos;
    }
}
Lava.prototype.type = 'lava';

Lava.prototype.act = function(step, level) {
    var newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};


function bolafuego(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "=") {
        this.speed = new Vector(2, 0);
    }
}
bolafuego.prototype.type = 'bolafuego';

bolafuego.prototype.act = function(step, level) {
    var newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};




function enemigogrande(pos, ch) {
    this.pos = pos;
    this.size = new Vector(3, 3);
    if (ch == "G") {
        this.speed = new Vector(6, 0);
    }
}
enemigogrande.prototype.type = 'enemigogrande';

enemigogrande.prototype.act = function(step, level) {
    var newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};



function enemigo(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "e") {
        this.speed = new Vector(2, 0);
    }
}
enemigo.prototype.type = 'enemigo';

enemigo.prototype.act = function(step, level) {
    var newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};





function enemigostatico(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    if (ch == "i") {
        this.speed = new Vector(0, 0);
    }
}
enemigostatico.prototype.type = 'enemigostatico';

enemigostatico.prototype.act = function(step, level) {
    var newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size))
        this.pos = newPos;
    else if (this.repeatPos)
        this.pos = this.repeatPos;
    else
        this.speed = this.speed.times(-1);
};


function Coin(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = 'coin';

Coin.prototype.act = function(step) {
    this.wobble += step * wobbleSpeed;
    var wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
};


function Vida(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
}
Vida.prototype.type = 'vida';

Vida.prototype.act = function(step) {
    this.wobble += step * wobbleSpeed;
    var wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
};