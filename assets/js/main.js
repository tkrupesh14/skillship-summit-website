// ---------------------------------------------------------------------
// Global JavaScript
// Authors: Andrew Ross & a little help from my friends
// ---------------------------------------------------------------------

/*jshint esversion: 6 */
var andrewrossco = andrewrossco || {};

(function($, APP) {

$(function() {
  APP.Global.init();
  APP.Viewport.init();
  APP.Modal.init();
  APP.ScrollTo.init();
  APP.Tabs.init();
  APP.Accordion.init();
  APP.Timezones.init();
  APP.Filters.init();
  APP.Form.init();
  APP.Carousel.init();
  APP.Countdown.init();
});

// ---------------------------------------------------------------------
// Browser and Feature Detection
// ---------------------------------------------------------------------

APP.Global = {
  init: function() {

    $('body').addClass('page-ready');
    $('body').removeClass('no-js');

    if ( ! ('ontouchstart' in window) ) {
      document.documentElement.classList.add('no-touch');
    }

    if ( 'ontouchstart' in window ) {
      document.documentElement.classList.add('is-touch');
    }

    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      if(navigator.appVersion.indexOf('Trident') === -1) {
        document.documentElement.classList.add('isEDGE');
      } else {
        $('html').addClass('isIE isIE11');
      }
    }

    var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    if(isSafari){
      document.body.classList.add('browser-safari');
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('darkmode');
      document.getElementById('favicon').setAttribute('href', '/assets/img/favicons/favicon-light.png');
    }

    if(window.location.hostname == 'localhost' | window.location.hostname == '127.0.0.1'){
      document.body.classList.add('localhost');
    }

    $('.js-menu-trigger').click(function(e){
      e.preventDefault();
      if( $('body').hasClass('menu-is-active') ) {
        $('body').removeClass('menu-is-active');
      } else {
        $('body').addClass('menu-is-active');
      }
    });

    $(window).keyup(function (e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 9){
        if ($(window).width() < 768) {
          if ( $('.navigation__inner a:focus, .navigation__inner input:focus').length) {
            $('body').addClass('menu-is-active');
          } else {
            $('body').removeClass('menu-is-active');
          }
        }
      }
    });


    $('.fancy-click').click(function(){
      let el = $(this);
      el.addClass('active');

      setTimeout(function(){
        el.removeClass('active');
      }, 600);
    });

    $('.has-sub-nav > a').click(function(e){
      e.preventDefault();
    });

    $(window).keyup(function (e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 9){
        //if ($(window).width() < 768) {
          if ( $('.site-header a:focus').length) {
            $('.site-header').addClass('is-focused');
          } else {
            $('.site-header').removeClass('is-focused');
          }
        //}
      }
    });
  }
};


// ---------------------------------------------------------------------
// Detect when an element is in the viewport
// ---------------------------------------------------------------------

APP.Viewport = {

  init: function() {
    let items = document.querySelectorAll('*[data-animate-in], *[data-detect-viewport]'),
    pageOffset = window.pageYOffset;

    function isScrolledIntoView(el) {
      var rect = el.getBoundingClientRect(),
      elemTop = rect.top,
      elemBottom = rect.top + el.offsetHeight,
      bottomWin = pageOffset + window.innerHeight;
      return (elemTop < bottomWin && elemBottom > 0);
    }

    function detect() {
      for(var i = 0; i < items.length; i++) {
        if ( isScrolledIntoView(items[i]) ) {
          if( !items[i].classList.contains('in-view') ) {
            items[i].classList.add('in-view');
          }
        }
      }
    }

    function throttle(fn, wait) {
      var time = Date.now();
      return function() {
        if ((time + wait - Date.now()) < 0) {
          fn();
          time = Date.now();
        }
      };
    }

    window.addEventListener('scroll', throttle(detect, 150));

    window.addEventListener('resize', detect);

    for(var i = 0; i < items.length; i++) {
      var d = 0,
      el = items[i];

      if( items[i].getAttribute('data-animate-in-delay') ) {
        d = items[i].getAttribute('data-animate-in-delay') / 1000 + 's';
      } else {
        d = 0;
      }
      el.style.transitionDelay = d;
    }
    $(document).ready(detect);
  }

};


// ---------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------

