Rezervasyon.after.insert(function(userId, doc) {
  if (doc.durum === 'dolu') {
    var musteri = Musteriler.findOne({ $or: [ {eposta: doc.bilgiler.eposta}, {telefon: doc.bilgiler.telefon} ] });

    if (!musteri) {
      Musteriler.insert({
          isim: doc.bilgiler.isim,
          eposta: doc.bilgiler.eposta,
          telefon: doc.bilgiler.telefon,
          not: 'Herhangi bir not bırakılmadı.',
          rez: 1,
          kisi: doc.bilgiler.sayi,
          ciro: doc.fiyat
        }
      )
    } else {
      Musteriler.update(
        {_id: musteri._id},
        {
          $set: {
            isim: doc.bilgiler.isim,
            eposta: doc.bilgiler.eposta,
            telefon: doc.bilgiler.telefon,
            rez: parseInt(musteri.rez) + 1,
            kisi: parseInt(musteri.kisi) + parseInt(doc.bilgiler.sayi),
            ciro: parseInt(musteri.ciro) + parseInt(doc.fiyat)
          }
        }
      )
    }

  }
});

Rezervasyon.after.update(function (userId, doc, fieldNames, modifier, options) {
  var fiyat = doc.fiyat !== this.previous.fiyat;
  var sayi = doc.bilgiler.sayi !== this.previous.bilgiler.sayi;
  var isim = doc.bilgiler.isim !== this.previous.bilgiler.isim;
  var eposta = doc.bilgiler.eposta !== this.previous.bilgiler.eposta;
  var telefon = doc.bilgiler.telefon !== this.previous.bilgiler.telefon;

  if ( (doc.durum === 'dolu') && ( fiyat || sayi || isim || eposta || telefon ) ) {

    var eskiMusteri = Musteriler.findOne({ $or: [ {eposta: this.previous.bilgiler.eposta}, {telefon: this.previous.bilgiler.telefon} ] });

    if (eskiMusteri) {
      Musteriler.update(
        {_id: eskiMusteri._id},
        {
          $set: {
            rez: parseInt(eskiMusteri.rez) - 1,
            kisi: parseInt(eskiMusteri.kisi) - parseInt(this.previous.bilgiler.sayi),
            ciro: parseInt(eskiMusteri.ciro) - parseInt(this.previous.fiyat)
          }
        }
      );
    }

    var yeniMusteri = Musteriler.findOne({ $or: [ {eposta: doc.bilgiler.eposta}, {telefon: doc.bilgiler.telefon} ] });

    if (!yeniMusteri) {
      Musteriler.insert({
          isim: doc.bilgiler.isim,
          eposta: doc.bilgiler.eposta,
          telefon: doc.bilgiler.telefon,
          not: ' ',
          rez: 1,
          kisi: doc.bilgiler.sayi,
          ciro: doc.fiyat
        }
      )
    } else {
      Musteriler.update(
        {_id: yeniMusteri._id},
        {
          $set: {
            isim: doc.bilgiler.isim,
            eposta: doc.bilgiler.eposta,
            telefon: doc.bilgiler.telefon,
            rez: parseInt(yeniMusteri.rez) + 1,
            kisi: parseInt(yeniMusteri.kisi) + parseInt(doc.bilgiler.sayi),
            ciro: parseInt(yeniMusteri.ciro) + parseInt(doc.fiyat)
          }
        }
      )
    }

  }
});

Rezervasyon.after.remove(function(userId, doc) {
  if (doc.durum === 'dolu') {
    var musteri = Musteriler.findOne({ $or: [ {eposta: doc.bilgiler.eposta}, {telefon: doc.bilgiler.telefon} ] });
    Musteriler.update(
      {_id: musteri._id},
      {
        $set: {
          rez: parseInt(musteri.rez) - 1,
          kisi: parseInt(musteri.kisi) - parseInt(doc.bilgiler.sayi),
          ciro: parseInt(musteri.ciro) - parseInt(doc.fiyat)
        }
      }
    );
  }
});

Musteriler.after.update(function (userId, doc, fieldNames, modifier, options) {
  if ( doc.isim !== this.previous.isim ||
       doc.eposta !== this.previous.eposta ||
       doc.telefon !== this.previous.telefon ) {

    Rezervasyon.find(
      {
        $and: [
          {durum:'dolu'},
          {
            $or: [
              {'bilgiler.eposta': this.previous.eposta},
              {'bilgiler.telefon': this.previous.telefon}
            ]
          }
        ]
      }
    ).forEach(function(rezervasyon) {
        Rezervasyon.update(
          {_id: rezervasyon._id},
          {
            $set: {
              'bilgiler.isim': doc.isim,
              'bilgiler.eposta': doc.eposta,
              'bilgiler.telefon': doc.telefon
            }
          }
        );
      });

  }
});
