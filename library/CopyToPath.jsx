/*
        Copy Tools  v1.0.0
 
        更新内容：
            1、
            2、
        
        更新时间：2019.05.17 07:38
        ---------------------------------------------------------------------
*/

var dirPath = File($.fileName).path;
$.evalFile(dirPath + "/" + "CommonFunction.jsxbin");

/***** Main Function ****/
//删除多余的层
function deleteExtraLayers(comp,preName,num,postName){ 
    while (true){ 
        var delName = preName + num + postName;
        //alert(delName)
        if (comp.layer(delName) == undefined){break}
        comp.layer(delName).remove();
        num+=1;
    }
}
// 获取选择层的mask属性
function getSelectedMasks(targetLayer){
    var props = targetLayer.selectedProperties;
    if (props.length < 1){ return null }

    var selectedPaths = [];
    for(var o=0; o<props.length; o++){
        var prop = props[o];
        if(prop.matchName == "ADBE Mask Atom"){selectedPaths.push(prop);}
    }//end for
    return selectedPaths;
}
// 复制层到路径上，是否基于点。
function copyToPath(point){
    app.beginUndoGroup("复制到关键帧");
    
    var curComp = getActiveComp();
    if(curComp==null) { 
            alert("请选择一个层和另一个层上的paths！");
            return 
    }

    var selectedLayers = getSelectedLayers(curComp);
    if (selectedLayers.length != 2){ 
            alert("请选择一个层和另一个层上的paths！");
            return 
    }

    // 首先，找到mask层和素材层，并存储先择的mask
    var selectedPaths = [];
    var maskLayer;
    var footageLayer;
    for(var i=0; i<2;i++){
        var layer = selectedLayers[i];
        var paths = getSelectedMasks(layer);
        if (paths == null){ 
            footageLayer = layer;
            footageLayer.label = 0;
            footageLayer.enabled = false;
        }
        else{
            selectedPaths = paths;
            maskLayer = layer;
        }//end else
    }//end for
    if (selectedPaths.length==0){
            alert("没有选择路径！");
            return
    }
    
    // 表达式关联的阵形层
    // 方法1：直接通过“formation”名字获取。弊端；只能使用一个固定名字
    // 方法2：使用层控件，会自动预合成。弊端：复制剪切时，层控件会丢失阵型
    // 方法3：给comment添加阵型名称，然后再获取名称。
	// 为素材层添加mask层控件
	//var control = footageLayer.effect.addProperty("ADBE Layer Control");
	//control.property("Layer").setValue(maskLayer.index);
	//control.name = "Formation Layer";

	// 循环复制素材
    for (var i=0; i<selectedPaths.length; i++){
        var path = selectedPaths[i];
        var maskIndex = path.propertyIndex;
        var pathPath = getPropPath(path);
        
        // 记录前一层和该层的起点
        var preLayer = null;
        if(point){
        // 复制到路径点上
            var pathPoints = path.maskPath.value.vertices;
            //alert(pathPoints)
            for(var o=0; o<pathPoints.length; o++){
                var copyName = footageLayer.name +":"+path.name+":["+(o+1)+"]";
                
                //注意：新版本更名为：阵型层名+路径名+编号
                if(curComp.layer(copyName) == undefined){
                    copyName = maskLayer.name +":"+path.name+":["+(o+1)+"]";
                }else{
                    var tempName = maskLayer.name +":"+path.name+":["+(o+1)+"]";
                    curComp.layer(copyName).name = tempName;
                    copyName = tempName;
                }
            	
            	// 如果该层不存在，则创建新层，如果，存在记录层索引和起点时间
                if(curComp.layer(copyName) == undefined){
                    //alert(copyName)
                    var newCopy = footageLayer.duplicate();
                    
                    // 设置新层到前一层下面位置和对齐前一层的入画时间
                    if(preLayer!=null){ 
                        newCopy.moveAfter(preLayer);
                        newCopy.startTime = preLayer.startTime;
                    }
                    // 将新层设置为前一层
                    preLayer = newCopy;
                    
                    // 设置名称、跟随、位置、3D层、旋转、标记
                    newCopy.name = copyName;
                    newCopy.enabled = true;
                    newCopy.label = (maskIndex-1) % 16 +1;
                    addCommentProps(newCopy,{"formationName":maskLayer.name});
                    newCopy.position.expression =
                            "var srcLayer = thisComp.layer(\"" + maskLayer.name + "\"); \r" +
                            '//var srcLayer = effect("Formation Layer")("Layer"); \r' +
                            "var srcPath = srcLayer.mask(\"" + path.name + "\").maskPath.points()[" + o + "]; \r" +
                            'srcLayer.toWorld(srcPath);';
                    if(footageLayer instanceof AVLayer && footageLayer.name!="LightProxy"){
                        var flow = newCopy .effect.addProperty("Checkbox Control");
                        flow.name = "Flow"
                        newCopy.threeDLayer=true;
                        newCopy.blendingMode = BlendingMode.SCREEN;
                        newCopy.orientation.expression =
                                "if(!effect(\"Flow\")(\"Checkbox\").value){\r" +
                                "   var cam = thisComp.activeCamera;\r" + 
                                "   if(cam.hasParent){ var aim = cam.position + cam.parent.position}else{ var aim =  cam.position;}\r" + 
                                "   lookAt([aim[0],position[1],aim[2]],position);\r" +
                                "}else{[90,0,0]};";
                    }
                }
                else{ // 层已经存在
                    // 将已存在的层设置为前一层
                    preLayer = curComp.layer(copyName);
                }
           }// end for
            //当mask的点变少时，删除多余的层
            //deleteExtraLayers(curComp, footageLayer.name +":"+path.name+":[", pathPoints.length+1, "]")
            //注意：新版本更名为：阵型层名+路径名+编号
            deleteExtraLayers(curComp, maskLayer.name +":"+path.name+":[", pathPoints.length+1, "]")
        }//end if
        else{
        // 复制到路径线上
                var existingEffects=null;
                var num=null;
                for (var o=1; o<=maskLayer.property("ADBE Effect Parade").numProperties; o++){
                    var targetEffect = maskLayer.property("ADBE Effect Parade").property(o);
                    if(targetEffect.name==("num " + path.name)){
                        existingEffects=targetEffect;
                        num = existingEffects.property("ADBE Slider Control-0001").value;
                    }//end if
                }//end for
                if(existingEffects==null){ 
                    existingEffects = maskLayer.effect.addProperty("Slider Control");
                    existingEffects.name = ("num " + path.name);
                    existingEffects.property("ADBE Slider Control-0001").setValue(10);
                    existingEffects.property("ADBE Slider Control-0001").expression=
                        "if (value<1){1;}else{value;}" ;
                    var num = 10;
                }//end if
                
                // 如果是闭合曲线，最后一个点应该不复制，但数量必须一致
                var count = 1;
                //alert(path)
                if(path.maskShape.value.closed){count=0;}
                
                for (var o=0; o<num; o++){
                    // 获取新层的名称，并判定是否已存在，没有就创建，有则记录层位置和动画起点时间
                    var copyName = footageLayer.name +":"+path.name+":["+(o+1)+"]";
                    
                    //注意：新版本更名为：阵型层名+路径名+编号
                    if(curComp.layer(copyName) == undefined){
                        copyName = maskLayer.name +":"+path.name+":["+(o+1)+"]";
                    }else{
                        var tempName = maskLayer.name +":"+path.name+":["+(o+1)+"]";
                        curComp.layer(copyName).name = tempName;
                        copyName = tempName;
                    }
                    
                    // 如果该层不存在，则创建新层，如果，存在记录层索引和起点时间
                    if(curComp.layer(copyName) == undefined){
                        //alert(copyName)
                        var newCopy = footageLayer.duplicate();
                        
                        // 设置新层到前一层下面位置和对齐前一层的入画时间
                        if(preLayer!=null){ 
                            newCopy.moveAfter(preLayer);
                            newCopy.startTime = preLayer.startTime;
                        }
                        // 将新层设置为前一层
                        preLayer = newCopy;
                        
                        // 设置名称、跟随、位置、3D层、旋转、标记
                        newCopy.name = copyName;
                        newCopy.enabled = true;
                        newCopy.label = (maskIndex-1) % 16 +1;
                        newCopy.blendingMode = BlendingMode.SCREEN;
                        addCommentProps(newCopy,{"formationName":maskLayer.name});
                        newCopy.position.expression = 
                                "var srcLayer = thisComp.layer(\"" + maskLayer.name + "\"); \r" +
                                '//var srcLayer = effect("Formation Layer")("Layer"); \r' +
                                "var srcPath = srcLayer.mask(\"" + path.name + "\").maskPath.pointOnPath( " + o +" / (srcLayer.effect(\""+ existingEffects.name +"\")(\"Slider\")-(1-srcLayer.mask(\"" + path.name + "\").maskPath.isClosed()))); \r" +
                                "srcLayer.toWorld(srcPath);";
                        if(footageLayer instanceof AVLayer && footageLayer.name!="LightProxy"){
                            var flow = newCopy .effect.addProperty("Checkbox Control");
                            flow.name = "Flow"
                            newCopy.threeDLayer=true;
                            newCopy.orientation.expression =
                                    "if(!effect(\"Flow\")(\"Checkbox\").value){\r" +
                                    "   try{delta = toWorld(anchorPoint) - thisComp.activeCamera.toWorld([0,0,0]);\r" + 
                                    "       [0,radiansToDegrees(Math.atan2(delta[0],delta[2])),0]}catch(err){[0,0,0];}\r" + 
                                    "}else{[90,0,0]};";
                        }//end if
                    }//end if
                    else{  // 层已经存在
                        // 将已存在的层设置为前一层
                        preLayer = curComp.layer(copyName);
                    }
                }//end for
                //当mask的点变少时，删除多余的层
                //deleteExtraLayers(curComp, footageLayer.name +":"+path.name+":[", num+1, "]")
                //注意：新版本更名为：阵型层名+路径名+编号
                deleteExtraLayers(curComp, maskLayer.name +":"+path.name+":[", num+1, "]")
        }//end else
    }//end for

    // 删除素材层的mask层控件
    //control.remove()

    app.endUndoGroup();
}
//copyToPath(false)
//copyToPath(true)
// 将层放到，躺下。
function flow(){
    app.beginUndoGroup("跟随路径");
    var selcetLayers = getSelectedLayers(getActiveComp());
    var setFlow = selcetLayers[0].property("Effects").property("Flow").property("Checkbox").value

    for(var i=0; i<selcetLayers.length;i++){
        var layer = selcetLayers[i];
        if (setFlow){ layer.property("Effects").property("Flow").property("Checkbox").setValue(0);}
        else{ layer.property("Effects").property("Flow").property("Checkbox").setValue(1);}
    }
    app.endUndoGroup();
}
//flow()

