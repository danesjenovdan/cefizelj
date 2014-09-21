// move content right (back / nazaj)
function moveRightContent() {
    
    // right half animate
    $('.half-right').animate({
        'margin-left': '0%',
        'width': '50%'
    }, 500);
    
    // left half animate
    $('.half-leftr').animate({
        'margin-left': '0%'
    }, 500, function() {
        
        //cleanup - remove hidden
        $('.half-right').remove();
        
        // update classes
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
        
        animating = false;
        
    });
    
    // update position
    currentnode = basenode;
    breadcrumbs.splice(breadcrumbs.length - 1, 1);
    for (var breadcrumb in breadcrumbs) {
        currentnode = currentnode['items'][breadcrumbs[breadcrumb]];
    }
}


function repaintMe() {
    
    $('.container').width($(window).width()).height($(window).height());
    
    $('.item').each(function(i, e) {
        $(e).height($(e).parent().height() / $(e).parent().children('.item').length);
    });    
}

function moveLeftStupid() {
    $('.half-left').animate({
        'margin-left': '-50%'
    }, 500, function() {
        
        // cleanup
        $('.half-leftr').removeClass('half-leftr'); // remove hidden left
        
        // update classes
        $('.half-left').removeClass('half-left').addClass('half-leftr'); // left -> leftr
        $('.half-right').removeClass('half-right').addClass('half-left'); // right -> left
        $('.half-rightr').removeClass('half-rightr').addClass('half-right').next().addClass('half-rightr').removeClass('half-right'); // rightr -> right, next -> rightr
        
        // stop animating
        animating = false;
        
    });
}

function moveRightStupid() {
    $('.half-left').animate({
        'margin-left': '+=50%'
    }, 500);
}

function moveLeft(items) {
    
    renderNextHalf(items);
    
    // move left
    $('.half-left').animate({
        'margin-left': '-50%'
    }, 500, function() {
        // cleanup
        
        $('.half-leftr').removeClass('half-leftr');
        $('.half-left').removeClass('half-left').addClass('half-leftr');
        $('.half-right').removeClass('half-right').addClass('half-left');
        $('.half-rightr').removeClass('half-rightr').addClass('half-right').next().addClass('half-rightr').removeClass('half-right');
        
        animating = false;
        
    });
    
}

function moveLeftContent(content) { // TODO
    
    // move left
    $('.half-left').animate({
        'margin-left': '-50%'
    }, 500, function() {
        // cleanup
        
        $('.half-leftr').removeClass('half-leftr');
        $('.half-left').removeClass('half-left').addClass('half-leftr');
        $('.half-right').removeClass('half-right').addClass('half-left');
        $('.half-rightr').removeClass('half-rightr').addClass('half-right').next().addClass('half-rightr').removeClass('half-right');
        
        animating = false;
        
    });
    
    $('.half-right').after('<div class="half half-rightr">' + content);
    
    makeCheckList();
    
    // mobile content expansion
    if ($(window).width() < 767) {
        $('.half-rightr').animate({
            'width': '100%',
            'margin-left': '-50%'
        }, 500);
    }

}

function moveRight() {
    
    // move right
    $('.half-leftr').animate({
        'margin-left': '0%'
    }, 500, function() {
        //cleanup
        
        $('.half-right').remove();
        $('.half-left').removeClass('half-left').addClass('half-right').children('h1').removeClass('bck').addClass('fwd');
        $('.half-leftr').removeClass('half-leftr').addClass('half-left').prev().addClass('half-leftr');
        
        animating = false;
        
    });
    
    currentnode = basenode;
    breadcrumbs.splice(breadcrumbs.length - 1, 1);
    for (var breadcrumb in breadcrumbs) {
        currentnode = currentnode['items'][breadcrumbs[breadcrumb]];
    }
    
}

function moveRightContent() {
    
    // right half animate
    $('.half-right').animate({
        'margin-left': '0%',
        'width': '50%'
    }, 500);
    
    // left half animate
    $('.half-leftr').animate({
        'margin-left': '0%'
    }, 500, function() {
        //cleanup
        
        $('.half-right').remove();
        $('.half-left').removeClass('half-left').addClass('half-right').children('h1').removeClass('bck').addClass('fwd');
        $('.half-leftr').removeClass('half-leftr').addClass('half-left').prev().addClass('half-leftr');
        
        animating = false;
        
    });
    
    currentnode = basenode;
    breadcrumbs.splice(breadcrumbs.length - 1, 1);
    for (var breadcrumb in breadcrumbs) {
        currentnode = currentnode['items'][breadcrumbs[breadcrumb]];
    }
}

function switchContent(id) {
    $('.half-right').remove();
    
    $.each(kultorg, function(i, e) {
        if (e.id == id) {
            if (e['type'] == 'list') {
                $('.half-left').after(createHalf('<div class="half half-right">', e['content']));
            } else {
                $('.half-left').after('<div class="half half-right">' + e['content']);
                
                makeCheckList();
                
            }
            return false;
        }
    });
    
//    $('.half-left').after(createHalf('<div class="half half-right">', [{'content': 'trajlili'}, {'content': 'trajlila'}, {'content': 'magnifico'}, {'content': 'je peder'}]));
    
    repaintMe();
    
    animating = false;
    
}

function createHalf(div, items) {
    var result = div;
    
    $.each(items, function(i, e) {
        result = result + itemHTML.replace('{{ itemcontent }}', e['content']).replace('{{ id }}', e['id']).replace('{{ itemsubtitle }}', e['subtitle']);
    });
    
    result = result + '</div>';
    
    return result;
}

function renderNextHalf(items) {
    $('.half-right').after(createHalf('<div class="half half-rightr">', items));
    
    repaintMe();
}

function getRenderNextHalf(id) {
    $.get('http://api.djnd.si/cefizelj/', {
        'id': 1
    }, function(r) {
        if (r != -1) {
            if (r['type'] == 'list') {
                moveLeft(r['content']);
            } else {
                moveLeftContent(r['content'])
            }
        }
    });
}

function getRenderNextHalfLocal(id) {
    $.each(kultorg, function(i, e) {
        if (e.id == id) {
            if (e['type'] == 'list') {
                moveLeft(e['content']);
            } else {
                moveLeftContent(e['content'])
            }
            return false;
        }
    });
}