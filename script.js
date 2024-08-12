// Initial 3D Scene Setup using Three.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game').appendChild(renderer.domElement);

// Enhanced Track with Texture
let textureLoader = new THREE.TextureLoader();
let trackTexture = textureLoader.load('track-texture.jpg');
let trackMaterial = new THREE.MeshBasicMaterial({ map: trackTexture });
let trackGeometry = new THREE.BoxGeometry(10, 1, 100);
let track = new THREE.Mesh(trackGeometry, trackMaterial);
scene.add(track);

// Enhanced Car Models
let carGeometry = new THREE.BoxGeometry(1.2, 0.6, 2.5);
let carMaterial1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let carMaterial2 = new THREE.MeshStandardMaterial({ color: 0x0000ff });
let car1 = new THREE.Mesh(carGeometry, carMaterial1);
let car2 = new THREE.Mesh(carGeometry, carMaterial2);
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

document.getElementById('car-category').addEventListener('change', function() {
    selectedCategory = this.value;
});

function animate() {
    requestAnimationFrame(animate);
    camera.position.z = car1.position.z + 15;
    camera.lookAt(car1.position);
    renderer.render(scene, camera);
}

animate();

document.getElementById('start-button').addEventListener('click', startRace);

function startRace() {
    let car1Position = 0;
    let car2Position = 0;
    let speeds = carSpeeds[selectedCategory];

    let raceInterval = setInterval(() => {
        car1Position += Math.random() * speeds.car1;
        car2Position += Math.random() * speeds.car2;

        car1.position.z = -car1Position;
        car2.position.z = -car2Position;

        if (car1Position >= 50 || car2Position >= 50) {
            clearInterval(raceInterval);
            declareWinner(car1Position, car2Position);
        }
    }, 100);
}

function declareWinner(car1Position, car2Position) {
    if (car1Position > car2Position) {
        alert('Car 1 wins!');
    } else {
        alert('Car 2 wins!');
    }
}
