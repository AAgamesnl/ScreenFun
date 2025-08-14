(function(){
  function initQuizMaster(containerId){
    var container=document.getElementById(containerId);
    if(!container||!window.THREE)return;
    var width=container.clientWidth||300;
    var height=container.clientHeight||200;
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(75,width/height,0.1,1000);
    var renderer=new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(width,height);
    container.appendChild(renderer.domElement);
    var geometry=new THREE.BoxGeometry();
    var material=new THREE.MeshNormalMaterial();
    var cube=new THREE.Mesh(geometry,material);
    scene.add(cube);
    camera.position.z=2;
    function animate(){
      requestAnimationFrame(animate);
      cube.rotation.x+=0.01;
      cube.rotation.y+=0.01;
      renderer.render(scene,camera);
    }
    animate();
    return {scene:scene,camera:camera,renderer:renderer,cube:cube};
  }
  window.initQuizMaster=initQuizMaster;
})();
