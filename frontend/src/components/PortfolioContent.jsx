import React from 'react';

export default function PortfolioContent({ onOpenProject }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerText;

    try {
      submitBtn.innerText = 'Initializing Wave...';
      submitBtn.disabled = true;

      const response = await fetch('https://kvy-portfolio-backend.onrender.com/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Thank you for reaching out! Kavy has received your message.');
        e.target.reset();
      } else {
        alert(data.error || 'Failed to submit form. Please check details and try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to connect to the server. Please try emailing directly.');
    } finally {
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
    }
  };

  const openGraphicProject = (title, tag, url, desc) => {
    if (onOpenProject) {
      onOpenProject({ type: 'image', url, title, tag, desc });
    }
  };

  const openVideoProject = (title, tag, url, desc) => {
    if (onOpenProject) {
      onOpenProject({ type: 'video', url, title, tag, desc });
    }
  };

  return (
    <div className="content-overlay">
      {/* SECTION 0: HERO */}
      <section className="scroll-section hero-section" id="hero-section">
        <div className="hero-container">
          <div style={{ flex: '1', minWidth: '280px' }}>
            <h1 className="hero-title">
              KAVY <span>CHOUDHARY</span>
            </h1>
            <p className="hero-desc">
              I am an engineering student who likes doing video editing, graphic designing and UI/UX designing.
            </p>
          </div>
          <div className="hero-profile-container">
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>
            <div className="hud-orbit"></div>
            <div className="hud-scanline"></div>
            <div className="profile-image-wrapper">
              <img 
                src="/assets/images/kavy_profile.jpeg" 
                alt="Kavy Choudhary" 
                className="hero-profile-img"
              />
            </div>
          </div>
        </div>
        <div className="scroll-indicator">
          Scroll to explore
        </div>
      </section>

      {/* SECTION 1: GRAPHIC DESIGN SHOWCASE */}
      <section className="scroll-section" id="graphic-design-section">
        <div className="section-header">
          <span className="section-num">01 / BRAND & EDITORIAL</span>
          <h2 className="section-title">Graphic Design</h2>
          <p className="section-desc">
            Floating design mockups and typography layouts revealed by the Dolphin's dive. 
            Click any card to inspect the high-resolution design in detail.
          </p>
        </div>

        <div className="gd-grid">
          <div 
            className="glass-panel gd-card" 
            onClick={() => openGraphicProject(
              'Editorial Brochure', 
              'Luxury Layout', 
              '/assets/images/pamplete.png', 
              'A premium brochure design built for a high-end luxury brand. Focused on grid systems, custom columns, typography scales, and structural balance.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <span className="gd-card-tag">Luxury Layout</span>
            <h3 className="gd-card-title">Editorial Brochure</h3>
            <p className="contact-label">Click to Inspect Card ✕</p>
          </div>

          <div 
            className="glass-panel gd-card" 
            onClick={() => openGraphicProject(
              'Book Frontpage', 
              'Typography Cover', 
              '/assets/images/book_frontpage.png', 
              'Editorial front cover design featuring a bespoke serif font pairing and clean minimalist structural layout.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <span className="gd-card-tag">Typography</span>
            <h3 className="gd-card-title">Book Frontpage</h3>
            <p className="contact-label">Click to Inspect Card ✕</p>
          </div>

          <div 
            className="glass-panel gd-card" 
            onClick={() => openGraphicProject(
              'Digital Infographics', 
              'Information Design', 
              '/assets/images/infographics.png', 
              'Complex technical data visualization. Structured with a customized color palette for clear informational hierarchy and visual excellence.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <span className="gd-card-tag">Information Design</span>
            <h3 className="gd-card-title">Infographics</h3>
            <p className="contact-label">Click to Inspect Card ✕</p>
          </div>

          <div 
            className="glass-panel gd-card" 
            onClick={() => openGraphicProject(
              'Creator Thumbnail Art', 
              'Creative Direction', 
              '/assets/images/Thumbnail.png', 
              'YouTube thumbnail artwork designed for high click-through-rate, featuring custom color grading, vector overlays, and strong focal points.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <span className="gd-card-tag">Creative Direction</span>
            <h3 className="gd-card-title">Creator Thumbnails</h3>
            <p className="contact-label">Click to Inspect Card ✕</p>
          </div>
        </div>
      </section>

      {/* SECTION 2: VIDEO EDITING SHOWREEL */}
      <section className="scroll-section" id="video-editing-section">
        <div className="section-header">
          <span className="section-num">02 / MOTION & SOUND</span>
          <h2 className="section-title">Video Editing</h2>
          <p className="section-desc">
            Cinematic showreels projected onto floating anamorphic viewports. 
            Click any project to play the edit full screen with sound.
          </p>
        </div>

        <div className="vd-container">
          <div 
            className="glass-panel vd-item" 
            onClick={() => openVideoProject(
              'Project 1', 
              'PROJECT 1', 
              '/assets/videos/P5.mp4', 
              'Cinematic commercial edit. Features advanced video pacing, multi-track sound effects synchronization, and professional color grading.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <div className="vd-text">
              <span className="vd-meta">PROJECT 1</span>
              <h3 className="vd-title">Project 1</h3>
              <p className="vd-desc">
                High-end color grading and digital compositing built for premium automotive and tech commercials. Click to Play.
              </p>
            </div>
          </div>

          <div 
            className="glass-panel vd-item" 
            onClick={() => openVideoProject(
              'Project 2', 
              'PROJECT 2', 
              '/assets/videos/p6.mp4', 
              'Story-driven short edit with high retention cuts, ambient sound design layer, and cinematic title cards.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <div className="vd-text">
              <span className="vd-meta">PROJECT 2</span>
              <h3 className="vd-title">Project 2</h3>
              <p className="vd-desc">
                Pacing and dramatic cuts that pull viewers deep into the storyline, blending ambient foley and custom title cards. Click to Play.
              </p>
            </div>
          </div>

          <div 
            className="glass-panel vd-item" 
            onClick={() => openVideoProject(
              'Project 3', 
              'PROJECT 3', 
              '/assets/videos/p7.mp4', 
              'Sleek multi-camera pacing and advertisement reel showcasing corporate milestones and branding narratives.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <div className="vd-text">
              <span className="vd-meta">PROJECT 3</span>
              <h3 className="vd-title">Project 3</h3>
              <p className="vd-desc">
                Elevating corporate narratives through sleek transitions, engaging infographics, and clean interview multi-cam pacing. Click to Play.
              </p>
            </div>
          </div>

          <div 
            className="glass-panel vd-item" 
            onClick={() => openVideoProject(
              'Project 4', 
              'PROJECT 4', 
              '/assets/videos/p8.mp4', 
              'High-impact mobile format edit built for social channels. Employs kinetic motion titles, sound hits, and rapid pacing.'
            )}
            style={{ cursor: 'pointer' }}
          >
            <div className="vd-text">
              <span className="vd-meta">PROJECT 4</span>
              <h3 className="vd-title">Project 4</h3>
              <p className="vd-desc">
                High-retention mobile layouts using animated kinetic typography, sound cues, and aggressive visual hooks. Click to Play.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CONTACT & CREATIVE PHILOSOPHY */}
      <section className="scroll-section" id="contact-section">
        <div className="section-header">
          <span className="section-num">03 / BIOLUMINESCENT BAY</span>
          <h2 className="section-title">Creative Bay</h2>
          <p className="section-desc">
            Step into Kavy's digital workshop. Connect and collaborate to construct your next digital masterpiece.
          </p>
        </div>

        <div className="contact-layout">
          {/* Info Card */}
          <div className="glass-panel bio-card">
            <h3 className="timeline-glow-title">Creative Philosophy</h3>
            <p className="hero-desc" style={{ marginBottom: '2.5rem', fontSize: '1rem' }}>
              "Designing with depth, motion, and digital scale. I combine high-end 
              frontend layout structures with custom 3D web experiences to bridge 
              the gap between creative visual art and advanced interactive code."
            </p>
            
            <h3 className="timeline-glow-title">Contact Channels</h3>
            <ul className="contact-info-list">
              <li className="contact-info-item">
                <span className="contact-label">Location</span>
                <span className="contact-value">Jaipur, India</span>
              </li>
              <li className="contact-info-item">
                <span className="contact-label">Call Direct</span>
                <a href="tel:+917742907972" className="contact-value">+91 77429 07972</a>
              </li>
              <li className="contact-info-item">
                <span className="contact-label">Email Inquiries</span>
                <a href="mailto:kavychoudhary49@gmail.com" className="contact-value">kavychoudhary49@gmail.com</a>
              </li>
              <li className="contact-info-item">
                <span className="contact-label">Digital Network</span>
                <a 
                  href="https://www.linkedin.com/in/kavy-choudhary-5a72bb361?utm_source=share_via&utm_content=profile&utm_medium=member_android" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-value"
                >
                  LinkedIn Profile
                </a>
              </li>
            </ul>
          </div>

          {/* Form Card */}
          <div className="glass-panel bio-card">
            <h3 className="timeline-glow-title">Launch a Project</h3>
            <form onSubmit={handleSubmit} id="contact-form">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input className="form-input" type="text" id="name" required placeholder="John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input className="form-input" type="email" id="email" required placeholder="john@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea className="form-input" id="message" required placeholder="Describe your project, ideas, or timeline..." />
              </div>
              <button className="submit-btn" type="submit">Initialize Wave</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
