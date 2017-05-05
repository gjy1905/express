var viewer = new Cesium.Viewer('cesiumContainer',{
   //是否创建动画小器件，左下角仪表 
  animation:false, 
  //是否显示图层选择器 
  baseLayerPicker:true,
  //是否显示全屏按钮 
  fullscreenButton:false, 
  //是否显示geocoder小器件，右上角查询按钮 
  geocoder:true, 
  //是否显示Home按钮 
  homeButton:true, 
  //是否显示信息框 
  infoBox:false, 
  //是否显示3D/2D选择器 
  sceneModePicker:false, 
  //是否显示选取指示器组件 
  selectionIndicator : false,
  //是否显示时间轴 
  timeline:false, 
  //是否显示右上角的帮助按钮 
  navigationHelpButton:false,

   shadows : false,


//全球影像
  // imageryProvider: new Cesium.createTileMapServiceImageryProvider({
  //                 url: 'http://192.168.1.118/CesiumData/Map/World/',
  //                // url: 'javascripts/Cesium/Assets/Textures/NaturalEarthII',
  //                 }),

//天地图瓦片
  // imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
  //     url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
  //     layer: "tdtBasicLayer",
  //     style: "default",
  //     format: "image/jpeg",
  //     tileMatrixSetID: "GoogleMapsCompatible",
  //     show: false
  // }),
 });



//叠加额外数据
  var options = {
      camera : viewer.scene.camera,
      canvas : viewer.scene.canvas
    };
  window.cesiumViewer=viewer;
  var scene = viewer.scene;
  var layers = viewer.imageryLayers;
  var glowingLine = null;
  // viewer.scene.globe.depthTestAgainstTerrain = true; //地形锁定
  // viewer._cesiumWidget._creditContainer.style.display = "none"; //logo隐藏



//鸭溪地形
     // var terrainYaxi = new Cesium.CesiumTerrainProvider({
     //     url: 'http://192.168.1.118/CesiumData/Terrain/Yaxi1',
     //     //                url: 'http://192.168.1.118/CesiumData/Terrain/YaXi_0.5',    此地形和模型完全贴合
     // });
     // viewer.terrainProvider = terrainYaxi;

