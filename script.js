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
    applyWeatherEffects();
});

document.getElementById('lap-count').addEventListener('input', function() {
    lapCount = parseInt(this.value, 10);
});

document.getElementById('ai-opponents').addEventListener('input', function() {
    aiOpponents = parseInt(this.value, 10);
    // Update AI Cars
    while (aiCars.length < aiOpponents) {
        let aiCar = createCar('classic');
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
        car.position.set((cars.length * 2) - (playerCount - 1), 0.6, 0);
        cars.push(car);
    }

    while (cars.length > playerCount) {
        let car = cars.pop();
        scene.remove(car);
    }
});

document.getElementById('start-button').addEventListener('click', function() {
    startRace();
});

document.getElementById('reset-button').addEventListener('click', function() {
    resetGame();
});

// Apply Car Pattern
function applyCarPattern() {
    // Implement pattern application
}

// Apply Car Decal
function applyCarDecal() {
    // Implement decal application
}

// Apply Car Rims
function applyCarRims() {
    // Implement rims application
}

// Apply Weather Effects
function applyWeatherEffects() {
    // Implement weather effects
}

// Start Race Function
let raceInterval;
let startTime = null;
let currentLap = 1;
let track = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ map: trackTextures[selectedTrack] })
);
track.rotation.x = -Math.PI / 2;
scene.add(track);

function startRace() {
    if (raceInterval) clearInterval(raceInterval);

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
    if (powerUp) scene.remove(powerUp);
    powerUp = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshStandardMaterial({ color: 0xFFFF00 })
    );
    powerUp.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
    scene.add(powerUp);

    // Start race timer
    raceInterval = setInterval(() => {
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
    if (powerUp) scene.remove(powerUp);
    powerUp = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshStandardMaterial({ color: 0xFFFF00 })
    );
    powerUp.position.set(Math.random() * 10 - 5, 0.5, -Math.random() * 100);
    scene.add(powerUp);
}

// Animate
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
