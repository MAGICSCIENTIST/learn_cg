import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/accordion';
import * as THREE from 'three'
import Stats from 'stats.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { listenResize, dbClkfullScreen } from './utils/common'
import { Flame } from './components/flame'
import { Water } from './components/water_gun'


function drawFire() {
	// Canvas
	const canvas = document.querySelector('#mainCanvas') as HTMLCanvasElement

	// Scene
	const scene = new THREE.Scene()

	/**
	 * Particles
	 */

	// // geometry 标准
	// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
	// // geometry buffer
	// const particlesGeometry = new THREE.BufferGeometry()
	// const count = 5000
	// // const positions = new Float32Array(count * 3) // 每个点由三个坐标值组成（x, y, z）
	// const positions:any[] = [] // 每个点由三个坐标值组成（x, y, z）
	// for (let i = 0; i < count; i += 1) {
	// 	const x = (Math.random() - 0.5) * 2
	// 	const y = (Math.random() - 0.5) * 2
	// 	const z = (Math.random() - 0.5) * 2
	// 	positions.push(x, y, z)
	// }
	// // particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))	
	// particlesGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

	let flameParams: any = {
		position: [new THREE.Vector3(0, 0, 0)],
	}


	// 火点定义模式1 均匀分布
	// let n = 20
	// let step = 0.05
	// let start = new THREE.Vector3(-1, 0, -1)
	// for (let i = 0; i < n; i++) {
	// 	for (let j = 0; j < n; j++) {
	// 		flameParams.position.push(new THREE.Vector3(start.x + i * step, 0, start.z + j * step))
	// 	}
	// }

	// 火点定义模式1 随机分布1
	// let n = 30
	// let originPoint = new THREE.Vector3(0, 0, 0)
	// let r = 0.5
	// for (let i = 0; i < n; i++) {
	// 	let x = originPoint.x + r * Math.random() * Math.cos(2 * Math.PI / n * i)
	// 	let z = originPoint.z + r * Math.random() * Math.sin(2 * Math.PI / n * i)
	// 	flameParams.position.push(new THREE.Vector3(x, 0, z))		
	// }

	// 火点定义模式1 随机分布2
	let n = 120
	let originPoint = new THREE.Vector3(0, 0, 0)
	let r = 0.35
	for (let i = 0; i < n; i++) {
		let x = originPoint.x + r * Math.random() * Math.cos(2 * Math.PI / n * i)
		let z = originPoint.z + r * Math.random() * Math.sin(2 * Math.PI / n * i)
		flameParams.position.push(new THREE.Vector3(x, 0, z))
	}

	let flame = new Flame.FlameGeom(flameParams)
	flame.init()

	// material
	// const material = new THREE.PointsMaterial({
	// 	size: 0.02,
	// 	sizeAttenuation: true,
	// })
	let vs: any = document.getElementById('vertexshader')?.textContent
	let fs: any = document.getElementById('fragmentshader')?.textContent
	const material = new THREE.ShaderMaterial({

		uniforms: {
			pointTexture: { value: new THREE.TextureLoader().load('../assets/image/spark1.png') }
		},
		vertexShader: vs,
		fragmentShader: fs,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		vertexColors: true

	});
	material.blending = THREE.AdditiveBlending
	// material.color = new THREE.Color('#ffab00')
	material.transparent = true

	// const particles = new THREE.Points(sphereGeometry, material)
	const particles = new THREE.Points(flame.particlesGeometry, material)
	scene.add(particles)

	/**
	 * Lights
	 */
	// 环境光 无所谓方向
	const ambientLight = new THREE.AmbientLight('#ffffff', 0.4)
	scene.add(ambientLight)

	// Size
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	}

	// Camera
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
	camera.position.set(0, 0, 3)

	//control
	const controls = new OrbitControls(camera, canvas)
	controls.enableDamping = true
	// controls.autoRotateSpeed = 0.2
	controls.zoomSpeed = 0.3

	// Renderer
	const renderer = new THREE.WebGLRenderer({
		canvas,
	})
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	listenResize(sizes, camera, renderer)

	// Animations
	let stats: Stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.getElementById("Stats-output")?.appendChild(stats.domElement);
	const tick = () => {
		stats.begin()
		controls.update()
		requestAnimationFrame(tick)
		material.needsUpdate = true
		// geometry render
		flame.render()

		// Render
		renderer.render(scene, camera)


		stats.end()
	}

	requestAnimationFrame(tick);
}

