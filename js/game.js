

var game = new Phaser.Game("100%", "100%" , Phaser.AUTO, "game", {
    preload: preload,
    create: create,
    update: update
});
//////////Electron declaration
//Electron = function (x, y, owner) {
//
//    Phaser.Sprite.call(this, game, x, y);
//    this.loadTexture('electrons',0);
//    this.owner = owner;
//
//    this.scale.set(0.2, 0.2);
//    this.anchor.x = this.anchor.y = 0.5;
//    //game.physics.p2.enable(this);
//
//    //this.body.setCircle(this.width / 2, 0, 0);
//    //this.body.clearShapes();
//    //this.body.damping = 0.98;
//    //this.body.mass = 0.005;
//
//    this.state = Electron.FREE;
//
//    game.add.existing(this);
//    this.destroyTime = 5000;
//    this.currentTimeDestroy = 0;
//
//    this.setState = function (state) {
//        switch(state)
//        {
//            case Electron.FREE:
//                this.loadTexture('electrons',0);
//                this.owner = null;
//                break;
//            case Electron.IN_ATOM:
//                this.loadTexture('electrons',1);
//                this.currentTimeDestroy = 0;
//                break;
//            case Electron.METASTABLE:
//                this.loadTexture('electrons',2);
//                this.owner = null;
//                break;
//        }
//
//        this.state = state;
//    }
//
//
//    this.onCollide = function (body, shape1, shape2, equation) {
//        if (body) {
//            if (body.sprite instanceof Photon) {
//                if (this.owner) {
//                    this.owner.removeElectronFromOutterLevel();
//                }
//                body.sprite.remove();
//            }
//        }
//    };
//    this.body.onBeginContact.add(this.onCollide, this);
//
//}
////states
//Electron.FREE = 0;
//Electron.IN_ATOM = 1;
//Electron.METASTABLE = 2;
///////
//Electron.prototype = Object.create(Phaser.Sprite.prototype);
//Electron.prototype.constructor = Electron;
//Electron.prototype.update = function () {
//    if(this.state == Electron.METASTABLE)
//    {
//        this.currentTimeDestroy+= game.time.physicsElapsedMS;
//        if(this.currentTimeDestroy >= this.destroyTime)
//        {
//            electrons.splice(electrons.indexOf(this), 1);
//            this.destroy();
//        }
//    }
//
//}
//////////PHOTON declaration
//Photon = function (startPoint, destination) {
//    Phaser.Sprite.call(this, game, startPoint.x, startPoint.y);
//    this.anchor.x = this.anchor.y = 0.5;
//    //game.physics.p2.enable(this);
//   // this.body.mass = 0.001;
//    //this.body.damping = 0;
//    //this.body.setCircle(5, 0, 0);
//
//
//    var vel = new Phaser.Point(destination.x - startPoint.x, destination.y - startPoint.y);
//    vel.normalize();
//   // this.body.velocity.x = vel.x * 300;
//   // this.body.velocity.y = vel.y * 300;
//
//
//    this.graphics = game.add.graphics(0, 0);
//    this.t = Math.random() * 10;
//    var point = new Phaser.Point(destination.x, destination.y);
//    this.graphics.rotation = game.math.angleBetweenPoints(startPoint, point);
//    this.rotation = game.math.angleBetweenPoints(startPoint, point);
//    game.add.existing(this);
//
//
//    this.wLenght = 20;
//    this.amplitude = 5;
//    this.frequency = 0.5;
//
//
//    this.remove = function () {
//        this.graphics.destroy();
//        this.destroy();
//    }
//    this.onCollide = function (body, shape1, shape2, equation) {
//        if (body) {
//            if (body.sprite instanceof Photon) {
//                this.remove();
//                body.sprite.remove();
//            }
//        }
//        else {
//            this.remove();
//        }
//
//    };
//    this.body.onBeginContact.add(this.onCollide, this);
//};
//
//Photon.prototype = Object.create(Phaser.Sprite.prototype);
//Photon.prototype.constructor = Photon;
//Photon.prototype.update = function () {
//
//    this.graphics.position = this.position;
//
//    this.graphics.clear();
//    this.graphics.lineStyle(1, '#ffffff');
//    this.graphics.moveTo(-this.wLenght / 2, Math.cos(-this.wLenght / (this.wLenght / 2)) * Math.sin(-this.wLenght * this.frequency + this.t) * this.amplitude)
//    for (var i = -this.wLenght / 2; i < this.wLenght / 2; i++) {
//        this.graphics.lineTo(i, Math.cos(i / (this.wLenght / 2)) * Math.sin(i * this.frequency + this.t) * this.amplitude);
//    }
//    this.t += 0.5;
//};

