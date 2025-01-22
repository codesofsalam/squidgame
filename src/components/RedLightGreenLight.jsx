import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Volume, Volume2 } from "lucide-react";
import StartScreen from "./StartScreen";

const RedLightGreenLight = () => {
  const [gameState, setGameState] = useState("waiting");
  const [isGreenLight, setIsGreenLight] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);

  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const charactersRef = useRef([]);
  const dollRef = useRef(null);
  const guardsRef = useRef([]);
  const frameRef = useRef(null);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);
  const lightTimerRef = useRef(null);
  const dollRotationRef = useRef(0);
  const movementIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const lightCycleRef = useRef(null);
  const dollEyesRef = useRef({ left: null, right: null });

  const createPlayerModel = (color, position) => {
    const group = new THREE.Group();

    const torsoGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);
    const torsoMaterial = new THREE.MeshPhongMaterial({
      color: 0x2e8b57,
      shininess: 20,
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 1.4;
    torso.castShadow = true;
    group.add(torso);

    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xffe0b2,
      shininess: 40,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    group.add(head);

    const hairGeometry = new THREE.SphereGeometry(
      0.26,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const hairMaterial = new THREE.MeshPhongMaterial({
      color: 0x3e2723,
      shininess: 30,
    });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 2.2;
    hair.castShadow = true;
    group.add(hair);

    const createArm = (isLeft) => {
      const armGroup = new THREE.Group();

      const upperArmGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 8, 16);
      const upperArm = new THREE.Mesh(upperArmGeometry, torsoMaterial);
      upperArm.position.y = -0.2;

      const elbowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const elbow = new THREE.Mesh(elbowGeometry, torsoMaterial);
      elbow.position.y = -0.4;

      const lowerArmGeometry = new THREE.CapsuleGeometry(0.08, 0.4, 8, 16);
      const lowerArm = new THREE.Mesh(lowerArmGeometry, torsoMaterial);
      lowerArm.position.y = -0.6;

      armGroup.add(upperArm, elbow, lowerArm);
      armGroup.position.set(isLeft ? -0.4 : 0.4, 1.8, 0);
      return armGroup;
    };

    group.add(createArm(true), createArm(false));

    const createLeg = (isLeft) => {
      const legGroup = new THREE.Group();

      const upperLegGeometry = new THREE.CapsuleGeometry(0.12, 0.5, 8, 16);
      const upperLeg = new THREE.Mesh(upperLegGeometry, torsoMaterial);
      upperLeg.position.y = -0.25;

      const kneeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const knee = new THREE.Mesh(kneeGeometry, torsoMaterial);
      knee.position.y = -0.5;

      const lowerLegGeometry = new THREE.CapsuleGeometry(0.1, 0.5, 8, 16);
      const lowerLeg = new THREE.Mesh(lowerLegGeometry, torsoMaterial);
      lowerLeg.position.y = -0.75;

      legGroup.add(upperLeg, knee, lowerLeg);
      legGroup.position.set(isLeft ? -0.2 : 0.2, 1, 0);
      return legGroup;
    };

    group.add(createLeg(true), createLeg(false));

    const symbolGeometry = new THREE.CircleGeometry(0.15, 32);
    const symbolMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.position.set(0, 1.6, 0.31);
    group.add(symbol);

    group.position.copy(position);

    group.scale.set(2.5, 2.5, 2.5);
    return group;
  };
  const createTree = (position) => {
    const group = new THREE.Group();

    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a2f1b,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.castShadow = true;
    group.add(trunk);

    const foliageColors = [0x1b4a1b, 0x245024, 0x2d5c2d];
    const foliageSizes = [3, 2.5, 2];
    const foliageHeights = [3, 4, 5];

    foliageSizes.forEach((size, index) => {
      const foliageGeometry = new THREE.ConeGeometry(size, 4, 8);
      const foliageMaterial = new THREE.MeshPhongMaterial({
        color: foliageColors[index],
        roughness: 0.8,
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = foliageHeights[index];
      foliage.castShadow = true;
      group.add(foliage);
    });

    group.position.copy(position);
    return group;
  };

  const createGuard = (position) => {
    const group = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xff69b4,
      shininess: 30,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);

    const maskGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.4);
    const maskMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 50,
    });
    const mask = new THREE.Mesh(maskGeometry, maskMaterial);
    mask.position.y = 1.3;
    mask.position.z = 0.1;
    group.add(mask);

    const symbolGeometry =
      Math.random() > 0.5
        ? new THREE.CircleGeometry(0.15, 32)
        : new THREE.BoxGeometry(0.25, 0.25, 0.01);
    const symbolMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.position.y = 1.3;
    symbol.position.z = 0.31;
    group.add(symbol);

    const gunGeometry = new THREE.BoxGeometry(0.1, 0.3, 1);
    const gunMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c2c2c,
      shininess: 60,
    });
    const gun = new THREE.Mesh(gunGeometry, gunMaterial);
    gun.position.set(0.6, 0.5, 0);
    gun.rotation.x = Math.PI / 2;
    group.add(gun);

    group.position.copy(position);
    group.scale.set(3, 3, 3);
    return group;
  };

  const createGiantDoll = () => {
    const group = new THREE.Group();

    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.8, 5, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xffa726,
      shininess: 30,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    const dressGeometry = new THREE.CylinderGeometry(2.2, 3.2, 4, 32);
    const dressMaterial = new THREE.MeshPhongMaterial({
      color: 0xff5722,
      shininess: 40,
    });
    const dress = new THREE.Mesh(dressGeometry, dressMaterial);
    dress.position.y = -0.5;
    group.add(dress);

    const headGeometry = new THREE.SphereGeometry(1.2, 64, 64);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xffe0b2,
      shininess: 50,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    group.add(head);

    const pigtailGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    const pigtailMaterial = new THREE.MeshPhongMaterial({
      color: 0x3e2723,
      shininess: 30,
    });
    const leftPigtail = new THREE.Mesh(pigtailGeometry, pigtailMaterial);
    leftPigtail.position.set(-1.5, 3.5, 0);
    const rightPigtail = new THREE.Mesh(pigtailGeometry, pigtailMaterial);
    rightPigtail.position.set(1.5, 3.5, 0);
    group.add(leftPigtail, rightPigtail);

    const eyeGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const createEyeMaterial = () =>
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        shininess: 100,
        emissive: 0x000000,
        emissiveIntensity: 0.5,
      });

    const leftEye = new THREE.Mesh(eyeGeometry, createEyeMaterial());
    leftEye.position.set(-0.5, 3.2, 0.8);
    const rightEye = new THREE.Mesh(eyeGeometry, createEyeMaterial());
    rightEye.position.set(0.5, 3.2, 0.8);

    dollEyesRef.current = {
      left: leftEye,
      right: rightEye,
    };

    group.add(leftEye, rightEye);

    group.position.set(0, 2.5, -40);
    group.scale.set(4, 4, 4);
    return group;
  };

  useEffect(() => {
    if (dollEyesRef.current.left && dollEyesRef.current.right) {
      const eyeColor = isGreenLight ? 0x000000 : 0xff0000;
      const emissiveColor = isGreenLight ? 0x000000 : 0xff0000;

      [
        dollEyesRef.current.left.material,
        dollEyesRef.current.right.material,
      ].forEach((material) => {
        material.color.setHex(eyeColor);
        material.emissive.setHex(emissiveColor);
        material.needsUpdate = true;
      });
    }
  }, [isGreenLight]);

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf5deb3);
    scene.fog = new THREE.FogExp2(0xf5deb3, 0.008);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 25, 50);

    const updateCameraPosition = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        camera.position.set(0, 30, 60);
      } else {
        camera.position.set(0, 25, 50);
      }
    };

    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(50, 50, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    const redSpotlight = new THREE.SpotLight(0xff0000, 1);
    redSpotlight.position.set(-20, 10, -30);
    redSpotlight.angle = Math.PI / 6;
    redSpotlight.penumbra = 0.3;
    scene.add(redSpotlight);

    const blueSpotlight = new THREE.SpotLight(0x0000ff, 1);
    blueSpotlight.position.set(20, 10, -30);
    blueSpotlight.angle = Math.PI / 6;
    blueSpotlight.penumbra = 0.3;
    scene.add(blueSpotlight);

    const groundGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const vertices = ground.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      if (Math.abs(vertices[i]) > 80 || Math.abs(vertices[i + 1]) > 80) {
        vertices[i + 2] = Math.random() * 2;
      }
    }
    ground.geometry.attributes.position.needsUpdate = true;
    ground.geometry.computeVertexNormals();

    const treePositions = [
      [-15, 0, -35],
      [15, 0, -35],
      [-25, 0, -38],
      [25, 0, -38],
      [-10, 0, -42],
      [10, 0, -42],
    ];

    treePositions.forEach(([x, y, z]) => {
      const tree = createTree(new THREE.Vector3(x, y, z));
      scene.add(tree);
    });

    const guardPositions = [
      [-10, 0, -30],
      [10, 0, -30],
    ];

    guardPositions.forEach(([x, y, z]) => {
      const guard = createGuard(new THREE.Vector3(x, y, z));
      scene.add(guard);
      guardsRef.current.push(guard);
    });

    const doll = createGiantDoll();
    scene.add(doll);
    dollRef.current = doll;

    const playerSymbols = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff,
    ];
    playerSymbols.forEach((color, index) => {
      const x = (index - (playerSymbols.length - 1) / 2) * 4;
      const z = 30;
      const position = new THREE.Vector3(x, 0, z);
      const player = createPlayerModel(color, position);
      scene.add(player);
      charactersRef.current.push({
        mesh: player,
        initialPos: position.clone(),
        eliminated: false,
        playerNumber: index + 1,
        moveSpeed: 0.1 + Math.random() * 0.15,
        isMoving: false,
        reachedDestination: false,
      });
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateCameraPosition();
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();

      guardsRef.current.forEach((guard, index) => {
        guard.rotation.y = Math.sin(Date.now() * 0.001 + index * Math.PI) * 0.2;
      });

      if (gameState === "playing" && !isGreenLight) {
        dollRotationRef.current += 0.05;
        if (dollRef.current) {
          dollRef.current.rotation.y = Math.sin(dollRotationRef.current) * 0.5;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const audio = new Audio("/squid.mp3");
    audio.loop = false;
    audioRef.current = audio;
    audio.muted = isMuted;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      const startLightCycle = () => {
        setIsGreenLight(true);
        if (dollRef.current) {
          dollRef.current.rotation.y = 0;
        }

        if (audioRef.current && !isMuted) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }

        lightTimerRef.current = setTimeout(() => {
          setIsGreenLight(false);

          lightTimerRef.current = setTimeout(() => {
            if (gameState === "playing") {
              startLightCycle();
            }
          }, 4000);
        }, 11000);
      };

      startLightCycle();

      return () => {
        if (lightTimerRef.current) {
          clearTimeout(lightTimerRef.current);
        }
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      };
    }
  }, [gameState, isMuted]);

  useEffect(() => {
    if (isMoving && gameState === "playing") {
      movementIntervalRef.current = setInterval(() => {
        let activePlayers = charactersRef.current.filter(
          (char) => !char.eliminated
        ).length;

        const allPlayersAtDestination = charactersRef.current.every(
          (char) => char.eliminated || char.reachedDestination
        );

        if (allPlayersAtDestination && activePlayers > 0) {
          setGameState("won");
          setIsMoving(false);
          clearInterval(movementIntervalRef.current);
          return;
        }

        charactersRef.current.forEach((char) => {
          if (!char.eliminated && !char.reachedDestination) {
            char.isMoving = true;
            const newZ = char.mesh.position.z - char.moveSpeed * 0.5;

            if (newZ > -25) {
              char.mesh.position.z = newZ;
            } else {
              char.mesh.position.z = -25;
              char.reachedDestination = true;
              char.isMoving = false;

              const allReached = charactersRef.current.every(
                (player) => player.eliminated || player.reachedDestination
              );
              if (allReached && activePlayers > 0) {
                setGameState("won");
                setIsMoving(false);
                clearInterval(movementIntervalRef.current);
                return;
              }
            }
          }
        });

        if (!isGreenLight) {
          const movingPlayers = charactersRef.current.filter(
            (char) =>
              !char.eliminated && char.isMoving && !char.reachedDestination
          );

          if (movingPlayers.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * movingPlayers.length
            );
            const playerToEliminate = movingPlayers[randomIndex];
            playerToEliminate.eliminated = true;
            playerToEliminate.mesh.rotation.x = Math.PI / 2;

            guardsRef.current.forEach((guard) => {
              guard.lookAt(playerToEliminate.mesh.position);
            });

            if (charactersRef.current.every((char) => char.eliminated)) {
              setGameState("lost");
              setIsMoving(false);
              clearInterval(movementIntervalRef.current);
              return;
            }
          }
        }
      }, 100);

      return () => {
        clearInterval(movementIntervalRef.current);
      };
    }
  }, [isMoving, gameState, isGreenLight]);

  useEffect(() => {
    if (gameState === "playing") {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            setGameState("lost");
            clearInterval(timerIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerIntervalRef.current);
    }
  }, [gameState]);

  const startGame = () => {
    if (lightCycleRef.current) {
      clearTimeout(lightCycleRef.current.greenLight);
      clearTimeout(lightCycleRef.current.redLight);
    }

    setShowGame(true);
    setGameState("playing");
    setIsGreenLight(true);
    setTimeRemaining(300);
    dollRotationRef.current = 0;
    setIsMoving(false);

    charactersRef.current.forEach((char) => {
      char.eliminated = false;
      char.mesh.position.copy(char.initialPos);
      char.mesh.rotation.x = 0;
      char.isMoving = false;
      char.reachedDestination = false;
      char.moveSpeed = 0.2 + Math.random() * 0.15;
    });

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isMuted) {
        audioRef.current.play();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#F5DEB3]">
      <StartScreen onStart={startGame} isVisible={!showGame} />
      <canvas ref={canvasRef} className="relative w-full h-full z-10" />

      {showGame && (
        <>
          <div className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black text-red-600 px-4 md:px-6 py-2 md:py-3 rounded-lg text-2xl md:text-4xl font-digital">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleMute}
              className="bg-black/50 backdrop-blur-sm p-2 md:p-3 rounded-lg hover:bg-black/70 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <Volume className="w-5 h-5 md:w-6 md:h-6 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              )}
            </button>
          </div>

          {gameState === "playing" && (
            <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
              <button
                onClick={() => setIsMoving(true)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${
                  isMoving
                    ? "bg-blue-500 ring-2 md:ring-4 ring-blue-300"
                    : "bg-blue-500 hover:bg-blue-600"
                } flex items-center justify-center shadow-lg transition-colors`}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="text-white text-xl md:text-4xl font-bold">
                    O
                  </span>
                </div>
              </button>

              <button
                onClick={() => setIsMoving(false)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${
                  !isMoving
                    ? "bg-red-500 ring-2 md:ring-4 ring-red-300"
                    : "bg-red-500 hover:bg-red-600"
                } flex items-center justify-center shadow-lg transition-colors`}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/30 flex items-center justify-center">
                  <span className="text-white text-xl md:text-4xl font-bold">
                    X
                  </span>
                </div>
              </button>
            </div>
          )}

          {(gameState === "won" || gameState === "lost") && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center space-y-4 md:space-y-6 bg-black/70 p-6 md:p-8 rounded-2xl shadow-2xl mx-4">
                <h2
                  className={`text-4xl md:text-6xl font-bold mb-4 md:mb-8 ${
                    gameState === "won" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {gameState === "won" ? "YOU WIN!" : "GAME OVER"}
                </h2>
                <button
                  onClick={startGame}
                  className="px-6 md:px-8 py-3 md:py-4 bg-white/20 rounded-lg hover:bg-white/30 
                    transition-all duration-300 text-white text-lg md:text-xl font-bold
                    hover:scale-105 active:scale-95"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RedLightGreenLight;
