import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { UIOverlay } from "./UIOverlay";

// Simple WebGL detection
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
};

export const CanvasContainer: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  if (!webglSupported) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-900 text-white p-8 text-center">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            WebGL Not Supported
          </h2>
          <p className="text-zinc-400">
            Your browser or device does not seem to support WebGL, which is
            required to render the 3D gym scene. Please try updating your
            browser or graphics drivers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-zinc-900 overflow-hidden">
      <UIOverlay />
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <Scene />
      </Canvas>
    </div>
  );
};
