/**
 * Created by zzc on 2017/1/13.
 */
//define("mapLoader", ["jquery", "domReady"], function ($, domReady) {
//    var mapLoader = {

        var viewer: null,
        var layerModels: [],

        initMap();

         function initMap () {

            viewer = new Cesium.Viewer('map3d', {
                // imageryProvider: new Cesium.createTileMapServiceImageryProvider({
                //     url: 'http://localhost/CesiumData/Map/GlobalTMS/',
                // }),
                imageryProvider: new Cesium.createTileMapServiceImageryProvider({
                    url: 'http://192.168.1.118/CesiumData/Map/World/',
                }),
                baseLayerPicker: false, //地图选择，需联网
                animation: true,
                navigationHelpButton: false,
                timeline: true,
                geocoder: false,
                fullscreenButton: false,
                vrButton: false, //VR 按钮
                sceneModePicker: false,
                infoBox: false,
                scene3DOnly: false,
                homeButton: false,
            });

            this.viewer = viewer;
            window.cesiumViewer = viewer;

            //部分变量定义
            var options = {
                camera: viewer.scene.camera,
                canvas: viewer.scene.canvas
            };

            var that = this;
            var scene = viewer.scene;
            var layers = viewer.imageryLayers;
            var glowingLine = null;
            viewer.scene.globe.depthTestAgainstTerrain = true; //地形锁定
            viewer._cesiumWidget._creditContainer.style.display = "none"; //logo隐藏

            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(109.7827, 28.3689, 15410800)
            });

            //鸭溪地形
           var terrainYaxi = new Cesium.CesiumTerrainProvider({
               url: 'http://192.168.1.118/CesiumData/Terrain/Yaxi1',
               //                url: 'http://192.168.1.118/CesiumData/Terrain/YaXi_0.5',    此地形和模型完全贴合
           });
           viewer.terrainProvider = terrainYaxi;

            //全国影像
           var imageryChina = layers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
               url: 'http://192.168.1.118/CesiumData/Map/China',
               credit: "imageryChina"
           }));

            //遵义影像
           var imageZunyi = layers.addImageryProvider(new Cesium.createTileMapServiceImageryProvider({
               url: 'http://192.168.1.118/CesiumData/Map/Zunyi',
               credit: "imageZunyi"
           }));

            //国界
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/guojie.kml', options));

            //省名
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/shengming.kml', options)).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].label) {
                        entities[i].allowPicking = false;
                        entities[i].label.allowPicking = false;
                        entities[i].label.font = '22px sans-serif';
                        entities[i].label.fillColor = Cesium.Color.WHITE;
                        entities[i].label.outlineColor = Cesium.Color.BLACK;
                        entities[i].label.outlineWidth = 2;
                        entities[i].label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
                        entities[i].label.showBackground = false;
                        entities[i].label.scale = 1.0;
                        entities[i].label.show = true;
                        entities[i].label.HeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        entities[i].label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        entities[i].label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                        entities[i].billboard.show = false;
                    }
                }
            });


            //省界
            // var twoYaxi = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
            //     url: 'http://192.168.1.111:6080/arcgis/rest/services/Cesium/ZGSJ/MapServer',
            //     enablePickFeatures: false
            // }));

            //省界
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/shengjie.kml', options)).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].polyline) {
                        entities[i].allowPicking = false;
                        entities[i].polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(500000, 7000000);
                        entities[i].polyline.show = true;
                    }
                }
            });

            //贵州边界
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/guizhou.kml', options)).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].polyline) {
                        entities[i].allowPicking = false;
                        entities[i].polyline.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(500000, 3000000);
                        entities[i].polyline.show = true;
                    }
                }
            });


            //贵州水系流域
            // var twoYaxi = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
            //     url: 'http://192.168.1.111:6080/arcgis/rest/services/Cesium/GzWaterAndBasin/MapServer',
            //     enablePickFeatures: false
            // }));

            //贵州水系流域
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/liuyushuixil.kml', {
                camera: viewer.scene.camera,
                canvas: viewer.scene.canvas,
                clampToGround: true
            })).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].corridor) {
                        entities[i].allowPicking = false;
                        entities[i].corridor.width = 2000.0;
                        entities[i].corridor.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(1000000, 2000000);
                        entities[i].corridor.show = true;
                    }
                }
            });




            //贵州水系流域
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/liuyushuixi.kml', options)).then(function (dataSource) {
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
            // var twoGuizhou = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
            //     url: 'http://192.168.1.111:6080/arcgis/rest/services/Cesium/GuizhouShi/MapServer',
            //     enablePickFeatures: false,
            // }));

            //贵州各级区县
            // var twoGuizhou = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
            //     url: 'http://192.168.1.111:6080/arcgis/rest/services/Cesium/GuizhouXian/MapServer',
            //     enablePickFeatures: false,
            // }));

            //贵州行政规划
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/xingzhengl.kml', {
                camera: viewer.scene.camera,
                canvas: viewer.scene.canvas,
                clampToGround: true
            })).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].corridor) {
                        entities[i].allowPicking = false;
                        entities[i].corridor.width = 1000.0;
                        entities[i].corridor.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(100000, 1000000);
                        entities[i].corridor.show = true;
                    }
                }
            });


            //贵州行政规划
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/xingzheng.kml', options)).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].label) {
                        entities[i].allowPicking = false;
                        entities[i].label.allowPicking = false;
                        entities[i].label.font = '20px sans-serif';
                        entities[i].label.fillColor = Cesium.Color.WHITE;
                        entities[i].label.outlineColor = Cesium.Color.BLACK;
                        entities[i].label.outlineWidth = 2;
                        entities[i].label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
                        entities[i].label.showBackground = false;
                        entities[i].label.scale = 1.0;
                        entities[i].label.show = true;
                        entities[i].label.HeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        entities[i].label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        entities[i].label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                        entities[i].label.eyeOffset = new Cesium.Cartesian3(0.0, 1500, 0.0);
                        entities[i].label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(500000, 1000000);
                        entities[i].billboard.show = false;
                    }
                }
            });

            //贵州各级区县
           viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/quxianl.kml', {
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
            
            
            //贵州各级区县
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/quxian.kml', options)).then(function (dataSource) {
                var entities = dataSource.entities.values;
                for (var i = 0; i < entities.length; i++) {
                    if (entities[i].label) {
                        entities[i].allowPicking = false;
                        entities[i].label.font = '16px sans-serif';
                        entities[i].label.fillColor = Cesium.Color.WHITE;
                        entities[i].label.outlineColor = Cesium.Color.BLACK;
                        entities[i].label.outlineWidth = 2;
                        entities[i].label.style = Cesium.LabelStyle.FILL_AND_OUTLINE;
                        entities[i].label.scale = 1.0;
                        entities[i].label.show = true;
                        entities[i].label.HeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
                        entities[i].label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        entities[i].label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
                        entities[i].label.eyeOffset = new Cesium.Cartesian3(0.0, 1500, 0.0);
                        entities[i].label.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(100000, 500000);
                        entities[i].billboard.show = false;
                    }
                }
            });

            //鸭溪矢量
            // var twoYaxi = layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
            //     url: 'http://192.168.1.111:6080/arcgis/rest/services/Cesium/yaxi/MapServer',
            //     enablePickFeatures: false
            // }));

            //鸭溪矢量
            viewer.dataSources.add(Cesium.KmlDataSource.load('js/module/MapLoader/Data/yaxi.kml', {
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


            //模型鸭溪镇
            this.loadModel(110.0, 'http://192.168.1.118/CesiumData/Model/Yaxi/Yaxi.json', viewer)
            // this.loadModel(110.0, 'http://localhost/CesiumData/Model/Yaxi/Yaxi.json', viewer)

            //模型水库
            this.loadModel(130.0, 'http://192.168.1.118/CesiumData/Model/HuYang/SceneA/Production_Cesium_v3A.json', viewer)
            this.loadModel(130.0, 'http://192.168.1.118/CesiumData/Model/HuYang/SceneB/Production_Cesium_v3.json', viewer)
            this.loadModel(130.0, 'http://192.168.1.118/CesiumData/Model/HuYang/SceneC/Production_2.json', viewer)
            this.loadModel(130.0, 'http://192.168.1.118/CesiumData/Model/HuYang/SceneD/Production_3.json', viewer)
            this.loadModel(135.0, 'http://192.168.1.118/CesiumData/Model/HuYangB/SceneA/Production_6_Cesium.json', viewer)
            this.loadModel(140.0, 'http://192.168.1.118/CesiumData/Model/HuYangB/SceneB/Production_2_cesium.json', viewer)

            //沙滩模型
            this.loadModel(130.0, 'http://192.168.1.118/CesiumData/Model/Shatan/Shatan.json', viewer)


        },

        initloderModel();

        function loadModel (height, url, viewer) {
            var heightOffset = height;
            var model = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
                url: url,
                maximumScreenSpaceError: 1, //越高效果越差，但是性能越好
                maximumNumberOfLoadedTiles: 1000
            }));
            model.readyPromise.then(function (tileset) {
                var boundingSphere = tileset.boundingSphere;
                viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -2.0, 0));
                viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                // Position tileset
                var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
                var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
                var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
                var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
                tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
            });
        },


    };

 //   return mapLoader;


//});