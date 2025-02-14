import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

/**
 * Base
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null
const hearts = []
const numHearts = 180
const spreadRange = 100
const heartRadius = 30 // Radius of the spherical distribution

// Create random hearts
for (let i = 0; i < numHearts; i++) {
  gltfLoader.load('/models/Heart.glb', (gltf) => {
    const heart = gltf.scene
    // Random spherical distribution
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    heart.position.set(
      heartRadius * Math.sin(phi) * Math.cos(theta),
      heartRadius * Math.sin(phi) * Math.sin(theta),
      heartRadius * Math.cos(phi) - spreadRange / 20
    )
    heart.scale.set(
      Math.random() * 2 + 0.5,
      Math.random() * 2 + 0.5,
      Math.random() * 2 + 0.5
    )
    scene.add(heart)
    hearts.push(heart)
  })
}

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/8.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Flower and Text Group
 */
const flowerTextGroup = new THREE.Group() // Group to hold the flower and text

// Flower
textureLoader.load(
  '/textures/test.png',
  (texture) => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    })

    const geometry = new THREE.PlaneGeometry(5, 5)
    const plane = new THREE.Mesh(geometry, material)

    // Add the flower to the group
    flowerTextGroup.add(plane)
    plane.position.set(0, -6.9, 0) // Position the flower relative to the group
    // plane.rotation.x = Math.PI / 2 // Rotate the flower to face the camera

    console.log('Flower added to group:', plane)
  },
  undefined, // Progress callback (optional)
  (error) => {
    console.error('Error loading Flower.png:', error)
  }
)

/**
 * Fonts
 */
const fontLoader = new FontLoader()
let textGroup = new THREE.Group() // Group to hold all text lines

fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
  // Material
  const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

  // Text
  const lines = [
    'Maman',
    'Apsveicu',
    'Tevi',
    'Valentindiena',
    'PS: Maman ei Bezdet!!!',
    'Atbildot uz tavu jautajumu,',
    'Talab, kad gribu sutit BEZDET!!!',
  ]

  // Vertical spacing between lines
  const lineHeight = 1.5

  // Create and position each line of the text
  lines.forEach((line, index) => {
    const textGeometry = new TextGeometry(line, {
      font: font,
      size: 0.5,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    })
    textGeometry.center()

    const text = new THREE.Mesh(textGeometry, material)
    text.position.set(0, -index * lineHeight, 0)
    textGroup.add(text)
  })

  // Add the text group to the flower-text group
  flowerTextGroup.add(textGroup)

  // Position the text group relative to the flower
  textGroup.position.set(0, 5, 0) // Adjust position as needed

  // Add the flower-text group to the scene
  scene.add(flowerTextGroup)

  console.log('Flower and text group added to scene:', flowerTextGroup)
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
)
camera.position.set(0, 0, 10) // Position the camera far back
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  // alpha: true, // Enable transparency
  // antialias: true, // Improve rendering quality
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Rotate all hearts
  hearts.forEach((heart) => {
    heart.rotation.y += deltaTime * 0.5
  })

  // Animate the flower-text group
  if (flowerTextGroup) {
    flowerTextGroup.position.y += deltaTime // Move the group upward
    flowerTextGroup.position.z -= deltaTime // Move the group away from the camera
    flowerTextGroup.scale.set(
      1 + elapsedTime * 0.02,
      1 + elapsedTime * 0.02,
      1 + elapsedTime * 0.02
    ) // Scale up to simulate moving away
  }

  controls.update()
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}
tick()
