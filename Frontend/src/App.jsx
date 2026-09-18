import React, { useEffect } from "react";
import AppRoutes from "./AppRoutes.jsx";
import GlobalCursor from "./Features/Shared/components/GlobalCursor.jsx";
import AuthProvider from "./Features/Auth/auth.context.jsx";
import Lenis from "lenis";
import useAuth from "./Features/Auth/hooks/useAuth.jsx";

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    handleGetMe();
  }, []);

  return (
    <>
      <GlobalCursor />
      <AppRoutes />
    </>
  );
};

export default App;
