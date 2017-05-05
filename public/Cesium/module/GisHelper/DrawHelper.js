/**
 * Created by thomas on 9/01/14.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * (c) www.geocento.com
 * www.metaaps.com
 *
 */

var DrawHelper = (function () {

    // static variables
    var ellipsoid = Cesium.Ellipsoid.WGS84;

    // constructor
    function _(cesiumWidget) {
        this._scene = cesiumWidget.scene;
        var div = document.getElementById("cesiumContainer");
        this._tooltip = createTooltip(div);
        this._surfaces = [];
        //供删除使用
        this._billboardsGroup = [];
        this._handlers = [];
    }

    _.prototype.setListener = function (primitive, type, callback) {
        primitive[type] = callback;
    }

    _.prototype.muteHandlers = function (muted) {
        this._handlersMuted = muted;
    }

    _.prototype.startDrawing = function (cleanUp) {
        if (this.editCleanUp) {
            this.editCleanUp();
        }
        this.editCleanUp = cleanUp;
        this.muteHandlers(true);
    }

    _.prototype.stopDrawing = function () {
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
            this.editCleanUp = null;
        }
        this.muteHandlers(false);
    }

    _.prototype.getScreenHeight = function () {
        var scene = window.cesiumViewer.scene;
        var canvas = scene.canvas;
        var center = new Cesium.Cartesian2(
            canvas.clientWidth / 2,
            canvas.clientHeight / 2);
        var target = pickOnTerrainOrEllipsoid(scene, center);

        function pickOnTerrainOrEllipsoid(scene, pixel) {
            var target = null;
            var pickedObject = scene.pick(pixel)
            if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                target = scene.pickPosition(pixel);
            } else {
                var ray = scene.camera.getPickRay(pixel);
                target = scene.globe.pick(ray, scene);
            }
            return target || scene.camera.pickEllipsoid(pixel);
        };

        if (!target) {
            var globe = scene.globe;
            var carto = scene.camera.positionCartographic.clone();
            var height = globe.getHeight(carto);
            carto.height = height !== void 0 ? height : 0;
            target = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);
        }
        return Cesium.Ellipsoid.WGS84.cartesianToCartographic(target).height;
    }

    var material = Cesium.Material.fromType(Cesium.Material.ColorType);
    material.uniforms.color = new Cesium.Color(0.0, 0.0, 1.0, 0.5);

    var defaultShapeOptions = {
        ellipsoid: Cesium.Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false
    }

    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new Cesium.EllipsoidSurfaceAppearance({
            aboveGround: false
        }),
        material: material,
        granularity: Math.PI / 180.0
    });

    var defaultPolygonOptions = copyOptions(defaultShapeOptions, {});

    var defaultEllipseOptions = copyOptions(defaultSurfaceOptions, {
        rotation: 0
    });

    var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
        width: 5,
        geodesic: true,
        granularity: 10000,
        appearance: new Cesium.PolylineMaterialAppearance({
            aboveGround: false
        }),
        material: material
    });

    var ChangeablePrimitive = (function () {
        function _() {}

        _.prototype.initialiseOptions = function (options) {

            fillOptions(this, options);

            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        }

        _.prototype.setAttribute = function (name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function (name) {
            return this[name];
        };

        /**
         * @private
         */
        _.prototype.update = function (context, frameState, commandList) {

            if (!Cesium.defined(this.ellipsoid)) {
                throw new Cesium.DeveloperError('this.ellipsoid must be defined.');
            }

            if (!Cesium.defined(this.appearance)) {
                throw new Cesium.DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new Cesium.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!Cesium.defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== this.ellipsoid) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }

                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    this._outlinePolygon = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new Cesium.PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },
                                lineWidth: Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1])
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function () {
            return false;
        };

        _.prototype.destroy = function () {
            this._primitive = this._primitive && this._primitive.destroy();
            return Cesium.destroyObject(this);
        };

        _.prototype.setStrokeStyle = function (strokeColor, strokeWidth) {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        }

        return _;
    })();

    _.PolygonPrimitive = (function () {

        function _(options) {

            options = copyOptions(options, defaultSurfaceOptions);

            this.initialiseOptions(options);

            this.isPolygon = true;

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };

        _.prototype.getGeometry = function () {

            if (!Cesium.defined(this.positions) || this.positions.length < 3) {
                return;
            }

            return Cesium.PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function () {
            return Cesium.PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        }

        return _;
    })();

    _.PolylinePrimitive = (function () {

        function _(options) {

            options = copyOptions(options, defaultPolylineOptions);

            this.initialiseOptions(options);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function (positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.setWidth = function (width) {
            this.setAttribute('width', width);
        };

        _.prototype.setGeodesic = function (geodesic) {
            this.setAttribute('geodesic', geodesic);
        };

        _.prototype.getPositions = function () {
            return this.getAttribute('positions');
        };

        _.prototype.getWidth = function () {
            return this.getAttribute('width');
        };

        _.prototype.getGeodesic = function (geodesic) {
            return this.getAttribute('geodesic');
        };

        _.prototype.getGeometry = function () {

            if (!Cesium.defined(this.positions) || this.positions.length < 2) {
                return;
            }

            return new Cesium.PolylineGeometry({
                positions: this.positions,
                // height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid
            });
        }

        return _;
    })();

    var defaultBillboard = {
        iconUrl: "Cesium/module/GisHelper/Image/dragIcon.png",
        shiftX: 0,
        shiftY: 0
    }


    _.BillboardGroup = function (drawHelper, options) {

        this._drawHelper = drawHelper;
        this._scene = drawHelper._scene;

        this._options = copyOptions(options, defaultBillboard);

        // create one common billboard collection for all billboards
        var b = new Cesium.BillboardCollection();
        this._scene.primitives.add(b);
        this._billboards = b;
        drawHelper._billboardsGroup.push(b);
        // keep an ordered list of billboards
        this._orderedBillboards = [];
    }

    _.BillboardGroup.prototype.createBillboard = function (position, callbacks) {

        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cesium.Cartesian2(this._options.shiftX, this._options.shiftY),
            eyeOffset: new Cesium.Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            scale: 1.0,
            image: this._options.iconUrl,
            color: new Cesium.Color(1.0, 1.0, 1.0, 1.0)
        });

        // if editable
        if (callbacks) {
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;

            function enableRotation(enable) {
                screenSpaceCameraController.enableRotate = enable;
            }

            function getIndex() {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                return i;
            }
            if (callbacks.dragHandlers) {
                var _self = this;
                setListener(billboard, 'leftDown', function (position) {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position) {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                        callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
                    }

                    function onDragEnd(position) {
                        handler.destroy();
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
                    }

                    var handler = new Cesium.ScreenSpaceEventHandler(_self._scene.canvas);

                    handler.setInputAction(function (movement) {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        } else {
                            onDragEnd(cartesian);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

                    handler.setInputAction(function (movement) {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);

                    enableRotation(false);

                    callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, ellipsoid));
                });
            }
            if (callbacks.onDoubleClick) {
                setListener(billboard, 'leftDoubleClick', function (position) {
                    callbacks.onDoubleClick(getIndex());
                });
            }
            if (callbacks.onClick) {
                setListener(billboard, 'leftClick', function (position) {
                    callbacks.onClick(getIndex());
                });
            }
            if (callbacks.tooltip) {
                setListener(billboard, 'mouseMove', function (position) {
                    _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function (position) {
                    _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    }

    _.BillboardGroup.prototype.addBillboard = function (position, callbacks) {
        this._orderedBillboards.push(this.createBillboard(position, callbacks));
    }

    _.BillboardGroup.prototype.getBillboard = function (index) {
        return this._orderedBillboards[index];
    }

    _.BillboardGroup.prototype.remove = function () {
        this._billboards = this._billboards && this._billboards.removeAll() && this._billboards.destroy();
    }

    _.prototype.deleteAll = function (options) {

        var options = copyOptions(options, defaultBillboard);

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;
        for (var i in this._billboardsGroup) {
            scene.primitives.remove(this._billboardsGroup[i]);
        }

        // function destroyHandle(handler){
        //     if(handler){
        //         handler.destroy();
        //     }
        // }
        // this._handlers.map(destroyHandle);
        options.callback(scene);
    }

    _.prototype.startDrawingMarker = function (options) {

        var options = copyOptions(options, defaultBillboard);

        this.startDrawing(
            function () {
                markers.remove();
                // mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var markers = new _.BillboardGroup(this, options);

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        this._handlers.push(mouseHandler);

        //分普通地形和模型
        mouseHandler.setInputAction(function (movement) {
            if (scene.mode !== Cesium.SceneMode.MORPHING) {
                var pickedObject = scene.pick(movement.position)
                if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    var cartesian = scene.pickPosition(movement.position);
                    if (Cesium.defined(cartesian)) {
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        var long = Cesium.Math.toDegrees(cartographic.longitude);
                        var lat = Cesium.Math.toDegrees(cartographic.latitude);
                        var height = cartographic.height;
                        var newCartesian = Cesium.Cartesian3.fromDegrees(long, lat, height);
                        markers.addBillboard(newCartesian);
                        _self.stopDrawing();
                        options.callback(newCartesian);
                    }
                } else if (movement.position != null) {
                    var ray = scene.camera.getPickRay(movement.position);
                    var cartesian = scene.globe.pick(ray, scene);
                    if (cartesian) {
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        var long = Cesium.Math.toDegrees(cartographic.longitude);
                        var lat = Cesium.Math.toDegrees(cartographic.latitude);
                        var height = scene.globe.getHeight(ellipsoid.cartesianToCartographic(cartesian));
                        var newCartesian = Cesium.Cartesian3.fromDegrees(long, lat, height);
                        markers.addBillboard(newCartesian);
                        _self.stopDrawing();
                        options.callback(newCartesian);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function (movement) {
            var position = movement.endPosition;
            if (position != null) {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    tooltip.showAt(position, "<p>左键单击选择地点</p>");
                } else {
                    tooltip.showAt(position, "<p>左键单击地球选择地点</p>");
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.startDrawingPolygon = function (options) {
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawingPolyshape(true, options);
    }

    _.prototype.startDrawingPolyline = function (options) {
        var options = copyOptions(options, defaultPolylineOptions);
        this.startDrawingPolyshape(false, options);
    }

    _.prototype.startDrawingPolyshape = function (isPolygon, options) {

        this.startDrawing(
            function () {
                primitives.remove(poly);
                markers.remove();
               // mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var minPoints = isPolygon ? 3 : 2;
        var poly;

        options.height = this.getScreenHeight();

        if (isPolygon) {
            poly = new DrawHelper.PolygonPrimitive(options);
        } else {
            poly = new DrawHelper.PolylinePrimitive(options);
        }
        poly.asynchronous = false;
        primitives.add(poly);

        var positions = [];
        var heights = [];
        var markers = new _.BillboardGroup(this, defaultBillboard);

        var mouseHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

        this._handlers.push(mouseHandler);

        //分地形和模型拾点
        mouseHandler.setInputAction(function (movement) {
            if (scene.mode !== Cesium.SceneMode.MORPHING) {
                var pickedObject = scene.pick(movement.position)
                if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    var cartesian = scene.pickPosition(movement.position);
                    if (Cesium.defined(cartesian)) {
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        var long = Cesium.Math.toDegrees(cartographic.longitude);
                        var lat = Cesium.Math.toDegrees(cartographic.latitude);
                        var height = cartographic.height;
                        var newCartesian = Cesium.Cartesian3.fromDegrees(long, lat, height);
                        // first click
                        if (positions.length == 0) {
                            positions.push(newCartesian.clone());
                            markers.addBillboard(positions[0]);
                        }
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        positions.push(newCartesian);
                        heights.push(height);
                        markers.addBillboard(newCartesian);
                    }
                } else if (movement.position != null) {
                    var ray = scene.camera.getPickRay(movement.position);
                    var cartesian = scene.globe.pick(ray, scene);
                    if (cartesian) {
                        var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        var long = Cesium.Math.toDegrees(cartographic.longitude);
                        var lat = Cesium.Math.toDegrees(cartographic.latitude);
                        var height = scene.globe.getHeight(ellipsoid.cartesianToCartographic(cartesian));
                        var newCartesian = Cesium.Cartesian3.fromDegrees(long, lat, height);

                        if (positions.length == 0) {
                            positions.push(newCartesian.clone());
                            markers.addBillboard(positions[0]);
                        }
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        positions.push(newCartesian);
                        heights.push(height);
                        markers.addBillboard(newCartesian);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function (movement) {

            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    tooltip.showAt(position, "<p>左键单击选择第一个点</p>");
                } else {
                    if (scene.mode !== Cesium.SceneMode.MORPHING) {
                        var pickedObject = scene.pick(movement.endPosition)
                        if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                            var cartesian = scene.pickPosition(movement.endPosition);
                            if (Cesium.defined(cartesian)) {
                                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                                var long = Cesium.Math.toDegrees(cartographic.longitude);
                                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                                var height = cartographic.height;
                                var newCartesian = Cesium.Cartesian3.fromDegrees(long, lat, height);
                                positions.pop();
                                heights.pop();
                                positions.push(newCartesian);
                                heights.push(height);
                                if (positions.length >= minPoints) {
                                    poly.positions = positions;
                                    poly._createPrimitive = true;
                                }
                                markers.getBillboard(positions.length - 1).position = newCartesian;
                                tooltip.showAt(position, "<p>左键单击添加第(" + positions.length + ")个点</p>" + (positions.length > minPoints ? "<p>双击结束绘制</p>" : ""));
                            }
                        } else {
                            var ray = scene.camera.getPickRay(position);
                            var cartesian = scene.globe.pick(ray, scene);
                            if (cartesian) {
                                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                                var long = Cesium.Math.toDegrees(cartographic.longitude);
                                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                                var height = scene.globe.getHeight(ellipsoid.cartesianToCartographic(cartesian));
                                var newCartesian = Cesium.Cartesian3.fromDegrees(long, lat, height);
                                positions.pop();
                                heights.pop();
                                cartesian.y += (1 + Math.random());
                                positions.push(newCartesian);
                                heights.push(height);
                                if (positions.length >= minPoints) {
                                    poly.positions = positions;
                                    poly._createPrimitive = true;
                                }
                                markers.getBillboard(positions.length - 1).position = newCartesian;
                                tooltip.showAt(position, "<p>左键单击添加第(" + positions.length + ")个点</p>" + (positions.length > minPoints ? "<p>双击结束绘制</p>" : ""));
                            }
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandler.setInputAction(function (movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                } else {
                    var ray = scene.camera.getPickRay(position);
                    var cartesian = scene.globe.pick(ray, scene);
                    if (cartesian) {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            var index = positions.length - 1;
                            options.callback(positions, heights);
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    }

    _.DrawHelperWidget = (function () {
    	
        // constructor
        function _(drawHelper, options) {
        	
            if (!(Cesium.defined(options.container))) {
                throw new Cesium.DeveloperError('Error');
            } 

            var drawOptions = {
                markerIcon: "Cesium/module/GisHelper/Image/point.png",
                polylineIcon: "Cesium/module/GisHelper/Image/line.png",
                polygonIcon: "Cesium/module/GisHelper/Image/polygon.png",
                clearIcon: "Cesium/module/GisHelper/Image/delete.png",
                polylineDrawingOptions: defaultPolylineOptions,
                polygonDrawingOptions: defaultPolygonOptions,
            };

            fillOptions(options, drawOptions);

            var _self = this;

            var toolbar = document.createElement('DIV');
            toolbar.className = "gisToolbar";
            options.container.appendChild(toolbar);

            function addIcon(id, url, title, callback) {
                var div = document.createElement('DIV');
                div.className = 'gisButton'; 
                div.title = title;
                toolbar.appendChild(div);
                div.onclick = callback;
                var span = document.createElement('SPAN');
                div.appendChild(span);
                var image = document.createElement('IMG');
                image.src = url;
                span.appendChild(image);
                return div;
            }

            var scene = drawHelper._scene;

            addIcon('marker', options.markerIcon, '获取点坐标及高程', function () {
                drawHelper.startDrawingMarker({
                    callback: function (position) {
                        _self.executeListeners({
                            name: 'markerCreated',
                            position: position
                        });
                    }
                });
            })
            
            addIcon('polyline', options.polylineIcon, '获取路径长度', function () {
                drawHelper.startDrawingPolyline({
                    callback: function (positions) {
                        _self.executeListeners({
                            name: 'polylineCreated',
                            positions: positions
                        });
                    }
                });
            })
            
            addIcon('polygon', options.polygonIcon, '获取多边形面积', function () {
                drawHelper.startDrawingPolygon({
                    callback: function (positions, heights) {
                        _self.executeListeners({
                            name: 'polygonCreated',
                            positions: positions,
                            heights: heights,
                        });
                    }
                });
            })

            addIcon('clear', options.clearIcon, '移除所有标绘', function () {
                drawHelper.deleteAll({
                    callback: function (positions) {
                        _self.executeListeners({
                            name: 'deleteAll',
                        });
                    }
                })
            });

            enhanceWithListeners(this);
        }

        return _;

    })();

    _.prototype.addToolbar = function (container, options) {
    	 
        options = copyOptions(options, {
            container: container
        });
        return new _.DrawHelperWidget(this, options);
    }

    function createTooltip(frameDiv) {

        var tooltip = function (frameDiv) {

            var div = document.createElement('DIV');
            div.className = "twipsy right";

            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);

            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);

            this._div = div;
            this._title = title;

            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        }
         
        tooltip.prototype.setVisible = function (visible) {
            this._div.style.display = visible ? 'block' : 'none';
        }

        tooltip.prototype.showAt = function (position, message) {
            if (position && message) {
                if (position.x < document.body.clientWidth - 150 && position.y < document.body.clientHeight - 20) {
                    this.setVisible(true);
                    this._title.innerHTML = message;
                    this._div.style.left = position.x + 10 + "px";
                    this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
                } else {
                    this.setVisible(false);
                }
            }
        } 

        return new tooltip(frameDiv);
    }

    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }

    function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }

    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options),
            option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function setListener(primitive, type, callback) {
        primitive[type] = callback;
    }

    function enhanceWithListeners(element) {

        element._listeners = {};

        element.addListener = function (name, callback) {
            this._listeners[name] = (this._listeners[name] || []);
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        }

        element.executeListeners = function (event, defaultCallback) {
            if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++) {
                    this._listeners[event.name][index](event);
                }
            } else {
                if (defaultCallback) {
                    defaultCallback(event);
                }
            }
        }

    }

    return _;
})();