/*
        Comp Editer Tools  v1.0.0
 
        更新内容：
            1、
        
        更新时间：2019.09.10 11:28
        ---------------------------------------------------------------------
*/
var dirPath = File($.fileName).path;
$.evalFile(dirPath + "/" + "CommonFunction.jsxbin");

/***** Main Function ****/
var elementCompNameStrs = "Fountain Fire Video Fog Light laser";


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//  创建合成函数
function setDurationOfCompIncludesSubcomp(comp,duration,depth){
    // 判断深度，如果为零就就结束
    var depthCount=depth;
    if(depthCount==0){ return }
    depthCount-=1;
    // 设置comp
    comp.duration= duration;
    // 设置合成里的层的出点
    for(var i=1;i<=comp.numLayers;i++){
        var layer = comp.layer(i);
        if(layer instanceof AVLayer){
            var item = layer.source;
            if(item.typeName =="Composition"){  setDurationOfCompIncludesSubcomp(item,duration,depthCount); }
            layer.outPoint = duration;
        }
        layer.outPoint = duration;
    }
}
//setDurationOfCompIncludesSubcomp(app.project.activeItem,6,2)
function copyInstanceCamera(srcCompName, srcCamName, targetComp){
    var camLayer =targetComp.layers.addCamera(srcCamName, [0,0]);
    
    camLayer.transform.pointOfInterest.expression = 'comp("'+srcCompName+'").layer(name).transform.pointOfInterest';
    camLayer.transform.position.expression = 'comp("'+srcCompName+'").layer(name).transform.position';
    camLayer.transform.orientation.expression = 'comp("'+srcCompName+'").layer(name).transform.orientation';
    camLayer.transform.xRotation.expression = 'comp("'+srcCompName+'").layer(name).transform.xRotation';
    camLayer.transform.yRotation.expression = 'comp("'+srcCompName+'").layer(name).transform.yRotation';
    camLayer.transform.zRotation.expression = 'comp("'+srcCompName+'").layer(name).transform.zRotation';
    camLayer.cameraOption.zoom.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.zoom';
    camLayer.cameraOption.depthOfField.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.depthOfField';
    camLayer.cameraOption.focusDistance.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.focusDistance';
    camLayer.cameraOption.aperture.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.aperture';
    camLayer.cameraOption.blurLevel.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.blurLevel';
    camLayer.cameraOption.irisShape.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.irisShape';
    camLayer.cameraOption.irisRotation.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.irisRotation';
    camLayer.cameraOption.irisRoundness.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.irisRoundness';
    camLayer.cameraOption.irisAspectRatio.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.irisAspectRatio';
    camLayer.cameraOption.irisDiffractionFringe.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.irisDiffractionFringe';
    camLayer.cameraOption.highlightGain.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.highlightGain';
    camLayer.cameraOption.highlightThreshold.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.highlightThreshold';
    camLayer.cameraOption.highlightSaturation.expression = 'comp("'+srcCompName+'").layer(name).cameraOption.highlightSaturation';
    
    return camLayer;
}
function createAllCamComp(mainComp,numCam){
    // 获取所有标记点
    //var markers = mainComp.markerProperty;
    //var number = markers.numKeys;
    //if(number==0){return null;}
    //else {number+=1;}
    
    // 获取合成文件夹
    var compFolder = rootFolder("comp");
    
    var width = mainComp.width;
    var height = mainComp.height;
    var pixelAspect = mainComp.pixelAspect;
    var duration = mainComp.duration;
    var frameRate = mainComp.frameRate;
    
    // 创建相机总comp
    var camComp = app.project.items.addComp("AllCamComp", width, height, pixelAspect, duration, frameRate);
    camComp.parentFolder = compFolder;
    
    // 设置所有镜头、阵型、视频位置的合成
    // 创建视频合成
    var videoCenter = app.project.items.addComp("videoCenter", width, height, pixelAspect, duration, frameRate);
    videoCenter.parentFolder = compFolder;
    videoCenter.label = 0;
    // 添加视频蒙版和文字正面
    var videoMatterLayer = videoCenter.layers.addSolid([0,0,0], "videoMatter", width, height, pixelAspect, duration);
    videoCenter.layers.addText( "我是正面");
    //videoMatterLayer.mask.addPro
    
    // 添加视频到合成中
    var videoCenterLayer = camComp.layers.add(videoCenter,duration);
    videoCenterLayer.comment = "type:VideoTemplate";
    videoCenterLayer.threeDLayer = true;
    videoCenterLayer.materialOption.acceptsLights.setValue(0);
    videoCenterLayer.materialOption.acceptsShadows.setValue(0);
    videoCenterLayer.transform.position.setValue([0,height*0.5,0]);
    videoCenterLayer.guideLayer = true;
    videoCenterLayer.property("Transform").property("Anchor Point").expression = "[thisLayer.width/2,thisLayer.height,0]";
    videoCenterLayer.audioEnabled = false;
    
    // 创建阵型合成
    var formation = app.project.items.addComp("formation", width, height, pixelAspect, duration, frameRate);
    formation.parentFolder = compFolder;
    formation.label = 0;
    // 添加阵型到合成中
    var formationLayer = camComp.layers.add(formation,duration);
    formationLayer.threeDLayer = true;
    formationLayer.materialOption.acceptsLights.setValue(0);
    formationLayer.materialOption.acceptsShadows.setValue(0);
    formationLayer.transform.position.setValue([0,height*0.5,0]);
    formationLayer.transform.orientation.expression = "[270,0,0]";
    formationLayer.guideLayer = true;
    formationLayer.audioEnabled = false;
    
    // 添加激光灯
    var laserLayer = camComp.layers.addLight("Laser1Light",[0,0]);
    laserLayer.lightType = LightType.POINT;
    var laser2Layer = camComp.layers.addLight("Laser2Light",[0,0]);
    laser2Layer.lightType = LightType.POINT;

    //添加Cam镜头
    for(var i=1; i<=numCam; i++){
        var camName = (i<10) ? "C0"+i : "C"+i;
        camComp.layers.addCamera(camName, [0,0]);
    }
    
    return camComp;
}
//createAllCamComp(app.project.activeItem)
function createReflectionDisplaceMap(){
    // 定义合成属性
    var width = 1280;
    var height = 720;
    var pixelAspect = 1;
    var frameRate = 25;
    
    // 创建置换Comp
    dispComp = app.project.items.addComp("reflectionDispMap", width, height, 1, 30, frameRate);
    dispComp.parentFolder = rootFolder("comp");
    dispComp.label = 0;

    var grayLayer = dispComp.layers.addSolid([0.5,0.5,0.5],"GrayColor", width, height, pixelAspect, 30);
    var dispLayer = dispComp.layers.addSolid([0,0,0],"DisplaceMap", 1500, 1000, pixelAspect, 30);
    // add noise
    var noise = dispLayer.effect.addProperty("Turbulent Noise");
    noise.property("Fractal Type").setValue(9);
    noise.property("Contrast").setValue(230);
    noise.property("Brightness").setValue(-20);
    noise.property("Overflow").setValue(1);
    noise.property("Uniform Scaling").setValue(0);
    noise.property("Scale Width").setValue(30);
    noise.property("Scale Height").setValue(10);
    noise.property("Offset Turbulence").expression = "[0,time*25]";
    noise.property("Evolution").expression = "time*200";
    // add motion tile
     var tile = dispLayer.effect.addProperty("Motion Tile");
    // set transform
    dispLayer.threeDLayer = true;
    dispLayer.materialOption.acceptsLights.setValue(0);
    dispLayer.materialOption.acceptsShadows.setValue(0);
    dispLayer.property("Transform").property("Anchor Point").expression = '[thisLayer.width/2,(effect("Motion Tile")("Output Height")/100-1)*-500,0]';
    dispLayer.property("Transform").property("Position").expression = 'comp("AllCamComp").layer("videoCenter").transform.position';
    dispLayer.property("Transform").property("Scale").setValue([128,128,128]);
    dispLayer.property("Transform").property("Orientation").expression = "[90,0,0]";
    dispLayer.property("Transform").property("Z Rotation").expression = '180 - comp("AllCamComp").layer("videoCenter").transform.yRotation - comp("AllCamComp").layer("videoCenter").transform.orientation[1]';
    
    // add Ramp Layer
    var rampLayer = dispComp.layers.addSolid([0.5,0.5,0.5],"GrayColorRamp", 1510, 1010, pixelAspect, 30);
    // add linear wipe
    var linear = rampLayer.effect.addProperty("Linear Wipe");
    linear.property("Transition Completion").setValue(50);
    linear.property("Wipe Angle").setValue(0);
    linear.property("Feather").setValue(500);
    // set transform
    rampLayer.threeDLayer = true;
    rampLayer.materialOption.acceptsLights.setValue(0);
    rampLayer.materialOption.acceptsShadows.setValue(0);
    rampLayer.property("Transform").property("Anchor Point").expression = '[thisLayer.width/2,5,0]';
    rampLayer.property("Transform").property("Position").expression = 'comp("AllCamComp").layer("videoCenter").transform.position+[0,-1,0]';
    rampLayer.property("Transform").property("Scale").expression = 'var x = thisComp.layer("DisplaceMap").transform.scale[0] * thisComp.layer("DisplaceMap").effect("Motion Tile")("Output Width")/100;\n' +
                                                                                                    'var y = thisComp.layer("DisplaceMap").transform.scale[1] * thisComp.layer("DisplaceMap").effect("Motion Tile")("Output Height")/100;\n' + 
                                                                                                    '[x,y,100]';
    rampLayer.property("Transform").property("Orientation").expression = "[90,0,0]";
    rampLayer.property("Transform").property("Z Rotation").expression = '180 - comp("AllCamComp").layer("videoCenter").transform.yRotation - comp("AllCamComp").layer("videoCenter").transform.orientation[1]';
    
    return dispComp
}
//createReflectionDisplaceMap()
function updataReflectionDisplaceMap(){
    app.beginUndoGroup("updataReflectionDisplaceMap");
    
    var allCamComp = getCompByName("AllCamComp");
    var reflectionDisplaceMap = getCompByName("reflectionDispMap");
    if(allCamComp==null || reflectionDisplaceMap==null){
        alert("未找到相机合成或者反射置换图合成！");
        return 
    }

    var videoCenter = [];
    for(var i=1;i<=allCamComp.numLayers;i++){
        var layer = allCamComp.layer(i);
        var layerName = layer.name;
        if(layerName.indexOf("videoCenter")>-1){
            var match = layerName.match(/\d/g)
            if(match!=null){
                videoCenter.push(layer);
                //alert(match);
            }
        }
    }
    if(videoCenter.length==0){
        alert("没有找到除了主videoCenter以外的videoCenter2|3|4|5|... ...");
        return 
    }
    for(var i=0;i<videoCenter.length;i++){
        var layer = videoCenter[i];
        var source = layer.source;
        var matterLayer = reflectionDisplaceMap.layers.addSolid([0.5,0.5,0.5], source.name+"Matter", source.width, source.height, source.pixelAspect, source.duration);
        matterLayer.threeDLayer = true;
        matterLayer.materialOption.acceptsLights.setValue(0);
        matterLayer.materialOption.acceptsShadows.setValue(0);
        matterLayer.anchorPoint.expression = '[thisLayer.width/2,thisLayer.height,0]';
        matterLayer.position.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.position';
        matterLayer.scale.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.scale';
        matterLayer.orientation.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.orientation';
        matterLayer.xRotation.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.xRotation';
        matterLayer.yRotation.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.yRotation';
        matterLayer.zRotation.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.zRotation';
        
        var bottomMatterLayer = matterLayer.duplicate();
        bottomMatterLayer.name = source.name+"BottomMatter";
        bottomMatterLayer.anchorPoint.expression = '';
        bottomMatterLayer.position.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.position-[0,5,0]';
        bottomMatterLayer.scale.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.scale*2';
        bottomMatterLayer.orientation.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.orientation';
        bottomMatterLayer.xRotation.expression = '';
        bottomMatterLayer.xRotation.setValue(90);
        bottomMatterLayer.yRotation.expression = '';
        bottomMatterLayer.yRotation.setValue(180);
        bottomMatterLayer.zRotation.expression = 'comp("AllCamComp").layer("' + layer.name + '").transform.yRotation';
        var f = bottomMatterLayer.effect.addProperty("linear Wipe");
        f("Transition Completion").setValue(25);
        f("Wipe Angle").setValue(180);
        f("Feather").setValue(source.height/4);
        var b = bottomMatterLayer.effect.addProperty("linear Wipe");
        b("Transition Completion").setValue(25);
        b("Wipe Angle").setValue(0);
        b("Feather").setValue(source.height/4);
        var l = bottomMatterLayer.effect.addProperty("linear Wipe");
        l("Transition Completion").setValue(12.5);
        l("Wipe Angle").setValue(90);
        l("Feather").setValue(source.width/8);
        var r = bottomMatterLayer.effect.addProperty("linear Wipe");
        r("Transition Completion").setValue(12.5);
        r("Wipe Angle").setValue(-90);
        r("Feather").setValue(source.width/8);
        
    }
    app.endUndoGroup();
}
//updataReflectionDisplaceMap()
function createVideoComp(sceneComp,mode){
    var compName = sceneComp.name;
    var width = sceneComp.width;
    var height = sceneComp.height;
    var frameRate = sceneComp.frameRate;
    var duration = sceneComp.duration;
    var pixelAspect = sceneComp.pixelAspect;
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    // 获取合成和场景的文件夹
    var compFolder = rootFolder("comp");
    var sceneFolder = rootFolder("scene");
    
    // 创建新的video合成
    var videoName = result[1] +  "_Video";
    var videoComp = app.project.items.addComp(videoName, width, height, pixelAspect, duration, frameRate);
    videoComp.parentFolder = compFolder;
    videoComp.label = 14;

    if(mode=="UV"){
        // uv层
        var uvName = result[1] +  "_uv";
        var uv = getSceneByName(uvName);
        if(!uv){uv = app.project.importPlaceholder(uvName, width, height, frameRate, duration);}
        uv.parentFolder = sceneFolder;
        // 添加贴图层
        var textrueLayer = videoComp.layers.add(textrueComp);
        textrueLayer.enabled = false;
        
        // 添加屏倒影层
        var uvLayer2 = videoComp.layers.add(uv);
        
        var matter = uvLayer2.effect.addProperty("ADBE Set Matte3");
        matter.property("ADBE Set Matte3-0003").setValue(1);
        matter.property("ADBE Set Matte3-0005").setValue(0);
        
        var exposure2 = uvLayer2.effect.addProperty("Exposure");
        exposure2.property("Gamma Correction").setValue(0.445);
        
        var extract = uvLayer2.effect.addProperty("Extract");
        extract.property("ADBE Extract-0003").setValue(1);
        
        var mapUV2 = uvLayer2.effect.addProperty("UV Mapper Pete");
        mapUV2.property("Texture").setValue(2);
        
        // 添加屏层
        var uvLayer = videoComp.layers.add(uv);
        
        var exposure = uvLayer.effect.addProperty("Exposure");
        exposure.property("Gamma Correction").setValue(0.445);
        
        var mapUV = uvLayer.effect.addProperty("UV Mapper Pete");
        mapUV.property("Texture").setValue(3);
    }
    else if(mode=="DISP"){
        // 获取或者创建置换Comp
        var dispComp = getCompByName("reflectionDispMap");
        if(dispComp==null){dispComp = createReflectionDisplaceMap();}
        //  添加置换到合成中
        var dispMapLayer = videoComp.layers.add(dispComp,duration);
        dispMapLayer.threeDLayer = true;
        dispMapLayer.materialOption.acceptsLights.setValue(0);
        dispMapLayer.materialOption.acceptsShadows.setValue(0);
        dispMapLayer.collapseTransformation = true;
        dispMapLayer.enabled = false;
        dispMapLayer.label = 0;
        dispMapLayer.audioEnabled = false;
        
        // 添加贴图层，检查AllCamComp中的videoCenter的数量
        var allCamComp = getCompByName("AllCamComp");
        var videoTextrues = [];
        for(var i=1;i<=allCamComp.numLayers;i++){
            var layer = allCamComp.layer(i);
            var layerName = layer.name;
            //alert(layerName)
            if(layerName.indexOf("videoCenter")>-1){
                // 创建贴图合成
                var textrueName = result[1] + layerName.replace("videoCenter","_textrue");
                var textrueComp = getCompByName(textrueName);
                if(textrueComp==null){ 
                    var videoCenter = layer.source;
                    textrueComp = app.project.items.addComp(textrueName, videoCenter.width, videoCenter.height, pixelAspect, duration, frameRate);
                }
                textrueComp.parentFolder = compFolder;
                textrueComp.label = 16;
                
                // 添加贴图层
                var textrueLayer = videoComp.layers.add(textrueComp);
                textrueLayer.threeDLayer = true;
                textrueLayer.materialOption.acceptsLights.setValue(0);
                textrueLayer.materialOption.acceptsShadows.setValue(0);
                textrueLayer.property("Transform").property("Anchor Point").expression = "[thisLayer.width/2,thisLayer.height,0]";
                textrueLayer.property("Transform").property("Position").expression = 'comp("AllCamComp").layer("' + layerName + '").transform.position';
                textrueLayer.property("Transform").property("Scale").expression = 'comp("AllCamComp").layer("' + layerName + '").transform.scale';
                textrueLayer.property("Transform").property("Orientation").expression = 'comp("AllCamComp").layer("' + layerName + '").transform.orientation';
                textrueLayer.property("Transform").property("X Rotation").expression = 'comp("AllCamComp").layer("' + layerName + '").transform.xRotation';
                textrueLayer.property("Transform").property("Y Rotation").expression = 'comp("AllCamComp").layer("' + layerName + '").transform.yRotation';
                textrueLayer.property("Transform").property("Z Rotation").expression = 'comp("AllCamComp").layer("' + layerName + '").transform.zRotation';
                textrueLayer.audioEnabled = false;
                try{
                    var ref = textrueLayer.effect.addProperty("VC Reflect");
                }
                catch(e){
                    alert("缺少特效：VC Reflect ")
                    return null;
                }
            }
        }

        // 添加置换
        var disCC;
        var solids = getSolidByName("waterDispCC");
        if(solids.lenght==0){disCC = videoComp.layers.addSolid([1,1,1], "waterDispCC", width, height, pixelAspect, duration);}
        else{disCC = videoComp.layers.add(solids[0],duration);}
        disCC.adjustmentLayer = true;
        var glass = disCC.effect.addProperty("CC Glass");
        glass.property("Softness").setValue(0.1);
        glass.property("Displacement").setValue(200);
        glass.property("Bump Map").setValue(3);
        
        // 添加Camera
        copyInstanceCamera("AllCamComp", result[1], videoComp);
    }

    return  videoComp;
}
//createVideoComp(app.project.activeItem,"DISP")
function createFountainComp(sceneComp){
    var compName = sceneComp.name;
    var width = sceneComp.width;
    var height = sceneComp.height;
    var frameRate = sceneComp.frameRate;
    var duration = sceneComp.duration;
    var pixelAspect = sceneComp.pixelAspect;
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    // 获取合成文件夹
    var compFolder = rootFolder("comp");
    
    //  查找原始videoComp 是否存在，若没有创建新的video合成
    var fountainName = result[1] +  "_Fountain";
    var fountainComp = getCompByName(fountainName);    
    if(fountainComp != null){return fountainComp;}
    // 新建
    var fountainComp = app.project.items.addComp(fountainName, width, height, pixelAspect, duration, frameRate);
    fountainComp.parentFolder = compFolder;
    fountainComp.label = 8;

    // 添加黑色BG层
    var BG;
    var solids = getSolidByName("BG");
    if(solids.length==0){BG = fountainComp.layers.addSolid([0,0,0], "BG", width, height, pixelAspect, duration);}
    else{ Bg = fountainComp.layers.add(solids[0],duration);}
    // 添加Color效果
    var fountainColor;
    var solids = getSolidByName("fountainColor");
    if(solids.length==0){fountainColor = fountainComp.layers.addSolid([1,1,0], "fountainColor", width, height, pixelAspect, duration);}
    else{fountainColor = fountainComp.layers.add(solids[0],duration);}
    fountainColor.blendingMode = BlendingMode.COLOR;
    var colorEffect = fountainColor.effect.addProperty("4-Color Gradient");
    colorEffect.property("Point 1").setValue([width/2,height/2]);
    colorEffect.property("Point 2").setValue([width,height/2]);
    colorEffect.property("Point 3").setValue([0,height/2]);
    colorEffect.property("Point 4").setValue([width/2,(height/2)*3]);
    colorEffect.property("Color 1").setValue([0,0.7,1,1]);
    colorEffect.property("Color 2").setValue([0,0.4,1,1]);
    colorEffect.property("Color 3").setValue([0,0.4,1,1]);
    colorEffect.property("Color 4").setValue([0,0.4,1,1]);
    colorEffect.property("Blend").setValue(200);

    return  fountainComp;
}
//createFountainComp(app.project.activeItem)
function createLightComp(sceneComp){
    var compName = sceneComp.name;
    var width = sceneComp.width;
    var height = sceneComp.height;
    var frameRate = sceneComp.frameRate;
    var duration = sceneComp.duration;
    var pixelAspect = sceneComp.pixelAspect;
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    // 获取合成和场景的文件夹，没有则创建
    var compFolder = getRootFolderByName("comp");
    if(!compFolder){compFolder = app.project.items.addFolder("comp");}
    
    //  查找原始ligthComp 是否存在，若没有创建新的light合成
    var lightName = result[1] +  "_Light";
    var lightComp = getCompByName(lightName);
    if(lightComp != null){return lightComp;}
    // 新建
    var lightComp = app.project.items.addComp(lightName, width, height, pixelAspect, duration, frameRate);
    lightComp.parentFolder = compFolder;
    lightComp.label = 11;
    
    // 添加camera 
    copyInstanceCamera("AllCamComp", result[1], lightComp);
     
    return  lightComp;
}
//createLightComp(app.project.activeItem)
function createFogComp(sceneComp){
    var compName = sceneComp.name;
    var width = sceneComp.width;
    var height = sceneComp.height;
    var frameRate = sceneComp.frameRate;
    var duration = sceneComp.duration;
    var pixelAspect = sceneComp.pixelAspect;
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    // 获取合成和场景的文件夹，没有则创建
    var compFolder = getRootFolderByName("comp");
    if(!compFolder){compFolder = app.project.items.addFolder("comp");}
    
    //  查找原始ligthComp 是否存在，若没有创建新的fog合成
    var fogName = result[1] +  "_Fog";
    var fogComp = getCompByName(fogName);    
    if(fogComp != null){return fogComp;}
    
    // 新建
    var fogComp = app.project.items.addComp(fogName, width, height, pixelAspect, duration, frameRate);
    fogComp.parentFolder = compFolder;
    fogComp.label = 3;
    
    // 添加camera 
    copyInstanceCamera("AllCamComp", result[1], fogComp);

    return  fogComp;
}
//createFogComp(app.project.activeItem)
function createLaserComp(sceneComp){
    var compName = sceneComp.name;
    var width = sceneComp.width;
    var height = sceneComp.height;
    var frameRate = sceneComp.frameRate;
    var duration = sceneComp.duration;
    var pixelAspect = sceneComp.pixelAspect;
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    // 获取合成和场景的文件夹，没有则创建
    var compFolder = getRootFolderByName("comp");
    if(!compFolder){compFolder = app.project.items.addFolder("comp");}
    
    //  查找原始laserComp 是否存在，若没有创建新的laser合成
    var laserName = result[1] +  "_Laser";
    var laserComp = getCompByName(laserName);    
    if(laserComp != null){return laserComp;}
    
    // 新建
    var laserComp = app.project.items.addComp(laserName, width, height, pixelAspect, duration, frameRate);
    laserComp.parentFolder = compFolder;
    laserComp.label = 5;
    
    // 添加laserLight层
    var allCamComp = getCompByName("AllCamComp");
    var numLayers = allCamComp.numLayers;
    for(var i=1;i<=numLayers;i++){
        var layer = allCamComp.layer(i);
        //alert(layer.name)
        if((layer instanceof LightLayer) && (layer.name.indexOf("Laser")>-1)){ // 激光灯名字 ：Laser1Light
            var laserLayer = laserComp.layers.addLight(layer.name,[0,0]);
            laserLayer.lightType = LightType.POINT;
            laserLayer.transform.position.expression='comp("AllCamComp").layer("'+layer.name+'").transform.position';
            laserLayer.moveToEnd();
        }
    }

    // 添加camera 
    copyInstanceCamera("AllCamComp", result[1], laserComp);
    
    // 添加opLight
    var opLight;
    var solids = getSolidByName("LaserOPLight");
    if(solids.length==0){opLight = laserComp.layers.addSolid([0,0,0], "LaserOPLight", width, height, pixelAspect, duration);}
    else{ opLight = laserComp.layers.add(solids[0],duration);}
    var opEffect = opLight.effect.addProperty("Optical Flares");
    opEffect.property("Brightness").setValue(30);
    opEffect.property("Scale Offset").setValue(true);
    opEffect.property("Source Type").setValue(3);
    opEffect.property("Randomize Lights").setValue(1);
    opEffect.property("Speed").setValue(30);
    opEffect.property("Amount").setValue(15);
    opEffect.property("Random Seed").setValue(50);
    opLight.moveToEnd();
    

//~     // 添加laserVideo
//~     var LSVidoeComp = app.project.items.addComp(result[1]+"_LSVidoe", width, height, pixelAspect, duration, frameRate);
//~     LSVidoeComp.parentFolder = compFolder;
//~     LSVidoeComp.label = 5;
//~     //  添加到LaserComp
//~     var LSVidoeLayer = laserComp.layers.add(LSVidoeComp,duration);
//~     var pointZoomEffect = LSVidoeLayer.addProperty("uni.Point Zoom");
//~     pointZoomEffect.property("Position").
    
    
    return  laserComp;
}
//createLaserComp(app.project.activeItem)
function createFireComp(sceneComp){
    var compName = sceneComp.name;
    var width = sceneComp.width;
    var height = sceneComp.height;
    var frameRate = sceneComp.frameRate;
    var duration = sceneComp.duration;
    var pixelAspect = sceneComp.pixelAspect;
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    // 获取合成和场景的文件夹，没有则创建
    var compFolder = getRootFolderByName("comp");
    if(!compFolder){compFolder = app.project.items.addFolder("comp");}
    
    //  查找原始ligthComp 是否存在，若没有创建新的fire合成
    var fireName = result[1] +  "_Fire";
    var fireComp = getCompByName(fireName);    
    if(fireComp != null){return fireComp;}
    // 新建
    var fireComp = app.project.items.addComp(fireName, width, height, pixelAspect, duration, frameRate);
    fireComp.parentFolder = compFolder;
    fireComp.label = 1;
    
    // 添加camera 
    //copyInstanceCamera("AllCamComp", result[1], fireComp);
    
    // 添加黑色BG层
    var BG;
    var solids = getSolidByName("BG");
    if(solids.length==0){BG = fireComp.layers.addSolid([0,0,0], "BG", width, height, pixelAspect, duration);}
    else{ Bg = fireComp.layers.add(solids[0],duration);}

    return  fireComp;
}
//createFireComp(app.project.activeItem)
function createSceneComp(name, width, height, pixelAspect, duration, frameRate){
    // 正则表达式获取，名称中相机编号。例如：C02_Comp
    var reg = /(C\d{2})_Comp/g;
    var result = reg.exec(name);

    if(!result){
        alert( "没有镜头编号场景名称："+name)
        return null
    } 
    
    // 获取合成和场景的文件夹，没有则创建
    var sceneFolder = getRootFolderByName("scene");
    if(!sceneFolder){sceneFolder = app.project.items.addFolder("scene");}
    var compFolder = getRootFolderByName("comp");
    if(!compFolder){compFolder = app.project.items.addFolder("comp");}
    
    // 创建场景合成
    var sceneComp = app.project.items.addComp(name, width, height, pixelAspect, duration, frameRate);
    sceneComp.parentFolder = compFolder;
    sceneComp.label = 9;
    
    // 添加颜色层，并设置曝光
    var colorName = result[1] +  "_Color";
    var color = getSceneByName(colorName);
    if(!color){color = app.project.importPlaceholder(colorName, width, height, frameRate, duration);}
    color.parentFolder = sceneFolder;
    var colorLayer = sceneComp.layers.add(color);
    var exposure = colorLayer.effect.addProperty("Exposure");
    exposure.property("Exposure").setValue(-6);

//~     // 添加video层
//~     var videoComp = createVideoComp(sceneComp,"DISP");
//~     if(videoComp==null){return null;}
//~     var videoLayer = sceneComp.layers.add(videoComp);
//~     videoLayer.blendingMode = BlendingMode.SCREEN;
//~     videoLayer.audioEnabled = false;
    
    return sceneComp;
}
//createSceneComp
function createCamera(targetComp){
    var compName = targetComp.name;
    
    //  检查镜头编号，检查合成名称是否包含“C02_”
    var reg = /(C\d{2})_/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }

    var camName = result[1]; // C02
    // 检查 cam 是否存在，添加Camera
    var cameraLayer = targetComp.layer(camName);
    if(cameraLayer==null){ cameraLayer = copyInstanceCamera("AllCamComp", camName, targetComp);}
    return cameraLayer;
}
//createCamera(app.project.activeItem)
function createMatter(targetComp){
    var compName = targetComp.name;
    
    // 正则表达式获取，名称中相机编号。例如：C02_Comp
    var reg = /(C\d{2})_/g;
    var result = reg.exec(compName);
    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }
    if(compName.indexOf("_Comp")==-1){
        //  更新elementComp
        // 获取sceneComp的Matter层,如果没有则创建
        var matterName = result[1]+"_Matter";
        if(targetComp.layer(matterName)==null){
            // 添加合成
            var matterComp = getCompByName(matterName);
            if(matterComp==null){
                alert("场景'"+ result[1] +"_Comp'合成中还灭有创建Matter合成！")
                return null;
            }
            var matterLayer = targetComp.layers.add(matterComp);
            matterLayer.moveToBeginning();
            matterLayer.blendingMode = BlendingMode.SILHOUETE_ALPHA;
            matterLayer.audioEnabled = false;
            matterLayer.label =15;
        }
    }
    else{
        //  更新sceneComp
        // 获取sceneComp的Matter层,如果没有则创建
        var matterName = result[1]+"_Matter";
        if(targetComp.layer(matterName)==null){
            
            // 新建蒙版层
            var compName = targetComp.name;
            var width = targetComp.width;
            var height = targetComp.height;
            var frameRate = targetComp.frameRate;
            var duration = targetComp.duration;
            var pixelAspect = targetComp.pixelAspect;
            
                // 获取合成和场景的文件夹
            var compFolder = rootFolder("comp");
            var sceneFolder = rootFolder("scene");
                // 新建
            var matterComp = app.project.items.addComp(matterName, width, height, pixelAspect, duration, frameRate);
            matterComp.parentFolder = compFolder;
            matterComp.label = 15;
                // 添加RGB层，并设置通道
            var RGBName = result[1] +  "_RGB1";
            var RGB = getSceneByName(RGBName);
            if(!RGB){RGB = app.project.importPlaceholder(RGBName, width, height, frameRate, duration);}
            RGB.parentFolder = sceneFolder;
            var RGBLayer = matterComp.layers.add(RGB);
            var matter1 = RGBLayer.effect.addProperty("Set Matte");
            matter1.property("Use For Matte").setValue(3);
            
            // 添加到目标合成中
            var matterLayer = targetComp.layers.add(matterComp);
            matterLayer.moveToEnd();
            matterLayer.enabled = false;
            matterLayer.audioEnabled = false;
            matterLayer.label =0;
        }
    }
    
    app.endUndoGroup();
}
//createMatter(app.project.activeItem)
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//  功能函数
function createSceneCompFromMainCompMarkers(){
    app.beginUndoGroup("创建主合成");
    
    var comp = app.project.activeItem;
    //var layer = comp.layer(1);
    if(comp==null){
        alert("请选择主合成！")
        return false
    }
    // 获取合成的信息 起点、终点、高度、宽度、高宽比、帧率
    var workStart = 0;  //comp.workAreaStart
    var workEnd = comp.duration;
    var width = comp.width;
    var height = comp.height;
    var pixelAspect = comp.pixelAspect;
    var frameRate = comp.frameRate;
    var duration = comp.duration;
    //alert(frameRate)
    
    // 获取主合成上所有标记点
    var marker = comp.markerProperty;
    
    // 获取所有标记点的时间，并将工作区的起点和末点加入进去
    var markerTimes = [workStart]
    for(var i=1; i<=marker.numKeys; i++){
        var keyTime = marker.keyTime(i);
        if(keyTime>workStart && keyTime<workEnd){ markerTimes.push(keyTime);}
    }
    markerTimes.push(workEnd);
    //alert(markerTimes)
    // 计算合成的数量起点和时长
    var numComp = markerTimes.length-1;
    
    if (numComp==0){
        alert("在comp中没有发现Marker！")
        return null
    }

    // 获取项目中的合成文件夹
    var compFolder = rootFolder("comp");

    // 添加镜头合成到场景里
    var camLayer =  comp.layer("AllCamComp");
    if(camLayer==null){
        var allCamComp = createAllCamComp(comp,numComp);
        var camLayer = comp.layers.add(allCamComp);
        camLayer.label = 0;
        camLayer.enabled = false;
        camLayer.shy = true;
        camLayer.moveToEnd();
        camLayer.audioEnabled = false;
        //camLayer.locked = true;
    }
    else{
        var camItem = camLayer.source;
        if(camItem!=duration){
            setDurationOfCompIncludesSubcomp(camItem,comp.duration,2);
            camLayer.outPoint = duration;
        }
    }
    
    comp.hideShyLayers = true;
    
    // 添加场景镜头合成
    for(var i=0; i<numComp; i++){
            // 计算合成的起点和时长
            var compStart = markerTimes[i];
            var duration = markerTimes[i+1] - markerTimes[i];
            
            // 设置叠画的时间和重叠的起点
//~             var overTime = 2;
//~             var overStart = 1;
//~             if(i==0 || i==(numComp-1)){overTime/=2;}
//~             if(i==0){overStart=0;}
//~             duration+=overTime;
//~             compStart-=overStart;

            var overTime = 1;
            var overStart = 0;
            //if(i==0 || i==(numComp-1)){overTime/=2;}
            if(i==0){overStart=0;}
            duration+=overTime;
            if( i==(numComp-1)){duration-=overTime;}
            //compStart-=overStart;
            
            
            
            // 创建合成层，并添加到当前主合成
            var name = "C"+ ((i+1).toString().length==1 ? "0"+(i+1) : (i+1)) +"_Comp";
            //var newComp = app.project.items.addComp(name, width, height, pixelAspect, duration, frameRate);
            var sceneComp = createSceneComp(name, width, height, pixelAspect, duration, frameRate)
            if(sceneComp==null){return null}
            var sceneLayer = comp.layers.add(sceneComp);
            
            // 设置层起点时间
            sceneLayer.startTime = compStart;
            sceneLayer.transform.opacity.setValueAtTime(compStart, 0);
            sceneLayer.transform.opacity.setValueAtTime(compStart+1, 100);
            sceneLayer.audioEnabled = false;
    }
    
    app.endUndoGroup();
}
//createSceneCompFromMainCompMarkers()
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//   添加Element 到场景合成中
function addFountainToComp(){
    app.beginUndoGroup("添加FountainComp");
    
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
     //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        // 获取sceneComp的所有层

        // 添加fountain层，如果所有层里没有
        var fountainName = sceneCam+"_Fountain";
        if(sceneComp.layer(fountainName)==null){ 
            var fountainComp = createFountainComp(sceneComp);
            if(fountainComp==null){
                alert("创建fountainComp失败！")
                return null;
            }
            var fountainLayer = sceneComp.layers.add(fountainComp);
            fountainLayer.blendingMode = BlendingMode.SCREEN;
            fountainLayer.audioEnabled = false;
        }
    }
    app.endUndoGroup();
}
//addFountainToComp()
function addVideoToComp(){
    app.beginUndoGroup("添加VideoComp");
    
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
    //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        //$.write(sceneComp.name)

        // 添加video层，如果Comp里没有
        var videoName = sceneCam+"_Video";
        if(sceneComp.layer(videoName)==null){
            // find video in Project ,if not ,create.
            var videoComp = getCompByName(videoName);
            if(videoComp == null){
                var videoComp = createVideoComp(sceneComp,"DISP");
                if(videoComp==null){
                    alert("创建videoComp失败！")
                    return null;
                }
            }
            var videoLayer = sceneComp.layers.add(videoComp);
            videoLayer.blendingMode = BlendingMode.SCREEN;
            videoLayer.audioEnabled = false;
        }
    }
    app.endUndoGroup();
}
//addVideoToComp()
function addFireToComp(){
    app.beginUndoGroup("添加FireComp");
    
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
        //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        //$.write(sceneComp.name)

        // 添加fire层，如果所有层里没有
        var fireName = sceneCam+"_Fire";
        if(sceneComp.layer(fireName)==null){ 
            var fireComp = createFireComp(sceneComp);
            if(fireComp==null){
                alert("创建fireComp失败！")
                return null;
            }
            var fireLayer = sceneComp.layers.add(fireComp);
            fireLayer.blendingMode = BlendingMode.SCREEN;
            fireLayer.audioEnabled = false;
        }
    }
    app.endUndoGroup();
}
//addFireToComp()
function addLightToComp(){
    // 
    app.beginUndoGroup("添加LightComp");
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
        //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        //$.write(sceneComp.name)

        // 添加light层，如果所有层里没有
        var lightName = sceneCam+"_Light";
        if(sceneComp.layer(lightName)==null){ 
            var lightComp = createLightComp(sceneComp);
            if(lightComp==null){
                alert("创建lightComp失败！")
                return null;
            }
            var lightLayer = sceneComp.layers.add(lightComp);
            lightLayer.blendingMode = BlendingMode.SCREEN;
            lightLayer.audioEnabled = false;
        }
    }
    app.endUndoGroup();
}
//addLightToComp()
function addLaserToComp(){
    app.beginUndoGroup("添加LaserComp");
    
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
        //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        //$.write(sceneComp.name)
        
        // 添加laser层，如果所有层里没有
        var laserName = sceneCam+"_Laser";
        if(sceneComp.layer(laserName)==null){ 
            var laserComp = createLaserComp(sceneComp);
            if(laserComp==null){
                alert("创建laserComp失败！")
                return null;
            }
            var laserLayer = sceneComp.layers.add(laserComp);
            laserLayer.blendingMode = BlendingMode.SCREEN;
            laserLayer.audioEnabled = false;
        }
    }
    app.endUndoGroup();
}
//addLaserToComp()
function addFogToComp(){
    app.beginUndoGroup("添加FogComp");
    
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
        //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        //$.write(sceneComp.name)
        
        // 添加fog层，如果所有层里没有
        var fogName = sceneCam+"_Fog";
        if(sceneComp.layer(fogName)==null){ 
            var fogComp = createFogComp(sceneComp);
            if(fogComp==null){
                alert("创建fogComp失败！")
                return null;
            }
            var fogLayer = sceneComp.layers.add(fogComp);
            fogLayer.blendingMode = BlendingMode.SCREEN;
            fogLayer.audioEnabled = false;
        }
    }
    app.endUndoGroup();
}
 //addFogToComp()
