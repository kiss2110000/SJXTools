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
    $.writeln(srcFilePath)
    var dstFilePath = File.decode(dstFile.fullName);
    $.writeln(dstFilePath)
    
    //  将斜杠替换为反斜杠
    srcFilePath = srcFilePath.replace(/\//g,"\\")
    dstFilePath = dstFilePath.replace(/\//g,"\\")
    // 替换盘符
    var regex = /^\\([a-zA-Z]{1})\\/g;
    var srcFileArray = regex.exec(srcFilePath);
    var regex = /^\\([a-zA-Z]{1})\\/g;
    var dstFileArray = regex.exec(dstFilePath);
    //$.writeln(srcFileArray)
    //$.writeln(dstFileArray)
    srcFilePath = srcFilePath.replace(/^\\([a-zA-Z]{1})\\/g,srcFileArray[1]+":\\")
    dstFilePath = dstFilePath.replace(/^\\([a-zA-Z]{1})\\/g,dstFileArray[1]+":\\")
    
    // 计算命令
    var cmd = 'cmd.exe /c move "' + srcFilePath + '" "' + dstFilePath + '"';
    //cmd = 'cmd.exe /c move \"f:\\AE Project\\test\\aaa 1.txt" "f:\\AE Project\\test\\old\"'
    //$.writeln(cmd)
    var s = system.callSystem( cmd)
    //alert(s)
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
