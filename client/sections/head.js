Template.body.onRendered(function() {
  $('html').attr('itemscope','itemscope');
  $('html').attr('itemtype','http://schema.org/LocalBusiness');
  //TODO: Check if this is a performance problem on mobile scroll
  $('body').on('touchmove', function (e) {
    if (! $('.scrollable').has($(e.target)).length)
      e.preventDefault();
  });
});
