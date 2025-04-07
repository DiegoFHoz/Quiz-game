<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Magic Sorty - Juego educativo infantil</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/phaser.min.js"></script>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #4eb8e5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        #game-container {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
        }
    </style>
</head>
<body>
    <div id="game-container"></div>

    <script>
        // Configuración del juego - diseño vertical
        const config = {
            type: Phaser.AUTO,
            width: 450,
            height: 800,
            parent: 'game-container',
            backgroundColor: '#4eb8e5', // Fondo azul como en la imagen
            scene: {
                preload: preload,
                create: create,
                update: update
            },
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        // Variables globales
        let gameTime = 60;
        let score = 0;
        let timeText;
        let scoreText;
        let currentItem;
        let categories;
        let timer;
        let gameItems = [];
        
        // Definir el juego
        const game = new Phaser.Game(config);

        // Función para cargar recursos
        function preload() {
            // Convertimos las imágenes que proporcionaste a base64 para su uso
            // Aquí las convertiríamos, pero por ahora usamos placeholders
            
            // Cargar título
            this.load.image('logo', '/api/placeholder/300/150');
            
            // Cargar categorías
            this.load.image('duck_box', '/api/placeholder/200/150');
            this.load.image('tshirt_box', '/api/placeholder/200/150');
            this.load.image('apple_box', '/api/placeholder/200/150');
            
            // Cargar elementos para clasificar
            this.load.image('carrot', '/api/placeholder/100/160');
            
            // Sonidos (podemos añadirlos después)
            this.load.audio('correct', 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/audio/assets/correct.mp3');
            this.load.audio('wrong', 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/audio/assets/wrong.mp3');
        }

        // Función para crear el juego
        function create() {
            // Título del juego
            this.add.image(config.width / 2, 100, 'logo').setScale(0.8);
            
            // Crear categorías (contenedores)
            categories = this.add.group();
            const categoryWidth = 120;
            const categoryHeight = 120;
            const spacing = 20;
            const totalWidth = (categoryWidth * 3) + (spacing * 2);
            let startX = (config.width - totalWidth) / 2;
            
            const categoryData = [
                { name: 'animals', key: 'duck_box', position: 0 },
                { name: 'clothes', key: 'tshirt_box', position: 1 },
                { name: 'food', key: 'apple_box', position: 2 }
            ];
            
            categoryData.forEach((cat, index) => {
                const x = startX + (index * (categoryWidth + spacing));
                const y = 250;
                
                // Crear categoría con la imagen
                const categoryBox = this.add.image(x + categoryWidth/2, y + categoryHeight/2, cat.key)
                    .setInteractive()
                    .setScale(0.6);
                categoryBox.name = cat.name;
                
                categories.add(categoryBox);
            });
            
            // Área de juego central (rectángulo azul claro)
            const gameArea = this.add.rectangle(config.width / 2, 450, 350, 200, 0x94ddf4, 1);
            
            // Panel inferior (rojo/naranja)
            const bottomPanel = this.add.rectangle(config.width / 2, 650, 450, 100, 0xff624e, 1);
            
            // Panel de puntuación (azul oscuro)
            const scorePanel = this.add.rectangle(config.width / 2, 750, 450, 100, 0x0a3c54, 1);
            
            // Textos de tiempo y puntuación
            timeText = this.add.text(config.width / 2, 750, `Time: ${gameTime}`, 
                { font: '24px Arial', fill: '#fff200' }).setOrigin(0.5);
            scoreText = this.add.text(config.width - 80, 750, `Score: ${score}`, 
                { font: '24px Arial', fill: '#fff200' }).setOrigin(0.5);
            const levelText = this.add.text(80, 750, '0', 
                { font: '24px Arial', fill: '#fff200' }).setOrigin(0.5);
            
            // Configurar el temporizador
            timer = this.time.addEvent({
                delay: 1000,
                callback: updateTimer,
                callbackScope: this,
                loop: true
            });
            
            // Mostrar el primer ítem (zanahoria para el ejemplo)
            currentItem = this.add.image(config.width / 2, 450, 'carrot')
                .setInteractive({ draggable: true })
                .setScale(0.6);
            currentItem.categoryName = 'food'; // La zanahoria pertenece a la categoría "alimentos"
            
            // Animación de entrada
            this.tweens.add({
                targets: currentItem,
                scale: 0.7,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            // Configurar eventos para arrastrar y soltar
            this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });
            
            this.input.on('dragend', function (pointer, gameObject) {
                let categoryMatched = false;
                
                categories.getChildren().forEach(function (category) {
                    if (Phaser.Geom.Rectangle.Contains(category.getBounds(), gameObject.x, gameObject.y)) {
                        if (gameObject.categoryName === category.name) {
                            // Correcto
                            this.sound.play('correct');
                            gameObject.destroy();
                            score += 10;
                            scoreText.setText(`Score: ${score}`);
                            
                            // Animación de éxito
                            this.tweens.add({
                                targets: category,
                                scaleX: 0.7,
                                scaleY: 0.7,
                                duration: 200,
                                yoyo: true
                            });
                            
                            // Aquí iría el código para mostrar el siguiente ítem
                            // pero por ahora solo reposicionamos la zanahoria
                            currentItem = this.add.image(config.width / 2, 450, 'carrot')
                                .setInteractive({ draggable: true })
                                .setScale(0.6);
                            currentItem.categoryName = 'food';
                            
                        } else {
                            // Incorrecto
                            this.sound.play('wrong');
                            
                            // Animación de error - volver al centro
                            this.tweens.add({
                                targets: gameObject,
                                x: config.width / 2,
                                y: 450,
                                duration: 300,
                                ease: 'Bounce.easeOut'
                            });
                            
                            // Animación de sacudida para la categoría incorrecta
                            this.tweens.add({
                                targets: category,
                                x: category.x + 10,
                                duration: 100,
                                yoyo: true,
                                repeat: 3
                            });
                        }
                        categoryMatched = true;
                    }
                }, this);
                
                if (!categoryMatched) {
                    // Devolver el objeto a su posición original
                    this.tweens.add({
                        targets: gameObject,
                        x: config.width / 2,
                        y: 450,
                        duration: 300,
                        ease: 'Bounce.easeOut'
                    });
                }
            }, this);
        }

        // Función de actualización
        function update() {
            // Lógica adicional si es necesaria
        }

        // Actualizar el tiempo restante
        function updateTimer() {
            gameTime--;
            timeText.setText(`Time: ${gameTime}`);
            
            if (gameTime <= 0) {
                endGame(this);
            }
        }

        // Finalizar el juego
        function endGame(scene) {
            // Detener el temporizador
            timer.remove();
            
            // Eliminar ítem actual
            if (currentItem) {
                currentItem.destroy();
            }
            
            // Mostrar pantalla de fin de juego
            const overlay = scene.add.rectangle(0, 0, config.width, config.height, 0x000000, 0.7);
            overlay.setOrigin(0);
            
            const gameOverText = scene.add.text(config.width / 2, config.height / 2 - 50, 'JUEGO TERMINADO', { 
                font: 'bold 36px Arial', 
                fill: '#ffffff' 
            }).setOrigin(0.5);
            
            const finalScoreText = scene.add.text(config.width / 2, config.height / 2 + 20, `Puntuación final: ${score}`, { 
                font: '28px Arial', 
                fill: '#ffffff' 
            }).setOrigin(0.5);
            
            const playAgainText = scene.add.text(config.width / 2, config.height / 2 + 100, 'Toca para jugar de nuevo', { 
                font: '24px Arial', 
                fill: '#ffffff' 
            }).setOrigin(0.5);
            
            // Reiniciar juego al tocar
            overlay.setInteractive();
            overlay.on('pointerdown', function() {
                scene.scene.restart();
                gameTime = 60;
                score = 0;
            });
        }
    </script>
</body>
</html>