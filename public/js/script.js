/* eslint-disable */

// ---
// INITIALIZE VARIABLES
// ---
var animating = false;
var tree;
var basenode;
var currentnode;
var breadcrumbs = [];
var dontChangeCrumbs = false;
var animationQueue = [];

var animateSpeedMove = 500;
var animateSpeedStretch = 300;

var originalTitle = document.title;
var baseurl = window.location.pathname;
if (baseurl.indexOf('/korak/') !== -1) {
  baseurl = baseurl.slice(0, baseurl.indexOf('/korak/') + 1);
}

var itemHTML = ['<div class="item centermycontentvertically" data-id="{{ id }}">',
                  '<div class="centermevertically">',
                    '<h1 class="fwd" data-text="{{ itemcontent }}">{{ itemcontent }}</h1>',
                  '</div>',
                '</div>'].join('\n');

// ---
// FIRST PAINT
// ---

// set correct item heights
function repaintMe() {
  // $('.cefizelj-container').height($('.cefizelj-container').parent().height());
  $('.cefizelj-container').height('100vh');

  $('.item').not('.stretched, .shrunk').each(function (i, e) {
    $(e).height($(e).parent().height() / $(e).parent().children('.item').length);
  });

  $('.stretched').each(function (i, e) {
    $(e).height($(e).parent().height());
  });
}

// api tree getter
function getTree(callback) {
  $.get('./tree.json', function (r) {
    console.log('getTree response', r);
    tree = {tree: r};
    callback();
  });
}

// start the app
function startApp() {
  // set basenode and currentnode
  basenode = tree.tree[0];
  currentnode = basenode;

  generateFirstNode();

  if (animationQueue.length) {
    goToNewCrumbs(animationQueue.shift());
  }
}

