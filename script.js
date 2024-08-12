// Initial 3D Scene Setup using Three.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game').appendChild(renderer.domElement);

// Multiple Tracks with Texture Loading
let textureLoader = new THREE.TextureLoader();
let trackTextures = {
    desert: textureLoader.load('desert-track.jpg'),
    forest: textureLoader.load('forest-track.jpg'),
    city: textureLoader.load('city-track.jpg')
};

let trackMaterial = new THREE.MeshBasicMaterial();
let trackGeometry = new THREE.BoxGeometry(10, 1, 100);
let track = new THREE.Mesh(trackGeometry, trackMaterial);
scene.add(track);

// Enhanced Car Models with Patterns
let carGeometry = new THREE.BoxGeometry(1.2, 0.6, 2.5);
let carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let car1 = new THREE.Mesh(carGeometry, carMaterial);
let car2 = new THREE.Mesh(carGeometry, carMaterial);
car1.position.set(-2, 0.6, 0);
car2.position.set(2, 0.6, 0);
scene.add(car1);
scene.add(car2);

// Added lighting for better 3D effect
let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 50, 50).normalize();
scene.add(directionalLight);

// Camera position
camera.position.z = 50;

let carSpeeds = {
    sports: { car1: 0.15, car2: 0.14 },
    suv: { car1: 0.1, car2: 0.09 },
    truck: { car1: 0.08, car2: 0.07 }
};

let selectedCategory = 'sports';
let selectedTrack = 'desert';
let selectedWeather = 'sunny';
let lapCount = 3;
let carColor = '#ff0000';
let carPattern = 'solid';

document.getElementById('car-category').addEventListener('change', function() {
    selectedCategory = this.value;
});

document.getElementById('car-color').addEventListener('input', function() {
    carColor = this.value;
    car1.material.color.set(carColor);
    car2.material.color.set(carColor);
});

document.getElementById('car-pattern').addEventListener('change', function() {
    carPattern = this.value;
    applyCarPattern();
});

document.getElementById('track-choice').addEventListener('change', function() {
    selectedTrack = this.value;
    track.material.map = trackTextures[selectedTrack];
});

document.getElementById('weather-choice').addEventListener('change', function() {
    selectedWeather = this.value;
    applyWeatherEffects();
});

document.getElementById('lap-count').addEventListener('change', function() {
    lapCount = parseInt(this.value, 10);
});

document.getElementById('start-button').addEventListener('click', startRace);
document.getElementById('reset-button').addEventListener('click', resetGame);

let currentLap = 1;
let isBoostActive = false;
let startTime, lapTimer;
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Adding Obstacles and Power-Ups
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

function applyCarPattern() {
    // Example patterns, you can extend this to include more complex patterns
    switch (carPattern) {
        case 'stripes':
            car1.material.map = textureLoader.load('stripes.jpg');
            car2.material.map = textureLoader.load('stripes.jpg');
            break;
        case 'polka-dots':
            car1.material.map = textureLoader.load('polka-dots.jpg');
            car2.material.map = textureLoader.load('polka-dots.jpg');
            break;
        case 'solid':
            car1.material.map = null;
            car2.material.map = null;
            break;
    }
}

// Apply weather effects
function applyWeatherEffects() {
    switch (selectedWeather) {
        case 'sunny':
            renderer.setClearColor(0x87ceeb); // Light blue for sunny
            scene.fog = null;
            break;
        case 'rainy':
            renderer.setClearColor(0x606060); // Gray for rainy
            scene.fog = null;
            break;
        case 'foggy':
            renderer.setClearColor(0x9e9e9e); // Foggy gray
            scene.fog = new THREE.FogExp2(0x9e9e9e, 0.02);
            break;
        case 'snowy':
            renderer.setClearColor(0xffffff); // White for snowy
            scene.fog = null;
            break;
    }
}

// Start Race Function
function startRace() {
    let car1Position = 0;
    let car2Position = 0;
    let speeds = carSpeeds[selectedCategory];
    let raceInterval = setInterval(() => {
        if (Math.random() < 0.05 && !isBoostActive) {
            speeds.car1 *= 2;
            speeds.car2 *= 2;
            isBoostActive = true;
            setTimeout(() => {
                speeds.car1 /= 2;
                speeds.car2 /= 2;
                isBoostActive = false;
            }, 2000);
        }

        car1Position += Math.random() * speeds.car1;
        car2Position += Math.random() * speeds.car2;

        car1.position.z = -car1Position;
        car2.position.z = -car2Position;

        // Obstacle Collision Detection
        obstacles.forEach(obstacle => {
            if (Math.abs(car1.position.x - obstacle.position.x) < 1 && Math.abs(car1.position.z - obstacle.position.z) < 1) {
                car1Position -= 0.5;
            }
            if (Math.abs(car2.position.x - obstacle.position.x) < 1 && Math.abs(car2.position.z - obstacle.position.z) < 1) {
                car2Position -= 0.5;
            }
        });

        // Power-Up Collection
        if (Math.abs(car1.position.x - powerUp.position.x) < 1 && Math.abs(car1.position.z - powerUp.position.z) < 1) {
            speeds.car1 *= 1.5;
            powerUp.position.z = -Math.random() * 100; // Move power-up to a new position
            document.getElementById('power-up-display').textContent = 'Power-Up: Speed Boost';
        }

        // Update Lap Timer
        if (!startTime) startTime = new Date();
        let elapsedTime = new Date() - startTime;
        let seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        let minutes = Math.floor(elapsedTime / (1000 * 60));
        document.getElementById('timer-display').textContent = `Lap Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (car1Position >= 100) {
            clearInterval(raceInterval);
            currentLap++;
            if (currentLap <= lapCount) {
                document.getElementById('lap-display').textContent = 'Lap: ' + currentLap;
                car1Position = 0;
                car2Position = 0;
                startTime = null; // Reset lap timer for the next lap
            } else {
                alert('Race Finished! Car 1 Wins!');
                updateLeaderboard();
            }
        }
    }, 100);
}

// Reset Game Function
function resetGame() {
    car1.position.set(-2, 0.6, 0);
    car2.position.set(2, 0.6, 0);
    car1.material.color.set('#ff0000');
    car2.material.color.set('#ff0000');
    currentLap = 1;
    document.getElementById('lap-display').textContent = 'Lap: ' + currentLap;
    document.getElementById('timer-display').textContent = 'Lap Time: 00:00';
    document.getElementById('power-up-display').textContent = 'Power-Up: None';
}

// Update Leaderboard
function updateLeaderboard() {
    let name = prompt("Enter your name for the leaderboard:");
    let time = document.getElementById('timer-display').textContent.split(':')[1];
    let minutes = document.getElementById('timer-display').textContent.split(':')[0].split(' ')[1];
    let totalTime = parseInt(minutes) * 60 + parseInt(time);

    leaderboard.push({ name: name, time: totalTime });
    leaderboard.sort((a, b) => a.time - b.time);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    let leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';
    leaderboard.forEach(entry => {
        let listItem = document.createElement('li');
        listItem.textContent = `${entry.name}: ${Math.floor(entry.time / 60)}:${entry.time % 60}`;
        leaderboardList.appendChild(listItem);
    });
}

// Render Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
