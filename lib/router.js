Router.configure({
  loadingTemplate: 'loading',
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound'
});

Router.route('/', {
  name: 'home',
  template: 'home',
  onBeforeAction: function() {
    if (Meteor.userId()) {
      Meteor.logout();
    }
    GoogleMaps.load({key: 'AIzaSyBGs81PLM95poS_IBbwFhR6i2BTDihwQFg', language: 'tr'});
    ga('send', 'event', 'page', 'load');
    this.next();
  },
  waitOn: function() {
    return [
      Meteor.subscribe('takvimdata'),
      Meteor.subscribe('fiyatdata'),
      Meteor.subscribe('adminipdata'),
      Meteor.subscribe('parametredata')
    ];
  },
  action: function() {
    this.render();
  },
  trackPageView: function() {
    var ip;
    headers.ready(function() {
      ip = headers.get('x-forwarded-for');
    });
    return !AdminIp.findOne({ip: ip});
  }
});

Router.route('/rezervasyonlar', {
  name: 'rezervasyonlar',
  template: 'rezervasyonlar',
  trackPageView: false,
  onBeforeAction: function() {
    if (! Meteor.user()) {
      if (Meteor.loggingIn()) {
        this.render(this.loadingTemplate);
      } else {
        this.render('login');
      }
    } else {
      this.next();
    }
  },
  waitOn: function() {
    if (Meteor.user()) {
      return [
        Meteor.subscribe('takvimdataFull'),
        Meteor.subscribe('musterilerdata'),
        Meteor.subscribe('fiyatdata'),
        Meteor.subscribe('adminipdata'),
        Meteor.subscribe('parametredata')
      ];
    }
  },
  action: function() {
    this.render();
  }
});


var requireModernBrowser = function() {
  var browser = BrowserDetect.browser.toLowerCase(),
      version  = parseInt(BrowserDetect.version)
    ;
  if (browser === 'explorer' && version < 10) {
    window.location.replace('http://outdatedbrowser.com/en');
    this.next();
  } else {
    this.next();
  }
}

Router.onBeforeAction(requireModernBrowser);

Router.plugin('dataNotFound', {notFoundTemplate: 'notFound'});
