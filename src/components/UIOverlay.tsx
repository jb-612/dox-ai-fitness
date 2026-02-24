import React from "react";
import { useProgress } from "@react-three/drei";
import { useStore, QualityPreset } from "../store";
import { Volume2, VolumeX, Settings, HelpCircle } from "lucide-react";

export const UIOverlay: React.FC = () => {
  const { progress, active } = useProgress();
  const quality = useStore((state) => state.quality);
  const setQuality = useStore((state) => state.setQuality);
  const muted = useStore((state) => state.muted);
  const setMuted = useStore((state) => state.setMuted);

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQuality(e.target.value as QualityPreset);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md font-sans tracking-tight">
            WebGym 3D
          </h1>
          <p className="text-white/80 text-sm mt-1 drop-shadow flex items-center gap-2">
            <HelpCircle size={14} />
            Scroll to move in. Drag to look around. Click a character's head to
            interact.
          </p>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          {/* Mute Toggle */}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Quality Settings */}
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-white">
            <Settings size={16} />
            <select
              value={quality}
              onChange={handleQualityChange}
              className="bg-transparent text-sm outline-none cursor-pointer"
            >
              <option value="low" className="text-black">
                Low Quality
              </option>
              <option value="medium" className="text-black">
                Medium Quality
              </option>
              <option value="high" className="text-black">
                High Quality
              </option>
            </select>
          </div>
        </div>
      </header>

      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm pointer-events-auto transition-opacity duration-500">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium text-lg">
              Loading Assets... {Math.round(progress)}%
            </p>
            <p className="text-zinc-400 text-sm mt-2">
              Downloading high-quality models and textures
            </p>
          </div>
        </div>
      )}

      <footer className="self-end pointer-events-auto">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-white/70 text-xs flex gap-4">
          <span>PBR Materials</span>
          <span>•</span>
          <span>HDR Lighting</span>
          <span>•</span>
          <span>SSAO</span>
          <span>•</span>
          <span>React Three Fiber</span>
        </div>
      </footer>
    </div>
  );
};
