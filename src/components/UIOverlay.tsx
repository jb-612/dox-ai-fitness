import React from "react";
import { useProgress } from "@react-three/drei";

export const UIOverlay: React.FC = () => {
  const { progress, active } = useProgress();

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6">
      <header>
        <h1 className="text-3xl font-bold text-white drop-shadow-md font-sans tracking-tight">
          WebGym 3D
        </h1>
        <p className="text-white/80 text-sm mt-1 drop-shadow">
          Scroll to move in. Drag to look around. Click a character's head to
          interact.
        </p>
      </header>

      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-500">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium text-lg">
              Loading Gym... {Math.round(progress)}%
            </p>
          </div>
        </div>
      )}

      <footer className="self-end">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white/70 text-xs">
          Placeholder Assets • WebGL • React Three Fiber
        </div>
      </footer>
    </div>
  );
};
