import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CanvasTexture, Mesh } from "three";

interface HeroImageCubeProps {
  faces: CubeFaceCard[];
}

export interface CubeFaceCard {
  kind: "listing" | "roommate";
  title: string;
  subtitle: string;
  meta: string;
}

const createFaceTexture = (face: CubeFaceCard) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 640;
    const context = canvas.getContext("2d");
    if (!context) {
      console.warn("Could not get 2D context for canvas");
      return new CanvasTexture(canvas);
    }

    const isListing = face.kind === "listing";
    context.fillStyle = isListing ? "#0f1318" : "#121017";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = isListing ? "#181f26" : "#1b1724";
    context.fillRect(44, 44, 552, 552);

    context.strokeStyle = isListing ? "#3f4a57" : "#50426a";
    context.lineWidth = 3;
    context.strokeRect(44, 44, 552, 552);

    context.fillStyle = isListing ? "#9fe870" : "#9f8cff";
    context.font = "700 34px Outfit, Arial";
    context.fillText(isListing ? "LISTING" : "ROOMMATE", 80, 102);

    context.fillStyle = "#ffffff";
    context.font = "700 44px Outfit, Arial";
    context.fillText(face.title, 80, 182);

    context.fillStyle = "#c6c6c6";
    context.font = "500 30px Outfit, Arial";
    context.fillText(face.subtitle, 80, 242);

    context.fillStyle = "#9e9e9e";
    context.font = "500 28px Outfit, Arial";
    context.fillText(face.meta, 80, 510);

    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  } catch (err) {
    console.error("Failed to create face texture:", err);
    // Return a blank texture as fallback
    return new CanvasTexture(document.createElement("canvas"));
  }
};

const Cube = ({ faces }: { faces: CubeFaceCard[] }) => {
  const meshRef = useRef<Mesh>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const textures = useMemo(() => {
    try {
      // Ensure faces is an array before mapping
      if (!Array.isArray(faces) || faces.length === 0) {
        console.warn("Faces is not a valid array:", faces);
        return [];
      }
      return faces.map(createFaceTexture);
    } catch (err) {
      console.error("Failed to create textures:", err);
      setRenderError("Failed to create textures");
      return [];
    }
  }, [faces, setRenderError]);

  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const velocityYRef = useRef(0.004);

  const SENSITIVITY = 0.005;
  const MAX_VELOCITY = 0.06;
  const DAMPING = 0.93;
  const MIN_AUTOSPIN = 0.002;

  useEffect(
    () => () => {
      try {
        textures.forEach((texture) => texture.dispose());
      } catch (err) {
        console.error("Failed to dispose textures:", err);
      }
    },
    [textures],
  );

  useFrame(() => {
    try {
      if (!meshRef.current) return;

      meshRef.current.rotation.y += velocityYRef.current;

      if (!isDraggingRef.current) {
        velocityYRef.current *= DAMPING;
        if (Math.abs(velocityYRef.current) < MIN_AUTOSPIN) {
          velocityYRef.current = MIN_AUTOSPIN;
        }
      }
    } catch (err) {
      console.error("Frame update error:", err);
    }
  });

  const handlePointerDown = (event: any) => {
    try {
      isDraggingRef.current = true;
      lastPointerXRef.current = event.clientX;
    } catch (err) {
      console.error("Pointer down error:", err);
    }
  };

  const handlePointerMove = (event: any) => {
    try {
      if (!isDraggingRef.current || !meshRef.current) return;

      const deltaX = event.clientX - lastPointerXRef.current;
      lastPointerXRef.current = event.clientX;

      const nextVelocity = deltaX * SENSITIVITY;
      velocityYRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, nextVelocity));
    } catch (err) {
      console.error("Pointer move error:", err);
    }
  };

  const handlePointerUp = () => {
    try {
      isDraggingRef.current = false;
    } catch (err) {
      console.error("Pointer up error:", err);
    }
  };

  if (renderError || textures.length === 0) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      rotation={[0.4, 0.2, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <boxGeometry args={[2.4, 2.4, 2.4]} />
      {textures.map((texture, i) => (
        <meshBasicMaterial key={i} attach={`material-${i}`} map={texture} />
      ))}
    </mesh>
  );
};

const HeroImageCube = ({ faces }: HeroImageCubeProps) => {
  const [error, setError] = useState<string | null>(null);

  const cubeFaces = useMemo(() => {
    // Ensure faces is a valid array
    const faceArray = Array.isArray(faces) ? faces : [];

    if (faceArray.length === 0) {
      return Array.from({ length: 6 }, () => ({
        kind: "listing" as const,
        title: "Listing",
        subtitle: "Sample",
        meta: "42 Network",
      }));
    }

    const normalized = [...faceArray];
    while (normalized.length < 6) {
      normalized.push(faceArray[normalized.length % faceArray.length]);
    }

    return normalized.slice(0, 6);
  }, [faces]);

  if (error) {
    return (
      <div className="w-[330px] h-[330px] sm:w-[370px] sm:h-[370px] md:w-[410px] md:h-[410px] mx-auto cursor-default flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg border border-primary/30">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">3D view unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[330px] h-[330px] sm:w-[370px] sm:h-[370px] md:w-[410px] md:h-[410px] mx-auto cursor-grab active:cursor-grabbing">
      <Canvas 
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={(state) => {
          try {
            // Ensure WebGL is available
            const gl = state.gl;
            if (!gl) {
              setError("WebGL not supported");
            }
          } catch (err) {
            console.error("Canvas error:", err);
            setError("Failed to initialize 3D view");
          }
        }}
      >
        <ambientLight intensity={1} />
        <Cube faces={Array.isArray(cubeFaces) ? cubeFaces : []} />
      </Canvas>
    </div>
  );
};

export default HeroImageCube;
