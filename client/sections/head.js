Template.body.onRendered(function() {
  $('html').attr('itemscope','itemscope');
  $('html').attr('itemtype','http://schema.org/LocalBusiness');
  $('body').on('touchmove', function (e) {
    if (! $('.scrollable').has($(e.target)).length)
      e.preventDefault();
  });
});
