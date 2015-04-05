(function($, window, document, undefined) {
    'use strict';

    // global vars
    var $window = $(window),
        $document = $(document),
        $html = null,
        $body = null;


    // doc events
    $document.on({

        /**
         * + DOM ready
         * =====================================================================
         */

        ready: function(ev) {
            $html = $('html');
            $body = $('body');

            /**
             * + background texture
             * =====================================================================
             */

            $html.each(function(i, el) {
                var svg = d3.select('.background-texture').append('svg')
                            .attr('width', '100%')
                            .attr('height', '100%');
                var txt = textures.paths()
                            .d('woven')
                            .size(5)
                            .strokeWidth(1)
                            .stroke('#929496')
                            .background('#f6f8fa');;
                svg.call(txt);
                svg.append('rect')
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .style({
                        'fill': txt.url()
                    });
            });

            /* = background texture */

        }

        /* = DOM ready */


    });


})(jQuery, window, document);
