import { AppBar, Box, Container, Toolbar, Typography } from "@mui/material";
import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({children}) => {
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
        <Container maxWidth="lg">
          <Box sx={{ pt: 4, pb: 4 }}>{children}</Box>
        </Container>
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
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

export default Layout;
