function generateSocial() {

    $('.container').on('click', '.fb', function() {
        url = 'https://www.facebook.com/dialog/share?app_id=301375193309601&display=popup&href=' + encodeURIComponent(document.location.href) + '&redirect_uri=' + encodeURIComponent(document.location.href) + '&ref=responsive';
        window.open(url, '_blank');
        return false;
    });

    $('.container').on('click', '.tw', function () {

        url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Smernice za vse, ki ne morejo glasovati na običajen način.' + document.location.href);
        window.open(url, '_blank');
        return false;
    });

    $('.container').on('click', '.email', function() {
        url = 'mailto:?subject=Smernice za vse, ki ne morejo glasovati na običajen način.&body=' + document.location.href;
        window.open(url, '_blank');
        return false;
    });

}
