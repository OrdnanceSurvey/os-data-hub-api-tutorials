

$('#select-location').on('click', function (e) {
    e.preventDefault();

    $(this).toggleClass('active');

    // 
    toggleClickCoordsListener();

})