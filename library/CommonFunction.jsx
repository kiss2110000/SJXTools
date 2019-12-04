/*
        Common Function  v1.0.0
 
        更新内容：
            1、
            2、
        
        更新时间：2019.05.17 07:38
        ---------------------------------------------------------------------
*/
// 检查是否通过
function checkKey(){
    // 检查文件夹，不存在则创建文件夹
    var folder = new Folder("\\C\\temp");
    if(!folder.exists){folder.create();}
    
    var file = new File(folder.absoluteURI + "\\ZKSH_SJB.txt")
    
    if(!file.exists){
        var targetfile = new File("//sjx//hq//temp//ZKSH_SJB.txt");
        if(!targetfile.exists){
            //alert("System error: 5588930");
            return false
        }
        // copy to local
        targetfile.open('r');
        var targetkey = targetfile.read();
        targetfile.close();
        file.open('w');
        file.write(targetkey);  
        file.close();
    }// end if

    // 打开文件，检查是否匹配
    if(file.exists){
        file.open('r');
        var key = file.read();
        file.close();
        
        if(key == "ZKSJ_SJB:963852741"){
             // 视觉部成员名单
            var shijuebu = new Array("SXR","SJX","WQR","YPZ","HL","TXY","HXL","LSW","JSC","ZWL");
            // 获取机器名称
            var machineName = system.machineName;
            // 检查是否为成员
            for(var i=0;i<shijuebu.length;i++){
                var worker = shijuebu[i];
                if(worker == machineName){return true;}
            }// end for
        }// end if key
    }// end if file
    //alert("After Effect error: This computer have no permission!");
    //alert("System error: please contact administrator! ");
    return false
}
//alert(checkKey())

// 获取当前选择的所有合成 ①当前激活合成②激活合成中选择的合成③项目面板选择的合成
function getSelectedComps(){
    // 初始定义选择合成的数组
    var comps = [];
    // 获取当前激活的合成，是否选择了合成层
    var activeItem = app.project.activeItem;
    if(activeItem!=null){ 
        var selectedLayers = activeItem.selectedLayers;
        if(selectedLayers.length>0){
            for(var i=0;i<selectedLayers.length;i++){
                var layer = selectedLayers[i];
                var source = layer.source;
                if(source instanceof CompItem){ comps.push(source); }
            }
        }
        if(comps.length==0){comps=[activeItem];}
    }
    else{ comps = app.project.selection;}
    
    return comps;
}
//alert(getSelectedComps().length)

//  获取当前合成
function getActiveComp(){ 
    var theComp = app.project.activeItem;
    if (theComp == undefined){
        var errorMsg = localize("$$$/AE/Script/CreatePathNulls/ErrorNoComp=Error: Please select a composition.");
        alert(errorMsg);
        return null
    }
    return theComp
}
//  获取当前合成中,选择的层放入数组
function getSelectedLayers(targetComp){ 
    var targetLayers = targetComp.selectedLayers;
    return targetLayers
}
//  循环数组内每个层，对每个层，做动作( layer )
function forEachLayer(targetLayerArray, doSomething) { 
    for (var i = 0, ii = targetLayerArray.length; i < ii; i++){
        doSomething(targetLayerArray[i]);
    }
}

function getPropPath(currentProp){ //  返回Path的路径
    var pathHierarchy = [];
    var pathPath = "";
        while (currentProp.parentProperty !== null){
            if ((currentProp.parentProperty.propertyType === PropertyType.INDEXED_GROUP)) {
                pathHierarchy.unshift(currentProp.propertyIndex);
                pathPath = ".property(" + currentProp.name + ")" + pathPath;
            } else {
                pathPath = ".property(\"" + currentProp.name + "\")" + pathPath;
            }
            // Traverse up the property tree
            currentProp = currentProp.parentProperty;
        }
    return pathPath
}

// 返回一个包含若干分组的数组，每个分组包含若干各层。按照选择层的顺序前后所连接的label相等，即为一个组。
function getGroupByLabel(targetLayers){
    var layerArrays = [];
    var lastlabel = null;
    var labelGroup = [];
    for(var i=0; i<targetLayers.length; i++){
        var layer = targetLayers[i];
        var layerLabel = layer.label;
        //alert("lastlabel:"+lastlabel + "\n" + "layerLabel:"+layerLabel)
        if(lastlabel == null){lastlabel = layerLabel;}
        if(lastlabel == layerLabel){
            //alert("添加元素")
            labelGroup.push(layer);
        }
        else{
            if(labelGroup.length>0){
                layerArrays.push(labelGroup);
                //alert("开始新租");
                labelGroup = [];
                labelGroup.push(layer);
            }// end if
            lastlabel = layerLabel;
        }// end else
    }// end for
    layerArrays.push(labelGroup);
    return layerArrays;
}
// 获取最小的起点
function getMinStartTime(layers){
    var minStartTime = 99999999999999999999;
    for(var i=0; i<layers.length; i++){ 
        var layer = layers[i];
        (minStartTime > layer.startTime) ? minStartTime = layer.startTime : minStartTime; 
    }
    return minStartTime;
}
//alert(getMinStartTime(getSelectedLayers(getActiveComp())))
// 获取最大的起点
function getMaxStartTime(layers){
    var maxStartTime=0;
    for(var i=0; i<layers.length; i++){
        var layer = layers[i];
        (maxStartTime < layer.startTime) ? maxStartTime = layer.startTime : maxStartTime; 
    }
    return maxStartTime;
}
//alert(getMaxST(getSelectedLayers(getActiveComp())))

