struct MAXJson
(
	__keys__ = #(),
	__value__ = #(),
		
	fn format_type value =(
		local f_value = stringstream ""
		
		class_type = classof value

		if superclassof value == StructDef then(
			format "%" ("{" +value.__json__()+"}") to:f_value
			return f_value as string
			)
		else if class_type == String then(
			format "\"%\"" value to:f_value
			return f_value as string
		)
		
		else if class_type == Integer or class_type == Float then(
			format "%" value to:f_value
			return f_value as string
		)

		else if class_type == Array then(
			format "["  to:f_value
			for i=1 to value.count do(
				l_value = this.format_type value[i]
				
				format_s = "%,"
				if i == value.count do(
					format_s = "%"
				)
				format format_s l_value to:f_value
			)

			format "]" to:f_value	
		)
		else(
			print "????!!!!"
		)

		return f_value as string
	),
	
	fn __json__ = (
		data = ""
		
		for a in __keys__ do(
			data += "\""+ a + "\":"                           -- ??????????,??????,???“:”
			item = __value__[finditem __keys__ a]             -- ??????????
			
			end_s = ","
			if finditem __keys__ a >= __keys__.count do( -- 
				end_s = ""
			)
			if superclassof item == StructDef then(          -- ?????json??,????
				data += "{"+item.__json__()+"}"+ end_s
			)else(                                            -- ??,???????,  
				data += this.format_type(item) + end_s
			)
		)
		return data
	),
	
	fn json = (
		return "{"+ this.__json__()+"}"
	),
		
	fn items = (
		return this.__keys__
	),

	fn item key =(
		index = finditem this.__keys__ key 
		if index != 0 do(
			return this.__value__[index]
		)
	),

	fn add key value= (
		index = finditem this.__keys__ key
		if index == 0 do(
			append this.__keys__ key
			index = finditem this.__keys__ key
		)
		this.__value__[index] = value

	)
	
	
)

function writeFile content fname =(
	if (doesFileExist fname) then(deleteFile fname)
	
	f = createFile fname
	format content to:f
	
	close f
)


/*
Json Template:
{
	"CamLayer":[
		{
			"name":"C01",
			"position":{
				"time":[1,2,3],
				"value":[[10,20,30],[10,20,30],[10,20,30]],
			},
			"interest":{
				"time":[1,2,3],
				"value":[[10,20,30],[10,20,30],[10,20,30]],
			},
			"fov":{
				"time":[1,2,3],
				"value":[45,45,45],
			},
		},
	],
    "AVLayer":[
		{
			"type":"Solid",                                        // ???:Solid?Comp?Footage
			"name":"Solid 1",
			"width":1280,
			"height":720,
			"position":[
				{ "time":1, "value":[10,20,30] },
				{ "time":2, "value":[10,20,30] },
			],
			"scale":[
				{ "time":1, "value":[100,100,100] },
				{ "time":2, "value":[100,100,100] },
			],
			"rotation":[
				{ "time":1, "value":[0,0,0] },
				{ "time":2, "value":[0,0,0] },
			],
			"mask":[
				{
					"name":"Mask 1",
					"color":[0.1,0.2,0.3],
					"shape"{
						"vertices":[.., .., ..],
						"inTangents":[.., .., ..],
						"outTangents":[.., .., ..],
						"closed":true,
					},
				},
			],
		},
	],
	"LightLayer":[
		{
			"name":"Point Light",
			"position":[
				{ "time":1, "value":[10,20,30] },
				{ "time":2, "value":[10,20,30] },
			],
		},
	],
}
*/


