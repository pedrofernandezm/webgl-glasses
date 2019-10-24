"use strict";

/*
    Build 3D glasses.
    spec properties:
       * <string> envMapURL: url of the envMap
       * <string> frameMeshURL: url of the mesh used for the glasses frames
       * <string> lensesMeshURL: url of the mesh of the lenses
       * <string> occluderURL: url of the occluder
*/

const JeelizThreeGlassesCreator=function(THREE, JeelizHelper, spec){
    const threeGlasses=new THREE.Object3D();

    //enMap texture
    const textureEquirec = new THREE.TextureLoader().load( spec.envMapURL );
    textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
    textureEquirec.magFilter = THREE.LinearFilter;
    textureEquirec.minFilter = THREE.LinearMipMapLinearFilter;

    //glasses frames:
    new THREE.BufferGeometryLoader().load(spec.frameMeshURL, function(glassesFramesGeometry){
        glassesFramesGeometry.computeVertexNormals();

        //custom material with fading at the end of the branches
        const uniforms=Object.assign(THREE.ShaderLib.basic.uniforms,
            {
                envMap: {value: textureEquirec},
                color: {value: new THREE.Color(0xFFFFFF)},
                uBranchFading: {value: new THREE.Vector2(-90,60)} //first value: position (lower -> to the back), second: transition brutality
            });

        //tweak vertex shader to give the Z of the current point
        var vertexShaderSource="varying float vPosZ;\n"+THREE.ShaderLib.basic.vertexShader;
        vertexShaderSource = vertexShaderSource.replace('#include <fog_vertex>', 'vPosZ=position.z;');

        //tweak fragment shader to apply transparency at the end of the branches
        var fragmentShaderSource="uniform vec2 uBranchFading;\n varying float vPosZ;\n"+THREE.ShaderLib.basic.fragmentShader;
        const GLSLcomputeAlpha = 'gl_FragColor.a=smoothstep(uBranchFading.x-uBranchFading.y*0.5, uBranchFading.x+uBranchFading.y*0.5, vPosZ);'
        fragmentShaderSource = fragmentShaderSource.replace('#include <fog_fragment>', GLSLcomputeAlpha);

        const mat=new THREE.ShaderMaterial({
            vertexShader: vertexShaderSource,
            fragmentShader: fragmentShaderSource,
            uniforms: uniforms,
            transparent: true
        });
        mat.envMap=textureEquirec;
        const glassesFramesMesh=new THREE.Mesh(glassesFramesGeometry, mat);
        threeGlasses.add(glassesFramesMesh);
        window.m=mat;
    });

    var lensMaterial;

    //glasses lenses:
    new THREE.BufferGeometryLoader().load(spec.lensesMeshURL, function(glassesLensesGeometry){
        glassesLensesGeometry.computeVertexNormals();
        const mat=new THREE.MeshBasicMaterial({
            envMap: textureEquirec,
            opacity: 1.0,
            color: 0x000,
            transparent: false
        });
        window.mat=mat;
        lensMaterial = mat;
        const glassesLensesMesh=new THREE.Mesh(glassesLensesGeometry, mat);
        threeGlasses.add(glassesLensesMesh);
    });

    const occluderMesh = JeelizHelper.create_threejsOccluder(spec.occluderURL);

    return {
        glasses: threeGlasses,
        lensMaterial,
        occluder: occluderMesh
    };
}

module.exports = JeelizThreeGlassesCreator;
