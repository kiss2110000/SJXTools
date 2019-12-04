/*
        KeyframeEditer Tools  v1.0.0
 
        更新内容：
            1、
            2、
        
        更新时间：2019.05.28 08:12
        ---------------------------------------------------------------------
*/

var dirPath = File($.fileName).path;
$.evalFile(dirPath + "/" + "CommonFunction.jsxbin");
/*************** Global variable ****************/
var globalPropsObject; // 数组列表。属性：prop、keyTimes、keyIndexs

/*************** Main functions ****************/

// 选择关键帧
function indexOf(array,value){
    var index = -1;
    for(var x=0; x<array.length; x++){
        if (value==array[x]){
            index = x;
            break;
        }
    }
    return index;
}
function selecteKeyOfProperty(prop,arrayIndex){
    //alert(prop.name)
    var keys = prop.selectedKeys;
    var numkey = keys.length;
    //alert(keys)
    for(var u=1; u<=keys.length; u++){
        if(indexOf(arrayIndex,u)>-1) {continue;}
        else{ prop.setSelectedAtKey(u, 0);}
    }
}
function selecteKeyOfSelectedByNum(arrayIndex){
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    var numlayer = layers.length;
    
    app.beginUndoGroup("selecteKeyOfSelectedByNum")
    //alert(numlayer);
    for(var i=0; i<numlayer; i++){
        var layer = layers[i];
        //alert(layer.name)
        var props = layer.selectedProperties;
        for(var o=0; o<props.length; o++){
            var prop = props[o];
            
            if (prop.propertyType === PropertyType.PROPERTY)			// Found a property
            {
                if (prop.matchName === "ADBE Marker")				// Skip markers; they're processed separately
                    continue;
                if (!prop.isTimeVarying)							// Skip properties that aren't keyframed
                    continue;

                //alert(prop.name)
                
                selecteKeyOfProperty(prop,arrayIndex)
            }
        }
    }
    app.endUndoGroup();
}
//selecteKeyOfSelectedByNum([2,3])
function selecteKeysByIndexArray(prop,indexArray){
    //alert(prop.name)
    var numkey = prop.numKeys;
    for(var i=1; i<=numkey; i++){
        if(indexOf(indexArray,i)>-1) {prop.setSelectedAtKey(i, 1);}
        else{ prop.setSelectedAtKey(i, 0);}
    }
}
//selecteKeysByIndexArray(app.project.activeItem.selectedLayers[0]("Transform")("Opacity"),[2,5,6])
function stringToInt(stringValue){
    // " " 表示分割不同索引值，"2 5 8 10" 索引值为： 2 5 8 10
    // "-" 表示连续的索引值，"2-6 9-11" 索引值为： 2 5 6 9 10 11
    // ":" 表示间隔选择索引值，"4:4" 索引值为：1 2 3 4 9 10 11 12 17 18 19 20 ... ...
    // ":::" 表示间隔选择索引值，"3:4:4:25" 索引值为：3 4 5 6 11 12 13 14 19 20 21 22 
    var indexs = new Array;
    var value, result, start, end, step ;
    
    var notNumber=/\D/;
    
    var strings = stringValue.split(" ");
    var numStr = strings.length;
    for(var i=0; i<numStr; i++){
        var str = strings[i];
        //alert(str)
        //alert(str.indexOf("-"))
        // 分类开始
        if(str.indexOf("-")>-1){                 // "-" 表示连续的索引值，"2-6 9-11" 索引值为： 2 5 6 9 10 11
            //$.writeln(" '-' 表示连续的索引值");
            var startEnd = str.split("-");
            // 排除错误
            if(startEnd.length!=2){
                alert("格式错误：" + str + "\n例如：2-9")
                return
            }
        
            start = startEnd[0];
            end = startEnd[1];

            result=notNumber.exec(start);
            if(result!=null){
                alert("非法字符："+result[0]);
                return 
            }
            result=notNumber.exec(end);
            if(result!=null){
                alert("非法字符："+result[0]);
                return 
            }
            if(start.length==0 || end.length==0){
                alert("非法起始点："+start + "-" + end);
                return 
            }
        
            start = parseInt(start);
            end = parseInt(end);
            //alert(start)
            //alert(end)
            
            // 计算index
            for(var o=start; o<=end; o++){ indexs.push(o);}
        }
        else if(str.indexOf(":")>-1){          // ":" 表示间隔选择索引值，"4:4" 索引值为：1 2 3 4 9 10 11 12 17 18 19 20 ... ...
            //$.writeln(" ':' 表示间隔选择索引值");
            var startEnd = str.split(":");
            //alert(startEnd.length)
            // 排除错误
            if((startEnd.length!=2)&&(startEnd.length!=4)){
                alert("格式错误：" + str + "\n例如：4:4 或 3:4:4:20");
                return
            }
            if(startEnd.length==4){
                for(var o=0; o<4; o++){
                    var temp = startEnd[o];
                    result=notNumber.exec(temp);
                    if(result!=null){
                        alert("非法字符："+result[0]);
                        return 
                    }
                }
            
                start = parseInt(startEnd[0]);
                select = parseInt(startEnd[1]);
                step = parseInt(startEnd[2]);
                end = parseInt(startEnd[3]);
            
                //alert(start)
                //alert(end)
                
                // 计算index
                var count = 0;
                for(var u=start; u<=end; u++){ 
                    if(count==select){
                        count=0;
                        u+=step-1;
                        continue;
                    }
                    indexs.push(u);
                    count++;
                }
            }
        }
        else{                                              // " " 表示分割不同索引值，"2 5 8 10" 索引值为： 2 5 8 10
            //$.writeln(" ' ' 表示分割不同索引值");
            result=notNumber.exec(str);
            if(result!=null){
                alert("非法字符："+result[0]);
                return 
            }
            value = parseInt(str)

            indexs.push(value);
        }
    }
    //alert(indexs)
    return indexs
}
//stringToInt("2:4:2:20")


