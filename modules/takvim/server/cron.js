SyncedCron.add({
  name: 'Yönetime üç günlük toplu hatırlat.',
  schedule: function(parser) {
    return parser.recur().on(6).hour();
  },
  job: function() {
    Meteor.call('yonetimeHatirlat');
  }
});

SyncedCron.add({
  name: 'Bugünün rezervasyonlarını hatırlat.',
  schedule: function(parser) {
    return parser.recur().on(8).hour();
  },
  job: function() {
    Meteor.call('bugunuHatirlat');
  }
});

SyncedCron.add({
  name: 'Yarının rezervasyonlarını hatırlat.',
  schedule: function(parser) {
    return parser.recur().on(13).hour();
  },
  job: function() {
    Meteor.call('yariniHatirlat');
  }
});

Meteor.methods({
  'bugunuHatirlat': function() {
    this.unblock();

    var bugun = moment().format('YYYY-MM-DD');

    Rezervasyon.find({tarih: bugun, durum: 'dolu'}).forEach(function(rez) {
      Email.send({
        to: rez.bilgiler.eposta,
        from: 'info@cluesantalya.com',
        subject: '[CLUES] Heyecanlı mıyız :)',
        text: 'Merhaba ' + rez.bilgiler.isim + ','
        + '\n\n'
        + 'Bugün saat ' + rez.saat + ' için heyecanlı mısın?'
        + '\n\n'
        + 'İpuçlarını bulup evden kaçabilecek misin?'
        + '\n\n'
        + 'Seni ve arkadaşlarını görmek ve maceranıza tanık olmak için sabırsızlanıyoruz :)'
        + '\n\n'
        + 'Adresimizi de tekrar bir hatırlatalım; Sinan Mahallesi, Atatürk Caddesi, Uçar İş Hanı No 11 Kat 6. Ayrıca web sitemizde de güzel bir harita var. Yani çıkmak zor olabilir ama gelmek kolay ;)'
        + '\n\n'
        + 'http://www.cluesantalya.com/'
        + '\n\n'
        + 'Not: Eğer oldu ya son dakika bir aksilik çıktıysa +90 (532) 584 9795 numaralı telefonumuzdan arayarak bize haber verebilirsin.'
        + '\n\n'
      });
    });
  },
  'yariniHatirlat': function() {
    this.unblock();

    var yarin = moment().add(1,'days').format('YYYY-MM-DD');

    Rezervasyon.find({tarih: yarin, durum: 'dolu'}).forEach(function(rez) {
      Email.send({
        to: rez.bilgiler.eposta,
        from: 'info@cluesantalya.com',
        subject: '[CLUES] Yarına hazır mıyız :)',
        text: 'Merhaba ' + rez.bilgiler.isim + ','
        + '\n\n'
        + 'Yarın saat ' + rez.saat + ' için hazır mısın?'
        + '\n\n'
        + 'İpuçlarını bulup evden kaçabilecek misin?'
        + '\n\n'
        + 'Seni ve arkadaşlarını görmek ve maceranıza tanık olmak için sabırsızlanıyoruz :)'
        + '\n\n'
        + 'http://www.cluesantalya.com/'
        + '\n\n'
        + 'Not: Eğer oldu ya son dakika bir aksilik çıktıysa +90 (532) 584 9795 numaralı telefonumuzdan arayarak bize haber verebilirsin.'
        + '\n\n'
      });
    });
  },
  'yonetimeHatirlat': function() {
    this.unblock();

    var begin = moment().format('YYYY-MM-DD');
    var end = moment().add(2,'days').format('YYYY-MM-DD');

    var satir = '';
    var index = 0;
    var gun = '';

    Rezervasyon.find({$and: [ {tarih: {$gte: begin}}, {tarih: {$lte: end}}, {durum: 'dolu'} ]}, {sort: {tarih: 1, saat: 1}}).forEach(function(rez) {
      index = index+1;

      if (rez.tarih === begin) {
        gun = 'Bugün';
      } else if (rez.tarih === end) {
        gun = moment(rez.tarih, 'YYYY-MM-DD').format('ddd')
      } else {
        gun = 'Yarın';
      }

      satir = satir.concat(
        index + ') ' + gun + ' ' + rez.saat + ' - ' + rez.bilgiler.isim.split(' ')[0] + ' - ' + formatPhone(rez.bilgiler.telefon) + '\n\n'
      )

    });

    Email.send({
      to: 'info@cluesantalya.com',
      from: 'info@cluesantalya.com',
      subject: '[REZ] Yakındaki rezervasyonlar',
      text: 'Önümüzdeki üç günün rezervasyonları aşağıdaki gibidir.'
      + '\n\n'
      + satir
      + '\n\n'
      + 'http://www.cluesantalya.com/rezervasyonlar/ ekranından ayrıntıları görebilir ve işlem yapabilirsin.'
      + '\n\n'
    });

  }
});
