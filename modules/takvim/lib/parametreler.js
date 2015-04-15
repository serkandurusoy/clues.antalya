AdminIp = new Mongo.Collection('adminip');

Fiyatlar = new Mongo.Collection('fiyatlar');
Fiyatlar.attachCollectionRevisions();

Meteor.methods({
  'Fiyat.update': function(tip,fiyat) {
    check(Meteor.userId(), String);
    check(tip, Match.Where(function(tip) {
        check(tip, String);
        return _.contains(['gece','kampanya','gun2','gun3','gun4', 'gun5'], tip);
      })
    );
    check(fiyat, Match.Where(function(fiyat) {
        check(fiyat, Match.Integer);
        return 50 <= fiyat && fiyat <= 500;
      })
    );

    if (Meteor.userId()) {
      var fiyatId = Fiyatlar.update(
        {tip: tip},
        {$set: {fiyat: fiyat}}
      );
      return fiyatId;
    }

  }
});

Parametreler = new Mongo.Collection('parametreler');
Parametreler.attachCollectionRevisions();

Meteor.methods({
  'Parametre.update': function(isim,icerik) {
    check(Meteor.userId(), String);
    check(isim, String);
    check(icerik, String);

    if (Meteor.userId()) {
      var parametreId = Parametreler.update(
        {isim: isim},
        {$set: {icerik: icerik}}
      );
      return parametreId;
    }

  }
});

Musteriler = new Mongo.Collection('musteriler');
Musteriler.attachCollectionRevisions();

Musteriler.helpers({
  rezervasyonlari: function() {
    return Rezervasyon.find({'bilgiler.eposta': this.eposta});
  },
});

Meteor.methods({
  'Musteri.insert': function(isim,eposta,telefon,not) {
    check(Meteor.userId(), String);

    var musteri = {
      isim: isim,
      telefon: telefon,
      eposta: eposta,
      not: not
    };

    checkMusteri(musteri);

    bilgiDuzenle(musteri);

    checkUniqueMusteri(null, musteri.eposta,musteri.telefon);

    if (Meteor.userId()) {
      var MusteriId = Musteriler.insert(
        { isim: musteri.isim, eposta: musteri.eposta, telefon: musteri.telefon, not: musteri.not, rez: 0, kisi: 0, ciro: 0 }
      );
      return MusteriId;
    }

  },
  'Musteri.update': function(id,isim,eposta,telefon,not) {
    check(Meteor.userId(), String);

    check(id, Match.Where(function(id) {
      check(id, String);
      return Musteriler.findOne({_id: id});
    }));

    var musteri = {
      isim: isim,
      telefon: telefon,
      eposta: eposta,
      not: not
    };

    checkMusteri(musteri);

    bilgiDuzenle(musteri);

    checkUniqueMusteri(id, musteri.eposta,musteri.telefon);

    if (Meteor.userId()) {
      var MusteriId = Musteriler.update(
        {_id: id},
        {$set: {isim: musteri.isim, eposta: musteri.eposta, telefon: musteri.telefon, not: musteri.not}}
      );
      return MusteriId;
    }

  }
});


var checkMusteri = function(musteri) {
  check(musteri, {
    isim: Match.Where(function(isim) {
      check(isim, String);
      return trim(isim).length >= 5 && trim(isim).length <= 250;
    }),
    telefon: Match.Where(function(telefon) {
      check(telefon, String);
      return testTel(telefon);
    }),
    eposta: Match.Where(function(eposta){
      check(eposta, String);
      return testEmail(eposta);
    }),
    not: Match.Where(function(not) {
      check(not, String);
      return trim(not).length <= 1000;
    })
  });
};

var checkUniqueMusteri = function(id, eposta,telefon) {
  if ( (!id && Musteriler.findOne({ $or: [ {eposta: eposta}, {telefon: telefon} ] })) ||
       ( id && Musteriler.findOne({ $and: [ {_id: {$ne: id}}, { $or: [ {eposta: eposta}, {telefon: telefon} ] } ]  })  )
  ) {
    throw new Meteor.Error('unique-constraint',
      'Belirtilen iletişim bilgileri zaten var.');
  }
};
