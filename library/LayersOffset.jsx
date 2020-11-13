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

function cubeBezierCurve(a,b,c,d,t){
    // 三阶贝塞尔曲线的参数方程定义
    // P(t) = A*(1-t)*(1-t)*(1-t) + B*3*(1-t)*(1-t)*t + C*3*(1-t)*t*t + D*t*t*t,  t=0,1
    if(0<= t <=1){
        var p = a*(1-t)*(1-t)*(1-t) + b*3*(1-t)*(1-t)*t + c*3*(1-t)*t*t + d*t*t*t
        return p
    }else(alert("Parameter 't' beyond range!"))
}

//alert(cubeBezierCurve([58,361],[368,373],[351,128],[512,96],0.34))
function offsetFrameByBezierCurve(){
    if (parseFloat(app.version) > 11.0){
        var win = new Window("palette", undefined, undefined, {borderless: false});
        win.margins = [0,0,0,0];
        var scriptpath = new File($.fileName);
        var flash = win.add ("flashplayer", undefined);
        flash.loadMovie(File (scriptpath.parent.fsName + "/Offset_Frame_By_Bezier_Curve_resources/DeCasteljau_Bezier_Curve.swf"));
       
        flash.createAEcomp = function(Ax,Ay,tgAx,tgAy,tgBx,tgBy,Bx,By,val){
                app.beginUndoGroup("Offset Frame By Bezier Curve");
                
                var a=[Ax,Ay], b=[tgAx,tgAy], c=[tgBx,tgBy], d=[Bx,By];
                
                var selectLayers = getSelectedLayers(getActiveComp());
                var fr = getActiveComp().frameRate;
                
                var min = getMinST(selectLayers);
                var max = getMaxST(selectLayers);
                var dur = max-min;
                for(i=0,ii=selectLayers.length;i<ii;i++){
                    var numb =i/(ii-1);
                    var p = cubeBezierCurve(a,b,c,d,numb)
                    var time = (a[0]-p[0])/(a[0]-d[0])*dur;
                    
                    selectLayers[i].startTime=(min+time)/fr;
                }
                app.endUndoGroup();
            }
        flash.closeScriptWindow = function(){ win.close(); }
        win.show();
    }
}
//offsetFrameByBezierCurve()

function selectionLayersBySameSourceFooatge(){
    app.beginUndoGroup("selectionLayersBySameSourceFooatge");
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    
    if(layers.length!=1){
        alert("需要选择一个层！");
        return
    }
    if(!(layers[0] instanceof AVLayer)){
        alert("需要选择AV层！");
        return
    }

    // 获取原始项的ID
    var source = layers[0].source;
    var sourceId = source.id;

    for(var i=1;i<=comp.numLayers;i++){
        var layer = comp.layer(i);
        // 排除相机灯光等类型
        if(!(layer instanceof AVLayer)){continue;}
        
        // 选择层
        $.writeln(layer.name)
        if(layer.source.id == sourceId){ layer.selected = true}
    }
    app.endUndoGroup();
}
//~ selectionLayersBySameSourceFooatge()

function separatePosition(min,max,axis){
    app.beginUndoGroup("separatePosition");
    
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    
    var num = layers.length;
    
    var each_increace = (max-min) / (num-1);
    
    for(var i=0; i<layers.length;i++){
        var layer = layers[i];
        var pos = layer.transform.position.value;
        
        if(axis==0){ // X轴
            pos[0] = min + i*each_increace;
        }
        else if(axis==1){ // Y轴
            pos[1] = min + i*each_increace;
        }
        else if(axis==2){ // Z轴
            pos[2] = min + i*each_increace;
        }
    
        layer.transform.position.setValue(pos);
    }

    app.endUndoGroup();
}
//~ separatePosition(340,513,2);