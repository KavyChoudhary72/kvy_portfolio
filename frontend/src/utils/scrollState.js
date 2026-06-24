// Shared scroll state to connect GSAP ScrollTrigger to React Three Fiber useFrame loops
// This avoids React state updates and ensures 60fps rendering with 0 jitter.

const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

export const scrollState = {
  // Global scroll progress (0 to 1)
  progress: 0,
  
  // Per-section scroll progress (0 to 1)
  sections: {
    hero: 0,
    graphicDesign: 0,
    videoEditing: 0,
    contact: 0
  },
  
  // Camera targets updated dynamically by GSAP ScrollTrigger
  camera: {
    position: [0, 0, isMobileInitial ? 11.5 : 8],
    lookAt: [0, 0, 0],
    fov: 60
  },
  
  // Environment controls
  fogColor: '#050811',
  fogNear: 1,
  fogFar: 20,
  ambientIntensity: 0.4,
  directionalIntensity: 0.8
};