function addMatterToComp(){
    app.beginUndoGroup("添加MatterComp");
    
    var comps = getSelectedComps();
    var num = comps.length;
    if(num==0){
        alert("至少选择一个合成或合成层！")
        return 
    }
    
    for(var i=0;i<num;i++){
        var comp = comps[i];
        createMatter(comp);
    }
    app.endUndoGroup();
}
//addMatterToComp()
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//   Element 合成中部分功能
function getSelectedSceneComps(){  // 先查看激活的合成不是场景合成，然后在循环查看选择的每一个层
    var sceneComps = [];
    
    // 查找选择的sceneComp
    var comp = app.project.activeItem;
    if(comp==null){ return [] }
    // 正则表达式获取，名称中相机编号。例如：C02_Comp
    var reg = /(C\d{2})_Comp/g;
    var result = reg.exec(comp.name);
    
    // 等于null，说明当前激活项不是SceneComp，然后查看选择的层有没有
    if(result==null){
        var selecteLayer = comp.selectedLayers;
        var numLayers = selecteLayer.length;
        if(numLayers==0){ return [] }
        for(var i=0; i<numLayers; i++){
            var layer = selecteLayer[i];
            var source = layer.source;
            if(source instanceof CompItem){
                var compName = source.name;
                // ???
                var reg2 = /(C\d{2})_Comp/g;
                var result2 = reg2.exec(compName);
                
                if(result2==null){continue}
                
                var sceneInfo = new Object;
                sceneInfo.cam = result2[1]
                sceneInfo.comp = source
                sceneComps.push(sceneInfo);
            }
        }
    }
    else{
        var sceneInfo = new Object;
        sceneInfo.cam = result[1]
        sceneInfo.comp = comp
        sceneComps.push(sceneInfo);
    }
    //alert(sceneComps)
    return sceneComps;
}
//alert(getSelectedSceneComps())
function getSelectedElementComps(){
    var elementComps = [];
    
    // 查找选择的elementComp
    var comp = app.project.activeItem;
    if(comp==null){ return [] }
    // 正则表达式获取，名称中相机编号。例如：C02_Vidoe、C04_Light
    var reg = /(C\d{2})_[Video|Light|Fountain|Laser|Fog|Fire]/g;
    var result = reg.exec(comp.name);
    // 等于null说明当前合成项不是ElementComp，然后查看选择的层有没有
    if(result==null){
        var selecteLayer = comp.selectedLayers;
        var numLayers = selecteLayer.length;
        if(numLayers==0){ return [] }
        for(var i=0; i<numLayers; i++){
            var layer = selecteLayer[i];
            var source = layer.source;
            if(source instanceof CompItem){
                var compName = source.name;
                // ???
                var reg2 = /(C\d{2})_[Video|Light|Fountain|Laser|Fog|Fire]/g;
                var result2 = reg2.exec(compName);
                
                if(result2==null){continue}
                
                var elementInfo = new Object;
                elementInfo.cam = result2[1]
                elementInfo.comp = source
                elementComps.push(elementInfo);
            }
        }
    }
    else{
        var elementInfo = new Object;
        elementInfo.cam = result[1]
        elementInfo.comp = comp
        elementComps.push(elementInfo);
    }
    //alert(sceneComps)
    return elementComps;
}
//alert(getSelectedElementComps())
function addBGLayerToComp(dstComp){
    //  添加黑色背景（BG）层，检查合成中右没有BG层，没有创建，有移动到最后。
    var bgLayer = dstComp.layer("BG");
    if(bgLayer==undefined){
        //  对比主合成大小，如果相等则添加，都不相等就创建新的。
        var bgItem;
        var solids = getSolidByName("BG");
        if(solids.length>0){ 
            for(var i=0;i<solids.length;i++){
                var solid = solids[i];
                if(solid.width==dstComp.width && solid.height==dstComp.height){
                    bgLayer = dstComp.layers.add(solids[i],dstComp.duration);
                }
            }
        }
        if(bgLayer==undefined){ bgLayer = dstComp.layers.addSolid([0,0,0], "BG", dstComp.width, dstComp.height, dstComp.pixelAspect, dstComp.duration); }
    }
    bgLayer.moveToEnd();
}
//addBGLayerToComp(app.project.activeItem)
function addBGLayer(){
    app.beginUndoGroup("添加黑色背景（BG）层");
    
    var selComps = getSelectedComps();
    if(selComps.length==0){ 
        alert("没有选择Comp！")
        return 
    }
    
    // 添加黑色背景（BG）层
    var num = selComps.length;
    for(var i=0; i<num; i++){
        var dstComp = selComps[i];
        addBGLayerToComp(dstComp);
    }
    app.endUndoGroup();
}
//addBGLayer()
function addFormationLayer(targetComp){
     app.beginUndoGroup("添加阵型层");
    // 检查目标合成，如果函数不想指定参数，则可以空着不写
    if(targetComp==undefined){ targetComp = app.project.activeItem;}
    
    // 检查Formation是否存在
    var formation = targetComp.layer("formation");
    if(formation==null){
        // copy fromation to comp
        var allCamComp = getCompByName("AllCamComp");
        var srcFormationLayer = allCamComp.layer("formation");
        srcFormationLayer.copyToComp(targetComp);
        formation = targetComp.layer("formation");
    }
    // set pos rot scale
    formation.transform.anchorPoint.expression = 'comp("AllCamComp").layer("formation").transform.anchorPoint';
    formation.transform.position.expression = 'comp("AllCamComp").layer("formation").transform.position';
    formation.transform.scale.expression = 'comp("AllCamComp").layer("formation").transform.scale';
    formation.transform.orientation.expression = 'comp("AllCamComp").layer("formation").transform.orientation';
    formation.transform.xRotation.expression = 'comp("AllCamComp").layer("formation").transform.xRotation';
    formation.transform.yRotation.expression = 'comp("AllCamComp").layer("formation").transform.yRotation'
    formation.transform.zRotation.expression = 'comp("AllCamComp").layer("formation").transform.zRotation'
    
    // move layer to end
    var tarPosLayer = targetComp.layer("reflectionDispMap");
    if(tarPosLayer == null){tarPosLayer = targetComp.layer("BG");}
    if(tarPosLayer == null){formation.moveToEnd();}
    else{formation.moveBefore(tarPosLayer);}
    
    app.endUndoGroup();
}
//addFormationLayer()
function addCameraLayer(){
    app.beginUndoGroup("添加摄像机层");

    var comps= getSelectedComps();
    var num = comps.length;
    if(num==0){
        alert("至少选择一个合成或合成层！")
        return 
    }

    for(var i=0;i<num;i++){
        var comp = comps[i];
        createCamera(comp);
    }
    app.endUndoGroup();
}
//addCameraLayer()
function addTextrueMatter(){
     app.beginUndoGroup("添加videoMatter");
    // 获取选择的VideoComp 
    var textrueItems = new Array();
    var selItems = app.project.selection;
    for(var i=0;i<selItems.length;i++){
        var item = selItems[i];
        if(item.name.indexOf ("textrue")!=-1){ textrueItems.push(item);}
    }
    //alert(textrueItems)
    
    
    // 获取videoMatter
    var allCamComp = getCompByName("AllCamComp");
    var videoLayer = allCamComp.layer("videoCenter");
    var videoComp = videoLayer.source;
    var textrueMatterLayer = videoComp.layer("videoMatter");
    //alert(textrueMatterLayer);
    
    // 从新复制matter到textrue
    for(var i=0;i<textrueItems.length;i++){
        var textrueComp = textrueItems[i];
        var matterLayer = textrueComp.layer("videoMtter");
        if(matterLayer!=null){matterLayer.remove()}
        textrueMatterLayer.copyToComp(textrueComp)
    }
    app.endUndoGroup();
}
//addTextrueMatter()
function copyLayersToFountainComp(){
    app.beginUndoGroup("copyLayersToFountainComp");
    // select item and find camIndex
    var slcItem = app.project.selection;
    if(slcItem.length!=1){
        return 
    }
    var srcItem = slcItem[0];
    
    var reg = /(C\d{2})_Comp/g
    var result = reg.exec(srcItem.name)
    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }
    var camIndex = result[1];
    
    // get fountainComp by camIndex
    var fountainCompName = camIndex + "_Fountain";
    var fountainComp = getCompByName(fountainCompName);
    if(fountainComp==null){
        alert("没有找到："+fountainCompName);
        return
    }
    // get fireComp by camIndex
    var fireCompName = camIndex + "_Fire";
    var fireComp = getCompByName(fireCompName);
    if(fireComp==null){
        alert("没有找到："+fireCompName);
        return
    }
    //alert(fireComp)
    
    // delect layers between colorLayer and BGLayer
    var start = fountainComp.layer("fountainColor").index;
    var stop = fountainComp.layer("BG").index;
    for(var i=stop-1;i>start;i--){
        var layer= fountainComp.layer(i);
        layer.remove();
    }
    var numLayers = fireComp.numLayers;
    for(var i=numLayers;i>0;i--){
        var layer= fireComp.layer(i);
        layer.remove();
    }

    // for-loop items copy to fountainComp and move before BGLayer
    var numLayers = srcItem.numLayers;
    for(var i=1;i<=numLayers;i++){
        var srcLayer= srcItem.layer(i);
        if(srcLayer.name.indexOf ("火")>-1){
            //$.write("复制到火合成\n")
            srcLayer.copyToComp(fireComp);
            var tgtLayer = fireComp.layer(1);
            tgtLayer.moveToEnd();
        }
        else if((srcLayer.name.indexOf ("formation")>-1) || (srcLayer instanceof CameraLayer)){
            srcLayer.copyToComp(fountainComp);
            var tgtLayer = fountainComp.layer(1);
            tgtLayer.moveBefore(fountainComp.layer("BG"))
            
            srcLayer.copyToComp(fireComp);
            tgtLayer = fireComp.layer(1);
            tgtLayer.moveToEnd();
        }
        else{
            srcLayer.copyToComp(fountainComp);
            var tgtLayer = fountainComp.layer(1);
            tgtLayer.moveBefore(fountainComp.layer("BG"))
        }
    }
    app.endUndoGroup();
}
//copyLayersToFountainComp()
function addLaserVideoByLaserLight(){
    app.beginUndoGroup("添加");
    // get laserLight(laser1light) number in Allcamcomp
    var laserComp = app.project.activeItem;
    if(laserComp==null){
        alert("请选择laserComp中的灯光")
        return
    }
    var compName = laserComp.name;
    var width = laserComp.width;
    var height = laserComp.height;
    var frameRate = laserComp.frameRate;
    var duration = laserComp.duration;
    var pixelAspect = laserComp.pixelAspect;
    
    var reg = /(C\d{2})_Laser/g
    var result = reg.exec(compName)

    if(!result){
        alert( "没有镜头编号："+compName)
        return null
    }
    

    // 获取合成和场景的文件夹
    var compFolder = rootFolder("comp");
    
    var sltLayers = laserComp.selectedLayers;
    var num = sltLayers.length;
    for(var i=0; i<num;i++){
        var layer = sltLayers[i];

        if(layer instanceof LightLayer){
            var lightName = layer.name;
            if(lightName.indexOf ("Laser")>-1){
                var reg2 = /Laser(\d)Light/g
                var result2 = reg2.exec(lightName)
                if(!result2){
                    alert( "不正确的激光名称："+lightName)
                    return null
                }
            
                // 新建合成
                var videoCompName = result[1] + "_Laser" + result2[1] + "Video";
                var videoComp = app.project.items.addComp(videoCompName, width, height, pixelAspect, duration, frameRate);
                videoComp.parentFolder = compFolder;
                videoComp.label = laserComp.label;
                var videoLayer = laserComp.layers.add(videoComp,duration);
                videoLayer.blendingMode = BlendingMode.SCREEN;
                videoLayer.moveToEnd();
                
                var blurEffect = videoLayer.effect.addProperty("CC Radial Blur");
                blurEffect.property("Type").setValue(2);
                blurEffect.property("Amount").setValue(30);
                blurEffect.property("Quality").setValue(30);
                blurEffect.property("Center").expression = 'thisComp.layer("'+lightName+'").toComp([0,0,0]);';
                var pointEffect = videoLayer.effect.addProperty("uni.Point Zoom");
                pointEffect.property("Position").expression = 'thisComp.layer("'+lightName+'").toComp([0,0,0]);';
                pointEffect.property("Length").setValue(40);
                pointEffect.property("Intensity").setValue(1.2);
                pointEffect.property("Blend Mode").setValue(1);
                var glowEffect = videoLayer.effect.addProperty("Deep Glow");
                glowEffect.property("Radius").setValue(100);
                glowEffect.property("Exposure").setValue(2);
                glowEffect.property("Threshold").setValue(50);
                glowEffect.property("Threshold Smooth").setValue(50);
                
                
                // 添加Layers
                // 添加阵型
                
                // 添加激光贴图
                var textureCompName = result[1] + "_Laser" + result2[1] + "Texture";
                var textureComp = app.project.items.addComp(textureCompName, 1000, 1000, pixelAspect, duration, frameRate);
                textureComp.parentFolder = compFolder;
                textureComp.label = laserComp.label;
                var textureLayer = videoComp.layers.add(textureComp,duration);
                textureLayer.threeDLayer = true;
                textrueLayer.materialOption.acceptsLights.setValue(0);
                textrueLayer.materialOption.acceptsShadows.setValue(0);
                
                textureLayer.moveToEnd();
                
                // 创建控制面板，添加表达式
                var preset =new File(File($.fileName).path + "/Laser Control.ffx")
                textureLayer.applyPreset(preset);
                
                
                // 添加灯光，先建立灯在建表达式（顺序不对就会报错）
                var lasetLayer = videoComp.layers.addLight(lightName,[0,0]);
                
                
                textureLayer.transform.anchorPoint.expression='[width/2,height,0]';
                textureLayer.transform.position.expression=
                                                                                'var lightP = thisComp.layer("'+lightName+'").transform.position;\n'+
                                                                                'var lightC = thisComp.layer("'+lightName+'").transform.pointOfInterest;\n'+
                                                                                'var lightDir = thisComp.layer("'+lightName+'").toWorldVec(sub(lightC,lightP))\n'+
                                                                                'var vertical = [lightDir[0]+lightP[0],lightP[1],lightDir[2]+lightP[2]];\n'+

                                                                                'var direction = normalize(sub(vertical,lightP));\n'+
                                                                                'var distance = effect("Laser Control")("Distance");\n'+
                                                                                'var local = distance*direction;\n'+

                                                                                'local+lightP;';
                                                                                
                textureLayer.transform.scale.expression=
                                                                            'var distance = effect("Laser Control")("Distance");\n'+
                                                                            'var angle = effect("Laser Control")("View Angle");\n'+
                                                                            'var s = Math.tan(degreesToRadians(angle/2))*distance*2;\n'+
                                                                            '[s/10,s/10,100]';
                                                                            
                textureLayer.transform.yRotation.expression= 'effect("Laser Control")("Direction Rotation")*-1';
                
                textureLayer.materialOption.acceptsShadows.setValue(0);
                textureLayer.materialOption.acceptsLights.setValue(0);
                
                // 添加灯光
                lasetLayer.lightType = LightType.SPOT;
                lasetLayer.transform.pointOfInterest.expression= 'var temp = transform.position;\n'+
                                                                                        '[temp[0],temp[1],temp[2] +300]';
                                                                                        
                lasetLayer.transform.position.expression='comp("'+compName+'").layer("'+layer.name+'").transform.position';
                lasetLayer.transform.orientation.expression= '[0,0,270]';
                lasetLayer.transform.xRotation.expression= 'thisComp.layer("'+textureLayer.name+'").effect("Laser Control")("Direction Rotation")';
                lasetLayer.transform.yRotation.expression= 'lightOption.coneAngle/2';
                lasetLayer.transform.yRotation.setValue(-11);
                lasetLayer.lightOption.coneAngle.expression= 'thisComp.layer("'+textureLayer.name+'").effect("Laser Control")("View Angle")';
                
                // 添加cam
                copyInstanceCamera(compName, result[1], videoComp);
            }   
        }
    }
    
    app.endUndoGroup();
}
//addLaserVideoByLaserLight()