////////end declaration


var WORLD_HEIGHT = 1500;
var WORLD_WIDTH = 2300;
var MAX_LAYERS = 6;


Atom = function (x, y, numLayers, id) {
    Phaser.Sprite.call(this, game, x, y, 'proton');

    this.scale.set(0.1, 0.1);
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.dest = null;
    game.physics.p2.enable(this);
    this.body.damping = 0.9;
    this.body.setCircle(this.width / 2);


    this.electricCharge = 0;
    this.currentLevel = 0;

    this.electronLayers = [];

    this.electronLayersDraw = game.add.graphics();
    this.electronLayersDraw.lineStyle(0.4, '#012f23');

    this.nearestElectron;

    this.coolDown = 800;
    this.coolDownCounter = 0;

    this.addLayer = function () {
        if (this.electronLayers.length >= MAX_LAYERS) {
            return;
        }
        this.currentLevel++;
        var radius = this.currentLevel * 15 + 10;
        var layer = new ElectronLayer(radius, 2 * this.currentLevel * this.currentLevel, this.currentLevel); // N = 2n^2
        this.electronLayers.push(layer);


        //draw
        this.electronLayersDraw.drawCircle(0, 0, radius * 2);

        console.log('layer created', radius, layer.maxElectrons)
    };
    for (var i = 0; i < numLayers; i++) {
        this.addLayer();
    }


    this.addElectron = function (e) {
        var currLayer = this.electronLayers[this.electronLayers.length - 1];

        if (currLayer.electrons.length < currLayer.maxElectrons) {
            //e.bound = game.physics.p2.createDistanceConstraint(this.body, e.body,currLayer.radius)
            e.owner = this;

            e.setState(Electron.IN_ATOM);

            currLayer.addElectronToLayer(e);

            electrons.splice(electrons.indexOf(e), 1);
        }

    };
    this.upperEnergy = function () {

    };
    this.lowerEnergy = function () {
        for (var index = this.electronLayers.length - 1; index > 0; index--) {
            var layer = this.electronLayers[index];
            var nextLayer = this.electronLayers[index - 1];
            if (layer != undefined && nextLayer != undefined) {
                if (nextLayer.electrons.length < nextLayer.maxElectrons && layer.electrons.length > 0) {
                    var electron = layer.electrons.shift();
                    nextLayer.addElectronToLayer(electron);
                    return layer;
                }
            }
        }
        return null;
    };
    this.emittePhoton = function (endPoint) {
        var layer = this.lowerEnergy();
        if (layer) {
            var rad = layer.radius;
            var endPoint = endPoint;
            var pointOffset = new Phaser.Point(endPoint.x - this.x, endPoint.y - this.y);
            pointOffset.normalize();
            pointOffset.x *= rad + 10;
            pointOffset.y *= rad + 10;
            var startPoint = new Phaser.Point(this.x + pointOffset.x, this.y + pointOffset.y);
            new Photon(startPoint, endPoint);
        }
    };
    this.removeElectronFromOutterLevel = function () {

        for (var index = this.electronLayers.length - 1; index >= 0; index--) {
            if (this.electronLayers[index].electrons.length > 0) {
                var electron = this.electronLayers[index].electrons.shift();
                this.removeElectron(electron);
                break;
            }
        }

    };
    this.removeAllElectrons = function () {
        for (var index = this.electronLayers.length - 1; index >= 0; index--) {
            while (this.electronLayers[index].electrons.length > 0) {
                var electron = this.electronLayers[index].electrons.shift();
                this.removeElectron(electron);
            }
        }
    };
    this.removeElectron = function (electron) {
        var vel = new Phaser.Point(electron.x - this.x, electron.y - this.y);
        vel.normalize();
        electron.body.setZeroVelocity();//обнуляем, чтобы летело радиально
        electron.body.velocity.x = vel.x * 1000;
        electron.body.velocity.y = vel.y * 1000;
        electron.setState(Electron.METASTABLE);

        electrons.push(electron);
    }

    game.add.existing(this);

    //this.onCollide = function (body, shape1, shape2, equation) {
    //    if (body != null) {
    //        if (body.sprite instanceof Photon) {
    //            //this.removeElectronFromOutterLevel();
    //            this.removeAllElectrons();
    //            body.sprite.remove();
    //        }
    //        if (body.sprite instanceof Electron) {
    //            if(body.sprite.owner == null)
    //            {
    //                this.addElectron(body.sprite);
    //                body.sprite.setState(Electron.IN_ATOM);
    //            }
    //        }
    //    }
    //
    //};
    //this.body.onBeginContact.add(this.onCollide, this);
    this.remove = function () {
        this.destroy();
        this.electronLayersDraw.destroy();
    }
};
Atom.prototype = Object.create(Phaser.Sprite.prototype);
Atom.constructor = Atom;
Atom.prototype.update = function () {

    this.electronLayersDraw.position = this.position;

    var atom = this;//почему-то теряется контекст
    //electrons.forEach(function (e) {
    //    var dist = game.physics.arcade.distanceBetween(atom, e);
    //    var layer = atom.electronLayers[atom.electronLayers.length - 1];
    //    if (dist <= layer.radius) {
    //        atom.addElectron(e);
    //    }
    //});
    atom.electronLayers.forEach(function (layer) {
        layer.electrons.forEach(function (e) {
            var angle = ((Math.PI * 2) * (layer.electrons.indexOf(e) + 1)) / layer.maxElectrons + layer.t;
            var x = atom.x + Math.cos(angle) * layer.radius;
            var y = atom.y + Math.sin(angle) * layer.radius;
            if (game.physics.arcade.distanceBetween(new Phaser.Point(x, y), e) > 30) {
                e.body.velocity.x = (x - e.x) * 15;
                e.body.velocity.y = (y - e.y) * 15;
            }
            else {
                e.body.velocity.x = (x - e.x) * 50;
                e.body.velocity.y = (y - e.y) * 50;
            }

        });
        layer.update();
    });

    if(atom.coolDownCounter < atom.coolDown)
    {
        atom.coolDownCounter += game.time.physicsElapsedMS;
    }
};

