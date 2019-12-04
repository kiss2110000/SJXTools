/*
        Create Tools  v1.0.0
 
        更新内容：
            1、
            2、
        
        更新时间：2019.05.21 08:40
        ---------------------------------------------------------------------
*/

var dirPath = File($.fileName).path;
$.evalFile(dirPath + "/" + "CommonFunction.jsxbin");

/***** Main Function ****/

function create3DSpace(){
    app.beginUndoGroup("创建3D空间");
    
        var currentComp = getActiveComp();
        if(currentComp!=null){
                var overCreat=0;
                if (app.project.activeItem.layer("formation")==null){
                    var mySolid= currentComp.layers.addSolid([0,0,0],"formation",currentComp.width,currentComp.width,currentComp.pixelAspect,currentComp.duration);
                    mySolid.threeDLayer=true;
                    mySolid.property("Transform").property("Orientation").expression="[90,0,0]";
                    mySolid.property("Transform").property("Position").expression="["+currentComp.width/2+","+currentComp.height/2+",0]";
                    mySolid.property("Transform").property("Scale").expression="[100,100,100]";
                    mySolid.property("Transform").property("X Rotation").expression="0";
                    mySolid.property("Transform").property("Y Rotation").expression="0";
                    mySolid.property("Transform").property("Z Rotation").expression="0";
                    mySolid.effect.addProperty("Grid").property("Color").setValue([0.1,0.1,0.1]);
                    mySolid.effect("Grid")("Color").setValue([30,30,30]);
                    mySolid("Material Options")("Accepts Lights").setValue(false);
                    mySolid("Material Options")("Accepts Shadows").setValue(false);
                    
                }else{ overCreat += 1;}
                // 添加摄像机,addCamera(摄像机名,摄像机中心点位置)
                if (app.project.activeItem.layer("相机_测试角度")==null){
                    var myCam= currentComp.layers.addCamera("相机_测试角度",[currentComp.width,currentComp.height]/2);
                    myCam.property("ADBE Transform Group").property("ADBE Position").setValue([currentComp.width/2,0,-1777.7778]); 
                }else{ overCreat += 3;}
                
                if (overCreat != 0 ){
                    if ( overCreat==4 ){  alert ("已经创建了formation层和相机层");}
                    else if (overCreat==1){ alert ("已经创建了formation层");}
                    else { alert ("已经创建了相机层");}
                }
        }
    app.endUndoGroup();
}    
//create3DSpace()
 function createLightShape(){
    app.beginUndoGroup("创建灯光Shape"); 
    var comp = getActiveComp();
    if(comp.layer("light") == undefined){
        lightShape = comp.layers.addShape();
        lightShape.name = "light";
        c1 = lightShape.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Position").setValue([-50,-50]);
        c2 = lightShape.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Position").setValue([-50,50]);
        c3 = lightShape.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Position").setValue([50,-50]);
        c4 = lightShape.property("Contents").addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Position").setValue([50,50]);
        lightShape.property("Contents").addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue([1,1,1]);
    }
    app.endUndoGroup();
}
//createLightShape()
function addLightProxyToComp(comp){
    // 检查合成中是否存在
    var lightLayer = comp.layer("LightProxy");
    if(lightLayer != null){ return lightLayer}
    
    // 检查项目中是否存在,不存在则导入
    var lightItem = getCompByName("LightProxy");
    if(lightItem==null){
        var lightFootageItem = getFootageByName("LightProxy");
        if(lightFootageItem==null){
            var theFile = new File (File($.fileName).path + "/LightProxy.png")
            var importOptions = new ImportOptions(theFile);
            var lightFootageItem = app.project.importFile(importOptions);
            lightFootageItem.name = "LightProxy";
            lightFootageItem.parentFolder = rootFolder("footage");
        }
        lightItem = app.project.items.addComp("LightProxy",50,50,1,30,25);
        var lightLayer = lightItem.layers.add(lightFootageItem,30);
        lightLayer("Transform")("Anchor Point").setValue([25,951]);
        lightLayer.threeDLayer=true;
        lightLayer("Transform")("X Rotation").setValue(-90);
        lightLayer("Material Options")("Accepts Lights").setValue(false);
        lightLayer("Material Options")("Accepts Shadows").setValue(false);
        lightItem.parentFolder = rootFolder("comp");
    }
    
    // 添加到合成中
    var lightProxy = comp.layers.add(lightItem,30);
    lightProxy.collapseTransformation = true;
    lightProxy.threeDLayer = true;
    lightProxy("Transform")("Orientation").setValue([0,0,270])
    lightProxy.blendingMode = BlendingMode.SCREEN;
    var fill = lightProxy.effect.addProperty("Fill");
    fill("Color").setValue([1,1,1,1]);
    
    return lightProxy;
}
//addLightProxyToComp(app.project.activeItem)
function addSpotLightToComp(comp){
    // 检查合成中是否存在
    var lightLayer = comp.layer("LightProxy");
    if(lightLayer != null){ return lightLayer}
    
    // 检查项目中是否存在,不存在则导入
    var lightItem = getCompByName("LightProxy");
    if(lightItem==null){
        var lightFootageItem = getFootageByName("SportLight");
        if(lightFootageItem==null){
            var theFile = new File (File($.fileName).path + "/SportLight.png")
            var importOptions = new ImportOptions(theFile);
            var lightFootageItem = app.project.importFile(importOptions);
            lightFootageItem.name = "SportLight";
            lightFootageItem.parentFolder = rootFolder("footage");
        }
        lightItem = app.project.items.addComp("LightProxy",50,50,1,30,25);
        var lightLayer = lightItem.layers.add(lightFootageItem,30);
        lightLayer("Transform")("Anchor Point").setValue([25,1000]);
        lightLayer.threeDLayer=true;
        lightLayer("Transform")("X Rotation").setValue(-90);
        lightLayer("Material Options")("Accepts Lights").setValue(false);
        lightLayer("Material Options")("Accepts Shadows").setValue(false);
        lightItem.parentFolder = rootFolder("comp");
    }
    
    // 添加到合成中，设置为灯光的数值
    var lightProxy = comp.layers.add(lightItem,30);
    lightProxy.collapseTransformation = true;
    lightProxy.threeDLayer = true;
    lightProxy("Transform")("Orientation").setValue([0,0,270])
    //lightProxy.blendingMode = BlendingMode.SCREEN;
    var fill = lightProxy.effect.addProperty("Fill");
    fill("Color").setValue([1,1,1,1]);
    
    return lightProxy;
}
//addSpotLightToComp(app.project.activeItem)
function CreateSportLight(){
    app.beginUndoGroup("创建摇头灯"); 
    var comp = getActiveComp();
    if(!comp) return
    
    // 创建光效层
    var solid = comp.layers.addSolid([0,0,0],"Light Effect",comp.width,comp.height,comp.pixelAspect,comp.duration);
    try{
        var lux = solid.effect.addProperty("Lux");
        lux.name = "Light"
        lux.property("Reach").setValue(500);
        lux.property("tc Lux-0015").setValue(500);
        lux.property("tc Lux-0023").setValue(2);
    }catch(err){}
    // 创建聚光灯
    var light = comp.layers.addLight("摇头灯", [0,0]);
    light.transform.position.setValue([comp.width*0.5,comp.height*0.5,0]);
    light.transform.pointOfInterest.expression = "[transform.position[0],transform.position[1],transform.position[2]+5000]";
    light.lightOption.coneAngle.setValue(5);
    light.lightOption.coneFeather.setValue(0);
    light.transform.orientation.setValue([0,0,270]);
    // 创建代理灯光
    //addLightProxyToComp(comp);
    addSpotLightToComp(comp);
    app.endUndoGroup();
}
//CreateSportLight()
function copyKeysToProperty(srcProp,tgtProp){
    var numKeys =srcProp.numKeys;
    if( numKeys != 0){
        for(var o=1; o<=numKeys; o++){

            var inInterp = srcProp.keyInInterpolationType(o);
            var outInterp = srcProp.keyOutInterpolationType(o);
            var time = srcProp.keyTime(o);
            var value = srcProp.keyValue(o);
            
             if ((inInterp === KeyframeInterpolationType.BEZIER) && (outInterp === KeyframeInterpolationType.BEZIER))
            {
                var tempAutoBezier = srcProp.keyTemporalAutoBezier(o);
                var tempContBezier = srcProp.keyTemporalContinuous(o);
            }
            if (outInterp !== KeyframeInterpolationType.HOLD)
            {
                var inTempEase = srcProp.keyInTemporalEase(o);
                var outTempEase = srcProp.keyOutTemporalEase(o);
            }
            if ((srcProp.propertyValueType === PropertyValueType.TwoD_SPATIAL) || (srcProp.propertyValueType === PropertyValueType.ThreeD_SPATIAL))
            {
                var spatAutoBezier = srcProp.keySpatialAutoBezier(o);
                var spatContBezier = srcProp.keySpatialContinuous(o);
                var inSpatTangent = srcProp.keyInSpatialTangent(o);
                var outSpatTangent = srcProp.keyOutSpatialTangent(o);
                var roving = srcProp.keyRoving(o);
            }
        
            // set key
            var newKeyIndex = tgtProp.addKey(time);
            tgtProp.setValueAtKey(newKeyIndex, value);
            
            if (outInterp !== KeyframeInterpolationType.HOLD)
            {
                tgtProp.setTemporalEaseAtKey(newKeyIndex, inTempEase, outTempEase);
            }

            // Copy over the keyframe settings
            tgtProp.setInterpolationTypeAtKey(newKeyIndex, inInterp, outInterp);
            
            if ((inInterp === KeyframeInterpolationType.BEZIER) && (outInterp === KeyframeInterpolationType.BEZIER) && tempContBezier)
            {
                tgtProp.setTemporalContinuousAtKey(newKeyIndex, tempContBezier);
                tgtProp.setTemporalAutoBezierAtKey(newKeyIndex, tempAutoBezier);		// Implies Continuous, so do after it
            }

            if ((tgtProp.propertyValueType === PropertyValueType.TwoD_SPATIAL) || (tgtProp.propertyValueType === PropertyValueType.ThreeD_SPATIAL))
            {
                tgtProp.setSpatialContinuousAtKey(newKeyIndex, spatContBezier);
                tgtProp.setSpatialAutoBezierAtKey(newKeyIndex, spatAutoBezier);		// Implies Continuous, so do after it
                tgtProp.setSpatialTangentsAtKey(newKeyIndex, inSpatTangent, outSpatTangent);
                tgtProp.setRovingAtKey(newKeyIndex, roving);
            }
        }
    }
}
function deleteAllKeys(prop){
    var numKeys =prop.numKeys;
    if( numKeys != 0){
        for(var o=1; o<=numKeys; o++){
            prop.removeKey(o);
        }
    }
}

