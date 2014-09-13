function generateFirstNode() {
    for (var node in basenode['items']) {
        $('.half-right').append('<div class="item centermycontentvertically" data-id="' + node + '"><div class="centermevertically"><h1 class="fwd">' + basenode['items'][node]['name'] + '</h1></div></div>');
    }
    
    repaintMe();
}

function getNextNode(child) {
    return currentnode[child];
}

function renderNext(targetnode) {
    
    if (currentnode['type'] === 'menu') {
    
        var items = targetnode['items']
        
        // render list
        $('.half-right').after(createListHalf('<div class="half half-rightr">', items));
    } else {
        
        // rendercontent
        alert('content');
//        $('.half-right').after(createContentHalf('<div class=half half-rightr">', target['content']));
        
        
        
    }
    
    repaintMe();
}

function renderNow(targetnode) {
    
    if (targetnode['type'] === 'menu') {
    
        var items = targetnode['items']
        
        // render list
        $('.half-left').after(createListHalf('<div class="half half-right">', items));
    } else {
        
        // rendercontent
        alert('content');
//        $('.half-right').after(createContentHalf('<div class=half half-rightr">', target['content']));
        
        
        
    }
    
    repaintMe();
}

function createListHalf(firstdiv, items) {
    var result = firstdiv;
    
    $.each(items, function(i, e) {
        result = result + itemHTML.replace('{{ itemcontent }}', e['name']).replace('{{ id }}', i).replace('{{ itemsubtitle }}', ''); // add subtitle
    });
    
    result = result + '</div>';
    
    return result;
}

function displayNextHalfAPI(target) {
    
    breadcrumbs[breadcrumbs.length] = target;
    
    renderNext(currentnode['items'][target]);
    
    currentnode = currentnode['items'][target];
    
    moveLeftStupid();
    
    repaintMe();
}

function switchContentAPI(target) {
    $('.half-right').remove();
    
    currentnode = basenode;
    breadcrumbs.splice(breadcrumbs.length - 1, 1);
    for (var breadcrumb in breadcrumbs) {
        currentnode = currentnode['items'][breadcrumbs[breadcrumb]];
    }
    
    breadcrumbs[breadcrumbs.length] = target;
    
    renderNow(currentnode['items'][target]);
    
    currentnode = currentnode['items'][target];
    
    repaintMe();
    
    animating = false;
    
}