function drawWater() {
	// Canvas
	const canvas = document.querySelector('#mainCanvas') as HTMLCanvasElement

	// Scene
	const scene = new THREE.Scene()

	/**
	 * Particles
	 */

	// // geometry 标准
	// const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
	// // geometry buffer
	// const particlesGeometry = new THREE .BufferGeometry()
	// const count = 5000
	// // const positions = new Float32Array(count * 3) // 每个点由三个坐标值组成（x, y, z）
	// const positions:any[] = [] // 每个点由三个坐标值组成（x, y, z）
	// for (let i = 0; i < count; i += 1) {
	// 	const x = (Math.random() - 0.5) * 2
	// 	const y = (Math.random() - 0.5) * 2
	// 	const z = (Math.random() - 0.5) * 2
	// 	positions.push(x, y, z)
	// }
	// // particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))	
	// particlesGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );

	// ----- water ------
	// 参数
	// ----- water ------
	let flameParams: any = {
		v: [new THREE.Vector3(3, 3, 0)],
		// a: new THREE.Vector3(0, 1, 0),
        p: [new THREE.Vector3(0, 1, 0)],

		// v: [
		// 	new THREE.Vector3(0, -3, 0),
		// 	new THREE.Vector3(0, -3, 0),
		// 	new THREE.Vector3(0, -3, 0),
		// 	new THREE.Vector3(0, -3, 0),
		// ],
		// p: [
		// 	new THREE.Vector3(0, 0, 0),
		// 	new THREE.Vector3(1, 0, 1),
		// 	new THREE.Vector3(1, 0, 0),
		// 	new THREE.Vector3(0, 0, 1)
		// ],
        ground: new THREE.Plane(new THREE.Vector3(0, 1, 0), 10),
		countPerGroup: 30,
		color: [
            new THREE.Color("#039BE5"),
            new THREE.Color("#039BE5"),            
            new THREE.Color("#F5F5F5"),

			// new THREE.Color("#FF3D00"),			
            // new THREE.Color("#EF6C00"),
        ],
        Epsilon: 1 / 100,// 越小越慢
		shake_position: 0.01,
        shake_speed: 0.1, // 越大越散开
        shake_time: 1,
        shake_size: 1
	}

	let water = new Water.WaterGun(flameParams)
	water.init()

	// material
	// const material = new THREE.PointsMaterial({
	// 	size: 0.02,
	// 	sizeAttenuation: true,
	// })
	let vs: any = document.getElementById('vertexshader')?.textContent
	let fs: any = document.getElementById('fragmentshader')?.textContent
	const material = new THREE.ShaderMaterial({

		uniforms: {
			pointTexture: { value: new THREE.TextureLoader().load('../assets/image/spark1.png') }
		},
		vertexShader: vs,
		fragmentShader: fs,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		vertexColors: true

	});
	material.blending = THREE.AdditiveBlending
	// material.color = new THREE.Color('#ffab00')
	material.transparent = true

	// const particles = new THREE.Points(sphereGeometry, material)
	const particles = new THREE.Points(water.particlesGeometry, material)
	scene.add(particles)

	/**
	 * Lights
	 */
	// 环境光 无所谓方向
	const ambientLight = new THREE.AmbientLight('#ffffff', 0.4)
	scene.add(ambientLight)

	// Size
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	}

	// Camera
	const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
	camera.position.set(0, 0, 5)	

	//control
	const controls = new OrbitControls(camera, canvas)
	controls.enableDamping = true
	// controls.autoRotateSpeed = 0.2
	controls.zoomSpeed = 0.3

	// Renderer
	const renderer = new THREE.WebGLRenderer({
		canvas,
	})
	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	listenResize(sizes, camera, renderer)

	// Animations
	let stats: Stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	document.getElementById("Stats-output")?.appendChild(stats.domElement);
	const tick = () => {
		stats.begin()
		controls.update()
		requestAnimationFrame(tick)
		material.needsUpdate = true
		// geometry render
		water.render()

		// Render
		renderer.render(scene, camera)


		stats.end()
	}

	requestAnimationFrame(tick);
}

$(function () {
	$("#accordion").accordion();
	// drawFire()
	drawWater()


});