function ElectronLayer(radius, maxElectrons, num) {
    this.t = Math.random() * Math.PI * 2;
    this.number = num;
    var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.offsetT = (1 / (this.number * 8)) * plusOrMinus;
    this.radius = radius;
    this.electrons = [];
    this.maxElectrons = maxElectrons;
    this.addElectronToLayer = function (e) {
        this.electrons.push(e);
    }
    this.removeElectronFromLayer = function (e) {
        this.electrons.splice(this.electrons.indexOf(e), 1);
    }

    this.update = function () {
        this.t += this.offsetT;
    }
}

Player = function (x,y,id) {
    this.id = id;
    this.atom = new Atom(x, y);

    this.destroy = function () {
        this.atom.remove();
    };
}
Player.prototype.constructor = Player;

var socket;
var player;
var players = [];
var electrons;
var instructions;

var atoms = [];


function preload() {
    game.load.image('background', 'assets/background.jpg');
    game.load.image('proton', 'assets/proton.png');
}
function create() {
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    game.physics.startSystem(Phaser.Physics.P2JS);
    game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    game.add.sprite(0, 0, 'background');
    socket = io.connect("ws://localhost:1040");
    socket.on('initialState',initialState);
    socket.on('connectedPlayer',connectedPlayer)
    socket.on('disconnectPlayer',disconnectPlayer);


    game.physics.p2.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);


    game.input.onDown.add(click, this);
    instructions = game.add.text(10, 10, "ARROWS for move \n Release photon left click of mouse", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "center"
    });
    instructions.fixedToCamera = true;
}
function initialState(state)
{
    console.log(state);
    player = new Player(state.self.position[0],state.self.position[1],state.self.id);
    state.others.forEach(function (data) {
        players.push(new Player(data.position[0],data.position[1],data.id));
    });
}
function connectedPlayer(playerData)
{
    players.push(new Player(playerData.position[0],playerData.position[1],playerData.id));
}
function disconnectPlayer(playerData)
{
    var player = null;
    players.forEach(function (p) {
        if(p.id == playerData.id)
        {
            player = p;
        }
    });
    players.splice(players.indexOf(player), 1)
    player.destroy();
}
function sendInput(input)
{
    socket.emit('input',input);
}
function click(event) {
    var input = {};
    if(event.rightButton.isDown)
    {
        input.rightButton = true;
        input.x = event.worldX;
        input.y = event.worldY;
        sendInput(input);
    }
}

function update() {

}