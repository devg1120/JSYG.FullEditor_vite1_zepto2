import JSYG                from "./JSYG-wrapper/JSYG-wrapper.js"

import { TextEditor }   from "./JSYG.TextEditor/JSYG.TextEditor7.js"

import BoundingBox         from "./JSYG.BoundingBox/JSYG.BoundingBox.js"
import Color               from "./JSYG.Color/JSYG.Color.js"
import Editor              from "./JSYG.Editor/JSYG.Editor.js"
import Events              from "./JSYG.Events/JSYG.Events.js"
import PathDrawer          from "./JSYG.PathDrawer/JSYG.PathDrawer.js"
import PolylineDrawer      from "./JSYG.PolylineDrawer/JSYG.PolylineDrawer.js"
import ShapeDrawer         from "./JSYG.ShapeDrawer/JSYG.ShapeDrawer.js"
import StdConstruct        from "./JSYG.StdConstruct/JSYG.StdConstruct.js"
//import TextEditor          from "./JSYG.TextEditor/JSYG.TextEditor.js"
import UndoRedo            from "./JSYG.UndoRedo/JSYG.UndoRedo.js"
import ZoomAndPan          from "./JSYG.ZoomAndPan/JSYG.ZoomAndPan.js"

    const slice = Array.prototype.slice;

export default class FullEditor extends JSYG {
        constructor(node, opt) {
            super(node,opt);
            this._bindFunctions();
            
            this._init();
            
            this._keyShortCuts = {};
            
            if (node) this.setNode(node);
            
            if (opt) this.enable(opt);

            //this.testCall();
        }

        _initPlugins() {
            FullEditor._plugins.forEach(this._createPlugin.bind(this));
            
            this._applyMethodPlugins("init");
            
            return this;
        }

        _init() {
            
            this._initUndoRedo();
            
            this._initShapeEditor();
            
            this._initZoomAndPan();
            
            this._initTextEditor();
            
            this._initShapeDrawer();
            
            this._initPlugins();
            
            return this;
        }

        _bindFunctions() {
            
            for (const n in this) {
                
                if (typeof(this[n]) == "function" && n.charAt(0) != '_') this[n] = this[n].bind(this);
            }
            
            return this;
        }

        /**
         * Register a key shortcut
         * @param {string} key jquery hotkeys syntax (example : "ctrl+i")
         * @param {function} fct callback called when key or combination keys are pressed
         * @returns {JSYG.FullEditor}
         * @description You can also pass an object with several key shortcuts as keys/values
         */
        registerKeyShortCut(key, fct) {
            
            //if (JSYG.isPlainObject(key)) {
            if ($.isPlainObject(key)) {
                for (const n in key) this.registerKeyShortCut(n,key[n]);
                return this;
            }
            
            if (this._keyShortCuts[key]) this._disableKeyShortCut(key);
            
            this._keyShortCuts[key] = fct;
            
            if (this.enabled) this._enableKeyShortCut(key,fct);
            
            return this;
        }

        /**
         * Unregister a key shortcut
         * @param {string} key jquery hotkeys syntax (example : "ctrl+i")
         * @returns {JSYG.FullEditor}
         */
        unregisterKeyShortCut(key) {
            
            const that = this;
            
            if (Array.isArray(key) || arguments.length > 1 && (key = [].slice.call(arguments))) {
                key.forEach(that.unregisterKeyShortCut);
                return this;
            }
            
            this._disableKeyShortCut(key,this._keyShortCuts[key]);
            
            delete this._keyShortCuts[key];
            
            return this;
        }

        /**
         * Select all editable elements in document
         * @returns {JSYG.FullEditor}
         */
        selectAll() {
            
            this.disableEdition();
            this.enableSelection();
            this.shapeEditor.selection.selectAll();
            
            return this;
        }

        /**
         * Deselect all editable elements
         * @returns {JSYG.FullEditor}
         */
        deselectAll() {
            
            const isEnabled = this.shapeEditor.enabled;
            
            if (!isEnabled) this.shapeEditor.enable();
            
            this.shapeEditor.selection.deselectAll();
            
            if (!isEnabled) this.shapeEditor.disable();
            
            return this;
        }

        _enableKeyShortCut(key, fct) {
            
            if (typeof fct != 'function') throw new Error(`${typeof fct} instead of function expected`);
            
            new JSYG(document).on('keydown',null,key,fct);
            
            return this;
        }

        _disableKeyShortCut(key, fct) {
            
            if (typeof fct != 'function') throw new Error(`${typeof fct} instead of function expected`);
            
            new JSYG(document).off('keydown',fct);
            
            return this;
        }

        /**
         * Enable all key shorcuts registered by registerKeyShortCut method
         * @returns {JSYG.FullEditor}
         * @see JSYG.prototype.registerKeyShortCut
         */
        enableKeyShortCuts() {
            
            const keys = this._keyShortCuts;
            
            for (const n in keys) this._enableKeyShortCut(n,keys[n]);
            
            return this;
        }

        /**
         * Disable all key shorcuts registered by registerKeyShortCut method
         * @returns {JSYG.FullEditor}
         * @see JSYG.prototype.registerKeyShortCut
         */
        disableKeyShortCuts() {
            
            const keys = this._keyShortCuts;
            
            for (const n in keys) this._disableKeyShortCut(n,keys[n]);
            
            return this;
        }

        /**
         * @property {boolean} editText set if text elements can be edited or not
         */
        get editText() {
            return this._editText;
        }

        set editText(value) {
            this._editText = !!value;
            if (!value) this.textEditor.hide();
        }

        /**
         * @property {boolean} editPosition set if elements position can be edited or not
         */
        get editPosition() {
            return this.shapeEditor.ctrlsDrag.enabled;
        }

        set editPosition(value) {
            this.shapeEditor.ctrlsDrag[ `${value ? 'en' : 'dis'}able`]();
        }

        /**
         * @property {boolean} editSize set if elements size can be edited or not
         */
        get editSize() {
            return this.shapeEditor.ctrlsResize.enabled;
        }

        set editSize(value) {
            this.shapeEditor.ctrlsResize[ `${value ? 'en' : 'dis'}able`]();
        }

        /**
         * @property {boolean} editRotation set if elements rotation can be edited or not
         */
        get editRotation() {
            return this.shapeEditor.ctrlsRotate.enabled;
        }

        set editRotation(value) {
            this.shapeEditor.ctrlsRotate[ `${value ? 'en' : 'dis'}able`]();
        }