function scatterPointOnMask(){
    app.beginUndoGroup("create point")
    
    // 检查是否选择了Mask
    var layer = app.project.activeItem.selectedLayers[0];
    if(layer == null){ 
        alert("没有选择层")
        return null
    }
    var areaMask = layer.selectedProperties[0];
    if(areaMask == null){ 
        alert("没有选择AreaPointMask")
        return null
    }
    var shape = areaMask.property("maskShape").value;
    var polygonPoints = shape.vertices;
    
    // 检测两个部件，面板和mask是否存在，否则创建
    var effect = layer.effect("Point Mask");
    var pointMask = layer.mask("PointMask");
    
    if(effect==null){
        // 创建特效面板
        var preset =new File(File($.fileName).path + "/PointMask.ffx")
        layer.applyPreset(preset);
    }
    if(pointMask==null){
        areaMask.name = "AreaPoint";
        // 创建mask

        pointMask = layer.mask.addProperty("ADBE Mask Atom");
        pointMask.name = "PointMask";

/*
        pointMask.property("ADBE Mask Shape").expression = """
function boundingBox(polygon_points){
    var x_min = Infinity, x_max = -Infinity,  y_min = Infinity, y_max = -Infinity;
    for(var i=0;i<polygon_points.length;i++){
        var pt=polygon_points[i];
        if(pt[0]<x_min)  x_min=pt[0];
        if(pt[0]>x_max) x_max=pt[0];
              
        if(pt[1]<y_min)  y_min=pt[1];
        if(pt[1]>y_max) y_max=pt[1];
    }
    return [x_min,y_min, x_max,y_max] 
}
function buildGridPoints(xspace,yspace, bound_box,xoffsetPercentage,yoffsetPercentage){
    var width=bound_box[2]-bound_box[0];
    var height=bound_box[3]-bound_box[1];
    var grid_points=[];
    var count = 1;
    
    var xoffset = xspace/2*xoffsetPercentage;
    var yoffset = yspace/2*yoffsetPercentage;
    
    for(var i=xspace;i<width;i+=xspace){
        var row = [];
        var x=bound_box[0]+i-xspace/2;
        var xcount = 1;
        for(var n=yspace;n<height;n+=yspace){
            var y=bound_box[1]+n-yspace/2;  
            if(count%2==0){y+=yoffset}
            else{y-=yoffset}
            if(xcount%2==0){x+=xoffset}
            else{x-=xoffset}    
            row.push([x,y]);
            xcount++;
        }
        if(count%2==0){row.reverse()}
        grid_points.push.apply(grid_points, row);
        count++;
    }
    return grid_points;
}
function pointInsidePolygon(point, polygon_points){
    var x = point[0], y = point[1];
    var inside = false;
    for (var i = 0, j = polygon_points.length - 1; i < polygon_points.length; j = i++) {
        var xi = polygon_points[i][0], yi = polygon_points[i][1];
        var xj = polygon_points[j][0], yj = polygon_points[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    } 
    return inside;
}
function filterPointInsidePolygon(points, polygon_points){
    var temp = [];
    for(var i=0;i<points.length;i++){
        var pt=points[i];
        if(pointInsidePolygon(pt,polygon_points)){ temp.push(pt); }  
    }
    return temp;
}
function rotatePoints(points_array,center,angle){
    var new_point = [];
    angle = Math.PI/180*angle;
    
    for(var i=0;i<points_array.length;i++){
        var point = points_array[i];
        
        var x=(point[0]-center[0])*Math.cos(angle)-(point[1]-center[1])*Math.sin(angle)+center[0];
        var y=(point[1]-center[1])*Math.cos(angle)+(point[0]-center[0])*Math.sin(angle)+center[1];
        
        new_point.push([x,y]);
    }
    return new_point
}
// ------------------------------- //  // ------------------------------- //
function sameSide(point, triA, triB, triC){
    var AB = sub(triB,triA);
    var AC = sub(triC,triA);
    var AD = sub(point,triA);
    var ABxAC = cross(AB,AC);
    var ABxAD = cross(AB,AD);
    return dot(ABxAC,ABxAD)>=0;
}
function testInTriangle(point, triA, triB, triC) {
    return sameSide(point, triA, triB, triC) && sameSide(point, triB, triC, triA) && sameSide(point, triC, triA, triB);
}
function areaOfTriangle(triangle){
    var a= length(triangle[0], triangle[1]);
    var b= length(triangle[0], triangle[2]);
    var c= length(triangle[2], triangle[1]);
    var s = (a+b+c)/2.0;
    return Math.sqrt(s*(s-a)*(s-b)*(s-c));
}
function scatterPointInTriangle(sample_size, triangle_array){
    var x1 = triangle_array[0][0];
    var y1 = triangle_array[0][1];
    var x2 = triangle_array[1][0];
    var y2 = triangle_array[1][1];
    var x3 = triangle_array[2][0];
    var y3 = triangle_array[2][1];

    var points = [];
    for(var i=0;i<sample_size;i++){
        seedRandom(i, true);   
        var rnd1 = random();
        var rnd2 = random();
        rnd2 = Math.sqrt(rnd2);
        var x = rnd2 * (rnd1 * x1 + (1 - rnd1) * x2) + (1 - rnd2) * x3 ;
        var y = rnd2 * (rnd1 * y1 + (1 - rnd1) * y2) + (1 - rnd2) * y3 ;
        points.push([x,y]);
    }
    return points;
}
// ------------------------------- //  // ------------------------------- //
myMask = mask("AreaPoint").path;
var polygonPoints = myMask.points()
polygonPoints = rotatePoints(polygonPoints,[0,0],effect("Point Mask")("Rotation"))
var bbox = boundingBox( polygonPoints);
var gridPoints = buildGridPoints(effect("Point Mask")("X space"),effect("Point Mask")("Y space"), bbox,effect("Point Mask")("X offset"),effect("Point Mask")("Y offset"));
var points = filterPointInsidePolygon(gridPoints, polygonPoints);
points = rotatePoints(points,[0,0],effect("Point Mask")("Rotation")*-1)

myMask.createPath(points,[],[],false);
        """;
*/
    // 二进制代码
    pointMask.property("ADBE Mask Shape").expression = """
eval("@JSXBIN@ES@2.0@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UnAUhVUhVEjiRfREVhNfAViIfBViHfCViKfDffEjiRfREVhNfAViHfCViKfDViIfBffnnEjiRfREVhNfAViKfDViIfBViHfCffnnAEiI4B0AhAiH4C0AhAiK4D0AhAhN40BhAE0AzOjUjFjTjUiJjOiUjSjJjBjOjHjMjFiSAiVMiWbyBn0AFJiXnASzBjBiTAEjPfRCXLfVzIjUjSjJjBjOjHjMjFiUfEXOfViUfEffnftJiYnASzBjCiVBEjPfRCXLfViUfEXTfViUfEffnftJiZnASzBjDiWCEjPfRCXTfViUfEXOfViUfEffnftJianASzBjTiXDCgbChDChDViTfAViVfBnnViWfCnnnndCnftZibnAEXzEjTjRjSjUiYfjhffRBCgaCgaCgaViXfDCSViXfDViTfAnnnnCSViXfDViVfBnnnnCSViXfDViWfCnnnnffAFiX4D0AiAiU40BhAiT40BiAiV4B0AiAiW4C0AiABEAzOjBjSjFjBiPjGiUjSjJjBjOjHjMjFiZAicMidbyBn0AJJienASzCjYhRiaAXLfXLfVzOjUjSjJjBjOjHjMjFifjBjSjSjBjZibfNnftJifnASzCjZhRicBXOfXLfVibfNnftJjAnASzCjYhSidCXLfXOfVibfNnftJjBnASzCjZhSieDXOfXOfVibfNnftJjCnASzCjYhTifEXLfXTfVibfNnftJjDnASzCjZhTjAFXOfXTfVibfNnftJjFnAShaGAnnftajGbjHn0AHJjHnAEjzKjTjFjFjEiSjBjOjEjPjNjBfRCVKfHFctffJjInASzEjSjOjEhRjCIEjzGjSjBjOjEjPjNjDfnfnftJjJnASzEjSjOjEhSjEJEjjDfnfnftJjKnASjEJEXiYfjhffRBVjEfJffnffJjLnAShCKChDCgaVjEfJChDCgaVjCfIViafAnnCgaCSnVjCfIdBnVidfCnnnnnnCgaCSnVjEfJdBnViffEnnnnnftJjMnAShFLChDCgaVjEfJChDCgaVjCfIVicfBnnCgaCSnVjCfIdBnViefDnnnnnnCgaCSnVjEfJdBnVjAfFnnnnnftJjNnAEXhJfVhafGRBARCVhCfKVhFfLfffAVKfHAVzLjTjBjNjQjMjFifjTjJjajFjFfMByBMZjPnAVhafGAOK4H0AiAha4G0AiAhC4K0AiAhF4L0AiAia40BiAic4B0AiAid4C0AiAie4D0AiAjF40BhAib4B0AhAif4E0AiAjA4F0AiAjC4I0AiAjE4J0AiACMAzWjTjDjBjUjUjFjSiQjPjJjOjUiJjOiUjSjJjBjOjHjMjFjGAjQIJjSnABjzGjNjZiNjBjTjLjHfXzEjQjBjUjIjIfEjzEjNjBjTjLjJfRBFeJiBjSjFjBiQjPjJjOjUffnfJjTnASzNjQjPjMjZjHjPjOiQjPjJjOjUjTjKyBEXhafjjHfnfnftJjUnASjKyBEjiEfRDVjKfyBARCFdAFdAfEEjzGjFjGjGjFjDjUjLfRBFeKiQjPjJjOjUhAiNjBjTjLffRBFeIiSjPjUjBjUjJjPjOffffnffJjVnASzEjCjCjPjYjMyBEjQfRBVjKfyBffnftJjWnASzKjHjSjJjEiQjPjJjOjUjTjNyBEjhMfRFEEjjLfRBFeKiQjPjJjOjUhAiNjBjTjLffRBFeHiYhAjTjQjBjDjFffEEjjLfRBFeKiQjPjJjOjUhAiNjBjTjLffRBFeHiZhAjTjQjBjDjFffVjMfyBEEjjLfRBFeKiQjPjJjOjUhAiNjBjTjLffRBFeIiYhAjPjGjGjTjFjUffEEjjLfRBFeKiQjPjJjOjUhAiNjBjTjLffRBFeIiZhAjPjGjGjTjFjUffffnftJjXnAShayBEjhbfRCVjNfyBVjKfyBffnftJjYnAShayBEjiEfRDVhafyBARCFdAFdAfCgaEEjjLfRBFeKiQjPjJjOjUhAiNjBjTjLffRBFeIiSjPjUjBjUjJjPjOffnndyBffnffJjanAEXzKjDjSjFjBjUjFiQjBjUjIjOfjjHfREVhafyBAnAnFcfffAEha4D0AiAjM4B0AiAjN4C0AiAjK40BiAAEAIByB");
""";
    }

    app.endUndoGroup();
}
//scatterPointOnMask()
function deleteExcessLayer(comp,preName,num,postName){ 
    while (true){ 
        var delName = preName + num + postName;
        //alert(delName)
        if (comp.layer(delName) == undefined){break}
        comp.layer(delName).remove();
        num+=1;
    }
}
// 点到多边形的距离
function pointToSegmentDist(p, a, b){
    var x = p[0], y=p[1], x1=a[0], y1=a[1], x2=b[0], y2=b[1];
    
    var  cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
    if (cross <= 0) return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  
    var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (cross >= d2) return Math.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2));
  
    var r = cross / d2;
    var px = x1 + (x2 - x1) * r;
    var py = y1 + (y2 - y1) * r;
    return Math.sqrt((x - px) * (x - px) + (py - y) * (py - y));
}
function pointToPolygonDist(p, polygon) {
  // 统计p点右边交点的个数
  var count = 0
  var minDist = Infinity

  for (var k=0, j=1; k<polygon.length; k++,j++) {
    j = j%polygon.length;
    
    var a = polygon[k];
    var b = polygon[j];
    
    minDist = Math.min(minDist, pointToSegmentDist(p, a, b))
  }
  return minDist
}
function createFog(){
    app.beginUndoGroup("aaaaaaa")
    // 检查是否选择了Mask
    var comp = app.project.activeItem;
    if(comp == null){ 
        alert("没有选择合成")
        return null
    }
    var layer = comp.selectedLayers[0];
    if(layer == null){ 
        alert("没有选择层")
        return null
    }
    var pointMask = layer.selectedProperties[0];
    if(pointMask == null){ 
        alert("没有选择PointMask")
        return null
    }
    var shape = pointMask.property("maskShape").value;
    var polygonPoints = shape.vertices; 
    var maskIndex = pointMask.propertyIndex;
    
    // 检测两个部件，面板和areaMask和烟雾素材是否存在
    var areaMask = layer.mask("AreaPoint");
    var areaPoints;
    if(areaMask!=null){areaPoints = areaMask.property("maskShape").value.vertices;}
    var effect = layer.effect("Fog Effect");
    
    if(effect==null){
        // 创建特效面板，创建mask
        var preset =new File(File($.fileName).path + "/Fog Effect.ffx")
        layer.applyPreset(preset);
    }

    //烟雾素材是否存在
    var fogLayer = comp.layer("fog");
    if(fogLayer == null){
        var fogItem = getFootageByName ("fog");
        if(fogItem==null){
            var theFile = new File (File($.fileName).path + "/fog.mp4")
            var importOptions = new ImportOptions(theFile);
            fogItem = app.project.importFile(importOptions);
            fogItem.name = "fog";
            // 获取合成和场景的文件夹，没有则创建
            var footageFolder = getRootFolderByName("footage");
            if(!footageFolder){footageFolder = app.project.items.addFolder("footage");}
            fogItem.parentFolder = footageFolder;
        }
        fogLayer = comp.layers.add(fogItem,60);
        fogLayer.label = 0;
        fogLayer.enabled = false;
        var formation = comp.layer("formation");
        if(formation!=null){
            fogLayer.moveAfter();
        }

        fogLayer.blendingMode = BlendingMode.SCREEN;
        var dis = fogLayer.effect.addProperty("Slider Control");
        dis.name = "Distance";
        dis.property("Slider").setValue(1000);
        fogLayer.transform.opacity.expression = "\n" + 
'var layer = thisComp.layer("'+layer.name+'");\n' + 
//'linear(effect("Distance")("Slider"), layer.effect("Fog Effect")("Limit Distance Min"), layer.effect("Fog Effect")("Limit Distance Max"), 0, 100);';
// 转为二进制代码
'eval("@JSXBIN@ES@2.0@MyBbyBn0ABJAnAEjzGjMjJjOjFjBjSBfRFEEjzGjFjGjGjFjDjUCfRBFeIiEjJjTjUjBjOjDjFffRBFeGiTjMjJjEjFjSffEEXCfjzFjMjBjZjFjSDfRBFeKiGjPjHhAiFjGjGjFjDjUffRBFeSiMjJjNjJjUhAiEjJjTjUjBjOjDjFhAiNjJjOffEEXCfjDfRBFeKiGjPjHhAiFjGjGjFjDjUffRBFeSiMjJjNjJjUhAiEjJjTjUjBjOjDjFhAiNjBjYffFdAFdjEff0DzAEByB")';
    }
    
    // 删除原有的烟雾
    deleteExcessLayer(comp, fogLayer.name +":[",1, "]")
    // 复制烟雾到场景
    for(var i=0;i<polygonPoints.length;i++){
        var copyName = fogLayer.name +":["+(i+1)+"]";
        var newCopy = comp.layer(copyName);
        if(newCopy == undefined){
            newCopy = fogLayer.duplicate();
            // 设置名称、跟随、位置、3D层、旋转、标记
            newCopy.name = copyName;
            newCopy.enabled = true;
            newCopy.label = (maskIndex-1) % 16 +1;
            newCopy.threeDLayer=true;
            newCopy.materialOption.acceptsLights.setValue(0);
            newCopy.materialOption.acceptsShadows.setValue(0);
            newCopy.position.expression ="\n" + 
"var srcLayer = thisComp.layer(\"" + layer.name + "\"); \r" +
"var srcMask = srcLayer.mask(\"" + pointMask.name + "\")\r" +
"var srcPath = srcMask.maskPath.points()[" + i + "]; \r" +
//"srcLayer.toWorld(srcPath);";
// 转为二进制代码
'eval("@JSXBIN@ES@2.0@MyBbyBn0ABJAnAEXzHjUjPiXjPjSjMjEBfjzIjTjSjDiMjBjZjFjSCfRBjzHjTjSjDiQjBjUjIDfff0DzAEByB")';
                                                    
            newCopy.orientation.expression ="\n" + 
/*
'''
var cam = thisComp.activeCamera;
if(cam.hasParent){ var aim = cam.position + cam.parent.position}else{ var aim =  cam.position;}
lookAt([aim[0],position[1],aim[2]],position);
''';
*/
// 转为二进制代码
'eval("@JSXBIN@ES@2.0@MyBbyBn0ADJAnASzDjDjBjNByBXzMjBjDjUjJjWjFiDjBjNjFjSjBCfjzIjUjIjJjTiDjPjNjQDfnftOBbyBn0ABJBnASzDjBjJjNEyBCzBhLFXzIjQjPjTjJjUjJjPjOGfVBfyBXGfXzGjQjBjSjFjOjUHfVBfyBnnnftAXzJjIjBjTiQjBjSjFjOjUIfVBfyBbyBn0ABJyBnASEyBXGfVBfyBnftJCnAEjzGjMjPjPjLiBjUJfRCARDXzBhQKfVEfyBXzBhRLfjGfXzBhSMfVEfyBfjGfffACE4B0AiAB40BiAACAzANByB");';
                                                    
            newCopy.scale.expression ="\n" + 
"var srcLayer = thisComp.layer(\"" + layer.name + "\"); \r" +
/*
"""
var eff = srcLayer.effect("Fog Effect");
var s = eff("Scale");
var x = eff("X Scale");
var y = eff("Y Scale");
var seed = eff("Random Seed");
var smin = eff("Random Scale Min");
var smax = eff("Random Scale Max");

seedRandom(index+seed+12354, timeless = true);
var rand =  linear(random(), 0, 1, smin, smax);

x = (x*rand)*s;
y = (y*rand)*s;
[x,y,100]
""";
*/
//转为二进制代码
'eval("@JSXBIN@ES@2.0@MyBbyBn0AMJAnASzDjFjGjGByBEXzGjFjGjGjFjDjUCfjzIjTjSjDiMjBjZjFjSDfRBFeKiGjPjHhAiFjGjGjFjDjUffnftJBnASzBjTEyBEVBfyBRBFeFiTjDjBjMjFffnftJCnASzBjYFyBEVBfyBRBFeHiYhAiTjDjBjMjFffnftJDnASzBjZGyBEVBfyBRBFeHiZhAiTjDjBjMjFffnftJEnASzEjTjFjFjEHyBEVBfyBRBFeLiSjBjOjEjPjNhAiTjFjFjEffnftJFnASzEjTjNjJjOIyBEVBfyBRBFeQiSjBjOjEjPjNhAiTjDjBjMjFhAiNjJjOffnftJGnASzEjTjNjBjYJyBEVBfyBRBFeQiSjBjOjEjPjNhAiTjDjBjMjFhAiNjBjYffnftJInAEjzKjTjFjFjEiSjBjOjEjPjNKfRCCzBhLLCLjzFjJjOjEjFjYMfVHfyBnnnnd2iChQBjzIjUjJjNjFjMjFjTjTNfnctfffJJnASzEjSjBjOjEOyBEjzGjMjJjOjFjBjSPfRFEjzGjSjBjOjEjPjNQfnfFdAFdBVIfyBVJfyBffnftJLnASFyBCzBhKRCRVFfyBVOfyBnnVEfyBnnnffJMnASGyBCRCRVGfyBVOfyBnnVEfyBnnnffJNnAARDVFfyBVGfyBFdjEfAIF4C0AiAG4D0AiAE4B0AiAB40BiAH4E0AiAI4F0AiAJ4G0AiAO4H0AiAAIAzASByB")'
        }
        if(areaMask!=null){
            var point = polygonPoints[i];
            var distance = pointToPolygonDist(point, areaPoints) 
            newCopy.effect("Distance")("Slider").setValue(distance);
        }
    }
    //deleteExcessLayer(comp, fogLayer.name +":[",polygonPoints.length+1, "]")
    
    app.endUndoGroup()
}
//createFog()
// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


