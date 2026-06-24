import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '../utils/scrollState';

// Loaded real fish model with animations and realistic parabolic jump physics
function RealFish({ dolphinRef }) {
  // Load the downloaded fish model
  const { scene, animations } = useGLTF('/assets/models/fish.glb');
  const { actions, names } = useAnimations(animations, dolphinRef);
  
  // Play the swim/run animation
  useEffect(() => {
    if (actions && names.length > 0) {
      // Find swim animation case-insensitively
      const swimActionName = names.find(n => n.toLowerCase().includes('swim') || n.toLowerCase().includes('run') || n.toLowerCase().includes('walk')) || names[0];
      if (actions[swimActionName]) {
        actions[swimActionName].reset().fadeIn(0.2).play();
      }
    }
  }, [actions, names]);

  useFrame((state, delta) => {
    // Read scroll progress directly from scrollState inside useFrame (fixes stale closure!)
    const progress = scrollState.sections.graphicDesign;
    const globalProgress = scrollState.progress;
    
    // Optimize: early return if Section 1 is inactive
    if (globalProgress >= 0.48) return;

    // Parabolic arc math
    // X goes from -8 to 8
    const x = -8 + progress * 16;
    
    // Y is a parabola: peak Y = 2.8 at progress = 0.5
    // water level is y = -0.8
    const y = 2.8 - 14.4 * Math.pow(progress - 0.5, 2);
    
    // Z curves slightly towards the screen
    const z = Math.sin(progress * Math.PI) * 1.5;

    // Apply translation and rotations to the fish model
    if (dolphinRef.current) {
      // Rotate fish to align with the trajectory tangent
      // DX/DP = 16, DY/DP = -28.8 * (progress - 0.5)
      const tangentX = 16;
      const tangentY = -28.8 * (progress - 0.5);
      const angle = Math.atan2(tangentY, tangentX);
      
      dolphinRef.current.position.set(x, y, z);
      
      // Rotations:
      // Pitch: rotation around Z axis based on trajectory angle
      dolphinRef.current.rotation.z = angle;
      // Yaw: facing forward (positive X)
      dolphinRef.current.rotation.y = Math.PI / 2;
      // Roll: banking slightly based on wave wiggles
      dolphinRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 3) * 0.05;
    }
  });

  return (
    <primitive 
      ref={dolphinRef} 
      object={scene} 
      scale={[0.7, 0.7, 0.7]} 
      castShadow 
      receiveShadow 
    />
  );
}

// Spawns particle splash on water entry/exit
// Decoupled from React State - reads progress and self-triggers inside useFrame!
function ParticleSplash({ type, position }) {
  const pointsRef = useRef();
  const activeRef = useRef(false);
  const timerRef = useRef(0);
  const prevProgressRef = useRef(0);
  const particleCount = 70;

  // Set particle coordinates and static velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      // Hemispherical splash velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random()); // Only upwards (0 to PI/2)
      
      const speed = 2.0 + Math.random() * 3.0;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed; // Vx
      vel[i * 3 + 1] = Math.cos(phi) * speed * 1.8; // Vy
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed; // Vz
    }
    return [pos, vel];
  }, []);

  useFrame((state, delta) => {
    const globalProgress = scrollState.progress;
    if (globalProgress >= 0.48) return; // Optimize!

    const progress = scrollState.sections.graphicDesign;
    const threshold = type === 'exit' ? 0.22 : 0.78;

    // Trigger splash active state on crossing scroll progress thresholds
    if (!activeRef.current) {
      if (prevProgressRef.current < threshold && progress >= threshold) {
        activeRef.current = true;
        timerRef.current = 0;
        
        // Reset positions to origin
        if (pointsRef.current) {
          const arr = pointsRef.current.geometry.attributes.position.array;
          for (let i = 0; i < particleCount * 3; i++) arr[i] = 0;
          pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }
    }
    prevProgressRef.current = progress;

    if (!activeRef.current) return;

    timerRef.current += delta;
    if (timerRef.current > 1.2) {
      activeRef.current = false;
      return;
    }

    if (pointsRef.current) {
      const arr = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Apply velocity and gravity
        arr[i * 3] += velocities[i * 3] * delta; // X
        arr[i * 3 + 1] += (velocities[i * 3 + 1] - 9.8 * timerRef.current) * delta; // Y with gravity
        arr[i * 3 + 2] += velocities[i * 3 + 2] * delta; // Z
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Update opacity on material directly
      pointsRef.current.material.opacity = Math.max(0, 0.85 - timerRef.current * 0.7);
    }
  });

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#bae6fd"
        size={0.12}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 3D Graphic Design Image Frame card
function DesignCard({ url, position, index }) {
  const meshRef = useRef();
  
  // Load local texture using Three TextureLoader
  const texture = useLoader(THREE.TextureLoader, url);

  // Trigger values for floating animation
  const triggerStart = 0.25 + index * 0.05;

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress >= 0.48) return; // Optimize!

    const time = state.clock.getElapsedTime();
    const scrollProgress = scrollState.sections.graphicDesign;
    
    if (meshRef.current) {
      let animProgress = 0;
      if (scrollProgress > triggerStart) {
        animProgress = Math.min((scrollProgress - triggerStart) / 0.15, 1);
      }
      
      // Floating reveal animation
      const targetY = position[1] + Math.sin(time * 1.5 + index) * 0.15; // Floating effect
      const currentY = THREE.MathUtils.lerp(-4.5, targetY, animProgress);
      
      // Interpolate scale
      const currentScale = animProgress;
      
      meshRef.current.position.y = currentY;
      meshRef.current.scale.setScalar(currentScale);
      
      // Smooth slow rotation on float
      meshRef.current.rotation.y = Math.sin(time * 0.5 + index) * 0.1 + (index % 2 === 0 ? 0.05 : -0.05);
      meshRef.current.rotation.x = Math.cos(time * 0.4 + index) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], -4.5, position[2]]} castShadow receiveShadow>
      <planeGeometry args={[1.8, 1.2]} />
      <meshStandardMaterial 
        map={texture} 
        side={THREE.DoubleSide}
        roughness={0.2}
        metalness={0.5}
      />
      {/* Decorative neon backplate */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[1.85, 1.25]} />
        <meshBasicMaterial color="#00d2ff" transparent opacity={0.3} />
      </mesh>
    </mesh>
  );
}