APP.Modal = {

  init: function() {

    const modalOpen = $('*[data-modal]');

    modalOpen.on('click touchstart:not(touchmove)', function(event) {
      event.preventDefault();
      let el = $(this);
      let trigger = el.attr('data-modal');
      let target = $("#" + trigger);

      if( target.hasClass('is-active') ) {
        target.removeClass('is-active');
        $('body').removeClass('modal-is-active');
        target.find('.modal__content').removeClass('d-none');
        target.find('.share-modal-content').addClass('d-none');
        window.location.hash = '';
      } else {
        target.addClass('is-active');
        $('body').addClass('modal-is-active');
        window.location.hash = trigger;
        window._octo = window._octo || [];
        window._octo.push(['recordPageView'])
      }
    });

    $(document).ready(function(){
      let hash = window.location.hash.replace('#', '');
      $('.modal-wrap').each(function(){
        if( $(this).attr('id') === hash ) {
          $(this).addClass('is-active');
          $('body').addClass('modal-is-active');
          window.location.hash = hash;
          window._octo = window._octo || [];
          window._octo.push(['recordPageView'])
        }
      });
    });
  }
};



// ---------------------------------------------------------------------
// Scroll to
// ---------------------------------------------------------------------

APP.ScrollTo = {
  init: function() {
    if( $('*[data-scroll-to]').length ) {
      this.bind();
    } else {
      return;
    }
  },

  bind: function() {
    $('*[data-scroll-to]').on('click touchstart:not(touchmove)', function() {
      window.dispatchEvent(new Event('resize'));
      var trigger = $(this).attr('data-scroll-to'),
      target = $("#" + trigger),
      ss = 1000, //scroll speed
      o = 0; // offset

      if( $(this).attr('data-scroll-speed') ) {
        ss = $(this).attr('data-scroll-speed');
      }

      if( $(this).attr('data-scroll-offset') ) {
        o = $(this).attr('data-scroll-offset');
      }

      $('html, body').animate({
        scrollTop: target.offset().top - o
      }, ss);
    });
  }
};




// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------

APP.Tabs = {

  init: function() {
    const tabs = $('.tab');

    $('.js-tab-bd.is-active').show()
    tabs.click(function() {
      let el = $(this);
      let target = el.attr('data-tab');
      let newActive = $('.js-tab-bd[data-tab-bd=' + target + ']');
      let curActive = $('.js-tab-bd.is-active');
      tabs.removeClass('is-active');
      el.addClass('is-active');
      curActive.removeClass('is-active').fadeOut(100);
      newActive.addClass('is-active').fadeIn(400);
    });

    const tabs2 = $('.tabs__tab');
    tabs2.click(function() {
      let el = $(this);
      let target = el.attr('data-tab');
      let newActive = $('.tabs__content[data-tab-bd=' + target + ']');
      let curActive = $('.tabs__content.is-active');
      tabs2.removeClass('is-active');
      el.addClass('is-active');
      curActive.removeClass('is-active');
      newActive.addClass('is-active');
    });

    var hash = window.location.hash.replace('#', '');
    $(document).ready(function(){
      if( hash.length && $('.schedule-tabs .tab[data-tab=' + hash + ']').length ) {
        $('.schedule-tabs .tab[data-tab=' + hash + ']').click();
        setTimeout(function(){
          $('html, body').animate({
            scrollTop: $('#schedule').offset().top - 72
          }, 400);
        }, 200);
      }
      if( hash.length && $('.tabs__tab[data-tab=' + hash + ']').length ) {
        $('.tabs__tab[data-tab=' + hash + ']').click();
      }
    });
  }
};


// ---------------------------------------------------------------------
// Accordion
// ---------------------------------------------------------------------

APP.Accordion = {

  init: function() {
    if( $('.accordion').length ) {
      this.bind();
    } else {
      return;
    }
  },

  bind: function() {
    const acc = $('.accordion__hd');
    acc.click(function(){
      $(this).parents('.accordion').toggleClass('is-open');
      $(this).next('.accordion__bd').slideToggle(400);
    });
    $('.accordions .accordion:first-child .accordion__hd').each(function(){
      $(this).parents('.accordion').addClass('is-open');
      $(this).next('.accordion__bd').show();
    });
  }
};



// ---------------------------------------------------------------------
// Timezones
// ---------------------------------------------------------------------

