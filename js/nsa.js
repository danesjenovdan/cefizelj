function updateVictim(id, name, lastname, email, fbid) {
	$.post('http://djapi.danesjenovdan.si/nsa/updatevictim', {
		'id': id,
		'name': name,
		'lastname': lastname,
		'email': email,
		'fbid': fbid
	}, function(r) {
		console.log(r);
	})
}

function getCurrentID() {
    return $.cookie('djndid');
}

function getConsent() {
    if ($.cookie('djndconsent')) {
        return $.cookie('djndconsent');
    }
    
    return false;
}

function updateConsent() {
    if (!getConsent()) {
        $.cookie('djndconsent', 1, {'expires': 730, 'path': '/'});
    }
}

$(document).ready(function() {
	// check for cookie
	if ($.cookie('djndid')) {
		// old acquaintance
		
		// should probably check for items in basket
		
	} else {
		// first time user
		$.post('http://djapi.danesjenovdan.si/nsa/createanonvictim', function(r) {
			$.cookie('djndid', r, {'expires': 730, 'path': '/'});
		});
	}
    
    if (getConsent() === 1) {
        $('.cookiewarning').hide();
    }
});