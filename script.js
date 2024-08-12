// Initial 3D Scene Setup using Three.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game').appendChild(renderer.domElement);

// Track Textures
let textureLoader = new THREE.TextureLoader();
let trackTextures = {
    desert: textureLoader.load('desert-track.jpg'),
    forest: textureLoader.load('forest-track.jpg'),
    city: textureLoader.load('city-track.jpg'),
    mountain: textureLoader.load('mountain-track.jpg'),
    night: textureLoader.load('night-track.jpg'),
    snow: textureLoader.load('snow-track.jpg'),
    raceway: textureLoader.load('raceway.jpg')
};

let trackMaterial = new THREE.MeshBasicMaterial();
let trackGeometry = new THREE.BoxGeometry(10, 1, 100);
let track = new THREE.Mesh(trackGeometry, trackMaterial);
scene.add(track);

// Car Models with Customization
let carGeometry = new THREE.BoxGeometry(1.2, 0.6, 2.5);
let carMaterials = {
    default: new THREE.MeshStandardMaterial({ color: 0xff0000 }),
    sports: new THREE.MeshStandardMaterial({ color: 0x00ff00 }),
    suv: new THREE.MeshStandardMaterial({ color: 0x0000ff }),
    truck: new THREE.MeshStandardMaterial({ color: 0xffff00 }),
    luxury: new THREE.MeshStandardMaterial({ color: 0xff00ff }),
    convertible: new THREE.MeshStandardMaterial({ color: 0x00ffff })
};

let cars = [];
let playerCount = 1;
for (let i = 0; i < playerCount; i++) {
    let car = new THREE.Mesh(carGeometry, carMaterials.sports);
    car.position.set(i * 2 - (playerCount - 1), 0.6, 0);
    scene.add(car);
    cars.push(car);
}

// Lighting
let ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.z = 5;

// UI Controls and Event Listeners
document.getElementById('car-category').addEventListener('change', function() {
    let selectedCategory = this.value;
    cars.forEach(car => car.material = carMaterials[selectedCategory] || carMaterials.default);
});

document.getElementById('car-color').addEventListener('input', function() {
    let carColor = this.value;
    cars.forEach(car => car.material.color.set(carColor));
});

document.getElementById('car-pattern').addEventListener('change', function() {
    carPattern = this.value;
    applyCarPattern();
});

document.getElementById('car-decals').addEventListener('change', function() {
    carDecal = this.value;
    applyCarDecal();
});

document.getElementById('car-rims').addEventListener('change', function() {
    carRims = this.value;
    applyCarRims();
});

document.getElementById('track-choice').addEventListener('change', function() {
    selectedTrack = this.value;
    track.material.map = trackTextures[selectedTrack];
});

document.getElementById('weather-choice').addEventListener('change', function() {
    selectedWeather = this.value;
    applyWeatherEffects();
});

document.getElementById('lap-count').addEventListener('input', function() {
    lapCount = parseInt(this.value, 10);
});

document.getElementById('ai-opponents').addEventListener('input', function() {
    aiOpponents = parseInt(this.value, 10);
    // Update AI Cars
    while (aiCars.length < aiOpponents) {
        let aiCar = createCar('default');
        aiCar.position.set(Math.random() * 10 - 5, 0.6, -Math.random() * 100);
        aiCars.push(aiCar);
    }
    while (aiCars.length > aiOpponents) {
        let aiCar = aiCars.pop();
        scene.remove(aiCar);
    }
});

document.getElementById('player-count').addEventListener('input', function() {
    playerCount = parseInt(this.value, 10);
    // Update Player Cars
    while (cars.length < playerCount) {
        let car = createCar('sports');
        cars.push(car);
    }
    while (cars.length > playerCount) {
        let car = cars.pop();
        scene.remove(car);
    }
});

document.getElementById('start-button').addEventListener('click', startRace);
document.getElementById('reset-button').addEventListener('click', resetGame);

let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
let startTime;
let currentLap = 1;
let isBoostActive = false;

// Create AI Opponents
let aiCars = [];
for (let i = 0; i < aiOpponents; i++) {
    let aiCar = new THREE.Mesh(carGeometry, carMaterials.default);
    aiCar.position.set(Math.random() * 10 - 5, 0.6, -Math.random() * 100);
    scene.add(aiCar);
    aiCars.push(aiCar);
}

// Dynamic Car Physics
function updateCarPhysics(car, speed) {
    car.position.z += speed;
}

// Dynamic AI Opponents
function updateAIOpponents() {
    aiCars.forEach(aiCar => {
        aiCar.position.z += Math.random() * 0.05;
        if (aiCar.position.z > 100) {
            aiCar.position.z = -100;
        }
    });
}

// Power-Ups and Obstacles
let obstacles = [];
for (let i = 0; i < 5; i++) {
    let obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    let obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    let obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
    scene.add(obstacle);
    obstacles.push(obstacle);
}

let powerUpGeometry = new THREE.SphereGeometry(0.5, 32, 32);
let powerUpMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
let powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
powerUp.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
scene.add(powerUp);

// Apply Car Decals
function applyCarDecal() {
    cars.forEach(car => {
        switch (carDecal) {
            case 'flames':
                car.material.map = textureLoader.load('flames.jpg');
                break;
            case 'stars':
                car.material.map = textureLoader.load('stars.jpg');
                break;
            case 'checkered':
                car.material.map = textureLoader.load('checkered.jpg');
                break;
            case 'stripes':
                car.material.map = textureLoader.load('stripes.jpg');
                break;
            case 'none':
                car.material.map = null;
                break;
        }
    });
}

