"""
AVLayer:{
    comp layer,
    footage layer,
    solid layer,
    null layer
    adjustment layer
    sound layer
}
TextLayer:{
    text layer
}
CameraLayer:{
    camera layer
}
LightLayer:{
    light layer
}
ShapeLayer:{
    shape layer
}


基类<=子类：
Layer<=AVLayer=<TextLayer
Layer<=CameraLayer 
Layer<=LightLayer 
Layer<=ShapeLayer

"""
/* 
    
合成结构：
    Comp:                       ——  主合成
            laser                   ——
            Light                     |
            Fog                       | VFX 层
            fountain                  |
            Video                   ——

            Sky                     ——
            Water                     | 场景层
            Back                      |
            Front                   ——
            
            Element Comp            ——  元素合成

            Solid                   ——
            Adjustment                | 素材层
            Sequence                  |
            File                    ——

*/
//-----------------------------------------------------------------------------------------------------------------------------------------
    function findCameraName(name){
        var expcam = new RegExp("C[0-9]{0,2}","i");
        if( expcam.test(name) ){  return name.match(expcam)[0];}
        return null;
    }
    //alert("C02_Sky1".match(/Back\d*|Front\d*|Water\d*|sky\d*|Matter\d*/gi))
    function checkCamAndString(name,keyword){
        // keyword 是个字符串，表示这个item的名称中带有的字符串。比如："Comp"、"Back|Front|Water|Sky"、"Fountain"等。
        var expcomp = new RegExp(keyword,"i");
        if( (expcomp.test(name)) && (findCameraName(name)!=null) ){return true;}
        return false;
    }
    function findPrefixNameOfProjectFromCompName(name){
        //  YXH_C02_Comp 找出这个合成的项目名称
        var strs = name.split(".")[0].split("_");
        //  alert(strs)
        var index=null;
        for(var i=0;i<strs.length;i++){
            if(findCameraName(strs[i])!=null){
                index = i;
                break;
            }
        }
        if( (index ==1) && (findCameraName(name)!=null) ){return strs[0];}
        return null;
    }

    function findSourceItemOfCompLayersByKeyword(itemComp,keyword){
        // keyword 是个字符串。表示这个层(项)名称中带有的字符串。比如："Comp"、"Fountain"、"Water"等。
        if ((itemComp instanceof CompItem)==false){
            alert("错误合成输入！")
            return null
        }
        var expcomp = new RegExp(keyword,"i");
        for(var i=1;i<=itemComp.numLayers;i++){
            var layer = itemComp.layer(i);
            // 注意：相机和灯光没有source层
            if((layer instanceof AVLayer)==false){continue}
            
            var name = layer.source.name;
            if( (expcomp.test(name)) && (findCameraName(name)!=null) ){return layer.source;}
        }
        return null;
    }
    //alert(findSourceItemOfCompLayersByKeyword(app.project.activeItem,"Video").name)
    function getFootageByReplaceCamName(layer,src,dst){
        var expVideo = new RegExp(".avi$|.mov$");
        if ((layer instanceof AVLayer) && (layer.source.mainSource instanceof FileSource)){
            // 这个层属于 AVLayer,并且属于文件素材
            var name = layer.source.name;
            //alert(name)
            if(findCameraName(name)!=null){ // 文件名包含“C01”字样
                var footage=null;
                // 如果是avi 或 mov 文件，则直接替换镜头号“C01”
                if(expVideo.test(name)){ footage = name.replace(src.cam, dst.cam);}
                // 如果是序列文件，则
                else{
                    //   YXH_C02_Color_[0305-0604].png
                    //   YXH_C01_Color.png
                   var strs = name.split("[")[0].split(".")[0].split("_");
                   footage =strs.join("_");
                   footage = footage.replace(src.cam, dst.cam);
                }
                //alert(footage)
                if(src.project!=null && dst.project!=null && src.project!=dst.project){ footage = footage.replace(src.project, dst.project);}

                //  检索这个镜头的这个层的项目
                var patten = new RegExp( footage,"i");
                for (var i=1; i<=app.project.numItems; i++) {
                    var item =app.project.item(i);
                    if(patten.test(item.name) ){return item;}
                }
            }
        }
        return null;
    }

	function getFootageByReplaceName(layer,sourceString,targetString){
	    if ((layer instanceof AVLayer)==false){return null} //  这个层属于 AVLayer
	    var curItem = layer.source;
	    if((curItem.mainSource instanceof FileSource)==false){return null} //  这个属于文件素材
	    var itemName = curItem.name;
	    if(itemName.indexOf(sourceString)==-1){return null} //  这个层名称根本不包含源字符串
	    
	    // 定义新的素材名称
	    var footageName = null;
	    // 序列：YXH_C01_Color                  =>  YXH_C04_Color
	    // 序列：YXH_C01_Color_[0305-0604].png  =>  YXH_C04_Color
	    // 视频：YXH_C01_fog.mov                =>  YXH_C04_fog
	    // 图片：YXH_C01_Color.jpg              =>  YXH_C04_Color
	    var nameList = itemName.split("[")[0].split(".")[0].split("_");
	    itemName = nameList.join("_");
	    //var itemName = itemName.replace (/_\[\d+-\d+\]/,"");  去掉之后，也无法匹配数字
	    footageName = itemName.replace(sourceString, targetString);
	    
	    //  检索这个镜头的这个层的项目
	    var compItem = null;
	    for (var i=1; i<=app.project.numItems; i++) {
	        compItem =app.project.item(i);
	        if((compItem.name.indexOf(footageName)!=-1) && (compItem.mainSource instanceof FileSource)==true){
	            break;
	        }
	    }
	    return compItem;
	}
	//~ var comp = app.project.activeItem;
	//~ var layer = comp.selectedLayers[0]
	//~ var src = "01"
	//~ var dst = "02"
	//~ alert(getFootageByReplaceName(layer,src,dst).name)

