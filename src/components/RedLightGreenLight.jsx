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
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes in seconds
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const charactersRef = useRef([]);
  const dollRef = useRef(null);
  const frameRef = useRef(null);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);
  const greenLightTimerRef = useRef(null);
  const dollRotationRef = useRef(0);
  const movementIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const createPlayerModel = (color, position) => {
    const group = new THREE.Group();

    // Body (torso)
    const torsoGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 8, 16);
    const torsoMaterial = new THREE.MeshPhongMaterial({
      color: 0x2e8b57,
      shininess: 20,
    });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 1.4;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xffe0b2,
      shininess: 40,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.1;
    head.castShadow = true;
    group.add(head);

    // Hair
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

    // Arms (left and right)
    const createArm = (isLeft) => {
      const armGroup = new THREE.Group();

      // Upper arm
      const upperArmGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 8, 16);
      const upperArm = new THREE.Mesh(upperArmGeometry, torsoMaterial);
      upperArm.position.y = -0.2;

      // Elbow (joint)
      const elbowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const elbow = new THREE.Mesh(elbowGeometry, torsoMaterial);
      elbow.position.y = -0.4;

      // Lower arm
      const lowerArmGeometry = new THREE.CapsuleGeometry(0.08, 0.4, 8, 16);
      const lowerArm = new THREE.Mesh(lowerArmGeometry, torsoMaterial);
      lowerArm.position.y = -0.6;

      armGroup.add(upperArm, elbow, lowerArm);
      armGroup.position.set(isLeft ? -0.4 : 0.4, 1.8, 0);
      return armGroup;
    };

    group.add(createArm(true), createArm(false));

    // Legs (left and right)
    const createLeg = (isLeft) => {
      const legGroup = new THREE.Group();

      // Upper leg
      const upperLegGeometry = new THREE.CapsuleGeometry(0.12, 0.5, 8, 16);
      const upperLeg = new THREE.Mesh(upperLegGeometry, torsoMaterial);
      upperLeg.position.y = -0.25;

      // Knee (joint)
      const kneeGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const knee = new THREE.Mesh(kneeGeometry, torsoMaterial);
      knee.position.y = -0.5;

      // Lower leg
      const lowerLegGeometry = new THREE.CapsuleGeometry(0.1, 0.5, 8, 16);
      const lowerLeg = new THREE.Mesh(lowerLegGeometry, torsoMaterial);
      lowerLeg.position.y = -0.75;

      legGroup.add(upperLeg, knee, lowerLeg);
      legGroup.position.set(isLeft ? -0.2 : 0.2, 1, 0);
      return legGroup;
    };

    group.add(createLeg(true), createLeg(false));

    // Player number/symbol
    const symbolGeometry = new THREE.CircleGeometry(0.15, 32);
    const symbolMaterial = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
    });
    const symbol = new THREE.Mesh(symbolGeometry, symbolMaterial);
    symbol.position.set(0, 1.6, 0.31);
    group.add(symbol);

    group.position.copy(position);
    // Increased scale from 1.5 to 2.5
    group.scale.set(2.5, 2.5, 2.5);
    return group;
  };

  const createGiantDoll = () => {
    const group = new THREE.Group();

    // Body with Korean school uniform style
    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.8, 5, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xffa726,
      shininess: 30,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Orange dress
    const dressGeometry = new THREE.CylinderGeometry(2.2, 3.2, 4, 32);
    const dressMaterial = new THREE.MeshPhongMaterial({
      color: 0xff5722,
      shininess: 40,
    });
    const dress = new THREE.Mesh(dressGeometry, dressMaterial);
    dress.position.y = -0.5;
    group.add(dress);

    // Head
    const headGeometry = new THREE.SphereGeometry(1.2, 64, 64);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xffe0b2,
      shininess: 50,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    group.add(head);

    // Pigtails
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

    // Eyes with glow effect
    const eyeGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 100,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 3.2, 0.8);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.5, 3.2, 0.8);
    group.add(leftEye, rightEye);

    group.position.set(0, 2.5, -50);
    group.scale.set(4, 4, 4);
    return group;
  };

  useEffect(() => {
    const audio = new Audio("/squid.mp3");
    audio.loop = true;
    audioRef.current = audio;
    audio.muted = isMuted;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

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

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(50, 50, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

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

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();

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
    if (gameState === "playing") {
      if (!isMuted) {
        audioRef.current?.play();
      }

      const switchLights = () => {
        setIsGreenLight(true);
        if (dollRef.current) {
          dollRef.current.rotation.y = 0;
          dollRef.current.children
            .filter((child) => child.material?.emissive)
            .forEach((eye) => {
              eye.material.emissiveIntensity = 0;
            });
        }

        const greenLightDuration = 5000 + Math.random() * 7000;
        greenLightTimerRef.current = setTimeout(() => {
          setIsGreenLight(false);
          if (dollRef.current) {
            dollRef.current.children
              .filter((child) => child.material?.emissive)
              .forEach((eye) => {
                eye.material.emissiveIntensity = 1;
              });
          }
          setTimeout(switchLights, 2000 + Math.random() * 2000);
        }, greenLightDuration);
      };

      switchLights();

      return () => {
        clearTimeout(greenLightTimerRef.current);
        audioRef.current?.pause();
      };
    }
  }, [gameState, isMuted]);

  useEffect(() => {
    if (isMoving && gameState === "playing") {
      movementIntervalRef.current = setInterval(() => {
        let playersAtDestination = 0;
        let currentActivePlayers = charactersRef.current.filter(
          (char) => !char.eliminated
        ).length;

        charactersRef.current.forEach((char) => {
          if (!char.eliminated) {
            if (!char.reachedDestination) {
              char.isMoving = true;
              char.mesh.position.z -= char.moveSpeed * 0.5;

              if (char.mesh.position.z <= -45) {
                char.reachedDestination = true;
                char.isMoving = false;
                playersAtDestination++;
              }
            } else {
              playersAtDestination++;
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
          }
        }

        if (currentActivePlayers === 0) {
          setGameState("lost");
          setIsMoving(false);
          clearInterval(movementIntervalRef.current);
          return;
        }

        if (
          playersAtDestination === currentActivePlayers &&
          currentActivePlayers > 0
        ) {
          setGameState("won");
          setIsMoving(false);
          clearInterval(movementIntervalRef.current);
          return;
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

    if (!isMuted) {
      audioRef.current?.play();
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
          {/* Timer Display */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black text-red-600 px-6 py-3 rounded-lg text-4xl font-digital">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="absolute top-0 right-0 p-4 z-20">
            <button
              onClick={toggleMute}
              className="bg-black/50 backdrop-blur-sm p-3 rounded-lg hover:bg-black/70 transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <Volume className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Game Controls */}
          {gameState === "playing" && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-8">
              <button
                onClick={() => setIsMoving(true)}
                className={`w-16 h-16 rounded-full ${
                  isMoving ? "bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
                } flex items-center justify-center shadow-lg transition-all`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-400" />
              </button>

              <button
                onClick={() => setIsMoving(false)}
                className="w-16 h-16 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700
                  flex items-center justify-center shadow-lg transition-all"
              >
                <div className="w-8 h-8 rotate-45 bg-red-400" />
              </button>
            </div>
          )}

          {/* Game Over/Win Screen */}
          {(gameState === "won" || gameState === "lost") && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center space-y-6 bg-black/70 p-8 rounded-2xl shadow-2xl">
                <h2
                  className={`text-6xl font-bold mb-8 ${
                    gameState === "won" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {gameState === "won" ? "YOU WIN!" : "GAME OVER"}
                </h2>

                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-white/20 rounded-lg hover:bg-white/30 
                    transition-all duration-300 text-white text-xl font-bold
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