        /**
         * @property {boolean} editPathMainPoints set if main points of paths can be edited or not
         */
        get editPathMainPoints() {
            return this.shapeEditor.ctrlsMainPoints.enabled;
        }

        set editPathMainPoints(value) {
            this.shapeEditor.ctrlsMainPoints[ `${value ? 'en' : 'dis'}able`]();
        }

        /**
         * @property {boolean} editPathCtrlPoints set if control points of paths can be edited or not
         */
        get editPathCtrlPoints() {
            return this.shapeEditor.ctrlsCtrlPoints.enabled;
        }

        set editPathCtrlPoints(value) {
            this.shapeEditor.ctrlsCtrlPoints[ `${value ? 'en' : 'dis'}able`]();
        }

        /**
         * @property {boolean} canvasResizable set if the editor can be resized or not
         */
        get canvasResizable() {
            return this.zoomAndPan.resizable.enabled;  
        }

        set canvasResizable(value) {
            this.zoomAndPan.resizable[ `${value ? 'en' : 'dis'}able`]();
        }

        /**
         * @property {boolean} keepShapesRatio set if ratio must be kept when resizing
         */
        get keepShapesRatio() {
            return this.shapeEditor.ctrlsResize.keepRatio;  
        }

        set keepShapesRatio(value) {
            value = !!value;
            this.shapeEditor.ctrlsResize.keepRatio = value;
            this._keepShapesRatio = value;
            if (this.shapeEditor.display) this.shapeEditor.update();
        }

        /**
         * @property {string} drawingPathMethod "freehand" or "point2point". Set method of drawing paths
         */
        get drawingPathMethod() {
            return this.pathDrawer.type;  
        }

        set drawingPathMethod(value) {
            
            if (value != 'freehand' && value != 'point2point')
                throw new Error("Only 'freehand' and 'point2point' are allowed");
            
            this.pathDrawer.type = value;
        }

        /**
         * @property {boolean} autoSmoothPaths set if paths must be smoothed automatically when drawing
         */
        get autoSmoothPaths() {
            return this.shapeEditor.ctrlsMainPoints.autoSmooth;
        }

        set autoSmoothPaths(value) {
            
            this.shapeEditor.ctrlsMainPoints.autoSmooth = value;
        }

        /**
         * @property {boolean} useTransformAttr set if transform attribute must be affected when editing size and position, instead
         * of position and size attributes
         */
        get useTransformAttr() {
            
            const dragType = this.shapeEditor.ctrlsDrag.type;
            const resizeType = this.shapeEditor.ctrlsResize.type;
            
            if (dragType!=resizeType) throw new Error("dragType and resizeType are not the same");
            
            return dragType;
        }

        set useTransformAttr(value) {
            
            const oldValue = this.useTransformAttr;
            
            if (value != oldValue) {
                
                this.shapeEditor.ctrlsDrag.type = value ? 'transform' : 'attributes';
                if (this.shapeEditor.ctrlsDrag.enabled) this.shapeEditor.ctrlsDrag.disable().enable();
                
                this.shapeEditor.ctrlsResize.type = value ? 'transform' : 'attributes';
                if (this.shapeEditor.ctrlsResize.enabled) this.shapeEditor.ctrlsResize.disable().enable();
            }
        }

        /**
         * @property {number} currentLayer set current layer of edition
         */
        get currentLayer() {
            return this._currentLayer;
        }

        set currentLayer(value) {
            
            let $node;
            
            if (value != null) {
                
                $node = new JSYG( `${this._getDocumentSelector()} #layer${value}` );
                                
                if (!$node.length) throw new Error("Invalid value for currentLayer. No node found.");
            }
            
            this._currentLayer = value;
            
            this.hideEditors();
            
            this.editableShapes = this.editableShapes; //on force la valeur pour l'actualiser
        }

        /**
         * Get all layers defined
         * @returns {JSYG}
         */
        getLayers() {
            
            return new JSYG(this._getDocumentSelector()).find(".layer");
        }

        /**
         * Add and use a new layer
         * @returns {JSYG.FullEditor}
         */
        addLayer() {
		console.log("addLaayer");
            const nb = ++this._nbLayers;
            const id = `layer${nb}`;
            const g = new JSYG('<g>').addClass("layer").attr("id",id).appendTo( this._getDocumentSelector() );

            this.currentLayer = nb;

            this.triggerChange();

            return this;
        }

        /**
         * Remove a layer
         * @returns {JSYG.FullEditor}
         */
        removeLayer() {
            
            if (!this.currentLayer) throw new Error("No layer selected");
            
            new JSYG(this._getLayerSelector()).remove();
            
            this._actuLayers();
            
            this.currentLayer = null;
            
            this.triggerChange();
                    
            return this;
        }

        _getLayerSelector() {
                    
            return `${this._getDocumentSelector() + (this.currentLayer ? ` #layer${this.currentLayer}` : '')} `;
        }

        /**
         * Get document as a DOM node
         * @returns {Element}
         */
        getDocument() {
            
            return document.querySelector( this._getDocumentSelector() );
        }

        _initUndoRedo() {
            
            const that = this;
            
            this.undoRedo = new UndoRedo();
            this.undoRedo.saveState();
            
            this.undoRedo.on("change",() => {
                //that.hideEditors();
                that.trigger("change", that, that.getDocument() );
            });
        }

        /**
         * Hide shape and text editors
         * @returns {JSYG.FullEditor}
         */
        hideEditors() {
            
            this.shapeEditor.hide();
            this.textEditor.hide();
            
            return this;
        }

        /**
         * Enable mouse pointer selection
         * @returns {JSYG.FullEditor}
         */
        enableSelection() {
            
            const target = this.shapeEditor.display && this.shapeEditor.target();
            
            this.disableEdition();
            this.shapeEditor.enable();
            
            if (target) this.shapeEditor.target(target).show();
            
            return this;
        }

        /**
         * Disable mouse pointer selection
         * @returns {JSYG.FullEditor}
         */
        disableSelection() {
            
            this.hideEditors();
            
            if (this.shapeEditor.enabled) this.shapeEditor.disable();
            
            return this;
        }

        /**
         * Disable mouse pointer insertion
         * @returns {JSYG.FullEditor}
         */
        disableInsertion() {
            
            this.disableInsertElement();
            
            this.disableShapeDrawer();
            
            return this;
        }

