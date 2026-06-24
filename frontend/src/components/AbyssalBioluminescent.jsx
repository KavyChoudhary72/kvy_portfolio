import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '../utils/scrollState';

// Procedural low-poly Majestic Blue Cyber-Whale
function CyberWhale() {
  const whaleRef = useRef();
  const leftWingRef = useRef();
  const rightWingRef = useRef();
  const tailRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.72) return; // Optimize!

    const time = state.clock.getElapsedTime();
    
    // Slow gliding movement across the background
    // Glides from X = -12 to X = 12, Z is deep (z = -6)
    if (whaleRef.current) {
      const cycle = (time * 0.05) % 1; // 20 seconds loop
      const x = -15 + cycle * 30;
      const y = -11.0 + Math.sin(time * 0.5) * 0.5; // Slow rise and fall
      const z = -7;
      
      whaleRef.current.position.set(x, y, z);
      
      // Face direction of travel (positive X)
      whaleRef.current.rotation.y = Math.PI / 2;
      whaleRef.current.rotation.x = Math.cos(time * 0.5) * 0.05; // Pitch
      
      // Slow wing/flipper flapping
      if (leftWingRef.current) {
        leftWingRef.current.rotation.z = Math.sin(time * 0.8) * 0.2;
      }
      if (rightWingRef.current) {
        rightWingRef.current.rotation.z = -Math.sin(time * 0.8) * 0.2;
      }
      
      // Slow tail wiggle
      if (tailRef.current) {
        tailRef.current.rotation.y = Math.sin(time * 1.2) * 0.15;
      }
    }
  });

  return (
    <group ref={whaleRef} scale={[1.8, 1.8, 1.8]}>
      {/* Massive whale body */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.7, 3.2, 8, 16]} />
        <meshStandardMaterial 
          color="#0d1117" 
          emissive="#003554" 
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      
      {/* Glowing Bioluminescent stripes along its back */}
      <mesh position={[0, 0.2, 0.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.05, 2.5, 0.05]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[0, 0.2, -0.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.05, 2.5, 0.05]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* Left Flipper (Wing-like) */}
      <mesh ref={leftWingRef} position={[0.7, 0.5, 0]} rotation={[0.2, 0, 0.6]}>
        <boxGeometry args={[1.5, 0.4, 0.08]} />
        <meshStandardMaterial color="#005f73" roughness={0.1} />
      </mesh>

      {/* Right Flipper (Wing-like) */}
      <mesh ref={rightWingRef} position={[-0.7, 0.5, 0]} rotation={[0.2, 0, -0.6]}>
        <boxGeometry args={[1.5, 0.4, 0.08]} />
        <meshStandardMaterial color="#005f73" roughness={0.1} />
      </mesh>

      {/* Tail Fin assembly */}
      <group ref={tailRef} position={[0, -2.2, 0]}>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.3, 0.1, 1.2, 8]} />
          <meshStandardMaterial color="#003554" roughness={0.2} />
        </mesh>
        {/* Horizontal Tail flukes */}
        <mesh position={[0, -1.0, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[2.5, 0.8]} />
          <meshStandardMaterial color="#10b981" emissive="#064e3b" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// Glowing editing timeline tracks/waveforms floating upwards in background
function BioluminescentTimeline() {
  const lineCount = 6;

  // Generate random data for line tracks
  const tracks = useMemo(() => {
    return Array.from({ length: lineCount }).map((_, idx) => {
      const points = [];
      const width = 24;
      const segmentCount = 40;
      for (let i = 0; i <= segmentCount; i++) {
        const x = -width / 2 + (i / segmentCount) * width;
        points.push(new THREE.Vector3(x, 0, 0));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      
      return {
        id: idx,
        curve,
        speed: 0.5 + Math.random() * 0.8,
        freq: 0.3 + Math.random() * 0.5,
        amp: 0.3 + Math.random() * 0.6,
        yOffset: -16 + idx * 1.5,
        color: idx % 3 === 0 ? '#10b981' : idx % 3 === 1 ? '#00d2ff' : '#8b5cf6'
      };
    });
  }, []);

  const groupRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.72) return; // Optimize!

    const time = state.clock.getElapsedTime();
    
    // Animate lines like neon oscilloscope waves
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, idx) => {
        const track = tracks[idx];
        
        // Dynamic sine wave height calculation
        const positions = mesh.geometry.attributes.position.array;
        const width = 24;
        const segmentCount = 40;
        
        for (let i = 0; i <= segmentCount; i++) {
          const x = -width / 2 + (i / segmentCount) * width;
          // Calculate animated wave heights
          const wave = Math.sin(x * track.freq + time * track.speed) * track.amp;
          
          // Modify Y position of vertex
          positions[i * 3 + 1] = wave;
        }
        mesh.geometry.attributes.position.needsUpdate = true;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {tracks.map((track) => (
        <line key={track.id} position={[0, track.yOffset, -4]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array((40 + 1) * 3), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={track.color} linewidth={2} transparent opacity={0.45} />
        </line>
      ))}
    </group>
  );
}

// 3D Neon bracket structures surrounding contact UI elements
function BioluminescentBrackets() {
  const meshRef = useRef();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.72) return; // Optimize!

    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.position.y = -12.0 + Math.sin(time) * 0.1;
      meshRef.current.rotation.y = time * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={[0, -12, 1]}>
      {/* Decorative neon background ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isMobile ? 2.5 : 4.2, isMobile ? 2.53 : 4.25, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Waveform track ticks around the circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[isMobile ? 2.6 : 4.4, isMobile ? 2.7 : 4.5, 8, 1]} />
        <meshBasicMaterial color="#00d2ff" transparent opacity={0.1} wireframe side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Individual procedurally built glowing Seahorse
function Seahorse({ position, scale, color, emissive, speedOffset }) {
  const groupRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.72) return; // Optimize!

    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Bobbing up and down gently
      groupRef.current.position.y = position[1] + Math.sin(time * 0.9 + speedOffset) * 0.35;
      // Swaying back and forth in current
      groupRef.current.rotation.z = Math.sin(time * 0.6 + speedOffset) * 0.12;
      groupRef.current.rotation.y = Math.cos(time * 0.4 + speedOffset) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Seahorse Head */}
      <mesh position={[0, 0.8, 0.1]} scale={[0.18, 0.18, 0.22]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={2.2} 
          roughness={0.15} 
          metalness={0.85} 
        />
      </mesh>
      
      {/* Seahorse Tube Snout */}
      <mesh position={[0.22, 0.75, 0.1]} rotation={[0, 0, -Math.PI / 6]} scale={[0.06, 0.26, 0.06]}>
        <cylinderGeometry args={[1, 0.8, 1, 8]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={2.0} 
          roughness={0.15} 
          metalness={0.85} 
        />
      </mesh>
      
      {/* Seahorse Head Crown */}
      <mesh position={[-0.08, 0.98, 0.1]} rotation={[0, 0, Math.PI / 4]} scale={[0.05, 0.15, 0.05]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissive} 
          emissiveIntensity={2.0} 
          roughness={0.15} 
          metalness={0.85} 
        />
      </mesh>

      {/* Seahorse Curved Body Segments */}
      <group>
        <mesh position={[0.05, 0.5, 0.1]} scale={[0.2, 0.24, 0.2]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial 
            color={color} 
            emissive={emissive} 
            emissiveIntensity={1.8} 
            roughness={0.15} 
            metalness={0.85} 
          />
        </mesh>
        <mesh position={[0.08, 0.25, 0.1]} scale={[0.18, 0.22, 0.18]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial 
            color={color} 
            emissive={emissive} 
            emissiveIntensity={1.8} 
            roughness={0.15} 
            metalness={0.85} 
          />
        </mesh>
        <mesh position={[0.03, 0.02, 0.1]} scale={[0.15, 0.18, 0.15]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial 
            color={color} 
            emissive={emissive} 
            emissiveIntensity={1.8} 
            roughness={0.15} 
            metalness={0.85} 
          />
        </mesh>
        
        {/* Curving Lower Spine */}
        <mesh position={[-0.05, -0.18, 0.1]} scale={[0.12, 0.15, 0.12]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color={color} 
            emissive={emissive} 
            emissiveIntensity={1.8} 
            roughness={0.15} 
            metalness={0.85} 
          />
        </mesh>
        
        {/* Curled Tail chain */}
        <mesh position={[-0.12, -0.34, 0.1]} scale={[0.09, 0.11, 0.09]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[-0.14, -0.48, 0.1]} scale={[0.07, 0.08, 0.07]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[-0.08, -0.55, 0.1]} scale={[0.05, 0.06, 0.05]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.8} />
        </mesh>
        <mesh position={[-0.02, -0.52, 0.1]} scale={[0.04, 0.04, 0.04]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.8} />
        </mesh>
      </group>

      {/* Tiny translucent back fin that rotates slightly */}
      <mesh position={[-0.18, 0.35, 0.1]} rotation={[0, 0, -Math.PI / 12]} scale={[0.04, 0.25, 0.02]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>

      {/* Glowing seahorse eyes */}
      <mesh position={[0.08, 0.85, 0.28]} scale={[0.035, 0.035, 0.035]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.08, 0.85, -0.08]} scale={[0.035, 0.035, 0.035]}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// A family/group of colorful glowing Seahorses floating together in the abyssal layer
function GlowingSeahorses() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const xMultiplier = isMobile ? 0.5 : 1.0;

  const seahorses = useMemo(() => {
    return [
      {
        id: 1,
        position: [-2.0 * xMultiplier, -11.5, -1.0],
        scale: isMobile ? [0.6, 0.6, 0.6] : [0.85, 0.85, 0.85],
        color: '#ff70a6', // Glowing hot pink
        emissive: '#800830',
        speedOffset: 0,
      },
      {
        id: 2,
        position: [2.2 * xMultiplier, -10.8, -1.5],
        scale: isMobile ? [0.7, 0.7, 0.7] : [1.0, 1.0, 1.0],
        color: '#00ffd2', // Glowing mint cyan
        emissive: '#005f50',
        speedOffset: 2.3,
      },
      {
        id: 3,
        position: [-0.3 * xMultiplier, -13.0, -2.0],
        scale: isMobile ? [0.55, 0.55, 0.55] : [0.75, 0.75, 0.75],
        color: '#ffd166', // Glowing neon gold
        emissive: '#7d5000',
        speedOffset: 4.6,
      },
      {
        id: 4,
        position: [3.4 * xMultiplier, -13.5, -1.2],
        scale: isMobile ? [0.6, 0.6, 0.6] : [0.8, 0.8, 0.8],
        color: '#a29bfe', // Glowing lavender
        emissive: '#3d1680',
        speedOffset: 1.5,
      }
    ];
  }, [xMultiplier, isMobile]);

  return (
    <group>
      {seahorses.map((sh) => (
        <Seahorse 
          key={sh.id}
          position={sh.position}
          scale={sh.scale}
          color={sh.color}
          emissive={sh.emissive}
          speedOffset={sh.speedOffset}
        />
      ))}
    </group>
  );
}

// 3D Glassmorphic Floating interface cards with internal glowing timeline tracks
function FloatingInterfaceCards() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const xMultiplier = isMobile ? 0.5 : 1.0;

  const cards = useMemo(() => {
    return [
      {
        id: 1,
        position: [-3.8 * xMultiplier, -11.5, -1.8],
        rotation: [0.08, 0.35, -0.04],
        scale: isMobile ? [1.3, 0.8, 1] : [1.9, 1.15, 1],
        color: '#00d2ff',
      },
      {
        id: 2,
        position: [4.0 * xMultiplier, -13.0, -2.2],
        rotation: [-0.12, -0.25, 0.08],
        scale: isMobile ? [1.2, 0.75, 1] : [1.7, 1.05, 1],
        color: '#10b981',
      },
      {
        id: 3,
        position: [-2.2 * xMultiplier, -14.0, -2.4],
        rotation: [0.04, 0.22, 0.04],
        scale: isMobile ? [1.1, 0.65, 1] : [1.6, 0.95, 1],
        color: '#8b5cf6',
      }
    ];
  }, [xMultiplier, isMobile]);

  const groupRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.72) return; // Optimize!

    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.children.forEach((mesh, idx) => {
        const card = cards[idx];
        // Dynamic drift translation
        mesh.position.y = card.position[1] + Math.sin(time * 0.5 + idx) * 0.3;
        // Wobbly dynamic rotation
        mesh.rotation.y = card.rotation[1] + Math.sin(time * 0.3 + idx) * 0.07;
        mesh.rotation.x = card.rotation[0] + Math.cos(time * 0.25 + idx) * 0.04;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {cards.map((card) => (
        <group key={card.id} position={card.position} rotation={card.rotation}>
          {/* Transparent Glass Face */}
          <mesh scale={card.scale}>
            <planeGeometry args={[1, 1]} />
            <meshPhysicalMaterial
              color={card.color}
              transparent
              opacity={0.16}
              roughness={0.15}
              metalness={0.85}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Glowing wireframe edge */}
          <mesh scale={card.scale}>
            <planeGeometry args={[1.02, 1.02]} />
            <meshBasicMaterial
              color={card.color}
              wireframe
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Internal neon timeline design elements */}
          <group scale={card.scale}>
            {Array.from({ length: 3 }).map((_, lineIdx) => (
              <mesh 
                key={lineIdx} 
                position={[0, (lineIdx - 1) * 0.24, 0.005]} 
                scale={[0.75, 0.012, 1]}
              >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial color={card.color} transparent opacity={0.35} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

export default function AbyssalBioluminescent() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.visible = scrollState.progress >= 0.72;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Moving bioluminescent timeline grids */}
      <BioluminescentTimeline />

      {/* Futuristic neon UI orbits/brackets */}
      <BioluminescentBrackets />

      {/* Glassmorphic floating interface cards */}
      <FloatingInterfaceCards />

      {/* Group of glowing Seahorses */}
      <GlowingSeahorses />

      {/* Procedural Gliding Blue Whale */}
      <CyberWhale />
    </group>
  );
}
