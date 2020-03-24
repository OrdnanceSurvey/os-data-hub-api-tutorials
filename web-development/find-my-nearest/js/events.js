

$('#select-location').on('click', function (e) {
    e.preventDefault();

    $(this).toggleClass('active');

    // 
    toggleClickCoordsListener();

})

$('#use-my-location').on('click', function (e) {
    e.preventDefault();

    setUseMyLocation();
});