function selecteKeysByString(stringValue){
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    var numlayer = layers.length;
    
    var indexs = stringToInt(stringValue)
    
    app.beginUndoGroup("selecteKeyOfSelectedByNum")
    //alert(numlayer);
    for(var i=0; i<numlayer; i++){
        var layer = layers[i];
        //alert(layer.name)
        var props = layer.selectedProperties;
        for(var o=0; o<props.length; o++){
            var prop = props[o];
            
            if (prop.propertyType === PropertyType.PROPERTY)			// Found a property
            {
                if (prop.matchName === "ADBE Marker")				// Skip markers; they're processed separately
                    continue;
                if (!prop.isTimeVarying)							// Skip properties that aren't keyframed
                    continue;

                //alert(prop.name)
                selecteKeysByIndexArray(prop,indexs)
            }
        }
    }
    app.endUndoGroup();
}
//selecteKeysByString("1:2:2:100")


function getStringPathOfProperty(prop){
    var codePath="";
    
    while(!(prop instanceof AVLayer) ){
        var propName = prop.name;
        codePath = '.property("' + propName +'")' + codePath;
        
        var parentProp = prop.parentProperty;
        prop = parentProp;
        }
    return codePath
}
//alert(getStringPathOfProperty(prop))
function getStingPathOfLayerAndProperty(layer,prop){
    function rd_GimmePropPath_findCompItemNum(comp){
        var itemNum = 0, item;
        
        for (var i=1; i<=app.project.numItems; i++){
            item = app.project.item(i);
            if ((item instanceof CompItem) && (item === comp)){
                itemNum = i;
                break;
            }
        }
        return itemNum;
    }
    var compIndex = rd_GimmePropPath_findCompItemNum( app.project.activeItem)
    
    var codePath = getStringPathOfProperty(prop);
    var code = "app.project.item("+compIndex+").layer("+layer.index+")"+codePath;
    return code;
}
//alert(getStingPathOfLayerAndProperty(layer,prop))
function getStingPathOfMergeLayerAndStringProperty(layer,stringProp){
    function rd_GimmePropPath_findCompItemNum(comp){
        var itemNum = 0, item;
        
        for (var i=1; i<=app.project.numItems; i++){
            item = app.project.item(i);
            if ((item instanceof CompItem) && (item === comp)){
                itemNum = i;
                break;
            }
        }
        return itemNum;
    }
    var compIndex = rd_GimmePropPath_findCompItemNum( app.project.activeItem)
    
    var code = "app.project.item("+compIndex+").layer("+layer.index+")"+stringProp;
    return code;
}
//alert(getStingPathOfMergeLayerAndStringProperty(layer, getStringPathOfProperty(prop)))
// 设置关键帧.   将选择层的选择属性，按照范围平均的
function SetAttributeKey(start,end){
    app.beginUndoGroup("设置属性关键帧范围"); 
    
    var comp = getActiveComp();
    var layers = comp.selectedLayers;
    var numLayers = layers.length;
    
    // 获取选择的属性,仅仅选择第一个
    var propStringPath = null;
    for (var i=0; i<numLayers; i++){
        var layer = layers[i];
        var props = layer.selectedProperties;
        if(props.length>0){
            prop = props[0];
            propStringPath = getStringPathOfProperty(prop);
            break;
        }// end if
    }//end for
    
    if (propStringPath==null){
            alert("请再选择一个属性！");
            return
    }
    
    var duration = end-start;
    var angle = duration/(numLayers-1);
    var time = comp.time;

    for (var i = 0; i < numLayers; i++){
        var layer = layers[i];
        value = start+angle*i;
        var setString = ".setValueAtTime("+time+","+value+");";
        //alert(setString)
        var layerPropStringPath = getStingPathOfMergeLayerAndStringProperty(layer, propStringPath);
        //alert(layerPropStringPath)
        var code = layerPropStringPath + setString;
        writeLn(code);
        // 执行
        try{
            eval(code);
        }
        catch(e){
            alert(e)
            return
        }// end try
    }// end for
    
    app.endUndoGroup();
}
//SetAttributeKey(75,-75)


