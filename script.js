// Initial 3D Scene Setup using Three.js
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('game').appendChild(renderer.domElement);

// Track setup
let trackGeometry = new THREE.BoxGeometry(10, 1, 100);
let trackMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
let track = new THREE.Mesh(trackGeometry, trackMaterial);
scene.add(track);

// Car setup
let carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
let carMaterial1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
let carMaterial2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
let car1 = new THREE.Mesh(carGeometry, carMaterial1);
let car2 = new THREE.Mesh(carGeometry, carMaterial2);
car1.position.set(-2, 0.5, 0);
car2.position.set(2, 0.5, 0);
scene.add(car1);
scene.add(car2);

// Camera position
camera.position.z = 50;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

document.getElementById('start-button').addEventListener('click', startRace);

function startRace() {
    let car1Position = 0;
    let car2Position = 0;

    let raceInterval = setInterval(() => {
        car1Position += Math.random() * 0.1;
        car2Position += Math.random() * 0.1;

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
