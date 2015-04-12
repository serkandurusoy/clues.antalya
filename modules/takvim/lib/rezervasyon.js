Rezervasyon = new Mongo.Collection('rezervasyon');
Rezervasyon.attachCollectionRevisions();

Meteor.methods({
  'Rezervasyon.insert': function(tarih,saat,bilgiler) {
    checkTarihSaat(tarih,saat);
    checkBilgiler(bilgiler);

    bilgiDuzenle(bilgiler);

    var conn = this.connection && this.connection.id ? this.connection.id : 'Bilinmiyor';
    var ip = this.connection && this.connection.clientAddress ? this.connection.clientAddress : 'Bilinmiyor';

    var begin = moment().format('YYYY-MM-DD');
    var end = moment().add(32,'days').format('YYYY-MM-DD');
    if (!Meteor.userId() && Rezervasyon.find({
        $and: [
          {ip: ip},
          {tarih: {$gte: begin}},
          {tarih: {$lte: end}}
        ]
      }).count() >= 10) {
      throw new Meteor.Error('toomuch-constraint',
        'Bir aylık dönemde 10\'dan fazla rezervasyon için telefon açınız.');
    }

    if (!Meteor.userId() && Rezervasyon.find({
        conn: conn
      }).count() >= 3) {
      throw new Meteor.Error('toofrequent-constraint',
        'Tek oturumda 3\'ten fazla rezervasyon için telefon açınız.');
    }

    if (moment(tarih,'YYYY-MM-DD').isAfter(moment().add(32,'days'), 'day')) {
      if (!Meteor.userId()) {
        throw new Meteor.Error('toofar-constraint',
          'Belirtilen tarihe yalnızca telefonla rezervasyon yapılabilir.');
      }
    }

    if (saat === '00:30') {
      if (!Meteor.userId()) {
        throw new Meteor.Error('night-constraint',
          'Belirtilen saate yalnızca telefonla rezervasyon yapılabilir.');
      }
    }

    checkUnique(tarih, saat, 'dolu');
    checkUnique(tarih, saat, 'tadilat');

    var kanal = Meteor.userId() ? 'Telefon' : 'Internet';

    var tip = kayitAra(tarih, saat, 'kampanyali') ? 'Kampanyalı' : 'Normal';

    var fiyat = parseInt( tip === 'Kampanyalı' ? Fiyatlar.findOne({tip: 'kampanya'}).fiyat : saat === '00:30' ? Fiyatlar.findOne({tip: 'gece'}).fiyat : Fiyatlar.findOne({tip: 'gun' + bilgiler.sayi}).fiyat );

    var rezId = Rezervasyon.insert({
      zaman: new Date,
      ip: ip,
      conn: conn,
      kanal: kanal,
      tip: tip,
      fiyat: fiyat,
      tarih: tarih,
      saat: saat,
      durum: 'dolu',
      bilgiler: bilgiler
    });

    if (Meteor.isServer) {

      this.unblock();

      if (!Meteor.userId()) {
        Email.send({
          to: 'info@cluesantalya.com',
          from: 'info@cluesantalya.com',
          subject: '[REZ] Yeni bir internet rezervasyonu var',
          text: 'Web sitesi üzerinden aşağıdaki bilgiler ile yeni bir rezervasyon yapıldı.'
          + '\n\n'
          + 'Zaman: ' + moment(tarih,'YYYY-MM-DD').format('DD MMMM YYYY') + ' - ' + saat
          + '\n'
          + 'Sayı: ' + bilgiler.sayi + ' kişi ' + fiyat + 'TL'
          + '\n'
          + 'İsim: ' + bilgiler.isim
          + '\n'
          + 'Tel: ' + formatPhone(bilgiler.telefon)
          + '\n'
          + 'Eposta: ' + bilgiler.eposta
          + '\n'
          + 'Not: ' + bilgiler.not
          + '\n\n'
          + 'http://www.cluesantalya.com/rezervasyonlar/ ekranından ayrıntıları görebilir ve işlem yapabilirsin.'
          + '\n\n'
        });

      }

      Email.send({
        to: bilgiler.eposta,
        from: 'info@cluesantalya.com',
        subject: '[CLUES] Rezervasyonun alındı.',
        text: 'Merhaba ' + bilgiler.isim.split(' ')[0] + ','
        + '\n\n'
        + bilgiler.sayi + ' kişilik Clues Antalya rezervasyonunuz ' + moment(tarih,'YYYY-MM-DD').format('DD MMMM YYYY') + ' saat ' + saat + ' için alındı.'
        + '\n\n'
        + fiyat + 'TL ücretinizi geldiğinizde nakit veya kredi kartınız ile ödeyebilirsin.'
        + '\n\n'
        + 'Bir değişiklik istemeniz durumunda, bize bu maile yanıt vererek veya +90 (532) 584 9795 numaralı telefonumuzdan arayarak ulaşabilirsin.'
        + '\n\n'
        + 'Rezervasyonunuzu kısa bir süre öncesinde sana e-posta ile tekrar hatırlatacak ve ' + formatPhone(bilgiler.telefon) + ' numaralı telefonundan arayarak teyid edeceğiz.'
        + '\n\n'
        + 'Sizi görmek ve maceranıza tanık olmak için sabırsızlanıyoruz :)'
        + '\n\n'
        + 'http://www.cluesantalya.com/'
        + '\n\n'
      });

    }

    return rezId;

  },
  'Rezervasyon.update': function(tarih,saat,yenitarih,yenisaat,yenibilgiler) {
    check(Meteor.userId(), String);
    checkTarihSaat(tarih,saat);
    checkTarihSaat(yenitarih,yenisaat);
    checkBilgiler(yenibilgiler);

    checkUnique(yenitarih, yenisaat, 'dolu');
    checkUnique(yenitarih, yenisaat, 'tadilat');

    if (Meteor.userId()) {

      var rez = kayitAra(tarih, saat, 'dolu');

      var tip = kayitAra(yenitarih, yenisaat, 'kampanyali') ? 'Kampanyalı' : 'Normal';
      var fiyat = parseInt( tip === 'Kampanyalı' ? Fiyatlar.findOne({tip: 'kampanya'}).fiyat : yenisaat === '00:30' ? Fiyatlar.findOne({tip: 'gece'}).fiyat : Fiyatlar.findOne({tip: 'gun' + yenibilgiler.sayi}).fiyat );

      bilgiDuzenle(yenibilgiler);

      if ( yenitarih === rez.tarih &&
           yenisaat === rez.saat &&
           yenibilgiler.sayi === rez.bilgiler.sayi &&
           yenibilgiler.isim === rez.bilgiler.isim &&
           yenibilgiler.telefon === rez.bilgiler.telefon &&
           yenibilgiler.eposta === rez.bilgiler.eposta &&
           yenibilgiler.not === rez.bilgiler.not
      ) {
        throw new Meteor.Error('not-changed',
          'Bilgilerde bir değişiklik yapmadınız.');
      }

      var rezId = Rezervasyon.update(
        {
          tarih: tarih,
          saat: saat,
          durum: 'dolu'
        },
        {
          $set: {
            tarih: yenitarih,
            saat: yenisaat,
            tip: tip,
            fiyat: fiyat,
            bilgiler: yenibilgiler
          }
        }
      );


      if (yenitarih !== rez.tarih || yenisaat !== rez.saat || yenibilgiler.sayi !== rez.bilgiler.sayi) {

        if (Meteor.isServer) {
          this.unblock();

          Email.send({
            to: yenibilgiler.eposta,
            from: 'info@cluesantalya.com',
            subject: '[CLUES] Rezervasyonun değiştirildi.',
            text: 'Merhaba ' + yenibilgiler.isim.split(' ')[0] + ','
            + '\n\n'
            + moment(rez.tarih,'YYYY-MM-DD').format('DD MMMM YYYY') + ' saat ' + rez.saat + ' için yaptığınız ' + rez.bilgiler.sayi + ' kişilik Clues Antalya rezervasyonunuz isteğin üzere değiştirildi. Güncel rezervasyon bilgileriniz aşağıdaki gibi.'
            + '\n\n'
            + 'Zaman: ' + moment(yenitarih,'YYYY-MM-DD').format('DD MMMM YYYY') + ' - ' + yenisaat
            + '\n'
            + 'Sayı: ' + yenibilgiler.sayi + ' kişi ' + fiyat + 'TL'
            + '\n\n'
            + 'Tekrar bir değişiklik istemeniz durumunda, bize bu maile yanıt vererek veya +90 (532) 584 9795 numaralı telefonumuzdan arayarak ulaşabilirsin.'
            + '\n\n'
            + 'Rezervasyonunuzu kısa bir süre öncesinde size e-posta ile tekrar hatırlatacak ve ' + formatPhone(yenibilgiler.telefon) + ' numaralı telefonundan arayarak bir kez daha teyid edeceğiz.'
            + '\n\n'
            + 'Sizi görmek ve maceranıza tanık olmak için sabırsızlanıyoruz :)'
            + '\n\n'
            + 'http://www.cluesantalya.com/'
            + '\n\n'
          });

        }

      }

      return rezId;

    }

  },
  'Rezervasyon.remove': function(tarih,saat) {
    check(Meteor.userId(), String);
    checkTarihSaat(tarih,saat);

    if (!kayitAra(tarih, saat, 'dolu')) {
      throw new Meteor.Error('not-found',
        'Belirtilen saatte bir rezervasyon yok.');
    }

    if (Meteor.userId()) {

      if (Meteor.isServer) {
        var rez = kayitAra(tarih, saat, 'dolu');

        this.unblock();

        Email.send({
          to: rez.bilgiler.eposta,
          from: 'info@cluesantalya.com',
          subject: '[CLUES] Rezervasyonun iptal edildi.',
          text: 'Merhaba ' + rez.bilgiler.isim.split(' ')[0] + ','
          + '\n\n'
          + moment(rez.tarih,'YYYY-MM-DD').format('DD MMMM YYYY') + ' saat ' + rez.saat + ' için yaptığın ' + rez.bilgiler.sayi + ' kişilik Clues Antalya rezervasyonunuz isteğin üzere iptal edildi.'
          + '\n\n'
          + 'Yeni bir rezervasyon için http://www.cluesantalya.com/ sayfamızı ziyaret edebilir, bize bu maile yanıt vererek veya +90 (532) 584 9795 numaralı telefonumuzdan arayarak ulaşabilirsin.'
          + '\n\n'
          + 'Sizi görmek ve maceranıza tanık olmak için sabırsızlanıyoruz :)'
          + '\n\n'
          + 'http://www.cluesantalya.com/'
          + '\n\n'
        });
      }

      var rezId = Rezervasyon.remove({
        tarih: tarih,
        saat: saat,
        durum: 'dolu'
      });
      return rezId;
    }

  },
  'Kampanya.insert': function(tarih,saat) {
    check(Meteor.userId(), String);
    checkTarihSaat(tarih,saat);

    checkUnique(tarih, saat, 'kampanyali');

    if (saat === '00:30') {
      throw new Meteor.Error('bad-input',
        'Geceyarısı seansına kampanya yapılamaz.');
    }

    if (Meteor.userId()) {
      var rezId = Rezervasyon.insert({
        tarih: tarih,
        saat: saat,
        durum: 'kampanyali'
      });
      return rezId;
    }

  },
  'Kampanya.remove': function(tarih,saat) {
    check(Meteor.userId(), String);
    checkTarihSaat(tarih,saat);

    if (!kayitAra(tarih, saat, 'kampanyali')) {
      throw new Meteor.Error('not-found',
        'Belirtilen saatte bir kampanya yok.');
    }

    if (Meteor.userId()) {
      var rezId = Rezervasyon.remove({
        tarih: tarih,
        saat: saat,
        durum: 'kampanyali'
      });
      return rezId;
    }

  },
  'Tadilat.insert': function(tarih,saat) {
    check(Meteor.userId(), String);
    checkTarihSaat(tarih,saat);

    checkUnique(tarih, saat, 'tadilat');
    checkUnique(tarih, saat, 'dolu');

    if (Meteor.userId()) {
      var rezId = Rezervasyon.insert({
        tarih: tarih,
        saat: saat,
        durum: 'tadilat'
      });
      return rezId;
    }

  },
  'Tadilat.remove': function(tarih,saat) {
    check(Meteor.userId(), String);
    checkTarihSaat(tarih,saat);

    if (!kayitAra(tarih, saat, 'tadilat')) {
      throw new Meteor.Error('not-found',
        'Belirtilen saatte bir tadilat yok.');
    }

    if (Meteor.userId()) {
      var rezId = Rezervasyon.remove({
        tarih: tarih,
        saat: saat,
        durum: 'tadilat'
      });
      return rezId;
    }

  }
});

var checkTarihSaat = function(tarih,saat) {
  check(tarih, Match.Where(function(tarih) {
      check(tarih, String);
      return moment(tarih,'YYYY-MM-DD').isValid() && moment(tarih,'YYYY-MM-DD').isAfter(moment().subtract(1,'days'), 'day');
    })
  );
  check(saat, Match.Where(function(saat) {
      check(saat, String);
      return _.contains(['09:30','11:00','12:30','14:00','15:30','17:00','18:30','20:00','21:30','23:00','00:30'], saat);
    })
  );
};

var checkBilgiler = function(bilgiler) {
  check(bilgiler, {
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
    sayi: Match.Where(function(sayi) {
      check(sayi, Number);
      return 2 <= sayi && sayi <= 5;
    }),
    not: Match.Where(function(not) {
      check(not, String);
      return trim(not).length <= 1000;
    })
  });
};

var checkUnique = function(tarih,saat,durum) {
  if (kayitAra(tarih, saat, durum)) {
    throw new Meteor.Error('unique-constraint',
      'Belirtilen saatte zaten bir kayıt var.');
  }
};
