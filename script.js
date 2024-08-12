// Scene Setup
let scene, camera, renderer, composer;
let cars = [], aiCars = [], powerUps = [];
let track, skybox;
let carMaterials = {}, trackTextures = {};
let startTime, currentLap = 1;
let carPattern = 'solid', carDecal = 'none', carRims = 'silver';
let selectedTrack = 'city', selectedWeather = 'sunny';
let lapCount = 3, aiOpponents = 3, playerCount = 1;
let clock = new THREE.Clock();
let deltaTime = 0;

// Initialize the game
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('game-canvas').appendChild(renderer.domElement);

    // Post-processing
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    composer.addPass(bloomPass);

    initLighting();
    initMaterials();
    createTrack();
    createSkybox();
    createCars();
    initPowerUps();
    initParticleSystems();

    camera.position.set(0, 5, 10);
    camera.lookAt(scene.position);

    window.addEventListener('resize', onWindowResize, false);
}

// Initialize lighting
function initLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Add dynamic lighting based on time of day
    const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    scene.add(hemiLight);
}

// Initialize materials and textures
function initMaterials() {
    const textureLoader = new THREE.TextureLoader();
    
    carMaterials = {
        sports: new THREE.MeshStandardMaterial({ color: 0xFF0000, roughness: 0.2, metalness: 0.8 }),
        classic: new THREE.MeshStandardMaterial({ color: 0x00FF00, roughness: 0.5, metalness: 0.5 }),
        muscle: new THREE.MeshStandardMaterial({ color: 0x0000FF, roughness: 0.3, metalness: 0.7 }),
        futuristic: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.1, metalness: 0.9, emissive: 0x00FFFF, emissiveIntensity: 0.5 })
    };

    trackTextures = {
        city: textureLoader.load('textures/city_track.jpg'),
        desert: textureLoader.load('textures/desert_track.jpg'),
        forest: textureLoader.load('textures/forest_track.jpg'),
        snow: textureLoader.load('textures/snow_track.jpg'),
        space: textureLoader.load('textures/space_track.jpg')
    };

    // Apply advanced material properties
    Object.values(carMaterials).forEach(material => {
        material.envMap = textureLoader.load('textures/envmap.jpg');
        material.envMapIntensity = 0.5;
    });
}

// Create track
function createTrack() {
    const trackGeometry = new THREE.PlaneGeometry(1000, 1000);
    const trackMaterial = new THREE.MeshStandardMaterial({ 
        map: trackTextures[selectedTrack],
        roughness: 0.8,
        metalness: 0.2
    });
    track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    scene.add(track);

    // Add track details (buildings, trees, etc.)
    addTrackDetails();
}

// Add track details
function addTrackDetails() {
    // Add buildings, trees, or other objects based on the selected track
    // This is a placeholder for more complex track creation logic
}

// Create skybox
function createSkybox() {
    const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const skyboxMaterials = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox_right.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox_left.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox_top.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox_bottom.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox_front.jpg'), side: THREE.BackSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skybox_back.jpg'), side: THREE.BackSide })
    ];
    skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);
}

// Create cars
function createCars() {
    const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
    
    for (let i = 0; i < playerCount; i++) {
        const car = new THREE.Mesh(carGeometry, carMaterials.sports);
        car.position.set(i * 2 - (playerCount - 1), 0.6, 0);
        scene.add(car);
        cars.push(car);
    }

    for (let i = 0; i < aiOpponents; i++) {
        const aiCar = new THREE.Mesh(carGeometry, carMaterials.classic);
        aiCar.position.set(Math.random() * 10 - 5, 0.6, -Math.random() * 100);
        scene.add(aiCar);
        aiCars.push(aiCar);
    }

    // Add car details (wheels, spoilers, etc.)
    addCarDetails();
}

// Add car details
function addCarDetails() {
    cars.concat(aiCars).forEach(car => {
        // Add wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        for (let i = 0; i < 4; i++) {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
          wheel.rotation.z = Math.PI / 2;
            wheel.position.set(
                (i % 2 === 0 ? 0.6 : -0.6),
                -0.3,
                (i < 2 ? 0.7 : -0.7)
            );
            car.add(wheel);
        }

        // Add spoiler
        const spoilerGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.3);
        const spoilerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
        spoiler.position.set(0, 0.3, -0.9);
        car.add(spoiler);

        // Add headlights
        const headlightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.5 });
        
        for (let i = 0; i < 2; i++) {
            const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
            headlight.position.set((i === 0 ? 0.4 : -0.4), 0, 1);
            car.add(headlight);
        }
    });
}

