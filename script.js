$(document).ready(function(){
  $('#gallery').digigallery();
  /*
  $('#digigallery').digigallery('popup', {
    src: 'gallery/1624460.jpg'
  });
  */
});

(function($){

w = window.innerWidth,
h = window.innerHeight,
galleryImages = [],
digigallery = {images:[]},
fullscreen = false,
thumbLinkMenu = false,
albumCovers = false,
eIndx = 0,
tIndx = 0,
index = 0;


var methods = {
  init: function(options){

    $(this).addClass('digigallery');

    $DefaultOptions =
    {
      dir: 'gallery/',
      fileextension: '.jpg',
      loop: false,
      play: true,
      captions: false,
      effects: ['size','clip','blind','drop','fade','fold','scale'],
      transitions: ['linear','swing','easInQuad','easeOutQuad','easeInOutQuad','easeInCubic','easeInCubic','easeInQuart','easeInExpo','easeOutSine','easeInBack']
    }

    

    $DigiGallery = {
      playing: false,
      position: 0,
      fullscreen: true,
      albums: {titles:[]},
      init: function(){
        images = [];
        albumCount = 0;

        // Read Sub-Dir

        $.ajax({
        url: $DefaultOptions.dir,
        success: function(data){
            numAlbums = $(data).find("a:contains(/)").length;

            $(data).find("a:contains(/)").each(function (index) {                        
              var path = this.href.split('/');
              var dir = path[path.length - 2];
              if(dir !== 'thumbs'){
                $DigiGallery.albums.titles.push(dir);            
              }     
            });                
          },
        complete: function(){
          for(i=0;i<$DigiGallery.albums.titles.length;i++){
            var dir = $DigiGallery.albums.titles[i];
            var x = 1;
            $DigiGallery.loadAlbums(dir);                  
          }    
        }
        });
        /*
        // Load Files
        $.ajax({
        url: $DefaultOptions.dir,
        success: function (data) {
            
            $(data).find("a:contains(" + $DefaultOptions.fileextension + ")").each(function () {
                var filename = this.href.replace(window.location.host, "").replace("http:///", ""); // Need to fix file name bug ##################################################
                var image = filename.split('/');
                var imgObj = {
                  src: image[(image.length - 1)],
                  album: ''
                }
                images.push(imgObj);                
            });

            $(data).find("a:contains(/)").each(function (index) {                        
              var path = this.href.split('/');
              var dir = path[path.length - 2];
              if(dir !== 'thumbs'){
                $.ajax({
                url: $DefaultOptions.dir + dir + '/',
                success: function (data) {                  
                  $(data).find("a:contains(" + $DefaultOptions.fileextension + ")").each(function (index) {
                      var filename = this.href.replace(window.location.host, "").replace("http:///", ""); // Need to fix file name bug ##################################################
                      var image = filename.split('/');
                      var imgObj = {
                        src: dir + '/' + image[(image.length - 1)],
                        album: dir
                      }
                      images.push(imgObj);     
                  });
                  $DigiGallery.buildAlbums(images);     
                }                  
              });
              }
            });
        }
        });
        */
        
      },

      loadAlbums: function(album){
        var dir = album;
        $.ajax({
           url: $DefaultOptions.dir + dir + '/',
           success: function (subdata) {
             $(subdata).find("a:contains(" + $DefaultOptions.fileextension + ")").each(function (index) {
                var filename = this.href.replace(window.location.host, "").replace("http:///", ""); // Need to fix file name bug ##################################################
                var image = filename.split('/');
                 
                var id = Date.now() + Math.floor((Math.random() * 100) + 1);
                var img = new Image();
                img.src = $DefaultOptions.dir + dir + '/' + image[(image.length - 1)],
                img.title = id,
                img.alt = dir + '/' + image[(image.length - 1)];


                if(h > img.height){
                  //img.top = (((h - parseInt(img.height)) / 2) - 10);
                  img.top = 0;
                }else{
                  img.top = 0;
                }

                var imgObj = {
                  id: id,
                  pos: 0,
                  src: $DefaultOptions.dir + dir + '/' + image[(image.length - 1)],
                  thumb: $DefaultOptions.dir + dir + '/thumbs/' + image[(image.length - 1)],
                  img: img,
                  album: dir,
                  width: img.width+'px',
                  height: img.height+'px',
                  top: img.top+'px'
                }


                galleryImages.push(imgObj);

             });
             albumCount++;
           },
           complete: function(){
            if(albumCount === $DigiGallery.albums.titles.length){
              $DigiGallery.buildAlbums($DigiGallery.albums);
            }
           }
        });
      },

      buildAlbums: function(){
        
        $DigiGallery.albums.covers = {};

        for(i=0;i<$DigiGallery.albums.titles.length;i++){
          var album = $DigiGallery.albums.titles[i];
          for(x=0;x<galleryImages.length;x++){
            if(galleryImages[x].album === album){
              $DigiGallery.albums.covers[album] = galleryImages[x].src;
              x=galleryImages.length;
            }
          }
        }

        $DigiGallery.buildGallery(galleryImages);
      },

      buildGallery: function(images){
        
        for(i=0;i<images.length;i++){    

          galleryImages[i].pos = i;

          $digiGalleryThumb = $(
            '<div />', {
              click: function(){
                $id =  $(this).attr('id');
                $DigiGallery.openPopup({
                  id:  $id
                });
              },
              'id': images[i].id
            }).css({
              'background-color': 'rgba(0,0,0,1)',
              'background-image': 'url('+images[i].thumb+')',
              'background-repeat': 'no-repeat',
              'background-position': 'center',
              'background-size': 'cover'
            });

          $digiGalleryThumb.appendTo('.digigallery');
          
        }

        /* ---  ########################################################################################## */

       // $DigiGallery.sandbox();
      },

      openPopup: function(id){

        if(!fullscreen)
          $DigiGallery.toggleFullScreen();
        
        $DefaultOptions.play = true;

        var $digiGalleryPopup = $(
          '<div />', {
            'id': 'digi-gallery-overlay',
            'class': 'overlay-cursor'
          }).css({
          'display': 'block'}).prependTo('body').animate({
            'opacity': 1
          }, 100);

          $('html').off();
          $('html').on('keydown',function(e){
            if(e.which==39){
              // Right
              e.preventDefault();
              $DefaultOptions.loop = false;
              $DefaultOptions.play = true;              
              //$DigiGallery.cycleGallery('>');
              window.f.stop();
              if(!albumCovers){
                $DigiGallery.next();
              }else{
                $DigiGallery.nextAlbum();
              }
            }else if(e.which == 37){
              // Left
              e.preventDefault();
              $DefaultOptions.loop = false;
              $DefaultOptions.play = true;
              //$DigiGallery.cycleGallery('<');
              window.f.stop();
              if(!albumCovers){
                $DigiGallery.prev();
              }else{
                $DigiGallery.prevAlbum();
              }
            }else if(e.which == 32){
              // Space
              e.preventDefault();    
              $DigiGallery.togglePlayPause();
            }
          });
          
          $(document).off();
          $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange',function(){
            if(fullscreen){
              fullscreen = false
              $DigiGallery.hidePopup();
            }else{
              fullscreen = true;
            }
          });

          var body = document.getElementById("body");
            if (body.addEventListener) {
              // IE9, Chrome, Safari, Opera
              body.addEventListener("mousewheel", MouseWheelHandler, false);
              // Firefox
              body.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
            }
            // IE 6/7/8
            else body.attachEvent("onmousewheel", MouseWheelHandler);

        
        $('#digi-gallery-progress').remove();
        
        var $digiGalleryPopup = $(
          '<div />', {
           'id': 'digi-gallery-progress'
          }).css({
          'position':         'absolute',
          'bottom':           '0px',
          'left':             '0px',
          'width':            '0%',
          'height':           '5px',
          'background-color': 'rgba(150,150,235, .3',
          'opacity':          '0',
          'display':          'block',
          'z-index': '3'}).prependTo('body');
        
        var $digiGalleryFrame = $(
          '<div />', {
            'id': 'digi-gallery-popup'
          }).prependTo('#digi-gallery-overlay');

        for(i=galleryImages.length - 1;i>-1;i--){
        var $digiGalleryPopupImg = $(
          '<img>', {
              click: function(){ 
                $DigiGallery.hidePopup();
              },
              'class': 'digi-gallery-popupimg digi-gallery-border01-gray',
              'id': galleryImages[i].id,
              'src': galleryImages[i].img.src
            }).css({
              'position': 'absolute',
              'display': 'none',
              'width': '100%',
              'height': '100%',
              'max-width': w,
              'cursor': 'none',
              'background-image': 'url('+galleryImages[i].img.src+')',
              'background-repeat': 'no-repeat',
              'background-position': 'center',
              'background-size': 'cover'
            });

        $digiGalleryPopupImg.prependTo('#digi-gallery-popup');
        }


        for(x=0;x<galleryImages.length;x++){
          if(galleryImages[x].id == $id){
            $pos = galleryImages[x].pos;            
          }
        }

        // Navigation
        if(gallery){
          var $digiGalleryNav = $(
          '<div />', {
            'class': 'digi-gallery-navs'
          }).prependTo('#digi-gallery-overlay');

          var $digiGalleryNavRight = $(
          '<div />', {
            click: function(){ 
              event.preventDefault();
              $DigiGallery.cycleGallery('>');
            },
            mouseenter: function(){
              $(this).animate({
                right: '10px'
              },100).animate({
                right: '0px',
              },300);
            },
            mouseleave: function() {
              $(this).animate({
                right: '10px'
              },100).animate({
                right: '-30px',
              },300);
            },
            'class': 'digi-gallery-navs-right'
          }).prependTo('.digi-gallery-navs').animate({
            right: '30px'
          },300).animate({
            right: '-30px'
          },500);

          var $digiGalleryNavLeft = $(
          '<div />', {
            click: function(){ 
              event.preventDefault();
              $DigiGallery.cycleGallery('<');
            },
            mouseenter: function(){
              $(this).animate({
                left: '10px'
              },100).animate({
                left: '0px',
              },300);
            },
            mouseleave: function() {
              $(this).animate({
                left: '10px'
              },100).animate({
                left: '-30px',
              },300);
            },
            'class': 'digi-gallery-navs-left'
          }).prependTo('.digi-gallery-navs').animate({
            left: '30px'
          },300).animate({
            left: '-30px'
          },500);

        }

        // Options Panel
        var $digiGalleryOptionsPanel = $(
          '<div />', {
            'class': 'digi-gallery-options-panel',

          }).prependTo('#digi-gallery-overlay');

        var $digiGalleryOptionsPanelThumblink = $(
          '<div />', {
            click: function(){
              $DigiGallery.toggleThumbLink();
            },
            'class': 'digi-gallery-options-panel-thumblink'
          }).prependTo('.digi-gallery-options-panel');

        var $digiGalleryOptionsPanelPlay = $(
          '<div />', {
            click: function(){
              $DigiGallery.togglePlayPause();             
            },
            'class': 'digi-gallery-options-panel-play',
            'id':    'play'
          }).prependTo('.digi-gallery-options-panel');

        var $digiGalleryOptionsPanelFullScreen = $(
          '<div />', {
            click: function(){
              $DigiGallery.pause();
              $DigiGallery.hidePopup();
            },
            'class': 'digi-gallery-options-panel-fullscreen',
            'id':    'fullscreen-close'
          }).prependTo('.digi-gallery-options-panel');

        var $digiGalleryOptionsPanelInfo= $(
          '<div />', {
            click: function(){
              
            },
            'class': 'digi-gallery-options-panel-info',
            'id':    'fullscreen-info',
            'html': '<div class="digi-gallery-options-panel-counter" style="opacity: 1;"><span class="digi-gallery-options-panel-current">0</span> / <span class="digi-gallery-options-panel-total">'+galleryImages.length+'</span></div><div class="digi-gallery-options-panel-info-text"><div class="digi-gallery-options-panel-info-title">-- Title --</div><div class="digi-gallery-options-panel-info-description"> - Description -</div></div>'
          }).prependTo('.digi-gallery-options-panel');


        // Flux Gallery

        console.log('[pos]:'+$pos);

        $DigiGallery.fluxGallery($pos);
        
        $('#digi-gallery-overlay').removeClass('overlay-cursor').addClass('.overlay-cursor-none');

       

      },

      hidePopup: function(){        
        if(fullscreen)
          $DigiGallery.toggleFullScreen();

        $DefaultOptions.play = false;
        $DefaultOptions.loop = false;
        albumCovers = false;

        $('#digi-gallery-overlay').fadeOut('fast').remove();
      },

      cycleGallery: function(direction,steps){


        if($DefaultOptions.play){
          if(direction.length){

          var $id = $('.digi-gallery-popupimg').attr('id');          
          var $pos = $DigiGallery.getPosition($id);


        $('#digi-gallery-progress').animate({
          width: '0%'
        },1,function(){
          $('#digi-gallery-progress').fadeIn(1);
        });
                   
        
            if(!$DefaultOptions.loop){
              if(direction === '>'){
                 $('.digi-gallery-navs-right').animate({
                  right: '10px'
                },100).animate({
                  right: '-30px',
                },300);
              }else{
                $('.digi-gallery-navs-left').animate({
                  left: '10px'
                },100).animate({
                  left: '-30px'
                },300);
              }
            }

            if(direction === '>'){
              $right = true;
              if($pos < galleryImages.length - 1){
                $pos = $pos + 1;
              }else{
                $pos = 0;
              }

              id =  galleryImages[$pos].id;
              src = galleryImages[$pos].src;


            }else if(direction === '<'){

              if($pos > 0){
                $pos = $pos - 1;
              }else{
                $pos = galleryImages.length - 1;
              }

              id =  galleryImages[$pos].id;
              src = galleryImages[$pos].src;  

            }


            $animation = $DigiGallery.getEffect();

            $('.digi-gallery-popupimg').effect($animation.effect, $animation.transition, 1000, function(){            


               $(this).attr({
                'id': id
              }).css({
                'background-image': 'url('+src+')'
              }).delay(1000).fadeIn(2000);

              $('#digi-gallery-progress').delay(500).animate({ 
                width: '100%',
                opacity: '1'}, 2000, function(){
                  $(this).delay(1000).fadeOut(500);
                });
            });

          if($DefaultOptions.loop){
            setTimeout(function(){
              if($DefaultOptions.play)
                $DigiGallery.cycleGallery('>');
            },8000);
          }
          
        }
        }         
      },

      fluxGallery: function(pos){

        console.log(pos);

        index = pos;
        $DigiGallery.position = index;

        if(!flux.browser.supportsTransitions)
          alert("Flux Slider requires a browser that supports CSS3 transitions");
          
        window.f = new flux.slider('#digi-gallery-popup', {
          autoplay: false,
          pagination: false,
          transitions: ['bars', 'blinds', 'blocks', 'blocks2', 'dissolve', 'slide', 'zip', 'bars3d', 'blinds3d', 'cube', 'tiles3d', 'turn'],
          delay: 7000,
          width: w,
          height: h + 150

        });

        $Flux = window.f;
        $Flux.showImage($DigiGallery.position);
        $DigiGallery.setCaption($DigiGallery.position);

        if($DefaultOptions.loop){
          setTimeout(function(){
            if($DefaultOptions.play){
              $DigiGallery.play($DigiGallery.position);
            }
          }, 6000);
        }
       
        // Setup a listener for user requested transitions
        $('div#transitions').bind('click', function(event){
          event.preventDefault();

          // If this is a 3D transform and the browser doesn't support 3D then inform the user
          if($(event.target).closest('ul').is('ul#trans3d') && !flux.browser.supports3d)
          {
            alert("The '"+event.target.innerHTML+"' transition requires a browser that supports 3D transforms");
            return;
          }
          
          window.f.next(event.target.href.split('#')[1]);
        });

        $('.surface .images div').off();
        $('.surface .images div').on('click',function(){
          window.f.stop();
          $DigiGallery.hidePopup();
        });

         $('.image1').addClass('overlay-cursor-none'); 
        $('.surface .images div, .digi-gallery-options-panel').off();
        $('.surface .images div, .digi-gallery-options-panel').on("mousemove", function(){
          lastMouseMove = Date.now();
          $('.surface .images div').css('cursor', '');
          $('.surface .images div').addClass('overlay-cursor');
          $('.image1').removeClass('overlay-cursor-none');
          $('.digi-gallery-options-panel').fadeIn('fast');
          setTimeout(function(){
            if((parseInt(Date.now ()) - lastMouseMove) > 2000){              
              $('.surface .images div').css('cursor', 'none');
              $('.image1').addClass('overlay-cursor-none');
              if(!thumbLinkMenu)
                $('.digi-gallery-options-panel').fadeOut('fast');
            }
          },2500);
        });       

        /*
        $('#digi-gallery-popup').bind('fluxTransitionEnd', function(event) {
          $('.image1').addClass('overlay-cursor-none');
        });
        */
      },

      play: function(){
        var index = $DigiGallery.position;
        $DefaultOptions.loop = true;
        $DefaultOptions.play = true;
        $DigiGallery.playing = true;

        if(index < galleryImages.length - 1){
          index += 1
        }else{
          index = 0;
        }

        $DigiGallery.position = index;
        $DigiGallery.setCaption(index);
        $Flux.next();

        if($DefaultOptions.loop){
          setTimeout(function(){
            if($DefaultOptions.play){
              $DigiGallery.play(index);
            }
          }, 6000);
        }

      },

      pause: function(){
        $DefaultOptions.loop = false;
        $DefaultOptions.play = false;
        $DigiGallery.playing = false;     
      },

      next: function(){
        var index = $DigiGallery.position;
        $DigiGallery.pause();
        if(index < galleryImages.length - 1){
          index += 1
        }else{
          index = 0;
        }
        $DigiGallery.position = index;
        $DigiGallery.setCaption(index);
        $Flux.next();
      },

      prev: function(){
        var index = $DigiGallery.position;
        $DigiGallery.pause();
        if(index > 0){
          index = index - 1;
        }else{
          index = (galleryImages.length - 1);
        }
        $DigiGallery.position = index;
        $DigiGallery.setCaption(index);
        $Flux.prev();
      },

      togglePlayPause: function(){
        var index = $DigiGallery.position;
        var $playButton = $('.digi-gallery-options-panel-play');
        if($DigiGallery.playing){
          $playButton.attr('id','play');
          $playButton.removeClass('pause');
          $('#digi-gallery-play-button').remove();
          $('<div />', {
            'id': 'digi-gallery-pause-button',
            'class': 'digi-gallery-pause-button'
          }).prependTo('#digi-gallery-overlay').animate({
            'opacity': 1
          }, 500).delay(1500).fadeOut('slow');
          $DigiGallery.pause();
        }else{
          $playButton.attr('id','pause');
          $playButton.addClass('pause');
          $('#digi-gallery-pause-button').remove();
          $('<div />', {
            'id': 'digi-gallery-play-button',
            'class': 'digi-gallery-play-button'
          }).prependTo('#digi-gallery-overlay').animate({
            'opacity': 1
          }, 1000, function(){
          }).delay(1000).fadeOut('slow');
          setTimeout(function(){
            $DigiGallery.play(index);
          }, 2000);
        }
      },

      toggleThumbLink: function(){

        $DigiGallery.pause();

        var id = $('.digi-gallery-menu-overlay').attr('id');

        if(id === 'digi-gallery-menu-opened'){
        thumbLinkMenu = false;
        albumCovers = false;
        $('.digi-gallery-menu-overlay').attr('id','digi-gallery-menu-closed');
        $('.digi-gallery-menu-overlay').animate({
            'top': (h + 75) + 'px' ,
            'opacity': 0
          }, 200, function(){
            $('.digi-gallery-menu-overlay').delay(500).remove();
          });   
        }else{
        thumbLinkMenu = true;
        $('.digi-gallery-menu-overlay').attr('id', 'digi-gallery-menu-opened');
        var $digiGalleryCaption = $(
          '<div />', {
            'class': 'digi-gallery-menu-overlay',
            'id': 'digi-gallery-menu-opened'
          }).css({
            'top': (h + 75) + 'px' 
          }).prependTo('#digi-gallery-popup').animate({
            'top': '0px',
            'opacity': 1
          }, 200);

          $DigiGallery.displayAlbumCovers($DigiGallery.albums.titles[0]);
        }
      },

      displayAlbumCovers: function(albumTitle){

        albumCovers = true,
        $DigiGallery.albums.pos = 0;
        $DigiGallery.albums.slideIndex = 0;   

        var ucTitle = albumTitle.charAt(0).toUpperCase() + albumTitle.slice(1);

        $('#digi-gallery-album-cover').remove();

        var $digiGalleryAlbumCover = $(
          '<div />', {
            'class': 'digi-gallery-album-cover-full',
            'id': 'digi-gallery-album-cover'
          }).prependTo('.digi-gallery-menu-overlay').delay(750).animate({
            'opacity': '.25',
            'width': '70%',
            'height': '60%'
          },100, function(){
            $(this).animate({
              'opacity': 1
            }, 'slow');

            $('<div />', {
              'class': 'digi-gallery-album-cover-frame'
            }).prependTo('.digi-gallery-album-cover-full');

            var $digiGalleryAlbumTitle = $(
              '<div />', {
                'class': 'digi-gallery-album-title-full',
                'id': 'digi-gallery-album-title',
                'html': ucTitle
              }).appendTo('.digi-gallery-menu-overlay');

            var offsetLeft = 0;

            for(i=0;i<$DigiGallery.albums.titles.length;i++){
              var albumTitle = $DigiGallery.albums.titles[i];
              var albumCover = $DigiGallery.albums.covers[albumTitle];
              $('<div />', {
                'class': 'digi-gallery-album-cover-img-full',
                'src': albumCover
              }).css({
                'background-image': 'url('+albumCover+')',
                'left': offsetLeft+'px'
              }).appendTo('.digi-gallery-album-cover-frame');
              offsetLeft += 1364;
            }
          });
      },

      nextAlbum: function(){
        if($DigiGallery.albums.pos < $DigiGallery.albums.titles.length - 1){
          $DigiGallery.albums.pos += 1;          
        }else{
          $DigiGallery.albums.pos = 0;
        }

        $DigiGallery.albums.slideIndex += 1;
        var offsetLeft = '-' + (parseInt($DigiGallery.albums.pos) * 1364) + 'px';

        var albumTitle = $DigiGallery.albums.titles[$DigiGallery.albums.pos];
        var ucTitle = albumTitle.charAt(0).toUpperCase() + albumTitle.slice(1);
        var albumCover = $DigiGallery.albums.covers[albumTitle];

        $('.digi-gallery-album-cover-img-full').each(function(index){
          $(this).animate({
            'left': '-=1364'
          }, 200, function(){
            if(index == $DigiGallery.albums.titles.length - 1){
              var lastOffset = ( ($DigiGallery.albums.titles.length - 1) * 1364) + 'px';
              $('#digi-gallery-album-title').html(ucTitle);
              $('.digi-gallery-album-cover-img-full').eq(0).appendTo('.digi-gallery-album-cover-frame').css({
                'left': lastOffset,
                'opacity': '.25'
              });
              $('.digi-gallery-album-cover-img-full').eq(0).animate({
                'opacity': 1
              },150 );
            }                        
          });
        });
      },

      prevAlbum: function(){
        if($DigiGallery.albums.pos > 0){
          $DigiGallery.albums.pos -= 1;
        }else{
          $DigiGallery.albums.pos = $DigiGallery.albums.titles.length - 1;
        }

        $DigiGallery.albums.slideIndex -= 1;
        var offsetLeft = (parseInt($DigiGallery.albums.pos) * 1364) + 'px';

        var albumTitle = $DigiGallery.albums.titles[$DigiGallery.albums.pos];
        var ucTitle = albumTitle.charAt(0).toUpperCase() + albumTitle.slice(1);
        var albumCover = $DigiGallery.albums.covers[albumTitle];

        $('.digi-gallery-album-cover-img-full').eq($DigiGallery.albums.titles.length - 1).prependTo('.digi-gallery-album-cover-frame').css({
          'left': '-1364px'
        });

        $('.digi-gallery-album-cover-img-full').each(function(index){
          $(this).animate({
            'left': '+=1364'
          }, 200, function(){
            if(index == $DigiGallery.albums.titles.length - 1){
              var firstOffset = '-1364px';
              $('#digi-gallery-album-title').html(ucTitle);
              $('.digi-gallery-album-cover-img-full').eq(0).animate({
                'opacity': 1
              },250 );
            }else{
              $(this).animate({
                'opacity': '.25'
              },150 );
            }                        
          });
        });           
      },

      setCaption: function(index){
        $('.digi-gallery-caption').remove();

        var position = (index + 1),
            title    = galleryImages[index].img.title,
            desc     = galleryImages[index].img.alt;

        $('.digi-gallery-options-panel-current').html(position);

        $('.digi-gallery-options-panel-info-title').html(title);
        $('.digi-gallery-options-panel-info-description').html(desc);

        if($DefaultOptions.captions){
          setTimeout(function(){
            var $digiGalleryCaption = $(
              '<div />', {
                'class': 'digi-gallery-caption',
                'html':  '<span class="desc">'+desc+'</span>'
              }).prependTo('#digi-gallery-popup').animate({
                opacity: 1,
                right: '60px'
              }, 300 ).delay(100).animate({
                right: '-10px'
              }, 400);
          }, 1500);
        }
      },

      getPosition: function(id){
        for(i=0;i<galleryImages.length;i++){
          if(galleryImages[i].id == id){
            return i;
          }
        }
      },

      getEffect: function(){

        /* #### If Progressive Effects List 
        if(eIndx < $DefaultOptions.effects.length - 2){
          eIndx = eIndx + 1;
        }else{
          eIndx = 0;
        } */

        eIndx = Math.floor((Math.random() * $DefaultOptions.effects.length) + 0);
        tIndx = Math.floor((Math.random() * $DefaultOptions.transitions.length) + 0);

        var animationObj = {
          effect: $DefaultOptions.effects[eIndx],
          transition: $DefaultOptions.transitions[tIndx]
        }

        return animationObj;
      },

      toggleFullScreen: function(){
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
          $DigiGallery.fullscreen = true;
          $('.digi-gallery-options-panel-fullscreen').removeClass('fullscreen-open');          
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
          $DigiGallery.fullscreen = false;
          $('.digi-gallery-options-panel-fullscreen').addClass('fullscreen-open');
        }
      },

      sandbox: function(){
        for(i=0;i<galleryImages.length;i++){
          $img = $('<img>',{
            src: galleryImages[i].src
          }).css({
            top: '0px',
            left: '0px',
            width: '600px'
          }).prependTo('#sandbox');
        }

        /* fx 

        blindX
        blindY
        blindZ
        cover
        curtainX
        curtainY
        fade
        fadeZoom
        growX
        growY
        scrollUp
        scrollDown
        scrollLeft
        scrollRight
        scrollHorz
        scrollVert
        shuffle
        slideX
        slideY
        toss
        turnUp
        turnDown
        turnLeft
        turnRight
        uncover
        wipe
        zoom

        */

        function getCycleFx(){
          $cycleFx = [
            'blindX',
            'blindY',
            'blindZ',
            'cover',
            'curtainX',
            'curtainY',
            'fade',
            'fadeZoom',
            'growX',
            'growY',
            'scrollUp',
            'scrollDown',
            'scrollLeft',
            'scrollRight',
            'scrollHorz',
            'scrollVert',
            'shuffle',
            'slideX',
            'slideY',
            'toss',
            'turnUp',
            'turnDown',
            'turnLeft',
            'turnRight',
            'uncover',
            'wipe',
            'zoom'
          ];

          fxIndx = Math.floor((Math.random() * $cycleFx.length) + 0);

            return $cycleFx[fxIndx];
        }

        $('#sandbox').cycle({ 
          fx:   'blindX,blindY,blindZ,cover,curtainX,curtainY,fade,fadeZoom,growX,growY,scrollUp,scrollDown,scrollLeft,scrollRight,scrollHorz,scrollVert,shuffle,slideX,slideY,toss,turnUp,turnDown,turnLeft,turnRight,uncover,wipe,zoom',
          easing: 'easeInOutBack',
          speed:    1000, 
          timeout:  3000
        });
          return true;
      }
    }

    $DigiGallery.init();    
  }
};


function cycleGallery(direction,steps){
 console.log('Call to local method');
}

function hidePopup(){
  console.log('Call to local method');
}

function getGalleryPosition(id){
  console.log('Call to local position');
}

function MouseWheelHandler(e) {
var e = window.event || e; // old IE support
var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

if(delta == -1){
  if(!albumCovers){
    $DigiGallery.next();
  }else{
    $DigiGallery.nextAlbum();
  }
}else{
  if(!albumCovers){
    $DigiGallery.prev();
  }else{
    $DigiGallery.prevAlbum();
  }
}
  return false;
}

$.fn.digigallery = function(methodOrOptions) {
if(methods[methodOrOptions]){
  return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
}else if(typeof methodOrOptions==='object'||!methodOrOptions){
  return methods.init.apply( this, arguments );
}else{
  $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.digigallery' );
}};})(jQuery);