// 选择属性
// 选择属性
function getSelectedProps(){
    var props = new Array();
    var prop;
    
    // Iterate over the specified property group's properties
    var selProps = layer.selectedProperties;
    for (var i=0; i<selProps.length; i++)
    {
        prop = selProps[i];
        if (prop.propertyType === PropertyType.PROPERTY)			// Found a property
        {
            props.push(prop);
        }
    }
    return props;
}
function selectePropertyBySelected(addSelected){
    // 选择属性，双击SS键，仅显示选择的属性
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    var numlayer = layers.length;
    
    app.beginUndoGroup("selectePropertyOfSelectedLayers")
    // 获取选择的所有属性
    var stringProps = new Array;
    for(var i=0; i<numlayer; i++){
        var layer = layers[i];
        var selProps = getSelectedProps(layer);
        for(var o=0;o<selProps.length;o++){
            var prop = selProps[o];
            var stringProp = getStringPathOfProperty(prop);
            if(indexOf(stringProps,stringProp)==-1){ stringProps.push(stringProp);}
        }
    }
    var numProps = stringProps.length;
    if(numProps==0){
        alert("没有选择属性！")
        return
    }
    //alert(stringProps)
    
    // 选择属性
    for(var i=0; i<numlayer; i++){
        var layer = layers[i];
        for(var o=0;o<numProps;o++){
            var stringProp = stringProps[o]; 
            var stringLayerProp = getStingPathOfMergeLayerAndStringProperty(layer, stringProp);
            var code = stringLayerProp+".selected=1;" 
            eval(code);
        }
    }
    
    comp.openInViewer();
    app.endUndoGroup();
}
//selectePropertyBySelected()
function selectePropertyFromPropGroup(propGroup, prop,addSelected){
    var numProps = propGroup.numProperties;
     for(var o=1; o<=numProps; o++){
        var newpropGroup = propGroup.property(o);
        if(newpropGroup.propertyType == PropertyType.PROPERTY ){        // is property
            if (newpropGroup.matchName === "ADBE Marker")				// Skip markers; they're processed separately
                continue;
//~             if (!newpropGroup.isTimeVarying)							// Skip properties that aren't keyframed
//~                 continue;
            if (!newpropGroup.canSetExpression){							// Skip properties that hidden
                continue;
            }
            //alert(newpropGroup.name)
            if(addSelected){ // 加选已选择的属性
                if(newpropGroup.name == prop) {
                    try{newpropGroup.selected=1;}
                    catch(err){}
                    // 选择了需要的属性就停止查找
                    return true;
                }
            }
            else{ // 取消已选择的属性，循环遍历所有属性！！！！不能找到就停止
                if(newpropGroup.name == prop) { 
                    try{newpropGroup.selected=1;}
                    catch(err){}
                    }
                else{
                    try{newpropGroup.selected=0;}
                    catch(err){}
                }
            }
        }
        else if( newpropGroup.propertyType == PropertyType.INDEXED_GROUP ){        // is property index group (such Mask, Effect)
            selectePropertyFromPropGroup(newpropGroup, prop, addSelected);
        }
        else if( newpropGroup.propertyType == PropertyType.NAMED_GROUP ){        // is property name group (such Transform)
            selectePropertyFromPropGroup(newpropGroup, prop, addSelected);
        }
    }
    
}
function selectePropertyByName(prop,addSelected){
    // 选择属性，双击SS键，仅显示选择的属性
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    var numlayer = layers.length;
    
    app.beginUndoGroup("selectePropertyOfSelectedLayers")
    for(var i=0; i<numlayer; i++){
        var layer = layers[i];
        
        selectePropertyFromPropGroup(layer, prop,addSelected);
    }
    comp.openInViewer();
    app.endUndoGroup();
}
//selectePropertyByName("Opacity",true)
function selectePropertyIXYC(propName,addSelected){
    // 选择属性，双击SS键，仅显示选择的属性
    // Intensity, Y Rotation, X Rotation, X Rotation
    var comp = app.project.activeItem;
    var layers = comp.selectedLayers;
    var numlayer = layers.length;
    //alert(numlayer);
    var properties = ["Y Rotation","X Rotation", "Intensity", "Color"]
    
    app.beginUndoGroup("selectePropertyOfSelectedLayers")

    for(var i=0; i<numlayer; i++){
        var layer = layers[i];
        // 取消已选择的属性
        if(!addSelected){
            var selprops = layer.selectedProperties;
            for(var o=0;o<selprops.length;o++){
                var prop = selprops[o];
                prop.selected=false;
                //alert(prop.name)
            }
        }
        // 选择属性
        var index = indexOf (properties, propName);
        //alert(propName)
        if(index>-1){
            if(index==0){layer("Transform")("Y Rotation").selected=true;}
            if(index==1){layer("Transform")("X Rotation").selected=true;}
            if(index==2){
                if(layer instanceof LightLayer){layer("Light Options")("Intensity").selected=true;}
                else{layer("Transform")("Opacity").selected=true;}
            }
            if(index==3){
                if(layer instanceof LightLayer){layer("Light Options")("Color").selected=true;}
                else{layer("Effects")("Fill")("Color").selected=true;}
                }
        }
    }
    // 使合成面板处于当前活动面板
    comp.openInViewer();
    
    app.endUndoGroup();
}
//selectePropertyIXYC("Y Rotation",false)

