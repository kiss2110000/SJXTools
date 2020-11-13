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
            //var shijuebu = new Array("SXR","SJX","WQR","YPZ","HL","TXY","HXL","LSW","JSC","ZWL","DESKTOP-ODB8L4K");
            var shijuebu = new Array("SJX");
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

// ---------------------------------------------- // 读取保存字符串 // ---------------------------------------------- // 
function saveTxtFile (text, filePath){
    var file = new File(filePath);
    //alert(file)
    file.open("w");
    file.write(text);
    file.close();
}
function openTxtFile(filePath){
    var file = new File(filePath);
    //alert(file)
    file.open("r");
    var text = file.read();
    file.close();
    return text;
}
function writeFile(text, filePath){
    var file = new File(filePath);
    file.open("w");
    file.write(text);
    file.close();
}
function readFile(filePath){
    var file = new File(filePath);
    file.open("r");
    var text = file.read();
    file.close();
    return text;
}
//

// 获取用户脚本文件夹路径
function getUserDataFolder(){
        var userDataFolder = Folder.userData;
        var aescriptsFolder = Folder(userDataFolder.toString() + "/Aescripts/SJX Tools/yourImg"); 
        if (!aescriptsFolder.exists) {
            var checkFolder = aescriptsFolder.create();
                    if (!checkFolder) {
                        alert ("Error creating ");
                        aescriptsFolder  = Folder.temp;
                        } }
        return aescriptsFolder.toString();
}
//

// ---------------------------------------------- // 获取当前选择的所有合成 // ---------------------------------------------- // 
// ①当前激活合成②激活合成中选择的合成③项目面板选择的合成
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

//  获取当前激活得合成
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
Property.prototype.path = function(){
    var pathHierarchy = [];
    var pathPath = "";
    var currentProp = this;
        while (currentProp.parentProperty !== null){
            if ((currentProp.parentProperty.propertyType === PropertyType.INDEXED_GROUP)) {
                pathHierarchy.unshift(currentProp.propertyIndex);
                pathPath = ".property(" + currentProp.name + ")" + pathPath;
            } else {
                pathPath = ".property(\"" + currentProp.name + "\")" + pathPath;
            }
            currentProp = currentProp.parentProperty;
        }
    return pathPath
}


// ---------------------------------------------- // 层的属性 // ---------------------------------------------- // 
{
    
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
}

Array.prototype.minStartTime = function(){
    var __tmpArr = this;
    return __tmpArr.sort(function(a,b){
        return a.startTime - b.startTime;
    })[0].startTime;
}
//alert(getSelectedLayers(getActiveComp()).minStartTime())
Array.prototype.maxStartTime = function(){
    var __tmpArr = this;
    return __tmpArr.sort(function(a,b){
        return a.startTime - b.startTime;
    })[__tmpArr.length - 1].startTime;
}
//alert(getSelectedLayers(getActiveComp()).maxStartTime())
//

// ---------------------------------------------- // 数学计算 // ---------------------------------------------- // 
{
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
}


// 

// ---------------------------------------------- // 项目面板 // ---------------------------------------------- // 
{
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
    //  按名称获取，会有重名，所以返回数组，找不到返回空数组。
    var solids = [];
    
    var solidsFolder = getRootFolderByName("Solids");
    if(solidsFolder==null){return solids}
    
    var numItems = solidsFolder.numItems;
    for (var i=1; i<=numItems; i++) {
        var item = solidsFolder.item(i);
        // 获取名称需要更多的时间.所以先判断类型
        if((item instanceof FootageItem) && (item.name==solidName)) {solids.push(item);}
    }

    return solids;
}
function getSolidItem(solidName){
    //  按名称获取，会有重名，所以返回数组，找不到返回空数组。
    var solids = [];
    
    var solidsFolder = getRootFolderByName("Solids");
    if(solidsFolder==null){return solids}
    
    var numItems = solidsFolder.numItems;
    for (var i=1; i<=numItems; i++) {
        var item = solidsFolder.item(i);
        // 获取名称需要更多的时间.所以先判断类型
        if((item instanceof FootageItem) && (item.name==solidName)) {solids.push(item);}
    }

    return solids;
}
//alert(getSolidItem("waterDispCC")[0].name)
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


function getCompItemsFromFolder(folder){
    var renderSplitComps = [];
    for(var i=1;i<=folder.numItems;i++){
        var item = folder.item(i);
        if(item instanceof CompItem) renderSplitComps.push(item);
    }
    return  renderSplitComps
}

function getCompItemByName(name){
    for(var i=1;i<=app.project.numItems;i++){
        var item = app.project.item(i);
        if(item instanceof CompItem && item.name == name){
            return item;
        }
    }
    return null;
}
function getFolderItemByName(name){
    for(var i=1;i<=app.project.numItems;i++){
        var item = app.project.item(i);
        if(item instanceof FolderItem && item.name == name){
            return item;
        }
    }
    return null;
}
//alert(getCompItemByName("*Video"))
}
//

