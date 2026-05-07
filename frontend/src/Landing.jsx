import React from 'react';

function Landing({ onGetStarted }) {
  return (
    <div className="landing-page">
      {/* Dynamic Background Layers */}
      <div className="ambient-grid"></div>
      <div className="hero-bg-glow"></div>

      {/* Navigation */}
      <nav className="landing-nav animate-fade-down">
        <div className="logo-container">
          <img 
            src="/Logo.png" 
            alt="Ethara Logo" 
            style={{ height: '36px', width: '36px', objectFit: 'contain' }} 
          />
          <span className="logo-text">Ethara Workspace</span>
        </div>
        <button className="nav-login-btn" onClick={onGetStarted}>
          Sign In
        </button>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="badge-wrap animate-stagger-1">
            <span className="premium-badge">Ethara v2.0 is live</span>
          </div>
          <h1 className="hero-title animate-stagger-2">
            Where elite teams <br />
            <span className="gradient-text">execute with precision.</span>
          </h1>
          <p className="hero-subtitle animate-stagger-3">
            Ethara is the premium project management suite designed for high-velocity software teams. 
            Assign tasks, track progress, and ship faster.
          </p>
          <div className="hero-actions animate-stagger-4">
            <button className="primary-btn pulse-btn shine-effect" onClick={onGetStarted}>
              <span>Enter Workspace</span>
            </button>
            <a href="#features" className="ghost-btn scroll-btn">Explore Features</a>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title reveal-text">Production-Ready Tools</h2>
        <div className="features-grid">
          <div className="feature-card holographic">
            <div className="feature-icon">🛡️</div>
            <h3>Role-Based Access</h3>
            <p>Enterprise-grade security. Admins control projects; members focus on execution.</p>
          </div>
          <div className="feature-card holographic" style={{ animationDelay: '0.2s' }}>
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Tracking</h3>
            <p>Monitor sprint velocity with live dashboard analytics and status toggles.</p>
          </div>
          <div className="feature-card holographic" style={{ animationDelay: '0.4s' }}>
            <div className="feature-icon">🎯</div>
            <h3>Priority Sorting</h3>
            <p>Keep your team focused on what matters with visual priority tags and search.</p>
          </div>
        </div>
      </section>

      {/* Footer - FIXED WITH Z-INDEX AND GMAIL LINK */}
      <footer className="landing-footer" style={{ position: 'relative', zIndex: 10 }}>
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-text">Ethara</span>
            <p>Built for the future of work.</p>
          </div>
          <div className="social-links">
            <a href="https://github.com/ayushcodespace" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="https://linkedin.com/in/ayushcodespace" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=ayush2042sri@gmail.com" target="_blank" rel="noreferrer" aria-label="Email">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Ethara Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;