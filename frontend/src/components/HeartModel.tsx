import { useRef, useState, useMemo, useEffect, Suspense, Component } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Info, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  ZoomIn
} from 'lucide-react';

// Error Boundary for WebGL / Asset loading
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class HeartErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Heart 3D Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
          <h4 className="font-semibold text-lg text-white mb-1">3D Viewer Encountered an Issue</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Could not initialize 3D anatomical model. Your browser might have hardware acceleration disabled or WebGL was interrupted.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-brand-cyan/20 border border-brand-cyan text-brand-cyan rounded-lg text-xs font-semibold hover:bg-brand-cyan/30 transition-colors"
          >
            Retry 3D Viewer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Anatomical territory metadata and descriptions
const VESSEL_DETAILS: Record<string, {
  fullName: string;
  territory: string;
  clinicalSignificance: string;
  course: string;
}> = {
  LAD: {
    fullName: "Left Anterior Descending Artery",
    territory: "Anterior 2/3 of interventricular septum, anterior LV free wall, and cardiac apex.",
    clinicalSignificance: "Frequently called the 'widow maker'. Critical blood supply to major pumping myocardial mass.",
    course: "Originates from Left Main (LM) bifurcation and descends in anterior interventricular sulcus toward cardiac apex."
  },
  LCX: {
    fullName: "Left Circumflex Artery",
    territory: "Posterolateral and lateral walls of left ventricle, portion of left atrium.",
    clinicalSignificance: "Stenosis causes lateral wall ischemia and posterolateral papillary muscle dysfunction.",
    course: "Originates from Left Main (LM) bifurcation and curves along left atrioventricular groove (coronary sulcus)."
  },
  RCA: {
    fullName: "Right Coronary Artery",
    territory: "Right ventricle, inferior wall of left ventricle, SA & AV nodes (in 85% right-dominant hearts).",
    clinicalSignificance: "Stenosis produces inferior wall myocardial infarction and AV nodal conduction blocks/bradycardia.",
    course: "Originates from anterior aortic sinus, courses through right coronary sulcus down to posterior crux."
  }
};

// Anatomical coordinates for the coronary arteries conforming to the 3D heart surface
const LAD_PATH = [
  new THREE.Vector3(-0.06, 0.40, 0.38),
  new THREE.Vector3(-0.07, 0.28, 0.44),
  new THREE.Vector3(-0.09, 0.14, 0.47),
  new THREE.Vector3(-0.08, -0.02, 0.48),
  new THREE.Vector3(-0.06, -0.18, 0.47),
  new THREE.Vector3(-0.03, -0.34, 0.43),
  new THREE.Vector3(0.01, -0.48, 0.36),
  new THREE.Vector3(0.04, -0.62, 0.26),
  new THREE.Vector3(0.06, -0.72, 0.14)
];

const LAD_BRANCH = [
  new THREE.Vector3(-0.09, 0.14, 0.47),
  new THREE.Vector3(-0.19, 0.04, 0.45),
  new THREE.Vector3(-0.29, -0.10, 0.39),
  new THREE.Vector3(-0.36, -0.24, 0.30)
];

const LCX_PATH = [
  new THREE.Vector3(-0.06, 0.40, 0.38),
  new THREE.Vector3(-0.18, 0.38, 0.36),
  new THREE.Vector3(-0.32, 0.34, 0.30),
  new THREE.Vector3(-0.46, 0.28, 0.20),
  new THREE.Vector3(-0.54, 0.18, 0.06),
  new THREE.Vector3(-0.55, 0.04, -0.10),
  new THREE.Vector3(-0.49, -0.10, -0.24),
  new THREE.Vector3(-0.38, -0.22, -0.30),
  new THREE.Vector3(-0.24, -0.32, -0.30)
];

const LCX_BRANCH = [
  new THREE.Vector3(-0.46, 0.28, 0.20),
  new THREE.Vector3(-0.50, 0.10, 0.18),
  new THREE.Vector3(-0.48, -0.08, 0.18),
  new THREE.Vector3(-0.42, -0.26, 0.14)
];

const RCA_PATH = [
  new THREE.Vector3(0.14, 0.48, 0.32),
  new THREE.Vector3(0.26, 0.42, 0.30),
  new THREE.Vector3(0.36, 0.32, 0.26),
  new THREE.Vector3(0.42, 0.16, 0.22),
  new THREE.Vector3(0.43, -0.02, 0.18),
  new THREE.Vector3(0.41, -0.20, 0.12),
  new THREE.Vector3(0.36, -0.38, 0.04),
  new THREE.Vector3(0.28, -0.54, -0.08),
  new THREE.Vector3(0.16, -0.66, -0.16)
];