//全球矢量中文注记服务
  var imageryWorld = layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
    layer: "tdtAnnoLayer",
    style: "default",
    format: "image/jpeg",
    tileMatrixSetID: "GoogleMapsCompatible"
  }));

  // imageryWorld.alpha = 0.5;
  // imageryWorld.brightness = 2.0;


  //全国影像
      // var imageryChina = layers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
      //          url: 'http://192.168.1.118/CesiumData/Map/China',
      //          credit: "imageryChina"
      //      }));

  //遵义影像
     // var imageZunyi = layers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
     //     url: 'http://192.168.1.118/CesiumData/Map/Zunyi',
     //     credit: "imageZunyi"
     // }));



  //国界
  var guojiLyr;
  viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/guojie.kml', options)).then(function(){
      guojiLyr = getKmlLayer("国界省界.kml")[0];
  });


  //省界
    var shuixi;
    viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/liuyushuixil.kml', options)).then(function (){
        shuixi = getKmlLayer("贵州水系流域.kml")[0];
    });

  //   //贵州水系流域
  //   viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/liuyushuixil.kml', {
  //       camera: viewer.scene.camera,
  //       canvas: viewer.scene.canvas,
  //       clampToGround: true
  //   })).then(function (dataSource) {
  //       var entities = dataSource.entities.values;
  //       for (var i = 0; i < entities.length; i++) {
  //           if (entities[i].corridor) {
  //               entities[i].allowPicking = false;
  //               entities[i].corridor.width = 2000.0;
  //               entities[i].corridor.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(1000000, 2000000);
  //               entities[i].corridor.show = true;
  //           }
  //       }
  //   });


  //   //贵州水系流域
    viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/liuyushuixi.kml', options)).then(function (dataSource) {
        var entities = dataSource.entities.values;
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].label) {
                entities[i].allowPicking = false;
                entities[i].label.font = '20px sans-serif';
                entities[i].label.outlineColor = Cesium.Color.BLACK;
                entities[i].label.outlineWidth = 2;
                entities[i].label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
                entities[i].label.showBackground = false;
                entities[i].label.scale = 1.0;
                entities[i].label.show = true;
                entities[i].label.HeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                entities[i].label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                entities[i].label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                entities[i].label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(1000000, 2000000);
                entities[i].billboard.show = false;
            }
        }
    });

   
    //贵州行政规划
    // viewer.dataSources.add(Cesium.KmlDataSource.load('/javascripts/Cesium/module/MapLoader/Data/xingzhengl.kml', {
    //     camera: viewer.scene.camera,
    //     canvas: viewer.scene.canvas,
    //     clampToGround: true
    // })).then(function (dataSource) {
    //     var entities = dataSource.entities.values;
    //     for (var i = 0; i < entities.length; i++) {
    //         if (entities[i].corridor) {
    //             entities[i].allowPicking = false;
    //             entities[i].corridor.width = 1000.0;
    //             entities[i].corridor.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(100000, 1000000);
    //             entities[i].corridor.show = true;
    //         }
    //     }
    // });


  // //贵州行政规划
  //   viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/xingzheng.kml', options)).then(function (dataSource) {
  //       var entities = dataSource.entities.values;
  //       for (var i = 0; i < entities.length; i++) {
  //           if (entities[i].label) {
  //               entities[i].allowPicking = false;
  //               entities[i].label.allowPicking = false;
  //               entities[i].label.font = '20px sans-serif';
  //               entities[i].label.fillColor = Cesium.Color.WHITE;
  //               entities[i].label.outlineColor = Cesium.Color.BLACK;
  //               entities[i].label.outlineWidth = 2;
  //               entities[i].label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
  //               entities[i].label.showBackground = false;
  //               entities[i].label.scale = 1.0;
  //               entities[i].label.show = true;
  //               entities[i].label.HeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
  //               entities[i].label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
  //               entities[i].label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
  //               entities[i].label.eyeOffset = new Cesium.Cartesian3(0.0, 1500, 0.0);
  //               entities[i].label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(500000, 1000000);
  //               entities[i].billboard.show = false;
  //           }
  //       }
  //   });

  //贵州各级区县
   viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/quxianl.kml', {
       camera: viewer.scene.camera,
       canvas: viewer.scene.canvas,
       clampToGround: true
   })).then(function (dataSource) {
       var entities = dataSource.entities.values;
       for (var i = 0; i < entities.length; i++) {
           if (entities[i].corridor) {
               entities[i].allowPicking = false;
               entities[i].corridor.width = 800.0;
               entities[i].corridor.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(100000, 500000);
               entities[i].corridor.show = true;
           }
       }
   });
    


  //鸭溪矢量
    viewer.dataSources.add(Cesium.KmlDataSource.load('/Cesium/module/MapLoader/Data/yaxi.kml', {
        camera: viewer.scene.camera,
        canvas: viewer.scene.canvas,
        clampToGround: true
    })).then(function (dataSource) {
        var entities = dataSource.entities.values;
        for (var i = 0; i < entities.length; i++) {
            if (entities[i].corridor) {
                entities[i].allowPicking = false;
                entities[i].corridor.width = 100.0;
                entities[i].corridor.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(5000, 500000);
                entities[i].corridor.show = true;
            }
        }
    });



//  添加模型
    var url1='http://192.168.1.118/CesiumData/Model/Shatan/Shatan.json';
    var url2='http://192.168.1.118/CesiumData/Model/Yaxi/Yaxi.json';
    //var url3='/javascripts/Cesium/module/putout/0/tileset.json';

    youhua(url1,110);
    youhua(url2,100);
    //youhua(url3,10);

//  将类似代码优化封装成函数
    var school;
    function youhua(url,height){
        var heightOffset =height;
        var url =url;
        school = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url :url,
            maximumScreenSpaceError: 1, //越高效果越差，但是性能越好
            maximumNumberOfLoadedTiles: 1000
        }));

        school.readyPromise.then(function(tileset) {
            var boundingSphere = tileset.boundingSphere;
            // viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
            // viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            // Position tileset
            var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
            var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
            var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
            var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
            tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            console.log(tileset.modelMatrix);
        });
    };




// 获取kml图层组
    function getKmlLayer(kmlName) {
        var layer = [];
        for (var i = 0; i < viewer.dataSources._dataSources.length; i++) {
            if (viewer.dataSources._dataSources[i].name == kmlName) {
                layer.push(viewer.dataSources._dataSources[i]);
            }
        }
        return layer;
    };

// 获取3Dtile
    function get3Dtile(tileUrl) {
        var url = "http://localhost/CesiumData/" + tileUrl;
        var layer;
        for (var i = 0; i < viewer.scene.primitives._primitives.length; i++) {
            if (Cesium.defined(viewer.scene.primitives._primitives[i]._url)) {
                if (viewer.scene.primitives._primitives[i]._url == url) {
                    layer = viewer.scene.primitives._primitives[i];
                }
            }
        }
        return layer;
    };