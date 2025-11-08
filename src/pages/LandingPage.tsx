import React from 'react';
import { Link } from 'react-router';

const LandingPage: React.FC = () => {
  return (
    <>
      <header>
        <div className="container">
          <a href="/" style={{ textDecoration: 'none', color: 'black', fontSize: '24px', fontWeight: 'bold' }}>CloudDirStat</a>
        </div>
      </header>
      <main>
        <div className="hero">
          <div className="container">
            <h1>Track and Optimize Your Cloud Storage</h1>
            <p>CloudDirStat helps you understand your cloud storage usage and identify opportunities to save money.</p>
            <Link to="/select-provider" className="cta-button">Get Started for Free</Link>
          </div>
        </div>
      </main>
      <footer>
        <div className="container">
          <p>&copy; 2023 CloudDirStat. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
