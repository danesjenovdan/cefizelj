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

var itemHTML = ['<button class="item" data-id="{{ id }}">',
                  '<div class="item-content">',
                    '<h1 class="fwd" data-text="{{ itemcontent }}">{{ itemcontent }}</h1>',
                  '</div>',
                '</button>'].join('\n');

// ---
// FIRST PAINT
// ---

function getItemHeight(i, e) {
  const parentHeight = e.parentElement.getBoundingClientRect().height;
  const numItems = e.parentElement.querySelectorAll('.item').length;
  return parentHeight / numItems;
}

function setItemHeight(i, e) {
  e.style.height = `${getItemHeight(i, e)}px`;
}

function setStretchedItemHeight(i, e) {
  const parentHeight = e.parentElement.getBoundingClientRect().height;
  e.style.height = `${parentHeight}px`;
}

// set correct item heights
function repaintMe() {
  $('.cefizelj-container').height('100vh');
  $('.item').not('.stretched, .shrunk').each(setItemHeight);
  $('.stretched').each(setStretchedItemHeight);
}

// api tree getter
function getTree(callback) {
  $.get('./tree.json?v=${COMMIT_SHA}', function (r) {
    // console.log('getTree response', r);
    tree = r.tree;
    callback();
  });
}

// start the app
function startApp() {
  // set basenode and currentnode
  basenode = tree;
  currentnode = basenode;

  generateFirstNode();

  if (animationQueue.length) {
    goToNewCrumbs(animationQueue.shift());
  }
}

// generate first node
function generateFirstNode() {
  $('.cefizelj-container').html('<div class="half half-left"></div><div class="half half-right"></div>');
  $('.half-left').append(
    itemHTML
      .replace('{{ id }}', basenode._id)
      .replace(/{{ itemcontent }}/g, basenode.name)
      .replace(/"item"/g, '"item noclick"')
      .replace(' class=', ' tabindex="-1" class=')
  );
  if (basenode.image) {
    $('.half-left .fwd').addClass('has-img-root');
    $('.half-left .fwd').prepend('<img class="img-root" src="' + basenode.image + '?v=${COMMIT_SHA}" alt="">');
  }
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
    var newhash = breadcrumbs.length ? '#/korak/' + breadcrumbs.join('/') : '';
    window.history.pushState(breadcrumbs, '', baseurl + newhash);
    // console.log('pushState', breadcrumbs);
    try {
      var data_item = tree
      for (var i = 0; i < breadcrumbs.length; i++) {
        data_item = data_item.items.find(it => it._id == breadcrumbs[i])
      }
      plausible('clicked item', {
        props: {
          itemName: data_item.name,
        },
      });
    } catch (error) {}
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

    // prevent focus on all buttons not on screen
    $('.half:not(.half-left):not(.half-right) .item').attr('tabindex', '-1');
    $('.half-left .item:not(.shrunk):not(.noclick), .half-right .item:not(.shrunk):not(.noclick)').removeAttr('tabindex');

    // set back button text and classes
    $('.half-left .item.stretched')
      .children('.item-content')
      .children('h1')
      .removeClass('fwd')
      .addClass('bck')
      .text('Nazaj');
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
  $.get(url + '?v=${COMMIT_SHA}', function(r) {
    var result = '<div class="half half-rightr half-content"><div class="visible-xs nazajcontainer"><div class="nazaj bck">Nazaj</div></div>' + '<div class="contentcontainer" data-id="0">' + r + '</div></div>';
    $('.half-right').after(result);
    repaintRightr();
    moveLeft();
  });
}

// repaint rightr
function repaintRightr() {
  $('.half-rightr .item').each(setItemHeight);
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
    // cleanup
    $('.half-right').remove();

    $('.half-left')
      .removeClass('half-left')
      .addClass('half-right');

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

// stretch item to fill height
function stretchItem(item) {
  const e = item[0];
  const parentHeight = e.parentElement.getBoundingClientRect().height;
  item
    .animate({ height: parentHeight }, animateSpeedStretch, function() {
      $(this).addClass('stretched');
    });
  item
    .siblings()
    .animate({ height: 0 }, animateSpeedStretch, function() {
      $(this).addClass('shrunk').attr('tabindex', '-1').hide();
    });
}

// shrink item to proportional height of all items
function shrinkItemAndSiblings(item) {
  const itemHeight = getItemHeight(0, item[0]);
  item.parent().children('.item')
    .show()
    .animate({ height: itemHeight }, animateSpeedStretch, function() {
      $(this).removeClass('stretched shrunk').removeAttr('tabindex');
    });
}

function onForwardItemClick(item) {
  animating = true;

  stretchItem(item);

  window.setTimeout(function () {
    displayNextHalf(item.data('id'));
  }, animateSpeedStretch);

  item.addClass('item-selected');
}

function onBackItemClick(item) {
  animating = true;

  displayPreviousHalf();

  window.setTimeout(function () {
    shrinkItemAndSiblings(item);
  }, animateSpeedStretch);

  item.removeClass('item-selected');

  item.children('.item-content')
    .children('h1')
    .removeClass('bck')
    .addClass('fwd');

  // change text from nazaj to whatever it's supposed to be
  const dataText = item.children('.item-content').children('h1').data('text');
  if (dataText) {
    item.children('.item-content').children('h1').text(dataText);
  }
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
    var item = $(this).parents('.half').prev().children('.item-selected');
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
  var path = window.location.hash;
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
    window.history.replaceState(newcrumbs, '', baseurl + '#/korak/' + newcrumbs.join('/'));
  }
});
