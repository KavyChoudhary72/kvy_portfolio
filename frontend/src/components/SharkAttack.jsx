import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations, useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';
import { scrollState } from '../utils/scrollState';

// Video Screen viewport component using Kavy's real video edits
function VideoScreen({ url, position, rotation }) {
  const meshRef = useRef();
  
  // Load texture
  const videoTexture = useVideoTexture(url, {
    unsynchronized: true,
    muted: true,
    loop: true,
    autoplay: true,
    start: true
  });

  useFrame(() => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.48 || globalProgress >= 0.73) return; // Optimize!

    // Read progress directly in render loop
    const progress = scrollState.sections.videoEditing;
    
    // Scale down and disappear when shark bites camera (progress > 0.8)
    if (meshRef.current) {
      if (progress > 0.8) {
        meshRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[2.4, 1.35]} /> {/* 16:9 ratio */}
      <meshBasicMaterial 
        map={videoTexture} 
        side={THREE.DoubleSide}
        toneMapped={false}
      />
      {/* Sleek metallic border frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.45, 1.4]} />
        <meshBasicMaterial color="#00d2ff" transparent opacity={0.4} />
      </mesh>
    </mesh>
  );
}

// Loaded Shark model component with animations
function Shark() {
  const groupRef = useRef();
  const bitePlayedRef = useRef(false);
  
  // Load the 3D shark model
  const { scene, animations } = useGLTF('/assets/models/shark.glb');
  const { actions, names } = useAnimations(animations, groupRef);

  // Play swim animation automatically
  useEffect(() => {
    if (actions && names.length > 0) {
      const swimActionName = names.find(n => n.toLowerCase().includes('swim')) || names[0];
      if (actions[swimActionName]) {
        actions[swimActionName].reset().fadeIn(0.2).play();
      }
    }
  }, [actions, names]);

  useFrame((state, delta) => {
    const globalProgress = scrollState.progress;
    if (globalProgress < 0.48 || globalProgress >= 0.73) return; // Optimize!

    const time = state.clock.getElapsedTime();
    const progress = scrollState.sections.videoEditing;
    
    // Aggressive swim math
    // Shark swims from deep z = -16 towards the camera z = 7.5
    // At z = 7.7, its mouth completely engulfs the camera.
    const startZ = -16;
    const endZ = 7.7;
    const currentZ = THREE.MathUtils.lerp(startZ, endZ, progress);
    
    // A slight sinusoidal horizontal swing to simulate fish tail-wagging swimming motion
    const wiggle = Math.sin(time * 6) * 0.25;
    const currentX = wiggle;
    
    // Slight vertical dive/pitch motion
    const currentY = -6.0 + Math.cos(time * 3) * 0.1;

    if (groupRef.current) {
      groupRef.current.position.set(currentX, currentY, currentZ);
      
      // Face the camera directly, mouth first, tilting up/down with wiggles
      groupRef.current.rotation.y = (wiggle * 0.2); // Head pointing towards camera
      groupRef.current.rotation.z = wiggle * 0.1; // Banking
      
      // Scale up the shark mesh dynamically as it gets very close
      // This creates a highly dramatic engulfing cut where the shark swallows the camera.
      let currentScale = 0.85;
      if (progress > 0.75) {
        const scaleFactor = (progress - 0.75) / 0.25; // 0 to 1
        currentScale = 0.85 + scaleFactor * 2.8; // Scales up to 3.65x!
      }
      groupRef.current.scale.set(currentScale, currentScale, currentScale);

      // If shark is close to camera, play the bite animation
      if (progress > 0.8) {
        if (!bitePlayedRef.current) {
          const biteActionName = names.find(n => n.toLowerCase().includes('bite') || n.toLowerCase().includes('attack') || n.toLowerCase().includes('action'));
          if (biteActionName && actions[biteActionName]) {
            // Speed up bite animation for high-impact scare
            actions[biteActionName].reset().setLoop(THREE.LoopOnce);
            actions[biteActionName].timeScale = 1.8;
            actions[biteActionName].play();
            bitePlayedRef.current = true;
          }
        }
      } else {
        bitePlayedRef.current = false;
        const biteActionName = names.find(n => n.toLowerCase().includes('bite') || n.toLowerCase().includes('attack'));
        if (biteActionName && actions[biteActionName] && actions[biteActionName].isRunning()) {
          actions[biteActionName].stop();
        }
      }
    }
  });

  return (
    <primitive 
      ref={groupRef}
      object={scene} 
      castShadow
      receiveShadow
    />
  );
}

export default function SharkAttack() {
  const { camera } = useThree();
  const groupRef = useRef();
  const blackScreenRef = useRef();
  const screensGroupRef = useRef();
  const lasersGroupRef = useRef();

  useFrame((state) => {
    const globalProgress = scrollState.progress;

    // Toggle entire scene visibility via ref (fixes the mount bug!)
    if (groupRef.current) {
      groupRef.current.visible = globalProgress >= 0.48 && globalProgress < 0.73;
    }

    if (globalProgress < 0.48 || globalProgress >= 0.73) return; // Optimize!

    const progress = scrollState.sections.videoEditing;

    // Dynamic black clip cut overlay
    // When progress > 0.88, the shark has swallowed the camera.
    // We scale up a black plane directly in front of the camera (clipping plane)
    // to create a clean full black jump cut edit.
    if (blackScreenRef.current) {
      if (progress > 0.88) {
        // Position black screen right in front of camera
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const targetPos = camera.position.clone().add(dir.multiplyScalar(0.1));
        
        blackScreenRef.current.position.copy(targetPos);
        blackScreenRef.current.lookAt(camera.position);
        blackScreenRef.current.scale.set(15, 15, 1);
        
        // Full opacity black
        blackScreenRef.current.material.opacity = THREE.MathUtils.lerp(
          blackScreenRef.current.material.opacity,
          1,
          0.12
        );
      } else {
        // Hide and make transparent
        blackScreenRef.current.scale.set(0, 0, 0);
        blackScreenRef.current.material.opacity = 0;
      }
    }

    // Hide screens group as shark gets close
    if (screensGroupRef.current) {
      if (progress > 0.8) {
        screensGroupRef.current.visible = false;
      } else {
        screensGroupRef.current.visible = true;
      }
    }

    // Hide laser lines as shark gets close
    if (lasersGroupRef.current) {
      if (progress > 0.85) {
        lasersGroupRef.current.visible = false;
      } else {
        lasersGroupRef.current.visible = true;
      }
    }
  });

  // Position relative to y = -6 (Abyssal level)
  const screenLeftPos = [-3.2, -5.8, -3];
  const screenRightPos = [3.2, -5.8, -3];
  const screenCenterPos = [0, -4.2, -8];

  return (
    <group ref={groupRef}>
      {/* Ambient particles in the abyss */}
      <gridHelper args={[20, 20, '#00d2ff', '#020617']} position={[0, -8, 0]} />

      {/* Floating Anamorphic Editing Showreel Screens */}
      <group ref={screensGroupRef}>
        {/* Left Screen - plays video P5 */}
        <VideoScreen 
          url="/assets/videos/P5.mp4" 
          position={screenLeftPos} 
          rotation={[0, 0.4, 0]} 
        />
        {/* Right Screen - plays video p6 */}
        <VideoScreen 
          url="/assets/videos/p6.mp4" 
          position={screenRightPos} 
          rotation={[0, -0.4, 0]} 
        />
        {/* Top Center Screen - plays video p7 */}
        <VideoScreen 
          url="/assets/videos/p7.mp4" 
          position={screenCenterPos} 
          rotation={[0.15, 0, 0]} 
        />
      </group>

      {/* Animated 3D Shark */}
      <Shark />

      {/* Anamorphic Blue Cinematic Lens Flares / Laser Lines */}
      <group ref={lasersGroupRef}>
        <mesh position={[0, -6, -4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 10, 4]} />
          <meshBasicMaterial color="#00d2ff" transparent opacity={0.2} />
        </mesh>
        <mesh position={[0, -6.1, -4]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 10, 4]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} />
        </mesh>
      </group>

      {/* Swallowed-by-shark Black Clip Overlay */}
      <mesh ref={blackScreenRef} scale={[0, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} depthWrite={true} depthTest={true} />
      </mesh>
    </group>
  );
}

// Preload the shark model so it does not cause HMR freeze
useGLTF.preload('/assets/models/shark.glb');
