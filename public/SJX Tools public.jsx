function register_UI(){
    win_yz=new Window("palette","首次使用验证码",[0,0,500,100],{resizeable:true,});
    but_yanzheng=win_yz.add("button",[400,35,470,55],"确定");
    statictext_tishi=win_yz.add("statictext",[20,37,90,57] ,"验证码：",{multiline:true});
    edittext_mima=win_yz.add("edittext",[80,36,380,56] ,"",{readonly:0,noecho:true,borderless:0,multiline:0,enterKeySignalsOnChange:0});

    but_yanzheng.onClick = function(){setCodeKey(win_yz,edittext_mima.text);}
    
    function setCodeKey(window,text_mima){
        app.settings.saveSetting("SJX_Tools","codeKey", text_mima);
        window.close();
    }

    win_yz.center();
    win_yz.show();
}
//~ register_UI()
function verify(){
    // 获取AE程序存储的codeKey，如果不存在codeKey，则验证失败。
    if(app.settings.haveSetting("SJX_Tools", "codeKey") == false){
        return false
    }
    else{ // 有，则获取codeKey，对比验证是否正确。
        if (app.settings.getSetting("SJX_Tools","codeKey") == "zhongkeshuijingshijuebupenquanjiaoben"){
            return true
        }
    }

    return false
}
function main(obj){
    win_mian=(obj instanceof Panel)? obj : new Window("palette","SJX Tools V 0.01 bete",[0,0,300,500],{resizeable:true,});
    
    var script_path = "//192.168.1.98/share/temp/aetest/script/SJX Tools.jsxbin";
    
    // 通过验证并且网通通常，则导入文件添加面板
    if (verify() && File(script_path).exists){
        $.evalFile(script_path);  // 导入函数
        addTools_UI(win_mian);  //添加面板
    }
    else{ // 验证失败，网络不通
        but_1=win_mian.add("button",[0,0,100,25],"Open Fountain");
        but_1.onClick = function(){
            // 验证
            if (verify()){
                // 检查网络
                if(File(script_path).exists){
                    $.evalFile(script_path);  // 读取函数
                    addTools_UI(win_mian); //添加面板
                    
                    // 验证通过，隐藏按钮
                    but_1.visible = false;
                    but_1.bounds = [0,0,0,0];
                    but_1.maximumSize = [0,0];
                }
                else{ // 网络错误
                    alert(" serverErrorCode:0100");
                }// end if
            }
            else{
                // 验证失败后，注册密码
                register_UI();
            }// end if
        }// end fc
    }// end if

    if (win_mian instanceof Window){
        win_mian.center();
        win_mian.show();
    }
}
main(this);