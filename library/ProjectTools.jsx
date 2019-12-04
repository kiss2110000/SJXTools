function openExplorer(){
    // 获取项目的根目录
    var projectPath;
    
    // 检查文件的保存目录
    var fileObj = app.project.file;
    if(fileObj == null){ 
        alert("文件还未保存！")
        return 
    }
    var filePath = app.project.file.path;

    // 检查 serverProject.txt  文件否存在
    var serverProjectPath = filePath + "/serverProject.txt";
    var serverProjectFile = new File(serverProjectPath);
    // 不存在，则创建 serverProject.txt  文件，保存服务器的路径,   存在，获取服务器路径
    if (serverProjectFile.exists === false) {
        var projectFolder = Folder("P:/temp").selectDlg("选择项目文件夹根目录")
        if (projectFolder == null) return
        var projectPath = projectFolder.absoluteURI;

        serverProjectFile.open("w");
        serverProjectFile.write(projectPath);
        serverProjectFile.close();
    }
    serverProjectFile.open("r");
    projectPath = serverProjectFile.read();
    serverProjectFile.close();
    
    //alert(projectPath)
    
    // 创建下拉列表，包括 preview、fountain、renderoutput、43_Render_Output、21_平面图、22_效果图、12-Final_Music、11_素材，打开文件夹
    var  folderPaths  = {"拍屏":"30_3d/previews",
                            "喷泉":"30_3d/renderoutput/Fountain",
                            "场景":"30_3d/renderoutput/Scene",
                            "本地视频输出":"Output",
                            "项目视频输出":"40_comp/43_Render_Output",
                            "平面图":"20_2d/21_平面图",
                            "效果图":"20_2d/22_效果图",
                            "制作用图":"20_2d/24_制作用图",
                            "音乐":"10_前期策划/12-Music/12-Final_Music",
                            "素材":"10_前期策划/11_素材",
                           }
   // alert( folderPaths["视频输出"])
    
    function openFolder(projectPath,folderPath){
        //app.project.file.parent.parent.parent.execute()
        //system.callSystem("explorer " + filePath); 
        var folderPath = projectPath + "/" + folderPath;
        var folderObj = Folder(folderPath);
        if(folderObj.exists == false){
            alert("文件夹路径不存在！")
            return 
        }
        folderObj.execute();
    }
    
    var alertBuilderResource =
        "dialog { properties:{ resizeable:true }, \
            text: 'OpenProjectFolder', frameLocation:[100,100], \
            btnPnl: Panel { orientation:'column', \
                text: 'Folder List', \
                previewBtn: Button { text:'拍屏' }, \
                fountainBtn: Button { text:'喷泉'}, \
                sceneBtn: Button { text:'场景'}, \
                localVideoBtn: Button { text:'本地视频输出'}, \
                videoBtn: Button { text:'项目视频输出'}, \
                plantBtn: Button { text:'平面图' }, \
                effectBtn: Button { text:'效果图' }, \
                workImgBtn: Button { text:'制作用图' }, \
                musicBtn: Button { text:'音乐' }, \
                footageBtn: Button { text:'素材' }, \
                cancelBtn: Button { text:'Cancel', properties:{name:'cancel'} } \
            } \
        }";
        
    var win = new Window(alertBuilderResource);
    with (win.btnPnl) {
        previewBtn.onClick = function (){
                                            openFolder(projectPath,folderPaths["拍屏"]);
                                             this.window.close(); 
                                        };
        fountainBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["喷泉"]);
                                            this.window.close(); 
                                        };
        sceneBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["场景"]);
                                            this.window.close(); 
                                        };
        localVideoBtn.onClick = function () {
                                            openFolder(filePath,folderPaths["本地视频输出"]);
                                            this.window.close(); 
                                        };
        videoBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["项目视频输出"]);
                                            this.window.close(); 
                                        };
        plantBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["平面图"]);
                                            this.window.close(); 
                                        };
        effectBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["效果图"]);
                                            this.window.close(); 
                                        };
        workImgBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["制作用图"]);
                                            this.window.close(); 
                                        };
        musicBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["音乐"]);
                                            this.window.close(); 
                                        };
        footageBtn.onClick = function () {
                                            openFolder(projectPath,folderPaths["素材"]);
                                            this.window.close(); 
                                        };
        cancelBtn.onClick = function () { this.window.close(); };
    };

    win.center();
    win.show();
}
//openExplorer()
function cleanRepeatedItem(item){
    // 目的：查找并替换项目中，与选择项目相重复的项
    
    // 原始 合成、名称、id、文件路径
    var srcItem = item;
    var srcName = srcItem.name;
    var srcID = srcItem.id;
    var srcFile = srcItem.file;
    
    // 寻找目标
    var num = app.project.numItems;
    for(var i=1;i<=num;i++){
        // 检索项目中所有合成中的层，逐层的寻找这个项
        var comp = app.project.item(i);
        if(!(comp instanceof CompItem)){ continue}
        //alert(comp.name)
        for(var o=1;o<=comp.numLayers;o++){
            var layer = comp.layer(o);
            if(!(layer instanceof AVLayer)){ continue}
            //alert(layer.name)
            var tgtItem = layer.source;
            var tgtName = tgtItem.name;
            var tgtID = tgtItem.id;
            var tgtFile = tgtItem.file;
            // 判断名字相同，ID不同，路径相同
            if(srcName==tgtName){if(srcID!=tgtID){layer.replaceSource(srcItem,true);}}
        }
    }
}// end function
//if(checkmembers()){cleanRepeatedItem(app.project.selection[0])}
function cleanRepeatedItems(){
    // 目的：查找并替换项目中，与选择项目相重复的项
    app.beginUndoGroup("True Comp Duplicator");
    
    var selItem = app.project.selection;
    var selnum = selItem.length;
    
    if(selItem.length==0){
        alert("请选择一个或多个要清理的重复项！")
        return
    }
    for(var i=0;i<selnum;i++){
        var item = selItem[i];
        cleanRepeatedItem(item);
    }

    app.endUndoGroup();
}// end function
//cleanRepeatedItems()
function CleanFrameNumber(){
    app.beginUndoGroup("去除帧编号");
    
    var sequenceSearcher=new RegExp("(.jpg|.jpeg|.png|.exr|.tga)$");

    var selItem = app.project.selection;
    for (i = 0;  i <= selItem.length; i++) { 
        curItem = selItem[i];
        if (curItem instanceof FootageItem && sequenceSearcher.test(curItem.name) && curItem.mainSource.displayFrameRate!=0) {
            curItem.replaceWithSequence(curItem.file,  true);
        }
    }
    app.endUndoGroup();
}
//CleanFrameNumber()

function executeJsx(scriptFile){
    app.beginUndoGroup("执行脚本数据");
    if (scriptFile.exists){ $.evalFile(scriptFile);}
    else{alert("先创建数据，再执行!");}
    app.endUndoGroup();
}
//var scriptFile = new File('/c/Users/Administrator/Desktop/camrea.jsx');
//executeJsx(scriptFile)