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

var backText = 'Nazaj';

var itemHTML = `
  <div class="item centermycontentvertically" data-id="{{ id }}">
    <div class="centermevertically">
      <h1 class="fwd" data-text="{{ itemcontent }}">
        <span>{{ itemcontent }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.651 9.158" fill="currentColor">
          <path d="m7.976 9.158 6.675-4.556L7.976 0v1.118l4.428 3.054H0v.894h12.35L7.975 8.05Z"/>
        </svg>
      </h1>
    </div>
  </div>
`;

var helpHTML = `
  <div class="top-left-icons">
    <button type="button" class="circle-icon" data-help="{{ help }}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4.953 7.705" fill="currentColor" style="height: 45%;">
        <path fill="#154a95" d="M2.963 3.683c.318 0 .58-.116.789-.35.208-.232.312-.539.312-.92V2.35c0-.212-.037-.41-.111-.593a1.473 1.473 0 0 0-.312-.482 1.478 1.478 0 0 0-.487-.328 1.603 1.603 0 0 0-.635-.121c-.508 0-.907.155-1.196.465-.29.31-.434.72-.434 1.228v.444H0v-.508c0-.324.055-.635.164-.93.11-.297.27-.558.481-.784.212-.226.477-.406.794-.54A2.81 2.81 0 0 1 2.54 0c.354 0 .678.06.975.18.296.12.55.284.762.492.211.208.377.448.497.72.12.271.18.559.18.862v.19c0 .276-.048.539-.143.79a1.945 1.945 0 0 1-.995 1.09 1.71 1.71 0 0 1-.746.163h-.148c-.198 0-.296.106-.296.318v.783h-.847v-.995c0-.268.085-.487.254-.656a.888.888 0 0 1 .656-.254h.275m-1.492 3.28c0-.204.072-.378.217-.523a.714.714 0 0 1 .524-.217c.204 0 .379.072.524.217.144.145.217.32.217.524 0 .205-.073.38-.217.524a.714.714 0 0 1-.524.217.714.714 0 0 1-.524-.217.714.714 0 0 1-.217-.524Z"/>
      </svg>
    </button>
  </div>
`;

var modalHTML = `
  <div class="modal-bg">
    <div class="modal">
      <div class="modal-content">
        <div class="close-icon">
          <button type="button" class="circle-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5.461 7.408" fill="currentColor" style="height: 45%;">
              <path fill="#154a95" d="m.974 0 1.661 3.28h.19L4.488 0h.974L3.609 3.63v.127L5.46 7.408h-.974l-1.66-3.302h-.19L.973 7.408H0l1.852-3.651V3.63L0 0Z"/>
            </svg>
          </button>
        </div>
        <div class="article scrollable"></div>
      </div>
    </div>
  </div>
`;

var articleHTML = `
  <div class="half half-rightr half-content">
    <div class="top-left-icons">
      <div class="back-icon">
        <button type="button" class="circle-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.651 9.158" fill="currentColor" style="height: 33%; transform: scaleX(-1);">
            <path d="m7.976 9.158 6.675-4.556L7.976 0v1.118l4.428 3.054H0v.894h12.35L7.975 8.05Z"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="article scrollable" data-id="0">
    </div>
  </div>
`;

// ---
// FIRST PAINT
// ---

// set correct item heights
function updateItemHeights() {
  $('.item').not('.stretched, .shrunk').each(function (i, e) {
    $(e).height($(e).parent().height() / $(e).parent().children('.item').length);
  });

  $('.stretched').each(function (i, e) {
    $(e).height($(e).parent().height());
  });
}

// api tree getter
function getTree(callback) {
  $.get('./tree.json?v=${COMMIT_SHA}', function (r) {
    tree = r.tree;
    backText = r.backText;
    callback();
  });
}

// start the app
async function startApp() {
  // set basenode and currentnode
  basenode = tree;
  currentnode = basenode;

  await generateFirstNode();

  if (animationQueue.length) {
    goToNewCrumbs(animationQueue.shift());
  }
}

