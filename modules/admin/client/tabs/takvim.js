Template.tabTakvimForm.onCreated(function() {
  this.error = new ReactiveVar(false);
});

Template.tabTakvimForm.helpers({
  tarihler: function() {
    var tarihler = [];
    for (var g=0; g<90; g++) {
      var tarih = moment(new Date(TimeSync.serverTime(null,5*60*1000))).subtract(1,'days').add(g,'days');
      tarihler.push({
        value: tarih.format('YYYY-MM-DD'),
        display: tarih.format('DD MMM ddd')
      });
    }
    return tarihler;
  },
  saatler: function() {
    return ['09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00','21:30','23:00','00:30'];
  },
  error: function() {
    return Template.instance().error.get();
  }
});

Template.tabTakvimForm.events({
  'submit form': function(e,t) {
    e.preventDefault();

    var durum  = t.find('select[name="fdurum"]').value,
        tarih  = t.find('select[name="ftarih"]').value,
        saat   = t.find('select[name="fsaat"]').value,
        method = durum === 'kampanyali' ? 'Kampanya.insert' : 'Tadilat.insert';

    Meteor.call(method,tarih,saat, function(e,r) {
      if (e) {
        t.error.set(true);
      } else if (r) {
        t.error.set(false);
        if (t.$('form').length > 0) {
          t.$('form')[0].reset();
        }
      }
    });

  }
});

Template.tabTakvimList.helpers({
  olaylar: function() {
    var tarih = moment(new Date(TimeSync.serverTime(null,5*60*1000))).subtract(1,'days').format('YYYY-MM-DD');
    return Rezervasyon.find({
        $and: [
          {
            tarih: {$gte: tarih}
          },
          {
            $or: [
              {durum: 'kampanyali'},
              {durum: 'tadilat'}
            ]
          }
        ]
      },
      {
        sort: {tarih:1, saat: 1, durum: 1},
        fields: {tarih:1, saat: 1, durum: 1}
      }
    ).map(function(rez){
        rez.tarih < moment(new Date(TimeSync.serverTime(null,5*60*1000))).format('YYYY-MM-DD') || rez.durum === 'tadilat' ? rez.gecmis = 'gecmis' : rez.gecmis = false;
        rez.display = moment(rez.tarih,'YYYY-MM-DD').format('DD MMM ddd');
        return rez;
      })
  }
});

Template.olay.events({
  'click .sil': function(e,t) {
    var method = t.data.durum === 'kampanyali' ? 'Kampanya.remove' : 'Tadilat.remove',
        tarih = t.data.tarih,
        saat  = t.data.saat;

    Meteor.call(method, tarih, saat);

  }
});