        /**
         * Register a plugin
         * @param {object} plugin
         * @returns {JSYG.FullEditor}
         */
        static registerPlugin(plugin) {
            if (!plugin.name) throw new Error("Plugin must have a name property");
            
            if (this._plugins.some(({name}) => name == plugin.name))
                throw new Error(`${plugin.name} plugin already exists`);
            
            this._plugins.push(plugin);
            
            return this;
        }

        _createPlugin(plugin) {
            plugin = Object.create(plugin);
            
            //plugin.set = JSYG.StdConstruct.prototype.set;
            plugin.set = StdConstruct.prototype.set;
            
            plugin.editor = this;
            
            this[plugin.name] = function(method) {
                
                let args = slice.call(arguments,1);
                let returnValue;
                let prop;
                
                if (!method || JSYG.isPlainObject(method)) {
                    args = [method];
                    method = "enable";
                }
                
                if (method == "get") {
                    
                    prop = args[0];
                    
                    if (isPrivate(prop)) throw new Error(`property ${prop} is private`);
                    
                    return plugin[args[0]];
                }
                
                if (!plugin[method]) throw new Error(`method ${method} does not exist`);
                
                if (isPrivate(method)) throw new Error(`method ${method} is private`);
                
                returnValue = plugin[method](...args);
                
                return returnValue || this;
            };
        }

        _applyMethodPlugins(method) {
            
            const that = this;
            
            FullEditor._plugins.forEach(({name}) => {
                
                try { that[name](method); }
                catch(e) {}
            });
        }

        /**
         * Enable edition functionalities
         * @returns {JSYG.FullEditor}
         */
        disableEdition() {
            
            this.disableInsertion();
            
            this.disableMousePan();
            
            this.disableSelection();
            
   //         this.trigger("disableedition",this);  //GUSA

  const event = new CustomEvent('disableedition'); 
  this[0].dispatchEvent(event);

            
            return this;
        }

        /**
         * Duplicate selected element
         * @returns {JSYG.FullEditor}
         */
        duplicate() {
            const cb = this.shapeEditor.clipBoard;
            const buffer = cb.buffer;

            cb.copy();
            cb.paste();
            cb.buffer = buffer;

            return this;
        }

        /**
         * Get or set dimensions of element selected
         * @param {string} prop x, y , width or height
         * @param {number} value
         * @returns {number,JSYG.FullEditor}
         * @description You can also pass an object
         */
        dim(prop, value) {
            
            //if (JSYG.isPlainObject(prop) || value != null) return this._setDim(prop,value);
            if ($.isPlainObject(prop) || value != null) return this._setDim(prop,value);
            else return this._getDim(prop,value);
        }

        _getDim(prop) {
            
            const target = this.shapeEditor.target();
            const doc = this.getDocument();
            let dim;
            
            if (!target || !target.length) return null;
            
            dim = target.getDim(doc);
                    
            return (prop == null) ? dim : dim[prop];
        }

        _setDim(prop, value) {
            const target = this.shapeEditor.target();
            let change = false;
            const doc = this.getDocument();
            let n;
            let newDim;
            let oldDim;

            if (!target || !target.length) return this;

            if (JSYG.isPlainObject(prop)) newDim = JSYG.extend({},prop);
            else {
                newDim = {};
                newDim[prop] = value;
            }

            oldDim = target.getDim(doc);

            for (n in newDim) {
                            
                newDim[n] = parseValue(newDim[n],oldDim[n]);
                
                if (newDim[n] != oldDim[n]) change = true;
            }

            if (change) {
                
                newDim.from = doc;
                newDim.keepRatio = this.keepShapesRatio;
                
                target.setDim(newDim);
                this.shapeEditor.update();
                this.triggerChange();
            }

            return this;
        }

        /**
         * Rotate selected element
         * @param {number} value angle in degrees
         * @returns {JSYG.FullEditor}
         */
        rotate(value) {
            const target = this.target();
            const oldValue = target && target.rotate();

            if (!target) return (value == null) ? null : this;

            if (value == null) return oldValue;

            value = parseValue(value,oldValue) - oldValue;

            if (oldValue != value) {
                
                target.rotate(value);
                this.shapeEditor.update();
                this.triggerChange();
            }

            return this;
        }

        /**
         * Get or set css property
         * @param {string} prop name of css property
         * @param {string,number} value
         * @returns {number,string,JSYG.FullEditor}
         */
        css(prop, value) {
            if (JSYG.isPlainObject(prop)) {
                for (const n in prop) this.css(n,prop[n]);
                return this;
            }

            const target = this.target();
            const oldValue = target && target.css(prop);

            if (!target) return (value == null) ? null : this;

            if (value == null) return oldValue;

            value = parseValue(value,oldValue);

            if (oldValue != value) {
                
                target.css(prop,value);
                this.shapeEditor.update();
                this.triggerChange();
            }

            return this;
        }

        /**
         * Trigger change event
         * @returns {JSYG.FullEditor}
         */
/*
        triggerChange() {

            this.undoRedo.saveState();
            
            this.trigger("change", this, this.getDocument() );
            
            return this;
        }
*/
        triggerChange = () => {

            this.undoRedo.saveState();
            
            this.trigger("change", this, this.getDocument() );
            
            return this;
        }

        _insertFrame() {
            const mainFrame = this.zoomAndPan.innerFrame;
            //const content = new JSYG(mainFrame).children().detach();
		/*
            const content2 = new JSYG(mainFrame);
            const children = content2[0].children;
            for (const child of children) {
               content2[0].removeChild(child);
           }
	   */
            console.log("_insertFrame");
  /*
            this._frameShadow = new JSYG("<rect>")          //GUSA
                .attr({x:2,y:2})
                .addClass("jsyg-doc-shadow")
                .appendTo(mainFrame)[0];
  */
            let elem = new JSYG("<rect>")
            elem.attr({x:2,y:2})
            elem[0].classList.add("jsyg-doc-shadow")
            mainFrame.appendChild(elem[0]);
            this._frameShadow = elem;
/*
            this._frame = new JSYG("<rect>")
                .attr({x:0,y:0})
                .addClass("jsyg-doc-frame")
                .appendTo(mainFrame)[0];
 */
            elem = new JSYG("<rect>")
            elem.attr({x:0,y:0})
            elem[0].classList.add("jsyg-doc-frame")
            mainFrame.appendChild(elem[0]);
            this._frame = elem;
/*
            this.containerDoc = new JSYG("<g>")
                .attr("id",this.idContainer)
                .append(content)                   //GUSA
                .appendTo(mainFrame)
            [0];
*/

            elem = new JSYG("<g>")
            elem.attr("id",this.idContainer)
            //elem[0].appendChild(content2[0])
            //elem[0].appendChild(content2[0])
            mainFrame.appendChild(elem[0]);
            this.containerDoc = elem;


            this._adjustSize();

            return this;
        }