// -----------------------------------------------------------------------------------------// 未使用的函数
function updateSceneComp(){
    var sceneComps = getSelectedSceneComps();
    if(sceneComps.length==0){ 
        alert("没有选择SceneComp！")
        return 
    }
    
    //  更新sceneComp
    var num = sceneComps.length;
    for(var i=0; i<num; i++){
        var sceneInfo = sceneComps[i];
        var sceneCam = sceneInfo.cam;
        var sceneComp = sceneInfo.comp;
        //$.write(sceneComp.name)
        var numlayers = sceneComp.numLayers;
        var layerNames = new Array;
        for (var o=1;o<=numlayers;o++){layerNames.push(sceneComp.layer(o).name);}
        //alert(layerNames)
        
        // 添加video层
        var videoName = sceneCam+"_Video";
        if(indexOf(layerNames,videoName)==-1){ 
            var videoComp = createVideoComp(sceneComp,"DISP");
            if(videoComp==null){
                alert("创建videoComp失败！")
                return null;
            }
            var videoLayer = sceneComp.layers.add(videoComp);
            videoLayer.blendingMode = BlendingMode.SCREEN;
        }
        // 添加laser层，如果所有层里没有
        var laserName = sceneCam+"_Laser";
        if(indexOf(layerNames,laserName)==-1){ 
            var laserComp = createLaserComp(sceneComp);
            if(laserComp==null){
                alert("创建laserComp失败！")
                return null;
            }
            var laserLayer = sceneComp.layers.add(laserComp);
            laserLayer.blendingMode = BlendingMode.SCREEN;
        }
        // 添加light层
        var lightName = sceneCam+"_Light";
        if(indexOf(layerNames,lightName)==-1){ 
            var lightComp = createLightComp(sceneComp);
            if(lightComp==null){
                alert("创建lightComp失败！")
                return null;
            }
            var lightLayer = sceneComp.layers.add(lightComp);
            lightLayer.blendingMode = BlendingMode.SCREEN;
        }
        // 添加fountain层
        var fountainName = sceneCam+"_Fountain";
        if(indexOf(layerNames,fountainName)==-1){ 
            var fountainComp = createFountainComp(sceneComp);
            if(fountainComp==null){
                alert("创建fountainComp失败！")
                return null;
            }
            var fountainLayer = sceneComp.layers.add(fountainComp);
            fountainLayer.blendingMode = BlendingMode.SCREEN;
        }
        // 添加fire层
        var fireName = sceneCam+"_Fire";
        if(indexOf(layerNames,fireName)==-1){ 
            var fireComp = createFireComp(sceneComp);
            if(fireComp==null){
                alert("创建fireComp失败！")
                return null;
            }
            var fireLayer = sceneComp.layers.add(fireComp);
            fireLayer.blendingMode = BlendingMode.SCREEN;
        }
        // 添加fog层
        var fogName = sceneCam+"_Fog";
        if(indexOf(layerNames,fogName)==-1){ 
            var fogComp = createFogComp(sceneComp);
            if(fogComp==null){
                alert("创建fogComp失败！")
                return null;
            }
            var fogLayer = sceneComp.layers.add(fogComp);
            fogLayer.blendingMode = BlendingMode.SCREEN;
        }
    }
    //alert("OK")
}
//updateSceneComp()





