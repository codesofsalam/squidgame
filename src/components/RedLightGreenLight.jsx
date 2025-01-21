import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Volume, Volume2} from "lucide-react";

const RedLightGreenLight = () => {
  const [gameState, setGameState] = useState("waiting");
  const [isGreenLight, setIsGreenLight] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [eliminatedCount, setEliminatedCount] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const charactersRef = useRef([]);
  const dollRef = useRef(null);
  const frameRef = useRef(null);
  const audioRef = useRef(null);
  const controlsRef = useRef(null);

  const createPlayerModel = (color, position) => {
    const group = new THREE.Group();

    // Enhanced body with better proportions
    const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 8, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: color,
      shininess: 30,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    // More detailed jumpsuit
    const jumpsuitGeometry = new THREE.CapsuleGeometry(0.3, 0.9, 8, 16);
    const jumpsuitMaterial = new THREE.MeshPhongMaterial({
      color: 0x2E8B57,
      shininess: 20,
    });
    const jumpsuit = new THREE.Mesh(jumpsuitGeometry, jumpsuitMaterial);
    jumpsuit.position.y = 0.9;
    jumpsuit.scale.set(1.1, 1, 1.1);
    jumpsuit.castShadow = true;
    group.add(jumpsuit);

    // Detailed head with mask
    const headGeometry = new THREE.SphereGeometry(0.22, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFDBAC,
      shininess: 40,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    // Mask
    const maskGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.1);
    const maskMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      shininess: 50,
    });
    const mask = new THREE.Mesh(maskGeometry, maskMaterial);
    mask.position.set(0, 1.8, 0.15);
    mask.castShadow = true;
    group.add(mask);

    // Number on back
    const numberGeometry = new THREE.PlaneGeometry(0.3, 0.3);
    const numberMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF,
      shininess: 30,
    });
    const number = new THREE.Mesh(numberGeometry, numberMaterial);
    number.position.set(0, 1.2, -0.32);
    number.rotation.x = Math.PI;
    group.add(number);

    group.position.copy(position);
    return group;
  };

  const createGiantDoll = () => {
    const group = new THREE.Group();

    // Doll body with Korean school uniform style
    const bodyGeometry = new THREE.CylinderGeometry(1.2, 1.8, 5, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFA726,
      shininess: 30,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Orange dress
    const dressGeometry = new THREE.CylinderGeometry(2.2, 3.2, 4, 32);
    const dressMaterial = new THREE.MeshPhongMaterial({
      color: 0xFF5722,
      shininess: 40,
    });
    const dress = new THREE.Mesh(dressGeometry, dressMaterial);
    dress.position.y = -0.5;
    group.add(dress);

    // Detailed head
    const headGeometry = new THREE.SphereGeometry(1.2, 64, 64);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFE0B2,
      shininess: 50,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 3;
    group.add(head);

    // Pigtails
    const pigtailGeometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
    const pigtailMaterial = new THREE.MeshPhongMaterial({
      color: 0x3E2723,
      shininess: 30,
    });
    const leftPigtail = new THREE.Mesh(pigtailGeometry, pigtailMaterial);
    leftPigtail.position.set(-1.5, 3.5, 0);
    const rightPigtail = new THREE.Mesh(pigtailGeometry, pigtailMaterial);
    rightPigtail.position.set(1.5, 3.5, 0);
    group.add(leftPigtail, rightPigtail);

    // Large eyes with glow effect
    const eyeGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
      shininess: 100,
      emissive: 0xFF0000,
      emissiveIntensity: 0.5,
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.5, 3.2, 0.8);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.5, 3.2, 0.8);
    group.add(leftEye, rightEye);

    group.position.set(0, 2.5, -40);
    group.scale.set(3, 3, 3);
    return group;
  };

  // Rest of the game logic remains similar but with enhanced visuals
   // Initialize audio
   useEffect(() => {
    const audio = new Audio("/api/placeholder/audio");
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
    scene.background = new THREE.Color(0x708090);
    scene.fog = new THREE.FogExp2(0x708090, 0.02);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 40);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

   // Initialize OrbitControls
   const controls = new OrbitControls(camera, renderer.domElement);
   controls.enableDamping = true;
   controls.dampingFactor = 0.05;
   controls.minDistance = 20;
   controls.maxDistance = 50;
   controls.maxPolarAngle = Math.PI / 2 - 0.1;
   controlsRef.current = controls;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);
  
      const mainLight = new THREE.DirectionalLight(0xffffff, 1);
      mainLight.position.set(50, 50, 50);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 2048;
      mainLight.shadow.mapSize.height = 2048;
      scene.add(mainLight);
  
      // Create ground
      const groundGeometry = new THREE.PlaneGeometry(100, 100);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
  
      // Create doll
      const doll = createGiantDoll();
      scene.add(doll);
      dollRef.current = doll;
  
      // Create players
      const playerColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44];
      playerColors.forEach((color, index) => {
        const x = (index - 1.5) * 3;
        const position = new THREE.Vector3(x, 0, 20);
        const player = createPlayerModel(color, position);
        scene.add(player);
        charactersRef.current.push({
          mesh: player,
          initialPos: position.clone(),
          eliminated: false,
        });
      });
  
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
  
      return () => {
        cancelAnimationFrame(frameRef.current);
        renderer.dispose();
      };
    }, []);

    // Game logic
  useEffect(() => {
    if (gameState === "playing") {
      if (!isMuted) {
        audioRef.current?.play();
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            setGameState("lost");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const gameLoop = setInterval(() => {
        const shouldChange = Math.random() > 0.7;
        if (shouldChange) {
          setIsGreenLight((prev) => {
            const newState = !prev;
            if (dollRef.current) {
              dollRef.current.rotation.y = newState ? 0 : Math.PI;
              dollRef.current.children
                .filter(child => child.material?.emissive)
                .forEach(eye => {
                  eye.material.emissiveIntensity = newState ? 0 : 1;
                });
            }
            return newState;
          });
        }
      }, 2000);
      return () => {
        clearInterval(timer);
        clearInterval(gameLoop);
        audioRef.current?.pause();
      };
    }
  }, [gameState, isMuted]);

  const handleMovement = (e) => {
    if (gameState !== "playing") return;

    const moveSpeed = 0.5;
    let moved = false;

    charactersRef.current.forEach((char) => {
      if (!char.eliminated) {
        if (e.key === "ArrowUp" || e.key === "w") {
          char.mesh.position.z -= moveSpeed;
          moved = true;
        } else if (e.key === "ArrowLeft" || e.key === "a") {
          char.mesh.position.x = Math.max(-18, char.mesh.position.x - moveSpeed);
        } else if (e.key === "ArrowRight" || e.key === "d") {
          char.mesh.position.x = Math.min(18, char.mesh.position.x + moveSpeed);
        }
      }
    });

    if (moved && !isGreenLight) {
      charactersRef.current.forEach((char) => {
        if (!char.eliminated) {
          char.eliminated = true;
          char.mesh.rotation.x = Math.PI / 2;
          setEliminatedCount((prev) => prev + 1);
        }
      });
      setGameState("lost");
    }

    const survivingCharacter = charactersRef.current.find(
      (char) => !char.eliminated && char.mesh.position.z <= -35
    );

    if (survivingCharacter) {
      setGameState("won");
    }
  };

  const startGame = () => {
    setGameState("playing");
    setIsGreenLight(true);
    setTimeLeft(60);
    setEliminatedCount(0);

    // Reset characters
    charactersRef.current.forEach((char) => {
      char.eliminated = false;
      char.mesh.position.copy(char.initialPos);
      char.mesh.rotation.x = 0;
    });

    if (!isMuted) {
      audioRef.current?.play();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleMovement);
    return () => window.removeEventListener("keydown", handleMovement);
  }, [gameState, isGreenLight]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-500 via-red-500 to-yellow-500">
      <div className="relative w-full max-w-4xl">
        <div className="absolute top-0 left-0 right-0 z-10 p-4 text-center">
          <div className="backdrop-blur-md bg-black/50 rounded-xl p-6 shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <Volume className="w-6 h-6 text-white" />
                ) : (
                  <Volume2 className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
            <h1 className="text-6xl font-bold text-white mb-4 font-['Roboto'] tracking-wider">
              {gameState === "waiting" ? "SQUID GAME" : "456"}
            </h1>
            <div className="space-y-4">
              {gameState === "waiting" && (
                <button
                  onClick={startGame}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full text-xl transform transition hover:scale-105 shadow-lg"
                >
                Start Game
                </button>
              )}
              {gameState === "playing" && (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {isGreenLight ? "GREEN LIGHT" : "RED LIGHT!"}
                  </div>
                  <div className="text-2xl text-white">
                    Time: {timeLeft}s | Eliminated: {eliminatedCount}
                  </div>
                </div>
              )}
              {(gameState === "won" || gameState === "lost") && (
                <div className={`text-3xl ${gameState === "won" ? "text-green-400" : "text-red-400"} font-bold`}>
                  {gameState === "won" ? "Won" : "Try Again"}{" "}
                  <button
                    onClick={startGame}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full ml-4 text-xl"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="rounded-2xl shadow-2xl" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
          <div className="backdrop-blur-md bg-black/50 text-white rounded-xl p-4">
            <p className="font-bold">Controls:</p>
            <p>W/↑ - Move Forward | A/← D/→ - Move Sideways</p>
            <p className="text-red-400">Don&apos;t move when the doll turns around!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedLightGreenLight;