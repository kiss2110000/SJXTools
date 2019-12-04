/*
        MaskEditer Tools  v1.0.0
 
        更新内容：
            1、
            2、
        
        更新时间：2019.05.17 07:38
        ---------------------------------------------------------------------
*/

var dirPath = File($.fileName).path;
$.evalFile(dirPath + "/" + "CommonFunction.jsxbin");

/*************** Main Mask editer functions ****************/
function getMaskPoints(mask){
    var points = mask.maskShape.value;
    return points
}
function setMaskPoints(mask,points){
    var shape = mask.maskShape.value;
    shape.vertices = points.vertices;
    shape.inTangents = points.inTangents;
    shape.outTangents = points.outTangents;
    shape.closed =points.closed;
    mask.maskShape.setValue(shape);
}
function getSelPointIndexOfMask(mask){
    //  save source vertex
    var orgPoints = getMaskPoints(mask);
    
    //  set selected point to first vertex
    app.executeCommand(2768);
    // get first vertex X axis value
    var selVerPoint = mask.maskShape.value.vertices[0];
    
    // reset source vertex
    setMaskPoints(mask,orgPoints);
    
    // 查找相同坐标,找到index的值
    for(i=0,ii=orgPoints.vertices.length; i<ii;i++){
        var eachVerPoint = orgPoints.vertices[i];
        if(selVerPoint[0]==eachVerPoint[0] && selVerPoint[1]==eachVerPoint[1]){  return i }
    }
}
//alert(getSelPointIndexOfMask(app.project.activeItem.selectedProperties[0]))
function addMask(layer){
    var myMask=layer.mask.addProperty("ADBE Mask Atom");
    myMask.maskMode=MaskMode.NONE;
    myMask.maskShape.value.closed=true;
    return myMask
}
//alert(addMask(app.project.activeItem.selectedLayers[0]).name)
function generalLine(p1,p2){
    // 一般式 Ax+By+C=0
    // from http://www.cnblogs.com/DHUtoBUAA/
    A=p2[1]-p1[1];
    B=p1[0]-p2[0];
    C=p2[0]*p1[1]-p1[0]*p2[1];
    return [A,B,C]
}
function getIntersectPoint(line1,line2){
    var A1 = line1[0];
    var B1 = line1[1];
    var C1 = line1[2];
    
    var A2 = line2[0];
    var B2 = line2[1];
    var C2 = line2[2];
    
    var m=A1*B2-A2*B1;
    if(m==0){return null}
    else{
        var x=(C2*B1-C1*B2)/m;
        var y=(C1*A2-C2*A1)/m;
    }
    return [x,y]
}
//--------------------------------------------------------------------------------
function getMaskShape(maskShape){
    var shapes= new Array()
    shapes.push(maskShape.value.vertices)
    shapes.push(maskShape.value.inTangents)
    shapes.push(maskShape.value.outTangents)
    shapes.push(maskShape.value.closed)
    return shapes
}

function setMaskShape22(maskShape,verts,inTan,outTan,close){
    shape = maskShape.value;
    shape.vertices = verts;
    shape.inTangents = inTan;
    shape.outTangents = outTan;
    shape.closed = close
    maskShape.setValue(shape);
}
function setMaskShape(maskShape,shapes){
    shape = maskShape.value;
    shape.vertices = shapes[0];
    shape.inTangents = shapes[1];
    shape.outTangents = shapes[2];
    shape.closed = shapes[3]
    maskShape.setValue(shape);
}
// alert(getMaskShape(maskShape))

function getSelMaskIndex(maskShape){
    //  get source vertex
    var orgVerts = getMaskShape(maskShape)
    //  get selected number of Mask
    app.executeCommand(2768) //  set first vertex
    var tempVerFirstX = maskShape.value.vertices[0][0]
    setMaskShape(maskShape,orgVerts)
    
    for(i=0,ii=orgVerts[0].length; i<ii;i++){
        eachVerFirstX = orgVerts[0][i][0]
        if(tempVerFirstX==eachVerFirstX){
            return i
        }
    }
}
// alert(getSelMaskIndex(maskShape))

// ====== main function =========
function setFirstVertex(){app.executeCommand(2768);}
//setFirstVertex()

