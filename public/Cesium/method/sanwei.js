
//gis测量
	var gisPannel = function () {
		$("#infoGis").html(null);
		$("#gisBar").toggleClass('show');
		$("#infoGis").toggleClass('show');
	}

//定位到项目位置
	function dingwei(a,b,c){
		var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(a,b,c), 1500);
    	viewer.camera.flyToBoundingSphere(boundingSphere);
	}

	$("#yaxi").click(function(){
		dingwei(106.6647889259,27.5918400069,800);
	});

	$("#zunyi").click(function(){
		dingwei(107.6647889259,27.5918400069,1000);
	});

	$("#changsha").click(function(){
		dingwei(112.5547889259,28.142801,1000);
	});

//标注点显示与隐藏
	var entities = viewer.entities;
	var bluePin = entities.add(new Cesium.Entity());
	var pinBuilder = new Cesium.PinBuilder();
		entities.add({
	        parent : bluePin,
	        name : 'Blank blue pin',
		    position : Cesium.Cartesian3.fromDegrees(106.6647889259,27.5918400069,915),
		    billboard : {
		        image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
		        verticalOrigin : Cesium.VerticalOrigin.BOTTOM
		    },
		    //show : false
		});
		
	$("#biaozhu").click(function(){
		bluePin.show = !bluePin.show;
	});

//播放视频
	$("#video").click( function() {
		$("#vi").toggle();
	});
//播放音频
	$("#music").click( function() {
		$("#mu").toggle();
	});

//清除所有kml图层
	// $("#layer").click( function() {
	// 	viewer.dataSources.removeAll();
	// });

//Add Cesium Inspector
//viewer.extend(Cesium.viewerCesiumInspectorMixin);


// 
var canvas = viewer.canvas;
var clock = viewer.clock;
var camera = viewer.scene.camera;
 
//监听键盘事件，用于平移或者旋转镜头
var ellipsoid = scene.globe.ellipsoid;
canvas.onclick = function()
{
    canvas.focus();
};
var flags = {
    looking : false,
    rotateLeft : false,
    rotateRight : false,
    moveUp : false,
    moveDown : false,
    moveLeft : false,
    moveRight : false
};
var handler = new Cesium.ScreenSpaceEventHandler( canvas );
function getFlagForKeyCode( keyCode )
{
    switch ( keyCode )
    {
        case 'W'.charCodeAt( 0 ) : //向下平移镜头
            return 'moveDown';
        case 'S'.charCodeAt( 0 ) : //向上平移镜头
            return 'moveUp';
        case 'A'.charCodeAt( 0 ) : //向右平移镜头
            return 'moveRight';
        case 'D'.charCodeAt( 0 ) : //向左平移镜头
            return 'moveLeft';
        case 'Q'.charCodeAt( 0 ) : //向右旋转镜头
            return 'rotateRight';
        case 'E'.charCodeAt( 0 ) : //向左旋转镜头
            return 'rotateLeft';
        default :
            return undefined;
    }
}
document.addEventListener( 'keydown', function( e )
{
    var flagName = getFlagForKeyCode( e.keyCode );
    if ( typeof flagName !== 'undefined' )
    {
        flags[flagName] = true;
    }
}, false );
document.addEventListener( 'keyup', function( e )
{
    var flagName = getFlagForKeyCode( e.keyCode );
    if ( typeof flagName !== 'undefined' )
    {
        flags[flagName] = false;
    }
}, false );
viewer.clock.onTick.addEventListener( function( clock )
{
    var cameraHeight = ellipsoid.cartesianToCartographic( camera.position ).height;
    var moveRate = cameraHeight / 100.0;
 
    if ( flags.rotateLeft )
    {
        camera.rotateLeft( 0.01 );
    }
    if ( flags.rotateRight )
    {
        camera.rotateRight( 0.01 );
    }
    if ( flags.moveUp )
    {
        camera.moveUp( moveRate );
    }
    if ( flags.moveDown )
    {
        camera.moveDown( moveRate );
    }
    if ( flags.moveLeft )
    {
        camera.moveLeft( moveRate );
    }
    if ( flags.moveRight )
    {
        camera.moveRight( moveRate );
    }
} );

//定义相机视角范围
viewer.camera.setView({
    destination: Cesium.Rectangle.fromDegrees(70.591, 5.837, 148.970, 65.730)
});

//图层控制
	$("#layer").click( function() {
		$("#tuceng").toggle();
	});

	$("#guojie").click( function() {
		 guojiLyr.show = !guojiLyr.show;
	});

	$("#shengjie").click( function() {
		 shuixi.show = !shuixi.show;
	});

	$("#diming").click( function() {
		 imageryWorld.show = !imageryWorld.show;
	});

	$("#yx").click( function() {
		 school.show = !school.show;
	});

	$("#shantan").click( function() {
		 school.show = !school.show;
	});

	$("#atmosphere").click(function(){		    
        viewer.scene.skyAtmosphere.show = !viewer.scene.skyAtmosphere.show;
	});

	$("#light").click(function(){		    
        viewer.scene.globe.enableLighting = !viewer.scene.globe.enableLighting;
	});

	$("#fog").click(function(){		    
        viewer.scene.fog.enabled = !viewer.scene.fog.enabled;
	});

	$("#effect").click( function() {
		$("#effect2").toggle();
	});

	//水面效果

    $("#water").click(function(){
       worldRectangle.show = !worldRectangle.show;
    });

 //    var waterPolygon = viewer.scene.primitives.add(new Cesium.Primitive({
	//     geometryInstances: new Cesium.GeometryInstance({
	//         geometry: new Cesium.PolygonGeometry({
	//             polygonHierarchy: new Cesium.PolygonHierarchy(
	//                 Cesium.Cartesian3.fromDegreesArray([0,20,
	//                 	0,0,
	//                 	20,0,
	//                 	20,20
	//             ])
	//             ),
	//             height: 1062
	//         })
	//     }),
	//     appearance: new Cesium.EllipsoidSurfaceAppearance({
	//         aboveGround: false
	//     }),
	// }));

    var worldRectangle = viewer.scene.primitives.add(new Cesium.Primitive({
	    geometryInstances : new Cesium.GeometryInstance({
	        geometry : new Cesium.RectangleGeometry({
	            rectangle : Cesium.Rectangle.fromDegrees(-180.0, -90.0, 180.0, 90.0),
	            vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
	        })
	    }),
	    appearance : new Cesium.EllipsoidSurfaceAppearance({
	        aboveGround : false
	    }),
	    show : false
  	}));

  	worldRectangle.appearance.material = new Cesium.Material({
        fabric: {
            type: 'Water',
            uniforms: {
            	baseWaterColor: Cesium.Color.fromBytes(0, 55, 120, 0),
                normalMap: 'Cesium/Assets/Textures/waterNormals.jpg',
                specularMap: 'Cesium/Assets/Textures/earthspec1k.jpg', 
                frequency: 10000.0,
                animationSpeed: 0.02,
                amplitude: 1.0
                //specularIntensity: 0.3
            }
        }
    });

  	//worldRectangle.appearance.material = Cesium.Material.fromType('Grid');



