import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function FarmCanvas3D({ game, onZoneClick }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const zonesRef = useRef({})
  const animFrameRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    // ─── 1. SCENE & CAMERA ───
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Soft sky gradient background
    scene.background = new THREE.Color(0xd9f2e6)

    // Isometric-style Perspective Camera
    const aspect = width / height
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 1000)
    camera.position.set(18, 22, 18)
    camera.lookAt(0, 0, 0)

    // ─── 2. LIGHTING ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.2)
    sunLight.position.set(20, 30, 15)
    sunLight.castShadow = true
    scene.add(sunLight)

    // Secondary fill light for soft shadows
    const fillLight = new THREE.DirectionalLight(0xbbe1fa, 0.4)
    fillLight.position.set(-15, 10, -15)
    scene.add(fillLight)

    // ─── 3. RENDERER ───
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // ─── 4. 3D FLOATING ISLAND (GROUND) ───
    const islandGroup = new THREE.Group()
    scene.add(islandGroup)

    // Top lush green grass layer (beveled hexagonal/cylinder shape)
    const islandGeo = new THREE.CylinderGeometry(8.2, 7.6, 1.2, 24)
    const islandMat = new THREE.MeshLambertMaterial({ color: 0x7cb342 })
    const islandTop = new THREE.Mesh(islandGeo, islandMat)
    islandTop.position.y = 0
    islandTop.receiveShadow = true
    islandGroup.add(islandTop)

    // Bottom dirt cliff layer
    const cliffGeo = new THREE.CylinderGeometry(7.6, 5.0, 3.2, 24)
    const cliffMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 })
    const islandCliff = new THREE.Mesh(cliffGeo, cliffMat)
    islandCliff.position.y = -2.1
    islandCliff.receiveShadow = true
    islandGroup.add(islandCliff)

    // Cute winding stone pathway
    const pathGeo = new THREE.PlaneGeometry(1.4, 1.4)
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xe0d6b9 })
    const pathPositions = [
      [0, 0.61, 0], [1.2, 0.61, 1.2], [-1.2, 0.61, -1.2],
      [-1.5, 0.61, 1.5], [1.5, 0.61, -1.5], [0, 0.61, 2.5], [0, 0.61, -2.5]
    ]
    pathPositions.forEach(([x, y, z]) => {
      const stone = new THREE.Mesh(pathGeo, pathMat)
      stone.rotation.x = -Math.PI / 2
      stone.rotation.z = Math.random() * Math.PI
      stone.scale.set(0.9 + Math.random() * 0.3, 0.9 + Math.random() * 0.3, 1)
      stone.position.set(x, y, z)
      stone.receiveShadow = true
      islandGroup.add(stone)
    })

    // Little ambient decorative trees / flowers
    const treeGeo = new THREE.ConeGeometry(0.8, 1.8, 8)
    const treeMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 })
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.6, 6)
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4e342e })

    const addTree = (x, z) => {
      const tree = new THREE.Group()
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 0.9
      const foliage = new THREE.Mesh(treeGeo, treeMat)
      foliage.position.y = 2.0
      tree.add(trunk)
      tree.add(foliage)
      tree.position.set(x, 0, z)
      islandGroup.add(tree)
    }
    addTree(-6.5, -0.5)
    addTree(6.2, 2.0)
    addTree(2.5, -6.0)
    addTree(-3.5, 5.8)

    // ─── 5. THE 6 INTERACTIVE 3D FARM LANDMARKS ───
    const zones = {}

    // 1. VƯỜN RAU (Cabbage garden)
    const cabbageGroup = new THREE.Group()
    cabbageGroup.position.set(-3.8, 0.6, -3.2)
    cabbageGroup.userData = { zone: 'cabbage' }

    // Soil plot mound
    const soilGeo = new THREE.BoxGeometry(3.6, 0.3, 3.0)
    const soilMat = new THREE.MeshLambertMaterial({ color: 0x4e342e })
    const soil = new THREE.Mesh(soilGeo, soilMat)
    soil.position.y = 0.15
    cabbageGroup.add(soil)

    // 3D Cabbage heads
    const vegGeo = new THREE.DodecahedronGeometry(0.35, 1)
    const vegMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 })
    for (let rx = -1.1; rx <= 1.1; rx += 1.1) {
      for (let rz = -0.8; rz <= 0.8; rz += 0.8) {
        const veg = new THREE.Mesh(vegGeo, vegMat)
        veg.position.set(rx, 0.45, rz)
        cabbageGroup.add(veg)
      }
    }
    // Wooden signpost
    const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }))
    signPost.position.set(1.6, 0.6, 1.2)
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.1), new THREE.MeshLambertMaterial({ color: 0xd7ccc8 }))
    signBoard.position.set(1.6, 1.0, 1.2)
    cabbageGroup.add(signPost)
    cabbageGroup.add(signBoard)

    islandGroup.add(cabbageGroup)
    zones.cabbage = cabbageGroup

    // 2. CHUỒNG TRẠI (Barn / Chicken Coop)
    const chickenGroup = new THREE.Group()
    chickenGroup.position.set(3.8, 0.6, -3.2)
    chickenGroup.userData = { zone: 'chicken' }

    // Coop body
    const coopBody = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.0, 2.4), new THREE.MeshLambertMaterial({ color: 0xd97706 }))
    coopBody.position.y = 1.0
    chickenGroup.add(coopBody)

    // Slanted straw roof
    const coopRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.2, 4), new THREE.MeshLambertMaterial({ color: 0xfef08a }))
    coopRoof.position.y = 2.5
    coopRoof.rotation.y = Math.PI / 4
    chickenGroup.add(coopRoof)

    // Little 3D Chickens
    const chkBodyGeo = new THREE.SphereGeometry(0.28, 8, 8)
    const chkMat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    const chkCombMat = new THREE.MeshLambertMaterial({ color: 0xef4444 })
    const chkBeakMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b })

    const addChicken = (cx, cz) => {
      const chk = new THREE.Group()
      const b = new THREE.Mesh(chkBodyGeo, chkMat)
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.15), chkCombMat)
      c.position.set(0, 0.3, 0.05)
      const k = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 4), chkBeakMat)
      k.rotation.x = Math.PI / 2
      k.position.set(0, 0.05, 0.3)
      chk.add(b)
      chk.add(c)
      chk.add(k)
      chk.position.set(cx, 0.28, cz)
      chickenGroup.add(chk)
    }
    addChicken(1.0, 1.6)
    addChicken(-0.8, 1.6)

    islandGroup.add(chickenGroup)
    zones.chicken = chickenGroup

    // 3. BỂ NƯỚC (Water Well / Tank)
    const waterGroup = new THREE.Group()
    waterGroup.position.set(-4.2, 0.6, 2.8)
    waterGroup.userData = { zone: 'water' }

    // Stone cylindrical well
    const wellGeo = new THREE.CylinderGeometry(1.6, 1.7, 1.4, 16)
    const wellMat = new THREE.MeshLambertMaterial({ color: 0x64748b })
    const well = new THREE.Mesh(wellGeo, wellMat)
    well.position.y = 0.7
    waterGroup.add(well)

    // Water surface
    const waterSurf = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.1, 16), new THREE.MeshLambertMaterial({ color: 0x38bdf8 }))
    waterSurf.position.y = 1.3
    waterGroup.add(waterSurf)

    // Well wooden canopy frame
    const postMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63 })
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 0.15), postMat)
    p1.position.set(-1.1, 1.8, 0)
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 0.15), postMat)
    p2.position.set(1.1, 1.8, 0)
    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.9, 0.9, 4), new THREE.MeshLambertMaterial({ color: 0x0284c7 }))
    wellRoof.position.y = 3.0
    wellRoof.rotation.y = Math.PI / 4
    waterGroup.add(p1)
    waterGroup.add(p2)
    waterGroup.add(wellRoof)

    islandGroup.add(waterGroup)
    zones.water = waterGroup

    // 4. NHÀ CHÍNH (Farm Cottage House)
    const houseGroup = new THREE.Group()
    houseGroup.position.set(4.0, 0.6, 2.8)
    houseGroup.userData = { zone: 'house' }

    // Cottage body
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.4, 2.8), new THREE.MeshLambertMaterial({ color: 0xfef3c7 }))
    houseBody.position.y = 1.2
    houseGroup.add(houseBody)

    // Pitched red roof
    const houseRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), new THREE.MeshLambertMaterial({ color: 0xe11d48 }))
    houseRoof.position.y = 2.9
    houseRoof.rotation.y = Math.PI / 4
    houseGroup.add(houseRoof)

    // Chimney with smoke
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.5), new THREE.MeshLambertMaterial({ color: 0x78716c }))
    chimney.position.set(1.1, 3.2, -0.6)
    houseGroup.add(chimney)

    // Front door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.1), new THREE.MeshLambertMaterial({ color: 0x78350f }))
    door.position.set(0, 0.6, 1.41)
    houseGroup.add(door)

    islandGroup.add(houseGroup)
    zones.house = houseGroup

    // 5. QUÁN CỦA LINH (Cafe Bakery)
    const linhGroup = new THREE.Group()
    linhGroup.position.set(-0.2, 0.6, -5.0)
    linhGroup.userData = { zone: 'linh' }

    // Stall counter
    const stall = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 1.6), new THREE.MeshLambertMaterial({ color: 0xc084fc }))
    stall.position.y = 0.6
    linhGroup.add(stall)

    // Striped awning
    const awning = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.3, 2.0), new THREE.MeshLambertMaterial({ color: 0xa855f7 }))
    awning.position.y = 2.1
    awning.rotation.x = 0.2
    linhGroup.add(awning)

    // If locked, add floating lock
    if (game.step < 6) {
      const lockMesh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.15, 8, 16), new THREE.MeshLambertMaterial({ color: 0xf59e0b }))
      lockMesh.position.set(0, 3.0, 0)
      linhGroup.add(lockMesh)
    }

    islandGroup.add(linhGroup)
    zones.linh = linhGroup

    // 6. PHIÊN CHỢ GREEN VALLEY (Festival Tent)
    const marketGroup = new THREE.Group()
    marketGroup.position.set(0.0, 0.6, 5.0)
    marketGroup.userData = { zone: 'market' }

    // Big festival tent
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.2, 8), new THREE.MeshLambertMaterial({ color: 0xf97316 }))
    tent.position.y = 1.6
    marketGroup.add(tent)

    const crateGeo = new THREE.BoxGeometry(0.7, 0.5, 0.7)
    const crateMat = new THREE.MeshLambertMaterial({ color: 0x92400e })
    const crate1 = new THREE.Mesh(crateGeo, crateMat)
    crate1.position.set(-1.4, 0.25, 1.2)
    const crate2 = new THREE.Mesh(crateGeo, crateMat)
    crate2.position.set(1.4, 0.25, 1.2)
    marketGroup.add(crate1)
    marketGroup.add(crate2)

    // If locked, add floating lock
    if (game.step < 9) {
      const lockMesh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.15, 8, 16), new THREE.MeshLambertMaterial({ color: 0xf59e0b }))
      lockMesh.position.set(0, 3.2, 0)
      marketGroup.add(lockMesh)
    }

    islandGroup.add(marketGroup)
    zones.market = marketGroup

    zonesRef.current = zones

    // ─── 6. INTERACTIVE RAYCASTING (TOUCH & CLICK) ───
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    let isDragging = false
    let startX = 0
    let startY = 0

    const onPointerDown = (e) => {
      isDragging = false
      startX = e.clientX || (e.touches && e.touches[0].clientX)
      startY = e.clientY || (e.touches && e.touches[0].clientY)
    }

    const onPointerMove = (e) => {
      const currentX = e.clientX || (e.touches && e.touches[0].clientX)
      const currentY = e.clientY || (e.touches && e.touches[0].clientY)
      if (Math.abs(currentX - startX) > 8 || Math.abs(currentY - startY) > 8) {
        isDragging = true
        // Gentle rotation of the island on drag
        islandGroup.rotation.y += (currentX - startX) * 0.0008
        startX = currentX
      }
    }

    const onPointerUp = (e) => {
      if (isDragging) return // Was dragging/rotating, not a click
      const rect = container.getBoundingClientRect()
      const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX)
      const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY)
      if (!clientX || !clientY) return

      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(islandGroup.children, true)

      if (intersects.length > 0) {
        // Find which zone parent was clicked
        let curr = intersects[0].object
        while (curr && curr.parent && curr !== islandGroup) {
          if (curr.userData && curr.userData.zone) {
            const zName = curr.userData.zone
            // 3D Jump animation
            curr.position.y += 0.6
            setTimeout(() => { if (curr) curr.position.y -= 0.6 }, 180)
            onZoneClick(zName)
            return
          }
          curr = curr.parent
        }
      }
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)

    // ─── 7. ANIMATION LOOP ───
    const startTime = performance.now()
    const animate = () => {
      const elapsed = (performance.now() - startTime) * 0.001

      // Gentle floating hover of the entire island
      islandGroup.position.y = Math.sin(elapsed * 1.5) * 0.15

      // Gentle idle sway of buildings
      if (zones.cabbage) zones.cabbage.rotation.y = Math.sin(elapsed * 2) * 0.04
      if (zones.chicken) zones.chicken.rotation.y = Math.cos(elapsed * 2) * 0.04

      renderer.render(scene, camera)
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [game.step, onZoneClick])

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '420px',
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(44, 76, 40, 0.15)',
        cursor: 'grab',
        touchAction: 'none'
      }}
    />
  )
}