const RCA_BRANCH = [
  new THREE.Vector3(0.43, -0.02, 0.18),
  new THREE.Vector3(0.36, -0.16, 0.26),
  new THREE.Vector3(0.25, -0.30, 0.31),
  new THREE.Vector3(0.12, -0.42, 0.31)
];

// Helper to determine risk styling
function getRiskInfo(prob?: number) {
  if (prob === undefined || prob === null) {
    return {
      color: '#e11d48', // Baseline arterial crimson
      label: 'Baseline (Unanalyzed)',
      badgeClass: 'bg-slate-700/60 text-slate-300 border-slate-600',
      icon: <Info size={14} className="text-slate-300" />
    };
  }
  if (prob < 0.33) {
    return {
      color: '#10b981', // Emerald green (Low Risk)
      label: 'Low Stenosis Likelihood',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: <CheckCircle2 size={14} className="text-emerald-400" />
    };
  }
  if (prob < 0.66) {
    return {
      color: '#f59e0b', // Amber (Medium Risk)
      label: 'Intermediate Stenosis Likelihood',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: <AlertTriangle size={14} className="text-amber-400" />
    };
  }
  return {
    color: '#ef4444', // Crimson Red (High Risk)
    label: 'High Stenosis Likelihood (>50%)',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    icon: <ShieldAlert size={14} className="text-red-400" />
  };
}