// Initialize power-ups
function initPowerUps() {
    const powerUpGeometry = new THREE.SphereGeometry(0.5);
    const powerUpMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFF00, emissive: 0xFFFF00, emissiveIntensity: 0.5 });
    
    for (let i = 0; i < 5; i++) {
        const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
        powerUp.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
        scene.add(powerUp);
        powerUps.push(powerUp);
    }
}

// Initialize particle systems
function initParticleSystems() {
    // Exhaust particles
    const exhaustGeometry = new THREE.BufferGeometry();
    const exhaustParticles = 1000;
    const exhaustPositions = new Float32Array(exhaustParticles * 3);
    
    for (let i = 0; i < exhaustParticles * 3; i += 3) {
        exhaustPositions[i] = Math.random() * 0.1 - 0.05;
        exhaustPositions[i + 1] = Math.random() * 0.1;
        exhaustPositions[i + 2] = Math.random() * -0.5;
    }
    
    exhaustGeometry.setAttribute('position', new THREE.BufferAttribute(exhaustPositions, 3));
    const exhaustMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.05, transparent: true, opacity: 0.8 });
    const exhaustSystem = new THREE.Points(exhaustGeometry, exhaustMaterial);
    
    cars.forEach(car => {
        const exhaust = exhaustSystem.clone();
        exhaust.position.set(0, 0, -1);
        car.add(exhaust);
    });
}

// Update game state
function update() {
    deltaTime = clock.getDelta();

    // Update car positions
    cars.forEach((car, index) => {
        car.position.z -= (index + 1) * 0.1;
        if (car.position.z < -100) car.position.z = 0;
    });

    // Update AI car positions
    aiCars.forEach(aiCar => {
        aiCar.position.z += 0.05;
        if (aiCar.position.z > 0) aiCar.position.z = -100;
    });

    // Rotate power-ups
    powerUps.forEach(powerUp => {
        powerUp.rotation.y += 0.01;
    });

    // Update particle systems
    cars.forEach(car => {
        const exhaust = car.children.find(child => child instanceof THREE.Points);
        if (exhaust) {
            const positions = exhaust.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 2] -= 0.01;
                if (positions[i + 2] < -0.5) positions[i + 2] = 0;
            }
            exhaust.geometry.attributes.position.needsUpdate = true;
        }
    });

    // Update skybox
    skybox.rotation.y += 0.0001;

    // Check for collisions
    checkCollisions();

    // Update UI
    updateUI();
}

// Check for collisions
function checkCollisions() {
    cars.forEach(car => {
        powerUps.forEach((powerUp, index) => {
            if (car.position.distanceTo(powerUp.position) < 1) {
                // Apply power-up effect
                applyPowerUp(car);
                // Remove power-up
                scene.remove(powerUp);
                powerUps.splice(index, 1);
            }
        });
    });
}

// Apply power-up effect
function applyPowerUp(car) {
    const effects = ['speed', 'invincibility', 'shrink'];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    
    switch (effect) {
        case 'speed':
            car.speed = 2;
            setTimeout(() => car.speed = 1, 5000);
            break;
        case 'invincibility':
            car.material.emissive.setHex(0xFFFF00);
            setTimeout(() => car.material.emissive.setHex(0x000000), 5000);
            break;
        case 'shrink':
            car.scale.set(0.5, 0.5, 0.5);
            setTimeout(() => car.scale.set(1, 1, 1), 5000);
            break;
    }
    
    document.getElementById('power-up-display').textContent = `Power-Up: ${effect}`;
}

// Update UI
function updateUI() {
    document.getElementById('lap-display').textContent = `Lap: ${currentLap}/${lapCount}`;
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer-display').textContent = `Time: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`;
    document.getElementById('fps-counter').textContent = `FPS: ${Math.round(1 / deltaTime)}`;
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    composer.render();
}

// Start the game
function startGame() {
    startTime = Date.now();
    currentLap = 1;
    animate();
}

// Initialize the game
init();

// Event listeners
document.getElementById('start-button').addEventListener('click', startGame);
document.getElementById('reset-button').addEventListener('click', () => {
    location.reload();
});

document.getElementById('car-category').addEventListener('change', function() {
    cars.forEach(car => car.material = carMaterials[this.value]);
});

document.getElementById('car-color').addEventListener('input', function() {
    cars.forEach(car => car.material.color.setHex(this.value.replace('#', '0x')));
});

document.getElementById('track-choice').addEventListener('change', function() {
    selectedTrack = this.value;
    track.material.map = trackTextures[selectedTrack];
    track.material.needsUpdate = true;
});

// Add more event listeners for other UI controls