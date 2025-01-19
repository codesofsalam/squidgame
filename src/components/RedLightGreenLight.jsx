import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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

  const createCharacterModel = (color, position) => {
    const group = new THREE.Group();

    const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.9, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.9;
    body.castShadow = true;
    group.add(body);

    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffdbac,
      roughness: 0.5,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    group.add(head);

    // Backpack
    const backpackGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.2);
    const backpackMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8,
    });
    const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
    backpack.position.set(0, 1, 0.25);
    backpack.castShadow = true;
    group.add(backpack);

    group.position.copy(position);
    return group;
  };

  // Initialize audio
  useEffect(() => {
    const audio = new Audio("/api/placeholder/audio"); // Replace with actual game music URL
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 35);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    renderer.shadowMap.enabled = true;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // Ground setup
    const groundGeometry = new THREE.PlaneGeometry(40, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5d1b8,
      side: THREE.DoubleSide,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const wallGeometry = new THREE.BoxGeometry(1, 10, 100);
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.position.set(-20, 5, 0);
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.position.set(20, 5, 0);
    scene.add(leftWall, rightWall);

    // Create multiple characters
    const characterColors = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500,
      0x800080,
    ];

    for (let i = 0; i < 8; i++) {
      const x = (i - 3.5) * 2;
      const z = 20;
      const position = new THREE.Vector3(x, 0, z);
      const character = createCharacterModel(characterColors[i], position);
      scene.add(character);
      charactersRef.current.push({
        mesh: character,
        initialX: x,
        eliminated: false,
      });
    }

    // Create doll
    const dollGroup = new THREE.Group();

    // Doll body
    const bodyGeometry = new THREE.CylinderGeometry(1, 1.5, 4, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffa726,
      roughness: 0.3,
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    dollGroup.add(body);

    // Doll dress
    const dressGeometry = new THREE.CylinderGeometry(2, 3, 3, 32);
    const dressMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdd835,
      roughness: 0.4,
    });
    const dress = new THREE.Mesh(dressGeometry, dressMaterial);
    dress.position.y = -0.5;
    dollGroup.add(dress);

    // Doll head
    const headGeometry = new THREE.SphereGeometry(1, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe0b2,
      roughness: 0.2,
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    dollGroup.add(head);

    // Doll eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.1,
    });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 2.7, 0.7);
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 2.7, 0.7);
    dollGroup.add(leftEye, rightEye);

    dollGroup.position.set(0, 2, -40);
    dollGroup.scale.set(3, 3, 3);
    scene.add(dollGroup);
    dollRef.current = dollGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 50, 50);
    sunLight.castShadow = true;
    scene.add(sunLight);

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

  useEffect(() => {
    if (gameState === "playing") {
      audioRef.current?.play();

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
            if (!newState) {
              audioRef.current?.pause();
            } else {
              audioRef.current?.play();
            }
            if (dollRef.current) {
              dollRef.current.rotation.y = newState ? 0 : Math.PI;
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
  }, [gameState]);

  const handleMovement = (e) => {
    if (gameState !== "playing") return;

    const moveSpeed = 0.5;
    let moved = false;

    if (e.key === "ArrowUp" || e.key === "w") {
      charactersRef.current.forEach((char) => {
        if (!char.eliminated) {
          char.mesh.position.z -= moveSpeed;
          moved = true;
        }
      });
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
      charactersRef.current.forEach((char) => {
        if (!char.eliminated) {
          char.mesh.position.x = Math.max(
            -18,
            char.mesh.position.x - moveSpeed
          );
        }
      });
    }

    if (e.key === "ArrowRight" || e.key === "d") {
      charactersRef.current.forEach((char) => {
        if (!char.eliminated) {
          char.mesh.position.x = Math.min(18, char.mesh.position.x + moveSpeed);
        }
      });
    }

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

    // Check if any surviving character reached the end
    const survivingCharacter = charactersRef.current.find(
      (char) => !char.eliminated && char.mesh.position.z <= -35
    );

    if (survivingCharacter) {
      setGameState("won");
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

  const startGame = () => {
    setGameState("playing");
    setIsGreenLight(true);
    setTimeLeft(60);
    setEliminatedCount(0);

    // Reset all characters
    charactersRef.current.forEach((char) => {
      char.eliminated = false;
      char.mesh.position.set(char.initialX, 0, 20);
      char.mesh.rotation.x = 0;
    });

    if (!isMuted) {
      audioRef.current?.play();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="mb-4 text-white text-center">
        <div className="flex items-center justify-between w-full mb-4">
          <h1 className="text-4xl font-bold">Red Light, Green Light</h1>
          <button
            onClick={toggleMute}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
        <div className="mb-2">
          {gameState === "waiting" && (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              onClick={startGame}
            >
              Start Game
            </button>
          )}
          {gameState === "playing" && (
            <div className="space-y-2">
              <div className="text-2xl">
                {isGreenLight ? "🟢 Green Light!" : "🔴 Red Light!"}
              </div>
              <div className="text-xl">
                Time Left: {timeLeft}s | Eliminated: {eliminatedCount}
              </div>
            </div>
          )}
          {gameState === "won" && (
            <div className="text-2xl text-green-500">
              You Won!{" "}
              <button
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-2"
              >
                Play Again
              </button>
            </div>
          )}
          {gameState === "lost" && (
            <div className="text-2xl text-red-500">
              Eliminated!{" "}
              <button
                onClick={startGame}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded ml-2"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      <div className="mt-4 text-white text-center space-y-1">
        <p>Use W/Up Arrow to move all characters forward</p>
        <p>Use A/Left Arrow and D/Right Arrow to move sideways</p>
        <p>Don&apos;t move when the doll turns around!</p>
      </div>
    </div>
  );
};

export default RedLightGreenLight;
