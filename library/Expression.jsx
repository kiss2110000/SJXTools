// 删除位置表达式
function deletePosExp(){
     app.beginUndoGroup("删除路径表达式");
    var selectLayers = getSelectedLayers(getActiveComp());
    if (selectLayers.length>0){
            forEachLayer(selectLayers, function(selcetLayer){
                                                        var currterProprety = selcetLayer.property("Transform").property("Position");
                                                        var temp = currterProprety.value;
                                                        currterProprety.expression="";
                                                        currterProprety.setValue(temp);
                                                    }) 
    }else{alert("请选择至少一个层")}
    app.endUndoGroup();
}
//deletePosExp()
// 删除旋转表达式
function deleteRotExp(){
    app.beginUndoGroup("删除旋转表达式");
    
    var selectLayers = getSelectedLayers(getActiveComp());
    if (selectLayers.length==0)
    {
            alert("请选择至少一个层");
            return
    }

    for(var i=0; i<selectLayers.length;i++){
        var layer = selectLayers[i];
        
        var curOr = layer.property("Transform").property("Orientation").value;
        var curXR = layer.property("Transform").property("X Rotation").value;
        var curYR = layer.property("Transform").property("Y Rotation").value;
        var curZR = layer.property("Transform").property("Z Rotation").value;

        layer.property("Transform").property("Orientation").expression="";
        layer.property("Transform").property("X Rotation").expression="";
        layer.property("Transform").property("Y Rotation").expression="";
        layer.property("Transform").property("Z Rotation").expression="";
        
        layer.property("Transform").property("Orientation").setValue(curOr);
        layer.property("Transform").property("X Rotation").setValue(curXR);
        layer.property("Transform").property("Y Rotation").setValue(curYR);
        layer.property("Transform").property("Z Rotation").setValue(curZR);
   }

    app.endUndoGroup();
}
//deleteRotExp()
function deleteScaleExp(){
    app.beginUndoGroup("deleteScaleExp");
    
    var selectLayers = getSelectedLayers(getActiveComp());
    if (selectLayers.length==0)
    {
            alert("请选择至少一个层");
            return
    }

    for(var i=0; i<selectLayers.length;i++){
        var layer = selectLayers[i];
        
        var curScale = layer.transform.scale.value;
        layer.transform.scale.expression="";
        layer.transform.scale.setValue(curScale);
   }

    app.endUndoGroup();
}
//deleteScaleExp()