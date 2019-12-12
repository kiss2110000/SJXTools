function getProjectPath(){
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
        projectPath = Folder.decode(projectPath);
        
        serverProjectFile.open("w");
        serverProjectFile.write(projectPath);
        serverProjectFile.close();
    }
    serverProjectFile.open("r");
    projectPath = serverProjectFile.read();
    serverProjectFile.close();
    
    //alert(projectPath)
    return projectPath;
}
//alert(getProjectPath())
function openExplorer(){
    // 获取项目的根目录
    var projectPath = getProjectPath();
    var filePath = app.project.file.path;
    
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
        var folderObj = new Folder(folderPath);
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


function copyFile(srcFile, dstFile){
    // 整理输入参数
    if(typeof(srcFile)=="string") {srcFile = new File(srcFile);}
    if(typeof(dstFile)=="string") {dstFile = File(dstFile);} // 没有new关键字，可以返回文件夹类型
    
    if(dstFile instanceof Folder){
        // 判断文件和路径是否存在
        if(!srcFile.exists){
            alert("原始文件不存在！");
            return false
        }
        var folderPath = dstFile.path;
        var folder = new Folder(folderPath);
        if(!folder.exists){
            alert("目标文件夹不存在！");
            return false
        }
    
        //  将脚本路径转换为windows路径
        var srcFilePath = convertScriptPathToWindowsPath(File.decode(srcFile.fullName))
        var dstFilePath = convertScriptPathToWindowsPath(File.decode(dstFile.fullName))
        
        // 计算命令
        var cmd = 'cmd.exe /c copy "' + srcFilePath + '" "' + dstFilePath + '"';
        //cmd = 'cmd.exe /c move \"f:\\AE Project\\test\\aaa 1.txt" "f:\\AE Project\\test\\old\"'
        $.writeln(cmd)
        var s = system.callSystem(cmd)
        //$.writeln(s)
        var regex = /已复制         1 个文件/g
        var sArray = regex.exec(s);
        //$.writeln(sArray)
        if(sArray==null){
            alert(s);
            return false;
        }
        return true;
    }
}
var srcFile = "/F/AE Project/test/aaa 1.txt";
var dstFolder = "/F/AE Project/test/old";
//copyFile(srcFile, dstFolder)
function convertScriptPathToWindowsPath(scriptPath){
    //  将斜杠替换为反斜杠
    scriptPath = scriptPath.replace(/\//g,"\\")
    // 替换盘符
    var regex = /^\\([a-zA-Z]{1})\\/g;
    var pathArray = regex.exec(scriptPath);
    //$.writeln(srcFileArray)
    windowsPath = scriptPath.replace(/^\\([a-zA-Z]{1})\\/g,pathArray[1]+":\\")

    return windowsPath;
}
//alert(convertScriptPathToWindowsPath("/F/AE Project/test/aaa 1.txt"))
function moveFile(srcFile, dstFile){
    // 整理输入参数
    if(typeof(srcFile)=="string") {srcFile = new File(srcFile);}
    if(typeof(dstFile)=="string") {dstFile = new File(dstFile);}
    
    // 判断文件和路径是否存在
    if(!srcFile.exists){
        alert("原始文件不存在！");
        return false
    }
    var folderPath = dstFile.path;
    var folder = new Folder(folderPath);
    if(!folder.exists){
        alert("目标文件夹不存在！");
        return false
    }

    //  将脚本路径转换为windows路径
    var srcFilePath = convertScriptPathToWindowsPath(File.decode(srcFile.fullName))
    var dstFilePath = convertScriptPathToWindowsPath(File.decode(dstFile.fullName))
    
    // 计算命令
    var cmd = 'cmd.exe /c move "' + srcFilePath + '" "' + dstFilePath + '"';
    //cmd = 'cmd.exe /c move \"f:\\AE Project\\test\\aaa 1.txt" "f:\\AE Project\\test\\old\"'
    //$.writeln(cmd)
    var s = system.callSystem( cmd)
    //$.writeln(s)
    var regex = /移动了         1 个文件/g
    var sArray = regex.exec(s);
    //$.writeln(sArray)
    if(sArray==null){
        alert(s);
        return false;
    }
    return true;
}
//var srcFile = "/F/AE Project/test/---NeverBackDown.mp4";
//var dstFolder = "/F/AE Project/test/old";
//moveFile(srcFile, dstFolder)
function moveFileToOldFolder(file){
    if(typeof(file)=="string") {file = new File(file);}
    if(!file.exists){return true;}
    
    var fileName = File.decode(file.name)
    var path = File.decode(file.path);
    //$.writeln(fileName)
    //$.writeln(path)
    
    var splitName = fileName.split(".");
    if(splitName.length!=2){
        alert("名字只能包含一个'.'号");
        return false
    }
    
    var oldFolderPath = path + "/old";
    var oldFolder = new Folder(oldFolderPath);
    if(!oldFolder.exists) {oldFolder.create();}
    
    var num = 1
    var oldFileName = oldFolderPath + "/" + splitName[0] + num + "." + splitName[1];
    var oldFile = new File(oldFileName)
    while(oldFile.exists){
        //alert(num);
        num ++;
        oldFileName = oldFolderPath + "/" + splitName[0] + num + "." + splitName[1];
        oldFile = new File(oldFileName)
    }
    //$.writeln(oldFileName);
    
    var result = moveFile(file,oldFileName);
    if(!result){return false;}
    
    return true;
}
//var file = new File(srcFile);
//moveFileToOldFolder(file)
function getRenderListFile(){
    var RQitems = app.project.renderQueue.items;

    if(RQitems.length==0){
        alert("渲染队列还空着呢！");
        return null ;
    }

    var lastRQitem = RQitems[RQitems.length];
    
    if(lastRQitem.status != RQItemStatus.DONE){
        alert("渲染队列最后一个未成功渲染呢！");
        return null ;
    }
    //alert(lastRQitem)

    var om = lastRQitem.outputModules[1]; // 这个数组一般都用1
    var outFile = om.file;

    if(!outFile.exists){
        alert("渲染的文件丢失！")
        return null;
    }
    return outFile;
}
//getRenderListFile()
function uploadRenderLastVideoToServer(){
    var outputFile = getRenderListFile();
    //$.writeln(outputFile);
    if(outputFile == null){return false}
    
    // 获取上传路径和文件全称
    var fileName = outputFile.name;
    var projectPath = getProjectPath();
    var outputPath = "40_comp/43_Render_Output";
    var dstFolderPath = projectPath + "/" + outputPath;
    var newFileFullName = dstFolderPath + "/" + fileName;
    //$.writeln(newFileFullName);
    
    // 检测文件是否存在、大小是否相等重复
    var newFile = new File(newFileFullName);
    if(newFile.exists){
        var newFileSize = newFile.length;
        var outputFileSize = outputFile.length;
        //$.write (newFileSize)
        //$.write (outputFileSize)
        if(newFileSize == outputFileSize){
            alert("文件大小相等，可能是一个文件，取消上传！")
            return false
        }
        else{
            // 移动已经存在的文件到old文件夹中
            var result = moveFileToOldFolder(newFileFullName);
            $.writeln(result);
            if(!result){return false;}
        }
    }

    var result = copyFile(outputFile, dstFolderPath);
    if(result){alert("上传成功！");}
}
//uploadRenderLastVideoToServer();