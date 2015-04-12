Template.navbar.events({
  'click [data-target]': function (e, t) {
    var id = e.target.getAttribute('data-target');
    var $target = $(id);
    var pos = parseInt($target.offset().top) - parseInt($('.navbar').height()) - 16;
    if ($(t.$('ul').hasClass('overlay'))) {
      Session.set('menuStatus', 'menuClosed');
    }
    $('html,body').animate({
      scrollTop: pos
    }, 1000);
    ga('send', 'event', id.substr(1), 'click');
  }
});

Template.navbar.onRendered(function () {
  var setupWaypoints = function () {
    $('section').each(function () {
      var waypoints = [];
      var id = this.id;
      waypoints[id] = new Waypoint({
        element: document.getElementById(id),
        handler: function (direction) {
          ga('send', 'event', id, 'scroll');
        },
        offset: 'bottom-in-view'
      });
    });
  };

  $(window).resize(function () {
    setupWaypoints();
  });

  Meteor.setTimeout(setupWaypoints, 0);
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
});

Template.menu.helpers({
  menuType: function () {
    return Session.get('menuType');
  },
  menuStatus: function () {
    return Session.get('menuStatus');
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

