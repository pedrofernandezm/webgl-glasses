const THREE = require('three');
const OrbitControls = require('three-orbitcontrols');
import './style.css';

function main() {
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	const { innerHeight: height, innerWidth: width } = window;

	renderer.setClearColor(0xaaaaaa);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);

	const scene = new THREE.Scene();

	const camera = new THREE.PerspectiveCamera(80, width / height, 0.5, 2000);
	camera.position.set(10, 10, 10);
	camera.lookAt(0, 0, 0);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.minDistance = 5;
	controls.maxDistance = 20;

	{
		const light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(10, 5, 5);
		scene.add(light);

		const lightHelper = new THREE.DirectionalLightHelper(light);
		scene.add(lightHelper);
	}
	let cube;
	{
		const geometry = new THREE.BoxGeometry(3, 3, 3);
		const material = new THREE.MeshStandardMaterial({ color: 0x15adcf });
		cube = new THREE.Mesh(geometry, material);

		cube.position.y = 1.5;

		scene.add(cube);
	}

	{
		const geometry = new THREE.PlaneBufferGeometry(50, 50);
		const material = new THREE.MeshPhongMaterial({ color: 0xcc8866 });
		const mesh = new THREE.Mesh(geometry, material);
		mesh.rotation.x = Math.PI * -0.5;
		scene.add(mesh);
	}

	{
		var axesHelper = new THREE.AxesHelper(5);
		scene.add(axesHelper);
	}

	function render() {
    cube.rotation.y += 0.01;
    controls.update();
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}

	document.body.appendChild(renderer.domElement);

	requestAnimationFrame(render);
}

main();