        _removeFrame() {
		/*
            const container = new JSYG(this.containerDoc);
            const content = container.children();

            new JSYG(this._frame).remove();
            new JSYG(this._frameShadow).remove();
            container.remove();

            content.appendTo(this.zoomAndPan.innerFrame);
*/
            return this;
        }

        _initShapeDrawer() {
            
            this.pathDrawer = this._initDrawer(new PathDrawer);
            this.polylineDrawer = this._initDrawer(new PolylineDrawer);
            this.shapeDrawer = this._initDrawer(new ShapeDrawer);
            
            return this;
        }

        _initDrawer(drawer) {
            
            const that = this;
            
            drawer.on({
                
                draw(e) { that.trigger("draw",that,e,this); },
                
                end(e) {
                    
                    if (!this.parentNode) return;
                    
                    that.trigger("insert",that,e,this);
                    
                    that.triggerChange();
                    
                    if (that.autoEnableSelection) that.shapeEditor.target(this).show();
                }
            });
            
            return drawer;
        }

        _setCursorDrawing() {
            
            if (this.cursorDrawing) this.zoomAndPan.node.style.cursor = this.cursorDrawing;
        }

        _removeCursorDrawing() {
            
            if (this.cursorDrawing) this.zoomAndPan.node.style.cursor = null;
        }

        /**
         * @property {object} shapeDrawerModel dom node to clone when starting drawing
         */
        get shapeDrawerModel() {
            return this._shapeDrawerModel;
        }

        set shapeDrawerModel(value) {
            
            const jNode = new JSYG(value);     
            
            if (jNode.length != 1) throw new Error("Shape model incorrect");
            
            if (!JSYG.svgShapes.includes(jNode.getTag()))
                throw new Error(`${jNode.getTag()} is not a svg shape`);
            
            this._shapeDrawerModel = jNode[0];
        }

        /**
         * Draw one shape
         * @param {type} modele
         * @returns {Promise}
         */
        drawShape(modele) {
            
            const that = this;
            
            return new Promise((resolve, reject) => {
                
                that.enableShapeDrawer(modele,() => {
                    
                    const target = that.target();
                    
                    that.disableShapeDrawer();
                    
                    if (target) resolve(target[0]);
                    else reject(new Error("No shape was drawn"));
                });
            });
        }

        enableShapeDrawer(modele, _callback) {
            const frame = new JSYG(this.zoomAndPan.innerFrame);
            const that = this;

            this.disableEdition();

            if (modele) this.shapeDrawerModel = modele;

            function onmousedown(e) {
                
                if (that.pathDrawer.inProgress || that.polylineDrawer.inProgress || that.shapeDrawer.inProgress || e.which != 1) return;
                
                e.preventDefault();
                
                const modele = that.shapeDrawerModel;
                if (!modele) throw new Error("You must define a model");

                //const shape = new JSYG(modele).clone().appendTo( that._getLayerSelector() );  // GUSA
                const shape = new JSYG(modele).clone();
                console.log(that._getLayerSelector())
                let target = document.querySelectorAll(that._getLayerSelector());
                target[0].appendChild(shape[0])
                const tag = shape.getTag();
                let drawer;
                
                switch(tag) {
                    
                    case "polyline": case "polygon" : drawer = that.polylineDrawer; break;
                    
                    case "path" : drawer = that.pathDrawer; break;
                    
                    default : drawer = that.shapeDrawer; break;
                }
                
                drawer.area = frame;
                drawer.draw(shape,e);
                
                if (_callback) drawer.one("end",_callback);
            }

            frame.on("mousedown",onmousedown).data("enableDrawingShape",onmousedown);

            this._setCursorDrawing();

            return this;
        }

        disableShapeDrawer() {
            const frame = new JSYG(this.zoomAndPan.innerFrame);
            //const fct = frame.data("enableDrawingShape");
            const fct = frame[0].dataset.EnableDrawingShape;

            if (!fct) return this;

            frame.off("mousedown",fct);

            this._removeCursorDrawing();

            return this;
        }

        get insertElementModel() {
            return this._insertElementModel;
        }

        set insertElementModel(value) {
            
            const jNode = new JSYG(value);     
            
            if (jNode.length != 1) throw new Error("element model incorrect");
            
            if (!JSYG.svgGraphics.includes(jNode.getTag()))
                throw new Error(`${jNode.getTag()} is not a svg graphic element`);
            
            this._insertElementModel = jNode[0];
        }

        is(type, _elmt = this.target()) {
            const list = `svg${JSYG.ucfirst(type)}s`;
            const types = ["container","graphic","shape","text"];

            if (!types.includes(type)) throw new Error(`${type} : type incorrect (${types} required)`);

            return JSYG[list].includes(JSYG(_elmt).getTag());
        }

        mouseInsertElement(modele) {
            
            const that = this;
            
            return new Promise(resolve => {
                
                that.enableInsertElement(modele,() => {
                    
                    const target = that.target();
                    
                    that.disableInsertElement();
                    
                    if (target) resolve(target[0]);
                    else reject(new Error("No element inserted"));
                });
            });
        }

        enableInsertElement(modele, _callback) {
            const frame = new JSYG(this.zoomAndPan.innerFrame);
            const that = this;

            this.disableEdition();

            if (modele) this.insertElementModel = modele;

            function onmousedown(e) {
                if (e.which != 1) return;

                e.preventDefault();

                const modele = that.insertElementModel;
                if (!modele) throw new Error("You must define a model");

                const shape = new JSYG(modele).clone();
                const isText = JSYG.svgTexts.includes(shape.getTag());

                that.insertElement(shape,e,isText);

                if (that.autoEnableSelection) {
                    
                    new JSYG(that.node).one('mouseup',() => {
                                          
                        that.shapeEditor.target(shape);
                        
                        if (that.editText && isText) {
                            that.textEditor.target(shape).show();
                            that.textEditor.one("validate",_callback);
                        }
                        else {
                            that.shapeEditor.show();
                            if (_callback) _callback();
                        }
                        
                    });
                }
            }

            frame.on("mousedown",onmousedown).data("enableInsertElement",onmousedown);

            this._setCursorDrawing();

            return this;
        }

