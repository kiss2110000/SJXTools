/*
        Layers Offset  v1.0.0
 
        更新内容：
            1、将“层偏移工具”从以前的工具分离到现在的脚本中
            2、添加“按照标签颜色分组偏移”工具
        
        更新时间：2019.05.16 17.30
        ---------------------------------------------------------------------
*/

var dirPath = File($.fileName).path;
$.evalFile(dirPath + "/" + "CommonFunction.jsxbin");

/*** main function ***/

// 层偏移时间，单位为秒（S）
function offsetFrame(layers,time){
    var minTime = getMinStartTime(layers);
    for(var i=0; i<layers.length; i++){
        layers[i].startTime = minTime+time*i;
    }
}
//offsetFrame(getSelectedLayers(getActiveComp()),5)

function offsetSelectedFrame(frame){
    app.beginUndoGroup("偏移帧");
    
    var fps = getActiveComp().frameRate;
    var time = frame/fps;
    
    var selectLayers = getSelectedLayers(getActiveComp());
    var numb = selectLayers.length;
    if(numb<2){return null}
    
    //反向选择
    if(ScriptUI.environment.keyboardState.shiftKey){selectLayers.reverse()}
    
    // 是否钳制范围，计算每层的间隔时间
    if(ScriptUI.environment.keyboardState.ctrlKey){
        var min = getMinStartTime(selectLayers);
        var max = getMaxStartTime(selectLayers);
        time = (max-min)/(numb-1);
    }
    offsetFrame(selectLayers,time);
    
    app.endUndoGroup();
}
//offsetSelectedFrame(5)
function offsetFrameByGroup(frame){
    app.beginUndoGroup("按颜色偏移帧");

    var fps = getActiveComp().frameRate;
    var time = frame/fps;
    
    var selectLayers = getSelectedLayers(getActiveComp());
    var layerGroups = getGroupByLabel( selectLayers);
    var numb = layerGroups.length;
    if(numb<2){
        alert("选择不足两个组！")
        return null
    }
    
    //反向选择，快捷键Shift
    if(ScriptUI.environment.keyboardState.shiftKey){layerGroups.reverse()}
    // 是否钳制范围，计算每层的间隔时间快捷键Ctrl
    if(ScriptUI.environment.keyboardState.ctrlKey){
        var min = getMinStartTimeFromGroup(layerGroups);
        var max = getMaxStartTimeFromGroup(layerGroups);
        time = (max-min)/(numb-1);
    }
    
    var minTime = getMinStartTimeFromGroup(layerGroups);
    for(var i=0; i<layerGroups.length; i++){
        var group = layerGroups[i];
        for(var o=0; o<group.length; o++){
            var layer = group[o];
            layer.startTime=minTime+time*i;
        }
    }
    app.endUndoGroup();
}
//offsetFrameByGroup(5)
function randomOffsetSelectedFrame(range){
    app.beginUndoGroup("随机偏移帧");
    
    var fps = getActiveComp().frameRate;
    var time = range/fps;
    
    var selectLayers = getSelectedLayers(getActiveComp());
    var numb = selectLayers.length;
    if(numb<2){return null}

    if(ScriptUI.environment.keyboardState.ctrlKey){
        var min = getMinStartTime(selectLayers);
        var max = getMaxStartTime(selectLayers);
        time = (max-min)/(numb-1);
    }else{time = time/(numb-1)}
    
    var newLayers=new Array();
    while(true){
        var index = Math.floor(Math.random()*(selectLayers.length));
        newLayers.push(selectLayers[index]);
        selectLayers.splice(index,1);
        if(selectLayers.length==0){break}
    }
    offsetFrame(newLayers, time);
    
    app.endUndoGroup();
}
//randomOffsetSelectedFrame(100)
function randomOffsetSelectedFrameByGroup(range){
    app.beginUndoGroup("随机偏移帧");
    
    var fps = getActiveComp().frameRate;
    var time = range/fps;
    
    var selectLayers = getSelectedLayers(getActiveComp());
    var layerGroups = getGroupByLabel( selectLayers);
    var numb = layerGroups.length;
    if(numb<2){return null}

    if(ScriptUI.environment.keyboardState.ctrlKey){
        var min = getMinStartTimeFromGroup(layerGroups);
        var max = getMaxStartTimeFromGroup(layerGroups);
        time = (max-min)/(numb-1);
    }else{time = time/(numb-1)}
    
    var minTime = getMinStartTimeFromGroup(layerGroups);
    
    var newLayers=new Array();
    while(true){
        var index = Math.floor(Math.random()*layerGroups.length);
        //alert("获取的index："+index)
        newLayers.push(layerGroups[index]);
        layerGroups.splice(index,1);
        if(layerGroups.length==0){break}
    }
    //alert(newLayers.length)
    for(var i=0; i<newLayers.length; i++){
        var group = newLayers[i];
        //alert(group)
        for(var o=0; o<group.length; o++){
            var layer = group[o];
            layer.startTime=minTime+time*i;
        }
    }
    
    app.endUndoGroup();
}
//randomOffsetSelectedFrameByGroup(100)