// generate first node
function generateFirstNode() {
  $('.cefizelj-container').html('<div class="half half-left bck-red border-red"></div><div class="half half-right"></div>');
  $('.half-left').append(
    itemHTML
      .replace('{{ id }}', basenode._id)
      .replace(/{{ itemcontent }}/g, basenode.name)
      .replace(/"item /g, '"item noclick ')
  );
  for (var i in basenode.items) {
    var node = basenode.items[i];
    $('.half-right')
      .append(
        itemHTML
          .replace('{{ id }}', node._id)
          .replace(/{{ itemcontent }}/g, node.name)
      );
  }
  repaintMe();
}

// ---
// END OF FIRST PAINT
// ---

function animationFinished() {
  if (!dontChangeCrumbs) {
    window.history.pushState(breadcrumbs, '', baseurl + 'korak/' + breadcrumbs.join('/'));
    console.log('pushState', breadcrumbs);
  }

  // var title = $('.half-right .contentcontainer .block-heading .info__title h1').first().text();
  var selectedItem = $('.half-left .item.stretched h1').first();
  var title = selectedItem.data('text') || selectedItem.text();
  if (title) {
    document.title = title + ' - ' + originalTitle;
  } else {
    document.title = originalTitle;
  }

  // reset values
  animating = false;
  dontChangeCrumbs = false;

  // do next animation in queue
  if (animationQueue.length) {
    goToNewCrumbs(animationQueue.shift());
  } else {
    animateSpeedMove = 500;
    animateSpeedStretch = 300;
  }
}

// ---
// Move Forward
// ---

// render and display next half
function displayNextHalf(target) {
  if (!dontChangeCrumbs) {
    breadcrumbs.push(target);
  }
  renderNext(currentnode.items.filter(function(item) {
    return item._id == target;
  })[0]);
}

// render next half
function renderNext(targetnode) {
  currentnode = targetnode;
  if (targetnode.type === 'link') {
    createUrlHalf(targetnode.article);
  } else if ((targetnode.items[0].type == 'menu') || (targetnode.items[0].type == 'link')) {
    // render list
    $('.half-right').after(createListHalf(targetnode.items));
    repaintMe();
    moveLeft();
  } else {
    moveLeft();
  }
}

function createUrlHalf(url) {
  $.get(url, function(r) {
    var result = '<div class="half half-rightr half-content"><div class="visible-xs centermycontentvertically nazajcontainer"><div class="centermevertically nazaj bck">Nazaj</div></div>' + '<div class="contentcontainer" data-id="0">' + r + '</div></div>';
    $('.half-right').after(result);
    repaintRightr();
    moveLeft();
  });
}

// repaint rightr
function repaintRightr() {
  $('.half-rightr .item').each(function (i, e) {
    $(e).height($(e).parent().height() / $(e).parent().children('.item').length);
  });
}

// create list half
function createListHalf(items) {
  var result = '<div class="half half-rightr">';

  $.each(items, function (i, item) {
    result += itemHTML
      .replace('{{ id }}', item._id)
      .replace(/{{ itemcontent }}/g, item.name);
  });

  result += '</div>';
  return result;
}

// move left and cleanup (next)
function moveLeft() {
  if ($(window).width() < 768 && $('.half-rightr').hasClass('half-content')) {
    $('.half-left').animate({
      'margin-left': '-100%'
    }, animateSpeedMove, function () {
      // cleanup
      $('.half-leftr').removeClass('half-leftr'); // remove hidden left

      // update classes
      $('.half-left').removeClass('half-left').addClass('half-leftr'); // left -> leftr
      $('.half-right').removeClass('half-right').addClass('half-left'); // right -> left
      $('.half-rightr').removeClass('half-rightr').addClass('half-right').next().addClass('half-rightr').removeClass('half-right'); // rightr -> right, next -> rightr

      animationFinished();
    });
  } else {
    $('.half-left').animate({
      'margin-left': '-50%'
    }, animateSpeedMove, function () {
      // cleanup
      $('.half-leftr').removeClass('half-leftr'); // remove hidden left

      // update classes
      $('.half-left').removeClass('half-left').addClass('half-leftr'); // left -> leftr
      $('.half-right').removeClass('half-right').addClass('half-left'); // right -> left
      $('.half-rightr').removeClass('half-rightr').addClass('half-right').next().addClass('half-rightr').removeClass('half-right'); // rightr -> right, next -> rightr

      animationFinished();
    });
  }
}

// ---
// Move Back
// ---

// move right
function displayPreviousHalf() {
  // remove last breadcrumb
  if (!dontChangeCrumbs) {
    breadcrumbs.pop();
  }
  // set currentnode
  currentnode = basenode;
  for (var i in breadcrumbs) {
    var breadcrumb = breadcrumbs[i];
    currentnode = currentnode.items.filter(function(item) {
      return item._id == breadcrumb;
    })[0];
  }

  $('.half-leftr').animate({
    'margin-left': '0%'
  }, animateSpeedMove, function () {
    //cleanup
    $('.half-right').remove();

    $('.half-left')
      .removeClass('half-left')
      .addClass('half-right')
      .children('h1')
      .removeClass('bck')
      .addClass('fwd');

    $('.half-leftr')
      .removeClass('half-leftr')
      .addClass('half-left')
      .prev()
      .addClass('half-leftr');

    animationFinished();
  });
}

// ---
// Stretch and shrink selected item
// ---

// stretch item
function stretchItem(item) {
  item
    .addClass('stretched')
    .animate({
      height: item.parent().height()
    }, animateSpeedStretch);
  item
    .siblings()
    .addClass('shrunk')
    .animate({
      height: 0
    }, animateSpeedStretch);
}

// shrink item
function shrinkItem(item) {
  item.animate({
    height: item.parent().height() / item.parent().children('.item').length
  }, animateSpeedStretch);
  item.siblings().each(function (i, e) {
    $(e).animate({
      height: $(e).parent().height() / $(e).parent().children('.item').length
    }, animateSpeedStretch);
  });
}

function onForwardItemClick(item) {
  animating = true;

  stretchItem(item);

  window.setTimeout(function () {
    // display next half
    displayNextHalf(item.data('id'));
  }, animateSpeedStretch);

  item
    .addClass('item-red') // make item selected
    .children('.centermevertically') // toggle fwd/bck
    .children('h1')
    .toggleClass('fwd')
    .toggleClass('bck');
}

function onBackItemClick(item) {
  animating = true;

  displayPreviousHalf();

  window.setTimeout(function () {
    shrinkItem(item);
  }, animateSpeedStretch);

  // change text from nazaj to whatever it's supposed to be
  if (item.children('.centermevertically').children('h1').data('text')) {
    item
      .removeClass('stretched')
      .children('.centermevertically')
      .children('h1')
      .text(
        item
          .children('.centermevertically')
          .children('h1')
          .data('text')
      );
  }

  item
    .siblings()
    .removeClass('shrunk');

  item
    .removeClass('item-red') // previous selected remove red
    .children('.centermevertically') // toggle fwd/bck
    .children('h1')
    .toggleClass('fwd')
    .toggleClass('bck');
}

function goToNewCrumbs(newcrumbs) {
  if (breadcrumbs.length > newcrumbs.length) {
    var item = $('.cefizelj-container .half-left .item.stretched');
    breadcrumbs = newcrumbs;
    dontChangeCrumbs = true;
    onBackItemClick(item);
  } else if (breadcrumbs.length < newcrumbs.length) {
    var item = $('.cefizelj-container .half-right .item[data-id="' + newcrumbs[breadcrumbs.length] + '"]');
    breadcrumbs = newcrumbs;
    dontChangeCrumbs = true;
    onForwardItemClick(item);
  }
}

// ---
// RUN ON LOAD
// ---

$(document).ready(function () {
  // first, repaint
  repaintMe();

  // set onresize events
  window.onresize = function () {
    repaintMe();
  }

  // get tree and start app
  getTree(startApp);

  // setup events

  // set back item hover events
  $('.cefizelj-container').on({
    'mouseenter': function () {
      $(this)
        .children('.centermevertically')
        .children('h1')
        .text('Nazaj'); // set text to nazaj
    },
    'mouseleave': function () {
      $(this)
        .children('.centermevertically')
        .children('h1')
        .text(
          $(this)
            .children('.centermevertically')
            .children('h1')
            .data('text')
        );
    }
  }, '.item-red');

  // on clicking item
  $('.cefizelj-container').on('click', '.item', function () {
    // if not animating and not root
    if (!animating && !$(this).hasClass('noclick')) {
      if ($(this).parent().hasClass('half-right')) {
        // if it's the right-hand side
        onForwardItemClick($(this));
      } else if ($(this).parent().hasClass('half-left')) {
        // the click happened on the left-hand side
        onBackItemClick($(this));
      }
    }
  });

  // set event for mobile back
  $('.cefizelj-container').on('click', '.nazajcontainer', function () {
    var item = $(this).parents('.half').prev().children('.item-red');
    onBackItemClick(item);
  });

  $(window).on('popstate', function(event) {
    var newcrumbs = event.originalEvent.state || [];
    console.log('popstate', newcrumbs);
    if (animating) {
      // if we're animating push to queue
      animationQueue.push(newcrumbs);
    } else {
      goToNewCrumbs(newcrumbs);
    }
  });

  // if url has steps defined to to the correct one
  var path = window.location.pathname;
  if (path.indexOf('/korak/') !== -1) {
    var newcrumbs = path.slice(path.indexOf('/korak/') + '/korak/'.length)
      .split('/')
      .filter(function (part) {
        return part.length;
      });
    for (var i in newcrumbs) {
      animationQueue.push(newcrumbs.slice(0, Number(i) + 1));
    }
    animateSpeedMove = 0;
    animateSpeedStretch = 0;
    window.history.replaceState(newcrumbs, '', baseurl + 'korak/' + newcrumbs.join('/'));
  }
});
