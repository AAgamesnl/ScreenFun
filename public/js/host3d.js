(() => {
  const canvas = document.getElementById('renderCanvas');
  if (!canvas) return;
  const engine = new BABYLON.Engine(canvas, true);

  const createScene = () => {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 5, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(1, 1, 0), scene);

    // placeholder quizmaster: box body + sphere head
    const body = BABYLON.MeshBuilder.CreateBox('body', { height: 1.5, width: 0.8, depth: 0.4 }, scene);
    body.position.y = 0.75;
    const head = BABYLON.MeshBuilder.CreateSphere('head', { diameter: 0.6 }, scene);
    head.position.y = 1.5;
    const mat = new BABYLON.StandardMaterial('mat', scene);
    mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 1);
    body.material = mat;
    head.material = mat;

    return scene;
  };

  const scene = createScene();
  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });
})();