// Realistic Water Surface Grid with actual vertex displacement wave height calculations
function RealisticWater() {
  const waterRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress >= 0.48) return; // Optimize!

    const time = state.clock.getElapsedTime();
    if (waterRef.current) {
      const pos = waterRef.current.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        // Realistic ocean waves formula utilizing multiple frequencies
        const waveHeight = Math.sin(u * 0.4 + time * 1.2) * 0.12 + Math.cos(v * 0.3 + time * 1.0) * 0.12;
        pos.setZ(i, waveHeight);
      }
      pos.needsUpdate = true;
      waterRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <group position={[0, -0.8, 0]}>
      {/* Realistic rolling ocean waves */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[40, 40, 16, 16]} />
        <meshStandardMaterial 
          color="#052e3d" 
          roughness={0.08} 
          metalness={0.9}
          transparent
          opacity={0.8}
          flatShading={true}
        />
      </mesh>
      {/* Sub-surface grid for volumetric alignment */}
      <gridHelper args={[40, 20, '#00d2ff', '#01172a']} position={[0, -0.05, 0]} />
    </group>
  );
}

export default function DolphinDive() {
  const groupRef = useRef();
  const dolphinRef = useRef();
  
  // Splash locations
  const exitSplashPos = [-4, -0.8, 0.5];
  const entrySplashPos = [4, -0.8, 0.5];

  const cards = [
    { url: '/assets/images/book_frontpage.png', pos: [-2.5, 1.2, 0.5] },
    { url: '/assets/images/infographics.png', pos: [-0.8, 1.8, 1.0] },
    { url: '/assets/images/pamplete.png', pos: [0.9, 1.6, 0.8] },
    { url: '/assets/images/Thumbnail.png', pos: [2.5, 1.0, 0.2] }
  ];

  useFrame(() => {
    // Hide entire scene when scrolled past it
    if (groupRef.current) {
      groupRef.current.visible = scrollState.progress < 0.48;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Realistic wavy water surface */}
      <RealisticWater />
      
      {/* Real animated GLTF fish/dolphin model */}
      <RealFish dolphinRef={dolphinRef} />

      {/* Particle splashes */}
      <ParticleSplash type="exit" position={exitSplashPos} />
      <ParticleSplash type="entry" position={entrySplashPos} />

      {/* Floating Design Cards */}
      {cards.map((card, idx) => (
        <DesignCard 
          key={idx}
          url={card.url}
          position={card.pos}
          index={idx}
        />
      ))}
    </group>
  );
}

// Preload the fish model
useGLTF.preload('/assets/models/fish.glb');
