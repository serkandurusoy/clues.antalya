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

});
