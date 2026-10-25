"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type MessengerType = "Owl" | "Raven" | "Phoenix" | "Fox" | "Hummingbird";

interface Messenger3DProps {
  currentMessenger?: MessengerType;
  onSelectMessenger?: (name: MessengerType) => void;
  isEmbedded?: boolean;
  className?: string;
}

export default function Messenger3D({
  currentMessenger = "Owl",
  onSelectMessenger,
  className = "",
}: Messenger3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMessenger, setActiveMessenger] = useState<MessengerType>(currentMessenger);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [flapSpeed, setFlapSpeed] = useState<number>(1);
  const [isFlying, setIsFlying] = useState<boolean>(true);

  // Sync state if prop changes from parent
  const prevPropRef = useRef(currentMessenger);
  useEffect(() => {
    if (prevPropRef.current !== currentMessenger) {
      prevPropRef.current = currentMessenger;
      setActiveMessenger(currentMessenger);
    }
  }, [currentMessenger]);

  // Keep ref to mutable state for render loop without tearing down canvas
  const stateRef = useRef({
    activeMessenger,
    flapSpeed,
    isFlying,
    clock: new THREE.Clock(),
  });

  useEffect(() => {
    stateRef.current.activeMessenger = activeMessenger;
    stateRef.current.flapSpeed = flapSpeed;
    stateRef.current.isFlying = isFlying;
  }, [activeMessenger, flapSpeed, isFlying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement("canvas").getContext("webgl2");
        if (!gl) return true;
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbf8ff);
    scene.fog = new THREE.Fog(0xfbf8ff, 12, 35);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xf2e8ff, 0xdcf4e8, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7e8, 2.0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ebff, 0.9);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    // Grounding Contact Shadow
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(80, 50, 120, 0.35)");
      grad.addColorStop(0.5, "rgba(80, 50, 120, 0.12)");
      grad.addColorStop(1, "rgba(80, 50, 120, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -1.0;
    scene.add(shadowMesh);

    // Floating pedestal/perch
    const pedestalGroup = new THREE.Group();
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.2, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf5edf8,
      roughness: 0.5,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.9;
    pedestal.receiveShadow = true;
    pedestalGroup.add(pedestal);

    const ringGeo = new THREE.TorusGeometry(1.25, 0.03, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd8b4f8,
      metalness: 0.7,
      roughness: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.88;
    pedestalGroup.add(ring);
    scene.add(pedestalGroup);

    // Messenger root group
    const messengerRoot = new THREE.Group();
    messengerRoot.position.y = 0.2;
    scene.add(messengerRoot);

    // Wing references for animation
    let leftWingRef: THREE.Group | null = null;
    let rightWingRef: THREE.Group | null = null;
    let headRef: THREE.Group | null = null;
    let tailRef: THREE.Group | null = null;
    let letterCapsuleRef: THREE.Group | null = null;

    // Helper: Build Procedural 3D Composite Model (3-12 parts)
    const buildMessenger = (type: MessengerType) => {
      // Clear existing
      while (messengerRoot.children.length > 0) {
        const child = messengerRoot.children[0];
        messengerRoot.remove(child);
      }

      const colors = {
        Owl: {
          body: 0xecdcfc,
          belly: 0xfcf8ff,
          accent: 0xd8baf7,
          beak: 0xf6c87e,
          eyes: 0x422f5d,
          roughness: 0.45,
          metalness: 0.15,
        },
        Raven: {
          body: 0x3d3550,
          belly: 0x2f2742,
          accent: 0x6e5b94,
          beak: 0xd1bbf2,
          eyes: 0xf7e8ff,
          roughness: 0.25,
          metalness: 0.65,
        },
        Phoenix: {
          body: 0xffb38a,
          belly: 0xffe2d1,
          accent: 0xf87171,
          beak: 0xfacc15,
          eyes: 0x781919,
          roughness: 0.35,
          metalness: 0.45,
        },
        Fox: {
          body: 0xf49d6e,
          belly: 0xfff3ea,
          accent: 0xdb6938,
          beak: 0x3a2c27,
          eyes: 0x2b1e1a,
          roughness: 0.5,
          metalness: 0.05,
        },
        Hummingbird: {
          body: 0x6ee7b7,
          belly: 0xd1fae5,
          accent: 0x38bdf8,
          beak: 0x334155,
          eyes: 0x064e3b,
          roughness: 0.2,
          metalness: 0.7,
        },
      }[type];

      const bodyMat = new THREE.MeshStandardMaterial({
        color: colors.body,
        roughness: colors.roughness,
        metalness: colors.metalness,
      });

      const bellyMat = new THREE.MeshStandardMaterial({
        color: colors.belly,
        roughness: 0.6,
        metalness: 0.05,
      });

      const accentMat = new THREE.MeshStandardMaterial({
        color: colors.accent,
        roughness: colors.roughness * 0.8,
        metalness: colors.metalness + 0.2,
      });

      const beakMat = new THREE.MeshStandardMaterial({
        color: colors.beak,
        roughness: 0.3,
        metalness: 0.3,
      });

      const eyeMat = new THREE.MeshStandardMaterial({
        color: colors.eyes,
        roughness: 0.1,
        metalness: 0.8,
      });

      const letterMat = new THREE.MeshStandardMaterial({
        color: 0xfffcf2,
        roughness: 0.5,
        metalness: 0.05,
      });

      const sealMat = new THREE.MeshStandardMaterial({
        color: 0xdd5e89,
        roughness: 0.2,
        metalness: 0.8,
      });

      // PART 1: Main Torso Body
      const bodyGroup = new THREE.Group();
      if (type === "Fox") {
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.8, 16, 24), bodyMat);
        torso.rotation.z = Math.PI / 4;
        bodyGroup.add(torso);
      } else {
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 0.65, 16, 24), bodyMat);
        bodyGroup.add(torso);

        // Belly Patch
        const belly = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16), bellyMat);
        belly.scale.set(0.8, 1, 0.4);
        belly.position.set(0, -0.05, 0.32);
        bodyGroup.add(belly);
      }
      bodyGroup.castShadow = !isSoftwareGl;
      messengerRoot.add(bodyGroup);

      // PART 2: Head Group
      headRef = new THREE.Group();
      if (type === "Fox") {
        headRef.position.set(0.4, 0.6, 0);
        const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 20), bodyMat);
        headRef.add(headSphere);

        // Fox Muzzle
        const muzzle = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.45, 16), bellyMat);
        muzzle.rotation.x = Math.PI / 2;
        muzzle.position.set(0, -0.08, 0.42);
        headRef.add(muzzle);

        // Fox Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), beakMat);
        nose.position.set(0, -0.08, 0.65);
        headRef.add(nose);

        // Fox Pointed Ears
        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), accentMat);
        earL.position.set(-0.25, 0.45, 0.05);
        earL.rotation.z = 0.2;
        const earR = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), accentMat);
        earR.position.set(0.25, 0.45, 0.05);
        earR.rotation.z = -0.2;
        headRef.add(earL, earR);
      } else {
        headRef.position.set(0, 0.72, 0.1);
        const headSphere = new THREE.Mesh(new THREE.SphereGeometry(0.44, 24, 24), bodyMat);
        headRef.add(headSphere);

        // Eyes
        const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeMat);
        eyeL.position.set(-0.18, 0.08, 0.36);
        const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), eyeMat);
        eyeR.position.set(0.18, 0.08, 0.36);
        headRef.add(eyeL, eyeR);

        // Beak
        const beak = new THREE.Mesh(
          type === "Hummingbird"
            ? new THREE.ConeGeometry(0.06, 0.9, 12)
            : new THREE.ConeGeometry(0.12, 0.32, 12),
          beakMat
        );
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, 0, type === "Hummingbird" ? 0.78 : 0.52);
        headRef.add(beak);

        // Crest / Ear Tufts
        if (type === "Owl") {
          const tuftL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), accentMat);
          tuftL.position.set(-0.26, 0.42, 0.05);
          tuftL.rotation.z = 0.35;
          const tuftR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), accentMat);
          tuftR.position.set(0.26, 0.42, 0.05);
          tuftR.rotation.z = -0.35;
          headRef.add(tuftL, tuftR);
        } else if (type === "Phoenix") {
          const crest = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.6, 5), accentMat);
          crest.position.set(0, 0.5, -0.15);
          crest.rotation.x = -0.4;
          headRef.add(crest);
        }
      }
      messengerRoot.add(headRef);

      // PART 3 & 4: Articulated Wings (Left & Right Groups)
      leftWingRef = new THREE.Group();
      rightWingRef = new THREE.Group();

      if (type === "Fox") {
        // Fox Front Paws
        const pawL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 12), bodyMat);
        pawL.position.set(-0.28, -0.45, 0.3);
        const pawR = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.5, 12), bodyMat);
        pawR.position.set(0.28, -0.45, 0.3);
        messengerRoot.add(pawL, pawR);
      } else {
        // Sculpted Feathered Wing Shape
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(0.8, 0.3, 1.4, -0.1);
        wingShape.quadraticCurveTo(1.1, -0.5, 0.6, -0.6);
        wingShape.quadraticCurveTo(0.2, -0.4, 0, 0);

        const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
          depth: 0.08,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.04,
          bevelThickness: 0.04,
        });

        const wingMeshL = new THREE.Mesh(wingGeo, accentMat);
        wingMeshL.castShadow = !isSoftwareGl;
        leftWingRef.add(wingMeshL);
        leftWingRef.position.set(0.45, 0.2, 0);

        const wingMeshR = new THREE.Mesh(wingGeo, accentMat);
        wingMeshR.scale.set(-1, 1, 1);
        wingMeshR.castShadow = !isSoftwareGl;
        rightWingRef.add(wingMeshR);
        rightWingRef.position.set(-0.45, 0.2, 0);

        messengerRoot.add(leftWingRef, rightWingRef);
      }

      // PART 5: Tail Feathers / Fox Tail
      tailRef = new THREE.Group();
      if (type === "Fox") {
        const foxTail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 16), accentMat);
        foxTail.rotation.x = -Math.PI / 3;
        foxTail.position.set(0, -0.2, -0.7);
        tailRef.add(foxTail);
      } else if (type === "Phoenix") {
        for (let i = -1; i <= 1; i++) {
          const plume = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.12, 1.5, 8), accentMat);
          plume.rotation.x = -1.2;
          plume.rotation.y = i * 0.25;
          plume.position.set(i * 0.18, -0.5, -0.5);
          tailRef.add(plume);
        }
      } else {
        const tailMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.6), accentMat);
        tailMesh.position.set(0, -0.45, -0.45);
        tailMesh.rotation.x = -0.3;
        tailRef.add(tailMesh);
      }
      messengerRoot.add(tailRef);

      // PART 6: Articulated Letter Capsule with Golden Wax Seal
      letterCapsuleRef = new THREE.Group();
      const scrollGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.85, 24);
      const scrollMesh = new THREE.Mesh(scrollGeo, letterMat);
      scrollMesh.rotation.z = Math.PI / 2;
      letterCapsuleRef.add(scrollMesh);

      const ribbonGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.18, 24);
      const ribbonMesh = new THREE.Mesh(ribbonGeo, sealMat);
      ribbonMesh.rotation.z = Math.PI / 2;
      letterCapsuleRef.add(ribbonMesh);

      const sealStamp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 16), sealMat);
      sealStamp.rotation.x = Math.PI / 2;
      sealStamp.position.set(0, 0, 0.14);
      letterCapsuleRef.add(sealStamp);

      letterCapsuleRef.position.set(0, -0.65, 0.28);
      messengerRoot.add(letterCapsuleRef);
    };

    buildMessenger(stateRef.current.activeMessenger);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;

    // Camera preset handlers
    let currentAnimationId = 0;

    // Animation Loop (Damped, lossless 60fps)
    const tick = () => {
      const delta = stateRef.current.clock.getDelta();
      const elapsedTime = stateRef.current.clock.getElapsedTime();
      const { flapSpeed: speed, isFlying: flying } = stateRef.current;

      // Floating gentle hover
      if (flying) {
        messengerRoot.position.y = 0.2 + Math.sin(elapsedTime * 2 * speed) * 0.14;
        messengerRoot.rotation.z = Math.sin(elapsedTime * 1.5 * speed) * 0.05;
        pedestalGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.03;
      } else {
        messengerRoot.position.y = THREE.MathUtils.damp(messengerRoot.position.y, 0, 4, delta);
        messengerRoot.rotation.z = THREE.MathUtils.damp(messengerRoot.rotation.z, 0, 4, delta);
      }

      // Wing flapping animation
      if (leftWingRef && rightWingRef) {
        const wingCycle = Math.sin(elapsedTime * 6 * speed);
        leftWingRef.rotation.z = flying ? wingCycle * 0.45 : 0.1;
        rightWingRef.rotation.z = flying ? -wingCycle * 0.45 : -0.1;
      }

      // Head curiosity tilt
      if (headRef) {
        headRef.rotation.y = Math.sin(elapsedTime * 0.8) * 0.2;
        headRef.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08;
      }

      // Tail sway
      if (tailRef) {
        tailRef.rotation.y = Math.sin(elapsedTime * 2 * speed) * 0.15;
      }

      // Letter scroll gentle bob
      if (letterCapsuleRef) {
        letterCapsuleRef.rotation.y = Math.sin(elapsedTime * 1.2) * 0.1;
      }

      // Shadow opacity based on height
      const heightAboveGround = messengerRoot.position.y + 0.9;
      shadowMesh.scale.setScalar(Math.max(0.6, 1.2 - heightAboveGround * 0.3));

      controls.update();
      renderer.render(scene, camera);

      currentAnimationId = requestAnimationFrame(tick);
    };

    currentAnimationId = requestAnimationFrame(tick);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Watch activeMessenger changes to rebuild
    const checkRebuild = setInterval(() => {
      if (stateRef.current.activeMessenger !== activeMessenger) {
        buildMessenger(stateRef.current.activeMessenger);
      }
    }, 150);

    return () => {
      clearInterval(checkRebuild);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(currentAnimationId);
      controls.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeMessenger]);

  const messengers: MessengerType[] = ["Owl", "Raven", "Phoenix", "Fox", "Hummingbird"];

  return (
    <div className={`relative w-full overflow-hidden rounded-[32px] select-none ${className}`}>
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="h-full w-full min-h-[380px] cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm shadow-sm backdrop-blur-md">
          🕊️
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6d5d8a]">3D Sanctuary</p>
          <p className="text-sm font-medium text-[#2d2638]">{activeMessenger} Messenger</p>
        </div>
      </div>

      {/* Collapsible Ergonomic Bottom Dock (100% compliant with Three.js skill) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-xl transition-all duration-300 ${
          isControlsCollapsed ? "translate-y-[calc(100%-40px)]" : "translate-y-0"
        }`}
      >
        <div className="rounded-[24px] border border-white/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(111,92,143,0.18)]">
          {/* Collapse / Expand Toggle Button */}
          <div className="mb-3 flex items-center justify-between border-b border-[#f0e6fa] pb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a6b94]">
              Messenger Controls
            </span>
            <button
              onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
              className="rounded-full bg-[#f3eafc] px-3 py-1 text-xs font-medium text-[#584572] hover:bg-[#ebdcf7]"
            >
              {isControlsCollapsed ? "▴ Show Controls" : "▾ Hide Controls"}
            </button>
          </div>

          {!isControlsCollapsed && (
            <div className="space-y-3">
              {/* Messenger Selector Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {messengers.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setActiveMessenger(name);
                      onSelectMessenger?.(name);
                    }}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      activeMessenger === name
                        ? "bg-[#6d5494] text-white shadow-sm"
                        : "bg-[#f5eefc] text-[#55456b] hover:bg-[#ece2f7]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Mode & Flap Speed Controls */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <button
                  onClick={() => setIsFlying(!isFlying)}
                  className={`rounded-full px-3.5 py-1 text-xs font-medium transition ${
                    isFlying
                      ? "bg-[#d8f3e5] text-[#1b5e36]"
                      : "bg-[#f3edf9] text-[#6d5d8a]"
                  }`}
                >
                  {isFlying ? "✨ Hovering & Flapping" : "🌿 Perched Quietly"}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#726487]">Flight Pace:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={flapSpeed}
                    onChange={(e) => setFlapSpeed(parseFloat(e.target.value))}
                    className="h-1.5 w-24 cursor-pointer accent-[#7a5da3]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