        disableInsertElement() {
            const frame = new JSYG(this.zoomAndPan.innerFrame);
            //const fct = frame.data("enableInsertElement");
            const fct = frame[0].dataset.EnableInsertElement;

            if (!fct) return this;

            frame.off("mousedown",fct);

            this._removeCursorDrawing();

            return this;
        }

        marqueeZoom(opt) {
            
            const that = this;
            
            return new Promise(resolve => {
                
                that.enableMarqueeZoom(opt,() => {
                    that.disableMarqueeZoom();
                    resolve();
                });
            });
        }

        disableMarqueeZoom() {
            
            this.zoomAndPan.marqueeZoom.disable();
            
            return this;
        }

        enableMarqueeZoom(opt, _callback) {
            
            if (this.zoomAndPan.marqueeZoom.enabled && !opt) return this;
            
            this.disableEdition();
            
            this.zoomAndPan.marqueeZoom.enable(opt);
            
            if (_callback) this.zoomAndPan.marqueeZoom.one("end",_callback);
            
            return this;
        }

        zoom(percent) {
            
            this.zoomAndPan.scale( 1 + (percent/100) );
            
            this.trigger("zoom",this,this.getDocument());
            
            return this;
        }

        zoomTo(percentage) {
            
            if (percentage == "canvas") this.zoomAndPan.fitToCanvas().scale(0.95);
            //else if (JSYG.isNumeric(percentage)) this.zoomAndPan.scaleTo( percentage/100 );
            else if ($.isNumeric(percentage)) this.zoomAndPan.scaleTo( percentage/100 );
            else throw new Error("argument must be numeric or 'canvas' string");
            
            this.trigger("zoom",this,this.getDocument());
            
            return this;
        }

        fitToDoc() {
            const dim = new JSYG(this.getDocument()).getDim("screen");
            const overflow = this.zoomAndPan.overflow;

            this.zoomAndPan.size({
                width : dim.width + (overflow!="hidden" ? 10 : 0),
                height : dim.height + (overflow!="hidden" ? 10 : 0)
            });

            return this;
        }

        _initZoomAndPan() {
            
            const that = this;
            
            this.zoomAndPan = new ZoomAndPan();
            this.zoomAndPan.overflow = "auto";
            this.zoomAndPan.scaleMin = 0;
            
            this.zoomAndPan.resizable.keepViewBox = false;
            this.zoomAndPan.resizable.keepRatio = false;
            
            this.zoomAndPan.mouseWheelZoom.key = "ctrl";
            
            this.zoomAndPan.on("change",() => {
                that._updateBoundingBoxes();
                that.shapeEditor.update();
                that.textEditor.update();
            });
            
            return this;
        }

        _initShapeEditor() {
            
            const editor = new Editor();
            const that = this;
            
            editor.selection.multiple = true;
            
            //new JSYG(editor.container).on("dblclick",e => {  //GUSA
            new JSYG(editor.container)[0].addEventListener("dblclick",e => {
                
                const target = editor.target();
                
                if (!that.editText || !JSYG.svgTexts.includes(target.getTag())) return;
                
                that.textEditor.target(target).show();
                that.textEditor.cursor.setFromPos(e);
            });
            
            editor.selection.on("beforedeselect beforedrag",({target}) => {
                
                if (target == that.textEditor.container || new JSYG(target).isChildOf(that.textEditor.container)) return false;
            });
            
            editor.on({
                
                show() {
                    that.textEditor.hide();
                },
                
                change : this.triggerChange,
                
                drag(e) {
                    that.trigger("drag", that, e, editor._target);
                },
                
                changetarget() {
                    that.trigger("changetarget",that,editor._target);
                }
            });
            
            //editor.ctrlsDrag.bounds = 0;
            //editor.ctrlsResize.bounds = 0;
            
            this.shapeEditor = editor;
            
            return this;
        }

        _initTextEditor() {
            
            const that = this;
            
            this.textEditor = new TextEditor();
            
            this.textEditor.on({
                show() {
                    that.shapeEditor.hide();
                },
                hide() {
                    const target = that.textEditor.target();
                    if (!target.text()) target.remove();
                    else that.shapeEditor.target(target).show();
                },
                validate() {
                    that.triggerChange();
                }
            });
            
            return this;
        }

        setNode(...args) {
            
            //JSYG.StdConstruct.prototype.setNode.apply(this,args);
            StdConstruct.prototype.setNode.apply(this,args);
            
            this.zoomAndPan.setNode(this.node);
            
            this.shapeEditor.setNode(this.node);
            
            this.textEditor.setNode(this.node);
            
            return this;
        }

        _getDocumentSelector() {
            
            return `#${this.idContainer} > svg `;
        }

        get editableShapes() {
            return this._editableShapes;
        }

        set editableShapes(value) {
            
            this._editableShapes = value;
            this.shapeEditor.list = this._getLayerSelector()+value;
        }

        enableMousePan(opt) {
            
            if (!this.zoomAndPan.mousePan.enabled) {
                
                this.disableEdition();
                
                this.zoomAndPan.mousePan.enable(opt);
            }
            
            return this;
        }

        disableMousePan() {
            
            if (this.zoomAndPan.mousePan.enabled) {
                
                this.zoomAndPan.mousePan.disable();
            }
            
            return this;
        }

        enableMouseWheelZoom(opt) {
            
            if (!this.zoomAndPan.mouseWheelZoom.enabled) {
                
                this.zoomAndPan.mouseWheelZoom.enable(opt);
            }
            
            return this;
        }

        disableMouseWheelZoom() {
            
            if (this.zoomAndPan.mouseWheelZoom.enabled) {
                
                this.zoomAndPan.mouseWheelZoom.disable();
            }
            
            return this;
        }

        canMoveBackwards() {
            const shapes = new JSYG(this.shapeEditor.list);
            const target = this.shapeEditor.target();

            return shapes.index(target) > 0 && shapes.length > 1;
        }

        canMoveForwards() {
            const shapes = new JSYG(this.shapeEditor.list);
            const target = this.shapeEditor.target();

            return shapes.index(target) < shapes.length-1 && shapes.length > 1;
        }

        isGroup() {
            
            return this.shapeEditor.isGroup();
        }

        get overflow() { return this.zoomAndPan.overflow; }

