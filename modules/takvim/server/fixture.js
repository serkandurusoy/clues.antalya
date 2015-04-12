Meteor.startup(function(){
  var fiyatlar = [
    {
      tip: 'gece',
      fiyat: 250
    },
    {
      tip: 'kampanya',
      fiyat: 80
    },
    {
      tip: 'gun2',
      fiyat: 100
    },
    {
      tip: 'gun3',
      fiyat: 120
    },
    {
      tip: 'gun4',
      fiyat: 140
    },
    {
      tip: 'gun5',
      fiyat: 150
    }
  ];

  if (Fiyatlar.find().count() === 0) {
    _.each(fiyatlar, function(fiyat) {
      Fiyatlar.insert(fiyat);
    });
  }

  var parametreler = [
    {
      isim: 'parametre isim',
      icerik: 'parametre içerik'
    }
  ];

  if (Parametreler.find().count() === 0) {
    _.each(parametreler, function(parametre) {
      Parametreler.insert(parametre);
    });
  }

  var acilisOncesiTadilatlar = [
    {tarih: '2015-04-12', saat: '09:30', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '11:00', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '12:30', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '14:00', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '15:30', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '17:00', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '18:30', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '20:00', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '21:30', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '23:00', durum: 'tadilat'},
    {tarih: '2015-04-12', saat: '00:30', durum: 'tadilat'},

    {tarih: '2015-04-13', saat: '09:30', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '11:00', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '12:30', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '14:00', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '15:30', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '17:00', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '18:30', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '20:00', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '21:30', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '23:00', durum: 'tadilat'},
    {tarih: '2015-04-13', saat: '00:30', durum: 'tadilat'},

    {tarih: '2015-04-14', saat: '09:30', durum: 'tadilat'},
    {tarih: '2015-04-14', saat: '11:00', durum: 'tadilat'}

  ];

  if (Rezervasyon.find({durum: 'tadilat'}).count() === 0) {
    _.each(acilisOncesiTadilatlar, function(tadilat) {
      Rezervasyon.insert(tadilat);
    });
  }

});