function splitMask(){
    app.beginUndoGroup("Split Mask");
    
    var mask = app.project.activeItem.selectedProperties[0];
    var maskShape = mask.maskShape;
    //alert(mask.name)
    var shape = getMaskShape(maskShape)
    //  get selected number of Mask
    var numb = getSelMaskIndex(maskShape)
    //  split shape to two part
    if(numb==0){
        shape[0].push(shape[0][0])
        shape[1].push(shape[1][0])
        shape[2].push(shape[2][0])
        shape[3]=false
        setMaskShape(maskShape,shape)
    }
    else{
        var oneShape = [[],[],[],null]
        var twoShape = [[],[],[],null] 
        for(i=0;i<=numb;i++){
            oneShape[0].push(shape[0][i])
            oneShape[1].push(shape[1][i])
            oneShape[2].push(shape[2][i])
        }
        for(i=numb,ii=shape[0].length; i<ii;i++){
            twoShape[0].push(shape[0][i])
            twoShape[1].push(shape[1][i])
            twoShape[2].push(shape[2][i])
        }
        //  copy mask to secend part
        var tempShape = [[[0,0]],[[0,0]],[[0,0]],false]
        setMaskShape(maskShape,tempShape)
        app.executeCommand(2080)
        var newMask = app.project.activeItem.selectedProperties[0];
        newMask.color = [Math.random(),Math.random(),Math.random()]
        maskShape = newMask.maskShape
        setMaskShape(maskShape,twoShape);
        
        //  find first part
        maskGroup = app.project.activeItem.selectedProperties[0].parentProperty
        for(i=1,ii=maskGroup.numProperties;i<=ii;i++){
            maskShape = maskGroup.property(i).maskShape
            if(maskShape.value.vertices[0][0]==0){
                setMaskShape(maskShape,oneShape)
                break
            }
        }
    }
    app.endUndoGroup();
}
//splitMask()
function combine(){
    app.beginUndoGroup("Split Mask");

    var masks = app.project.activeItem.selectedProperties
    if(masks.length==2){
        var newShape = [[],[],[],false]
        for(i=0,ii=masks.length;i<ii;i++){
            maskShape = masks[i].maskShape
            eachShape = getMaskShape(maskShape)
            if(newShape[0].length==0){ newShape=eachShape }
            else{
                if(false){
                    newShape[0]=newShape[0].concat(eachShape[0])
                    var count = newShape[1].length-1
                    newShape[1]=newShape[1].concat(eachShape[1])
                    newShape[2]=newShape[2].concat(eachShape[2])
                    //newShape[1][count]=[0,0]
                    newShape[2][count]=[0,0]  // 第一个mask 的出点切线设置为0
                    newShape[1][count+1]=[0,0]  //  第二个mask的入点切线设置为0
                    //newShape[2][count+1]=[0,0]
                }
                else{
                    newShape[0].push((newShape[0].pop()+eachShape[0].shift())/2)
                    //newShape[1].pop()
                    newShape[2].pop()
                    eachShape[1].shift()
                    //newShape[1].push(eachShape[1].shift())
                    newShape[2].push(eachShape[2].shift())
                    newShape[0]=newShape[0].concat(eachShape[0])
                    newShape[1]=newShape[1].concat(eachShape[1])
                    newShape[2]=newShape[2].concat(eachShape[2])
                }
            }
        }
        setMaskShape( masks[0].maskShape,newShape)
        for(i=masks.length-1,ii=0;i>ii;i--){
        masks[i].remove()
        }
    }
    app.endUndoGroup();
}
//combine()

function reverseMask(){
    app.beginUndoGroup("Reverse Mask");

    var maskShape = app.project.activeItem.selectedProperties[0].maskShape
    var shape = getMaskShape(maskShape)
    //  get selected number of Mask
    if(shape[3]==false){
        shape[0].reverse()
        temp1 = shape[1]
        shape[1] = shape[2]
        shape[2] = temp1
        shape[1].reverse()
        shape[2].reverse()
        shape[3]=false
    }
    else{
        shape[0].reverse()
        temp1 = shape[1]
        shape[1] = shape[2]
        shape[2] = temp1
        shape[1].reverse()
        shape[2].reverse()
        shape[0].unshift(shape[0].pop())
        shape[1].unshift(shape[1].pop())
        shape[2].unshift(shape[2].pop())
    }
    setMaskShape(maskShape,shape)
    
    app.endUndoGroup();
}
//reverseMask()

function cross(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2]

  var rx = ay * bz - az * by
  var ry = az * bx - ax * bz
  var rz = ax * by - ay * bx
  return [ rx, ry, rz ]
}
function dot(a,b){
    var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2]
    var result = ax*bx + ay*by + az*bz
    return result
}
// alert(dot([5,6,3],[1,2,3]))
function normalize(vec) {
  var x = vec[0]
  var y = vec[1]
  var z = vec[2]
  var squaredLength = x * x + y * y + z * z

  if (squaredLength > 0) {
    var length = Math.sqrt(squaredLength)
    vec[0] = vec[0] / length
    vec[1] = vec[1] / length
    vec[2] = vec[2] / length
  }
  return vec
}

