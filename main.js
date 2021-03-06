/* helper functions */

function random(min,max){
    return Math.floor((Math.random() * max) + min);
}

function findMatch(array,key,value){
    var result = null;
    var len = array.length;
    for(var i=0; i<len; i++){
        if(array[i][key]===value){
            result = array[i];
            break;
        }
    }
    return result;
}


jQuery.fn.calcbox = function(){
    var box = {};
   var offset = $(this).offset();
   box.x = offset.left;
   box.y = offset.top;
   box.w = $(this).width();
   box.h = $(this).height();
   box.c = {'x': box.x+(box.w/2) , 'y': box.y+(box.h/2)};
   return box;
};

/* global variables */
var settings = {
    screen_width : window.innerWidth,
    screen_height : window.innerHeight,
    jar_width: 0,
    jar_height: 0,
    jar_padding: 0 ,
    max_width: 3840,
    max_height:2160
};
var jars = [];
var stars = [];
/* 0 = jar selectable
 1 = star detail */
var click_mode = 0; 

/* objects */
function Jar(options){
    this.id = options.id ||  "";
    this.selected = false;
}

Jar.prototype.select = function(){
    this.selected = true;
    $('#'+this.id).animate({'top':'0'},500, 'linear', function(){
        //TODO: take out stars
    });
};

Jar.prototype.deselect = function(){
    this.selected = false;
    $('#'+this.id).css('top',(settings.jar_width*0.4)+'px');
    
    //TODO: put away stars
};

Jar.prototype.attach = function(jq){
     $('#jars_layer').append(jq);
     jars.push(this);
     var self = this;
     jq.click(function(evt){
         if(self.selected || click_mode==1){
             return;
         }
         
         var prevJar = findMatch(jars,'selected',true);
         if(prevJar!==null){
             prevJar.deselect();
         }
         
         self.select();
     });
};

function Star(options){
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.id = options.id || "";
    this.selected = false;
}

Star.prototype.select = function(){
    this.selected = true;

    var star = $('#'+this.id).detach();
    $('#star_detail').prepend(star);
    $('#'+this.id).animo({animation: "spinner", iterate: "infinite"});
    $('#stars_layer img').animo('blur');
      $('#jars_layer img').animo('blur');

    var place = $('#'+this.id).calcbox();
    $('#'+this.id).animate({'top':place.h/2, 'left':place.w/2}, 1000, function(){
        $('#'+this.id).animo("cleanse");
    });
    click_mode = 1;
    var det = $('#star_detail').detach();
    $('svg:last').after(det);
    $('#star_detail button.close').click(this.deselect);
    $('#star_detail').show();
};

Star.prototype.deselect = function(){
    this.selected = false;
    $('#'+this.id).animo("cleanse");
    var star = $('#'+this.id).detach();
    $('#stars_layer').append(star);
    $('#star_detail').hide();
    $('#stars_layer img').animo("focus");
    $('#'+this.id).css('left',this.x+'px');
    $('#'+this.id).css('top',this.y+'px');
    $('#jars_layer img').animo("focus");
$('#star_detail button.close').unbind('click');
click_mode = 0; 

};


Star.prototype.attach = function(jq){
    $('#stars_layer').append(jq);
     stars.push(this);
     
     var self = this;
     jq.click(function(evt){
         if(self.selected || click_mode==1){
             return;
         }
         var prevStar = findMatch(stars,'selected',true);
         if(prevStar!=null){
             prevStar.deselect();
         }
         self.select();
     });

};

/* functions */
function setSizes(){
    settings.screen_width = window.innerWidth;
    settings.screen_height = window.innerHeight;
    settings.jar_width = settings.screen_width*0.16;
    settings.jar_padding = settings.screen_width*0.13;
    
    console.log(settings.jar_width+' '+settings.jar_padding);
    for(var i=0; i<jars.length; i++){
        var img = $('#'+jars[i].id);
        img.css('width',settings.jar_width+'px');
        img.css('margin-left',settings.jar_padding+'px');
        if(!jars[i].selected){
            img.css('top',(settings.jar_width*0.4)+'px');   
        }
    }
}

function makeJars(){
    var img_prefix = 'images/';
    if(settings.jar_width>500){
        img_prefix = 'images/half';
    }
    
    var jarsLen = data.jars.length;
    for(var i=0; i<jarsLen; i++){
        var jardata = data.jars[i];
        
        var imgURL = img_prefix+jardata.url;
         var img = $('<img src="'+imgURL+'"/>');
         img.addClass('jar');
             var id = 'jar_'+jardata.title;
             img.attr('id',id);
             img.css('width',settings.jar_width+'px');
             img.css('height','auto');
             img.css('margin-left',settings.jar_padding+'px');
             img.css('top',(settings.jar_width*0.4)+'px');
             var jar = new Jar({id:id});
             jar.attach(img);
            if(jardata.title==='software'){
                jar.select();
            }
    }
}

function makeStars(){
    var half = false;
    var img_prefix;
    if(settings.screen_width<(settings.max_width/2)){
        half = true;
        img_prefix = 'images/halfstar-';
    } else {
        img_prefix = 'images/star-';
    }
    
    var xFactor = (settings.screen_width/(settings.max_width/2));
    var yFactor = (settings.screen_height/(settings.max_height/2));
    
    for(var i in data.stars){
        console.log(i);
        var starsLen = data.stars[i].length;
        for(var j=0; j<starsLen; j++){
            var stardata = data.stars[i][j];
            var url = img_prefix+stardata.title+'.png';
                var img = $('<img src="'+url+'" />');
                img.addClass('star');
                var id = "star_"+stardata.title;
                img.attr('id',id);
                
                img.css('z-index',(100+j));
                var left = stardata.x;
                var top = stardata.y;
                if(half){
                    left *= 0.5*xFactor;
                    top *= 0.5*yFactor;
                }
                img.css('left',left+'px');
                img.css('top',top+'px');
               // img.css('transform','scale('+xFactor+','+yFactor+')');
                var star = new Star({'id':id, 'x':left, 'y':top});
                star.attach(img);
                img.load(function(){
                    console.log(this);
                    var w = $(this).width()*xFactor;
                    var h = $(this).height()*yFactor;
                    $(this).css('width', w +'px');
                    $(this).css('height', h +'px');
                });
        } //end of stars
    } // end of grouping
    
}

/* intialize */
(function(){
    setSizes();
    
    //stars imit
    makeJars();
    
    // stars init
      makeStars();

})();

window.onresize = setSizes;

    