// 偏移关键帧
function getSelectedPropKeys(layer){
    var props = new Array();
    var prop, propInfo;
    
    // Iterate over the specified property group's properties
    var selProps = layer.selectedProperties;
    for (var i=0; i<selProps.length; i++)
    {
        prop = selProps[i];
        if (prop.propertyType === PropertyType.PROPERTY)			// Found a property
        {
            if (prop.matchName === "ADBE Marker")				// Skip markers; they're processed separately
                continue;
            if (!prop.isTimeVarying)							// Skip properties that aren't keyframed
                continue;
            
            propInfo = new Object;
            propInfo.prop = prop;
            propInfo.keyTimes = new Array();
            
            for (var j=1; j<=prop.numKeys; j++)
                if (prop.keySelected(j))
                    propInfo.keyTimes[propInfo.keyTimes.length] = prop.keyTime(j);
            
            // If there were keys to save, add the property and its keys to the props array
            if (propInfo.keyTimes.length > 0)
                props[props.length] = propInfo;
        }
        else if (prop.propertyType === PropertyType.INDEXED_GROUP)	// Found an indexed group, so check its nested properties
            props = props.concat(getSelectedPropKeys2(prop));
        else if (prop.propertyType === PropertyType.NAMED_GROUP)	// Found a named group, so check its nested properties
            props = props.concat(getSelectedPropKeys2(prop));
    }
    
    return props;
}
function getSelectedPropKeys2(layer){
    var props = new Array();
    var prop, propInfo;
    
    // Iterate over the specified property group's properties
    var selProps = layer.selectedProperties;
    for (var i=0; i<selProps.length; i++)
    {
        prop = selProps[i];
        if (prop.propertyType === PropertyType.PROPERTY)			// Found a property
        {
            if (prop.matchName === "ADBE Marker")				// Skip markers; they're processed separately
                continue;
            if (!prop.isTimeVarying)							// Skip properties that aren't keyframed
                continue;
            
            propInfo = new Object;
            propInfo.prop = prop;
            propInfo.keyTimes = new Array();
            var selKeys = prop.selectedKeys;
            var selKeynum = selKeys.length;
            
             // If there were keys to save, add the property and its keys to the props array
            if (selKeynum > 0){
                // 添加关键帧时间到信息数组
                for (var j=0; j<selKeynum; j++){
                    var keyIndex = selKeys[j];
                    propInfo.keyTimes[propInfo.keyTimes.length] = prop.keyTime(keyIndex);
                }
                // 将信息添加属性列表
                props[props.length] = propInfo;
            }
        }
    }
    return props;
}
function shiftKeyToNewTime(prop, keyToCopy, offset, keyToRemove){
    if(offset==0) return keyToCopy
    // Remember the key's settings before creating the new setting, just in case creating the new key affects keyToCopy's settings
    var inInterp = prop.keyInInterpolationType(keyToCopy);
    var outInterp = prop.keyOutInterpolationType(keyToCopy);
    var keyToCopyValue = prop.keyValue(keyToCopy);
    var keyToCopyTime = prop.keyTime(keyToCopy); 
    
    if ((inInterp === KeyframeInterpolationType.BEZIER) && (outInterp === KeyframeInterpolationType.BEZIER))
    {
        var tempAutoBezier = prop.keyTemporalAutoBezier(keyToCopy);
        var tempContBezier = prop.keyTemporalContinuous(keyToCopy);
    }
    if (outInterp !== KeyframeInterpolationType.HOLD)
    {
        var inTempEase = prop.keyInTemporalEase(keyToCopy);
        var outTempEase = prop.keyOutTemporalEase(keyToCopy);
    }
    if ((prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL))
    {
        var spatAutoBezier = prop.keySpatialAutoBezier(keyToCopy);
        var spatContBezier = prop.keySpatialContinuous(keyToCopy);
        var inSpatTangent = prop.keyInSpatialTangent(keyToCopy);
        var outSpatTangent = prop.keyOutSpatialTangent(keyToCopy);
        var roving = prop.keyRoving(keyToCopy);
    }
    // Remove the old keyframe
    //alert(keyToRemove)
    prop.removeKey(keyToRemove);
        
    // Create the new keyframe
    var newTime = keyToCopyTime + offset;
    var newKeyIndex = prop.addKey(newTime);
    prop.setValueAtKey(newKeyIndex, keyToCopyValue);
    
    if (outInterp !== KeyframeInterpolationType.HOLD)
    {
        prop.setTemporalEaseAtKey(newKeyIndex, inTempEase, outTempEase);
    }

    // Copy over the keyframe settings
    prop.setInterpolationTypeAtKey(newKeyIndex, inInterp, outInterp);
    
    if ((inInterp === KeyframeInterpolationType.BEZIER) && (outInterp === KeyframeInterpolationType.BEZIER) && tempContBezier)
    {
        prop.setTemporalContinuousAtKey(newKeyIndex, tempContBezier);
        prop.setTemporalAutoBezierAtKey(newKeyIndex, tempAutoBezier);		// Implies Continuous, so do after it
    }

    if ((prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) || (prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL))
    {
        prop.setSpatialContinuousAtKey(newKeyIndex, spatContBezier);
        prop.setSpatialAutoBezierAtKey(newKeyIndex, spatAutoBezier);		// Implies Continuous, so do after it
        prop.setSpatialTangentsAtKey(newKeyIndex, inSpatTangent, outSpatTangent);
        prop.setRovingAtKey(newKeyIndex, roving);
    }
        return newKeyIndex;
}
function moveKeysOnProperty(propInfo,offset){
    var prop, propKeyTimes, keyIndex;
    
    // 返回属性和新关键帧的索引值
    propInfo.keyIndexs = new Array();
    
    // 读取属性和关键帧时间
    prop = propInfo.prop;
    propKeyTimes = propInfo.keyTimes;
    
    // Loop through the property's keyframes in the direction such that new
    // keyframes will not affect the indices of existing keyframes
    if (offset > 0){
        for (var j=propKeyTimes.length-1; j>=0; j--){
            keyIndex = prop.nearestKeyIndex(propKeyTimes[j]);
            //alert(layer.name)
            var newIndex = shiftKeyToNewTime(prop, keyIndex, offset, keyIndex);
            propInfo.keyTimes[j] = prop.keyTime(newIndex);
            propInfo.keyIndexs[j] = newIndex;
        }
    }
    else{
        for (var j=0; j<propKeyTimes.length; j++){
            keyIndex = prop.nearestKeyIndex(propKeyTimes[j]);
            //alert(layer.name)
            var newIndex = shiftKeyToNewTime(prop, keyIndex, offset, keyIndex);
            propInfo.keyTimes[j] = prop.keyTime(newIndex);
            propInfo.keyIndexs[j] = newIndex;
        }
    }
    // 将添加新关键帧的
    return propInfo;
}
function moveKeyOnProperties2(propInfos,offset){
    var prop, propKeyTimes, keyIndex;
    var propNewInfos = new Array;
    
    for (var i=0; i<propInfos.length; i++){
        var propInfo = propInfos[i];
        var propNewInfo = moveKeysOnProperty(propInfo,offset);
        propNewInfos.push(propNewInfo)
    }
    return propNewInfos;
}
/*
//~ function moveKeyOnProperties(props,offset){
//~     var prop, propKeyTimes, keyIndex;
//~     var propKeyIndexs = new Array;
//~     
//~     for (var i=0; i<props.length; i++){
//~         prop = props[i].prop;
//~         propKeyTimes = props[i].keyTimes;
//~         
//~         propInfo = new Object;
//~         propInfo.prop = prop;
//~         propInfo.keyIndexs = new Array();
//~         // Loop through the property's keyframes in the direction such that new
//~         // keyframes will not affect the indices of existing keyframes
//~         if (offset > 0){
//~             for (var j=propKeyTimes.length-1; j>=0; j--){
//~                 keyIndex = prop.nearestKeyIndex(propKeyTimes[j]);
//~                 //alert(layer.name)
//~                 var newIndex = shiftKeyToNewTime(prop, keyIndex, offset, keyIndex);
//~                 propInfo.keyIndexs.push(newIndex);
//~             }
//~         }
//~         else{
//~             for (var j=0; j<propKeyTimes.length; j++){
//~                 keyIndex = prop.nearestKeyIndex(propKeyTimes[j]);
//~                 //alert(layer.name)
//~                 var newIndex = shiftKeyToNewTime(prop, keyIndex, offset, keyIndex+1);
//~                 propInfo.keyIndexs.push(newIndex);
//~             }
//~         }
//~         propKeyIndexs.push(propInfo)
//~     }
//~     return propKeyIndexs
//~ }
//~ */ 
function moveSelectedKeysToCurrent(){
    app.beginUndoGroup("moveSelectedKeysToCurrent")
    
    var comp = app.project.activeItem;
    var sellayers = comp.selectedLayers;
    var currentTime = comp.time;
    
    // 储存要移动的属性
    var layers = new Array();
    for(var i=0; i< sellayers.length; i++){
        var layer = sellayers[i];
        //alert(layer.name)
        var props = getSelectedPropKeys2(layer);
        layers.push(props);
    }

    // 移动关键帧,储存新的索引值
    var newProps = new Array;
    for(var i=0; i< layers.length; i++){
        var props = layers[i];
        for(var o=0; o< props.length; o++){
            var prop = props[o];
            //alert(prop.prop.name)
            var firstTime = prop.keyTimes[0];
            var time = currentTime - firstTime;
            
            var newProp = moveKeysOnProperty(prop, time);
            //alert(newProp.prop.name)
            newProps.push(newProp);
        }
    }

    //alert(newProps.length)
    // 重新选择关键帧
    for(var i=0; i<newProps.length; i++){
        var prop = newProps[i].prop;
        var keyIndexs = newProps[i].keyIndexs;
        
        for(var u=0; u<keyIndexs.length;u++){
            var index = keyIndexs[u];
            prop.setSelectedAtKey(index, true);
        }
    }
    app.endUndoGroup();
}
//moveSelectedKeysToCurrent()
function offsetSelectedKeys(frame){
    app.beginUndoGroup("moveSelectedKeys")
    
    var comp = app.project.activeItem;
    var sellayers = comp.selectedLayers;
    
    // 储存要移动的属性
    var layers = new Array();
    for(var i=0; i< sellayers.length; i++){
        var layer = sellayers[i];
        //alert(layer.name)
        var props = getSelectedPropKeys2(layer);
        layers.push(props);
    }

    // 移动关键帧,储存新的索引值
    var layerpropkeys = new Array;
    for(var i=0; i< sellayers.length; i++){
        var props = layers[i];
        var time = frame * comp.frameDuration * i;
        var propkeyIndexs = moveKeyOnProperties2(props, time);
        //alert(propkeyIndexs.keyIndexs)
        layerpropkeys.push(propkeyIndexs);
    }
    globalPropsObject = layerpropkeys;
    // 重新选择关键帧
//~     for(var i=0; i<layerpropkeys.length; i++){
//~         var propkeyIndexs = layerpropkeys[i];
//~         for(var o=0; o<propkeyIndexs.length; o++){
//~             var prop = propkeyIndexs[o].prop;
//~             var keyIndexs = propkeyIndexs[o].keyIndexs;
//~             //alert(keyIndexs)
//~             for(var u=0; u<keyIndexs.length;u++){
//~                 var index = keyIndexs[u];
//~                 //prop.setSelectedAtKey(index, true);
//~             }
//~         }
//~     }
    app.endUndoGroup();
}
//offsetSelectedKeys(3)

