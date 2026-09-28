const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
const messageBox = document.getElementById('messageBox');

// Ajustement pour la netteté sur les écrans haute densité (ex: iPhone)
function resizeCanvas() {
    // La taille s'adapte à l'écran, tout en gardant une proportion gérable
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.85; 
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    
    ctx.scale(dpr, dpr);
    return size;
}

let canvasSize = resizeCanvas();
window.addEventListener('resize', () => { canvasSize = resizeCanvas(); });

// Formule paramétrique du coeur
function getHeartPoint(t, scale) {
    // Équations mathématiques pour tracer un coeur parfait
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x: x * scale, y: y * scale };
}

// Génération des couches (l'effet wireframe 3D de la vidéo[cite: 1])
const numLayers = 16;
const heartLayers = [];

for (let i = 0; i < numLayers; i++) {
    // Chaque couche est légèrement plus petite que la précédente
    const scale = (canvasSize / 45) * (1 - i * 0.04); 
    const points = [];
    
    for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        points.push(getHeartPoint(t, scale));
    }
    heartLayers.push(points);
}

// Variables d'animation
let animationProgress = 0;
const totalDuration = 300; // Durée de l'animation (en frames)
let animationFinished = false;

function drawHeart() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.translate(canvasSize / 2, canvasSize / 2); // Centrer le dessin

    // Calcul de la progression pour dessiner le coeur progressivement
    const progressRatio = animationProgress / totalDuration;
    const currentLayerLimit = progressRatio * numLayers;

    for (let i = 0; i < numLayers; i++) {
        // Ne dessiner que les couches jusqu'à la limite actuelle de la progression
        if (i > currentLayerLimit + 1) continue; 

        const points = heartLayers[i];
        ctx.beginPath();

        // Calcul dynamique de la couleur et du glow (lueur)
        let alpha = 0;
        let glow = 0;
        let strokeColor = '';

        if (i <= currentLayerLimit) {
            // Le coeur s'illumine au fur et à mesure[cite: 1]
            alpha = 0.8 - (i * 0.03) * progressRatio;
            glow = 15 * progressRatio;
            // Un rouge profond qui s'éclaircit légèrement vers le centre
            strokeColor = `rgba(230, ${10 + i * 2}, ${30 + i * 2}, ${alpha})`;
        } else {
            // Couches en train d'apparaître (plus sombres)
            alpha = 0.1;
            strokeColor = `rgba(150, 0, 10, ${alpha})`;
        }

        ctx.shadowBlur = glow;
        ctx.shadowColor = 'rgba(255, 0, 40, 0.6)';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;

        points.forEach((p, index) => {
            // L'effet de spirale/torsion vu dans la vidéo[cite: 1]
            const angle = i * 0.06;
            const rx = p.x * Math.cos(angle) - p.y * Math.sin(angle);
            const ry = p.x * Math.sin(angle) + p.y * Math.cos(angle);

            if (index === 0) {
                ctx.moveTo(rx, ry);
            } else {
                ctx.lineTo(rx, ry);
            }
        });

        ctx.closePath();
        ctx.stroke();
    }

    ctx.translate(-canvasSize / 2, -canvasSize / 2); // Réinitialiser le centre

    // Gestion précise du timing
    if (animationProgress < totalDuration) {
        animationProgress += 1;
        requestAnimationFrame(drawHeart);
    } else {
        // L'animation est complètement terminée
        if (!animationFinished) {
            animationFinished = true;
            // On attend 800ms de silence visuel avant d'afficher le message d'excuse
            setTimeout(() => {
                messageBox.classList.add('visible');
            }, 800);
        }
        // Maintenir le coeur affiché à son état final
        requestAnimationFrame(keepHeartDrawn);
    }
}

// Fonction pour maintenir le coeur illuminé une fois l'animation d'apparition terminée
function keepHeartDrawn() {
    animationProgress = totalDuration; // Fige la progression
    drawHeart(); // Redessine en boucle l'état final pour garder le glow
}

// Lancer l'animation
requestAnimationFrame(drawHeart);