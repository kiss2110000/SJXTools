/*
        Fountain Tools  v1.0.0
 
        更新内容：
            1、添加“创建摇头灯”工具
            2、添加“设置属性范围关键帧值”工具
        
        更新时间：2019.03.29 22:09
        ---------------------------------------------------------------------
        Fountain Tools  v0.2.3
        
        更新内容：
            1、添加“去除帧编号”工具
        
        更新时间：2018.03.03 22:09
        
*/

//全局变量原始的层信息
SOURCE_LAYERS = undefined;


// 注意： $.evalFile(file) 不能添加function函数中

var mainDirPath = File($.fileName).path;
var libraryPath = mainDirPath + "/library";
var libraryFolder = new Folder(libraryPath);

if (!libraryFolder.exists){
    alert("library 文件夹不存在！")
}
else{
    var libraryFiles = libraryFolder.getFiles();
    var jsxbin = [];
    for(var i=0;i<libraryFiles.length;i++){
        var file = libraryFiles[i];
        var fileName = file.name;
        if(fileName.split(".")[1] == "jsxbin"){
            //alert(file.name);
            //alert(file.fullName)
            $.evalFile(file.fullName);
        }
    }
}

//var mainDirPath = File($.fileName).path;
//~ $.evalFile(mainDirPath + "/library/" + "CommonFunction.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "CreateTools.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "CopyToPath.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "LayersOffset.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "MaskEditer.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "KeyframeEditer.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "CopyEffect.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "CompEditer.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "ProjectTools.jsxbin");
//~ $.evalFile(mainDirPath + "/library/" + "rd_PropPath.jsxbin");
//alert(mainDirPath + "/library/" + "Tools_UI.jsxbin")
//$.evalFile(mainDirPath + "/library/" + "Tools_UI.jsxbin");

function myUi(obj){

    win=(obj instanceof Panel)? obj : new Window("palette","SJX Tools V 0.02 bete",[0,0,300,500],{resizeable:true,});
    //win = new Window("palette","new project",[0,0,500,500],{resizeable:true,borderless:true,independent:false,minimizeButton:false,maximizeButton:false,resizeable:false,});
    addTools_UI(win)
    
    if (win instanceof Window){
        win.center();
        win.show();
    }
    //else{win.layout.layout(true);}
}
// 只有我的电脑可以用
//if(checkKey()==true){myUi (this)};
//myUi (this)


