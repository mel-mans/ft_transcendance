import { useEffect, useMemo, useRef } from "react";
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
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  const context = canvas.getContext("2d");
  if (!context) {
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
};

const Cube = ({ faces }: { faces: CubeFaceCard[] }) => {
  const meshRef = useRef<Mesh>(null);
  const textures = useMemo(() => faces.map(createFaceTexture), [faces]);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const velocityYRef = useRef(0.004);

  const SENSITIVITY = 0.005;
  const MAX_VELOCITY = 0.06;
  const DAMPING = 0.93;
  const MIN_AUTOSPIN = 0.002;

  useEffect(
    () => () => {
      textures.forEach((texture) => texture.dispose());
    },
    [textures],
  );

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += velocityYRef.current;

    if (!isDraggingRef.current) {
      velocityYRef.current *= DAMPING;
      if (Math.abs(velocityYRef.current) < MIN_AUTOSPIN) {
        velocityYRef.current = MIN_AUTOSPIN;
      }
    }
  });

  const handlePointerDown = (event: any) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = event.clientX;
  };

  const handlePointerMove = (event: any) => {
    if (!isDraggingRef.current || !meshRef.current) return;

    const deltaX = event.clientX - lastPointerXRef.current;
    lastPointerXRef.current = event.clientX;

    const nextVelocity = deltaX * SENSITIVITY;
    velocityYRef.current = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, nextVelocity));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

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
  const cubeFaces = useMemo(() => {
    if (faces.length === 0) {
      return Array.from({ length: 6 }, () => ({
        kind: "listing" as const,
        title: "Listing",
        subtitle: "Sample",
        meta: "42 Network",
      }));
    }

    const normalized = [...faces];
    while (normalized.length < 6) {
      normalized.push(faces[normalized.length % faces.length]);
    }

    return normalized.slice(0, 6);
  }, [faces]);

  return (
    <div 
      className="mx-auto cursor-grab active:cursor-grabbing"
      style={{
        width: "330px",
        height: "330px",
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        gl={{ 
          antialias: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={(state) => {
          state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <ambientLight intensity={1} />
        <Cube faces={cubeFaces} />
      </Canvas>
    </div>
  );
};

export default HeroImageCube;
