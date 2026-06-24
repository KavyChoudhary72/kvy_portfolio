import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '../utils/scrollState';
import DolphinDive from './DolphinDive';
import SharkAttack from './SharkAttack';
import AbyssalBioluminescent from './AbyssalBioluminescent';

// Cinematic Camera Controller that interpolates position, target, and FOV
function CameraController() {
  const { camera } = useThree();
  const lookAtRef = useRef(new THREE.Vector3(0, 0, 0));
  const currentPos = useRef(new THREE.Vector3(0, 0, 8));

  useFrame((state, delta) => {
    const targetPos = new THREE.Vector3(...scrollState.camera.position);
    const targetLookAt = new THREE.Vector3(...scrollState.camera.lookAt);
    
    currentPos.current.lerp(targetPos, 0.05);
    lookAtRef.current.lerp(targetLookAt, 0.05);
    
    camera.position.copy(currentPos.current);
    camera.lookAt(lookAtRef.current);
    
    if (camera.fov !== scrollState.camera.fov) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, scrollState.camera.fov, 0.05);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

// Scene Fog and Lighting Controller for highly realistic ocean depth feel
function SceneEnvironment() {
  const { scene } = useThree();
  const ambientLightRef = useRef();
  const dirLightRef = useRef();

  useFrame(() => {
    scene.fog.color.set(scrollState.fogColor);
    scene.fog.near = THREE.MathUtils.lerp(scene.fog.near, scrollState.fogNear, 0.05);
    scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, scrollState.fogFar, 0.05);

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(
        ambientLightRef.current.intensity,
        scrollState.ambientIntensity,
        0.05
      );
    }
    if (dirLightRef.current) {
      dirLightRef.current.intensity = THREE.MathUtils.lerp(
        dirLightRef.current.intensity,
        scrollState.directionalIntensity,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.4} color="#e0f2fe" />
      <directionalLight 
        ref={dirLightRef} 
        position={[5, 12, 3]} 
        intensity={1.0} 
        color="#bae6fd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#00e5ff" />
      <fog attach="fog" args={[scrollState.fogColor, scrollState.fogNear, scrollState.fogFar]} />
    </>
  );
}

// Realistic volumetric sun rays filtering down through ocean water
function SunRays() {
  const raysRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    // Hide sunrays completely when deep in abyssal zone (Section 2 & 3)
    if (globalProgress > 0.50) {
      if (raysRef.current) raysRef.current.visible = false;
      return;
    }
    if (raysRef.current) raysRef.current.visible = true;

    const time = state.clock.getElapsedTime();
    if (raysRef.current) {
      raysRef.current.rotation.y = time * 0.03;
      raysRef.current.children.forEach((ray, idx) => {
        ray.rotation.z = Math.sin(time * 0.3 + idx) * 0.04;
        ray.scale.x = 1.0 + Math.sin(time * 0.5 + idx) * 0.1;
      });
    }
  });

  return (
    <group ref={raysRef} position={[0, 4, -3]}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <mesh 
          key={idx} 
          position={[(idx - 2.5) * 3.5, 0, (idx % 2 === 0 ? -1.5 : 1.5)]}
          rotation={[0.2, 0, (idx - 2.5) * 0.12]}
        >
          <coneGeometry args={[1.2, 12, 12, 1, true]} />
          <meshBasicMaterial 
            color="#00f2fe" 
            transparent 
            opacity={0.07} 
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Realistic floating bubbles that rise and drift in the ocean
function Bubbles() {
  const pointsRef = useRef();
  const particleCount = 100; // Optimize: reduce bubble count from 180 to 100

  // Programmatically generate a realistic transparent bubble texture (zero network lag)
  const bubbleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    
    // Specular highlight gradient for bubble reflection
    const grad = ctx.createRadialGradient(24, 24, 2, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.25, 'rgba(205, 245, 255, 0.65)');
    grad.addColorStop(0.75, 'rgba(120, 225, 255, 0.2)');
    grad.addColorStop(0.92, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.fill();
    
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const speedList = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16; // X
      pos[i * 3 + 1] = Math.random() * -20; // Y (entire water column)
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z
      speedList[i] = 0.8 + Math.random() * 1.5;
    }
    return [pos, speedList];
  }, []);

  useFrame((state, delta) => {
    const globalProgress = scrollState.progress;
    // Don't calculate when modal is open or scroll is at absolute bottom
    if (globalProgress > 0.95) return;

    if (pointsRef.current) {
      const arr = pointsRef.current.geometry.attributes.position.array;
      const time = state.clock.getElapsedTime();
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += speeds[i] * delta;
        arr[i * 3] += Math.sin(time * 2 + i) * 0.015;
        
        if (arr[i * 3 + 1] > -0.5) {
          arr[i * 3 + 1] = -18;
          arr[i * 3] = (Math.random() - 0.5) * 16;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={bubbleTexture}
        size={0.25} // Increased bubble size for realistic visibility
        transparent
        opacity={0.55} // Make them stand out slightly more
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating marine organic dust particles (plankton)
function MarinePlankton() {
  const pointsRef = useRef();
  const particleCount = 120; // Optimize: reduce plankton count from 200 to 120

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20 - 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress > 0.95) return;

    const time = state.clock.getElapsedTime();
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.01;
      pointsRef.current.rotation.x = Math.sin(time * 0.02) * 0.03;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#a5f3fc"
        size={0.04}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.2}
      />
    </Points>
  );
}

// Active school of colorful fish swimming in background (Aquarium feel)
// Optimized to use a SINGLE useFrame callback loop instead of 15 separate ones!
function FishSchool() {
  const groupRef = useRef();
  const fishData = useMemo(() => {
    return Array.from({ length: 10 }).map((_, idx) => ({
      id: idx,
      posOffset: idx * 1.8,
      yBase: -3 - Math.random() * 5,
      speed: 0.15 + Math.random() * 0.08,
      color: idx % 3 === 0 ? '#ff9f1c' : idx % 3 === 1 ? '#00f2fe' : '#ff5a5f'
    }));
  }, []);

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    // Hide fish school completely when scrolled to deep layers (Section 2 & 3)
    if (globalProgress > 0.52) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    if (groupRef.current) groupRef.current.visible = true;

    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((meshGroup, idx) => {
        const fish = fishData[idx];
        const radius = 6 + Math.sin(time * 0.1) * 2;
        const angle = time * fish.speed + fish.posOffset;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius - 4;
        const y = fish.yBase + Math.sin(time * 2 + fish.posOffset) * 0.4;
        
        meshGroup.position.set(x, y, z);
        meshGroup.rotation.y = -angle + Math.PI / 2;
        
        // Dynamic tail wiggle
        const bodyMesh = meshGroup.children[0];
        if (bodyMesh) {
          bodyMesh.rotation.z = Math.sin(time * 6) * 0.15;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {fishData.map((fish) => (
        <group key={fish.id}>
          {/* Fish Body */}
          <mesh castShadow>
            <coneGeometry args={[0.06, 0.3, 4]} />
            <meshStandardMaterial color={fish.color} roughness={0.1} metalness={0.7} />
          </mesh>
          {/* Tail fin */}
          <mesh position={[0, -0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshBasicMaterial color={fish.color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Seagrass field swaying at the bottom of the tropical layer
// Optimized to run under a SINGLE useFrame loop and lower poly count
function SeagrassField() {
  const groupRef = useRef();
  const grassData = useMemo(() => {
    return Array.from({ length: 18 }).map((_, idx) => ({
      id: idx,
      pos: [
        (Math.random() - 0.5) * 16,
        -7.6,
        (Math.random() - 0.5) * 10
      ],
      height: 1.2 + Math.random() * 1.8,
      color: idx % 2 === 0 ? '#1b4332' : '#2d6a4f',
      phaseOffset: Math.random() * Math.PI
    }));
  }, []);

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    // Hide seagrass when scrolled to deep layers
    if (globalProgress > 0.48) {
      if (groupRef.current) groupRef.current.visible = false;
      return;
    }
    if (groupRef.current) groupRef.current.visible = true;

    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, idx) => {
        const blade = grassData[idx];
        mesh.rotation.z = Math.sin(time * 1.5 + blade.phaseOffset) * 0.1;
        mesh.rotation.x = Math.cos(time * 1.2 + blade.phaseOffset) * 0.06;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {grassData.map((blade) => (
        <mesh key={blade.id} position={blade.pos} castShadow receiveShadow>
          <cylinderGeometry args={[0.015, 0.06, blade.height, 4, 3]} />
          <meshStandardMaterial 
            color={blade.color} 
            roughness={0.9}
            metalness={0.1}
            flatShading={true}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function SceneCanvas() {
  return (
    <div className="webgl-canvas">
      <Canvas
        shadows
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#020813']} />
        
        {/* Fog and Lights */}
        <SceneEnvironment />
        
        {/* Floating plankton particles */}
        <MarinePlankton />
        
        {/* Floating realistic bubbles */}
        <Bubbles />
        
        {/* Volumetric crepuscular light rays */}
        <SunRays />

        {/* School of background swimming fish */}
        <FishSchool />

        {/* Swaying seagrass field at bottom of surface zone */}
        <SeagrassField />
        
        {/* Camera lerps */}
        <CameraController />
        
        {/* Suspended scene elements */}
        <Suspense fallback={null}>
          {/* Scene 1: Dolphin Dive (Graphic Design) */}
          <DolphinDive />
          
          {/* Scene 2: Shark Attack (Video Editing Showreel) */}
          <SharkAttack />
          
          {/* Scene 3: Bioluminescent editing bay (Contact & Philosophy) */}
          <AbyssalBioluminescent />
        </Suspense>
      </Canvas>
    </div>
  );
}
