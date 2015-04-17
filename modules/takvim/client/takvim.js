Template.scrollerInner.events({
  'click .goleft': function() {
    if (window.matchMedia('(max-width: 35em)').matches) {
      $('.takvimwrapper').animate({
        scrollLeft: '-=160'
      }, 300);
    } else if (window.matchMedia('(max-width: 64em)').matches) {
      $('.takvimwrapper').animate({
        scrollLeft: '-=320'
      }, 300);
    } else {
      $('.takvimwrapper').animate({
        scrollLeft: '-=480'
      }, 300);
    }
  },
  'click .goright': function() {
    if (window.matchMedia('(max-width: 35em)').matches) {
      $('.takvimwrapper').animate({
        scrollLeft: '+=160'
      }, 300);
    } else if (window.matchMedia('(max-width: 64em)').matches) {
      $('.takvimwrapper').animate({
        scrollLeft: '+=320'
      }, 300);
    } else {
      $('.takvimwrapper').animate({
        scrollLeft: '+=480'
      }, 300);
    }
  }
});

Meteor.startup(function () {
  var getServerTime = function () {
    Meteor.call("serverTime", function (error, result) {
      if (error) {
        Session.set('serverTime', Date.now());
      }
      Session.set("serverTime", result);
    });
  };
  getServerTime();
  setInterval(getServerTime, 5*60*1000);
});

Template.takvim.helpers({
  waitingForServerTime: function() {
    return Session.equals('serverTime', undefined);
  },
  gunler: function() {
    var gunler = [];
    var dilimler = [ {saat:'09:30'}, {saat:'11:00'}, {saat:'12:30'}, {saat:'14:00'}, {saat:'15:30'}, {saat:'17:00'}, {saat:'18:30'}, {saat:'20:00'}, {saat:'21:30'}, {saat:'23:00'}, {saat:'00:30'} ];
    var today = moment(new Date(Session.get('serverTime')));
    for (var g=0; g<30; g++) {
      var tarih = today;
      var guntipi = _.contains(['0','6'],tarih.format('d')) ? 'haftasonu' : 'haftaici';

      var display = '';
      switch(g) {
        case 0:
          display = 'Bugün'+'<span class="smaller">'+tarih.format('dddd')+'</span>';
          break;
        case 1:
          display = 'Yarın'+'<span class="smaller">'+tarih.format('dddd')+'</span>';
          break;
        default:
          display = guntipi === 'haftaici' ? tarih.format('D MMM') : tarih.format('D MMM')+'<span class="smaller">'+tarih.format('dddd')+'</span>';
      }
      gunler.push({tarih: tarih.format('YYYY-MM-DD'), guntipi: guntipi, display: display, dilimler: dilimler});
      today.add(1,'days');
    }
    return gunler;
  }
});

Template.takvimDilim.helpers({
  content: function() {
    var simdi = moment(new Date(Session.get('serverTime')));

    if (Template.parentData(1).tarih === simdi.format('YYYY-MM-DD') && Template.currentData().saat !== '00:30' && Template.currentData().saat <= simdi.format('HH:mm')) {
      return '';
    } else if (Rezervasyon.findOne({tarih: Template.parentData(1).tarih, saat: Template.currentData().saat, durum:'dolu'})) {
      return 'Dolu';
    } else if (Rezervasyon.findOne({tarih: Template.parentData(1).tarih, saat: Template.currentData().saat, durum:'tadilat'})) {
      return '';
    } else {
      return Template.currentData().saat;
    }

  },
  durum: function() {
    var simdi = moment(new Date(Session.get('serverTime')));

    if (Template.parentData(1).tarih === simdi.format('YYYY-MM-DD') && Template.currentData().saat !== '00:30' && Template.currentData().saat <= simdi.format('HH:mm')) {
      return 'gecmis';
    } else if (Rezervasyon.findOne({tarih: Template.parentData(1).tarih, saat: Template.currentData().saat, durum:'tadilat'})) {
      return 'gecmis';
    } else if (Rezervasyon.findOne({tarih: Template.parentData(1).tarih, saat: Template.currentData().saat, durum:'dolu'})) {
      return 'dolu';
    } else if (Template.currentData().saat !== '00:30' && Rezervasyon.findOne({tarih: Template.parentData(1).tarih, saat: Template.currentData().saat, durum:'kampanyali'})) {
      return 'kampanyali';
    } else {
      return Template.currentData().saat === '00:30' ? 'gece' : 'bos';
    }

  },
  kendiRez: function() {
    var kendiRez = Session.get('kendiRez') && Session.get('kendiRez').slice(0);
    return kendiRez && _.findWhere(kendiRez, {tarih: Template.parentData(1).tarih, saat: Template.currentData().saat}) ? 'evet' : false;
  },
  attrs: function(durum, kendiRez) {
    var attrs = {};
    if (kendiRez === 'evet') {
      attrs = {title: 'Bu seans için az önce sen rezervasyon yaptın. Değişiklik yapmak istersen lütfen telefon et.'};
    } else {
      switch(durum) {
        case 'bos':
          attrs = {title: 'Bu seans için rezervasyon yapabilirsin. Bilgilerini kaydetmek için lütfen tıkla.'};
          break;
        case 'kampanyali':
          attrs = {title: 'Bu seansta indirimli özel fiyat uygulanmaktadır. Rezervasyon yapmak için tıkla.'};
          break;
        case 'gece':
          attrs = {title: 'Bu seans için sadece telefonla rezervasyon kabul edilmektedir.'};
          break;
        case 'gecmis':
          attrs = {title: 'Bu seans için rezervasyon kabul edemiyoruz.'};
          break;
        case 'dolu':
          attrs = {title: 'Bu seans rezerve edilmiştir. Yedeğini beklemek istersen lütfen telefon et.'};
          break;
        default:
          attrs = null;
      }
    }
    return attrs;
  }
});


Template.takvimDilim.events({
  'click .bos, click .kampanyali': function(e,t) {
    e.stopPropagation();
    Session.set('seciliDilim', {
      tarih: t.$(e.target).parent().attr('data-tarih'),
      saat: t.$(e.target).attr('data-saat')
    });
  }
});

Template.home.helpers({
  rezTriggered: function() {
    return Session.get('seciliDilim');
  }
});
