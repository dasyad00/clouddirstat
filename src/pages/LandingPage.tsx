import { Button } from "@mui/material";
import React from "react";
import { Link } from "react-router";
import Layout from "../components/Layout";

const LandingPage: React.FC = () => {
  return (
    <Layout>
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
    </Layout>
  )
};

export default LandingPage;
