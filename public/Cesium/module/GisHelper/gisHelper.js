/**
 * Created by zzc on 2017/2/20.
 */
// define("gisHelper", ["jquery", "AppCommon", "ele", "turf"], function ($, AppCommon, ele, turf) {

    // var gisHelper = {

        var viewer = null;
        var layerModels = [];
        var billboards= [];
        var polylines= [];
        var polygons= [];
        var entities= [];

        GisBar();

         function GisBar() {
            var that = this;
            var cesiumWidget = window.cesiumViewer;
            var scene = cesiumWidget.scene;
            var positions;

            var drawHelper = new DrawHelper(cesiumWidget);
            var toolbar = drawHelper.addToolbar(document.getElementById("gisBar"), {
                buttons: ['marker', 'polyline', 'polygon', 'clear']
            });

            // 点按钮
            toolbar.addListener('markerCreated', function (event) {
                var b = new Cesium.BillboardCollection();
                billboards.push(b);
                scene.primitives.add(b);
                var billboard = b.add({
                    show: true,
                    position: event.position,
                    pixelOffset: new Cesium.Cartesian2(0, 0),
                    eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.CENTER,
                    scale: 1.0,
                    image: 'Cesium/module/GisHelper/Image/glyphicons_242_google_maps.png',
                    color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
                });

                //信息框展示
                var position = Cesium.Ellipsoid.WGS84.cartesianToCartographic(event.position);
                var height = Number(position.height).toFixed(3);
                var long = Cesium.Math.toDegrees(position.longitude).toFixed(3);
                var lat = Cesium.Math.toDegrees(position.latitude).toFixed(3);

                if (height < 0) {
                    height = "此地点无高程信息";
                }

                var message = "经度: " + long + "&nbsp&nbsp纬度: " + lat + "&nbsp&nbsp高程: " + height;
                document.getElementById("infoGis").innerHTML = message;


            });

            //路径按钮
            toolbar.addListener('polylineCreated', function (event) {
                positions = unique(event.positions)
                var polyline = new DrawHelper.PolylinePrimitive({
                    positions: event.positions,
                    width: 7,
                    geodesic: true
                });
                polylines.push(polyline);
                scene.primitives.add(polyline);

                //找到最后一个点
                var labelPosition = positions[positions.length - 1];
                var cartographic = Cesium.Cartographic.fromCartesian(labelPosition);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                var height = cartographic.height + 5;


                //信息框展示
                var distance = 0;
                var message = null;
                for (var i = 0, len = positions.length - 1; i < len; i++) {
                    //计算两点间距离并叠加到总距离
                    distance += Cesium.Cartesian3.distance(positions[i], positions[i + 1]);
                }
                if (distance >= 1000) {
                    distance /= 1000;
                    message = '总长度：' + distance.toFixed(2) + '千米';
                    var labelEntity = viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                        label: {
                            text: distance.toFixed(2) + '千米'
                        }
                    });
                    entities.push(labelEntity);
                } else {
                    message = '总长度：' + distance.toFixed(2) + '米';
                    var labelEntity = viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                        label: {
                            text: distance.toFixed(2) + '米'
                        }
                    });
                    entities.push(labelEntity);
                }

                if (distance >= 0) {
                    document.getElementById("infoGis").innerHTML = message;
                }
            });

            //多边形按钮
            toolbar.addListener('polygonCreated', function (event) {
                positions = unique(event.positions)
                var height = getPolygonHeight(event.heights);
                var polygon = new Cesium.Entity({
                    polygon: {
                        hierarchy: {
                            positions: event.positions,
                        },
                        height: height,
                        material: Cesium.Color.BLUE.withAlpha(0.5)
                    }
                });
                polygons.push(polygon);
                cesiumWidget.entities.add(polygon);

                //信息框展示
                var message = null;
                var array = [];
                //将所有的点都转化成经纬度并添加至数组中
                for (var i = 0, len = positions.length; i < len; i++) {
                    var cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
                    var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                    var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);
                    array.push({
                        x: longitude,
                        y: latitude
                    });
                }
                var arrs = new Array();
                var tems = new Array();
                arrs.push(tems);
                for (var i = 0, len = array.length; i < len; i++) {
                    tems.push([array[i].x, array[i].y])
                }
                arrs[0].push([array[0].x,array[0].y]);
                //包装成turf指定的对象
                var polygons = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": arrs
                        }
                    }, {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                    [0, 0],
                                    [0, 0]
                                ]
                            ]
                        }
                    }]
                };
                // 通过tuif.js计算中心点
                var pointOnPolygon = turf.pointOnSurface(polygons);
                var longitude = Number(pointOnPolygon.geometry.coordinates[0]);
                var latitude = Number(pointOnPolygon.geometry.coordinates[1]);
                var labelHeight = height + 5;

                //通过turf.js计算面积
                var area = turf.area(polygons);
                if (area >= 1000000) {
                    area /= 1000000;
                    message = '总面积：' + area.toFixed(2) + '平方千米';
                    var labelEntity = viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, labelHeight),
                        label: {
                            text: area.toFixed(2) + '平方千米'
                        }
                    });
                    entities.push(labelEntity);
                } else {
                    message = '总面积：' + area.toFixed(2) + '平方米';
                    var labelEntity = viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(longitude, latitude, labelHeight),
                        label: {
                            text: area.toFixed(2) + '平方米'
                        }
                    });
                    entities.push(labelEntity);
                }
                document.getElementById("infoGis").innerHTML = message;
            });

            //清除按钮
            toolbar.addListener('deleteAll', function (event) {
                for (var i in billboards) {
                    scene.primitives.remove(billboards[i]);
                }
                for (var i in polylines) {
                    scene.primitives.remove(polylines[i]);
                }
                for (var i in polygons) {
                    cesiumWidget.entities.remove(polygons[i]);
                }
                for (var i in entities) {
                    cesiumWidget.entities.remove(entities[i]);
                }
                document.getElementById("infoGis").innerHTML = null;
            });

        };

        function unique (arr) {
            var res = [];
            var json = {};
            for (var i = 0; i < arr.length; i++) {
                if (!json[arr[i]]) {
                    res.push(arr[i]);
                    json[arr[i]] = 1;
                }
            }
            return res;
        };

        function getPolygonHeight (arr) {
            var maxHeight;
            for (var i = 0; i < arr.length; i++) {
                if (i == 0) {
                    maxHeight = arr[i];
                } else if (arr[i] > maxHeight) {
                    maxHeight = arr[i];
                }
            }
            return maxHeight;
        };

        function gisBarOpen () {
            var open = true;
            var that = this;
            $("#measure").click(function () {
                if (open) {
                    initGisBar();
                    open = false;
                }
                document.getElementById("infoGis").innerHTML = null;
                $("#gisBar").toggleClass('show');
                $("#infoGis").toggleClass('show');
            });
        };

    // };

    // return gisHelper;

// });