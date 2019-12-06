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
getRenderListFile()