function segmentsIntr(a, b, c, d){  

    // 三角形abc 面积的2倍  
    var area_abc = (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]);  
 
    // 三角形abd 面积的2倍  
    var area_abd = (a[0] - d[0]) * (b[1] - d[1]) - (a[1] - d[1]) * (b[0] - d[0]);   
 
    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);  
    if ( area_abc*area_abd>=0 ) {  
        return false;  
    }  
 
    // 三角形cda 面积的2倍  
    var area_cda = (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]);  
    // 三角形cdb 面积的2倍  
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.  
    var area_cdb = area_cda + area_abc - area_abd ;  
    if (  area_cda * area_cdb >= 0 ) {  
        return false;  
    }  
 
    //计算交点坐标  
    var t = area_cda / ( area_abd- area_abc );  
    var dx= t*(b[0] - a[0]),  
        dy= t*(b[1] - a[1]);  
    return [a[0] + dx , a[1] + dy];  
 
}
//alert(segmentsIntr([0,0],[4,0],[3,-1],[3,4]))
function line(p1,p2){
    //直线的一般式方程AX+BY+C=0
    var A,B,C
    //A = Y2 - Y1
    //B = X1 - X2
    //C = X2*Y1 - X1*Y2
    A = p2[1] - p1[1]
    B = p1[0] - p2[0]
    C = p2[0]*p1[1] - p1[0]*p2[1]
    return [A,B,C]
}

function parallelLine(a,b,c,d){
    // c = d*Math.sqrt(a*a+b*b)+-c
    var parC = d*Math.sqrt(a*a+b*b)+c
    return [a,b,parC]
}

function intersecP2(a,b,c,e,f,g){
    //ax+by+c=0
    //ex+fy+g = 0
    if(a==0){
        // ex + (b+f)y +(c+g) = 0
        y = ((c+g) + e*x)/-(b+f);
        x = ((c+g) + (b+f)*y)/-e;
        return [x,y]
    }
    //(a+e)x +(b+f)y+(c+g) =0
    
    //x = -(b+f)/(a+e)y-(c+g)/(a+e)
    //a(-(b+f)/(a+e)y-(c+g)/(a+e))+by+c=0
    //-(b+f)/(a+e)ay-(c+g)/(a+e)a+by+c=0
    //(b-(b+f)/(a+e)a)y-(c+g)/(a+e)a+c=0
    //(b-(b+f)/(a+e)a)y = (c+g)/(a+e)a-c
    //y = ((c+g)/(a+e)a-c)/(b-(b+f)/(a+e)a)
    y = ((c+g)/(a+e)*a-c)/(b-(b+f)/(a+e)*a)
    x = (-c-b*y)/a
    return [x,y]
}
function jieequation(a,b,c,x){
    //ax+by+c=0
    y = (-c-a*x)/b
    return y
}
function creatMask(layer,shape){
    var myMask=layer.mask.addProperty("ADBE Mask Atom");
    var myPath=new Shape();
    myPath.vertices=shape;
    myPath.closed=false;
    myMask.property("ADBE Mask Shape").setValue(myPath);
    myMask.maskMode=MaskMode.NONE;
}


