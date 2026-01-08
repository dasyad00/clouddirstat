import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router";

const LandingPage: React.FC = () => {
  return (
    <>
      <AppBar color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CloudDirStat
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <div className="hero">
          <div className="container">
            <h1>Track and Optimize Your Cloud Storage</h1>
            <p>
              CloudDirStat helps you understand your cloud storage usage and
              identify opportunities to save money.
            </p>
            <Button component={Link} to="/select-provider" variant="contained">
              Get Started for Free
            </Button>
          </div>
        </div>
      </main>
      <footer>
        <div className="container">
          <p>
            {"Copyright © "}
            CloudDirStat {new Date().getFullYear()}
            {"."}
          </p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;