// 获取所有组的最小起点
function getMinStartTimeFromGroup(layerGroups){
    var minStartTime = 9999999999999999;
    for(var i=0; i<layerGroups.length; i++){ 
        var layer = layerGroups[i][0];
        minStartTime = (minStartTime > layer.startTime) ? layer.startTime : minStartTime;
    }
    return minStartTime;
}
//alert(getMinStartTimeFromGroup(getGroupByLabel(getSelectedLayers(getActiveComp()))))
// 获取所有组的最小起点
function getMaxStartTimeFromGroup(layerGroups){
    var maxStartTime = -9999999999999999;
    for(var i=0; i<layerGroups.length; i++){ 
        var layer = layerGroups[i][0];
        maxStartTime = (maxStartTime < layer.startTime) ? layer.startTime : maxStartTime;
    }
    return maxStartTime;
}
//alert(getMaxStartTimeFromGroup(getGroupByLabel(getSelectedLayers(getActiveComp()))))


// ---------------------------------------------- // 数学计算 // ---------------------------------------------- // 
function sub(A,B){
    if(A.length==2){return [A[0]-B[0], A[1]-B[1]];}
    return result = [A[0]-B[0], A[1]-B[1], A[2]-B[2]];
}
function plus(A,B){
    if(A.length==2){return [A[0]+B[0], A[1]+B[1]];}
    return result = [A[0]+B[0], A[1]+B[1], A[2]+B[2]];
}
function length(vector){
    // 二位矢量和三维矢量
    if(vector.length==2) return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2] )
}
function distance(A,B){
    var vector = sub(A,B);
    // 二位矢量和三维矢量
    if(A.length==2){ return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] );}
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2] );
}
function normalize(vector){
    var len = length(vector);
    // 二位矢量和三维矢量
    if(vector.length==2) return [vector[0]/len, vector[1]/len];
    return [vector[0]/len, vector[1]/len, vector[2]/len];
}
function cross(A,B){
    // 将二维转为三维
    if(A.length==2){ A.push(0);}
    if(B.length==2){ B.push(0);}
    A=normalize(A);
    B=normalize(B);
    return [A[1]*B[2]-B[1]*A[2],A[2]*B[0]-B[2]*A[0],A[0]*B[1]-B[0]*A[1]];
}
function dot(A,B){
    // 将二维转为三维
    if(A.length==2){ A.push(0);}
    if(B.length==2){ B.push(0);}
    A=normalize(A);
    B=normalize(B);
    return A[0]*B[0]+A[1]*B[1]+A[2]*B[2];
}
// ---------------------------------------------- // 数学计算 // ---------------------------------------------- // 


// ---------------------------------------------- // 项目面板 // ---------------------------------------------- // 
function getRootFolderByName(floderName){
    // 查找根目录下
    var folders = app.project.rootFolder;
    for (var i=1;i<=folders.numItems;i++){
        var folder =folders.item(i);
        if((folder instanceof FolderItem) && (folder.name == floderName)){return folder;}
    }
    return null
}
//alert(getFolderByName("scene"))
function getCompByName(compName){
    var compFolder = getRootFolderByName("comp");
    if(compFolder==null){return null}
    
    var folderList = [compFolder];
    
    while(folderList.length!=0){
        var folder = folderList.shift();
        var numItems = folder.numItems;
        for (var i=1; i<=numItems; i++) {
            var item = folder.item(i);
            if(item instanceof FolderItem){ folderList.push(item);}
            else{ if((item instanceof CompItem) && (item.name == compName)){ return item;} }
        }
    }
    return null
}
//alert(getCompByName("C01_Comp"))
function getSceneByName(sceneName){
    var sceneFolder = getRootFolderByName("scene");
    if(sceneFolder==null){return null}
    
    var numItems = sceneFolder.numItems;
    for (var i=1; i<=numItems; i++) {
        var item = sceneFolder.item(i);
        // 获取名称需要更多的时间.所以先判断类型
        if( (item instanceof FootageItem) && (item.name.indexOf(sceneName)>-1) ) { return item;}
    }
    return null
}
//alert(getSceneByName("C01_Color"))
function getSolidByName(solidName){
    var solidsFolder = getRootFolderByName("Solids");
    if(solidsFolder==null){return null}
    
    var numItems = solidsFolder.numItems;
    for (var i=1; i<=numItems; i++) {
        var item = solidsFolder.item(i);
        // 获取名称需要更多的时间.所以先判断类型
        if((item instanceof FootageItem) && (item.name==solidName)) { return item;}
    }
    return null
}
//alert(getSolidByName("waterDispCC").name)
function getFootageByName(footageName){
    var footageFolder = getRootFolderByName("footage");
    if(footageFolder==null){return null}
    
    var numItems = footageFolder.numItems;
    for (var i=1; i<=numItems; i++) {
        var item = footageFolder.item(i);
        // 获取名称需要更多的时间.所以先判断类型
        if((item instanceof FootageItem) && (item.name==footageName)) { return item;}
    }
    return null
}
//alert(getFootageByName("fog").name)
function getItemByMatchName(matchName){ // 慎用！！！！！！！！
    for (var i=1; i<=app.project.numItems; i++){
        var item =app.project.item(i);
        var name = item.name;
        if(name.match(matchName)){ return item;}
    }
    return null
}
//getItemByMatchName(matchName)
function rootFolder(folder_name){
    var folder =  getRootFolderByName(folder_name);
    if(folder==null){ folder = app.project.items.addFolder(folder_name);}
    return folder;
}
// ---------------------------------------------- // 项目面板 // ---------------------------------------------- // 