-------------------- dingyi JSON --------------------
function allCamComp = (
	print "==========================================================================\n"
	content = ""
	
	unitsScale = 10
	if units.SystemType == #centimeters do unitsScale *= 0.01
	AE = MAXJson()

	--- Collect AVLayer Data 
	-- get formation Plane
	fm = $formation
	if fm==undefined or (classof fm != Plane) do (
		print "!!!:\n    not find Name is 'formation' Plane!"
		messageBox "!!!:\n    not find Name is 'formation' Plane!"  title:"AllCamComp"
		return false
	)
	
	content += fm.name + "\n"
	
	p = #()
	pos =  MAXJson()
	pos.add "time" 1.5
	pos.add "value" #(-1*fm.pos.x*unitsScale,-1*fm.pos.z*unitsScale,-1*fm.pos.y*unitsScale)
	pos.json()
	append p pos

	s = #()
	scl =  MAXJson()
	scl.add "time" 1
	scl.add "value" #(100*fm.scale.x,100*fm.scale.z,100*fm.scale.y)
	append s scl

	r = #()
	rot =  MAXJson()
	rot.add "time" 1
	rot.add "value" #((quatToEuler fm.transform.rotation).x,(quatToEuler fm.transform.rotation).y,-1*(quatToEuler fm.transform.rotation).z)
	append r rot

	wdh = fm.width*unitsScale
	het = fm.length*unitsScale

	AVJson = MAXJson()
	AVJson.add "type" "Solid"
	AVJson.add "name" fm.name
	AVJson.add "width" wdh
	AVJson.add "height" het
	AVJson.add "position" p
	AVJson.add "scale" s
	AVJson.add "rotation" r

	AVLayers = #()
	append AVLayers AVJson

	-- add AVLayerArray to AEJsonObject
	AE.add "AVLayer" AVLayers


	--- Collect Camera Data 
	temp_cam = cameras as array
	cams=#()
	for i in temp_cam do( 
		if (classof i)==Targetcamera then(
			camName = i.name
			if((camName.count==3) and (camName[1]=="C"))then(
				append cams i
			)
		)
	)
	if cams.count==0 do ( 
		print "!!!:\n    not find Camera Name is C01 - C99!!!"
		messageBox "!!!:\n    not find Camera Name is C01 - C99!!!"  title:"AllCamComp"
		return false
	)
	cameraLayers = #()
	for cam in cams do(
		-- get all pos keyframes
		ctlKeys = cam.pos.controller.keys                 
		-- collect times and values
		post = #()
		posv = #()
		if ctlKeys.count>1 then (
			startFrame = ctlKeys[1].time.frame
			endFrame = ctlKeys[ctlKeys.count].time.frame
			
			for i=startFrame to endFrame do(
				at time i campos = cam.pos
				append post i
				append posv #(-1*campos.x*unitsScale,-1*campos.z*unitsScale,-1*campos.y*unitsScale)
			)
		)else(
			append post 1
			append posv #(-1*cam.pos.x*unitsScale,-1*cam.pos.z*unitsScale,-1*cam.pos.y*unitsScale)
		)
		-- add times and value to POS dict
		pos = MAXJson()
		pos.add "time" post
		pos.add "value" posv

		
		-- get all target pos keyframes
		ctlKeys = cam.target.pos.controller.keys                 
		-- collect times and values
		trgt = #()
		trgv = #()
		if ctlKeys.count>1 then (
			startFrame = ctlKeys[1].time.frame
			endFrame = ctlKeys[ctlKeys.count].time.frame
			
			for i=startFrame to endFrame do(
				at time i trgpos = cam.target.pos
				append trgt i
				append trgv #(-1*trgpos.x*unitsScale,-1*trgpos.z*unitsScale,-1*trgpos.y*unitsScale)
			)
		)else(
			append trgt 1
			append trgv #(-1*cam.target.pos.x*unitsScale,-1*cam.target.pos.z*unitsScale,-1*cam.target.pos.y*unitsScale)
		)
		-- add times and value to TRGPOS dict
		trg = MAXJson()
		trg.add "time" trgt
		trg.add "value" trgv
		
		
		-- get all fov keyframes
		ctlKeys = cam.target.pos.controller.keys                 
		-- collect times and values
		fovt = #()
		fovv = #()
		if ctlKeys.count>1 then (
			startFrame = ctlKeys[1].time.frame
			endFrame = ctlKeys[ctlKeys.count].time.frame
			
			for i=startFrame to endFrame do(
				at time i camFov = cam.FOV
				append fovt i
				append fovv camFov
			)
		)else(
			append fovt 1
			append fovv cam.FOV
		)
		-- add times and value to FOV dict
		fov = MAXJson()
		fov.add "time" fovt
		fov.add "value" fovv

		
		-- create CameraJsonObject
		cameraJson = MAXJson()
		cameraJson.add "name" cam.name
		cameraJson.add "position" pos
		cameraJson.add "interest" trg
		cameraJson.add "fov" fov
		
		-- add CameraJsonObject to Array
		append cameraLayers cameraJson
		content += cam.name + "\n"
		print cam.name
	)

	-- add CameraArray to AEJsonObject
	AE.add "CameraLayer" cameraLayers

	AE.json()
	fpath = GetDir #export
	fname = fpath + "\AllCamComp.json"
	content+= ("outputPath:" + fpath) + "\n"
	print ("output path:" + fname)
	writeFile (AE.json()) fname
	print "Export Data is OK!!!"
	messageBox content  title:"AllCamComp"
)

allCamComp()
-- encryptScript "D:\works_assetTools\AfterEffect\AEScript\????\SJX Tools\allCamComp.ms"