APP.Timezones = {

  init: function() {

    let times = $('.js-time');
    let timeWithZone = $('.js-time-timezone');
    let dateTime = $('.js-time-dateTime');
    let dateTimeLong = $('.js-time-dateTime-long');

    function get_tz() {
      return /\((.*)\)/.exec(new Date().toString())[1];
    }

    //let dt = new Date();
    let curTimeZone = get_tz();

    $('.js-current-timezone').text(curTimeZone);

    let twelveHourTime = false;
    if( Intl.DateTimeFormat().resolvedOptions().timeZone.includes("America") ) {
      twelveHourTime = true;
    }

    // Set all session times
    function setSessionTimes() {
      times.each(function(){
        let el = $(this),
            time = el.attr('data-time');
        let parsedTime = parseTime(time);
        el.html(parsedTime);
      });
      timeWithZone.each(function(){
        let el = $(this);
        let time = el.attr('data-time');
        let parsedTime = parseTimeZone(time);
        el.html(parsedTime);
      });

      dateTime.each(function(){
        let el = $(this);
        let time = el.attr('data-time');
        let parsedTime = parseTimeDate(time, "short");
        el.html(parsedTime);
      });
      dateTimeLong.each(function(){
        let el = $(this);
        let time = el.attr('data-time');
        let parsedTime = parseTimeDate(time, "long");
        parsedTime = parsedTime.replace(", ", " • ");
        el.html(parsedTime);
      });

      $('.js-time-day').each(function(){
        let el = $(this);
        let time = el.attr('data-time');
        let parsedTime = parseDay(time);
        str = parsedTime.substr(0, parsedTime.lastIndexOf(","));

        if( time.includes("26") ) {
          if( !str.includes("26") ) {
            el.html('*' + str);
          } else {
            el.remove();
          }
        }
        if( time.includes("27") ) {
          if( !str.includes("27") ) {
            el.html('*' + str);
          } else {
            el.remove();
          }
        }
      });

      $('.js-day').each(function(){
        let el = $(this);
        let time = el.attr('data-time');
        let parsedTime = parseDay(time);
        str = parsedTime.substr(0, parsedTime.lastIndexOf(","));
        el.html(str);
      });
    }

    function parseTimeDate(date, month) {
      let seshTime = new Date(date);
      let setFormat = seshTime.toLocaleTimeString([], {month: month, day: "numeric", hour12: twelveHourTime, hour: "numeric", minute: "numeric", timeZoneName: "short"});
      return setFormat;
    }

    function parseTimeZone(date) {
      let seshTime = new Date(date);
      setFormat = seshTime.toLocaleTimeString([], {hour12: twelveHourTime, hour: "numeric", minute: "numeric", timeZoneName: "short"});
      return setFormat;
    }

    function parseTime(date) {
      let seshTime = new Date(date);
      //https://www.jsman.net/manual/Standard-Global-Objects/Date/toLocaleTimeString
      // weekday: "long",
      // hour12: false,
      let setFormat = seshTime.toLocaleTimeString([], {hour12: twelveHourTime, hour: "numeric", minute: "numeric"});
      return setFormat;
    }

    function parseDay(date) {
      let seshTime = new Date(date);
      //console.log(seshTime);
      let setFormat = seshTime.toLocaleTimeString([], {month: "long", day: "numeric"});
      return setFormat;
    }

    function parseDay(date) {
      let seshTime = new Date(date);
      let setFormat = seshTime.toLocaleTimeString([], {month: "long", day: "numeric"});;
      return setFormat;
    }

    function getTimezoneOffset() {
      function z(n){return (n<10? '0' : '') + n;}
      var offset = new Date().getTimezoneOffset();
      var sign = offset < 0? '+' : '-';
      offset = Math.abs(offset);
      return sign + z(offset/60 | 0) + z(offset%60);
    }


    $(document).ready(function(){
      setSessionTimes();
    });
  }
};



// ---------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------

