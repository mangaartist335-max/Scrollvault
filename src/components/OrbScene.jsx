import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { DEFAULT_ORB_CONTROLS } from '../orbControls';

function Particles({ count = 120 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      const radius = 3 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      arr[i] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.01} color="#ffffff" transparent opacity={0.18} />
    </points>
  );
}

function Aura() {
  const texture = useMemo(() => {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(125,211,252,0.35)');
    g.addColorStop(0.35, 'rgba(125,211,252,0.14)');
    g.addColorStop(0.7, 'rgba(0,0,0,0.02)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  if (!texture) return null;
  return (
    <sprite position={[0, 0, -0.75]} scale={[4.2, 4.2, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

function Orb({ controls }) {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  const scanRef = useRef(null);
  const shellARef = useRef(null);
  const shellBRef = useRef(null);
  const innerShellRef = useRef(null);
  const glintRef = useRef(null);
  const coreMatRef = useRef(null);
  const glowMatRef = useRef(null);
  const scanMatRef = useRef(null);
  const shellAMatRef = useRef(null);
  const shellBMatRef = useRef(null);
  const innerShellMatRef = useRef(null);
  const glintMatRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [rotationTarget, setRotationTarget] = useState([0, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const cssPoll = useRef(0);
  const targetAccent = useRef(new THREE.Color('#63b3ff'));
  const tmpAccent = useRef(new THREE.Color('#63b3ff'));
  const targetBoost = useRef(1);
  const boost = useRef(1);
  const glint = useRef(0);
  const scaleFactor = useRef(controls.scale);
  const glowFactor = useRef(controls.glowStrength);
  const spinFactor = useRef(controls.rotationSpeed);
  // Base orb colors - more blue than white
  const orbA = useRef(new THREE.Color('#CDEFFF')); // icy-blue core (was too white)
  const orbB = useRef(new THREE.Color('#7CCBFF')); // mid blue
  const orbC = useRef(new THREE.Color('#1E78FF')); // deeper rim blue

  const noiseTex = useMemo(() => {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 180 + Math.floor(Math.random() * 60);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    // quick blur-ish pass (cheap): draw scaled down then up
    const c2 = document.createElement('canvas');
    c2.width = 64;
    c2.height = 64;
    const ctx2 = c2.getContext('2d');
    if (ctx2) {
      ctx2.imageSmoothingEnabled = true;
      ctx2.drawImage(c, 0, 0, 64, 64);
      ctx.clearRect(0, 0, size, size);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(c2, 0, 0, size, size);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const glintTex = useMemo(() => {
    const size = 256;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    const g = ctx.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.0)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.0)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    scaleFactor.current = THREE.MathUtils.lerp(scaleFactor.current, controls.scale, 0.08);
    glowFactor.current = THREE.MathUtils.lerp(glowFactor.current, controls.glowStrength, 0.08);
    spinFactor.current = THREE.MathUtils.lerp(spinFactor.current, controls.rotationSpeed, 0.08);

    const baseSpeed = (prefersReducedMotion ? 0.06 : 0.22) * spinFactor.current;
    const pulseAmt = prefersReducedMotion ? 0.006 : 0.012;
    const hoverBoost = prefersReducedMotion ? 0.01 : 0.02;
    const pulse = 1 + Math.sin(time * 2) * pulseAmt + (hovered ? hoverBoost : 0);

    meshRef.current.rotation.y += delta * baseSpeed;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      rotationTarget[1],
      0.08,
    );
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      rotationTarget[0],
      0.08,
    );
    meshRef.current.scale.setScalar(pulse * scaleFactor.current);

    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.12;
      glowRef.current.scale.setScalar(pulse * (1.09 + (glowFactor.current - 1) * 0.1));
    }

    if (scanRef.current) {
      const alpha = 0.09 + Math.sin(time * 1.6) * 0.03;
      scanRef.current.material.opacity = Math.max(0, alpha);
      scanRef.current.rotation.y += delta * 0.08;
      scanRef.current.rotation.x += delta * 0.05;
    }

    if (shellARef.current) {
      shellARef.current.rotation.y += delta * 0.06;
      shellARef.current.scale.setScalar(pulse * (1.14 + (glowFactor.current - 1) * 0.12));
    }
    if (shellBRef.current) {
      shellBRef.current.rotation.y -= delta * 0.04;
      shellBRef.current.scale.setScalar(pulse * (1.22 + (glowFactor.current - 1) * 0.14));
    }

    // Poll CSS tokens (base colors + accent tint)
    cssPoll.current += delta;
    if (cssPoll.current > 0.25) {
      cssPoll.current = 0;
      const root = document.documentElement;
      // Base colors (--orb-a, --orb-b, --orb-c)
      const a = getComputedStyle(root).getPropertyValue('--orb-a').trim();
      const b = getComputedStyle(root).getPropertyValue('--orb-b').trim();
      const c = getComputedStyle(root).getPropertyValue('--orb-c').trim();
      if (a) {
        try {
          orbA.current.setStyle(a);
        } catch {}
      }
      if (b) {
        try {
          orbB.current.setStyle(b);
        } catch {}
      }
      if (c) {
        try {
          orbC.current.setStyle(c);
        } catch {}
      }
      // Dynamic accent tint (--orb-accent)
      const accent = getComputedStyle(root).getPropertyValue('--orb-accent').trim();
      if (accent) {
        try {
          targetAccent.current.setStyle(accent);
        } catch {}
      }
      // Boost multiplier
      const boostVal = getComputedStyle(root).getPropertyValue('--orb-boost').trim();
      if (boostVal) {
        const parsed = Number(boostVal);
        if (Number.isFinite(parsed)) targetBoost.current = Math.min(1.25, Math.max(0.9, parsed));
      }
    }

    tmpAccent.current.lerp(targetAccent.current, 0.06);
    boost.current = THREE.MathUtils.lerp(boost.current, targetBoost.current, 0.05);

    // Core material: base color from --orb-a, emissive tinted by accent
    if (coreMatRef.current) {
      coreMatRef.current.color.lerp(orbA.current, 0.08);
      const tintedEmissive = orbB.current.clone().lerp(tmpAccent.current, 0.35);
      coreMatRef.current.emissive.lerp(tintedEmissive, 0.05);
      coreMatRef.current.emissiveIntensity =
        (hovered ? 0.42 : 0.35) * boost.current * glowFactor.current;
    }
    // Glow shell: --orb-b base, tinted by accent
    if (glowMatRef.current) {
      const glowColor = orbB.current.clone().lerp(tmpAccent.current, 0.4);
      glowMatRef.current.color.lerp(glowColor, 0.08);
      glowMatRef.current.opacity = Math.min(
        0.2,
        0.08 * boost.current * (hovered ? 1.08 : 1) * glowFactor.current,
      );
    }
    // Scan shell: --orb-b base, tinted by accent
    if (scanMatRef.current) {
      const scanColor = orbB.current.clone().lerp(tmpAccent.current, 0.3);
      scanMatRef.current.color.lerp(scanColor, 0.06);
      scanMatRef.current.opacity = Math.min(
        0.13,
        (0.08 + Math.sin(time * 1.6) * 0.02) * boost.current * glowFactor.current,
      );
    }
    // Inner shell: --orb-c base, tinted by accent
    if (innerShellMatRef.current) {
      const innerColor = orbC.current.clone().lerp(tmpAccent.current, 0.25);
      innerShellMatRef.current.color.lerp(innerColor, 0.06);
      innerShellMatRef.current.opacity = Math.min(0.22, 0.14 * boost.current);
    }

    if (glint.current > 0) {
      glint.current = Math.max(0, glint.current - delta * 1.6);
      if (glintRef.current) {
        glintRef.current.position.x = Math.sin(time * 2.2) * 0.55;
        glintRef.current.position.y = Math.cos(time * 1.9) * 0.35;
        glintRef.current.position.z = 0.9;
      }
      if (glintMatRef.current) {
        glintMatRef.current.opacity = glint.current * 0.28;
      }
    } else if (glintMatRef.current) {
      glintMatRef.current.opacity = 0;
    }
  });

  const onPointerMove = (event) => {
    const { x, y } = event.pointer; // normalized -1..1
    setRotationTarget([x * 0.35, y * 0.25]);
  };

  return (
    <group>
      {/* faint dark halo so the orb reads on white */}
      <mesh scale={1.24}>
        <sphereGeometry args={[1, 96, 96]} />
        <meshBasicMaterial color="#0b0d10" transparent opacity={0.04} depthWrite={false} />
      </mesh>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          glint.current = 1;
        }}
        onPointerOut={() => setHovered(false)}
        onPointerMove={onPointerMove}
        onPointerDown={() => {
          glint.current = 1;
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, isMobile ? 80 : 128, isMobile ? 80 : 128]} />
        <meshPhysicalMaterial
          ref={coreMatRef}
          color="#f7fbff"
          emissive="#7dd3fc"
          emissiveIntensity={0.35}
          roughness={0.18}
          metalness={0.25}
          clearcoat={0.85}
          clearcoatRoughness={0.1}
          bumpMap={noiseTex ?? undefined}
          bumpScale={noiseTex ? 0.012 : 0}
        />
      </mesh>
      <sprite ref={glintRef} scale={[2.2, 1.2, 1]}>
        <spriteMaterial
          ref={glintMatRef}
          map={glintTex ?? undefined}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <mesh ref={innerShellRef} scale={1.05}>
        <sphereGeometry args={[1.01, 96, 96]} />
        <meshBasicMaterial
          ref={innerShellMatRef}
          color="#c7d2fe"
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={glowRef} scale={1.09}>
        <sphereGeometry args={[1.04, 64, 64]} />
        <meshBasicMaterial
          ref={glowMatRef}
          color="#7dd3fc"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={scanRef} scale={1.16}>
        <sphereGeometry args={[1.045, 64, 64]} />
        <meshBasicMaterial
          ref={scanMatRef}
          color="#7dd3fc"
          transparent
          opacity={0.06}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={shellARef}>
        <sphereGeometry args={[1.08, 64, 64]} />
        <meshBasicMaterial
          ref={shellAMatRef}
          color="#7dd3fc"
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={shellBRef}>
        <sphereGeometry args={[1.18, 48, 48]} />
        <meshBasicMaterial
          ref={shellBMatRef}
          color="#7dd3fc"
          transparent
          opacity={0.028}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function Lights({ prefersReducedMotion, controls }) {
  const ambientRef = useRef(null);
  const keyRef = useRef(null);
  const rimRef = useRef(null);
  const cssPoll = useRef(0);
  const targetAccent = useRef(new THREE.Color('#7dd3fc'));
  const tmpAccent = useRef(new THREE.Color('#7dd3fc'));

  useFrame((state, delta) => {
    if (prefersReducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (keyRef.current) {
      keyRef.current.position.x = 2.3 + Math.sin(t * 0.35) * 0.35;
      keyRef.current.position.y = 2.0 + Math.cos(t * 0.32) * 0.25;
    }
    if (rimRef.current) {
      rimRef.current.position.x = -2.2 + Math.cos(t * 0.28) * 0.25;
      rimRef.current.position.y = 1.2 + Math.sin(t * 0.3) * 0.18;
    }

    // Rim tint follows --orb-accent (slow, premium)
    cssPoll.current += delta;
    if (cssPoll.current > 0.35) {
      cssPoll.current = 0;
      const css = getComputedStyle(document.documentElement).getPropertyValue('--orb-accent').trim();
      if (css) {
        try {
          targetAccent.current.setStyle(css);
        } catch {
          // ignore invalid
        }
      }
    }
    tmpAccent.current.lerp(targetAccent.current, 0.05);
    if (rimRef.current) rimRef.current.color.lerp(tmpAccent.current, 0.05);
    if (ambientRef.current) {
      const target = THREE.MathUtils.lerp(0.44, 0.1, controls.ambientDarkness);
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, target, 0.08);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.28} />
      <directionalLight
        ref={keyRef}
        position={[2.3, 2.0, 2.8]}
        intensity={1.05}
        color="#ffffff"
      />
      <directionalLight position={[-1.6, 0.8, 2.2]} intensity={0.45} color="#d8dde3" />
      <directionalLight
        ref={rimRef}
        position={[-2.2, 1.2, -2.6]}
        intensity={1.35}
        color="#7dd3fc"
      />
    </>
  );
}

function Scene({ variant, controls }) {
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return (
    <>
      {/* transparent background; lane provides the white surface */}
      <Lights prefersReducedMotion={prefersReducedMotion} controls={controls} />
      <Particles count={variant === 'lane' ? 70 : 90} />
      <Aura />
      <group scale={variant === 'lane' ? 1.32 : 1}>
        <Orb controls={controls} />
      </group>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
        rotateSpeed={isMobile ? 0.45 : 0.6}
        dampingFactor={0.08}
      />
      {!isMobile && <Environment preset="city" />}
    </>
  );
}

const OrbScene = ({ variant = 'lane', controls = DEFAULT_ORB_CONTROLS }) => (
  <Canvas
    className="orb-canvas"
    style={{
      filter: `hue-rotate(${controls.tintHue}deg) blur(${controls.blurAmount}px)`,
      transition: 'filter 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
    }}
    shadows
    dpr={[1, 1.5]}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    camera={{ position: [0, 0, variant === 'lane' ? 4.9 : 4.2], fov: 45 }}
    onCreated={({ gl }) => {
      gl.outputColorSpace = THREE.SRGBColorSpace;
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.02;
      gl.setClearColor(new THREE.Color('#0b0d10'), 1);
    }}
  >
    <Suspense fallback={null}>
      <Scene variant={variant} controls={controls} />
    </Suspense>
  </Canvas>
);

export default OrbScene;

