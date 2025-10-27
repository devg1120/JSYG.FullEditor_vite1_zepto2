

import FullEditor  from "./JSYG.FullEditor_es6.js";
//import JSYG from "jsyg"
import JSYG                from "./JSYG-wrapper/JSYG-wrapper.js"


//const sleep = (time) => new Promise((r) => setTimeout(r, time));//timeはミリ秒


//$( function() {
window.addEventListener('DOMContentLoaded', function() {
//window.onload = ()=>{


    window.svgEditor = new FullEditor('svg');

    svgEditor.editableShapes = "> *";

    svgEditor.enable();


    ["left","center","right","top","middle","bottom"].forEach(type => {

        //$(`#align${JSYG.ucfirst(type)}`).on("click",() => {
        //    svgEditor.align(type);
        //})

        let selector = `#align${JSYG.ucfirst(type)}`;   //TODO
        let eventName = 'click'

        let handler = () => {
            svgEditor.align(type);
        };
	document.querySelector(selector).addEventListener(eventName, handler, false)

    });

  //  ["Front","Back","ToFront","ToBack"].forEach(type => {
   ["Front","Back","Forwards","Backwards"].forEach(type => {
/*
        $(`#move${type}`).on("click",() => {
            //svgEditor[`moveTarget${type}`]();
            svgEditor[`move${type}`]();
        });
*/

        let selector = `#move${type}`
        let eventName = 'click'

        let handler = () => {
            //svgEditor[`moveTarget${type}`]();
            svgEditor[`move${type}`]();
        };
	document.querySelector(selector).addEventListener(eventName, handler, false)
	
    });

    //$("#insertText").on("click",function() {
    //    const text = new JSYG("<text>").text("Bonjour le monde");
    //    svgEditor.enableInsertElement(text);
    //    new JSYG(this).trigger("blur");
    //});

    let selector = "#insertText"
    let eventName = 'click'

    let handler = function ()  {
        const text = new JSYG("<text>").text("Bonjour le monde");
        svgEditor.enableInsertElement(text);
        new JSYG(this).trigger("blur");
       };
    let target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
/*
    selector = 
    eventName = 'click'
    handler = () => {
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/
   // $("#newDocument").on("click",() => {
   //     svgEditor.newDocument( $('#width').val(), $('#height').val() );
   // });

    selector = "#newDocument"
    eventName = 'click'
    handler = () => {
        //svgEditor.newDocument( $('#width').val(), $('#height').val() );
        let w = document.querySelector('#width').value;
        let h = document.querySelector('#height').value;
        svgEditor.newDocument( w, h );
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }


    //$("#openDocument").on("click",() => {
    //    console.log("openDocument");
    //    //svgEditor.chooseFile().then(svgEditor.loadFile).catch(alert);
    //    svgEditor.chooseFile().then((arg) => svgEditor.loadFile(arg)).catch(alert);  // GUSA
    //});

    selector = "#openDocument"
    eventName = 'click'
    handler = () => {
        //svgEditor.chooseFile().then(svgEditor.loadFile).catch(alert);
        svgEditor.chooseFile().then((arg) => svgEditor.loadFile(arg)).catch(alert);  // GUSA
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

    //$("#openImage").on("click",() => {
    //    svgEditor.chooseFile().then(svgEditor.loadImageAsDoc).catch(alert);
    //});

    selector = "#openImage"
    eventName = 'click'
    handler = () => {
        svgEditor.chooseFile().then(svgEditor.loadImageAsDoc).catch(alert);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

  //  $("#insertImage").on("click",() => {
   //     svgEditor.chooseFile().then(svgEditor.insertImageFile).catch(alert);
   // });

    selector = "#insertImage"
    eventName = 'click'
    handler = () => {
        svgEditor.chooseFile().then(svgEditor.insertImageFile).catch(alert);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

    //$("#downloadSVG").on("click",() => {
    //    svgEditor.download("svg");
    //});

    selector = "#downloadSVG"
    eventName = 'click'
    handler = () => {
        svgEditor.download("svg");
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

    //$("#downloadPNG").on("click",() => {
    //    svgEditor.download("png");
    //});

    selector = "#downloadPNG"
    eventName = 'click'
    handler = () => {
        svgEditor.download("png");
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

    //$('#openExample').on("click",() => {
    //    $('#exampleChoice').modal();
    //});

  /* TODO
    selector = '#openExample'
    eventName = 'click'
    handler = () => {
        $('#exampleChoice').modal();    //TODO
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
  */

    //$('#confirmExample').on("click",() => {
    //    $('#exampleChoice').modal("hide");
    //    svgEditor.loadURL(`examples/${$('#examples').val()}.svg`);
    //});

/* TODO
    selector = '#confirmExample'
    eventName = 'click'
    handler = () => {
        $('#exampleChoice').modal("hide");
        let target = document.querySelector('#exampleChoice')
        if (target) {
             target.modal("hide")
        }
        svgEditor.loadURL(`examples/${$('#examples').val()}.svg`);
    };

    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/

    //svgEditor.on("load",() => {
    //    console.log("svgEditor  on load");
    //    const dim = svgEditor.dimDocument();
    //    $('#width').val(dim.width);
    //    $('#height').val(dim.height);
    //});

/*
    handler = () => {
        console.log("svgEditor  on load");
        const dim = svgEditor.dimDocument();
        let w = document.querySelector('#width')
        if (w) {
             w.value = dim.width;
        }
        let h = document.querySelector('#height')
        if (h) {
             h.value = dim.height;
        }

    };
    svgEditor.addEventListener('load', handler, false)
*/


//    $('#width').on("change",function() {
//        svgEditor.dimDocument({width:this.value});
//    });

    selector = '#width'
    eventName = 'change'
    handler = function() {
        svgEditor.dimDocument({width:this.value});
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }


//    $('#height').on("change",function() {
//        svgEditor.dimDocument({height:this.value});
//    });

    selector =  '#height'
    eventName = 'change'
    handler = function ()  {
        svgEditor.dimDocument({height:this.value});
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }



//    $('.collapse').collapse({parent:"#accordion"});
/*
    selector = 
    eventName = 'click'
    handler = () => {
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/


//    $('#viewPanel').on("hide.bs.collapse",() => {
//	    console.log("hide collapse");
//        svgEditor.disableMousePan();
//        $('#mousePan').removeClass("active");
//    });

/*
    selector = '#viewPanel'
    eventName = "hide.bs.collapse"
    handler = () => {
        svgEditor.disableMousePan();
        element = document.querySelector('#mousePan')
	element.classList.remove("active")
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/
/*
    $('#mousePan').on("click",function() {
        svgEditor.enableMousePan();
        $(this).addClass("active");
    });
*/


    selector = '#mousePan'
    eventName = 'click'
    handler = function ()  {
        svgEditor.enableMousePan();
        if (!this.classList.contains("active")) {
             svgEditor.enableMousePan();
             this.classList.add("active");
	} else {
             svgEditor.disableMousePan(false);
             this.classList.remove("active");
	}
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

/*
    $('#drawShapes').on({
        "show.bs.collapse":function () {
             console.log("drawShapes  show");
            $('#shape').trigger("change");
        },
        "hide.bs.collapse":function() {
            svgEditor.disableShapeDrawer();
            svgEditor.disableInsertElement();
            svgEditor.enableSelection();
             console.log("drawShapes  hide");
        }
    });
*/

/*
    selector = 
    eventName = 'click'
    handler = () => {
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/
	
//    $('#drawShapesOff').on("click", function(){
//	    console.log("click Off");
//            svgEditor.disableShapeDrawer();
//            svgEditor.disableInsertElement();
//            svgEditor.enableSelection();
//	    $('#shape').val("-");
//    });

    selector = '#drawShapesOff'
    eventName = 'click'
    handler = () => {
            svgEditor.disableShapeDrawer();
            svgEditor.disableInsertElement();
            svgEditor.enableSelection();
            let s = document.querySelector('#shape')
	    s.value = "-"
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

/*
    $('#shape').on("change",function() {

        let type = this.value;

        if (type == "-") {
            svgEditor.disableShapeDrawer();
            svgEditor.disableInsertElement();
            svgEditor.enableSelection();
            return;

	}

        if (type.includes("path")) {
            svgEditor.drawingPathMethod = (type == "path") ? "point2point" : "freehand";
            type = "path";
        }

        const shape = new JSYG(`<${type}>`).addClass("perso");

        if (type == "text") svgEditor.enableInsertElement(shape);
        else svgEditor.enableShapeDrawer(shape);
    });
*/


    selector = '#shape'
    eventName = 'change'
    handler = function () {
        let type = this.value;

        if (type == "-") {
            svgEditor.disableShapeDrawer();
            svgEditor.disableInsertElement();
            svgEditor.enableSelection();
            return;

	}

        if (type.includes("path")) {
            svgEditor.drawingPathMethod = (type == "path") ? "point2point" : "freehand";
            type = "path";
        }

        const shape = new JSYG(`<${type}>`).addClass("perso");

        if (type == "text") svgEditor.enableInsertElement(shape);
        else svgEditor.enableShapeDrawer(shape);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

    $('#marqueeZoom').on("click",() => {
        svgEditor.marqueeZoom();
    });

/*
    selector = 
    eventName = 'click'
    handler = () => {
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }
*/

//    $('#fitToCanvas').on("click",() => {
//        svgEditor.zoomTo('canvas');
//    });


    selector = '#fitToCanvas'
    eventName = 'click'
    handler = () => {
        svgEditor.zoomTo('canvas');
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

//    $('#fitToDoc').on("click",() => {
//       svgEditor.fitToDoc();
//    });


    selector = '#fitToDoc'
    eventName = 'click'
    handler = () => {
       svgEditor.fitToDoc();
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

//    $('#realSize').on("click",() => {
//        svgEditor.zoomTo(100);
//    });


    selector = '#realSize'
    eventName = 'click'
    handler = () => {
        svgEditor.zoomTo(100);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }


//    $('#zoomIn').on("click",() => {
//        svgEditor.zoom(+10);
//    });


    selector =  '#zoomIn'
    eventName = 'click'
    handler = () => {
        svgEditor.zoom(+10);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

//    $('#zoomOut').on("click",() => {
//        svgEditor.zoom(-10);
//    });


    selector = '#zoomOut'
    eventName = 'click'
    handler = () => {
        svgEditor.zoom(-10);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

    ["remove","copy","cut","paste","undo","redo","group","ungroup"].forEach(action => {
/*
        $('#'+action).on("click",function() {
            svgEditor[action]();
        });
*/
	    
        //$(`#${action}`).on("click",(arg) => {    // GUSA
        //    svgEditor[action](arg);
        //});

    selector = `#${action}`
    eventName = 'click'
    handler = (arg) => {
            svgEditor[action](arg);
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }

	
    });

    ["canvasResizable","editPathMainPoints","editPathCtrlPoints","keepShapesRatio","autoSmoothPaths","useTransformAttr","editPosition","editSize","editRotation","editText"].forEach(property => {
/*
        $(`#${property}`).on("change",function() {
		console.log("change", property);
            svgEditor[property] = this.checked;
            new JSYG(this).blur();
        }).trigger("change");
*/

    selector = `#${property}`
    eventName = 'change'
    handler = function()  {
            svgEditor[property] = this.checked;
            new JSYG(this).blur();
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false);
         const clickEvent = new Event('change');
	 target.dispatchEvent(clickEvent);

    }




    });

    //$('#print').on("click",() => { svgEditor.print(); });
	
    selector = '#print'
    eventName = 'click'
    handler = () => {
        svgEditor.print();
    };
    target = document.querySelector(selector)
    if (target) {
         target.addEventListener(eventName, handler, false)
    }




    svgEditor.registerKeyShortCut({
        "ctrl+c": svgEditor.copy,
        "ctrl+x": svgEditor.cut,
        "ctrl+v": svgEditor.paste,
        "ctrl+z": svgEditor.undo,
        "ctrl+y": svgEditor.redo,
        "ctrl+a":svgEditor.selectAll,
        "del": svgEditor.remove,
        "up" : function(e) { e.preventDefault(); svgEditor.dim("y","-=1"); },
        "down" : function(e) { e.preventDefault(); svgEditor.dim("y","+=1"); },
        "left" : function(e) { e.preventDefault(); svgEditor.dim("x","-=1"); },
        "right" : function(e) { e.preventDefault(); svgEditor.dim("x","+=1"); }
    });

    svgEditor.newDocument(500,500);

    svgEditor.enableDropFiles();

    svgEditor.enableMouseWheelZoom();

});