function offsetMask(numb){
    app.beginUndoGroup("Offset Mask");

    var masks = app.project.activeItem.selectedProperties;
    var maskShape = masks[0].maskShape;
    var shape = getMaskShape(maskShape);
    
    var newShape = [[],[],[],false]
    var parallelOuts = []
    var parallelMids = []
    for(i=0,ii=shape[0].length; i<ii;i++){
         //var obj = app.project.activeItem.layers.addNull();
         //obj.position.setValue(shape[2][i]+shape[0][i]);

         var dir = shape[2][i]
         var normal = cross(normalize( [dir[0], dir[1], 0] ),[0,0,1] )
         newShape[0][i]=shape[0][i]+[normal[0],normal[1]]*numb
    }
    var points = new Shape();
    points.vertices = newShape[0];
    var mask = addMask(app.project.activeItem.selectedLayers[0]);
    alert(mask.name)
    setMaskPoints(mask,points);
    
    for(i=0,ii=shape[0].length; i<ii;i++){
         if((i+1)<ii){
             equationOut = line( (shape[0][i] + shape[2][i]), shape[0][i] )
             equationIn    = line( shape[0][i+1],(shape[0][i+1] + shape[1][i+1])  )
             equationMid  = line( (shape[0][i+1] + shape[1][i+1]),(shape[0][i] + shape[2][i]) )
             
             parallelOut = parallelLine(equationOut[0],equationOut[1],equationOut[2],numb)
             parallelOuts[i] = parallelOut
             parallelIn = parallelLine(equationIn[0],equationIn[1],equationIn[2],numb)
             parallelMid = parallelLine(equationMid[0],equationMid[1],equationMid[2],numb)
             parallelMids[i] = parallelMid
             
             intersecOut = intersecP2(parallelOut[0],parallelOut[1],parallelOut[2],parallelMid[0],parallelMid[1],parallelMid[2])
             intersecIn   = intersecP2(parallelIn[0],parallelIn[1],parallelIn[2],parallelMid[0],parallelMid[1],parallelMid[2])
             
             newShape[1][i+1] = intersecIn - newShape[0][i+1]
             newShape[2][i] = intersecOut - newShape[0][i]
         }
    }
    p1 = [shape[0][0][0],jieequation(parallelOuts[0][0],parallelOuts[0][1],parallelOuts[0][2],shape[0][0][0])]
    p2 = [shape[2][0][0],jieequation(parallelOuts[0][0],parallelOuts[0][1],parallelOuts[0][2],shape[2][0][0])] 
    points = [p1 ,p2]
    //creatMask(app.project.activeItem.selectedLayers[0],points)
    
    p1 = [shape[0][0][0],jieequation(parallelMids[0][0],parallelMids[0][1],parallelMids[0][2],shape[0][0][0])]
    p2 = [shape[2][0][0],jieequation(parallelMids[0][0],parallelMids[0][1],parallelMids[0][2],shape[2][0][0])] 
    points = [p1 ,p2]
    //creatMask(app.project.activeItem.selectedLayers[0],points)
    
    //var obj = app.project.activeItem.layers.addNull();
    //obj.position.setValue(newShape[2][0]+newShape[0][0]);
    
    //points = [shape[0][0],shape[2][0]+shape[0][0],shape[1][1]+shape[0][1],shape[0][1]]
    //creatMask(app.project.activeItem.selectedLayers[0],points)
    
    newShape[1][0] =  shape[1][0]
    newShape[2][shape[0].length-1] =  shape[2][shape[0].length-1]
    //alert(newShape[2])
    //setMaskShape(maskShape,newShape)
    
    points = [newShape[0][0],newShape[2][0]+newShape[0][0],newShape[1][1]+newShape[0][1],newShape[0][1]]
    //creatMask(app.project.activeItem.selectedLayers[0],points)
    
    app.endUndoGroup();
}
//offsetMask(50)
function offsetMask(numb){
    app.beginUndoGroup("Offset Mask");

    var mask = app.project.activeItem.selectedProperties[0];
    var points = getMaskPoints(mask);
    
    var pointVers = points.vertices;
    var pointIn = points.inTangents;
    var pointOut = points.outTangents;
    
    var newVertices = points.vertices;
    var newInTangents = points.inTangents;
    var newOutTangents = points.outTangents;
    
    // 计算新的顶点位置
    for(i=0,ii=pointVers.length; i<ii;i++){
         var dir =pointOut[i];
         var normal = cross(normalize([dir[0],dir[1],0]), [0,0,1]);
         var distance = [normal[0], normal[1]] * numb;
         newVertices[i] = pointVers[i] + distance;
    }

    // 计算切线的位置
    for(i=0,ii=pointVers.length; i<ii;i++){
        if(points.closed==false && i==ii-1){break;}
        //alert(i)
        // i 表示当前顶点，s 表示下一个顶点
        var s = (i+1)%ii;

        // 建立三条直线，分别为切线出、切线入、平行于出点和入点的中间线。
        var lineOut  = generalLine( (pointVers[i] + pointOut[i]), pointVers[i] );
        var lineIn    = generalLine( pointVers[s], (pointVers[s] + pointIn[s]) );
        var lineMid  = generalLine( (pointVers[s] + pointIn[s]), (pointVers[i] + pointOut[i]) );
        //alert(lineOut)
        // 计算三条线偏移后的方程线，
        var parallelOut = parallelLine(lineOut[0],lineOut[1],lineOut[2],numb);
        var parallelIn = parallelLine(lineIn[0],lineIn[1],lineIn[2],numb);
        var parallelMid = parallelLine(lineMid[0],lineMid[1],lineMid[2],numb);
        //alert(parallelOut);
        //alert(parallelMid);
        // 计算切线出、切线入与中间线的交点
        intersecOut = getIntersectPoint(parallelOut,parallelMid);
        intersecIn   = getIntersectPoint(parallelIn,parallelMid);
        //alert(intersecOut);
        // 获取交点相对顶点的局部坐标值
        newInTangents[s] = intersecIn - newVertices[s];
        newOutTangents[i] = intersecOut - newVertices[i];
        /*
        // 测试交点
        var testPoints = new Shape();
        testPoints.vertices = [newVertices[i],intersecOut,intersecIn,newVertices[s]];
        var testmask = addMask(app.project.activeItem.selectedLayers[0]);
        setMaskPoints(testmask,testPoints);
        */
    }

    // 定义新的shape
    var newPoints = new Shape();
    newPoints.vertices = newVertices;
    newPoints.inTangents = newInTangents;
    newPoints.outTangents = newOutTangents;
    newPoints.closed = points.closed;
    
    var mask = addMask(app.project.activeItem.selectedLayers[0]);
    setMaskPoints(mask,newPoints);
    
    app.endUndoGroup();
}
//offsetMask(-50)
function cubeBezierCurve(a,b,c,d,t){
    // P(t) = A*(1-t)*(1-t)*(1-t) + B*3*(1-t)*(1-t)*t + C*3*(1-t)*t*t + D*t*t*t,  t=0,1
    if(0<= t <=1){
        var p = a*(1-t)*(1-t)*(1-t) + b*3*(1-t)*(1-t)*t + c*3*(1-t)*t*t + d*t*t*t
        return p
    }else(alert("Parameter 't' beyond range!"))
}
//alert(cubeBezierCurve([58,361],[368,373],[351,128],[512,96],0.34))
function offsetFrameByBezierCurve(){
    if (parseFloat(app.version) > 11.0){
        var win = new Window("palette", undefined, undefined, {borderless: false});
        win.margins = [0,0,0,0];
        var scriptpath = new File($.fileName);
        var flash = win.add ("flashplayer", undefined);
        flash.loadMovie(File (scriptpath.parent.fsName + "/Offset_Frame_By_Bezier_Curve_resources/DeCasteljau_Bezier_Curve.swf"));
       
        flash.createAEcomp = function(Ax,Ay,tgAx,tgAy,tgBx,tgBy,Bx,By,val){
                app.beginUndoGroup("Offset Frame By Bezier Curve");
                var a=[Ax,Ay], b=[tgAx,tgAy], c=[tgBx,tgBy], d=[Bx,By];
                var selectLayers = getSelectedLayers(getActiveComp());
                var fr = getActiveComp().frameRate;
                
                var min = getMinST(selectLayers);
                var max = getMaxST(selectLayers);
                var dur = max-min;
                for(i=0,ii=selectLayers.length;i<ii;i++){
                    var numb =i/(ii-1);
                    var p = cubeBezierCurve(a,b,c,d,numb)
                    var time = (a[0]-p[0])/(a[0]-d[0])*dur;
                    
                    selectLayers[i].startTime=(min+time)/fr;
                }
                app.endUndoGroup();
            }
        flash.closeScriptWindow = function(){ win.close(); }
        win.show();
    }
}
//offsetFrameByBezierCurve()

