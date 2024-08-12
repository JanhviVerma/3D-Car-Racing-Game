// Scene Setup
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game-canvas').appendChild(renderer.domElement);

// Textures and Materials
let textureLoader = new THREE.TextureLoader();
let carMaterials = {
    sports: new THREE.MeshStandardMaterial({ color: 0xFF0000 }),
    classic: new THREE.MeshStandardMaterial({ color: 0x00FF00 }),
    muscle: new THREE.MeshStandardMaterial({ color: 0x0000FF }),
    default: new THREE.MeshStandardMaterial({ color: 0x888888 })
};
let trackTextures = {
    city: textureLoader.load('city.jpg'),
    desert: textureLoader.load('desert.jpg'),
    forest: textureLoader.load('forest.jpg'),
    snow: textureLoader.load('snow.jpg')
};

// Car Geometry
let carGeometry = new THREE.BoxGeometry(1, 0.5, 2);

// Car Customization Variables
let carPattern = 'solid';
let carDecal = 'none';
let carRims = 'silver';
let selectedTrack = 'city';
let selectedWeather = 'sunny';
let lapCount = 3;
let aiOpponents = 3;
let playerCount = 1;

// Create Car
function createCar(category) {
    let car = new THREE.Mesh(carGeometry, carMaterials[category] || carMaterials.default);
    scene.add(car);
    return car;
}

let cars = [];
for (let i = 0; i < playerCount; i++) {
    let car = createCar('sports');
    car.position.set(i * 2 - (playerCount - 1), 0.6, 0);
    cars.push(car);
}

let aiCars = [];
for (let i = 0; i < aiOpponents; i++) {
    let aiCar = createCar('classic');
    aiCar.position.set(Math.random() * 10 - 5, 0.6, -Math.random() * 100);
    aiCars.push(aiCar);
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
    applyWeather();
});

document.getElementById('player-count').addEventListener('input', function() {
    playerCount = parseInt(this.value);
    updatePlayerCars();
});

document.getElementById('ai-opponents').addEventListener('input', function() {
    aiOpponents = parseInt(this.value);
    updateAICars();
});

document.getElementById('lap-count').addEventListener('input', function() {
    lapCount = parseInt(this.value);
});

document.getElementById('start-button').addEventListener('click', startRace);
document.getElementById('reset-button').addEventListener('click', resetGame);

// Power-Ups
let powerUp;
function spawnPowerUp() {
    if (powerUp) scene.remove(powerUp);
    powerUp = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshStandardMaterial({ color: 0xFFFF00 })
    );
    powerUp.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
    scene.add(powerUp);
}

// Update Functions
function updatePlayerCars() {
    cars.forEach((car, index) => {
        car.position.set(index * 2 - (playerCount - 1), 0.6, 0);
    });
}

function updateAICars() {
    aiCars.forEach(aiCar => {
        scene.remove(aiCar);
    });
    aiCars = [];
    for (let i = 0; i < aiOpponents; i++) {
        let aiCar = createCar('classic');
        aiCar.position.set(Math.random() * 10 - 5, 0.6, -Math.random() * 100);
        aiCars.push(aiCar);
    }
}

function applyCarPattern() {
    // Apply pattern to car
}

function applyCarDecal() {
    // Apply decal to car
}

function applyCarRims() {
    // Apply rims to car
}

function applyWeather() {
    // Apply weather effects
}

function startRace() {
    startTime = Date.now();
    currentLap = 1;
    document.getElementById('lap-display').textContent = `Lap: ${currentLap}`;
    document.getElementById('timer-display').textContent = 'Lap Time: 00:00';
    document.getElementById('power-up-display').textContent = 'Power-Up: None';
    document.getElementById('car-stats').textContent = 'Car Stats: Speed: 1.0';
    spawnPowerUp();
}

// Save Leaderboard
function saveLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    let playerName = prompt('Enter your name:');
    let lapTime = Date.now() - startTime;
    leaderboard.push({ name: playerName, time: lapTime });
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

// Reset Game
function resetGame() {
    startTime = null;
    currentLap = 1;
    document.getElementById('lap-display').textContent = 'Lap: 1';
    document.getElementById('timer-display').textContent = 'Lap Time: 00:00';
    document.getElementById('power-up-display').textContent = 'Power-Up: None';
    document.getElementById('car-stats').textContent = 'Car Stats: Speed: 1.0';

    // Reset car positions
    updatePlayerCars();
    updateAICars();

    // Reset power-up
    if (powerUp) scene.remove(powerUp);
    spawnPowerUp();
}

// Animation
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