        set overflow(value) {
            const displayShapeEditor = this.shapeEditor.display;
            const displaytextEditor = this.textEditor.display;

            if (displayShapeEditor) this.shapeEditor.hide();
            if (displaytextEditor) this.textEditor.hide();

            this.zoomAndPan.overflow = value;

            if (displayShapeEditor) this.shapeEditor.show();
            if (displaytextEditor) this.textEditor.show();
        }

        enable(opt) {
            
            this.disable();
            
            if (opt) this.set(opt);
            
            if (!this.node) throw new Error("node is not defined");
            
            this.zoomAndPan.enable();
            
            this._insertFrame();
            
            //on force les valeurs pour exécuter les fonctions définies dans Object.defineProperty
            if (this._editPathCtrlPoints) this._editPathCtrlPoints = true;
            if (this._resizable) this._resizable = true;
            this.editableShapes = this.editableShapes;
            
            this.shapeEditor.enableCtrls('drag','resize','rotate','mainPoints');
            
            if (this.autoEnableSelection) this.shapeEditor.enable();
            
            this.enableKeyShortCuts();
            
            this.enabled = true;
            
            return this;
        }

        disable() {
            
            this.disableEdition();
            
            this._removeFrame();
            
            this.zoomAndPan.disable();
            
            this.undoRedo.disable();
            
            this.disableKeyShortCuts();
            
            this.enabled = false;
            
            return this;
        }

        /**
         * Aligne les éléments sélectionnés
         * @param {String} type (top,middle,bottom,left,center,right)
         * @returns {undefined}
         */
        align(type) {
            
            this.shapeEditor.align(type);
            
            return this;
        }

        target(value) {
            
            if (value == null) {
                
                if (this.textEditor.display) return this.textEditor.target();
                else return this.shapeEditor.target();
            }
            else {
                
                this.shapeEditor.target( new JSYG(this.getDocument()).find(value) ).show();
            }
            
            return this;
        }

        editTextElmt(elmt) {
            
            if (elmt == null) elmt = this.target();
            
            this.textEditor.target(elmt).show();
            
            return this;
        }

        dimDocument(dim) {
            
            const doc = new JSYG( this.getDocument() );
            const oldDim = doc.getDim();
            
            if (dim == null) return oldDim;
            
            if (dim.width && dim.width != oldDim.width || dim.height && dim.height != oldDim.height) {
                
                doc.setDim(dim);
                
                this.triggerChange();
                
                this._adjustSize();
            }
            
            return this;
        }

        isMultiSelection() {
            
            return this.shapeEditor.isMultiSelection();
        }

        _adjustSize() {
            const contenu = new JSYG( this.getDocument() );
          const dim = contenu.length && contenu.getDim() || {width:0, height:0};

            new JSYG(this._frameShadow).add(this._frame).attr({
            //new JSYG(this._frameShadow).attr({
                width:dim.width,
                height:dim.height
            });

            if (dim.width && dim.height) this.zoomTo('canvas');

            if (!this.shapeEditor.ctrlsDrag.options) this.shapeEditor.ctrlsDrag.options = {};
            if (!this.shapeEditor.ctrlsResize.options) this.shapeEditor.ctrlsResize.options = {};

            this.shapeEditor.ctrlsDrag.options.guides = {
                list : [{x:0},{x:dim.width},{y:0},{y:dim.height}]
            };

            this.shapeEditor.ctrlsResize.options.stepsX = {
                list : [0,dim.width]
            };

            this.shapeEditor.ctrlsResize.options.stepsY = {
                list : [0,dim.height]
            };

            return this;
        }

        createImage(src) {
            const image = new JSYG('<image>').attr('href',src);
            const that = this;

            return new Promise((resolve, reject) => {
                
                const img = new Image();
                
                img.onload = function() {
                    const dimDoc = JSYG(that.getDocument()).viewBox();
                    let height = this.height;
                    let width = this.width;

                    if (width > dimDoc.width) {
                        height = height * dimDoc.width / width;
                        width = dimDoc.width;
                    }

                    if (height > dimDoc.height) {
                        width = width * dimDoc.height / height;
                        height = dimDoc.height;                    
                    }

                    image.attr({width,height});

                    resolve(image[0]);
                };
                
                img.onerror = reject;
                
                img.src = src;
            });
        }

        insertElement(elmt, pos, _preventEvent) {

		console.log("insertElement");
            
            let textNode;
            
            elmt = new JSYG(elmt);
            
            //elmt.appendTo( this._getLayerSelector() );  //GUSA
	    let target = document.querySelectorAll(this._getLayerSelector())
            target[0].appendChild(elmt[0])
            
            if (JSYG.svgTexts.includes(elmt.getTag()) && !elmt.text()) {
                textNode = document.createTextNode("I");
                elmt.append(textNode);
            }
            
            //if (pos instanceof JSYG.Event) elmt.setCenter( elmt.getCursorPos(pos) );
            if (pos instanceof $.Event) elmt.setCenter( elmt.getCursorPos(pos) );
            else {
                
                elmt.setDim({
                    x : pos && pos.x || 0,
                    y : pos && pos.y || 0
                });
            }
            
            if (textNode) new JSYG(textNode).remove();
            
            if (!_preventEvent) {
                
                this.trigger("insert", this, this.getDocument(), elmt );
                this.triggerChange();
            }
            
            return this;
        }

        enableDropFiles() {
            
            const that = this;
            
            const fcts = {
                
                dragenter : stopEvents,
                dragover : stopEvents,
                
                drop(e) {
                    stopEvents(e);

                    const dt = e.originalEvent.dataTransfer;
                    let file;
                    let str;

                    if (!dt) return;

                    if (dt.files  && dt.files.length) {

                      file = dt.files[0];

                      if (/svg/i.test(file.type) && that.importSVGAs.toLowerCase() == "svg") that.insertSVGFile(file,e);
                      else that.insertImageFile(file,e);

                    } else {

                      str = dt.getData("text")

                      if (str) {

                        that.importImage(str)
                        .then(img => { that.insertElement(img,e); that.target(img); })
                        .catch(() => {})

                      }

                    }
                }
            };
            
            JSYG(this.zoomAndPan.innerFrame).on(fcts);
            
            this.disableDropFiles = function() {
                
                JSYG(this.zoomAndPan.innerFrame).off(fcts);
            };
            
            return this;
        }

        disableDropFiles() { return this; }

