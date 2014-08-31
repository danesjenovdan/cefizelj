$.fn.animateRotate = function(angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(function(i, e) {
        args.step = function(now) {
            $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(this, arguments);
        };

        $({deg: 0}).animate({deg: angle}, args);
    });
};

var contentHTML = [ '<div class="half half-rightr">',
                        '<div class="htmlcontainer">',
                            '<div class="visible-xs centermycontentvertically nazajcontainer"><div class="centermevertically nazaj bck">Nazaj</div></div>',
                            '<p>Vse kaže, da je CIVILNA INICIATIVA tista oblika delovanja, ki je za vas najbolj primerna.</p>',
                            '<h3>Kako točno pa funkcionira?</h3>',
                            '<div class="tabs">',
                                '<div class="tab tab-prednosti open">prednosti</div>',
                                '<div class="tab tab-slabosti">slabosti</div>',
                            '</div>',
                            '<div class="content">',
                                '<div class="prednosti open">',
                                    '<form class="ac-custom" autocomplete="off">',
                                        '<ul>',
                                            '<li><input id="list1" name="list1" type="checkbox"><label for="list1"><span>Prva prednost</span></label></li>',
                                            '<li><input id="list2" name="list2" type="checkbox"><label for="list2"><span>Monotonically engage market-driasdfsadfven capital</span></label></li>',
                                            '<li><input id="list10" name="list10" type="checkbox"><label for="list10"><span>Prva prednost</span></label></li>',
                                            '<li><input id="list20" name="list20" type="checkbox"><label for="list20"><span>Monotonically engage market-driasdfsadfven capital</span></label></li>',
                                        '</ul>',
                                    '</form>',
                                '</div>',
                                '<div class="slabosti">',
                                    '<form class="ac-custom" autocomplete="off">',
                                        '<ul>',
                                            '<li><input id="list3" name="list3" type="checkbox"><label for="list3"><span>Quickly incentivize impactful actioasdsadasdns</span></label></li>',
                                            '<li><input id="list4" name="list4" type="checkbox"><label for="list4"><span>Monotonically engage market-driven capital</span></label></li>',
                                            '<li><input id="list30" name="list30" type="checkbox"><label for="list30"><span>Quickly incentivize impactful actioasdsadasdns</span></label></li>',
                                            '<li><input id="list40" name="list40" type="checkbox"><label for="list40"><span>Monotonically engage market-driven capital</span></label></li>',
                                            '<li><input id="list31" name="list31" type="checkbox"><label for="list31"><span>Quickly incentivize impactful actioasdsadasdns</span></label></li>',
                                            '<li><input id="list41" name="list41" type="checkbox"><label for="list41"><span>Monotonically engage market-driven capital</span></label></li>',
                                        '</ul>',
                                    '</form>',
                                '</div>',
                            '</div>',
                            '<h3 class="nasveti">Nasveti za zagon</h3>',
                            '<form class="ac-custom ac-list" autocomplete="off">',
                                '<ul>',
                                    '<li><input id="list6" name="list6" type="checkbox"><label for="list6"><span>Preberi me in klikni name</span><svg viewBox="0 0 300 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"></svg></label></li>',
                                    '<li><input id="list5" name="list5" type="checkbox"><label for="list5"><span>Quickly incentivize impactful actions</span><svg viewBox="0 0 300 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"></svg></label></li>',
                                    '<li><input id="list7" name="list7" type="checkbox"><label for="list7"><span>Quickly incentivize impactful actions</span><svg viewBox="0 0 300 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"></svg></label></li>',
                                    '<li><input id="list8" name="list8" type="checkbox"><label for="list8"><span>Monotonically engage market-driven capital</span><svg viewBox="0 0 300 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"></svg></label></li>',
                                '</ul>',
                            '</form>',
                        '</div>',
                    '</div>'].join('\n');

var itemHTML = ['<div class="item centermycontentvertically" data-id="{{ id }}">',
                    '<div class="centermevertically">',
                        '<h1 class="fwd">{{ itemcontent }}</h1>',
                        '<h2 class="subtitle">{{ itemsubtitle }}</h2>',
                    '</div>',
                '</div>'].join('\n');

var animating = false;

function repaintMe() {
    
    $('.container').width($(window).width()).height($(window).height());
    
    $('.item').each(function(i, e) {
        $(e).height($(e).parent().height() / $(e).parent().children('.item').length);
    });    
}

function moveLeftStupid() {
    $('.half-left').animate({
        'margin-left': '-=50%'
    }, 500);
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
}

function moveRightContent() {
    
    // right half animate
    $('.half-right').animate({
        'margin-left': '0%',
        'width': '50%'
    }, 500);
    
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

$(document).ready(function() {
    
    repaintMe();
    
    window.onresize = function() {
        repaintMe();
    }
    
    $('#confirmcookies').on('click', function() {
        $('.cookiewarning').animateRotate(-720, 600);//, function() {
        $('.cookiewarning').animate({
            'top': -150,
            'left': -150,
        }, 600);
        //});
    });
    
    // set event for mobile back
    $('.container').on('click', '.nazajcontainer', function() {
        moveRightContent();
        $(this).parents('.half').prev().children('.item-red').removeClass('item-red').children('.centermevertically').children('h1').toggleClass('fwd').toggleClass('bck');
    });
    
    // set item events
    $('.container').on('click', '.item', function() {
        if (!animating) {
            animating = true;
            if ($(this).parent().hasClass('half-right')) {
                
                $(this).addClass('item-red');
//                if (Math.random() > 0.66) {
//                    moveLeftContent(contentHTML);
//                } else {
//                    moveLeft([{'id': 1, 'content': 'asd'}, {'id': 2, 'content': 'asdasd'}, {'id': 3, 'content': 'nomore asd'}]);
//                }
                getRenderNextHalfLocal($(this).data('id'));

            } else if ($(this).parent().hasClass('half-left')) {
                if ($(this).children('.centermevertically').children('h1').hasClass('bck')) {

                    $(this).children('h1').toggleClass('fwd').toggleClass('bck');
                    $(this).children('.centermevertically').children('h1').text($(this).children('.centermevertically').children('h1').data('text'));
                    $(this).removeClass('item-red');
                    moveRight();
                } else {
                    $(this).siblings('.item-red').removeClass('item-red');
                    $(this).addClass('item-red');
                    switchContent($(this).data('id'));
                    $(this).siblings().children('.centermevertically').children('h1.bck').toggleClass('fwd').toggleClass('bck');
                }
            }

            $(this).children('.centermevertically').children('h1').toggleClass('fwd').toggleClass('bck');
        }
    });
    
    // set item-red hover events
    $('.container').on({
        'mouseenter': function() {
            $(this).children('.centermevertically').children('h1').data('text', $(this).children('.centermevertically').children('h1').text()).text('nazaj');
        }, 
        'mouseleave': function() {
            $(this).children('.centermevertically').children('h1').text($(this).children('.centermevertically').children('h1').data('text'));
        }
    }, '.item-red');
    
    // set tab events
    $('.container').on('click', '.tab', function() {
        if (!$(this).hasClass('open')) {
            $(this).siblings().toggleClass('open');
            $(this).toggleClass('open');
            
            $(this).parent().next().children('div').toggleClass('open');
        }
    });
    
    // confirm cookies
    $('#confirmcookies').on('click', function() {
        updateConsent();
    });
    
    // get cookie info
    $('#getinfoaboutcookies').on('click', function() {
        window.open('http://danesjenovdan.si/piskotki/'); // TODO
    });
    
});