function convertLigthProxy(){
    app.beginUndoGroup("convertLigthProxy")
    var comp = app.project.activeItem;
    var selLayer = comp.selectedLayers;
    var numSel = selLayer.length;
    
    if(numSel ==0) return
    
    var firstSel = selLayer[0];
    var LtoP = firstSel instanceof LightLayer;
    
    var convertLayers = new Array();
    for(var i=0;i<numSel;i++){
        var layer = selLayer[i];
        if (LtoP){
            if(layer instanceof LightLayer){convertLayers.push(layer); }
            else{
                alert("select this not is Light! :: "+layer.name);
                return
            }
        }else{
            if(layer instanceof AVLayer){convertLayers.push(layer); }
            else{
                alert("select this not is Proxy! :: "+layer.name);
                return
            }
        }
    }
    
    // find proxy layer
    var proxy;
    if (LtoP){ 
        proxy= comp.layer("LightProxy");
        if(proxy==null){
            alert('not find "LightProxy" layer!')
            return
        }
    }else{
        proxy= comp.layer("摇头灯");
        if(proxy==null){
            alert('not find "摇头灯" layer!')
            return
        }
    }

    for(var i=0;i<convertLayers.length;i++){
        var layer = convertLayers[i];
        var newProxy = proxy.duplicate();
        newProxy.moveBefore(layer);
        
        // set name color intensity pos rot orient
        newProxy.name = layer.name;
        newProxy.label = layer.label;
        newProxy.enabled = layer.enabled;
        
        newProxy.startTime = layer.startTime;
        
        var srcProps = new Array();
        var dstProps = new Array();
        
        //1
        if (LtoP){
            srcProps.push(layer.lightOption.color);
            dstProps.push(newProxy.effect("Fill")("Color"));
        }else{
            srcProps.push(layer.effect("Fill")("Color"));
            dstProps.push(newProxy.lightOption.color);
        }
        //2
        if (LtoP){
            srcProps.push(layer.lightOption.intensity);
            dstProps.push(newProxy.transform.opacity);
        }else{
            srcProps.push(layer.transform.opacity);
            dstProps.push(newProxy.lightOption.intensity);
        }
        //3
        srcProps.push(layer.transform.position);
        dstProps.push(newProxy.transform.position);
        //4
        srcProps.push(layer.transform.orientation);
        dstProps.push(newProxy.transform.orientation);
        //5
        srcProps.push(layer.transform.xRotation);
        dstProps.push(newProxy.transform.xRotation);
        //6
        srcProps.push(layer.transform.yRotation);
        dstProps.push(newProxy.transform.yRotation);
        //7
        srcProps.push( layer.transform.zRotation);
        dstProps.push(newProxy.transform.zRotation);
        
        for(var o=0;o<7;o++){
            var srcProp = srcProps[o];
            var dstProp = dstProps[o];
            
            dstProp.setValue(srcProp.value);
            
            deleteAllKeys(dstProp);
            copyKeysToProperty(srcProp,dstProp)
            
            var Exp = srcProp.expression;
            if( Exp){  dstProp.expression = Exp;}
        }
        layer.remove()
    }
    
    // turn on/off LightEffect layer
    if (LtoP){
        comp.layer("Light Effect").enabled = false;
        //comp.layer("").enable = false;
    }else{
        comp.layer("Light Effect").enabled = true;
        //comp.layer("").enable = true;
    }
    
    app.endUndoGroup()
}
//convertLigthToProxy()
function setLightDiraction(){
    app.beginUndoGroup("setLightDiraction");
    
    var ctrl = ScriptUI.environment.keyboardState.ctrlKey;
    var lsLayers = app.project.activeItem.selectedLayers;

    var errorLayers = [];
    for(var i=0; i<lsLayers.length; i++){
        var layer = lsLayers[i];
        var expstr = layer.transform.position.expression;
        //alert(expstr)
        
        var layerpatt = /thisComp.layer\("(.+?)"\);/
        var layerresult = layerpatt.exec(expstr);
       // alert(layerresult)
        var maskpatt = /mask\("(.+?)"\).maskPath/
        var maskresult = maskpatt.exec(expstr);
       // alert(maskresult)
        var effectpatt = /effect\("(.+?)"\)/
        var effectresult = effectpatt.exec(expstr);
        //alert(effectresult)
        var numpatt = /pointOnPath\( (\d+) /
        var numresult = numpatt.exec(expstr);
        //alert(numresult)
        
        // 检查层的名称和mask的名称和数字编号
        if(layerresult==null || maskresult==null || numresult==null || effectresult==null) {
            errorLayers.push(layer.name);
            continue
        }
        var layername = layerresult[1];
        var maskname = maskresult[1];
        var effectname = effectresult[1]
        var num = numresult[1];
        

        var srcValue = layer.transform.orientation.value;
        //alert(layer.name)
        if(ctrl) {
            //alert(srcValue)
            srcValue[1] = srcValue[1] + 90;
            var newValue =srcValue;
        }
        else{
            layer.transform.orientation.expression = '''
            function limt(value,min,max){
                var temp = Math.max(min, value);
                temp = Math.min(temp, max)
                return temp
            }
            //imt(src,0.1,0.9)
            var srcLayer = thisComp.layer("''' + layername + '''");
            var srcNormal = srcLayer.mask("''' + maskname + '''").maskPath.normalOnPath( limt(''' + num +'''/ (srcLayer.effect("''' + effectname + '''")("Slider")-(1-srcLayer.mask("''' + maskname + '''").maskPath.isClosed())),0.01,0.99)); 
            var dir = [0,-1,0];
            var cross = cross(dir,srcNormal);
            var deg = radiansToDegrees(Math.acos(dot(dir,srcNormal)));
            if(cross[2]<0){ deg = 360-deg;}
            deg += thisComp.layer("''' + layername + '''").transform.zRotation + thisComp.layer("''' + layername + '''").transform.orientation[1];
            [0,deg,270]
            '''
            var newValue = layer.transform.orientation.value;
            // 清除表达式
            layer.transform.orientation.expression = ""
        }
        layer.transform.orientation.setValue(newValue);
    }
    if(errorLayers.lengh>0){alert(errorLayers)}
    
    app.endUndoGroup();
}
//setLightDiraction()