//var str = "var srcLayer = thisComp.layer(\"Control\");";
function matchLayerNameFormExpression(text){
    var reg = /.layer\("(.+?)"\);/g
    var res = reg.exec(text)
    if(res){return res[1]} 
    return null
}
function arrayAddUnique(targetArray,elemt){
    for(var i=0; i<targetArray; i++){
        if(targetArray[i]==elemt){return}
    }
    targetArray.push(elemt);
}
function arrayIndexOf(array,value){
    for(var i=0;i<array.length;i++){
        if(array[i]==value){return i}
    }
    return -1
}
// 添加相机到预合成
function addCameraToPercomp(cameraLayer,precompLayer){
    var precompStartTime = precompLayer.startTime;
    var cameraStartTime = cameraLayer.startTime;
    //alert(targetPrecompLayer.name)
    var scrPrecomp = precompLayer.source;
    cameraLayer.copyToComp(scrPrecomp);
    var precamera = scrPrecomp.layer(1);
    precamera.startTime = cameraStartTime-precompStartTime;
    return precamera
}
// 预合成喷泉
function precompGroup(precompName,layers,curComp){
    var parentComp = curComp;
    var preLayers = [];
    var precompIndices = []; // 所有要预合成层的index值
    var formations = [];
    var Inpoint = 999999999999999999;
    var Outpoint = 0;
    
/*    // 删除控件：剪切层会导致控件层丢失！！// 由于添加了层控件，与合成的时候，会自动将阵型添加到合成中。所以，不再需要复制阵型！
    // 复制要预合成阵型
    var formation = curComp.layer("formation");
    var copy =  formation.duplicate();
    precompIndices.push(formation.index);*/

    // 获取选择层的index 和 阵型
    for (var i=0;i<layers.length; i++){  
        var layer = layers[i];
        //precompIndices.push(layer.index);            // new array with layers indexes  
        preLayers.push(layer);

        (layer.inPoint  < Inpoint ) ? Inpoint  = layer.inPoint  : Inpoint;        // begin of precomp  
        (layer.outPoint > Outpoint) ? Outpoint = layer.outPoint : Outpoint;       // end of precomp  
        
        // 获取表达式关联的阵形层
        // 方法1：直接通过“formation”名字获取。弊端；只能使用一个固定名字
        // 方法2：使用层控件，会自动预合成。弊端：复制剪切时，层控件会丢失阵型
        // 方法3：给comment添加阵型名称，然后再获取名称。
/*        var expr = selectLayers[l].transform.position.expression;
        expr = expr.split(";")[0];
        var name = matchLayerNameFormExpression(expr);*/
        var commentProps = getCommentProps(layer);
        var formationName = commentProps.formationName;
        if(formationName!=undefined){
            if(arrayIndexOf(formations, formationName)==-1){
                var copy = curComp.layer(formationName).duplicate();
                copy.name = formationName;
                preLayers.push(copy);
                formations.push(formationName);
            }
        }
    }
    for (var i=0;i<preLayers.length; i++){
        var layer = preLayers[i];
        precompIndices.push(layer.index); 
    }
    var firstLayerIndex = precompIndices[0];

    var precomp = parentComp.layers.precompose(precompIndices, precompName, true);
    var precompLayer = parentComp.layer(precompName);
    precompLayer.moveBefore(curComp.layer(firstLayerIndex));

    // 由于precompose是将comp的整个时长打包，所以调整时间长短和分布
    var duration = Outpoint - Inpoint;
    var adjustStartTime = precomp.duration;
    var newCompDuration = 0;
    
    //alert("Inpoint:" + Inpoint + "\n Outpoint:" + Outpoint + "\n adjustStartTime:" + adjustStartTime + "\n newCompDuration:" + newCompDuration)
    adjustStartTime = adjustStartTime > Inpoint ? Inpoint : adjustStartTime;  
    newCompDuration = newCompDuration < duration? duration : newCompDuration;  
    // 将预合成内层的起点移动到预合成的开头，剪短预合成的长度，再将预合成层的起点向后移动最早层的起点
    for(var i=1; i<=precomp.layers.length; i++){precomp.layer(i).startTime -= adjustStartTime;}
    precomp.duration = newCompDuration;
    precompLayer.startTime = adjustStartTime;


    // 添加相机
    for(var i=curComp.numLayers; i>=1; i--){
        var camLayer = curComp.layer(i);
        if(camLayer instanceof CameraLayer){
            addCameraToPercomp(camLayer,precompLayer);
        }
    }
    /* 最后添加阵型，撤销操作时会崩溃！！！
    var formation = curComp.layer("formation");
    formation.copyToComp(precomp);
    */
    return precompLayer;
}

