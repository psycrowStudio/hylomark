define([
    'Phaser'
],
    function 
(
    phaser
) {
        var MODULE_NAME = "Phaser Module";
    
        function preload ()
        {
            this.load.setBaseURL('http://localhost:88/');
    
            this.load.image('sky', 'js/zui/pages/phaser/space3.png');
            this.load.image('logo', 'js/zui/pages/phaser/phaser3-logo.png');
            this.load.image('red', 'js/zui/pages/phaser/red.png');
        }
    
        function create ()
        {
            this.add.image(400, 300, 'sky');

            const particles = this.add.particles(0, 0, 'red', {
                speed: 100,
                scale: { start: 1, end: 0 },
                blendMode: 'ADD'
            });
        
            const logo = this.physics.add.image(400, 100, 'logo');
        
            logo.setVelocity(100, 200);
            logo.setBounce(1, 1);
            logo.setCollideWorldBounds(true);
        
            particles.startFollow(logo);
        }

        var _misc = {
            phaser:phaser,
            game: null,
            start: function(parent){
                var config = {
                    type: Phaser.AUTO,
                    width: 800,
                    height: 600,
                    parent: !parent ? "body" :  parent,
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: { y: 200 }
                        }
                    },
                    scene: {
                        preload: preload,
                        create: create
                    }
                };

                console.log("phaser game create");
                _misc.game = new Phaser.Game(config);
            }

        };

        return _misc;
    }
);