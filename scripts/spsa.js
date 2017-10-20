
$(document).ready(() => {

  // init state
  spsa.state.wndw.scroll = $(window).scrollTop();

  /* handlers */

  // click
  $('a').click((e) => e.preventDefault());

  $('.scroll.arrow').click((e) => {
    var hdr = $('header');
    var destination = 'section:first-of-type';
    //var destination_id = $(destination).id;
    if(!hdr.hasClass('top')){
      spsa.scrollToElement(destination, 1000);
      spsa.affixElement('header', 'top', 1200, () => {
        // TODO: find an alternative to adding margin; this method is inconsistent
        // Fix: when window is resized and scrolled before clicking arrow, scrolling stops before it should
        spsa.setFixedHeaderMargin('main', destination);
      });
    }
    else{
      spsa.scrollToElement(destination, 1000);
    }
  });

  // scroll
  $(window).scroll(() => {

    // header starts fixed at bottom, detaches on scroll down, then fixed at top
    var hdr = $('header');
    if(hdr.hasClass('bottom')){
      if(($('main').outerHeight() - $(window).scrollTop()) <= hdr.position().top){
        hdr.removeClass('bottom');
        hdr.removeClass('fixed');
      }
    }
    var direction = 'up';
    if($(window).scrollTop() < spsa.state.wndw.scroll){
         direction = 'down';
    }
    spsa.state.wndw.scroll = $(window).scrollTop();
    if(spsa.detectElementAtTop('header')){
         spsa.affixElement('header', 'top', 10);
         // TODO: find an alternative to adding margin to avoid 'jump' effect
         spsa.setFixedHeaderMargin('main', 'section:first-of-type');
    }

    // fade in section background images when in view
    for(image in spsa.state.images){
      var this_image = spsa.state.images[image];
      var selector = '#' + this_image.id;
      if(this_image.type === 'section'){
        if(spsa.detectElementInVerticalView(selector)){
          spsa.fauxParallax(this_image, direction, 'fast');
          if(!$(selector).hasClass('fade-in')){
               $(selector).addClass('fade-in');
          }
        }
      }
    }
  });
});