function selecteKeysByGlobalProps(){
    app.beginUndoGroup("selecteKeysByGlobalProps")
    var  layerpropkeys = globalPropsObject;
    // 重新选择关键帧
    for(var i=0; i<layerpropkeys.length; i++){
        var propkeyIndexs = layerpropkeys[i];
        for(var o=0; o<propkeyIndexs.length; o++){
            var prop = propkeyIndexs[o].prop;
            var keyIndexs = propkeyIndexs[o].keyIndexs;
            //alert(keyIndexs)
            for(var u=0; u<keyIndexs.length;u++){
                var index = keyIndexs[u];
                prop.setSelectedAtKey(index, true);
            }
        }
    }
    app.endUndoGroup();
}
//selecteKeysByGlobalProps()
function randomMoveSelectedKeys(frame){
    app.beginUndoGroup("moveSelectedKeys")
    
    var comp = app.project.activeItem;
    var selectLayers = comp.selectedLayers;
    var numLayers =selectLayers.length;
    
    //var newLayers = selectLayers
    // 随机选择的顺序
    var newLayers=new Array();
    while(true){
        var index = Math.floor(Math.random()*(selectLayers.length));
        newLayers.push(selectLayers[index]);
        selectLayers.splice(index,1);
        if(selectLayers.length==0){break}
    }
    
    // 预先设置极小和极大值
    var minTime = 99999999999999999999;
    var maxTime = -99999999999999999999;
    
    // 储存要移动的属性
    var layers = new Array();
    var firstTimes = new Array();
    for(var i=0; i< numLayers; i++){
        var layer = newLayers[i];
        //alert(layer.name)
        var props = getSelectedPropKeys2(layer);
        layers.push(props);
        
        // 计算最小时间，最大时间
        var firsttime =99999999999999999999;
        for(var o=0; o<props.length;o++){
            var propFirstTime = props[o].keyTimes[0];
            ( firsttime  > propFirstTime) ?  firsttime = propFirstTime :  firsttime; 
            (minTime  > propFirstTime) ? minTime = propFirstTime : minTime; 
            (maxTime < propFirstTime) ? maxTime = propFirstTime : maxTime; 
        }
        firstTimes.push(firsttime)
    }
    var eachTime = (maxTime-minTime)/(numLayers-1);
    //alert("最小时间：" + minTime + "\n最大时间：" + maxTime + "\n间隔：" +eachTime)
    
    // 移动关键帧
    var layerpropkeys = new Array;
    for(var i=0; i< newLayers.length; i++){
        var props = layers[i];
        var firstTime = firstTimes[i];
        var time = eachTime*i - (firstTime-minTime);
        //alert("移动时间："+time + "第一帧："+firstTime)
        //moveKeyOnProperties(props, time);
         var propkeyIndexs = moveKeyOnProperties2(props, time);
        //alert(propkeyIndexs.keyIndexs)
        layerpropkeys.push(propkeyIndexs);
    }
     globalPropsObject = layerpropkeys;
        // 重新选择关键帧
//~     for(var i=0; i<layerpropkeys.length; i++){
//~         var propkeyIndexs = layerpropkeys[i];
//~         for(var o=0; o<propkeyIndexs.length; o++){
//~             var prop = propkeyIndexs[o].prop;
//~             var keyIndexs = propkeyIndexs[o].keyIndexs;
//~             //alert(keyIndexs)
//~             for(var u=0; u<keyIndexs.length;u++){
//~                 var index = keyIndexs[u];
//~                 prop.setSelectedAtKey(index, true);
//~             }
//~         }
//~     }
    app.endUndoGroup();
}
//randomMoveSelectedKeys()
//alert(globalPropsObject);





