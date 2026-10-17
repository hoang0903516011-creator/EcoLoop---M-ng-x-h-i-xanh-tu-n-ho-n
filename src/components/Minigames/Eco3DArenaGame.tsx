import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Coins,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Info,
  CheckCircle,
  HelpCircle,
  Play,
  Flame
} from 'lucide-react';
import { storage } from '../../services/storageService';

// Audio Synthesizer via Web Audio API (Zero-dependency, Zero-404)
class ProceduralAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playGrab() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      const now = this.ctx!.currentTime + idx * 0.06;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    });
  }

  playError() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

const sfx = new ProceduralAudio();

export type WasteBinType = 'organic' | 'recyclable' | 'hazardous' | 'residual';

interface WasteItem3DConfig {
  id: string;
  name: string;
  binType: WasteBinType;
  tip: string;
  modelType: 'bottle' | 'can' | 'battery' | 'apple' | 'carton' | 'bulb';
}

const WASTE_ITEMS_DATA: WasteItem3DConfig[] = [
  {
    id: 'w-bottle',
    name: 'Chai nhựa Lavie PET',
    binType: 'recyclable',
    tip: 'Nhựa PET nguyên sinh tái chế tuần hoàn thành sợi vải & chai mới',
    modelType: 'bottle',
  },
  {
    id: 'w-can',
    name: 'Lon nhôm Coca-Cola',
    binType: 'recyclable',
    tip: 'Nhôm tái chế tiết kiệm 95% năng lượng so với luyện quặng bauxit mới',
    modelType: 'can',
  },
  {
    id: 'w-battery',
    name: 'Pin tiểu AA độc hại',
    binType: 'hazardous',
    tip: 'Chứa chì & axit nặng, 1 viên pin có thể làm ô nhiễm 500L nước ngầm',
    modelType: 'battery',
  },
  {
    id: 'w-apple',
    name: 'Lõi quả táo hữu cơ',
    binType: 'organic',
    tip: 'Dễ phân hủy hiếu khí thành phân compost màu mỡ cho cây trồng',
    modelType: 'apple',
  },
  {
    id: 'w-carton',
    name: 'Hộp sữa Tetra Pak',
    binType: 'recyclable',
    tip: 'Có thể ép nhiệt tái sinh thành tấm lợp sinh thái & bột giấy cao cấp',
    modelType: 'carton',
  },
  {
    id: 'w-bulb',
    name: 'Bóng đèn huỳnh quang hỏng',
    binType: 'hazardous',
    tip: 'Chứa hơi thủy ngân nguy hiểm cho phổi, bắt buộc gom riêng vào thùng đỏ',
    modelType: 'bulb',
  },
];