// Apply Car Rims
function applyCarRims() {
    cars.forEach(car => {
        switch (carRims) {
            case 'silver':
                car.material.color.set('#c0c0c0');
                break;
            case 'black':
                car.material.color.set('#000000');
                break;
            case 'gold':
                car.material.color.set('#ffd700');
                break;
            case 'chrome':
                car.material.color.set('#e5e5e5');
                break;
            case 'custom':
                // Custom rims could be added here
                break;
        }
    });
}

// Apply Car Pattern
function applyCarPattern() {
    switch (carPattern) {
        case 'stripes':
            carMaterials.default.map = textureLoader.load('stripes.jpg');
            break;
        case 'polka-dots':
            carMaterials.default.map = textureLoader.load('polka-dots.jpg');
            break;
        case 'solid':
            carMaterials.default.map = null;
            break;
        case 'camouflage':
            carMaterials.default.map = textureLoader.load('camouflage.jpg');
            break;
        case 'checkered':
            carMaterials.default.map = textureLoader.load('checkered.jpg');
            break;
    }
    cars.forEach(car => car.material.map = carMaterials.default.map);
}

// Apply Weather Effects
function applyWeatherEffects() {
    switch (selectedWeather) {
        case 'sunny':
            renderer.setClearColor(0x87ceeb);
            scene.fog = null;
            break;
        case 'rainy':
            renderer.setClearColor(0x606060);
            scene.fog = null;
            break;
        case 'foggy':
            renderer.setClearColor(0x9e9e9e);
            scene.fog = new THREE.FogExp2(0x9e9e9e, 0.02);
            break;
        case 'snowy':
            renderer.setClearColor(0xffffff);
            scene.fog = null;
            break;
        case 'stormy':
            renderer.setClearColor(0x333333);
            scene.fog = new THREE.FogExp2(0x333333, 0.05);
            break;
    }
}

// Start Race Function
function startRace() {
    let carPositions = Array(playerCount).fill(0);
    let speeds = carSpeeds[selectedCategory];
    let raceInterval = setInterval(() => {
        if (Math.random() < 0.05 && !isBoostActive) {
            speeds = speeds.map(speed => speed * 2);
            isBoostActive = true;
            setTimeout(() => {
                speeds = speeds.map(speed => speed / 2);
                isBoostActive = false;
            }, 2000);
        }

        carPositions = carPositions.map((pos, i) => pos + Math.random() * speeds[i]);
        cars.forEach((car, i) => car.position.z = -carPositions[i]);

        // AI Cars Movement
        updateAIOpponents();

        // Obstacle Collision Detection
        obstacles.forEach(obstacle => {
            cars.forEach(car => {
                if (Math.abs(car.position.x - obstacle.position.x) < 1 && Math.abs(car.position.z - obstacle.position.z) < 1) {
                    carPositions[cars.indexOf(car)] -= 0.5;
                }
            });
        });

        // Power-Up Collection
        cars.forEach(car => {
            if (Math.abs(car.position.x - powerUp.position.x) < 1 && Math.abs(car.position.z - powerUp.position.z) < 1) {
                speeds[cars.indexOf(car)] *= 1.5;
                powerUp.position.z = -Math.random() * 100;
                document.getElementById('power-up-display').textContent = 'Power-Up: Speed Boost';
            }
        });

        // Update Lap Timer
                if (!startTime) startTime = Date.now();
        let elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('timer-display').textContent = `Lap Time: ${Math.floor(elapsedTime / 60)}:${(elapsedTime % 60).toString().padStart(2, '0')}`;

        // Check for lap completion
        cars.forEach((car, index) => {
            if (car.position.z > 100) {
                car.position.z = -100;
                currentLap++;
                document.getElementById('lap-display').textContent = `Lap: ${currentLap}`;
                if (currentLap > lapCount) {
                    clearInterval(raceInterval);
                    saveLeaderboard();
                }
            }
        });

        renderer.render(scene, camera);
    }, 100);
}

// Save leaderboard
function saveLeaderboard() {
    let name = prompt('Enter your name for the leaderboard:');
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let totalTime = Math.floor((Date.now() - startTime) / 1000);
    leaderboard.push({ name: name, time: totalTime });
    leaderboard.sort((a, b) => a.time - b.time);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    let leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        let li = document.createElement('li');
        li.textContent = `${entry.name} - ${Math.floor(entry.time / 60)}:${(entry.time % 60).toString().padStart(2, '0')}`;
        leaderboardList.appendChild(li);
    });
}

// Reset Game Function
function resetGame() {
    startTime = null;
    currentLap = 1;
    document.getElementById('lap-display').textContent = 'Lap: 1';
    document.getElementById('timer-display').textContent = 'Lap Time: 00:00';
    document.getElementById('power-up-display').textContent = 'Power-Up: None';
    document.getElementById('car-stats').textContent = 'Car Stats: Speed: 1.0';

    // Reset car positions
    cars.forEach((car, index) => {
        car.position.set(index * 2 - (playerCount - 1), 0.6, 0);
    });

    // Reset AI cars
    aiCars.forEach(aiCar => {
        aiCar.position.set(Math.random() * 10 - 5, 0.6, -Math.random() * 100);
    });

    // Reset power-up
    powerUp.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
}

// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

