var setUpAside = function() {
  if (window.matchMedia('(min-width: 35em)').matches) {
    $('#kurallar .dileksecond').remove();
    $('#kurallar aside').height($('#kurallar main').height());
  } else {
    $('#kurallar aside').height($('#daktilo').height() + 10);
    $('#kurallar .dileksecond').remove();
    $('#kurallar').append('<div class="dilek dileksecond">Keyifli <br>oyunlar;</div>');
  }
};

Template.dilek.onRendered(function() {
  $(window).resize(function () {
    setUpAside();
  });
  Meteor.setTimeout(setUpAside,0);
});