export const Eco3DArenaGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [activeWasteIndex, setActiveWasteIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isCompletedRound, setIsCompletedRound] = useState<boolean>(false);
  const [claimedPoints, setClaimedPoints] = useState<boolean>(false);

  const currentItem = WASTE_ITEMS_DATA[activeWasteIndex % WASTE_ITEMS_DATA.length];

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const wasteObjectGroupRef = useRef<THREE.Group | null>(null);
  const binsMapRef = useRef<Map<WasteBinType, THREE.Group>>(new Map());
  const animationFrameIdRef = useRef<number | null>(null);

  // Mouse interaction for camera orbit
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ azimuth: number; elevation: number; distance: number }>({
    azimuth: 0,
    elevation: 0.38,
    distance: 14,
  });

  // Sound toggle
  const toggleSound = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    sfx.enabled = !newState;
  };

  // Build Procedural 3D Waste Item Group
  const createWasteModel = (type: WasteItem3DConfig['modelType']): THREE.Group => {
    const group = new THREE.Group();

    if (type === 'battery') {
      // 3-part composite AA battery: body cylinder, positive nipple cap, wrap ring
      const bodyGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.8, 24);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.25,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = true;
      group.add(bodyMesh);

      // Gold copper top ring
      const goldRingGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.5, 24);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const goldMesh = new THREE.Mesh(goldRingGeo, goldMat);
      goldMesh.position.y = 0.65;
      group.add(goldMesh);

      // Positive tip terminal
      const tipGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16);
      const tipMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.1,
      });
      const tipMesh = new THREE.Mesh(tipGeo, tipMat);
      tipMesh.position.y = 1.0;
      group.add(tipMesh);

      // Warning hazard red stripe
      const stripeGeo = new THREE.CylinderGeometry(0.565, 0.565, 0.15, 24);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
      const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
      stripeMesh.position.y = 0.1;
      group.add(stripeMesh);
    } else if (type === 'bottle') {
      // 4-part transparent plastic bottle: base, tapered shoulder, threaded neck, blue cap
      const baseGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.6, 24);
      const bottleMat = new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        transmission: 0.9,
        opacity: 1,
        transparent: true,
        roughness: 0.1,
        ior: 1.5,
        thickness: 0.8,
      });
      const baseMesh = new THREE.Mesh(baseGeo, bottleMat);
      baseMesh.castShadow = true;
      group.add(baseMesh);

      // Tapered shoulder cone
      const coneGeo = new THREE.ConeGeometry(0.65, 0.6, 24, 1, true);
      const coneMesh = new THREE.Mesh(coneGeo, bottleMat);
      coneMesh.position.y = 1.1;
      group.add(coneMesh);

      // Blue label wrap
      const labelGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.6, 24);
      const labelMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.35,
        metalness: 0.1,
      });
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.y = 0.1;
      group.add(labelMesh);

      // Cap
      const capGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.3, 16);
      const capMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4 });
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = 1.55;
      group.add(capMesh);
    } else if (type === 'can') {
      // Aluminum drink can with beveled rims and metallic finish
      const canGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.8, 24);
      const canMat = new THREE.MeshStandardMaterial({
        color: 0xef4444, // Coca-red
        metalness: 0.7,
        roughness: 0.25,
      });
      const canMesh = new THREE.Mesh(canGeo, canMat);
      canMesh.castShadow = true;
      group.add(canMesh);

      // Silver top rim
      const rimGeo = new THREE.CylinderGeometry(0.62, 0.65, 0.2, 24);
      const silverMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.95,
        roughness: 0.15,
      });
      const topRim = new THREE.Mesh(rimGeo, silverMat);
      topRim.position.y = 0.95;
      group.add(topRim);

      // Silver pull tab
      const tabGeo = new THREE.BoxGeometry(0.2, 0.05, 0.35);
      const tabMesh = new THREE.Mesh(tabGeo, silverMat);
      tabMesh.position.set(0.1, 1.05, 0);
      group.add(tabMesh);
    } else if (type === 'apple') {
      // Organic apple: spherical deformed core, stem, green leaf
      const appleGeo = new THREE.SphereGeometry(0.85, 20, 20);
      const appleMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.35,
        metalness: 0.05,
      });
      const appleMesh = new THREE.Mesh(appleGeo, appleMat);
      appleMesh.scale.set(1, 0.9, 1);
      appleMesh.castShadow = true;
      group.add(appleMesh);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.45, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.85;
      stem.rotation.z = 0.15;
      group.add(stem);

      // Leaf
      const leafGeo = new THREE.ConeGeometry(0.2, 0.45, 6);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.18, 0.9, 0);
      leaf.rotation.z = -0.9;
      group.add(leaf);
    } else if (type === 'carton') {
      // Milk carton: box hull + pitched gable roof
      const boxGeo = new THREE.BoxGeometry(1.0, 1.4, 0.9);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.35,
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.castShadow = true;
      group.add(boxMesh);

      // Triangular roof
      const roofGeo = new THREE.CylinderGeometry(0.1, 0.7, 0.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const roofMesh = new THREE.Mesh(roofGeo, roofMat);
      roofMesh.position.y = 0.95;
      roofMesh.rotation.y = Math.PI / 4;
      group.add(roofMesh);
    } else {
      // Fluorescent tube bulb (hazardous)
      const tubeGeo = new THREE.CylinderGeometry(0.22, 0.22, 2.4, 16);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      });
      const tube = new THREE.Mesh(tubeGeo, glassMat);
      tube.castShadow = true;
      group.add(tube);

      // Metal end caps
      const capMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const capTop = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.25, 16), capMat);
      capTop.position.y = 1.25;
      group.add(capTop);
      const capBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.25, 16), capMat);
      capBottom.position.y = -1.25;
      group.add(capBottom);
    }

    return group;
  };

  // Build a 3D Recycling Bin Model
  const createBin3DModel = (type: WasteBinType): THREE.Group => {
    const binGroup = new THREE.Group();

    let binColor = 0x10b981; // Green organic
    if (type === 'recyclable') binColor = 0xf59e0b; // Yellow
    if (type === 'hazardous') binColor = 0xef4444; // Red
    if (type === 'residual') binColor = 0x64748b; // Gray

    // Tapered bin body
    const bodyGeo = new THREE.CylinderGeometry(1.1, 0.85, 2.4, 20);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: binColor,
      roughness: 0.35,
      metalness: 0.15,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 1.2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    binGroup.add(bodyMesh);

    // Colored lid with beveled rim
    const lidGeo = new THREE.CylinderGeometry(1.2, 1.15, 0.35, 20);
    const lidMat = new THREE.MeshStandardMaterial({
      color: binColor,
      roughness: 0.25,
      metalness: 0.2,
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = 2.45;
    binGroup.add(lidMesh);

    // Opening slot
    const slotGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16);
    const slotMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
    const slotMesh = new THREE.Mesh(slotGeo, slotMat);
    slotMesh.position.y = 2.65;
    binGroup.add(slotMesh);

    // Bin base rim
    const baseRimGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.15, 20);
    const baseRimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const baseRimMesh = new THREE.Mesh(baseRimGeo, baseRimMat);
    baseRimMesh.position.y = 0.08;
    binGroup.add(baseRimMesh);

    // Bin label badge
    const badgeGeo = new THREE.PlaneGeometry(0.8, 0.5);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0, 1.4, 0.98);
    binGroup.add(badgeMesh);

    // Contact shadow beneath bin
    const shadowGeo = new THREE.CircleGeometry(1.2, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x022c22,
      transparent: true,
      opacity: 0.25,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    binGroup.add(shadowMesh);

    return binGroup;
  };

  // Build Scene & Mount WebGL Renderer
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Slate-900 night-sky
    scene.fog = new THREE.FogExp2(0x0f172a, 0.028);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig (Warm Key Light, Cool Sky Fill, Soft Rim)
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x059669, 0.65);
    scene.add(hemiLight);

    const dirKeyLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    dirKeyLight.position.set(6, 12, 8);
    dirKeyLight.castShadow = true;
    dirKeyLight.shadow.mapSize.width = 1024;
    dirKeyLight.shadow.mapSize.height = 1024;
    dirKeyLight.shadow.bias = -0.0005;
    dirKeyLight.shadow.normalBias = 0.02;
    dirKeyLight.shadow.camera.left = -10;
    dirKeyLight.shadow.camera.right = 10;
    dirKeyLight.shadow.camera.top = 10;
    dirKeyLight.shadow.camera.bottom = -10;
    scene.add(dirKeyLight);

    const rimLight = new THREE.PointLight(0x34d399, 1.2, 20);
    rimLight.position.set(-8, 5, -6);
    scene.add(rimLight);

    // 5. Procedural Grassy Arena Ground with Hex Grid Accents
    const groundGeo = new THREE.CylinderGeometry(11, 11, 0.6, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Deep emerald ground
      roughness: 0.7,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.3;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Outer decorative platform ring
    const ringGeo = new THREE.TorusGeometry(11, 0.25, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.4 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.01;
    scene.add(ringMesh);

    // Procedural Low-poly Trees on Perimeter
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const radius = 8.8;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      const treeGroup = new THREE.Group();
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.2, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Leaves (2-tier foliage)
      const leafGeo1 = new THREE.ConeGeometry(0.9, 1.4, 8);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 });
      const leaves1 = new THREE.Mesh(leafGeo1, leafMat);
      leaves1.position.y = 1.6;
      leaves1.castShadow = true;
      treeGroup.add(leaves1);

      const leafGeo2 = new THREE.ConeGeometry(0.65, 1.1, 8);
      const leaves2 = new THREE.Mesh(leafGeo2, leafMat);
      leaves2.position.y = 2.4;
      leaves2.castShadow = true;
      treeGroup.add(leaves2);

      treeGroup.position.set(tx, 0, tz);
      scene.add(treeGroup);
    }

    // 6. Spawn 4 Color-Coded 3D Waste Bins
    const binsMap = new Map<WasteBinType, THREE.Group>();
    const binPositions: { type: WasteBinType; x: number; z: number }[] = [
      { type: 'organic', x: -4.5, z: 2.2 },
      { type: 'recyclable', x: -1.5, z: 3.2 },
      { type: 'hazardous', x: 1.5, z: 3.2 },
      { type: 'residual', x: 4.5, z: 2.2 },
    ];

    binPositions.forEach(({ type, x, z }) => {
      const binGroup = createBin3DModel(type);
      binGroup.position.set(x, 0, z);
      binGroup.rotation.y = Math.atan2(-x, 10 - z); // Face center
      scene.add(binGroup);
      binsMap.set(type, binGroup);
    });
    binsMapRef.current = binsMap;

    // 7. Spawn Center Hero Waste Object Group
    const wasteGroup = new THREE.Group();
    wasteGroup.position.set(0, 2.5, -0.5);
    scene.add(wasteGroup);
    wasteObjectGroupRef.current = wasteGroup;

    // Load initial item
    loadCurrentWasteModel(wasteGroup, currentItem.modelType);

    // 8. Animation & Render Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Floating / Bobbing animation for center waste object
      if (wasteObjectGroupRef.current) {
        wasteObjectGroupRef.current.rotation.y += delta * 1.2;
        wasteObjectGroupRef.current.position.y = 2.4 + Math.sin(elapsed * 2.5) * 0.25;
      }

      // Smooth camera position update
      updateCameraPosition();

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update camera angle helper
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { azimuth, elevation, distance } = cameraAngleRef.current;
    const x = distance * Math.cos(elevation) * Math.sin(azimuth);
    const y = distance * Math.sin(elevation);
    const z = distance * Math.cos(elevation) * Math.cos(azimuth);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 1.2, 0.5);
  };

  // Helper to load model into center waste group
  const loadCurrentWasteModel = (group: THREE.Group, modelType: WasteItem3DConfig['modelType']) => {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }
    const newMesh = createWasteModel(modelType);
    group.add(newMesh);
  };

  // Whenever active item changes, reload model
  useEffect(() => {
    if (wasteObjectGroupRef.current) {
      loadCurrentWasteModel(wasteObjectGroupRef.current, currentItem.modelType);
    }
  }, [activeWasteIndex]);

  // Handle Dragging to Orbit Camera
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.azimuth -= deltaX * 0.007;
    cameraAngleRef.current.elevation = Math.max(
      0.15,
      Math.min(1.2, cameraAngleRef.current.elevation + deltaY * 0.007)
    );

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // User Action: Sort current item into selected bin
  const handleSortIntoBin = (selectedBin: WasteBinType) => {
    if (feedback) return; // Prevent spam

    sfx.playGrab();

    const isCorrect = currentItem.binType === selectedBin;
    if (isCorrect) {
      sfx.playSuccess();
      const pointsEarned = 15 + streak * 5;
      const nextScore = score + pointsEarned;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);

      setFeedback({
        isCorrect: true,
        message: `Chính xác! ${currentItem.name} thuộc ${getBinName(selectedBin)}. +${pointsEarned} điểm!`,
      });

      // Confetti burst for combo
      if (nextStreak % 3 === 0) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      sfx.playError();
      setStreak(0);
      setFeedback({
        isCorrect: false,
        message: `Chưa đúng! ${currentItem.name} phải bỏ vào ${getBinName(currentItem.binType)}. ${currentItem.tip}`,
      });
    }

    // Advance to next item after delay
    setTimeout(() => {
      setFeedback(null);
      if (activeWasteIndex + 1 < WASTE_ITEMS_DATA.length) {
        setActiveWasteIndex((prev) => prev + 1);
      } else {
        setIsCompletedRound(true);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      }
    }, 1400);
  };

  const handleClaimEcoPoints = () => {
    if (claimedPoints) return;
    setClaimedPoints(true);
    storage.addEcoPoints(40, 'Đấu trường nhặt rác 3D WebGL', `Đạt ${score} điểm xuất sắc trong không gian 3D`);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  const handleRestartGame = () => {
    setActiveWasteIndex(0);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setIsCompletedRound(false);
    setClaimedPoints(false);
  };

  const getBinName = (bin: WasteBinType) => {
    switch (bin) {
      case 'organic':
        return 'Thùng Hữu Cơ (Xanh Lá)';
      case 'recyclable':
        return 'Thùng Tái Chế (Vàng)';
      case 'hazardous':
        return 'Thùng Nguy Hại (Đỏ)';
      case 'residual':
        return 'Thùng Vô Cơ Khác (Xám)';
    }
  };

  return (
    <div className="bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative select-none">
      {/* Top HUD Spec & Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Game Title and Item Info */}
        <div className="bg-slate-900/90 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg pointer-events-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Vật thể 3D #{activeWasteIndex + 1}/{WASTE_ITEMS_DATA.length}
              </span>
              {streak > 1 && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-slate-950" />
                  <span>x{streak} Chuỗi</span>
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">{currentItem.name}</h3>
          </div>
        </div>

        {/* Right: Score & Audio controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-2 text-white">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold font-mono tabular-nums">{score} pts</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xs border border-white/10 text-white hover:bg-slate-800 transition-colors shadow-lg"
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={handleRestartGame}
            className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-xs border border-white/10 text-white hover:bg-slate-800 transition-colors shadow-lg"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-[520px] sm:h-[580px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Feedback Banner Overlay */}
      {feedback && (
        <div
          className={`absolute top-20 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 animate-in fade-in flex items-center gap-2 ${
            feedback.isCorrect
              ? 'bg-emerald-600/95 text-white border border-emerald-400'
              : 'bg-rose-600/95 text-white border border-rose-400'
          }`}
        >
          {feedback.isCorrect ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Round Completion Modal Overlay */}
      {isCompletedRound && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl text-white">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black">Xuất Sắc! Hoàn Thành Đấu Trường 3D</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn đã phân loại chính xác toàn bộ các vật phẩm 3D và đạt{' '}
              <strong className="text-amber-300 font-mono text-sm">{score} điểm</strong>!
            </p>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-white/5 text-xs text-emerald-300">
              Nhận ngay +40 EcoPoints vào ví để đổi chậu sen đá & quà tặng xanh.
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestartGame}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại</span>
              </button>

              <button
                onClick={handleClaimEcoPoints}
                disabled={claimedPoints}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all ${
                  claimedPoints
                    ? 'bg-emerald-800 text-emerald-200 cursor-default'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white active:scale-95'
                }`}
              >
                {claimedPoints ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-300" />
                    <span>Đã nhận +40 pts</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 text-amber-200" />
                    <span>Nhận +40 EcoPoints</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock (Compliant with Three.js Skill) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-2xl">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-3 sm:p-4 text-white transition-all">
          {/* Dock Header with Collapse/Expand button */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-400">Chọn thùng rác tương ứng:</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">(Kéo chuột để xoay 360°)</span>
            </div>

            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
            >
              <span>{isDockCollapsed ? 'Mở rộng điều khiển' : 'Thu gọn'}</span>
              {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 4 Interactive Bin Buttons */}
          {!isDockCollapsed && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Organic Bin */}
              <button
                onClick={() => handleSortIntoBin('organic')}
                className="group p-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-800 border border-emerald-500/40 text-left transition-all active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-400">Hữu Cơ</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-100 group-hover:text-white">
                  Thức ăn, vỏ trái cây
                </div>
              </button>

              {/* Recyclable Bin */}
              <button
                onClick={() => handleSortIntoBin('recyclable')}
                className="group p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-800 border border-amber-500/40 text-left transition-all active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300">Tái Chế</span>
                </div>
                <div className="text-[11px] font-bold text-amber-100 group-hover:text-white">
                  Chai nhựa, Lon, Giấy
                </div>
              </button>

              {/* Hazardous Bin */}
              <button
                onClick={() => handleSortIntoBin('hazardous')}
                className="group p-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-800 border border-rose-500/40 text-left transition-all active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-rose-300">Nguy Hại</span>
                </div>
                <div className="text-[11px] font-bold text-rose-100 group-hover:text-white">
                  Pin cũ, Bóng đèn
                </div>
              </button>

              {/* Residual Bin */}
              <button
                onClick={() => handleSortIntoBin('residual')}
                className="group p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-left transition-all active:scale-95 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold text-slate-300">Vô Cơ Khác</span>
                </div>
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-white">
                  Hộp xốp bẩn, túi rác
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