        insertImageFile(file, e) {
            
            const that = this;
            
            return this.importImage(file)
                .then(img => {
                    that.insertElement(img,e);
                that.shapeEditor.target(img).show();
            });
        }

        insertSVGFile(file, e) {
            
            const that = this;
            return this.readFile(file,"text")
                .then(JSYG.parseSVG)
                .then(svg => {
                    that.insertElement(svg,e);
                that.shapeEditor.target(svg).show();
            });
        }

        importImage(arg) {
            
            let promise;
            
            if (arg instanceof File) {
                
                if (!arg.type.match(/image/)) return Promise.reject(new TypeError(`${arg.name} is not an image file`));
                
                promise = this.readFile(arg,'dataURL');
            }
            else {
                
                if (arg.src) arg = arg.src; //DOMElement
                else if (arg instanceof jQuery) {
                    
                    arg = JSYG(arg);
                    arg = arg.attr( arg.isSVG() ? 'href' : 'src' );
                    
                    if (!arg) throw new TypeError("no src/href attribute found");
                } 
                else if (typeof arg != "string") throw new TypeError("argument incorrect"); //URL or dataURL
                
                promise = Promise.resolve(arg);
            }
            
            return promise.then(this.createImage);
        }

        chooseFile() {
            
            const that = this;
            
            return new Promise((resolve, reject) => {
                
                JSYG("<input>").attr("type","file").on("change",function() {
                    
                    resolve(this.files[0]);
                })
                    .trigger("click");
            });
        }

        loadImageAsDoc(arg) {
            
            const that = this;
            
            return this.importImage(arg).then(img => {
                
                let dim;
                
                that.insertElement(img);
                
                dim = JSYG(img).getDim();
                
                that.newDocument(dim.width,dim.height);
                that.insertElement(img);
                that.addLayer();
                
                that.undoRedo.clear();
                
                return img;
            });         
        }

        /**
         * Load a document from a file, an url, a xml string or a xml node
         * @param {File, string, DOMElement} arg
         * @returns {Promise}
         */
        load(arg) {
            
            if (arg instanceof File) return this.loadFile(arg);
            else if (typeof arg == "string") {
                if (arg.indexOf("<?xml") == 0 || arg.indexOf("<svg") == 0)
                    return Promise.resolve(this.loadString(arg));
                else return this.loadURL(arg);
            }
            else return Promise.resolve(this.loadXML(arg));
        }

        /**
         * Load a document from a svg string
         * @param {string} str
         * @returns {JSYG.FullEditor}
         */
        loadString(str) {
            
            return this.loadXML( JSYG.parseSVG(str) );
        }

        /**
         * Read a File instance
         * @param {File} file
         * @param {string} readAs optional, "DataURL" or "Text" ("Text" by default)
         * @returns {Promise}
         */
        readFile(file, readAs) {
            return new Promise((resolve, reject) => {
                
                if (!window.FileReader) throw new Error("your navigator doesn't implement FileReader");
                
                if (!(file instanceof File)) throw new Error("file argument incorrect");
                
                const reader = new FileReader();
                
                readAs = JSYG.ucfirst(readAs || 'text');
                
                if (!['DataURL','Text'].includes(readAs)) throw new Error("format incorrect");
                
                reader.onload = ({target}) => {
            resolve(target.result);
                };
                
                reader.onerror = e => {
            reject(new Error("Impossible de charger le fichier"));
                };
                
                reader[`readAs${readAs}`](file);
            });
        }
        testCall() {
          console.log("testCall");
	}
        /**
         * Load a document from a File instance
         * @param {File} file
         * @returns {Promise}
         */
        loadFile(file) {
            
            if (!file.type || !file.type.match(/svg/)) throw new Error("file format incorrect. SVG file is required.");
            
            return this.readFile(file).then(this.loadString.bind(this));
        }
        /**
         * Load a document from an url
         * @param {string} url
         * @returns {Promise}
         */
        loadURL(url) {
            
            return fetch(url).then(response => {

                if (!response.ok) throw new Error(response.statusText);

                return response.text();
            })
                .then(this.loadString.bind(this));
        }

        _actuLayers(svg) {
            
            const layers = this.getLayers();
            
            layers.each(function(i) {
                
                this.id = `layer${i+1}`;
            });
            
            this._nbLayers = layers.length;
        }

        /**
         * Load a document from a xml node
         * @param {DOMElement} svg
         * @returns {JSYG.FullEditor}
         */
        loadXML(svg) {
            
            let container;
            
            this.shapeEditor.hide();
            this.textEditor.hide();
            this._clearBoundingBoxes();
            
            container = new JSYG(`#${this.idContainer}`);
            
            container.empty().append(svg);
            
            this._adjustSize();
            
            this.currentLayer = null;
            this._actuLayers();
            
            this.undoRedo.disable().setNode(svg).enable();
            
            this.trigger("load",this,svg);
            
            return this;
        }

        /**
         * Create a new document
         * @param {number} width
         * @param {number} height
         * @returns {JSYG.FullEditor}
         */
        newDocument(width, height) {
            
            let dim;
            
            if (!width || !height) {
                
                dim = this.dimDocument();
                
                if (dim) {
                    if (!width) width = dim.width;
                    if (!height) height = dim.height;
                }
                else throw new Error("You need to specify width and height");    
            }
            
            const svg = new JSYG('<svg>').setDim( {width,height} );
            
            return this.loadXML(svg);
        }

        _updateBoundingBoxes() {
            
            new JSYG(this.shapeEditor.list).each(function() {
                const $this = new JSYG(this);
                if ($this.boundingBox("get","display")) $this.boundingBox("update");
            });
        }

        _clearBoundingBoxes() {
            
            new JSYG(this.shapeEditor.list).boundingBox("hide");
        }

        /**
         * Convert document to a canvas element
         * @returns {Promise}
         */
        toCanvas() {
            
            return new JSYG(this.getDocument()).toCanvas();
        }

        /**
         * Convert document to a SVG string (keep links)
         * @param {object} opt options (for the moment only "standalone" as boolean, to converts links to dataURLs)
         * @returns {Promise}
         * @example fullEditor.toSVGString({standalone:true})
         */
        toSVGString(opt) {
            
            return new JSYG(this.getDocument()).toSVGString(opt && opt.standalone);
        }

        /**
         * Convert document to a SVG data url
         * @returns {Promise}
         */
        toSVGDataURL() {
            
            return new JSYG(this.getDocument()).toDataURL(true);
        }

