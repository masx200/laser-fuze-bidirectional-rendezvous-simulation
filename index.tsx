import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Icons
const IconPlay = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IconPause = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const IconRefresh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const IconTarget = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const IconBox = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconCloud = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>;
const IconSun = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;

const App = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [missileSpeed, setMissileSpeed] = useState(600); 
  const [targetSpeed, setTargetSpeed] = useState(30);
  const [sunIntensityManual, setSunIntensityManual] = useState(10.0);
  const [scenario, setScenario] = useState('linear'); 
  const [targetType, setTargetType] = useState('tank'); 
  const [weather, setWeather] = useState('clear'); 
  const [realtimeData, setRealtimeData] = useState({ distance: '120.00', delay: '800.00' });
  const [activeTab, setActiveTab] = useState('params');

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const missileRef = useRef<THREE.Group | null>(null);
  const targetRef = useRef<THREE.Group | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const laserRaysRef = useRef<THREE.Mesh[]>([]);
  const skyRef = useRef<THREE.Mesh | null>(null);
  const cloudGroupRef = useRef<THREE.Group | null>(null);

  const targetTypes = [
    { id: 'tank', name: '重型坦克' },
    { id: 'drone', name: '高速无人车' },
    { id: 'truck', name: '大型货运体' }
  ];

  const scenariosList = [
    { id: 'linear', name: '直线' },
    { id: 'diagonal', name: '斜交' },
    { id: 'curve', name: 'S弯' }
  ];

  const weatherPresets: Record<string, any> = {
    clear: { name: '晴朗', skyColor: 0x4dabff, groundColor: 0x347d34, fogColor: 0x99ccff, fogNear: 2000, fogFar: 12000, laserOpacity: 0.9, sunIntensity: 10.0 },
    foggy: { name: '浓雾', skyColor: 0x888888, groundColor: 0x445544, fogColor: 0xaaaaaa, fogNear: 10, fogFar: 2000, laserOpacity: 0.4, sunIntensity: 2.0 },
    dust: { name: '阴天', skyColor: 0x778899, groundColor: 0x2e4d2e, fogColor: 0x667788, fogNear: 50, fogFar: 4000, laserOpacity: 0.7, sunIntensity: 4.0 },
    night: { name: '深夜', skyColor: 0x010108, groundColor: 0x051505, fogColor: 0x000000, fogNear: 500, fogFar: 5000, laserOpacity: 1.0, sunIntensity: 0.1 }
  };

  // 动态生成草地贴图
  const createGrassTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // 基础绿色
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, 512, 512);
    
    // 添加随机草点
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const h = Math.random() * 4 + 2;
      const green = 60 + Math.random() * 80;
      ctx.fillStyle = `rgb(30, ${green}, 30)`;
      ctx.fillRect(x, y, 1, h);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    return texture;
  };

  // 动态生成云朵贴图
  const createCloudTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
  };

  const createTargetModel = (type: string) => {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2f4f2f, roughness: 0.7, metalness: 0.2 });
    const detailMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });

    switch (type) {
      case 'drone': {
        const dBody = new THREE.Mesh(new THREE.BoxGeometry(30, 15, 25), bodyMat);
        dBody.castShadow = true;
        dBody.receiveShadow = true;
        group.add(dBody);
        group.userData = { height: 15 };
        break;
      }
      case 'truck': {
        const tBody = new THREE.Mesh(new THREE.BoxGeometry(100, 25, 35), bodyMat);
        tBody.castShadow = true;
        tBody.receiveShadow = true;
        group.add(tBody);
        group.userData = { height: 35 };
        break;
      }
      default: {
        const body = new THREE.Mesh(new THREE.BoxGeometry(60, 30, 40), bodyMat);
        body.castShadow = true;
        body.receiveShadow = true;
        const turret = new THREE.Mesh(new THREE.CylinderGeometry(15, 18, 15, 16), bodyMat);
        turret.position.y = 20;
        turret.castShadow = true;
        turret.receiveShadow = true;
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 50, 16), bodyMat);
        barrel.rotation.z = -Math.PI / 2;
        barrel.position.set(-30, 20, 0);
        barrel.castShadow = true;
        group.add(body, turret, barrel);
        group.userData = { height: 30 };
      }
    }
    return group;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 1, 40000);
    camera.position.set(200, 400, 1200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 1.0; 
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 1. 大气天空
    const skyGeo = new THREE.SphereGeometry(20000, 32, 32);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x4dabff) },
        bottomColor: { value: new THREE.Color(0xffffff) },
        offset: { value: 400 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize( vWorldPosition + offset ).y;
          gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
    skyRef.current = sky;

    // 2. 云朵系统
    const cloudGroup = new THREE.Group();
    const cloudTex = createCloudTexture();
    for(let i=0; i<40; i++) {
      const spriteMat = new THREE.SpriteMaterial({ map: cloudTex, opacity: 0.6, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(
        (Math.random()-0.5) * 10000,
        2000 + Math.random() * 1000,
        (Math.random()-0.5) * 10000
      );
      sprite.scale.set(1500 + Math.random()*1000, 800 + Math.random()*500, 1);
      cloudGroup.add(sprite);
    }
    scene.add(cloudGroup);
    cloudGroupRef.current = cloudGroup;

    // 3. 草地地面
    const groundGeo = new THREE.PlaneGeometry(40000, 40000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      map: createGrassTexture(),
      roughness: 1.0,
      metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true; // Ground receives shadows
    scene.add(ground);

    // 4. 光照系统
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x336633, 0.4);
    hemiLight.position.set(0, 1000, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 10);
    sunLight.position.set(-3000, 5000, -2000);
    sunLight.castShadow = true; // Sun casts shadows
    
    // Shadow properties
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 15000;
    const shadowSize = 3000;
    sunLight.shadow.camera.left = -shadowSize;
    sunLight.shadow.camera.right = shadowSize;
    sunLight.shadow.camera.top = shadowSize;
    sunLight.shadow.camera.bottom = -shadowSize;
    sunLight.shadow.bias = -0.0005;

    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 导弹
    const missile = new THREE.Group();
    const missileBody = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 60, 32), 
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.6, roughness: 0.3 })
    );
    missileBody.rotation.z = Math.PI / 2;
    missileBody.castShadow = true;
    missileBody.receiveShadow = true;
    
    // Fins
    const finGeo = new THREE.BoxGeometry(20, 2, 10);
    const fin1 = new THREE.Mesh(finGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
    fin1.position.set(-20, 0, 0);
    const fin2 = new THREE.Mesh(finGeo, new THREE.MeshStandardMaterial({color: 0x333333}));
    fin2.position.set(-20, 0, 0);
    fin2.rotation.x = Math.PI / 2;
    missile.add(missileBody, fin1, fin2);

    missile.position.set(600, 120, 0);
    scene.add(missile);
    missileRef.current = missile;

    // 激光
    const laserRays: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const laserGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
      laserGeom.rotateX(Math.PI / 2);
      const laserMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ff88, 
        transparent: true, 
        opacity: 0.6, 
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const laser = new THREE.Mesh(laserGeom, laserMat);
      laser.visible = false;
      scene.add(laser);
      laserRays.push(laser);
    }
    laserRaysRef.current = laserRays;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 200;
    controls.maxDistance = 5000;

    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Cloud drift
      if(cloudGroupRef.current) {
        cloudGroupRef.current.children.forEach((c: THREE.Object3D) => {
          c.position.x += 0.8;
          if(c.position.x > 8000) c.position.x = -8000;
        });
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !skyRef.current) return;
    const config = weatherPresets[weather];
    sceneRef.current.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar);
    
    // Explicitly cast the material to ShaderMaterial to access uniforms
    const skyMat = skyRef.current.material as THREE.ShaderMaterial;
    skyMat.uniforms.topColor.value.setHex(config.skyColor);
    skyMat.uniforms.bottomColor.value.setHex(config.fogColor);
  }, [weather]);

  useEffect(() => {
    if (sunLightRef.current) sunLightRef.current.intensity = sunIntensityManual;
  }, [sunIntensityManual]);

  useEffect(() => {
    if (!sceneRef.current) return;
    if (targetRef.current) sceneRef.current.remove(targetRef.current);
    const newTarget = createTargetModel(targetType);
    newTarget.position.set(-600, newTarget.userData.height / 2, 0);
    sceneRef.current.add(newTarget);
    targetRef.current = newTarget;
    resetSimulation();
  }, [targetType]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime(prev => prev + 0.02);
        if (targetRef.current && missileRef.current) {
          const dt = 0.02;
          
          // Move target
          targetRef.current.position.x += targetSpeed * 2.5 * dt;
          if (scenario === 'diagonal') targetRef.current.position.z += targetSpeed * dt;
          if (scenario === 'curve') {
             targetRef.current.position.z = Math.sin(targetRef.current.position.x * 0.005) * 200;
             targetRef.current.rotation.y = Math.cos(targetRef.current.position.x * 0.005) * 0.5;
          } else {
             targetRef.current.rotation.y = 0;
          }

          // Move missile
          missileRef.current.position.x -= (missileSpeed / 10) * dt;
          
          // Guide missile (simple tracking)
          const targetPos = targetRef.current.position.clone();
          targetPos.y += 10;
          missileRef.current.lookAt(targetPos);
          missileRef.current.rotateY(-Math.PI/2); // Re-orient cylinder

          const mPos = missileRef.current.position.clone();
          const tPos = targetRef.current.position.clone();
          tPos.y += targetRef.current.userData.height / 2;
          const dist = mPos.distanceTo(tPos);

          setRealtimeData({
            distance: (dist / 10).toFixed(2),
            delay: (dist * 2 / 0.3).toFixed(2)
          });
          
          laserRaysRef.current.forEach((laser, i) => {
            if (laser) {
               laser.visible = true;
               laser.position.copy(mPos);
               const tp = tPos.clone();
               // Spread lasers slightly
               tp.y += (i - 1) * 2;
               tp.z += (i - 1) * 2;
               laser.lookAt(tp);
               laser.scale.z = dist;
               laser.position.lerp(tp, 0.5); // Center the cylinder between points
               
               // Cast material to MeshBasicMaterial (or Material) to access opacity
               (laser.material as THREE.MeshBasicMaterial).opacity = weatherPresets[weather].laserOpacity * (0.5 + Math.random() * 0.5);
            }
          });

          if (missileRef.current.position.x < targetRef.current.position.x - 100) {
              setIsPlaying(false);
          }
        }
      }, 20);
    } else {
      laserRaysRef.current?.forEach(l => l.visible = false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simTime, missileSpeed, targetSpeed, scenario, weather]);

  const resetSimulation = () => {
    setSimTime(0);
    setIsPlaying(false);
    missileRef.current?.position.set(600, 120, 0);
    if(targetRef.current) {
        targetRef.current.position.set(-600, targetRef.current.userData.height / 2, 0);
        targetRef.current.rotation.set(0,0,0);
    }
    laserRaysRef.current?.forEach(l => l.visible = false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a100a] text-slate-200 overflow-hidden font-sans select-none">
      {/* Sidebar */}
      <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-black/40 backdrop-blur-xl z-10">
        <div className="p-3 bg-green-600/20 text-green-400 rounded-xl shadow-lg shadow-green-900/20 mb-4 ring-1 ring-inset ring-green-500/30">
            <IconTarget />
        </div>
        <button 
            onClick={() => setActiveTab('params')} 
            className={`p-3 rounded-xl transition-all duration-300 ${activeTab === 'params' ? 'bg-white/10 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
        >
            <IconBox />
        </button>
        <button 
            onClick={() => setActiveTab('env')} 
            className={`p-3 rounded-xl transition-all duration-300 ${activeTab === 'env' ? 'bg-white/10 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
        >
            <IconCloud />
        </button>
      </div>

      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 relative bg-gradient-to-b from-blue-900/10 to-transparent" ref={mountRef}>
          {/* Top Info */}
          <div className="absolute top-6 left-6 z-20 animate-fade-in">
             <div className="bg-black/40 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl">
                <div className="text-[10px] text-green-400 font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                   Laser Engagement Simulation
                </div>
                <div className="text-[11px] text-slate-400 font-mono tracking-wide">
                   ENV: {weatherPresets[weather].name.toUpperCase()} | SCENARIO: {scenariosList.find(s=>s.id===scenario)?.name.toUpperCase()}
                </div>
             </div>
          </div>

          {/* Realtime Data HUD */}
          <div className="absolute bottom-24 left-6 z-20">
             <div className="bg-black/60 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/5 group hover:ring-white/10 transition-all">
                <div className="flex gap-12 font-mono">
                   <div>
                       <span className="text-[9px] text-slate-500 block mb-1 tracking-wider font-bold">RANGE (M)</span>
                       <span className="text-2xl text-white font-bold tracking-tighter tabular-nums">{realtimeData.distance}</span>
                   </div>
                   <div>
                       <span className="text-[9px] text-slate-500 block mb-1 tracking-wider font-bold">LATENCY (NS)</span>
                       <span className="text-2xl text-green-400 font-bold tracking-tighter tabular-nums drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">{realtimeData.delay}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Playback Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#0f1215]/80 p-2 rounded-[2rem] border border-white/10 backdrop-blur-2xl z-30 shadow-2xl ring-1 ring-black/50">
            <button 
                onClick={resetSimulation} 
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                title="Reset"
            >
                <IconRefresh />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`h-10 px-8 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 ${
                  isPlaying 
                  ? 'bg-red-500/90 text-white hover:bg-red-500 shadow-red-500/20' 
                  : 'bg-green-500 text-black hover:bg-green-400 shadow-green-500/25'
              }`}
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
              <span>{isPlaying ? "Abort" : "Engage"}</span>
            </button>
            <div className="w-24 text-right px-4 font-mono text-xs font-bold text-slate-300 tabular-nums">
                <span className="text-[9px] text-slate-600 mr-1">T+</span>
                {simTime.toFixed(2)}s
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-80 border-l border-white/5 bg-black/40 backdrop-blur-2xl p-6 flex flex-col gap-8 z-30 shadow-2xl">
        {activeTab === 'env' ? (
          <section className="space-y-6 animate-slide-in">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <IconCloud /> Environment Control
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(weatherPresets).map(key => (
                <button 
                  key={key} 
                  onClick={() => {
                    setWeather(key);
                    setSunIntensityManual(weatherPresets[key].sunIntensity);
                  }}
                  className={`py-4 px-3 rounded-xl border text-[11px] font-bold transition-all duration-200 ${weather === key ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-white'}`}
                >
                  {weatherPresets[key].name}
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <IconSun /> Sun Intensity
                     </label>
                     <span className="text-[10px] font-mono text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">{sunIntensityManual.toFixed(1)}</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    step="0.5" 
                    value={sunIntensityManual} 
                    onChange={e=>setSunIntensityManual(Number(e.target.value))} 
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                />
            </div>
          </section>
        ) : (
          <section className="space-y-8 animate-slide-in">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Configuration</label>
              <div className="relative">
                  <select 
                    value={targetType} 
                    onChange={e=>setTargetType(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-green-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    {targetTypes.map(t=><option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
              </div>
              
              <div className="grid grid-cols-3 gap-1 bg-white/5 p-1.5 rounded-xl">
                {scenariosList.map(s=>(
                  <button 
                    key={s.id} 
                    onClick={()=>setScenario(s.id)} 
                    className={`py-2 rounded-lg text-[10px] font-bold transition-all ${scenario===s.id ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kinematics</label>
              
              <div className="space-y-3 group">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500 group-hover:text-blue-400 transition-colors">V_MISSILE</span>
                    <span className="text-blue-400 font-bold bg-blue-400/10 px-1.5 rounded">{missileSpeed}</span>
                </div>
                <input type="range" min="200" max="1500" step="50" value={missileSpeed} onChange={e=>setMissileSpeed(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              </div>

              <div className="space-y-3 group">
                <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500 group-hover:text-green-400 transition-colors">V_TARGET</span>
                    <span className="text-green-400 font-bold bg-green-400/10 px-1.5 rounded">{targetSpeed}</span>
                </div>
                <input type="range" min="0" max="150" step="5" value={targetSpeed} onChange={e=>setTargetSpeed(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
              </div>
            </div>
          </section>
        )}

        <div className="mt-auto p-4 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5">
           <div className="flex items-start gap-3">
               <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
               <div>
                   <h4 className="text-[10px] font-black text-slate-300 uppercase mb-1">Rendering Engine</h4>
                   <p className="text-[9px] text-slate-500 leading-relaxed">
                       Procedural volumetric clouds enabled. 
                       <br/>Tone mapping: ACES Filmic.
                       <br/>Soft Shadows: PCF Enabled.
                   </p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);