function precompLayers(label){
    var curComp = getActiveComp();
    var selectLayers = getSelectedLayers(curComp);
    
    if (selectLayers.length==0)
    {
            alert("请选择至少一个层");
            return
    }

    app.beginUndoGroup("预合成喷泉");
    var newCompName = prompt("预合成的名称","");
    if(newCompName=="" || newCompName==null){return}
    //alert(selectLayers.length)
    // label 控制是否按组预合成
    if(label){
        var layerGroups = getGroupByLabel(selectLayers);
        for(var i=0; i<layerGroups.length; i++){
            var group = layerGroups[i];
            
            var newName = newCompName+(i+1);
            //var nameArray = group[0].name.split(":");
            //if(nameArray.length==3){newName = nameArray[1];}
            var precomp = precompGroup(newName,group,curComp);
            precomp.blendingMode = BlendingMode.SCREEN;
            precomp.threeDLayer=true;
            precomp.collapseTransformation=true;
        }
    }
    else{
        var precomp = precompGroup(newCompName,selectLayers,curComp);
        precomp.blendingMode = BlendingMode.SCREEN;
        precomp.threeDLayer=true;
        precomp.collapseTransformation=true;
    }
    
    app.endUndoGroup();
}
//precompLayers(false)
//precompLayers(true)
//更新相机到所有预合成中
function updateCamera(cameraLayers, precompLayers){
    for(var i=0; i<precompLayers.length; i++){
        var precompList = [];
        var cameraList = [];
        
        var layer = precompLayers[i];
        //alert(layer.name)
        var precomp = layer.source;
        // 如果不是合成层（灯光层、空物体层、文字层灯），则跳过
        if(!(precomp instanceof CompItem)){continue}
        
        // 删除预合成里面的相机层
        var camexist = 0;
        for(var o=1; o<=precomp.numLayers; o++){
            var sublayer = precomp.layer(o);
            if(sublayer instanceof CameraLayer){
                //alert(sublayer.name);
                camexist = 1;
                sublayer.remove();
                o--;
            }//end if
        }//end for
        //alert("cam:" + camexist)
        // 添加预合成到新列表中,如果合成里有相机
        if(camexist==1){
            for(var o=1; o<=precomp.numLayers; o++){
                var sublayer = precomp.layer(o);
                //alert(sublayer.name)
                if(sublayer.source instanceof CompItem){precompList.push(sublayer);}
            }//end for
        }//end if
        //alert(precompList)
        // 添加相机到预合成中
        for(var o=0; o<cameraLayers.length; o++){
            var camera = cameraLayers[o];
            var newCamera = addCameraToPercomp(camera,layer);
            cameraList.push(newCamera);
        }
        //alert(cameraList)
        if(precompList.length>0){updateCamera(cameraList, precompList);}
    }//end for
}
// 更新当前选择的预合成相机
function updatePrecompCamera(){
    app.beginUndoGroup("更新预合成的相机");
    
    var curComp = getActiveComp();
    var selectLayers = getSelectedLayers(curComp);
    
    if (selectLayers.length==0)
    {
            alert("请选择至少一个层");
            return
    }
    
    // 获取所有相机
    var cameraList = [];
    var precompList = [];
    
    for(var i=1; i<=curComp.numLayers; i++){
        var curlayer = curComp.layer(i);
        if(curlayer instanceof CameraLayer){cameraList.push(curlayer);}
    }

    for(var i=0; i<selectLayers.length;i++){
        var sellayer = selectLayers[i];
        if(sellayer.source instanceof CompItem){precompList.push(sellayer);}
    }
    if(precompList.length>0){updateCamera(cameraList, precompList);}
    else{"没有选择有效的合成！"}
    
    app.endUndoGroup();
}
//updatePrecompCamera()