        /**
         * Convert document to a PNG data url
         * @returns {Promise}
         */
        toPNGDataURL(format) {
            
            return this.toCanvas().then(canvas => canvas.toDataURL());
        }

        _checkExportFormat(format) {
            
            const exportFormats = ['svg','png'];
            
            if (!exportFormats.includes(format)) throw new Error(`${format} : incorrect format (${exportFormats.join(' or ')} required)`);
        }

        /**
         * Convert document to data URL
         * @param {string} format "svg" or "png"
         * @returns {Promise}
         */
        toDataURL(format) {
            
            if (!format) format = 'svg';
            
            this._checkExportFormat(format);
            
            const method = `to${format.toUpperCase()}DataURL`;
            
            return this[method]();
        }

        /**
         * Print document
         * @returns {Promise}
         */
        print() {
            
            return this.toSVGDataURL().then(url => new Promise(resolve => {
                const win = window.open(url);
                win.onload = () => { win.print(); resolve(); };
            }));
        }

        /**
         * Download document as PNG
         * @returns {Promise}
         */
        downloadPNG() {
            
            return this.download("png");
        }

        /**
         * Download document as SVG
         * @returns {Promise}
         */
        downloadSVG() {
            
            return this.download("svg");
        }

        /**
         * Download document
         * @param {string} format "png" or "svg"
         * @returns {JSYG.FullEditor}
         */
        download(format) {
            
            if (!format) format = 'svg';
            
            return this.toDataURL(format).then(url => {
                
                const a = new JSYG('<a>').attr({
                    href:url,
                    download:`file.${format}`
                }).appendTo('body');
                
                a[0].click();
                a.remove();
            });
        }

        /**
         * Remove selection
         * @returns {JSYG.FullEditor}
         */
        remove() {
            
            if (!this.shapeEditor.display) return this;
            
            const target = this.shapeEditor.target();
            
            this.shapeEditor.hide();
            
            this._clearBoundingBoxes();
            
            target.remove();
            
            this.trigger("remove", this, this.getDocument(), target);
            
            this.triggerChange();
            
            return this;
        }

        /**
         * Group selected elements
         * @returns {JSYG.FullEditor}
         */
        group() {
            
            this.shapeEditor.group();
            
            this.triggerChange();
            
            return this;
        }

        /**
         * Ungroup selection
         * @returns {JSYG.FullEditor}
         */
        ungroup() {
            
            this.shapeEditor.ungroup();
            
            this.triggerChange();
            
            return this;
        }

        /**
         * Center selected elements
         * @param {string} orientation "vertical" or "horizontal"
         * @returns {JSYG.FullEditor}
         */
        center(orientation) {
            const doc = this.getDocument();
            const dimDoc = new JSYG(doc).getDim();
            const target = this.target();
            const dim = target.getDim(doc);
            const isVerti = orientation.toLowerCase().indexOf("verti") == 0;
            const newX = (dimDoc.width - dim.width) / 2;
            const newY = (dimDoc.height - dim.height) /2;

            if (isVerti && dim.x != newX) target.setDim({x:newX});
            else if (!isVerti && dim.y != newY) target.setDim({y:newY});
            else return this;

            if (this.shapeEditor.display) this.shapeEditor.update();
            else if (this.textEditor.display) this.textEditor.update();

            this.triggerChange();

            return this;
        }

        /**
        * Center selected elements vertically
        * @returns {JSYG.FullEditor}
        */
        centerVertically() {
            
            return this.center("vertically");
        }

        /**
         * Center selected elements horizontally
         * @returns {JSYG.FullEditor}
         */
        centerHorizontally() {
            
        return this.center("horizontally");
        }
    }

    FullEditor._plugins = [];

    //events
    [
        'onload',
        'ondrag',
        'ondraw',
        'oninsert',
        'onremove',
        'onchange',
        'onzoom',
        'onchangetarget',
        'ondisableedition'
        
    ].forEach(event => { FullEditor.prototype[event] = null; });

    FullEditor.prototype.idContainer = "containerDoc";

    FullEditor.prototype._editText = true;

    FullEditor.prototype._nbLayers = 0;

    FullEditor.prototype._currentLayer = null;

    function isPrivate(name) {
        
        return name.charAt(0) == '_';
    }

    ["copy","cut","paste"].forEach(action => {
        
        FullEditor.prototype[action] = function() {
            
            if (action!=="paste" && !this.shapeEditor.display) return;
            
            this.shapeEditor.clipBoard[action]();
            
            return this;
        };
    });


    ["undo","redo"].forEach(action => {
        
        FullEditor.prototype[action] = function() {
            
            this.hideEditors();
            
            this.undoRedo[action]();
            
            return this;
        };
        
    });

    ["Front","Backwards","Forwards","Back"].forEach(type => {
        
        const methode = `move${type}`;
        
        FullEditor.prototype[methode] = function() {
            
            const target = this.shapeEditor._target;
            
            if (target) {
                new JSYG(target)[methode]();
                this.triggerChange();
            }
            
            return this;
        };
    });

    ["Horiz","Verti"].forEach(type => {
        
        const methode = `move${type}`;
        
        FullEditor.prototype[methode] = function(value) {
            
            const target = this.shapeEditor.target();
            let dim;
            
            if (target && target.length) {
                
                dim = target.getDim();
                
                target.setDim( type == "Horiz" ? {x:dim.x+value} : {y:dim.y+value} );
                this.shapeEditor.update();
                
                this.triggerChange();
            }
            
            return this;
        };
    });

    const regOperator = /^\s*(\+|-|\*|\/)=(\d+)\s*$/;

    function parseValue(newValue,oldValue) {
        
        const matches = regOperator.exec(newValue);
        
        if (!matches) return newValue;
        
        switch (matches[1]) {
            case '+' : return oldValue + Number(matches[2]);
            case '-' : return oldValue - Number(matches[2]);
            case '*' : return oldValue * Number(matches[2]);
            case '/' : return oldValue / Number(matches[2]);
        }
    }

    /**
     * @property {string} cursorDrawing name of css cursor when drawing is active
     */
    FullEditor.prototype.cursorDrawing = "copy";

    FullEditor.prototype.autoEnableSelection = true;

    FullEditor.prototype._editableShapes = "*";

    function stopEvents(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    FullEditor.prototype.lang = "en";

    FullEditor.prototype.importSVGAs = "image";



