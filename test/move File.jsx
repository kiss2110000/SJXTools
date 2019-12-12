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
    var srcFilePath = File.decode(srcFile.fullName);
    //$.writeln(srcFilePath)
    var dstFilePath = File.decode(dstFile.fullName);
    //$.writeln(dstFilePath)
    
    //  转换为windows路径
    srcFilePath = convertScriptPathToWindowsPath(srcFilePath)
    dstFilePath = convertScriptPathToWindowsPath(dstFilePath)
    
    // 计算命令
    var cmd = 'cmd.exe /c move "' + srcFilePath + '" "' + dstFilePath + '"';
    //cmd = 'cmd.exe /c move \"f:\\AE Project\\test\\aaa 1.txt" "f:\\AE Project\\test\\old\"'
    //$.writeln(cmd)
    var s = system.callSystem( cmd)
    //alert(s)
    return true;
}

var srcFile = "/F/AE Project/test/aaa 1.txt";
var dstFolder = "/F/AE Project/test/old";
//moveFile(srcFile, dstFolder)
function moveFileToOldFolder(file){
    if(!file.exists){return true;}
    
    var fileName = File.decode(file.name)
    var path = File.decode(file.path);
    $.writeln(fileName)
    $.writeln(path)
    
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
    $.writeln(oldFileName);
    
    var s = moveFile(file,oldFileName);
    if(!s){return false;}
    
    return true;
}
var file = new File(srcFile);
//moveFileToOldFolder(file)
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
        var srcFilePath = File.decode(srcFile.fullName);
        //$.writeln(srcFilePath)
        var dstFilePath = File.decode(dstFile.fullName);
        //$.writeln(dstFilePath)
        
        //  转换为windows路径
        srcFilePath = convertScriptPathToWindowsPath(srcFilePath)
        dstFilePath = convertScriptPathToWindowsPath(dstFilePath)
        
        // 计算命令
        var cmd = 'cmd.exe /c copy "' + srcFilePath + '" "' + dstFilePath + '"';
        //cmd = 'cmd.exe /c move \"f:\\AE Project\\test\\aaa 1.txt" "f:\\AE Project\\test\\old\"'
        $.writeln(cmd)
        //var s = system.callSystem( cmd)
        //alert(s)
    }
}
//copyFile(srcFile, dstFolder)





