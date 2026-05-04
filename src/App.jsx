import * as THREE from 'three'
import React, { Suspense, useEffect, useRef, useState, useCallback, useLayoutEffect, forwardRef, useMemo } from 'react'
import { Canvas, useThree, useFrame, useLoader, extend } from '@react-three/fiber'
import { Flex, Box, useFlexSize } from '@react-three/flex'
import { Loader, Line, useAspect, CubeCamera, Float, MeshReflectorMaterial, shaderMaterial, Html } from '@react-three/drei'
import { EffectComposer, GodRays, Bloom } from '@react-three/postprocessing'
import { easing } from 'maath'
import Effects from './components/Effects'
import Text from './components/Text'
import Geo from './components/Geo'
import state from './state'
import Header from './components/Header'
import AuthModal from './components/AuthModal'

// État global partagé
const hoverState = { active: false }

// ── Video shader ──────────────────────────────────────────────────────────────
const VideoFadeMaterial = shaderMaterial(
  { tex1: null, tex2: null, factor: 0 },
  `varying vec2 vUv;
   void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  `uniform sampler2D tex1; uniform sampler2D tex2; uniform float factor; varying vec2 vUv;
   void main() { vec4 c1=texture2D(tex1,vUv); vec4 c2=texture2D(tex2,vUv); gl_FragColor=mix(c1,c2,factor); }`
)
extend({ VideoFadeMaterial })

const playlist = ['/Picts_screen/4.mp4', '/Picts_screen/1.mp4', '/Picts_screen/7.mp4', '/Picts_screen/5.mp4', '/Picts_screen/6.mp4', '/Picts_screen/3.mp4', '/Picts_screen/2.mp4']

// ── Emitter ───────────────────────────────────────────────────────────────────
const Emitter = forwardRef((props, ref) => {
  const [playlistIndex, setPlaylistIndex] = useState(0)
  const [factor, setFactor] = useState(0)
  const [targetFactor, setTargetFactor] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const video1 = useMemo(() => Object.assign(document.createElement('video'), { crossOrigin: 'Anonymous', muted: true }), [])
  const video2 = useMemo(() => Object.assign(document.createElement('video'), { crossOrigin: 'Anonymous', muted: true }), [])
  const tex1 = useMemo(() => new THREE.VideoTexture(video1), [video1])
  const tex2 = useMemo(() => new THREE.VideoTexture(video2), [video2])
  const matRef = useRef()

  useEffect(() => { tex1.colorSpace = THREE.SRGBColorSpace; tex2.colorSpace = THREE.SRGBColorSpace }, [tex1, tex2])
  useEffect(() => { video1.src = playlist[0]; video1.play() }, [video1])

  useEffect(() => {
    const onEnded1 = () => {
      const next = (playlistIndex + 1) % playlist.length
      video2.src = playlist[next]; video2.play()
      setTargetFactor(1); setIsTransitioning(true); setPlaylistIndex(next)
    }
    const onEnded2 = () => {
      const next = (playlistIndex + 1) % playlist.length
      video1.src = playlist[next]; video1.play()
      setTargetFactor(0); setIsTransitioning(true); setPlaylistIndex(next)
    }
    video1.addEventListener('ended', onEnded1)
    video2.addEventListener('ended', onEnded2)
    return () => { video1.removeEventListener('ended', onEnded1); video2.removeEventListener('ended', onEnded2) }
  }, [playlistIndex, video1, video2])

  useFrame((_, delta) => {
    if (!isTransitioning) return
    const diff = targetFactor - factor
    const step = Math.sign(diff) * delta
    const newFactor = Math.abs(diff) < Math.abs(step) ? targetFactor : factor + step
    setFactor(newFactor)
    if (matRef.current) matRef.current.factor = newFactor
    if (newFactor === targetFactor) setIsTransitioning(false)
  })

  return (
    <mesh ref={ref} position={[0, 0, -16]} {...props}>
      <planeGeometry args={[16, 10]} />
      <videoFadeMaterial ref={matRef} tex1={tex1} tex2={tex2} factor={factor} transparent />
      <mesh scale={[16.05, 10.05, 1]} position={[0, 0, -0.01]}>
        <planeGeometry /><meshBasicMaterial color="black" />
      </mesh>
    </mesh>
  )
})

function VideoScreen() {
  const [material, set] = useState()
  return (
    <>
      <Emitter ref={set} />
      {material && (
        <EffectComposer multisampling={8}>
          <GodRays sun={material} exposure={0.34} decay={0.8} blur />
          <Bloom luminanceThreshold={0} mipmapBlur luminanceSmoothing={0.0} intensity={1} />
        </EffectComposer>
      )}
    </>
  )
}

function VideoRig() {
  useFrame((state, delta) => {
    easing.damp3(
      state.camera.position,
      [5 + state.pointer.x, state.pointer.y, 18 + Math.atan2(state.pointer.x, state.pointer.y) * 2],
      0.4, delta
    )
    state.camera.lookAt(0, 0, 0)
  })
}

const VideoFloor = () => (
  <mesh position={[0, -5.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[50, 50]} />
    <MeshReflectorMaterial blur={[300, 50]} resolution={1024} mixBlur={1} mixStrength={100}
      roughness={1} depthScale={1.2} minDepthThreshold={0.4} maxDepthThreshold={1.4}
      color="#202020" metalness={0.8} />
  </mesh>
)

// ── Scroll scene components ───────────────────────────────────────────────────
function HeightReporter({ onReflow }) {
  const size = useFlexSize()
  useLayoutEffect(() => onReflow && onReflow(...size), [onReflow, size])
  return null
}

function VideoMesh({ src, width, height }) {
  const texture = useMemo(() => {
    const vid = document.createElement('video')
    vid.src = src
    vid.crossOrigin = 'Anonymous'
    vid.loop = true
    vid.muted = true
    vid.autoplay = true
    vid.play()
    return new THREE.VideoTexture(vid)
  }, [src])

  return (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function HoverButton({ left }) {
  const [hovered, setHovered] = useState(false)
  const timeoutRef = useRef(null)
  const [vidIndex, setVidIndex] = useState(0)
  const playlist = ['/Vids/vid1.mp4', '/Vids/vid2.mp4', '/Vids/vid4.mp4']

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current)
    setHovered(true)
    hoverState.active = true
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHovered(false)
      hoverState.active = false
    }, 200)
  }

  return (
    <Html position={[-4, -15, 0]} center style={{ pointerEvents: 'all' }}>
      <div style={{ position: 'relative' }}>

        {/* Bouton */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            padding: '50px 300px',
            borderRadius: '20px',
            background: hovered ? 'rgba(255,255,255,0.35)' : 'rgba(180,180,180,0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(200,200,200,0.4)',
            color: hovered ? '#111' : '#666',
            fontSize: '18px',
            fontWeight: 500,
            fontFamily: 'sans-serif',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            letterSpacing: '0.03em',
            userSelect: 'none',
            position: 'relative',
            zIndex: 2,
          }}>
          En savoir plus
        </div>

        {/* Panel hover */}
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: 'absolute',
            bottom: '-300px',          // ← au dessus du bouton
            left: '-70%',              // ← centré par rapport au bouton
            transform: 'translateX(-50%)',  // ← centrage parfait
            width: '900px',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: '0 30px 80px rgba(0,0,0,0.15)',
            border: '1px solid rgba(200,200,200,0.3)',
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? 'all' : 'none',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
            transform: hovered
              ? 'translateX(-50%) translateY(0px)'
              : 'translateX(-50%) translateY(12px)',
            zIndex: 999,
          }}>

          {/* Vidéo gauche */}
          <div style={{
            width: '45%', position: 'relative',
            minHeight: '800px', background: '#111', flexShrink: 0,
          }}>
            <video 
              src={playlist[vidIndex]} 
              autoPlay 
              muted 
              playsInline
              onEnded={() => setVidIndex((prev) => (prev + 1) % playlist.length)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                position: 'absolute', inset: 0, opacity: 0.85,
              }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
              padding: '24px', display: 'flex', alignItems: 'flex-end',
            }}>
              <p style={{
                color: 'white', fontSize: '18px', fontWeight: 700,
                fontFamily: 'sans-serif', lineHeight: 1.4, margin: 0,
              }}>
                Un futur énergétique<br />incertain et complexe
              </p>
            </div>
          </div>

          {/* Texte blur droite */}
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '32px 28px',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', gap: '16px',
          }}>
            <p style={{
              fontSize: '13px', color: '#444',
              lineHeight: 1.7, margin: 0, fontFamily: 'sans-serif',
            }}>
              La variabilité climatique, la croissance de la demande et la complexité des réseaux rendent la gestion énergétique de plus en plus difficile.
            </p>
            {['Demande imprévisible', 'Impact du climat', 'Coûts opérationnels élevés', 'Risque de déséquilibre du réseau'].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                fontSize: '13px', fontFamily: 'sans-serif', color: '#222', fontWeight: 500,
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  background: 'rgba(50,180,100,0.15)',
                  border: '1.5px solid rgba(50,180,100,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#2eb866" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Html>
  )
}

function Page({ text, tag, images, subtitle, textScaleFactor, onReflow, left = false, ...props }) {
  const textures = useLoader(THREE.TextureLoader, images && images.length > 0 ? images : ['/images/chatn.png'])
  const { viewport } = useThree()
  const boxProps = {
    centerAnchor: true, grow: 1, marginTop: 1,
    marginLeft: left * 1, marginRight: !left * 1,
    width: 'auto', height: 'auto',
    minWidth: 3, minHeight: 3, maxWidth: 6, maxHeight: 6,
  }
  const items = props.videos && props.videos.length > 0 ? props.videos : null

  return (
    <Box dir="column" align={left ? 'flex-start' : 'flex-end'} justify="flex-start" width="100%" height="auto" minHeight="100%">
      <HeightReporter onReflow={onReflow} />
      <Box dir="row" width="100%" height="auto" justify={left ? 'flex-end' : 'flex-start'} margin={0} grow={1} wrap="wrap">
        {items
          ? items.map((src, index) => (
            <Box key={index} {...boxProps}>
              {(width, height) => (
                <VideoMesh src={src} width={width} height={height} />
              )}
            </Box>
          ))
          : textures.map((texture, index) => (
            <Box key={index} {...boxProps}>
              {(width, height) => (
                <mesh>
                  <planeGeometry args={[width, height]} />
                  <meshBasicMaterial map={texture} toneMapped={false} />
                </mesh>
              )}
            </Box>
          ))
        }
        {tag === '00' && (
          <Box centerAnchor width={5} height={6} marginLeft={1} marginRight={0} alignSelf="center">
            {() => <HoverButton left={left} />}
          </Box>
        )}
      </Box>
      <Box marginLeft={1.5} marginRight={1.5} marginTop={2}>
        <Text position={[left ? 1 : -1, 0.5, 1]} fontSize={textScaleFactor} lineHeight={1} letterSpacing={-0.05} maxWidth={(viewport.width / 4) * 3}>
          {tag}
          <meshBasicMaterial color="#cccccc" toneMapped={false} />
        </Text>
      </Box>
      <Box marginLeft={left ? 1.5 : 1} marginRight={left ? 1 : 1.5} marginBottom={1}>
        <Text bold position-z={0.5} textAlign={left ? 'left' : 'right'}
          fontSize={1.5 * textScaleFactor} lineHeight={1} letterSpacing={-0.05}
          color="black" maxWidth={(viewport.width / 4) * 3}>
          {text}
        </Text>
      </Box>
    </Box>
  )
}

function Layercard({ depth, boxWidth, boxHeight, text, textColor, color, map, textScaleFactor }) {
  const ref = useRef()
  const { viewport, size } = useThree()
  const pageLerp = useRef(state.top / size.height)
  useFrame(() => {
    const page = (pageLerp.current = THREE.MathUtils.lerp(pageLerp.current, state.top / size.height, 0.15))
    if (depth >= 0) ref.current.opacity = page < state.threshold * 1.7 ? 1 : 1 - (page - state.threshold * 1.7)
  })
  return (
    <>
      <mesh position={[boxWidth / 2, -boxHeight / 2, depth]}>
        <planeGeometry args={[boxWidth, boxHeight]} />
        <meshBasicMaterial ref={ref} color={color} map={map} toneMapped={false} transparent opacity={1} />
      </mesh>
      <Text bold position={[boxWidth / 2, -boxHeight / 2, depth + 1.5]}
        maxWidth={(viewport.width / 4) * 1} anchorX="center" anchorY="middle"
        fontSize={0.6 * textScaleFactor} lineHeight={1} letterSpacing={-0.05} color={textColor}>
        {text}
      </Text>
    </>
  )
}

function ScrollContent({ onReflow }) {
  const group = useRef()
  const { viewport, size } = useThree()
  const [bW, bH] = useAspect(1920, 1920, 0.5)
  const texture = useLoader(THREE.TextureLoader, state.depthbox[0].image)
  const vec = new THREE.Vector3()
  const pageLerp = useRef(state.top / size.height)
  useFrame(() => {
    const scrollOffset = Math.max(0, state.top - size.height)
    const page = (pageLerp.current = THREE.MathUtils.lerp(pageLerp.current, scrollOffset / size.height, 0.15))
    const y = page * viewport.height
    const sticky = state.threshold * viewport.height
    group.current.position.lerp(vec.set(0, page < state.threshold ? y : sticky, page < state.threshold ? 0 : page * 1.25), 0.15)
  })
  const handleReflow = useCallback((w, h) => onReflow((state.pages = h / viewport.height + 5.5)), [onReflow, viewport.height])
  const sizesRef = useRef([])
  const scale = Math.min(1, viewport.width / 16)
  return (
    <group ref={group}>
      <Flex dir="column" position={[-viewport.width / 2, viewport.height / 2, 0]} size={[viewport.width, viewport.height, 0]} onReflow={handleReflow}>
        {state.content.map((props, index) => (
          <Page key={index} left={!(index % 2)} textScaleFactor={scale}
            onReflow={(w, h) => {
              sizesRef.current[index] = h
              state.threshold = Math.max(4, (4 / (15.8 * 3)) * sizesRef.current.reduce((acc, e) => acc + e, 0))
            }}
            {...props} />
        ))}
        <Box dir="row" width="100%" height="100%" align="center" justify="center">
          <Box centerAnchor>
            {state.lines.map((props, index) => <Line key={index} {...props} />)}
            <Text bold position-z={0.5} anchorX="center" anchorY="middle"
              fontSize={1.5 * scale} lineHeight={1} letterSpacing={-0.05}
              color="black" maxWidth={(viewport.width / 4) * 3}>
              {state.depthbox[0].text}
            </Text>
          </Box>
        </Box>
        <Box dir="row" width="100%" height="100%" align="center" justify="center">
          <Box>
            <Layercard {...state.depthbox[0]} text={state.depthbox[1].text} boxWidth={bW} boxHeight={bH} map={texture} textScaleFactor={scale} />
            <Geo position={[bW / 2, -bH / 2, state.depthbox[1].depth]} />
          </Box>
        </Box>
      </Flex>
    </group>
  )
}

function ScrollOverlay({ pages, setPages }) {
  const opacity = useRef(0)
  const divRef = useRef()

  useEffect(() => {
    let animFrame
    const loop = () => {
      const threshold = window.innerHeight * 0.8
      const target = state.top > threshold ? 1 : 0
      opacity.current += (target - opacity.current) * 0.7
      if (divRef.current) divRef.current.style.opacity = opacity.current
      animFrame = requestAnimationFrame(loop)
    }
    animFrame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  return (
    <div ref={divRef} style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 1, opacity: 0, transition: 'none',
      backgroundColor: '#f5f5f5',
    }}>
      <Canvas shadows dpr={[1, 2]}
        camera={{ position: [0, 0, 10], far: 1000 }}
        gl={{ powerPreference: 'high-performance', alpha: false, antialias: false, stencil: false, depth: false }}
        onCreated={({ gl }) => gl.setClearColor('#f5f5f5')}>
        <pointLight position={[-10, -10, -10]} intensity={1} />
        <ambientLight intensity={0.4} />
        <spotLight castShadow angle={0.3} penumbra={1} position={[0, 10, 20]}
          intensity={5} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <Suspense fallback={null}>
          <ScrollContent onReflow={setPages} />
        </Suspense>
        <Effects />
      </Canvas>
    </div>
  )
}

function HeroText() {
  const [opacity, setOpacity] = useState(1)
  useEffect(() => {
    let animFrame
    const loop = () => {
      const o = Math.max(0, 1 - state.top / (window.innerHeight * 0.5))
      setOpacity(o)
      animFrame = requestAnimationFrame(loop)
    }
    animFrame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrame)
  }, [])
  return (
    <div style={{
      position: 'fixed', top: '52%', left: '-7%',
      transform: 'translateY(-50%)',
      zIndex: 50, pointerEvents: 'none', opacity,
    }}>
      <img src="/images/hero-text.png" alt="E-Optima"
        style={{ width: 'clamp(600px, 60vw, 1000px)', objectFit: 'contain' }} />
    </div>
  )
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const targetScroll = useRef(0)
  const currentScroll = useRef(0)
  const [pages, setPages] = useState(0)
  const [showScroll, setShowScroll] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  // Tout le scroll est géré ici via wheel
  useEffect(() => {
    let animFrame

    const onWheel = (e) => {
      if (hoverState.active) return  // bloque si hover actif
      targetScroll.current = Math.max(0, targetScroll.current + e.deltaY)
      if (targetScroll.current > 50) setShowScroll(false)
      else setShowScroll(true)
    }

    window.addEventListener('wheel', onWheel, { passive: true })

    const loop = () => {
      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.7
      state.top = currentScroll.current
      animFrame = requestAnimationFrame(loop)
    }
    animFrame = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(animFrame)
    }
  }, [])

  return (
    <>
      <Header onAccountClick={() => setShowAuth(true)} />
      <HeroText />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Div pour pointer move uniquement — pas de scroll ici */}
      <div
        onPointerMove={(e) => (state.mouse = [(e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1])}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh',
          zIndex: 100, pointerEvents: 'none',
        }} />

      {/* Video scene */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 30], fov: 35, near: 1, far: 60 }} gl={{ antialias: false }}>
          <color attach="background" args={['#050505']} />
          <ambientLight />
          <VideoScreen />
          <Float rotationIntensity={3} floatIntensity={3} speed={1}>
            <CubeCamera position={[-3, -1, -5]} resolution={256} frames={Infinity}>
              {(texture) => (
                <mesh>
                  <sphereGeometry args={[2, 32, 32]} />
                  <meshStandardMaterial metalness={1} roughness={0.1} envMap={texture} />
                </mesh>
              )}
            </CubeCamera>
          </Float>
          <VideoFloor />
          <VideoRig />
        </Canvas>
      </div>

      {/* Scroll scene */}
      <ScrollOverlay pages={pages} setPages={setPages} />

      {/* Scroll hint */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase',
        opacity: showScroll ? 0.6 : 0, transition: 'opacity 0.5s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        pointerEvents: 'none', zIndex: 200, fontFamily: 'sans-serif'
      }}>
        <span>Scroll</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path d="M8 0v20M1 13l7 7 7-7" stroke="white" strokeWidth="1.5" />
        </svg>
      </div>

      <Loader />
    </>
  )
}
