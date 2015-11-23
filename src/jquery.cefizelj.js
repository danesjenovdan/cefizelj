/*
 * cefizelj
 * http://danesjenovdan.si/cefizelj
 *
 * Copyright (c) 2015 Danes je nov dan, inštitut za druga vprašanja
 * Licensed under the WTFPL license.
 */

(function($) {

  // Collection method.
  $.fn.cefizelj = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.cefizelj = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.cefizelj.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.cefizelj.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].cefizelj = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