APP.Filters = {

  init: function() {

    if( !document.getElementById('filters') ) {
      return;
    }

    const filters = $('.category label');
    const sessionsWrap = $('.sessions');
    const session = $('.js-session');
    const timeslots = $('.on-demand__sessions');

    let activeChannels = [];

    filters.click(function(){
      let el = $(this);
      let filter = el.prev('input').val();

      sessionsWrap.addClass('is-thinking');

      setTimeout(function(){
        sessionsWrap.removeClass('filtered-tag-open-source');
        sessionsWrap.removeClass('filtered-tag-devops');
        if( filter == 'clear' ) {
          localStorage.setItem('satelliteSchedFilter', 'all');
          $('.timeslot').removeClass('is-empty');
          $('.session').removeClass('is-active');
        } else {
          sessionsWrap.addClass('filtered-'+filter);
          localStorage.setItem('satelliteSchedFilter', filter);
          session.each(function(){
            if( $(this).hasClass(filter) ) {
                $(this).addClass('is-active');
              } else {
                $(this).removeClass('is-active');
              }
          });
          timeslots.each(function(){
            if( $(this).find('.session.is-active').length == 0) {
                $(this).parent('.timeslot').addClass('is-empty');
              } else {
                $(this).parent('.timeslot').removeClass('is-empty');
              }
          });
        }

        sessionsWrap.removeClass('is-thinking');
      }, 800);
    });

    // Check for query params
    $(document).ready(function(){
      let activeFilter = localStorage.getItem('satelliteSchedFilter');
      if( activeFilter != null ) {
        filter = activeFilter;
      }

      let urlParams = new URLSearchParams(window.location.search);
      if( urlParams.get('filter') ) {
        //console.log('param hit');
        filter = 'tag-' + urlParams.get('filter');
        localStorage.setItem('satelliteSchedFilter', filter);
      }

      if( filter != null ) {
        //console.log('Active filter = ' + filter);
        $('.category label[for="'+ filter +'"]').click();
      }
    });
  }
};


// ---------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------

APP.Form = {

  init: function() {
    if( $('.dynamic-form').length ) {
      this.bind();
    } else {
      return;
    }
  },

  bind: function() {

    var form = document.getElementById("eloquaForm");

    if( localStorage.getItem('satelliteSessionTitle') ) {
      document.getElementById("sessionTitle").value = localStorage.getItem('satelliteSessionTitle');
    }

    form.addEventListener("submit", function(event) {
      event.preventDefault();
      event.stopPropagation();

      valid = true;

      $('input[required]').each(function(){
        if( $(this).attr('type') === 'tel' ){
          if ( /^\d{3}-?\d{3}-?\d{4}$/g.test($(this).val())  ) {
          } else {
            $(this).parents('.form-group').addClass('error');
            valid = false;
          };
        } else {
          if( $(this).val().length === 0 ) {
            $(this).parents('.form-group').addClass('error');
            valid = false;
          }
        }
      });

      // Prevent form submission and contact with server
      if (valid) {
        // $('input[required]').each(function(){
        //   if( $(this).val().length === 0 ) {
        //     $(this).parents('.form-group').addClass('error');
        //   }
        // });
        onSubmit();
      } else {
        //onSubmit();
      }
      form.classList.add("validated");
    }, false);


    // reCaptcha callback function, generate reCaptcha token client side
    function onSubmit() {
      var form = document.getElementById("eloquaForm");
      var action = form.action;
      var http = new XMLHttpRequest();
      http.open('POST', action, true);
      var formData = new FormData( form );
      http.send(formData);

      //Call a function when the state changes.
      http.onreadystatechange = function() {
        if (http.readyState === 4) {
          if (http.status === 200) {
            var thankYou = document.createElement('p');
            thankYou.classList = 'py-6 py-6 text-white f3';
            thankYou.innerHTML = 'Thank you! We will be in touch shortly.';
            $('.sales-modal-hd').addClass('d-none');
            form.parentNode.appendChild(thankYou);
            form.remove();
          } else {
            form.classList.remove('is-thinking');
            var failMsg = document.createElement('p');
            failMsg.classList = 'py-4 text-error f3';
            failMsg.innerHTML = 'There was an issue with your submission. Please try again.';
            form.parentNode.appendChild(failMsg);
          }
        }
      };
    }

    function showStateStudy() {
      var y = document.getElementById("countryStudy").value;
      var x = document.getElementById("stateProvStudyBlock");
      if (y == 'US' || y == 'CA') {
        x.style.display="block";
      } else {
        x.style.display="none";
      }
    }

    form.addEventListener("change", function() {
      showStateStudy();
    });

    var $ = jQuery;
    $('.dynamic-form input, .dynamic-form select').on('focus', function() {
      $(this).parents('.form-group').addClass('is-active');
    });

    $('.dynamic-form input, .dynamic-form select').on('focusout', function() {
      if( $(this).val().length === 0 ) {
        $(this).parents('.form-group').removeClass('is-active');
      } else {
        $(this).parents('.form-group').removeClass('error');
      }
    });

    $(document).ready(function(){
      $('.dynamic-form input, .dynamic-form select').each(function() {
        if( $(this).val().length !== 0 ) {
          $(this).parents('.form-group').addClass('is-active');
        }
      });
    });

  }
};