// 3D Coronary Vessel Component
interface ArteryVesselProps {
  id: 'LAD' | 'LCX' | 'RCA';
  mainPoints: THREE.Vector3[];
  branchPoints?: THREE.Vector3[];
  markerPos: [number, number, number];
  prob?: number;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

function ArteryVessel({
  id,
  mainPoints,
  branchPoints,
  markerPos,
  prob,
  isSelected,
  isHovered,
  onHover,
  onClick
}: ArteryVesselProps) {
  const mainCurve = useMemo(() => new THREE.CatmullRomCurve3(mainPoints, false, 'catmullrom', 0.5), [mainPoints]);
  const branchCurve = useMemo(() => branchPoints ? new THREE.CatmullRomCurve3(branchPoints, false, 'catmullrom', 0.5) : null, [branchPoints]);

  const { color } = getRiskInfo(prob);
  const activeColor = isSelected ? '#ffffff' : color;
  const emissiveIntensity = isSelected ? 0.9 : (isHovered ? 0.6 : 0.25);

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onClick(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        onHover(id);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
        onHover(null);
      }}
    >
      {/* Main Trunk Tube */}
      <mesh>
        <tubeGeometry args={[mainCurve, 64, isSelected ? 0.030 : 0.024, 16, false]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>

      {/* Anatomical Branch (Diagonal / Marginal) */}
      {branchCurve && (
        <mesh>
          <tubeGeometry args={[branchCurve, 32, isSelected ? 0.020 : 0.016, 12, false]} />
          <meshStandardMaterial
            color={activeColor}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            roughness={0.25}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Floating 3D Callout Marker */}
      <Html position={markerPos} center distanceFactor={4}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(id);
          }}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider transition-all shadow-md backdrop-blur-md flex items-center gap-1 border ${
            isSelected 
              ? 'bg-white text-slate-900 border-white scale-110 ring-2 ring-brand-cyan' 
              : isHovered
                ? 'bg-slate-900/95 text-brand-cyan border-brand-cyan scale-105'
                : 'bg-slate-900/80 text-white/90 border-slate-700/80 hover:border-slate-500'
          }`}
          style={{ borderColor: isSelected ? '#ffffff' : color }}
        >
          <span 
            className="w-2 h-2 rounded-full inline-block" 
            style={{ backgroundColor: color }}
          />
          {id}
          {prob !== undefined && (
            <span className="text-[9px] opacity-80 font-normal">
              {(prob * 100).toFixed(0)}%
            </span>
          )}
        </button>
      </Html>
    </group>
  );
}

// Anatomical Heart Scene
interface HeartSceneProps {
  predictions: any;
  autoRotate: boolean;
  selectedVessel: string | null;
  hoveredVessel: string | null;
  onSelectVessel: (id: string) => void;
  onHoverVessel: (id: string | null) => void;
  controlsRef: any;
}

function HeartScene({
  predictions,
  autoRotate,
  selectedVessel,
  hoveredVessel,
  onSelectVessel,
  onHoverVessel,
  controlsRef
}: HeartSceneProps) {
  const heartGroupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF('/models/heart.glb');

  // Clone scene so materials/textures remain independent and pristine
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // Enhance natural tissue sheen and PBR response
          child.material.roughness = 0.42;
          child.material.metalness = 0.08;
          child.material.needsUpdate = true;
        }
      }
    });
    return clone;
  }, [gltf.scene]);

  // Gentle subtle breathing/beating pulse animation
  useFrame((state) => {
    if (heartGroupRef.current) {
      const t = state.clock.getElapsedTime();
      // Organic dual-chamber heartbeat oscillation (systole & diastole)
      const beat = (Math.sin(t * 3.2) * 0.5 + 0.5) ** 4 * 0.03;
      heartGroupRef.current.scale.set(1 + beat, 1 + beat * 1.2, 1 + beat);
    }
  });

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={1.4}
        maxDistance={6.0}
        maxPolarAngle={Math.PI / 1.1}
        minPolarAngle={Math.PI / 8}
      />

      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 4]} intensity={1.6} color="#fff6f0" />
      <directionalLight position={[-4, 3, -3]} intensity={0.9} color="#93c5fd" />
      <directionalLight position={[0, -4, 2]} intensity={0.5} color="#fda4af" />

      <group ref={heartGroupRef} position={[0, 0, 0]}>
        {/* Real Anatomical Human Heart Mesh */}
        <primitive object={scene} />

        {/* LAD - Left Anterior Descending */}
        <ArteryVessel
          id="LAD"
          mainPoints={LAD_PATH}
          branchPoints={LAD_BRANCH}
          markerPos={[-0.08, 0.20, 0.50]}
          prob={predictions?.LAD?.probability}
          isSelected={selectedVessel === 'LAD'}
          isHovered={hoveredVessel === 'LAD'}
          onHover={onHoverVessel}
          onClick={onSelectVessel}
        />

        {/* LCX - Left Circumflex */}
        <ArteryVessel
          id="LCX"
          mainPoints={LCX_PATH}
          branchPoints={LCX_BRANCH}
          markerPos={[-0.42, 0.32, 0.28]}
          prob={predictions?.LCX?.probability}
          isSelected={selectedVessel === 'LCX'}
          isHovered={hoveredVessel === 'LCX'}
          onHover={onHoverVessel}
          onClick={onSelectVessel}
        />

        {/* RCA - Right Coronary Artery */}
        <ArteryVessel
          id="RCA"
          mainPoints={RCA_PATH}
          branchPoints={RCA_BRANCH}
          markerPos={[0.38, 0.22, 0.28]}
          prob={predictions?.RCA?.probability}
          isSelected={selectedVessel === 'RCA'}
          isHovered={hoveredVessel === 'RCA'}
          onHover={onHoverVessel}
          onClick={onSelectVessel}
        />
      </group>
    </>
  );
}

// Preload the realistic heart asset
useGLTF.preload('/models/heart.glb');

// Loading placeholder
function HeartLoadingSpinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-brand-dark/80 backdrop-blur-sm z-20 text-slate-300">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-brand-cyan/20 animate-ping" />
        <div className="w-16 h-16 rounded-full border-2 border-t-brand-cyan border-r-brand-cyan/40 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <div className="font-semibold text-sm text-white tracking-wide">Loading Anatomical Heart 3D...</div>
      <p className="text-xs text-slate-400 mt-1">Parsing high-resolution cardiac geometry and coronary pathways</p>
    </div>
  );
}

// Main Component
export default function HeartModel({ predictions }: { predictions: any }) {
  const [selectedVessel, setSelectedVessel] = useState<string | null>('LAD');
  const [hoveredVessel, setHoveredVessel] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [showAttribution, setShowAttribution] = useState<boolean>(false);
  const controlsRef = useRef<any>(null);

  // Default active vessel to LAD if predictions exist
  useEffect(() => {
    if (predictions && !selectedVessel) {
      setSelectedVessel('LAD');
    }
  }, [predictions]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
    }
  };

  const activeVesselKey = selectedVessel || hoveredVessel || 'LAD';
  const activePred = predictions ? predictions[activeVesselKey] : null;
  const activeDetails = VESSEL_DETAILS[activeVesselKey];
  const activeRisk = getRiskInfo(activePred?.probability);

  return (
    <div className="w-full flex flex-col rounded-2xl border border-border bg-card/70 backdrop-blur-md overflow-hidden shadow-xl glow-card">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-border bg-secondary/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
            <Layers size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm tracking-wide">3D Anatomical Heart & Coronary Tree</h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                Medical Reference
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Select or hover coronary arteries (LAD, LCX, RCA) to inspect predicted stenosis risk
            </p>
          </div>
        </div>

        {/* Quick Vessel Selector Pills */}
        <div className="flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border">
          {(['LAD', 'LCX', 'RCA'] as const).map((v) => {
            const prob = predictions?.[v]?.probability;
            const rInfo = getRiskInfo(prob);
            const isSel = selectedVessel === v;
            return (
              <button
                key={v}
                onClick={() => setSelectedVessel(v)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSel 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-secondary/60'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: rInfo.color }}
                />
                {v}
                {prob !== undefined && (
                  <span className="text-[10px] opacity-80 font-normal">
                    {(prob * 100).toFixed(0)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Canvas Area */}
      <div className="relative w-full h-[480px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Floating Controls Overlay (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleResetCamera}
            title="Reset View Orientation"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md transition-all flex items-center gap-1 text-xs"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:inline">Reset</span>
          </button>
          
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Turntable Rotation" : "Auto-Rotate Heart"}
            className={`p-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all flex items-center gap-1 text-xs ${
              autoRotate 
                ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan' 
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
            }`}
          >
            {autoRotate ? <Pause size={15} /> : <Play size={15} />}
            <span className="hidden sm:inline">Turntable</span>
          </button>

          <button
            onClick={() => setShowAttribution(!showAttribution)}
            title="Model License & Attribution"
            className={`p-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all flex items-center justify-center text-xs ${
              showAttribution 
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' 
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80'
            }`}
          >
            <Info size={15} />
          </button>
        </div>

        {/* License & Source Attribution Card */}
        {showAttribution && (
          <div className="absolute top-16 right-4 z-20 w-72 bg-slate-900/95 border border-slate-700/90 rounded-xl p-4 shadow-2xl backdrop-blur-md text-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                3D Asset Attribution
              </span>
              <button 
                onClick={() => setShowAttribution(false)} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300">
              <strong className="text-white">Realistic Human Heart</strong>
            </p>
            <p className="text-slate-400">
              Author: <span className="text-slate-200">neshallads</span>
            </p>
            <p className="text-slate-400">
              License:{' '}
              <a 
                href="http://creativecommons.org/licenses/by/4.0/" 
                target="_blank" 
                rel="noreferrer"
                className="text-brand-cyan hover:underline inline-flex items-center gap-0.5"
              >
                Creative Commons Attribution 4.0 (CC-BY-4.0)
                <ExternalLink size={10} />
              </a>
            </p>
            <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              Coronary arteries (LAD, LCX, RCA) and stenosis visualization pathways implemented in Three.js based on clinical cardiovascular CT anatomy references.
            </p>
          </div>
        )}

        {/* Risk Thresholds Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/85 border border-slate-800 rounded-xl p-3 shadow-lg backdrop-blur-md text-xs space-y-2 max-w-xs pointer-events-auto">
          <div className="font-semibold text-slate-200 flex items-center justify-between">
            <span>Predicted Stenosis Risk</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <ZoomIn size={12} /> Drag to rotate / Scroll to zoom
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shrink-0" />
              <span>&lt; 33% Low</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shrink-0" />
              <span>33-66% Med</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shrink-0" />
              <span>&gt; 66% High</span>
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <HeartErrorBoundary>
          <Suspense fallback={<HeartLoadingSpinner />}>
            <Canvas
              camera={{ position: [0, 0.1, 2.7], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
              className="w-full h-full"
            >
              <HeartScene
                predictions={predictions}
                autoRotate={autoRotate}
                selectedVessel={selectedVessel}
                hoveredVessel={hoveredVessel}
                onSelectVessel={setSelectedVessel}
                onHoverVessel={setHoveredVessel}
                controlsRef={controlsRef}
              />
            </Canvas>
          </Suspense>
        </HeartErrorBoundary>
      </div>

      {/* Bottom Vessel Detail Inspection Panel */}
      <div className="px-5 py-4 bg-secondary/20 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Column 1: Vessel Identification & Risk Score */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected Artery</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border flex items-center gap-1 ${activeRisk.badgeClass}`}>
                {activeRisk.icon}
                {activeRisk.label}
              </span>
            </div>
            <div className="text-base font-bold text-white flex items-baseline gap-2">
              <span>{activeDetails.fullName}</span>
              <span className="text-xs text-brand-cyan">({activeVesselKey})</span>
            </div>
            {activePred ? (
              <div className="text-xs text-slate-300">
                Predicted Stenosis Risk:{' '}
                <strong className="text-white text-sm">{(activePred.probability * 100).toFixed(1)}%</strong>
                {' '}— <span className="font-semibold text-white">{activePred.predicted_class}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Baseline Anatomical View — Submit patient profile in Patient Analysis tab to calculate model prediction.
              </div>
            )}
          </div>

          {/* Column 2: Myocardial Territory */}
          <div className="text-xs space-y-1 md:border-l md:border-border/60 md:pl-4">
            <span className="font-semibold text-slate-200 block">Myocardial Supply Territory</span>
            <p className="text-muted-foreground leading-relaxed">
              {activeDetails.territory}
            </p>
          </div>

          {/* Column 3: Clinical Impact & Course */}
          <div className="text-xs space-y-1 md:border-l md:border-border/60 md:pl-4">
            <span className="font-semibold text-slate-200 block">Clinical Significance & Course</span>
            <p className="text-muted-foreground leading-relaxed">
              {activeDetails.clinicalSignificance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
