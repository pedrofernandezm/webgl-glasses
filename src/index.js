const THREE = require("three");
const JeelizResizer = require("../helpers/JeelizResizer");
const JeelizHelper = require("../helpers/JeelizThreejsHelper")(THREE);
const JEEFACEFILTERAPI = require("../lib/jeelizFaceFilterES6");
const OrbitControls = require('three-orbitcontrols');
const OBJLoader = require("three-obj-loader")(THREE);
const JeelizThreeGlassesCreator = require("../helpers/JeelizThreeGlassesCreator");
import './style.css';

var THREECAMERA;

// callback : launched if a face is detected or lost. TODO : add a cool particle effect WoW !
function detect_callback(faceIndex, isDetected) {
  if (isDetected) {
    console.log('INFO in detect_callback() : DETECTED');
  } else {
    console.log('INFO in detect_callback() : LOST');
  }
}

let threeGlasses

const green = 0x00FF00;
const blue = 0x0000FF;
const red = 0xFF0000;
const yellow = 0xFFFF00;
const aqua = 0x00FFFF;
const salmon = 0xFA8072;
const black = 0x000000;
const brown = 0x8B4513;
const gold = 0xD4AF37;
const silver = 0xC0C0C0;

let frameMaterial
let lensMaterial

// build the 3D. called once when Jeeliz Face Filter is OK
function init_threeScene(spec, lensColor, frameColor) {
  const threeStuffs = JeelizHelper.init(spec, detect_callback);

   // CREATE A CUBE
  // const cubeGeometry = new THREE.BoxGeometry(1,1,1);
  // const cubeMaterial = new THREE.MeshNormalMaterial();
  // const threeCube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  // threeCube.frustumCulled = false;


  //const threeGlasses = r.glasses;
  ////threeGlasses.rotation.set(-0.15,0,0); //X neg -> rotate branches down
  //threeGlasses.position.set(0,0.07,0.4);
  //threeGlasses.scale.multiplyScalar(0.006);
  //threeStuffs.faceObject.add(threeGlasses);

  const loader = new THREE.OBJLoader();
  loader.load("./glasses.obj", (root) => {
    const textureEquirec = new THREE.TextureLoader().load( "envMap.jpg" );
    textureEquirec.mapping = THREE.EquirectangularRefractionMapping;
    textureEquirec.magFilter = THREE.LinearFilter;
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

    const r = JeelizThreeGlassesCreator(THREE, JeelizHelper, {
      envMapURL: "envMap.jpg",
      frameMeshURL: "models3D/glassesFramesBranchesBent.json",
      lensesMeshURL: "models3D/glassesLenses.json",
      occluderURL: "models3D/face.json"
    });

    threeStuffs.faceObject.add(r.occluder);
    r.occluder.rotation.set(0.3,0,0);
    r.occluder.position.set(0,0.1,-0.04);
    r.occluder.scale.multiplyScalar(0.0084);


    const light = new THREE.HemisphereLight(0xFFFFFF, 0xFFFFFF, 1);
    light.position.set(0, 1, 1);


    threeGlasses =  new THREE.Object3D();
    const [frame, lens] = root.children;

    frameMaterial = new THREE.MeshPhongMaterial({ color: frameColor });
    frameMaterial.needsUpdate = true;
    frame.material = frameMaterial;
    threeGlasses.add(frame);

    lensMaterial = new THREE.MeshPhongMaterial({ color: lensColor });
    lensMaterial.needsUpdate = true;
    lensMaterial.envMap = textureEquirec;
    lens.material = lensMaterial;
    threeGlasses.add(lens);

    threeGlasses.position.set(0,0.07,0.4);
    threeGlasses.scale.multiplyScalar(0.006);

    threeStuffs.faceObject.add(light);
    threeStuffs.faceObject.add(threeGlasses);


    // threeStuffs.faceObject.add(root.children[0]);
  });

  // threeStuffs.faceObject.add(threeCube);

  //CREATE THE CAMERA
  THREECAMERA = JeelizHelper.create_camera();
} // end init_threeScene()

// launched by body.onload():
function main(){
  JeelizResizer.size_canvas({
    canvasId: 'configureCanvas',
    callback: function(isError, bestVideoSettings){
      init_faceFilter(bestVideoSettings);
    }
  })
} //end main()

function init_faceFilter(videoSettings){
  JEEFACEFILTERAPI.init({
    followZRot: true,
    canvasId: 'configureCanvas',
    NNCpath: '../', // root of NNC.json file
    maxFacesDetected: 1,
    callbackReady: function(errCode, spec){
      if (errCode){
        console.log('AN ERROR HAPPENS. ERR =', errCode);
        return;
      }

      console.log('INFO : JEEFACEFILTERAPI IS READY');
      init_threeScene(spec, yellow, black);
    }, //end callbackReady()

    //called at each render iteration (drawing loop) :
    callbackTrack: function(detectState){
      JeelizHelper.render(detectState, THREECAMERA);
    } //end callbackTrack()
  }); //end JEEFACEFILTERAPI.init call
} // end main()

/*document.getElementById("green-lenses").onclick = function() {
  console.log('lenses green')
};*/


document.addEventListener('DOMContentLoaded', () => {
  const classLens = document.getElementsByClassName("lens");
  const classFrame  = document.getElementsByClassName("frame");

  const setLensColor = function() {
    lensMaterial.color =  new THREE.Color(this.getAttribute("data-color"))
    for (let i = 0; i < classLens.length; i++) {
      classLens[i].classList.remove("selected")
    }
    this.classList.add("selected")
  };

  const setFrameColor = function() {
    frameMaterial.color =  new THREE.Color(this.getAttribute("data-color"))
    for (let i = 0; i < classFrame.length; i++) {
      classFrame[i].classList.remove("selected")
    }
    this.classList.add("selected")
  };

  for (let i = 0; i < classLens.length; i++) {
    classLens[i].addEventListener('click', setLensColor, false);
  }

  for (let i = 0; i < classFrame.length; i++) {
    classFrame[i].addEventListener('click',  setFrameColor, false);
  }
})


main();
