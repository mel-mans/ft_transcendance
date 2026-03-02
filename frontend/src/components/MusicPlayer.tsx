import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";

const DEFAULT_TRACK = {
  name: "mix",
  url: "/chet.mp3",
};

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [open, setOpen] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pos, setPos] = useState({ x: 0, y: window.innerHeight / 2 - 20 });
  const dragging = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // "drape pull" stretch factor while dragging
  const [stretch, setStretch] = useState({ scaleY: 1, skewX: 0 });

  const lastPos = useRef(pos);

  // Load audio
  useEffect(() => {
    const audio = new Audio(DEFAULT_TRACK.url);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = volume;
    audio.muted = muted;
    audioRef.current = audio;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch {
        setPlaying(false);
      }
    }
  };

  const handleEnter = () => {
    if (dragging.current) return;
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setOpen(true);
  };

  const handleLeave = () => {
    hideTimeout.current = setTimeout(() => setOpen(false), 300);
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    hasDragged.current = false;
    setIsDragging(true);
    setOpen(false); // close panel immediately on drag start
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    lastPos.current = pos;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      hasDragged.current = true;

      const newX = Math.max(0, e.clientX - dragOffset.current.x);
      const newY = Math.max(0, e.clientY - dragOffset.current.y);

      // Calculate velocity for drape effect
      const dy = newY - lastPos.current.y;
      const dx = newX - lastPos.current.x;

      // Stretch vertically based on vertical speed, skew based on horizontal speed
      const scaleY = 1 + Math.min(Math.abs(dy) * 0.008, 0.25);
      const skewX = Math.max(-12, Math.min(12, dx * 0.4));

      setStretch({ scaleY, skewX });
      setPos({ x: newX, y: newY });
      lastPos.current = { x: newX, y: newY };
    };

    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setIsDragging(false);
      // Snap back to normal shape with a spring feel
      setStretch({ scaleY: 1, skewX: 0 });
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      className="fixed z-50 flex items-center select-none touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `scaleY(${stretch.scaleY}) skewX(${stretch.skewX}deg)`,
        transition: isDragging ? "transform 0.05s ease-out" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Trigger tab — drag handle */}
      <div
        onPointerDown={onPointerDown}
        onClick={() => {
          if (hasDragged.current) return;
          void toggle();
        }}
        className={`flex items-center justify-center w-10 h-10 rounded-r-xl cursor-grab active:cursor-grabbing transition-opacity duration-300 ${
          open ? "opacity-70" : "opacity-100"
        }`}
        style={{ WebkitTapHighlightColor: "transparent", outline: "none", boxShadow: "none" }}
      >
        <Music className="w-5 h-5 text-primary" />
      </div>

      {/* Popup panel */}
      <div
        className={`ml-0 rounded-r-2xl px-4 py-3 flex items-center gap-3 text-white transition-all duration-300 origin-left ${
          open
            ? "opacity-100 scale-x-100 translate-x-0"
            : "opacity-0 scale-x-0 -translate-x-2 pointer-events-none"
        }`}
      >
        <button
          onClick={() => { if (!hasDragged.current) void toggle(); }}
          className="hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 border-0 bg-transparent p-0"
          style={{ WebkitTapHighlightColor: "transparent", outline: "none", boxShadow: "none" }}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <span className="text-xs opacity-80 max-w-[80px] truncate">
          {DEFAULT_TRACK.name}
        </span>

        <button
          onClick={() => { if (!hasDragged.current) setMuted(!muted); }}
          className="hover:text-primary transition-colors focus:outline-none focus-visible:outline-none focus-visible:ring-0 border-0 bg-transparent p-0"
          style={{ WebkitTapHighlightColor: "transparent", outline: "none", boxShadow: "none" }}
        >
          {muted ? <VolumeX className="w-4 h-4 opacity-70" /> : <Volume2 className="w-4 h-4 opacity-70" />}
        </button>
      </div>
    </div>
  );
}
