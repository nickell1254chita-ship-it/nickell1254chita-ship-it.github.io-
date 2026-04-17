window.onload = () => {
    if (typeof fflate !== 'undefined') window.fflate = fflate;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd4e4f7);
    scene.fog = new THREE.FogExp2(0xd4e4f7, 0.00018);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(1000, 1000, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.getElementById("three").appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 100;
    controls.maxDistance = 5000;
    controls.maxPolarAngle = Math.PI / 2.1;

    window._mapCamera   = camera;
    window._mapControls = controls;

    // ライト
    const sun = new THREE.DirectionalLight(0xfff8f0, 2.0);
    sun.position.set(600, 1000, 400);
    sun.castShadow = true;
    sun.shadow.mapSize.width  = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far  = 5000;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -1500;
    sun.shadow.camera.right = sun.shadow.camera.top   =  1500;
    sun.shadow.bias = -0.0003;
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xb0c8e8, 1.2));
    const ground = new THREE.DirectionalLight(0xfdecc8, 0.4);
    ground.position.set(-200, -100, 200);
    scene.add(ground);

    // グリッド
    const grid = new THREE.GridHelper(4000, 80, 0x94a8c8, 0xbdd0e8);
    grid.material.opacity = 0.35;
    grid.material.transparent = true;
    scene.add(grid);

    const modelPath = './model/school.fbx';

    const ext = modelPath.split('.').pop().toLowerCase();
    const loader = (ext === 'fbx')
        ? new THREE.FBXLoader()
        : new THREE.GLTFLoader();

    loader.load(modelPath, (result) => {
        const object = (ext === 'fbx') ? result : result.scene;

        const box = new THREE.Box3().setFromObject(object);
        const center = new THREE.Vector3();
        box.getCenter(center);
        object.position.x -= center.x;
        object.position.z -= center.z;
        object.position.y -= box.min.y;

        object.traverse(child => {
            if (child.isMesh) {
                child.castShadow    = true;
                child.receiveShadow = true;
            }
        });

        scene.add(object);

        const loading = document.getElementById("loading");
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.style.display = 'none', 700);
        }

        document.getElementById("controls-panel").classList.add("visible");
        document.getElementById("info-panel").classList.add("visible");
        document.getElementById("floor-selector").classList.add("visible");

    }, (xhr) => {
        if (xhr.total > 0) {
            const pct   = Math.floor((xhr.loaded / xhr.total) * 100);
            const fill  = document.getElementById("loading-bar-fill");
            const pctEl = document.getElementById("loading-percent");
            if (fill)  fill.style.width = pct + "%";
            if (pctEl) pctEl.textContent = pct + "%";
        }
    }, (error) => {
        console.error("モデルの読み込みに失敗:", error);
        const loading = document.getElementById("loading");
        if (loading) loading.innerHTML = `
            <div style="font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:6px;color:#ef4444;">LOAD ERROR</div>
            <div style="font-size:12px;color:rgba(26,31,46,0.5);margin-top:8px;letter-spacing:2px;">${error.message}</div>
        `;
    });

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    window.onresize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
};

// Yokoyama