function cross(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2]

  var rx = ay * bz - az * by
  var ry = az * bx - ax * bz
  var rz = ax * by - ay * bx
  return [ rx, ry, rz ]
}
function dot(a,b){
    var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2]
    var result = ax*bx + ay*by + az*bz
    return result
}
// alert(dot([5,6,3],[1,2,3]))
function normalize(vec) {
  var x = vec[0]
  var y = vec[1]
  var z = vec[2]
  var squaredLength = x * x + y * y + z * z

  if (squaredLength > 0) {
    var length = Math.sqrt(squaredLength)
    vec[0] = vec[0] / length
    vec[1] = vec[1] / length
    vec[2] = vec[2] / length
  }
  return vec
}
function getFolderByMatchName(matchName){
    for (var i=1; i<=app.project.numItems; i++) {
        var item =app.project.item(i);
         var name = item.name;
        //alert(name)
        //alert(item)
        if(item instanceof FolderItem){
            if(name.match(matchName)){ return item;}
        }//end if
    }//end for
    return null
}
function replaceFountainByAngel(){
    app.beginUndoGroup("random fountains");
    var selectedLayers = getSelectedLayers(getActiveComp());
    var camera = getActiveComp().activeCamera;
    
    // 检查要替换的层
    if(selectedLayers.length==0){
        alert("没有选择要替换的喷泉层！")
        return
    }
    
    // 检查相机
    if(camera==null){
        alert("没有三维摄像机,无法随机！")
        return
    }

    // 获取喷泉素材,并储存 喷泉类、喷泉项、角度、编号ID
    var fountainTypes = [];
    var fountains = [];
    var fountainAngles = [];
    var fountainIndexs = [];
    var parentFolder = prompt("输入要随机喷泉的文件夹名称","喷泉文件夹名称","选择文件夹");
    if(parentFolder!="喷泉文件夹名称"){
        var folder = getFolderByMatchName(parentFolder);
        if(!folder){
            alert("没有找到文件夹")
            return
        }
        
        for(var i=1; i<=folder.numItems;i++){
            var ft = folder.item(i);
            if(!ft.file){continue}
            var ftName = ft.name;
            
            var namelist = ftName.split(".");
            if(namelist.length=2){ ftName = namelist[0];}
            else if(namelist.length>2){ 
                alert("喷泉素材名称不能包含‘.’符号！");
                return
            }
            //alert(ftName)
            
            var ftTypeName= ftName.substring(0,ftName.length-4);//获取名称，GE01
            //var typeIndex = fountainTypes.indexOf(ftTypeName); // 查看名称是否储存过
            // 使用函数代替indexOf函数，有点电脑不好使
            var typeIndex = arrayIndexOf(fountainTypes,ftTypeName); // 查看名称是否储存过

            if(typeIndex!=-1){
                var angle= ftName.substr(-4,2);
                
                var fountainGroup  = fountains[typeIndex];
                var angleGroup = fountainAngles[typeIndex];
                var indexGroup = fountainIndexs[typeIndex];
                
                fountainGroup.push(ft);
                angleGroup.push(angle);
                indexGroup.push(i);
            }
            else{
                var angle= ftName.substr(-4,2);
                
                var fountainGroup  = [ft];
                var angleGroup = [angle];
                var indexGroup = [i];
                
                fountainTypes.push(ftTypeName);
                fountains.push(fountainGroup);
                fountainAngles.push(angleGroup);
                fountainIndexs.push(indexGroup);
            }
            //var angle= ftName.substr(-4,2);
            //index = parseInt(index);
            //fountainAngles.push(angle);
            //fountainIndexs.push(i);
            //fountains.push(ft);
        }//end for
    }//end if
    //alert(fountainTypes)
    //writeLn(fountainTypes); 
    // 检查素材数量
    var fountainCount = fountains.length;
    if(fountainCount ==0){
        alert("喷泉文件中没有素材")
        return
    }
    //alert(fountainAngles)
    //alert(fountainIndexs)
    //alert(fountainCount);
    writeLn("文件夹中有：" + fountainCount +"种喷泉");  
    var camPos = camera.property("Transform").property("Position").value;
    // 开始替换素材
    for(var i=0; i<selectedLayers.length;i++){
        var layer = selectedLayers[i];
        // 检查是否有原始文件
        if(!(layer instanceof AVLayer)){
            continue
        }
        // 检查是否为文件素材
        var source = layer.source;
        if(!source.file){
            continue
        }
        
        // 计算角度
        var layerPos = layer.property("Transform").property("Position").value;
        var vertical = [camPos[0],layerPos[1],camPos[2]];
        
        var target = normalize(camPos-layerPos);
        var H = normalize(vertical - layerPos);
        var angel = dot(H,target);
        angle = Math.acos (angel)*180/3.1415926;
        //alert(angle)
        writeLn( layer.name +"的角度是："+angle);  
        var angleEffect = layer.property("Effects").property("Angle")
        if(angleEffect==null){
            angleEffect = layer.effect.addProperty("ADBE Angle Control");
            angleEffect.name = "Angle";
        }
        angleEffect.property("ADBE Angle Control-0001").setValue(angle);
        
        // 获取喷泉类名
        var ftName = source.name;
        var namelist = ftName.split(".");
        if(namelist.length=2){ ftName = namelist[0];}
        else if(namelist.length>2){ 
            alert("喷泉素材名称不能包含‘.’符号！");
            return
        }
        var ftTypeName= ftName.substring(0,ftName.length-4);
        // 获取随机
        //alert(ftTypeName)
        //var typeIndex = fountainTypes.indexOf(ftTypeName);
        // 使用函数代替indexOf函数，有点电脑不好使
        var typeIndex = arrayIndexOf(fountainTypes,ftTypeName);

        if(typeIndex==-1){
            alert("文件夹中没有合适的素材")
            return
        }
        var fountainGroup  = fountains[typeIndex];
        var angleGroup = fountainAngles[typeIndex];
        var indexGroup = fountainIndexs[typeIndex];
        
        // 获取喷泉在文件夹中的index
        var index;
        var preValue;
        for(var o=0;o<angleGroup.length;o++){
            var value = angleGroup[o];
            value = parseInt(value);
            //alert(value)
            //alert(angle)
            if(value<angle){ 
                index = indexGroup[o];
                preValue = value;
                }
            else{
                var midValue = value - (value-preValue)/2; // 取最近的值
                if(midValue<angle){ index = indexGroup[o];}
                break;
            }
        }
        //alert(index)
        //var index = parseInt (Math.random()*fountainNum)
        //alert(fountainGroup)
        //var newSource = fountainGroup[index-1];
        var newSource = folder.item(index);
        //alert(fountains[0].name)
        //alert(newSource)
        layer.replaceSource (newSource, true);
        layer.orientation.expression = "";
    }
     app.endUndoGroup();
}
//if(checkKey()){replaceFountainByAngel()}
function randomFountain(){
    app.beginUndoGroup("random fountains");
    var selectedLayers = getSelectedLayers(getActiveComp());
    
    // 检查要替换的层
    if(selectedLayers.length==0){
        alert("没有选择要替换的喷泉层！")
        return
    }
    
    // 获取喷泉素材
    var fountainFolder = prompt("输入要随机喷泉的文件夹名称","喷泉文件夹","选择文件夹");
    fountainFolder = getFolderByMatchName(fountainFolder);
    if(!fountainFolder){
        alert("没有找到文件夹");
        return
    }

    // 获取文件夹中的喷泉素材,并储存 喷泉类和喷泉项
    var fountainTypes = [];
    var fountains = [];
    for(var i=1; i<=fountainFolder.numItems;i++){
        var ft = fountainFolder.item(i);
        if(!ft.file){continue}
        
        var ftName = ft.name;
        var namelist = ftName.split(".");
        if(namelist.length=2){ ftName = namelist[0];}
        else if(namelist.length>2){ 
            alert("喷泉素材名称不能包含‘.’符号！");
            return
        }
    
        ftName= ftName.substring(0,ftName.length-2);//获取名称，GE0100
        //var typeIndex = fountainTypes.indexOf(ftName); // 查看名称是否储存过
        // 使用函数代替indexOf函数，有点电脑不好使
        var typeIndex = arrayIndexOf(fountainTypes,ftName); // 查看名称是否储存过
        if(typeIndex!=-1){
            var randomGroup  = fountains[typeIndex];
            randomGroup.push(ft);
        }
        else{
            var randomGroup  = [ft];
            fountainTypes.push(ftName);
            fountains.push(randomGroup);
        }
    }
    //alert(fountains);
    //alert(fountainTypes);
    
    // 开始替换素材
    for(var i=0; i<selectedLayers.length;i++){
        var layer = selectedLayers[i];
        // 检查是否有原始文件
        if(!(layer instanceof AVLayer)){
            continue
        }
        // 检查是否为文件素材
        var source = layer.source;
        if(!source.file){
            continue
        }
        var ftName = source.name;
        var namelist = ftName.split(".");
        if(namelist.length=2){ ftName = namelist[0];}
        else if(namelist.length>2){ 
            alert("喷泉素材名称不能包含‘.’符号！");
            return
        }
        //alert(ftName)
        ftName= ftName.substring(0,ftName.length-2);
        
        // 获取随机
        var typeIndex = fountainTypes.indexOf(ftName);
        if(typeIndex==-1){
            alert("文件夹中没有合适的素材")
            return
        }
        var randomGroup  = fountains[typeIndex];

        // 检查素材数量
        var randomNum = randomGroup.length;
        if(randomNum ==0){
            alert("喷泉文件中没有合适的素材")
            return
        }
        
        var index = parseInt (Math.random()*randomNum)
        var newSource = randomGroup[index];
        
        layer.replaceSource (newSource, true)
    }

     app.endUndoGroup();
}
//if(checkKey()){randomFountain()}




