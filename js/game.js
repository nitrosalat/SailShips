

var game = new Phaser.Game("100%", "100%" , Phaser.AUTO, "game", {
    preload: preload,
    create: create,
    update: update
});


var WORLD_HEIGHT = 1600;
var WORLD_WIDTH = 2560;
var MAX_LAYERS = 6;

Transform = function (body) {
    this.forward = new Phaser.Point(Math.cos(game.math.degToRad(body.angle - 90)),Math.sin(game.math.degToRad(body.angle - 90)));
    this.right = new Phaser.Point(Math.cos(game.math.degToRad(body.angle)),Math.sin(game.math.degToRad(body.angle)));
    this.left = Phaser.Point.negative(this.right);
    this.back = Phaser.Point.negative(this.forward);
}
Transform.constructor = Transform;

Ship = function(x,y){
    Phaser.Sprite.call(this,game,x,y);

    game.physics.p2.enable(this,true);
    this.body.setRectangle(60,140);
    this.body.angularDamping = 0.5;

    game.add.existing(this);
}
Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.constructor = Ship;
Ship.prototype.getTransform = function () {
    return new Transform(this.body);
}


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



var instructions;
var ship;

var cursors;
var graphics;

function preload() {
    game.load.image('background', 'assets/background.jpg');
}
function create() {
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
    game.add.sprite(0, 0, 'background');
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);


    game.physics.p2.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    ship = new Ship(400,400);
    game.camera.follow(ship);

    graphics = game.add.graphics(0,0);


    cursors = game.input.keyboard.createCursorKeys();

    game.input.onDown.add(click, this);
    instructions = game.add.text(10, 10, "ARROWS for move \n Release photon left click of mouse", {
        font: "20px Arial",
        fill: "#ffffff",
        align: "center"
    });
    instructions.fixedToCamera = true;
}

function click(event) {

}

function killOrthogonalVelocity(){


}

function update() {
    graphics.clear()
    graphics.lineStyle(1,0x000000,1)
    graphics.moveTo(ship.x,ship.y);
    graphics.lineTo(ship.x + ship.getTransform().left.x*100,ship.y + ship.getTransform().left.y * 100)
    if(cursors.up.isDown)
    {
        ship.body.thrust(200);
    }
    if(cursors.right.isDown)
    {
        ship.body.rotateRight(30);
    }
}