const spsa = (($, imagesData) => {
  return {
     // constructors
     Animation: function(scroll, speed, target, properties){
       let dflt = {
     //     borderWidth: {
     //       unit: 'px',
     //       resolution: 1,
     //       range: {
     //         lower: 5,
     //         upper: 20
     //       },
     //       pval: 'init',
     //       calc: x => -x * 0.5
     //     },
         opacity: {
           unit: null,
           resolution: 0.1,
           range: {
             lower: 0,
             upper: 0.8
           },
           pval: 'init',
           calc: x => x >= 0 ? 0.005 : -0.005
      },
      marginLeft: {
        unit: 'px',
        resolution: 1,
        range: {
          lower: 0,
          upper: null
        },
        pval: 'init',
        calc: x => x * 20
      }
     //     ,
     //     width: {
     //       unit: 'px',
     //       resolution: 1,
     //       range: {
     //         lower: 1,
     //         upper: 838
     //       },
     //       pval: 1,
     //       calc: x => x * 80
     //     }
       }
       this.scroll = scroll || 0;
       this.speed = speed || 'slow';
       this.target = target || '.animation-overlay';
       // valid CSS properties
       this.properties = properties || dflt;
     },
     state: {
       // tracks scrollTop value
       wndw: {
        scroll: 0
       },
       images: imagesData
     },
     // methods
     setSectionImageIDs: function(){
       // initial value is 1 because id 0 is reserved for the the fixed main image
       for(var i = 1; i < this.state.images.length; i++){
         this.state.images[i].id = this.state.images[i].type + '-image-' + i;
       }
       console.log(this.state.images);
     },
     renderSectionsBefore: function(before_selector){
       // render HTML based on state.images
       var last = $(before_selector);
       var source = this.state.images;
       for(s in source){
         var css = {'background-image': 'url(' + source[s].url + ')'};
         if(source[s].css){
           css = {...css, ...source[s].css};
         }
         if(source[s].type === 'section'){
           var section = $('<section></section>').
             addClass('row align-items-center');
               var background_container = $('<div></div>').
                 addClass('col-auto background-container').
                 prop('title', source[s].title).
                 prop('id', source[s].id).
               // data('filename', source[s].title.replace(/\s/g, '-')).
                 css(css);
               var section_header = $('<h3></h3>').
                 addClass('content').
                 text(source[s].title);
               var loader = $('<i></i>').
                 addClass('fa fa-circle-o-notch fa-spin loading');
               var animation_container = $('<div></div>').
                 addClass('row justify-content-center content');
                 var animation = $('<div></div>').
                   addClass('animation-overlay');
         animation_container.append(animation, section_header);
         background_container.append(loader, animation_container);
         section.append(background_container);
         last.before(section);
         }
       }
     },
     detectElementInVerticalView: function (selector){
       var elm, elmTop, elmHeight, windowScrolled, windowHeight, fixedHeaderHeight;
       elm = $(selector);
       elmTop = elm.offset().top;
       elmHeight = elm.outerHeight(true); // height with padding, margins, etc.
       windowScrolled = $(window).scrollTop();
       windowHeight = $(window).height();
       fixedHeaderHeight = $('header').css('position') === 'fixed' ? $('header').outerHeight(true) : 0;
       if(windowScrolled > (elmTop - windowHeight) && // top of element is visible at bottom of window
          (windowScrolled) < (elmTop + elmHeight - fixedHeaderHeight)){ // bottom of element is visible at top of window
        return true;
       }
       return false;
     },
     detectElementAtTop: function (selector){
       // Source: https://stackoverflow.com/questions/13647239/how-to-dynamically-check-if-elements-hit-top-of-window
       if ($(window).scrollTop() > $(selector).offset().top) {
        return true;
       }
       return false;
     },
     affixElement: function (selector, location, delay, callback){
       window.setTimeout(() => {
         !$(selector).hasClass('fixed') ? $(selector).addClass('fixed') : '';
         !$(selector).hasClass(location) ? $(selector).addClass(location) : '';
         // TODO: currently, callback sets new margin-top for main and first section; is this the best way to handle it?
         if(callback){
              callback();
         }
       }, delay);
     },
     getFrameOffset(selector){
          var frame, title, offset;
          frame = $(selector);
          title = frame.next();
          offset = title.outerWidth();
          console.log('frame offset for element ' + selector + ' is ' + offset)
          return offset;
     },
     setFixedHeaderMargin: function(){
       // sets margin for the main and first section when the header element when the header is affixed to the top
       // arguments must be valid selectors
       for(var i = 0; i < arguments.length; i++){
         var new_margin = parseFloat($(arguments[i]).css('margin-top')) || 0 + $('header').outerHeight(true);
         $(arguments[i]).css('margin-top', new_margin);
       }
     },
     scrollToElement: function (selector, speed) {
       // alternative to using anchor/target
       var px = ($(selector).position().top - $('header').outerHeight(true)) || 0;
       $('html, body').animate({scrollTop: px}, speed);
     },
     fauxParallax: function (image, direction){
       // moves element at a defined speed in opposite direction of scroll
       // image is supplied as an image object from this.state.images
       let spd, amt, target, elm, inc, nst, calc, init;
       if(!image.animation){
           console.log('creating new animation for ' + image.title)
           image.animation = new this.Animation();
       }
       spd = {slow: 0.2, medium: 0.4, fast: 0.6};
       amt = spd[image.animation.speed];
       // selector of a child element to animate rather than the element that contains the image
       target = image.animation.target || '';
       elm = $('#' + image.id + ' ' + target);
       inc = direction === 'up' ? amt : -amt;

       for(prp in image.animation.properties){
         let this_prp = image.animation.properties[prp];
         if(prp === 'marginLeft' && !this_prp.range.upper){
           // TODO: find out why the calc is off by 6px
           this_prp.range.upper = this.getFrameOffset('#' + image.id
             + ' ' + target) + 5;
         }
         if(this_prp.pval === 'init'){
           init = elm.css(prp);
           console.log('init: ' + init + '; typeof init: ' + typeof init)
           this_prp.pval = typeof init !== 'number' ? parseFloat(init) : init;
           console.log('changing init value for ' + image.title +
           ' ' + prp + ' to ' + this_prp.pval);
         }
         calc = this_prp.calc;
         this_prp.pval += calc ? calc(inc) : inc;
         nst = this_prp.pval.toFixed(1);
         //console.log('nst ' + nst)
console.log(image.title +
' ' + prp + '; nst % this_prp.resolution = ' + nst + ' % ' + this_prp.resolution + ': ' +
         (nst * 10) % (this_prp.resolution * 10))
         if((nst * 10) % (this_prp.resolution * 10) === 0 &&
            nst >= this_prp.range.lower &&
            nst <= this_prp.range.upper){
              elm.css(prp, this_prp.unit ? nst + this_prp.unit : nst);
              console.log('changing ' + image.title +
             ' ' + prp + ' to ' + elm.css(prp));
         }
       }
       //console.log(this.state.images)
     },
     // Source: https://www.sitepoint.com/community/t/onload-for-background-image/6462/2
     preloadImages(){
       // preloader
       for(var i = 0; i < this.state.images.length; i++){
         var img = new Image();
         var this_image = this.state.images[i];
         var selector = '#' + this_image.id;
         var elm = $(selector);
         elm.children('.content').hide();
         if(this_image.loader){
           elm.children('.loading').fadeIn(2000);
         }
         img.src = this_image.url;
         img.onload = (() => {
          setTimeout((elm) => { // for testing
            elm.addClass('loaded');
            elm.children('.loading').hide();
            elm.children('.content').fadeIn(1000);
           }, 2000, elm);
         })();
       }
     }
  }
})(jQuery, imagesData);

// preload the images
spsa.setSectionImageIDs();
spsa.renderSectionsBefore('footer');
spsa.preloadImages();

// scroll to top onload, before document is ready
// Source: https://stackoverflow.com/questions/11486527/reload-browser-does-not-reset-page-to-top
$(window).on('load', () => {
  setTimeout(() => {
   $(window).scrollTop(0);
  }, 0);
});
