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

Template.takvim.helpers({
  gun: function() {
    var gun = [];
    for (var g=0; g<30; g++) {
      var dilimler = [
        {saat:'09:30', durum:'bos', attrs: {}},
        {saat:'11:00', durum:'bos', attrs: {}},
        {saat:'12:30', durum:'bos', attrs: {}},
        {saat:'14:00', durum:'bos', attrs: {}},
        {saat:'15:30', durum:'bos', attrs: {}},
        {saat:'17:00', durum:'bos', attrs: {}},
        {saat:'18:30', durum:'bos', attrs: {}},
        {saat:'20:00', durum:'bos', attrs: {}},
        {saat:'21:30', durum:'bos', attrs: {}},
        {saat:'23:00', durum:'bos', attrs: {}},
        {saat:'00:30', durum:'gece', attrs: {}}
      ];

      var today = moment(new Date(TimeSync.serverTime(null,60*1000)));

      var simdi = today.format('HH:mm');

      var tarih = today.add(g,'days').format('YYYY-MM-DD');

      var DoW = parseInt(moment(tarih,'YYYY-MM-DD').format('d'));

      var guntipi = DoW === 0 || DoW === 6 ? 'haftasonu' : 'haftaici';

      var display = '';

      var rezervasyonIsle = function(tarih,dilim) {
        Rezervasyon.find({tarih: tarih, durum: 'kampanyali'}).forEach(function(rez) {
          if (rez.saat === dilim.saat && dilim.saat !== '00:30') {
            dilim.durum = 'kampanyali';
          }
        });
        Rezervasyon.find({tarih: tarih, durum: 'dolu'}).forEach(function(rez) {
          if (rez.saat === dilim.saat) {
            dilim.saat = 'Dolu';
            dilim.durum = 'dolu';
          }
        });
        Rezervasyon.find({tarih: tarih, durum: 'tadilat'}).forEach(function(rez) {
          if (rez.saat === dilim.saat) {
            dilim.saat = '';
            dilim.durum = 'gecmis';
          }
        });
      };

      if (Session.get('kendiRez')) {
        _.map(dilimler, function(dilim) {
          _.each(Session.get('kendiRez'), function(kendiRez) {
            if (kendiRez.tarih === tarih && kendiRez.saat === dilim.saat) {
              dilim.kendiRez = 'evet';
            }
          });
        });
      }

      if (g === 0) {
        _.map(dilimler, function(dilim) {
          if (dilim.saat !== '00:30' && dilim.saat <= simdi) {
            dilim.saat = '';
            dilim.durum = 'gecmis';
          }
          return dilim;
        });
      }

      _.map(dilimler, function(dilim) {
        rezervasyonIsle(tarih,dilim);
      });

      _.map(dilimler, function(dilim) {
        switch(dilim.durum) {
          case 'gece':
            dilim.attrs = {title: 'Bu seans için sadece telefonla rezervasyon kabul edilmektedir.'};
            break;
          case 'dolu':
            dilim.attrs = {title: 'Bu seans rezerve edilmiştir. Yedeğini beklemek isterseniz lütfen telefon ediniz.'};
            break;
          case 'kampanyali':
            dilim.attrs = {title: 'Bu seansta indirimli özel fiyat uygulanmaktadır. Rezervasyon yapmak için tıklayın.'};
            break;
          default:
            dilim.attrs = {title: 'Bu seans için rezervasyon yapabilirsiniz. Bilgilerinizi kaydetmek için lütfen tıklayın.'};
        }
        return dilim;
      });


      switch(g) {
        case 0:
          display = 'Bugün'+'<span class="smaller">'+moment(tarih,'YYYY-MM-DD').format('dddd')+'</span>';
          break;
        case 1:
          display = 'Yarın'+'<span class="smaller">'+moment(tarih,'YYYY-MM-DD').format('dddd')+'</span>';
          break;
        default:
          display = guntipi === 'haftaici' ? moment(tarih,'YYYY-MM-DD').format('D MMM') : moment(tarih,'YYYY-MM-DD').format('D MMM')+'<span class="smaller">'+moment(tarih,'YYYY-MM-DD').format('dddd')+'</span>';
      }

      gun.push({tarih: tarih, guntipi: guntipi, display: display, dilim: dilimler});
    }
    return gun;
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