// ---------------------------------------------- // CompItem 新方法 // ---------------------------------------------- // 
CompItem.prototype.layersUsed = function(){
    // 获取合成项的id
    var compItemID = this.id;
    // 定义使用该项的层列表
    var layers = [];
    
        //  获取所有使用这个项的合成
    var usedComps = this.usedIn;
    // 循环每个合成，查找使用这个项的层
    for(var i=0;i<usedComps.length;i++){
        var comp = usedComps[i];
        // 循环合成中的每个层
        for(var o=1;o<=comp.numLayers;o++){
            var usedLayer = comp.layer(o);
            // 获取层的源项的id 等于合成项id 则收集该层
            if((usedLayer instanceof AVLayer) && usedLayer.source.id==compItemID){
                layers.push(usedLayer);
            }
        }
    }
    return layers;
}
function getLayersUsedCompItem(compItem){
    // 获取合成项的id
    var compItemID = compItem.id;
    // 定义使用该项的层列表
    var layers = [];
    
    //  获取所有使用这个项的合成
    var usedComps = compItem.usedIn;
    // 循环每个合成，查找使用这个项的层
    for(var i=0;i<usedComps.length;i++){
        var comp = usedComps[i];
        // 循环合成中的每个层
        for(var o=1;o<=comp.numLayers;o++){
            var usedLayer = comp.layer(o);
            // 获取层的源项的id 等于合成项id 则收集该层
            if((usedLayer instanceof AVLayer) && usedLayer.source.id==compItemID){
                layers.push(usedLayer);
            }
        }
    }
    return layers;
}
//alert(getLayersUsedCompItem(app.project.activeItem))
//

// ---------------------------------------------- // Comment设置 // ---------------------------------------------- // 
function commentObject(item_or_layer){  // 获取comment 的JSON字符串，转换为json对象。
    var comment = item_or_layer.comment;
    // 检查comment字符串，如果未初始化，则设置未JSON字符串格式
    if(comment =="") comment = "{}";
    // 解析现有的属性
    var cmmt = JSON.parse(comment);
    return cmmt;
}
function getCommentProps(item_or_layer,prop_Name){  // 获取comment 对象的中的属性。
    // 获取Comment的对象
    var cmmt = commentObject(item_or_layer);
    // 再获取属性
    var property = cmmt[prop_Name];
    return property;
}
function addCommentProps(item_or_layer,property_object, property_name){ // 将属性添加到comment对象中。
    // 获取Comment的对象
    var cmmt = commentObject(item_or_layer);
    // 添加属性到JSON中：
    cmmt[property_name] = property_object;
    
    //保存Comment的对象
    item_or_layer.comment = JSON.stringify(cmmt);
}
function deleteCommentProps(item_or_layer,prop_Name){  // 删除comment 对象中的属性。
    // 获取Comment的对象
    var cmmt = commentObject(item_or_layer);
    //删除属性
    delete cmmt[prop_Name];
    //保存Comment的对象
    var content = JSON.stringify(cmmt);
    if(content=="{}"){
        item_or_layer.comment = "";
    }
    else{
        item_or_layer.comment = JSON.stringify(cmmt);
    }
}
{
//~ var proxyObj = 
//~ {
//~     "proxyType" : "Proxy",
//~     "proxyFilePath" : "/C/Users/Administrator/Desktop",
//~     "proxyFileType" : "video",
//~ }
//~ addCommentProps(app.project.activeItem,proxyObj,"proxy");
//alert(getCommentProps(app.project.activeItem,"proxy"));
//~ deleteCommentProps(app.project.activeItem,"proxy");
//addCommentProps(app.project.activeItem.selectedLayers[0], {"proxyType":"Proxy","label":app.project.activeItem.selectedLayers[0].label},"proxy");
//alert(getCommentProps(app.project.activeItem.selectedLayers[0],"proxy").label);
}
// 

// ---------------------------------------------- // Mask 创建 // ---------------------------------------------- // 
function createEllipseMask(layer){
    var width = layer.width;
    var height = layer.height;
    
    // 建立一个基于1x1的圆，进行缩放
    var ellipseMask=layer.mask.addProperty("ADBE Mask Atom");
    var ellipse = new Shape();
    ellipse.vertices = [[0.5*width,0],[0,0.5*height],[0.5*width,1*height],[1*width,0.5*height]];
    ellipse.inTangents = [[0.276142425537109*width,0],[0,-0.276142425537109*height],[-0.276142425537109*width,0],[0,0.276142425537109*height]];
    ellipse.outTangents = [[-0.276142425537109*width,0],[0,0.276142425537109*height],[0.276142425537109*width,0],[0,-0.276142425537109*height]];
    ellipse.closed = true;
    ellipseMask.maskShape.setValue(ellipse);
    return ellipseMask;
}
//

// ---------------------------------------------- // 数组 设置 // ---------------------------------------------- // 
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
Array.prototype.min = function() {
    var __tmpArr = this;
    return __tmpArr.sort(function(a, b) {
        return a - b;
    })[0];
};
Array.prototype.max = function() {
    var __tmpArr = this;
    return __tmpArr.sort(function(a, b) {
        return a - b;
    })[__tmpArr.length - 1];
};
Array.prototype.equals = function(array) {
    if (!array) {
        return false;
    }
    if (this.length != array.length) {
        return false;
    }
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i])) {
                return false;
            }
        } else {
            if (this[i] != array[i]) {
                return false;
            }
        }
    }
    return true;
};
Array.prototype.indexOf = function(elemt){
    for(var i=0;i<this.length;i++){
        if(this[i]==elemt){return i;}
    }
    return -1;
}
Array.prototype.pushUnique= function(elemt){
    if(this.length==0){
        this.push(elemt);
        return true;
    }
    for(var i=0; i<this.length; i++){
        if(this[i]==elemt){
            return false;
        }
        else{
            this.push(elemt);
            return true;
        }
    }
}

