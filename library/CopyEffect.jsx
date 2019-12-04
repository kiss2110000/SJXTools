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
    function checkKeywordInName(name,keyword){
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

    function findSourceItemOfLayerFromCompByKeyword(itemComp,keyword){
        // keyword 是个字符串。表示这个层(项)名称中带有的字符串。比如："Comp"、"Fountain"、"Water"等。
        if ((itemComp instanceof CompItem)==false){
            alert("错误合成输入！")
            return null
        }
        var expcomp = new RegExp(keyword,"i");
        for(var i=1;i<=itemComp.numLayers;i++){
            var layer = itemComp.layer(i);
            // 注意：相机和灯光没有source层
            if(layer instanceof CameraLayer || layer instanceof  LightLayer){continue}
            
            var name = layer.source.name;
            if( (expcomp.test(name)) && (findCameraName(name)!=null) ){return layer.source;}
        }
        return null;
    }
    //alert(findSourceItemOfLayerFromCompByKeyword(app.project.activeItem,"Video").name)
    function getFootageByReplaceCamName(layer,src,dst){
        var expVideo = new RegExp(".avi$|.mov$");
        if ((layer instanceof AVLayer) && (layer.source.mainSource instanceof FileSource)){
            //  这个层属于 AVLayer  并且属于文件素材
            var name = layer.source.name;
            //alert(name)
            if(findCameraName(name)!=null){
                // 文件名包含“C01”字样
                var footage=null;
                // 如果是avi 或 mov 文件，则直接替换镜头号“C01”
                if(expVideo.test(name)){footage = name.replace(src.cam, dst.cam);}
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
                var exp = new RegExp( footage,"i");

                //  检索这个镜头的这个层的项目
                for (var i=1; i<=app.project.numItems; i++) {
                    var item =app.project.item(i);
                    if(exp.test(item.name) ){return item;}
                }
            }
        }
        return null;
    }

//-----------------------------------------------------------------------------------------------------------------------------------------
    function checkPreviousComps(comp) {
        // Check the list of previous comps for the specified item's ID
        // to make sure it isn't duplicated twice
        for (var i=0; i<previousComps.length; i++) {
            if (previousComps[i].source.id == comp.id) {return previousComps[i].dest;}
        }
        return null;
    }
    function getCompObjectFromLayer(layerComp){
        // 获取一个镜头合成的物体
        if((layerComp.source instanceof CompItem)==false){return null}
        var source = layerComp.source;
        var name = source.name;
        var cam = findCameraName(name);
        
        if(checkKeywordInName(name,"Comp")==false && cam==null){return null}
        
        var compObject = new Object();
        compObject.layer = layerComp;
        compObject.source = source;
        compObject.name = name;
        compObject.duration=source.duration;
        compObject.cam = cam;
        compObject.project = findPrefixNameOfProjectFromCompName(name);
        
        compObject.fountain = findSourceItemOfLayerFromCompByKeyword(compObject.source,"Fountain");
        compObject.light       = findSourceItemOfLayerFromCompByKeyword(compObject.source,"Light");
        compObject.laser      = findSourceItemOfLayerFromCompByKeyword(compObject.source,"Laser");
        compObject.video     = findSourceItemOfLayerFromCompByKeyword(compObject.source,"Video");
        compObject.fire        = findSourceItemOfLayerFromCompByKeyword(compObject.source,"Fire");
        compObject.fog        = findSourceItemOfLayerFromCompByKeyword(compObject.source,"Fog");
        
        return compObject
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
        var compResult = {};
        compResult.source = item;
        var newname = item.name.replace(src.cam,dst.cam)
        var comp = item.duplicate();
        if(duration){comp.duration = dst.duration;}
        comp.name = newname;
        compResult.dest =comp;
        previousComps.push(compResult);

        for(var i=1;i<=comp.numLayers;i++){
            var layer = comp.layer(i);
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
                    var newitem = getFootageByReplaceCamName(layer,src,dst);
                    if(newitem!=null){
                        //if(layer instanceof CameraLayer || layer instanceof  LightLayer){continue}
                        layer.replaceSource(newitem, true);
                        if(duration){layer.outPoint = dst.duration;}
                    }
                }
            }
        }
        return comp;
    }

    function duplicateAndReplaceMainComp(src,dst){
        //  复制第一个主合成，然后设置Scene层，和VFX层，和素材层
        var comp = src.source.duplicate();
        comp.duration = dst.duration;
        comp.name = dst.name;
        
        for(var i=1;i<=comp.numLayers;i++){
            var layer = comp.layer(i);
            if((layer instanceof AVLayer)==false){continue;}
//////////////////////////////////////////////////////////////////////////////////////////////////////// 第一部分
            else if(checkKeywordInName(layer.source.name,"Light|Fountain|Laser|Video|Fire|Fog")  && layer.source instanceof CompItem){
                //  设置VFX层，如果原始合成没有，则复制现有合成
                if( checkKeywordInName(layer.source.name,"Fountain") && dst.fountain !=null){layer.replaceSource(dst.fountain,true);}
                else if(checkKeywordInName(layer.source.name,"Light") && dst.light !=null){ layer.replaceSource(dst.light, true);}
                else if(checkKeywordInName(layer.source.name,"Laser") && dst.laser !=null){ layer.replaceSource(dst.laser, true);}
                else if(checkKeywordInName(layer.source.name,"Video") && dst.video !=null){ layer.replaceSource(dst.video, true);}
                else if(checkKeywordInName(layer.source.name,"Fire") && dst.fire !=null){ layer.replaceSource(dst.fire, true);}
                else if(checkKeywordInName(layer.source.name,"Fog") && dst.fog !=null){ layer.replaceSource(dst.fog, true);}
                else{ // 复制合成
                    var check =checkPreviousComps(layer.source);
                    if (check != null) { layer.replaceSource(check, true);
                    }else{
                        var newcomp = SJX_duplicateComp(layer.source,true,src,dst);
                        if(src.project!=null && dst.project!=null && src.project!=dst.project){ newcomp.name = newcomp.name.replace(src.project, dst.project);}
                        //newcomp.duration = secondData.duration;
                        layer.replaceSource(newcomp, true);
                        layer.outPoint = dst.duration;
                    }
                }
            }
//////////////////////////////////////////////////////////////////////////////////////////////////////// 第二部分
            else if(checkKeywordInName(layer.source.name,"Back|Front|Water|Sky|Matter") && layer.source instanceof CompItem){         
                //  设置Scene层，复制新合成出来
                var check =checkPreviousComps(layer.source);
                if (check != null) { layer.replaceSource(check, true);}
                else{
                    var newcomp =  SJX_duplicateComp(layer.source,true,src,dst);
                    if(src.project!=null && dst.project!=null && src.project!=dst.project){  newcomp.name = newcomp.name.replace(src.project, dst.project);}
                    layer.replaceSource(newcomp, true);
                    layer.outPoint = dst.duration;
                }
            }
//////////////////////////////////////////////////////////////////////////////////////////////////////// 第三部分
            else{ // 设置素材层
                layer.outPoint = dst.duration;
                var newitem = getFootageByReplaceCamName(layer,src,dst);
                if(newitem!=null){layer.replaceSource(newitem, true);}
            }
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
        var srcComp = getCompObjectFromLayer(selectLayers[0]);
        var dstComp = getCompObjectFromLayer(selectLayers[1]);
        if (srcComp==null || dstComp==null){
            alert("选择了非场景的合成！")
            return false
        }
        
        //没有使用var，直接给标识符test赋值，这样会隐式的声明了全局变量test。即使该语句是在一个function内，当该function被执行后test变成了全局变量。
        previousComps = [];

        //  复制第一个主合成层，重命名第二个主合成，替换第二个主合成层！！！！！！！！！
        var newComp = duplicateAndReplaceMainComp(srcComp,dstComp);
        dstComp.source.name = dstComp.name + "_Old";
        dstComp.layer.replaceSource(newComp, true);
        alert("复制完成！");
        
        app.endUndoGroup();
    }
    copyEffect()