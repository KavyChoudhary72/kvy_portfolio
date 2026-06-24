import React, { useEffect, useState, Suspense } from 'react';
import { useProgress } from '@react-three/drei';
import SceneCanvas from './components/SceneCanvas';
import PortfolioContent from './components/PortfolioContent';
import { scrollState } from './utils/scrollState';

// Custom Sleek Loader Overlay
function Loader() {
  const { active, progress } = useProgress();
  const [fading, setFading] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active && progress === 100) {
      setFading(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  if (!visible) return null;

  return (
    <div className={`loader-overlay ${fading ? 'fade-out' : ''}`}>
      <div className="loader-title">KAVY CHOUDHARY</div>
      <div className="loader-bar-container">
        <div className="loader-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="loader-text">
        {progress < 100 ? `LOADING AQUARIUM ${Math.round(progress)}%` : 'READY FOR CUT'}
      </div>
    </div>
  );
}

// Full Screen Cinematic Project Modal
function ProjectModal({ project, onClose }) {
  if (!project) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(2, 4, 12, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      cursor: 'pointer'
    }}>
      {/* Modal Close Button */}
      <button onClick={onClose} style={{
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        background: 'none',
        border: 'none',
        color: '#ffffff',
        fontSize: '2.5rem',
        cursor: 'pointer',
        transition: 'color 0.2s',
      }} className="close-modal-btn">✕</button>

      {/* Modal Card Content Container */}
      <div className="modal-content-card" onClick={e => e.stopPropagation()} style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        cursor: 'default',
        textAlign: 'center'
      }}>
        <span style={{
          fontFamily: 'Syncopate, sans-serif',
          fontSize: '0.8rem',
          color: '#00d2ff',
          letterSpacing: '0.3em',
          textTransform: 'uppercase'
        }}>{project.tag}</span>
        
        <h2 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '2.5rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          margin: 0,
          color: '#ffffff'
        }}>{project.title}</h2>

        {/* Render Image or Video */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxHeight: '65vh',
          display: 'flex',
          justifyContent: 'center',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 210, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {project.type === 'image' ? (
            <img 
              src={project.url} 
              alt={project.title} 
              style={{
                maxWidth: '100%',
                maxHeight: '65vh',
                objectFit: 'contain'
              }} 
            />
          ) : (
            <video 
              src={project.url} 
              controls 
              autoPlay 
              style={{
                width: '100%',
                maxHeight: '65vh',
                backgroundColor: '#000000'
              }} 
            />
          )}
        </div>

        <p style={{
          maxWidth: '650px',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          color: '#9ca3af',
          margin: 0
        }}>{project.desc}</p>
      </div>
    </div>
  );
}

function App() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [swallowOpacity, setSwallowOpacity] = useState(0);

  useEffect(() => {
    // High-performance window scroll listener - 100% robust, dynamic water blue colors
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;

      scrollState.progress = progress;

      // Map progress to water blue environments:
      // Hero: 0% - 25% (Vibrant turquoise blue)
      // Graphic Design: 25% - 50% (Clear tropical water blue)
      // Video Editing: 50% - 75% (Deep ocean royal blue)
      // Contact: 75% - 100% (Dark marine navy blue)
      if (progress < 0.25) {
        const localProgress = progress / 0.25;
        scrollState.sections.hero = localProgress;
        scrollState.sections.graphicDesign = 0;
        scrollState.sections.videoEditing = 0;
        scrollState.sections.contact = 0;

        scrollState.camera.position = [0, 0, 8];
        scrollState.camera.lookAt = [0, 0, 0];
        scrollState.camera.fov = 60;

        // Vibrant tropical water blue
        scrollState.fogColor = '#006f8a';
        scrollState.fogNear = 1;
        scrollState.fogFar = 22;
        scrollState.ambientIntensity = 0.55;
        scrollState.directionalIntensity = 0.9;
      } 
      else if (progress >= 0.25 && progress < 0.50) {
        const localProgress = (progress - 0.25) / 0.25;
        scrollState.sections.hero = 1;
        scrollState.sections.graphicDesign = localProgress;
        scrollState.sections.videoEditing = 0;
        scrollState.sections.contact = 0;

        scrollState.camera.position = [0, -0.4, 6.5];
        scrollState.camera.lookAt = [0, 0.4, 0];
        scrollState.camera.fov = 60;

        // Clear bright water blue
        scrollState.fogColor = '#0087a3';
        scrollState.fogNear = 1;
        scrollState.fogFar = 18;
        scrollState.ambientIntensity = 0.7;
        scrollState.directionalIntensity = 1.1;
      } 
      else if (progress >= 0.50 && progress < 0.75) {
        const localProgress = (progress - 0.50) / 0.25;
        scrollState.sections.hero = 1;
        scrollState.sections.graphicDesign = 1;
        scrollState.sections.videoEditing = localProgress;
        scrollState.sections.contact = 0;

        scrollState.camera.position = [0, -6.0, 7.5];
        scrollState.camera.lookAt = [0, -6.0, 0];
        scrollState.camera.fov = 55;

        // Deep ocean royal blue
        scrollState.fogColor = '#011e4d';
        scrollState.fogNear = 1;
        scrollState.fogFar = 20;
        scrollState.ambientIntensity = 0.45;
        scrollState.directionalIntensity = 0.6;
      } 
      else {
        const localProgress = (progress - 0.75) / 0.25;
        scrollState.sections.hero = 1;
        scrollState.sections.graphicDesign = 1;
        scrollState.sections.videoEditing = 1;
        scrollState.sections.contact = localProgress;

        scrollState.camera.position = [0, -12.0, 6.5];
        scrollState.camera.lookAt = [0, -12.0, 0];
        scrollState.camera.fov = 60;

        // Dark navy blue abyssal water
        scrollState.fogColor = '#000714';
        scrollState.fogNear = 1;
        scrollState.fogFar = 16;
        scrollState.ambientIntensity = 0.3;
        scrollState.directionalIntensity = 0.4;
      }

      // Calculate HTML swallow overlay opacity based on progress
      let opacity = 0;
      if (progress >= 0.50 && progress < 0.75) {
        const localProgress = (progress - 0.50) / 0.25;
        if (localProgress > 0.80) {
          // Ramp up to 1 between localProgress 0.80 and 0.95
          opacity = Math.min((localProgress - 0.80) / 0.15, 1.0);
        }
      } else if (progress >= 0.75) {
        const localProgress = (progress - 0.75) / 0.25;
        // Fade back out as you sink into Section 3
        opacity = Math.max(1.0 - localProgress / 0.25, 0.0);
      }
      setSwallowOpacity(opacity);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Sleek Loader Overlay */}
      <Loader />
      
      {/* 3D Background Canvas */}
      <SceneCanvas />

      {/* Scrolling HTML Content Overlay (passes function to trigger project modals) */}
      <PortfolioContent onOpenProject={setSelectedProject} />

      {/* Shark swallow overlay */}
      <div 
        className="shark-swallow-overlay" 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          opacity: swallowOpacity,
          pointerEvents: 'none', // Click through
          zIndex: 9999, // Below modal but above the rest
          transition: 'opacity 0.05s ease-out'
        }}
      />

      {/* Full screen video/image project viewer modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}

export default App;