// ---------------------------------------------------------------------
// Carousel
// ---------------------------------------------------------------------

APP.Carousel = {

  init: function() {
    if( $('.js-carousel').length ) {
      this.bind();
    } else {
      return;
    }
  },

  bind: function() {

    const arrowPrev = '<span class="slick-prev"><svg viewBox="0 0 4.7 8"><path d="M0.1,3.7l3.7-3.6C3.8,0,3.9,0,4,0 c0.1,0,0.2,0,0.3,0.1l0.2,0.2c0.1,0.1,0.1,0.1,0.1,0.2c0,0.1,0,0.2-0.1,0.3L1.3,4l3.2,3.1c0.1,0.1,0.1,0.2,0.1,0.3 c0,0.1,0,0.2-0.1,0.2L4.3,7.9C4.2,8,4.1,8,4,8C3.9,8,3.8,8,3.8,7.9L0.1,4.2C0,4.2,0,4.1,0,4S0,3.8,0.1,3.7z"/></svg></span>';
    const arrowNext = '<span class="slick-next"><svg viewBox="0 0 4.7 8"><path d="M4.7,4c0,0.1,0,0.2-0.1,0.2L0.9,7.9 C0.8,8,0.7,8,0.6,8C0.5,8,0.4,8,0.3,7.9L0.1,7.7C0.1,7.6,0,7.5,0,7.4c0-0.1,0-0.2,0.1-0.3L3.3,4L0.1,0.9C0,0.8,0,0.7,0,0.6 c0-0.1,0-0.2,0.1-0.2l0.2-0.2C0.4,0,0.5,0,0.6,0c0.1,0,0.2,0,0.2,0.1l3.7,3.6C4.6,3.8,4.7,3.9,4.7,4z" /></svg></span>';

    const car = $('.js-carousel');

    car.each(function(){
      $(this).slick({
        dots: false,
        infinite: false,
        arrows: true,
        speed: 1000,
        autoplay: false,
        prevArrow: arrowPrev,
        nextArrow: arrowNext,
        slidesToShow: 4,
        slidesToScroll: 2,
        responsive: [
          {
            breakpoint: 1024,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 2,
              speed: 400
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              speed: 400
            }
          },
          {
            breakpoint: 480,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 1,
              speed: 400
            }
          }
        ]
      });
    });
  }
};


// ---------------------------------------------------------------------
// Countdown Timer
// ---------------------------------------------------------------------

APP.Countdown = {

  init: function() {
    if( $('.js-countdown').length ) {
      this.bind();
    } else {
      return;
    }
  },

  bind: function() {
    let time = $('.js-countdown').attr('data-time');
    let end = new Date( time );

    //console.log('countdown end ' +  end);
    let shutdown = new Date( time );
    let minutesOffset = 30;
    shutdown.setMinutes(shutdown.getMinutes() - minutesOffset);

    //console.log('countdown end ' +  end);
    //console.log('countdown shutdown ' +  shutdown);

    let _second = 1000;
    let _minute = _second * 60;
    let _hour = _minute * 60;
    let _day = _hour * 24;
    let timer;
    let countdownWrap = document.querySelectorAll('.countdown-wrap');
    var countdown = document.querySelectorAll('.js-countdown');

    var now = new Date();
    var distance = end - now - (getESTOffset()) * _hour;
    if (now > shutdown) {
      $('.countdown-wrap').remove();
    }

    setTimeout(function(){
      $('.countdown-wrap').addClass('is-active');
    }, 500);

    function getESTOffset() {
      return new Date().getTimezoneOffset() - (end.getTimezoneOffset());
    }

    function showRemaining() {
      var now = new Date();
      var distance = end - now - (getESTOffset()) * _hour;
      var close = shutdown - now - (getESTOffset()) * _hour;
      if (close < 0) {
        clearInterval(timer);
        $('.countdown-wrap').slideUp();
        return;
      }
      let days = Math.floor(distance / _day);
      let hours = Math.floor((distance % _day) / _hour);
      let minutes = Math.floor((distance % _hour) / _minute);
      let seconds = Math.floor((distance % _minute) / _second);

      countdown[0].innerHTML = days + "<span>d </span> " + hours + "<span>h </span> " + minutes + "<span>m </span> " + seconds + "<span>s</span> ";
    }

    timer = setInterval(showRemaining, 1000);

  }
};


}(jQuery, andrewrossco));
