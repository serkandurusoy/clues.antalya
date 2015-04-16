Template.navbar.events({
  'click [data-target]': function (e, t) {
    var $target = $(e.target.getAttribute('data-target'));
    var pos = parseInt($target.offset().top) - parseInt($('.navbar').height()) - 16;
    if ($(t.$('ul').hasClass('overlay'))) {
      Session.set('menuStatus', 'menuClosed');
    }
    $('html,body').animate({
      scrollTop: pos
    }, 1000);
  }
});

Template.menu.onRendered(function () {
  var setUpMenu = function () {
    if (window.matchMedia('(max-width: 35em)').matches) {
      Session.set('menuType', 'overlay');
    } else {
      Session.set('menuType', 'horizontal');
    }
    Session.set('menuStatus', 'menuClosed')
  };
  $(window).resize(function () {
    setUpMenu();
  });
  Meteor.setTimeout(setUpMenu, 0);
  Session.set('menuSetUp',true);
});

Template.menu.helpers({
  menuType: function () {
    return Session.get('menuType');
  },
  menuStatus: function () {
    return Session.get('menuStatus');
  },
  menuSetUp: function () {
    return Session.get('menuSetUp');
  }
});

Template.burger.events({
  'click': function (e, t) {
    if (Session.equals('menuStatus', 'menuOpen')) {
      Session.set('menuStatus', 'menuClosed');
    } else {
      Session.set('menuStatus', 'menuOpen');
    }
  }
});

