import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const canvas = document.querySelector('.experience-canvas')

// --------------------
// SCENE SETUP
// --------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
)
camera.position.set(2, 1.5, 5)

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// --------------------
// LOADERS
// --------------------
const textureLoader = new THREE.TextureLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)

// --------------------
// TEXTURES
// --------------------
const roomTexture = textureLoader.load('/models/images/textures/textureBake.webp')
roomTexture.colorSpace = THREE.SRGBColorSpace
roomTexture.flipY = false

const furnitureTexture = textureLoader.load('/models/images/textures/TextureBake2.webp')
furnitureTexture.colorSpace = THREE.SRGBColorSpace
furnitureTexture.flipY = false

// --------------------
// STORAGE
// --------------------
const books = []
const chairs = []
const interactables = []

// --------------------
// RAYCASTER
// --------------------
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

let hoveredObject = null

window.addEventListener('mousemove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
})

// --------------------
// SOCIAL LINKS
// --------------------
const socialLinks = {
  linkedin_plank_raycaster: 'https://www.linkedin.com/in/ndivhuwo-netshivhambe-0bb00a314/',
  git_hub_plank_raycaster: 'https://www.linkedin.com/in/tlhalefang-moswetsi-b98085364/',
}

// --------------------
// CLICK HANDLER
// --------------------
window.addEventListener('click', () => {
  if (!hoveredObject) return

  const key = hoveredObject.name.toLowerCase().trim()

  if (socialLinks[key]) {
    window.open(socialLinks[key], '_blank', 'noopener,noreferrer')
  }
})

// --------------------
// LOAD MODEL
// --------------------
loader.load('/models/mesh-and-textures/Room_Portfolio-v1 (1).glb', (glb) => {
  glb.scene.traverse((child) => {
    if (child.isMesh) {
      const name = child.name.toLowerCase()

      // textures
      if (name.includes('room')) {
        child.material = new THREE.MeshBasicMaterial({ map: roomTexture })
      } else {
        child.material = new THREE.MeshBasicMaterial({ map: furnitureTexture })
      }

      // books
      if (name.includes('book')) {
        books.push(child)
      }

      // chairs
      if (name.includes('chair')) {
        chairs.push(child)
      }

      // all hover/click interactables
      if (
        name.includes('book') ||
        name.includes('chair') ||
        name.includes('raycaster')
      ) {
        interactables.push(child)
      }
    }
  })

  scene.add(glb.scene)

  gsap.from(camera.position, {
    z: 8,
    duration: 1.2,
    ease: 'power3.out',
  })
})

// --------------------
// RESIZE
// --------------------
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// --------------------
// ANIMATE
// --------------------
function animate() {
  raycaster.setFromCamera(pointer, camera)

  const intersects = raycaster.intersectObjects(interactables, false)
  const newHoveredObject = intersects.length > 0 ? intersects[0].object : null

  // BOOK HOVER OPEN/CLOSE
  books.forEach((book) => {
    if (book === newHoveredObject) {
      book.rotation.y += (1.0 - book.rotation.y) * 0.1
      book.rotation.x += (0.1 - book.rotation.x) * 0.1
    } else {
      book.rotation.y += (0 - book.rotation.y) * 0.1
      book.rotation.x += (0 - book.rotation.x) * 0.1
    }
  })

  // CHAIR HOVER OPEN/CLOSE
  chairs.forEach((chair) => {
    if (chair === newHoveredObject) {
      chair.rotation.y += (0.6 - chair.rotation.y) * 0.1
      chair.rotation.x += (0.05 - chair.rotation.x) * 0.1
    } else {
      chair.rotation.y += (0 - chair.rotation.y) * 0.1
      chair.rotation.x += (0 - chair.rotation.x) * 0.1
    }
  })

  document.body.style.cursor = newHoveredObject ? 'pointer' : 'default'

  hoveredObject = newHoveredObject

  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()