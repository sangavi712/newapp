"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Minus, 
  Send,
  Sparkles,
  Volume1
} from 'lucide-react';
import { api } from '@/lib/api';

const detectLanguage = (text: string): string => {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
  return 'en-US';
};

// Procedural Fur Texture Generator
function createFurTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const val = Math.floor(Math.random() * 60 + 190); 
      ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export default function CatCompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("Meow! I am your AI companion. Tap the mic or type to talk to me! 🐾");
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiParticles, setConfettiParticles] = useState<any[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animation Refs
  const catStateRef = useRef<'idle'|'walk'|'jump'|'dance'|'caring'|'sleep'|'wave'|'sit'>('idle');
  const idleSubStateRef = useRef<'normal'|'lookAround'|'stretch'|'sit'>('normal');
  const isSpeakingAnimRef = useRef(false);

  // Sync refs
  const isMutedRef = useRef(isMuted);
  const voiceEnabledRef = useRef(voiceEnabled);
  const isListeningRef = useRef(isListening);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    isMutedRef.current = isMuted;
    isListeningRef.current = isListening;
    voiceEnabledRef.current = voiceEnabled;
  }, [isMuted, isListening, voiceEnabled]);

  useEffect(() => {
    localStorage.setItem('ai_voice_enabled', String(voiceEnabled));
    if (voiceEnabled) {
      const welcomeMsg = "Meow! AI Voice is enabled! I will speak naturally to motivate you! 🐾🌟";
      setSpeechBubble(welcomeMsg);
      speakResponse(welcomeMsg, true);
    }
  }, [voiceEnabled]);

  useEffect(() => {
    const savedVoice = localStorage.getItem('ai_voice_enabled');
    if (savedVoice === 'true') setVoiceEnabled(true);
  }, []);

  const triggerConfetti = () => {
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      size: 6 + Math.random() * 8,
      color: ['#ffb3d9', '#b3d9ff', '#ffffb3', '#d9ffb3', '#8b5cf6', '#ec4899', '#f43f5e'][Math.floor(Math.random() * 7)],
      delay: Math.random() * 1.5,
      duration: 1.8 + Math.random() * 1.5,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
      rotation: Math.random() * 360,
    }));
    setConfettiParticles(particles);
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); setConfettiParticles([]); }, 5000);
  };

  const playSoftPurr = () => {
    if (isMutedRef.current) return;
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(90, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        setTimeout(() => oscillator.stop(), 600);
      } catch (_) {}
    }
  };

  const speakResponse = (reply: string, force = false) => {
    lastInteractionTimeRef.current = Date.now();
    if (isMutedRef.current) return;
    if (!force && !voiceEnabledRef.current) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = reply.replace(/\*.*?\*/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      const langCode = detectLanguage(cleanText);
      utterance.lang = langCode;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.lang.replace('_', '-').startsWith(langCode.substring(0, 2)));
      if (matchedVoice) utterance.voice = matchedVoice;

      utterance.onstart = () => { isSpeakingAnimRef.current = true; };
      const stopSpeaking = () => {
        isSpeakingAnimRef.current = false;
        if (voiceEnabledRef.current && !isListeningRef.current) {
          setTimeout(() => document.getElementById('cat-mic-btn')?.click(), 500);
        }
      };
      utterance.onend = stopSpeaking;
      utterance.onerror = stopSpeaking;
      window.speechSynthesis.speak(utterance);
    }
  };

  // High-Fidelity 3D Talking Tom Style Renderer (True Sky Blue + Hanging Collar)
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const width = 200;
    const height = 200;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 10);
    camera.position.set(0, 0.35, 3.0);
    camera.lookAt(0, 0.05, 0);
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Advanced Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Brightened ambient
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8); 
    mainLight.position.set(2, 4, 3);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 10;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const rimLight1 = new THREE.DirectionalLight(0xffffff, 0.5); // White rim to avoid yellow/green mixing
    rimLight1.position.set(-3, 2, -2);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xffffff, 0.5); 
    rimLight2.position.set(3, -1, -2);
    scene.add(rimLight2);

    // ==========================================
    // 1. NATURE BACKGROUND
    // ==========================================
    const envGroup = new THREE.Group();
    envGroup.position.set(0, -0.28, -0.6);
    scene.add(envGroup);

    const furTexture = createFurTexture();
    const grassMat = new THREE.MeshStandardMaterial({ 
      color: 0x88cc88, 
      roughness: 1.0,
      bumpMap: furTexture,
      bumpScale: 0.01
    });
    const floorGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32);
    const floor = new THREE.Mesh(floorGeo, grassMat);
    floor.position.y = -0.025;
    floor.receiveShadow = true;
    envGroup.add(floor);

    const trunkGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.3, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
    const leavesGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x3cb371, roughness: 0.9, bumpMap: furTexture, bumpScale: 0.02 });

    const createTree = (x: number, z: number, scale: number) => {
      const tGroup = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.15;
      trunk.castShadow = true;
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 0.35;
      leaves.scale.set(1, 0.8, 1);
      leaves.castShadow = true;
      tGroup.add(trunk);
      tGroup.add(leaves);
      tGroup.position.set(x, 0, z);
      tGroup.scale.set(scale, scale, scale);
      envGroup.add(tGroup);
    };

    createTree(-0.4, -0.2, 1.2);
    createTree(0.5, -0.1, 1.0);

    const bushGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const createBush = (x: number, z: number) => {
      const bush = new THREE.Mesh(bushGeo, leavesMat);
      bush.position.set(x, 0.05, z);
      bush.castShadow = true;
      envGroup.add(bush);
    };
    createBush(0.3, 0.2);
    createBush(-0.35, 0.15);

    // ==========================================
    // 2. THE SKY BLUE CAT 
    // ==========================================
    const catGroup = new THREE.Group();
    catGroup.rotation.y = -Math.PI / 6;
    scene.add(catGroup);

    const plushMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x55c2ff, // Vibrant, clear sky blue
      roughness: 0.9, 
      metalness: 0.0,
      bumpMap: furTexture,
      bumpScale: 0.02
    });
    const pinkMaterial = new THREE.MeshStandardMaterial({ color: 0xff88aa, roughness: 0.5 });
    const mouthDarkMaterial = new THREE.MeshStandardMaterial({ color: 0xaa3355, roughness: 0.9 });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
    const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.9 }); // Shiny gold
    const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Fatter Body for fluffiness
    const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.22, 32, 32);
    const body = new THREE.Mesh(bodyGeo, plushMaterial);
    body.rotation.x = Math.PI / 2;
    body.position.set(0, 0, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    catGroup.add(body);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.18, 0.18); 
    catGroup.add(headGroup);

    const headGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const head = new THREE.Mesh(headGeo, plushMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    headGroup.add(head);

    // SNOUT
    const snoutGeo = new THREE.SphereGeometry(0.1, 32, 32);
    const snout = new THREE.Mesh(snoutGeo, plushMaterial);
    snout.scale.set(1.4, 0.8, 1);
    snout.position.set(0, -0.06, 0.2);
    snout.castShadow = true;
    headGroup.add(snout);

    // NOSE
    const noseGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const nose = new THREE.Mesh(noseGeo, pinkMaterial);
    nose.position.set(0, 0.04, 0.09);
    snout.add(nose);

    // JAW (Talking Tom moving mouth)
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.05, 0.18); 
    headGroup.add(jawGroup);

    const jawGeo = new THREE.SphereGeometry(0.08, 32, 32);
    const jaw = new THREE.Mesh(jawGeo, plushMaterial);
    jaw.scale.set(1.1, 0.6, 0.9);
    jaw.position.set(0, -0.04, 0.03); 
    jaw.castShadow = true;
    jawGroup.add(jaw);

    const mouthInsideGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const mouthInside = new THREE.Mesh(mouthInsideGeo, mouthDarkMaterial);
    mouthInside.scale.set(1, 0.5, 0.8);
    mouthInside.position.set(0, -0.02, 0.02);
    jawGroup.add(mouthInside);

    // EYES & CATCHLIGHTS
    const eyeGeo = new THREE.SphereGeometry(0.05, 32, 32);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMaterial);
    eyeL.position.set(-0.1, 0.05, 0.2);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMaterial);
    eyeR.position.set(0.1, 0.05, 0.2);

    const sparkleGeo = new THREE.SphereGeometry(0.014, 16, 16);
    const sparkleL = new THREE.Mesh(sparkleGeo, sparkleMaterial);
    sparkleL.position.set(0.025, 0.025, 0.04);
    eyeL.add(sparkleL);
    
    const sparkleR = new THREE.Mesh(sparkleGeo, sparkleMaterial);
    sparkleR.position.set(0.025, 0.025, 0.04);
    eyeR.add(sparkleR);

    headGroup.add(eyeL);
    headGroup.add(eyeR);

    // EARS
    const earGeo = new THREE.ConeGeometry(0.08, 0.2, 32);
    earGeo.translate(0, 0.1, 0); 
    
    const earL = new THREE.Mesh(earGeo, plushMaterial);
    earL.position.set(-0.14, 0.16, 0.05);
    earL.rotation.set(-0.1, 0, 0.35);
    earL.castShadow = true;
    
    const innerEarGeo = new THREE.ConeGeometry(0.05, 0.16, 16);
    innerEarGeo.translate(0, 0.08, 0);
    const innerEarL = new THREE.Mesh(innerEarGeo, pinkMaterial);
    innerEarL.position.set(0, 0.02, 0.035);
    earL.add(innerEarL);
    headGroup.add(earL);

    const earR = new THREE.Mesh(earGeo, plushMaterial);
    earR.position.set(0.14, 0.16, 0.05);
    earR.rotation.set(-0.1, 0, -0.35);
    earR.castShadow = true;
    
    const innerEarR = new THREE.Mesh(innerEarGeo, pinkMaterial);
    innerEarR.position.set(0, 0.02, 0.035);
    earR.add(innerEarR);
    headGroup.add(earR);

    // HANGING GOLD COLLAR (Attached to Body to hang loose from head)
    const collarGroup = new THREE.Group();
    collarGroup.position.set(0, 0.04, 0.2); // Positioned low on the neck/chest
    collarGroup.rotation.x = 1.3; // Tilted to hang down loosely
    catGroup.add(collarGroup);

    const collarGeo = new THREE.TorusGeometry(0.18, 0.015, 16, 32);
    const collar = new THREE.Mesh(collarGeo, goldMaterial);
    collar.castShadow = true;
    collarGroup.add(collar);

    const bellGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const bell = new THREE.Mesh(bellGeo, goldMaterial);
    bell.position.set(0, -0.18, 0); // Bell at the lowest point
    bell.castShadow = true;
    collarGroup.add(bell);

    // LEGS & PAWS
    const legGeo = new THREE.CapsuleGeometry(0.04, 0.15, 16, 16);
    legGeo.translate(0, -0.075, 0); 
    const pawGeo = new THREE.SphereGeometry(0.05, 16, 16);
    pawGeo.scale(1, 0.6, 1.2);

    const createLeg = (x: number, z: number) => {
      const leg = new THREE.Mesh(legGeo, plushMaterial);
      leg.position.set(x, -0.1, z);
      leg.castShadow = true;
      const paw = new THREE.Mesh(pawGeo, plushMaterial);
      paw.position.set(0, -0.16, 0.02);
      paw.castShadow = true;
      leg.add(paw);
      catGroup.add(leg);
      return leg;
    };

    const fLegL = createLeg(-0.12, 0.16);
    const fLegR = createLeg(0.12, 0.16);
    const bLegL = createLeg(-0.12, -0.16);
    const bLegR = createLeg(0.12, -0.16);

    // TAIL
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.05, -0.28);
    catGroup.add(tailGroup);

    const tailGeo = new THREE.CapsuleGeometry(0.04, 0.35, 16, 16);
    tailGeo.translate(0, 0.175, 0); 
    const tail = new THREE.Mesh(tailGeo, plushMaterial);
    tail.rotation.x = -0.5;
    tail.castShadow = true;
    tailGroup.add(tail);

    // ==========================================
    // 3. TOY BALL
    // ==========================================
    const ballGroup = new THREE.Group();
    scene.add(ballGroup);

    const ballGeo = new THREE.SphereGeometry(0.06, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.2, metalness: 0.1 });
    const toyBall = new THREE.Mesh(ballGeo, ballMat);
    toyBall.castShadow = true;
    ballGroup.add(toyBall);

    // Animation variables
    let t = 0;
    let blinkTimer = 0;
    let ballT = 0;
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      t += 0.025;
      blinkTimer += 0.025;

      // Natural Blinking
      if (blinkTimer > 3.0) {
        eyeL.scale.y = 0.1;
        eyeR.scale.y = 0.1;
        if (blinkTimer > 3.1) blinkTimer = 0;
      } else {
        eyeL.scale.y = 1;
        eyeR.scale.y = 1;
      }

      // Reset base transforms
      catGroup.position.set(0, 0, 0);
      headGroup.rotation.set(0, 0, 0);
      fLegL.rotation.set(0, 0, 0);
      fLegR.rotation.set(0, 0, 0);
      bLegL.rotation.set(0, 0, 0);
      bLegR.rotation.set(0, 0, 0);
      tailGroup.rotation.set(0, 0, 0);
      jawGroup.rotation.set(0, 0, 0);
      earL.rotation.set(-0.1, 0, 0.35);
      earR.rotation.set(-0.1, 0, -0.35);

      // "Talking Tom" Lip Sync & Head Nod & Collar Shake
      if (isSpeakingAnimRef.current) {
         headGroup.rotation.x = Math.sin(t * 12) * 0.05;
         jawGroup.rotation.x = Math.abs(Math.sin(t * 25)) * 0.4; // Jaw moves
         collarGroup.rotation.x = 1.3 + Math.sin(t * 15) * 0.05; // Collar shakes slightly while talking
      } else {
         collarGroup.rotation.x = 1.3 + Math.sin(t * 3) * 0.05; // Gentle swinging when idle
      }

      const state = catStateRef.current;
      const subState = idleSubStateRef.current;

      if (state === 'walk') {
        catGroup.position.y = Math.abs(Math.sin(t * 8)) * 0.04;
        fLegL.rotation.x = Math.sin(t * 8) * 0.5;
        fLegR.rotation.x = Math.sin(t * 8 + Math.PI) * 0.5;
        bLegL.rotation.x = Math.sin(t * 8 + Math.PI) * 0.5;
        bLegR.rotation.x = Math.sin(t * 8) * 0.5;
        tailGroup.rotation.z = Math.sin(t * 4) * 0.2;
        headGroup.rotation.y = Math.sin(t * 2) * 0.1;
        collarGroup.rotation.x = 1.3 + Math.sin(t * 8) * 0.15; // Swing collar while walking
      } else if (state === 'jump') {
        catGroup.position.y = Math.abs(Math.sin(t * 6)) * 0.35;
        fLegL.rotation.x = 0.3;
        fLegR.rotation.x = 0.3;
        bLegL.rotation.x = -0.3;
        bLegR.rotation.x = -0.3;
        tailGroup.rotation.x = Math.sin(t * 6) * 0.3;
        collarGroup.rotation.x = 1.3 + Math.cos(t * 6) * 0.3; // Big swing when jumping
      } else if (state === 'dance') {
        catGroup.position.y = Math.abs(Math.sin(t * 10)) * 0.1;
        catGroup.rotation.z = Math.sin(t * 5) * 0.2; 
        headGroup.rotation.z = Math.sin(t * 10) * 0.2;
        fLegL.rotation.z = Math.sin(t * 10) * 0.4;
        fLegR.rotation.z = Math.sin(t * 10) * 0.4;
        tailGroup.rotation.z = Math.sin(t * 15) * 0.4;
      } else if (state === 'sit' || subState === 'sit') {
        catGroup.position.y = -0.15;
        catGroup.rotation.x = -0.2;
        headGroup.rotation.x = 0.2;
        bLegL.rotation.x = -1.2;
        bLegR.rotation.x = -1.2;
        fLegL.rotation.x = 0.2;
        fLegR.rotation.x = 0.2;
        tailGroup.rotation.x = 0.8;
        tailGroup.rotation.z = Math.sin(t * 2) * 0.1;
      } else if (state === 'sleep') {
        catGroup.position.y = -0.25;
        catGroup.rotation.x = -0.1;
        headGroup.rotation.x = 0.4;
        bLegL.rotation.x = -1.2;
        bLegR.rotation.x = -1.2;
        fLegL.rotation.x = -1.2;
        fLegR.rotation.x = -1.2;
        eyeL.scale.y = 0.02;
        eyeR.scale.y = 0.02;
        blinkTimer = 0; 
        catGroup.position.y = -0.25 + Math.sin(t * 2) * 0.015; 
      } else if (state === 'wave') {
        fLegR.rotation.z = -1.8 + Math.sin(t * 12) * 0.4;
        fLegR.rotation.x = 0.8;
        headGroup.rotation.z = 0.1;
        tailGroup.rotation.z = Math.sin(t * 4) * 0.2;
      } else {
        // IDLE - Breathing
        catGroup.position.y = Math.sin(t * 3) * 0.005; 
        tailGroup.rotation.z = Math.sin(t * 1.5) * 0.15;
        
        if (Math.random() < 0.005) earL.rotation.z += 0.2;
        if (Math.random() < 0.005) earR.rotation.z -= 0.2;
        
        if (subState === 'lookAround') {
           headGroup.rotation.y = Math.sin(t * 1.5) * 0.6;
           headGroup.rotation.x = Math.sin(t * 0.8) * 0.15;
        } else if (subState === 'stretch') {
           catGroup.position.y = -0.1;
           fLegL.rotation.x = -0.8;
           fLegR.rotation.x = -0.8;
           bLegL.rotation.x = 0.2;
           bLegR.rotation.x = 0.2;
           headGroup.rotation.x = -0.2;
           tailGroup.rotation.x = -0.8;
        }
      }

      // Ball Logic
      if (isSpeakingAnimRef.current) {
        // Ball rolls away
        ballGroup.position.lerp(new THREE.Vector3(0.5, -0.22, -0.2), 0.05);
        toyBall.rotation.z -= 0.02;
        toyBall.rotation.x -= 0.02;
      } else if (state === 'idle') {
        // Ball plays between paws
        ballT += 0.04;
        const targetX = Math.sin(ballT * 2) * 0.15;
        const targetZ = 0.25 + Math.abs(Math.sin(ballT * 4)) * 0.05;
        ballGroup.position.lerp(new THREE.Vector3(targetX, -0.22, targetZ), 0.1);
        toyBall.rotation.z -= 0.05 * Math.sign(Math.cos(ballT * 2));
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      bodyGeo.dispose();
      headGeo.dispose();
      plushMaterial.dispose();
      if (furTexture) furTexture.dispose();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const idleTimer = setInterval(() => {
      if (catStateRef.current === 'idle') {
        const rand = Math.random();
        if (rand < 0.3) {
          idleSubStateRef.current = 'lookAround';
          setTimeout(() => { if (idleSubStateRef.current === 'lookAround') idleSubStateRef.current = 'normal'; }, 3500);
        } else if (rand < 0.55) {
          idleSubStateRef.current = 'sit';
          setTimeout(() => { if (idleSubStateRef.current === 'sit') idleSubStateRef.current = 'normal'; }, 5500);
        } else if (rand < 0.75) {
          idleSubStateRef.current = 'stretch';
          setTimeout(() => { if (idleSubStateRef.current === 'stretch') idleSubStateRef.current = 'normal'; }, 2500);
        } else {
          catStateRef.current = 'wave';
          setTimeout(() => { if (catStateRef.current === 'wave') catStateRef.current = 'idle'; }, 2200);
        }
      }
    }, 4500);
    return () => clearInterval(idleTimer);
  }, [isOpen]);

  useEffect(() => {
    const checkInTimer = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteractionTimeRef.current;
      if (timeSinceInteraction > 75000 && voiceEnabledRef.current && catStateRef.current === 'idle') {
        const motivationMessages = [
          "Meow! *perks ears* Remember that every small line of code you write grows your wisdom tree! Let's study! 🐾🌟",
          "Purrr... How is your learning streak going? You can do this! *wags tail happily* 🐱✨",
          "Meow! Are you feeling stuck? Tap the mic and let's study or play a vocabulary game! 🎮🐾",
          "Purr... *tilts head* Don't forget to take a quick stretch, then let's solve some learning milestones! 💪🌸"
        ];
        const msg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
        setSpeechBubble(msg);
        catStateRef.current = 'jump';
        speakResponse(msg, true);
        setTimeout(() => { if (catStateRef.current === 'jump') catStateRef.current = 'idle'; }, 4000);
      }
    }, 20000);
    return () => clearInterval(checkInTimer);
  }, []);

  useEffect(() => {
    const handleTaskCompleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      let msg = "Meow! *jumps excitedly* Spectacular job completing that task! Keep leveling up! 🐾✨";
      if (detail.type === 'lesson') msg = `Meow! You solved the lesson: "${detail.topic}"! Brilliant work! *purrs* 🌟`;
      else if (detail.type === 'vocab') msg = `Great! *wags tail* You learned the word: "${detail.word}"! Keep expanding your vocabulary! 📚`;
      setSpeechBubble(msg);
      catStateRef.current = 'jump';
      triggerConfetti();
      speakResponse(msg, true);
      setTimeout(() => { if (catStateRef.current === 'jump') catStateRef.current = 'idle'; }, 4500);
    };

    const handleGoalAchieved = () => {
      const msg = "Purrrfect! *celebrates* You achieved your learning goal today! Let's celebrate! 🎉🐱";
      setSpeechBubble(msg);
      catStateRef.current = 'dance';
      triggerConfetti();
      speakResponse(msg, true);
      setTimeout(() => { if (catStateRef.current === 'dance') catStateRef.current = 'idle'; }, 7000);
    };

    window.addEventListener('task-completed', handleTaskCompleted);
    window.addEventListener('goal-achieved', handleGoalAchieved);
    return () => {
      window.removeEventListener('task-completed', handleTaskCompleted);
      window.removeEventListener('goal-achieved', handleGoalAchieved);
    };
  }, []);

  const handleTalkResponse = async (userText: string) => {
    playSoftPurr();
    lastInteractionTimeRef.current = Date.now();
    const text = userText.toLowerCase();
    let reply = "";
    let nextState: typeof catStateRef.current = 'idle';

    if (text.includes('happy') || text.includes('great') || text.includes('awesome') || text.includes('good') || text.includes('win') || text.includes('yes') || text.includes('bien')) {
      reply = "Meow! That makes me so happy to hear! *jumps excitedly* Let's celebrate your progress today. You're doing amazing! 🐾✨";
      nextState = 'jump';
    } else if (text.includes('sad') || text.includes('stressed') || text.includes('tired') || text.includes('bad') || text.includes('fail') || text.includes('no')) {
      reply = "Purr... *walks closer and tilts head* I feel your stress. Let's take a deep breath. Every small step is growth, and I believe in you! 🌸🐾";
      nextState = 'caring';
    } else if (text.includes('sleep') || text.includes('night') || text.includes('bye') || text.includes('bed')) {
      reply = "Yawn... *curls down* I am getting a bit sleepy too. Rest up, my friend, and we will learn more tomorrow. Sweet dreams! 💤";
      nextState = 'sleep';
    } else {
      reply = "Meow! I'm here to motivate you. Tell me how your studying is going or ask me a learning question! *wags tail* 🐱🌟";
      nextState = 'walk';
    }

    catStateRef.current = nextState;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      setIsLoading(true);
      setSpeechBubble('');
      try {
        const response = await api.post('/buddy/chat', { 
          message: userText,
          mode: nextState === 'caring' ? 'Study Planner Coach' : 'Motivation Coach'
        });
        if (response.data && response.data.message) {
          reply = response.data.message;
        }
      } catch (error) {
        console.error("AI Buddy API failed", error);
      } finally {
        setIsLoading(false);
      }
    }

    setSpeechBubble(reply);
    if (nextState !== 'sleep') {
      setTimeout(() => { if (catStateRef.current === nextState) catStateRef.current = 'idle'; }, 7000);
    }
    speakResponse(reply, true);
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    (window as any).currentRecognition = recognition;
    const detectLang = detectLanguage(speechBubble);
    recognition.lang = detectLang || navigator.language || 'en-US';
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsListening(true);
      setSpeechBubble("Listening... Speak now! 🎤");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setInputText(finalTranscript);
        handleTalkResponse(finalTranscript);
        setIsListening(false);
      } else if (interimTranscript) {
        setSpeechBubble(interimTranscript + "...");
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleTalkResponse(inputText);
    setInputText('');
    setShowInput(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-3 pointer-events-none select-none" style={{ perspective: '1200px' }}>
      
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-45 rounded-3xl">
          {confettiParticles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-confetti-fall"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : '2px',
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                transform: `rotate(${p.rotation}deg)`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(240px) rotate(360deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (speechBubble || isLoading) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="max-w-[245px] pointer-events-auto bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 p-3.5 rounded-2xl shadow-xl text-xs font-semibold leading-relaxed text-slate-800 dark:text-slate-200 backdrop-blur-md relative"
          >
            <div className="absolute -bottom-1.5 right-6 w-3.5 h-3.5 bg-white border-r border-b border-slate-200/50 dark:bg-slate-900 transform rotate-45"></div>
            <span className="flex gap-1.5 items-center text-[10px] text-pink-500 font-bold mb-1">
              <Sparkles className="h-3 w-3 fill-current animate-pulse" /> TomBuddy Plush Cat
            </span>
            {isLoading ? (
              <div className="flex items-center space-x-1.5 py-1">
                <span className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            ) : (
              <span>"{speechBubble}"</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen ? (
          <motion.button
            key="cat-button"
            initial={{ scale: 0.5, opacity: 0, rotateY: -120 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateY: 120 }}
            transition={{ type: "spring", stiffness: 70, damping: 12 }}
            onClick={() => setIsOpen(true)}
            className="pointer-events-auto h-16 w-16 rounded-full bg-gradient-to-tr from-sky-400 via-blue-400 to-indigo-400 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all cursor-pointer border-2 border-white"
          >
            <span className="text-3xl animate-bounce">🐱</span>
          </motion.button>
        ) : (
          <motion.div 
            key="cat-panel"
            initial={{ opacity: 0, scale: 0.3, rotateY: 120, rotateZ: -5, y: 80, x: 40 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0, rotateZ: 0, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.3, rotateY: 120, rotateZ: 5, y: 80, x: 40 }}
            transition={{ type: "spring", stiffness: 75, damping: 11, mass: 1 }}
            style={{ transformOrigin: "bottom right" }}
            className="pointer-events-auto bg-white/60 dark:bg-slate-900/60 border border-white/20 p-3 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center overflow-hidden"
          >
            <div className="flex w-full justify-between items-center px-1 space-x-4">
              <div 
                className="flex items-center space-x-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-full px-3 py-1 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 select-none">AI Voice</span>
                <button
                  className={`relative w-10 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none pointer-events-none ${
                    voiceEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out transform ${
                    voiceEnabled ? 'translate-x-4' : 'translate-x-0'
                  } flex items-center justify-center shadow-md`} >
                    {voiceEnabled ? <Volume1 className="h-3 w-3 text-emerald-500" /> : <VolumeX className="h-3 w-3 text-slate-400" />}
                  </div>
                </button>
              </div>

              <div className="flex items-center space-x-0.5">
                <button onClick={() => setIsMuted(!isMuted)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative h-48 w-48 flex items-center justify-center -mt-2">
              <canvas ref={canvasRef} className="h-48 w-48 block rounded-3xl overflow-hidden" />
            </div>

            <div className="flex items-center space-x-2.5 mt-0">
              <button
                id="cat-mic-btn"
                onClick={startListening}
                className={`p-3 rounded-full text-white shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                  isListening ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-tr from-sky-400 via-blue-400 to-indigo-400'
                }`}
              >
                {isListening ? <MicOff className="h-4.5 w-4.5" /> : <Mic className="h-4.5 w-4.5" />}
              </button>

              <button
                onClick={() => setShowInput(!showInput)}
                className="p-3 rounded-full border border-slate-200 bg-white/80 text-slate-500 hover:bg-slate-50 cursor-pointer transition-all hover:scale-105"
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </button>
            </div>

            <AnimatePresence>
              {showInput && (
                <motion.form
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  onSubmit={handleSendText}
                  className="flex items-center bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-1.5 max-w-[200px]"
                >
                  <input
                    type="text"
                    placeholder="Talk to me..."
                    className="bg-transparent border-none text-[11px] focus:outline-none pl-2 flex-1 w-24 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button type="submit" disabled={!inputText.trim()} className="bg-sky-500 hover:bg-sky-600 text-white p-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50">
                    <Send className="h-3 w-3" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