//-----------------------------------------------------------------------------------------------------------------------------------------
    function checkPreviousComps(comp) {
        // Check the list of previous comps for the specified item's ID
        // to make sure it isn't duplicated twice
        for (var i=0; i<previousComps.length; i++) {
            if (previousComps[i].source.id == comp.id) {return previousComps[i].dest;}
        }
        return null;
    }
    function getSceneShotObjectFromLayer(comp_layer){
        // 获取场景镜头合成物体
        var sceneObject = new Object();
        
        // 排除选择的非compitem层
        if((comp_layer.source instanceof CompItem)==false){return null}
        
        var source = comp_layer.source;
        var name = source.name;
        var cam = findCameraName(name);
        
        // 排除场景名格式错误，标准名：C02_Comp
        if(checkCamAndString(name,"Comp")==false && cam==null){return null}
        
        sceneObject.layer = comp_layer;
        sceneObject.source = source;
        sceneObject.name = name;
        sceneObject.duration=source.duration;
        sceneObject.cam = cam;
        sceneObject.project = findPrefixNameOfProjectFromCompName(name);
        
        sceneObject.fountain = findSourceItemOfCompLayersByKeyword(sceneObject.source,"Fountain");
        sceneObject.light       = findSourceItemOfCompLayersByKeyword(sceneObject.source,"Light");
        sceneObject.laser      = findSourceItemOfCompLayersByKeyword(sceneObject.source,"Laser");
        sceneObject.video     = findSourceItemOfCompLayersByKeyword(sceneObject.source,"Video");
        sceneObject.fire        = findSourceItemOfCompLayersByKeyword(sceneObject.source,"Fire");
        sceneObject.fog        = findSourceItemOfCompLayersByKeyword(sceneObject.source,"Fog");
        
        return sceneObject;
    }
    function SJX_duplicateComp(item,duration,src,dst){
        //  默认参数设置
        //~ function add(a,b){ 
        //~     b=arguments[1] ? arguments[1] : 13; 
        //~     return a+b;
        //~     }
        //~ alert(add(7))
        var duration = arguments[1] ? arguments[1] : false; 

        //  捆绑复制源（source）和复制结果（dest）到合成结果（compResult）中，并添加到全局变量中（previousComps ）
        var copyComp = item.duplicate();

        if(duration){copyComp.duration = dst.duration;}

        var newname = item.name.replace(src.cam,dst.cam);
        copyComp.name = newname;

        var compResult = {};
        compResult.source = item;
        compResult.dest =copyComp;
        previousComps.push(compResult);

        // 替换合成内部的层，并检查合成内部的合成
        for(var i=1;i<=copyComp.numLayers;i++){
            var layer = copyComp.layer(i);
            var srcOutPoint = item.layer(i).outPoint;

            // 修改相机：匹配目标场景的相机
            if(layer instanceof CameraLayer){
                layer.name = dst.cam;
            }
            // 注意：忽略 TextLayer 、LightLayer 、ShapeLayer
            if (layer instanceof AVLayer){
                if((layer.source!=null) && (layer.source instanceof CompItem)) {
                    // 如果layer为合成层，替换后，继续复制
                    var check =checkPreviousComps(layer.source);
                    if (check != null) { layer.replaceSource(check, true);
                    }else{
                        var compResult = {};
                        compResult.source = layer.source;
                        var newComp = SJX_duplicateComp(layer.source,true,src,dst);
                        layer.replaceSource(newComp, true);
                        compResult.dest = layer.source;
                        previousComps.push(compResult);
                    }
                }else if (layer.source.mainSource instanceof FileSource) {
                // 如果layer为素材层，？？？？？？？？？？？
                	var srcStr = src.cam;
                	var dstStr = dst.cam;
                    var newitem = getFootageByReplaceName(layer,srcStr,dstStr);
                    if(newitem!=null){
                        //if(layer instanceof CameraLayer || layer instanceof  LightLayer){continue}
                        layer.replaceSource(newitem, true);
                        if(duration){layer.outPoint = dst.duration;}
                    }
                }
            }
            if(srcOutPoint>=src.duration){layer.outPoint = dst.duration;}
        }
        return copyComp;
    }
    function duplicateAndReplaceMainComp(src,dst){
        // 复制第一个主合成，然后设置Scene层，和VFX层，和素材层
        var comp = src.source.duplicate();
        comp.duration = dst.duration;
        comp.name = dst.name;
        // 注意：由于更改了合成的长度，但层的长度没有修改，需要重新修改层的长度
        
        for(var i=1;i<=comp.numLayers;i++){
            var layer = comp.layer(i);
            var srcOutPoint = src.source.layer(i).outPoint;

            // 修改相机：匹配目标场景的相机
            if(layer instanceof CameraLayer){
                layer.name = dst.cam;
            }
        
            // 注意：忽略 TextLayer 、LightLayer 、ShapeLayer
            if(layer instanceof AVLayer){
                // 开始替换层
                var itemName = layer.source.name;
    //////////////////////////////////////////////////////////////////////////////////////////////////////// 第一部分 VFX 层
                if(checkCamAndString(itemName,"Light|Fountain|Laser|Video|Fire|Fog")  && layer.source instanceof CompItem){
                    //  设置VFX层：将旧场景里的VFX层，替换到复制场景的VFX层
                    if( checkCamAndString(itemName,"Fountain") && dst.fountain !=null){layer.replaceSource(dst.fountain,true);}
                    else if(checkCamAndString(itemName,"Light") && dst.light !=null){ layer.replaceSource(dst.light, true);}
                    else if(checkCamAndString(itemName,"Laser") && dst.laser !=null){ layer.replaceSource(dst.laser, true);}
                    else if(checkCamAndString(itemName,"Video") && dst.video !=null){ layer.replaceSource(dst.video, true);}
                    else if(checkCamAndString(itemName,"Fire") && dst.fire !=null){ layer.replaceSource(dst.fire, true);}
                    else if(checkCamAndString(itemName,"Fog") && dst.fog !=null){ layer.replaceSource(dst.fog, true);}
                    else{ // 复制合成
                        var check =checkPreviousComps(layer.source);
                        if (check != null) {layer.replaceSource(check, true);
                        }else{
                            var newcomp = SJX_duplicateComp(layer.source,true,src,dst);
                            if(src.project!=null && dst.project!=null && src.project!=dst.project){ newcomp.name = newcomp.name.replace(src.project, dst.project);}
                            //newcomp.duration = secondData.duration;
                            layer.replaceSource(newcomp, true);
                            layer.outPoint = dst.duration;
                        }
                    }
                    // 注意：复制场景可能没有旧场景的VFX层，暂时还没有写
                }
    //////////////////////////////////////////////////////////////////////////////////////////////////////// 第二部分 Scene层
                //else if(checkCamAndString(itemName,"Back|Front|Water|Sky|Matter") && layer.source instanceof CompItem){
            	else if(findCameraName(itemName) && layer.source instanceof CompItem){
                    //  设置Scene层：将复制场景中的带有镜头编号的合成层，更改为新镜头编号的合成，并替换内部的素材和镜头
                    var check =checkPreviousComps(layer.source);
                    if (check != null) { layer.replaceSource(check, true);}
                    else{
                        var newcomp = SJX_duplicateComp(layer.source,true,src,dst);
                        if(src.project!=null && dst.project!=null && src.project!=dst.project){  
                        	newcomp.name = newcomp.name.replace(src.project, dst.project);
                        }
                        layer.replaceSource(newcomp, true);
                        layer.outPoint = dst.duration;
                    }
                }
    //////////////////////////////////////////////////////////////////////////////////////////////////////// 第三部分
                else{ // 设置素材层：
                	var srcStr = src.cam;
                	var dstStr = dst.cam;
                    var newitem = getFootageByReplaceName(layer,srcStr,dstStr);
                    if(newitem!=null){layer.replaceSource(newitem, true);}
                }
            }
        
            // 注意：由于更改了合成的长度，但层的长度没有修改，需要重新修改层的长度
//~             if(src.source.layer(i).name=="out"){
//~                 $.writeln(srcOutPoint)
//~                 $.writeln(src.duration)
//~                 $.writeln(srcOutPoint>=src.duration)
//~             }
            if(srcOutPoint>=src.duration){layer.outPoint = dst.duration;}
        }
        
        return comp;
    }

    function copyEffect(){
        app.beginUndoGroup("True Comp Duplicator");
        // 获取合成中的两个合成层
        var comp = app.project.activeItem;
        var selectLayers = comp.selectedLayers;
        
        //  检查是否选择了两个 “主合成层”，并获取合成信息
        if(selectLayers.length!=2){ 
            alert("选择两个场景合成！")
            return false
        }
        var srcScene = getSceneShotObjectFromLayer(selectLayers[0]);
        var dstScene = getSceneShotObjectFromLayer(selectLayers[1]);
        if (srcScene==null || dstScene==null){
            alert("选择了非场景的合成！")
            return false
        }
        
        //没有使用var，直接给标识符test赋值，这样会隐式的声明了全局变量test。即使该语句是在一个function内，当该function被执行后test变成了全局变量。
        previousComps = [];

        //  将第一个主合成层复制称新的第二之合成，重命名旧的第二个主合成，新的替换旧的第二个主合成层！！！！！！！！！
        var newComp = duplicateAndReplaceMainComp(srcScene,dstScene);
        
        dstScene.source.name = dstScene.name + "_Old";
        dstScene.layer.replaceSource(newComp, true);
        
        alert("复制完成！");
        
        app.endUndoGroup();
    }
    //copyEffect()