function subVector(A,B){
    var x = A[0]-B[0];
    var y = A[1]-B[1];
    var z = A[2]-B[2];
    return [x,y,z];
}

// 弧度转换成度
function radiansToDegrees(radians){
    degrees = radians * 180 / Math.PI;
    return degrees
}
// 度转换成弧度
function degreesToRadians(degrees){
    radians = degrees * Math.PI / 180;
    return radians
}
function angelVectors(A,B){
    var deg = radiansToDegrees(Math.acos(dot(normalize(A),normalize(B))));
    return deg
}
//alert(angelVectors(subVector([1354,0,2107],[332,0,1930]),[0,0,-1]))

function setLigthDiraction(){
    var comp = app.project.activeItem;
    var sel = comp.selectedLayers;
    var pos = comp.layer("target").transform.position.value;
    var tgtPos = [pos[0],0,pos[2]]
    //alert(pos[0])
    for(var i = 0; i<sel.length;i++){
        var layer = sel[i];
        var layerPos = layer.transform.position.value;
        var srcPos = [layerPos[0],0,layerPos[2]];
        var deg = angelVectors(subVector(tgtPos,srcPos),[0,0,-1]);
        var da = cross(normalize(subVector(tgtPos,srcPos)),[0,0,-1]);
        //$.writeln(da +"\n")
        if(da[1]>0){deg*=-1}
        $.writeln(deg +"\n")
        
        var orient = layer.transform.orientation.value;
        layer.transform.orientation.setValue([orient[0],deg,orient[2]]);
        
    }
}
setLigthDiraction()