(function($, window, document, undefined) {
    'use strict';

    var $window = $(window),
        $document = $(document);

    $.extend($.easing, {
        easeInBounce: function (x, t, b, c, d) {
            return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;
        },
        easeOutBounce: function (x, t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOutBounce: function (x, t, b, c, d) {
            if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
            return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    });

    $document.ready(function(){

        $('#text-flicker').on({
            startAni: function(ev,a){
                $(this).animate({
                    opacity: a ? .9 : .2
                },{
                    duration: a ? 400 : 1000,
                    easing: 'easeInOutBounce',
                    queue: true,
                    complete: function(val) {
                        $('#text-flicker').delay( a ? 2000 : 400 ).trigger( 'startAni', [ a ? false : true ] );
                    }
                })
            }
        }).css('opacity',0).trigger('startAni',[true]);

    });

})(jQuery, window, document);