// generate first node
async function generateFirstNode() {
  $('.cefizelj-container').html('<div class="half half-left half-root"></div><div class="half half-right"></div>');

  const res = await fetch('pages/' + basenode.html + '?v=${COMMIT_SHA}')
  const html = await res.text()
  $('.half-left').append(itemHTML.replaceAll('{{ id }}', basenode._id));
  $('.half-left .item').addClass('noclick').removeClass('centermycontentvertically');
  $('.half-left .item .centermevertically').replaceWith(html);

  basenode.items.forEach(node => {
    $('.half-right').append(
      itemHTML
        .replaceAll('{{ id }}', node._id)
        .replaceAll('{{ itemcontent }}', node.name)
    );
    if (node.class) {
      $(`.half-right .item[data-id="${node._id}"]`).addClass(node.class);
    }
    if (node.help) {
      $(`.half-right .item[data-id="${node._id}"]`).append(helpHTML.replaceAll('{{ help }}', node.help));
    }
  });

  updateItemHeights();
}

// ---
// END OF FIRST PAINT
// ---

function animationFinished() {
  if (!dontChangeCrumbs) {
    var newhash = breadcrumbs.length ? '#/korak/' + breadcrumbs.join('/') : '';
    window.history.pushState(breadcrumbs, '', baseurl + newhash);
    try {
      var data_item = tree
      for (var i = 0; i < breadcrumbs.length; i++) {
        data_item = data_item.items.find(it => it._id == breadcrumbs[i])
      }
    } catch (error) {}
  }

  var selectedItem = $('.half-left .item.stretched h1').first();
  var title = selectedItem.data('text') || selectedItem.children('span').text();
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
    $('.half-right').after(createListHalf(targetnode.items, targetnode));
    updateItemHeights();
    moveLeft();
  } else {
    moveLeft();
  }
}

async function createUrlHalf(url) {
  const res = await fetch('pages/' + url + '?v=${COMMIT_SHA}')
  const html = await res.text()
  $('.half-right').after(articleHTML.trim());
  $('.half-rightr .article').html(html);
  repaintRightr();
  moveLeft();
}

// repaint rightr
function repaintRightr() {
  $('.half-rightr .item').each(function (i, e) {
    $(e).height($(e).parent().height() / $(e).parent().children('.item').length);
  });
}

// create list half
function createListHalf(items, parent) {
  var half = $('<div class="half half-rightr"></div>');

  items.forEach(node => {
    half.append(
      itemHTML
        .replaceAll('{{ id }}', node._id)
        .replaceAll('{{ itemcontent }}', node.name)
    );
    if (node.class) {
      half.find(`.item[data-id="${node._id}"]`).addClass(node.class);
    }
    if (node.help) {
      half.find(`.item[data-id="${node._id}"]`).append(helpHTML.replaceAll('{{ help }}', node.help));
    }
  });

  return half;
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
    .animate(
      { height: item.parent().height() },
      animateSpeedStretch,
    );
  item
    .siblings()
    .addClass('shrunk')
    .animate(
      { height: 0 },
      animateSpeedStretch,
    );
}

// shrink item
function shrinkItem(item) {
  item
    .animate(
      { height: item.parent().height() / item.parent().children('.item').length },
      animateSpeedStretch,
      function () {
        item.removeClass('stretched');
      },
    );
  item
    .siblings()
    .each(function (i, e) {
      $(e).animate(
        { height: $(e).parent().height() / $(e).parent().children('.item').length },
        animateSpeedStretch,
        function () {
          $(e).removeClass('shrunk');
        }
      );
    });
}

function onForwardItemClick(item) {
  animating = true;

  stretchItem(item);

  window.setTimeout(function () {
    item.siblings().addClass('hide-border');
    displayNextHalf(item.data('id'));
  }, animateSpeedStretch);

  window.setTimeout(function () {
    item.addClass('hide-border');
  }, animateSpeedStretch + animateSpeedMove);

  item
    .addClass('item-selected') // make item selected
    .children('.centermevertically') // toggle fwd/bck
    .children('h1')
    .toggleClass('fwd')
    .toggleClass('bck');
}

function onBackItemClick(item) {
  animating = true;

  item.removeClass('hide-border');
  displayPreviousHalf();

  window.setTimeout(function () {
    item.siblings().removeClass('hide-border');
    shrinkItem(item);
  }, animateSpeedMove);

  // change text from nazaj to whatever it's supposed to be
  if (item.children('.centermevertically').children('h1').data('text')) {
    item
      .children('.centermevertically')
      .children('h1')
      .children('span')
      .text(
        item
          .children('.centermevertically')
          .children('h1')
          .data('text')
      );
  }

  item
    .removeClass('item-selected') // previous selected remove
    .children('.centermevertically') // toggle fwd/bck
    .children('h1')
    .toggleClass('fwd')
    .toggleClass('bck');
}

function goToNewCrumbs(newcrumbs) {
  if (typeof newcrumbs === 'string') {
    openModal(newcrumbs);
    return;
  }

  closeModals();

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

async function openModal(modalName, path) {
  if (modalName === '#vec') {
    var isMobile = $(window).width() < 576;
    var moreWidth = isMobile ? $('.half-left').width() * 2 : $('.half-left').width();

    $('.show-more').addClass('active').attr('href', '#');

    $('.half-left').after('<div class="half half-left half-left-more"></div>');
    $('.half-left-more').width('0%');
    const res = await fetch('pages/' + basenode.more + '?v=${COMMIT_SHA}')
    const html = await res.text()
    $('.half-left-more').append(itemHTML.replaceAll('{{ id }}', basenode._id));
    $('.half-left-more .item').addClass('noclick hide-border').removeClass('centermycontentvertically');
    $('.half-left-more .item').width(moreWidth);
    $('.half-left-more .item .centermevertically').replaceWith(html);

    updateItemHeights();

    $('.half-left-more').animate(
      { width: moreWidth },
      animateSpeedMove,
      function () {
        $('.half-left-more').width('');
        $('.half-left-more .item').width('');
        $('.half-right .item').addClass('hide-border');
      },
    );

    if (isMobile) {
      $('.half-root').animate(
        { 'margin-left': '-50%' },
        animateSpeedMove,
      );
    }

    return;
  }

  if (modalName === 'help') {
    $('.cefizelj-overlay').append(modalHTML);
    const res = await fetch('pages/' + path + '?v=${COMMIT_SHA}')
    const html = await res.text()
    $('.modal .article').html(html);
  }
}

function closeModals() {
  $('.half-left-more .item').width($('.half-left-more').width());
  $('.half-right .item').removeClass('hide-border');
  $('.half-left-more').animate(
    { width: '0%' },
    animateSpeedMove,
    function () {
      $('.half-left-more').remove();
      $('.show-more').removeClass('active').attr('href', '#vec');
    },
  );
  $('.half-root').animate(
    { 'margin-left': breadcrumbs.length ? '-50%' : '0%' },
    animateSpeedMove,
  );

  $('.cefizelj-overlay .modal-bg').remove();
}

// ---
// RUN ON LOAD
// ---

$(document).ready(function () {
  // first, repaint
  updateItemHeights();

  // set onresize events
  window.onresize = function () {
    updateItemHeights();
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
        .children('span')
        .text(backText); // set text to nazaj
    },
    'mouseleave': function () {
      $(this)
        .children('.centermevertically')
        .children('h1')
        .children('span')
        .text(
          $(this)
            .children('.centermevertically')
            .children('h1')
            .data('text')
        );
    }
  }, '.item-selected');

  $('.cefizelj-container').on('click', '.item button[data-help]', function (event) {
    event.stopPropagation();

    var helphash = `help:${$(this).data('help')}`;
    var newhash = breadcrumbs.length ? '#/korak/' + breadcrumbs.join('/') : '';
    newhash += `${newhash ? ';' : '#'}${helphash}`;
    window.history.pushState(breadcrumbs, '', baseurl + newhash);

    openModal('help', $(this).data('help'));
  });

  $('.cefizelj-overlay').on('click', '.modal-bg', function (event) {
    if (event.target === this) {
      window.history.back();
    }
  });

  $('.cefizelj-overlay').on('click', '.modal .close-icon button', function (event) {
    window.history.back();
  });

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
  $('.cefizelj-container').on('click', '.half-content .back-icon', function () {
    var item = $(this).parents('.half').prev().children('.item-selected');
    onBackItemClick(item);
  });

  $(window).on('popstate', function(event) {
    var newcrumbs = event.originalEvent.state || [];
    if (newcrumbs.length === 0 && window.location.hash && window.location.hash[1] !== '/') {
      newcrumbs = window.location.hash;
    }
    if (animating) {
      // if we're animating push to queue
      animationQueue.push(newcrumbs);
    } else {
      goToNewCrumbs(newcrumbs);
    }
  });

  // if url has steps defined to to the correct one
  var path = window.location.hash.split(';')[0];
  var extrahash = window.location.hash.split(';')[1];
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
  } else if (path === '#vec') {
    animationQueue.push(path);
  } else if (path && path.startsWith('#help')) {
    window.history.replaceState([], '', baseurl);
  }
});
