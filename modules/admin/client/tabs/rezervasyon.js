Template.tabrezervasyon.onCreated(function() {
  this.showform = new ReactiveVar(false);
  this.showRezervasyon = new ReactiveVar(null);
  this.showFromMusteri = new ReactiveVar(null);
});

Template.tabrezervasyon.helpers({
  showform: function() {
    return Template.instance().showform.get();
  },
  rezervasyon: function() {
    return Rezervasyon.findOne({_id: Template.instance().showRezervasyon.get()});
  }
});

Template.tabRezForm.onCreated(function(){
  var rezCursor = Rezervasyon.findOne({_id: Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showRezervasyon.get()});
  this.error = new ReactiveVar(false);
  this.sayi = new ReactiveVar(rezCursor ? rezCursor.bilgiler.sayi : null);
  this.tarih = new ReactiveVar(rezCursor ? rezCursor.tarih : null);
  this.saat = new ReactiveVar(rezCursor ? rezCursor.saat : null);
});

Template.tabRezForm.onRendered(function() {
  var musteri = Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showFromMusteri.get();
  if (musteri) {
    $('input[name="isim"]').val(musteri.isim);
    $('input[name="telefon"]').val(musteri.telefon.slice(3));
    $('input[name="eposta"]').val(musteri.eposta);
    Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showFromMusteri.set(null);
  }
});

Template.tabRezForm.helpers({
  error: function() {
    return Template.instance().error.get();
  },
  barePhone: function(tel) {
    return tel && tel.slice(3);
  },
  formatTarih: function(tarih) {
    return moment(tarih,'YYYY-MM-DD').format('DD MMM ddd');
  },
  tarihler: function() {
    var tarihler = [];
    for (var g=0; g<90; g++) {
      var tarih = moment(new Date(TimeSync.serverTime(null,10*1000))).subtract(1,'days').add(g,'days');
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
  selected: function(data,value) {
    return data === value;
  },
  tip: function() {
    var tarih = Template.instance().tarih.get();
    var saat = Template.instance().saat.get();
    var tip = '';
    if (tarih && saat ) {
      return Rezervasyon.findOne({tarih: tarih, saat: saat, durum: 'kampanyali'}) ? 'Kampanyalı' : 'Normal';
    }
    return tip;
  },
  ozelFiyat: function() {
    var tarih = Template.instance().tarih.get();
    var saat = Template.instance().saat.get();
    var sayi = Template.instance().sayi.get();
    var fiyat = '';
    if (tarih && saat && sayi) {
      if (saat === '00:30') {
        fiyat = Fiyatlar.findOne({tip: 'gece'}).fiyat;
      } else if (Rezervasyon.findOne({tarih: tarih, saat: saat, durum: 'kampanyali'})) {
        fiyat = Fiyatlar.findOne({tip: 'kampanya'}).fiyat;
      } else {
        fiyat = Fiyatlar.findOne({tip: 'gun' + sayi }).fiyat;
      }
    }
    return fiyat;
  }
});

Template.tabRezForm.events({
  'click .vazgec': function(e,t) {
    Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showRezervasyon.set(null);
    Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showform.set(false);
  },
  'blur input[name="isim"], keyup input[name="isim"]': function(e,t){
    var test = trim(e.target.value).length >= 5 && trim(e.target.value).length <= 250;
    var $el = t.$('input[name="isim"]');
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
    }
  },
  'blur input[name="eposta"], keyup input[name="eposta"]': function(e,t){
    var test = testEmail(e.target.value);
    var $el = t.$('input[name="eposta"]');
    var mt = Musteriler.findOne({telefon: '+90'+t.$('input[name="telefon"]').val()});
    if(mt) {t.$('input[name="telefon"]').removeClass('error');}
    if (!test) {
      $el.addClass('error');
    } else {
      var me = Musteriler.findOne({eposta: t.$('input[name="eposta"]').val()});
      if (mt && me) {
        if (mt._id !== me._id) {
          t.$('input[name="telefon"]').addClass('error');
          t.$('input[name="eposta"]').addClass('error');
        } else {
          t.$('input[name="telefon"]').removeClass('error');
          t.$('input[name="eposta"]').removeClass('error');
        }
      } else {
        if(mt) {t.$('input[name="telefon"]').removeClass('error');}
        $el.removeClass('error');
      }
    }
  },
  'blur input[name="telefon"], keyup input[name="telefon"]': function(e,t){
    var test = testTel(e.target.value);
    var $el = t.$('input[name="telefon"]');
    var me = Musteriler.findOne({eposta: t.$('input[name="eposta"]').val()});
    if(me) {t.$('input[name="eposta"]').removeClass('error');}
    if (!test) {
      $el.addClass('error');
    } else {
      var mt = Musteriler.findOne({telefon: '+90'+t.$('input[name="telefon"]').val()});
      if (mt && me) {
        if (mt._id !== me._id) {
          t.$('input[name="telefon"]').addClass('error');
          t.$('input[name="eposta"]').addClass('error');
        } else {
          t.$('input[name="telefon"]').removeClass('error');
          t.$('input[name="eposta"]').removeClass('error');
        }
      } else {
        if(me) {t.$('input[name="eposta"]').removeClass('error');}
        $el.removeClass('error');
      }
    }
  },
  'blur textarea[name="not"], keyup textarea[name="not"]': function(e,t){
    var test = trim(e.target.value).length <= 1000;
    var $el = t.$('textarea[name="not"]');
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
    }
  },
  'blur select[name="tarih"], change select[name="tarih"]': function(e,t) {
    var val = e.target.value;
    var test = val;
    var $el = t.$('select[name="tarih"]');
    if (!test) {
      t.tarih.set(null);
      $el.addClass('error');
    } else {
      t.tarih.set(val);
      $el.removeClass('error');
    }
  },
  'blur select[name="saat"], change select[name="saat"]': function(e,t) {
    var val = e.target.value;
    var test = val;
    var $el = t.$('select[name="saat"]');
    if (!test) {
      t.saat.set(null);
      $el.addClass('error');
    } else {
      t.saat.set(val);
      $el.removeClass('error');
    }
  },
  'blur select[name="sayi"], change select[name="sayi"]': function(e,t) {
    var val = parseInt(e.target.value);
    var test = val;
    var $el = t.$('select[name="sayi"]');
    if (!test) {
      t.sayi.set(null);
      $el.addClass('error');
    } else {
      t.sayi.set(val);
      $el.removeClass('error');
    }
  },
  'blur input[name="ozelFiyat"], keyup input[name="ozelFiyat"], change input[name="ozelFiyat"]': function(e,t){
    var ozelFiyat = parseInt(e.target.value);
    var $el = t.$('input[name="ozelFiyat"]');
    var test = Match.test(ozelFiyat,Match.Integer) && 0 <= ozelFiyat && ozelFiyat <= 500 ;
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
    }
  },
  'submit form': function(e,t) {
    e.preventDefault();

    var tarih = t.find('select[name="tarih"]').value;
    var saat = t.find('select[name="saat"]').value;
    var bilgiler = {
      isim: trim(t.find('input[name="isim"]').value),
      telefon: t.find('input[name="telefon"]').value,
      eposta: t.find('input[name="eposta"]').value,
      sayi: parseInt(t.find('select[name="sayi"]').value),
      not: trim(t.$('textarea[name="not"]').val())+' '
    };
    var ozelFiyat = parseInt(t.find('input[name="ozelFiyat"]').value);
    var toUpdate = null;
    var rezCursor = Rezervasyon.findOne({_id: Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showRezervasyon.get()});
    if (rezCursor && rezCursor.tarih && rezCursor.saat) {
      toUpdate = {
        tarih: rezCursor.tarih,
        saat: rezCursor.saat
      }
    }

    var mt = Musteriler.findOne({telefon: '+90'+bilgiler.telefon});
    var me = Musteriler.findOne({eposta: bilgiler.eposta});

    if (mt && me && mt._id !== me._id) {
      t.error.set(true);
    } else {
      if ( !(tarih && saat && Match.test(ozelFiyat,Match.Integer) && 0 <= ozelFiyat && ozelFiyat <= 500 &&
        bilgiler.isim && bilgiler.isim.length >=5 && bilgiler.isim.length <= 250 &&
        bilgiler.not && bilgiler.not.length <=1000 &&
        bilgiler.telefon && testTel(bilgiler.telefon) &&
        bilgiler.eposta && testEmail(bilgiler.eposta) &&
        bilgiler.sayi) ) {
        t.error.set(true);
      } else {
        if (toUpdate) {
          Meteor.call('Rezervasyon.update', toUpdate.tarih, toUpdate.saat, tarih, saat, bilgiler, ozelFiyat, function(e,r) {
            if (e) {
              t.error.set(true);
            }
            if (r) {
              t.error.set(false);
              Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showRezervasyon.set(null);
              Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showform.set(false);
            }
          });
        } else {
          Meteor.call('Rezervasyon.insert', tarih, saat, bilgiler, ozelFiyat, function(e,r) {
            if (e) {
              t.error.set(true);
            }
            if (r) {
              t.error.set(false);
              Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showRezervasyon.set(null);
              Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showform.set(false);
            }
          });
        }
      }
    }

  }
});

Template.tabRezList.helpers({
  rezervasyonlar: function() {
    var tarih = moment(new Date(TimeSync.serverTime(null,10*1000))).subtract(1,'days').format('YYYY-MM-DD');
    return Rezervasyon.find({tarih: {$gte: tarih}, durum: 'dolu'},{sort: {tarih: 1, saat: 1}});
  }
});

Template.tabRezList.events({
  'click .rezekle': function(e,t) {
    Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showform.set(true);
  }
});

Template.rezervasyonDetay.onCreated(function() {
  this.showDetail = new ReactiveVar(false);
});

Template.rezervasyonDetay.helpers({
  showDetail: function(){
    return Template.instance().showDetail.get();
  },
  formatTel: function(tel) {
    return formatPhone(tel);
  },
  formatTarih: function(tarih) {
    return moment(tarih,'YYYY-MM-DD').format('DD MMM ddd');
  },
  gecmis: function() {
    return Template.currentData().tarih < moment(new Date(TimeSync.serverTime(null,10*1000))).format('YYYY-MM-DD') ? 'gecmis' : false;
  }
});

Template.rezervasyonDetay.events({
  'click .guncelle': function(e,t) {
    e.stopImmediatePropagation();
    var rezId = t.data._id;
    if (Rezervasyon.findOne({_id: rezId})) {
      Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showRezervasyon.set(rezId);
      Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showform.set(true);
    }
  },
  'click .reziptal': function(e,t) {
    e.stopImmediatePropagation();
    t.$('.reziptal').addClass('reziptalemin');
    t.$('.reziptal').text('Emin misin?');
    t.$('.reziptal').removeClass('reziptal');
  },
  'click .reziptalemin': function(e,t) {
    e.stopImmediatePropagation();
    Meteor.defer(function() {
      Meteor.call('Rezervasyon.remove', t.data.tarih, t.data.saat);
    });
  },
  'click .noprop': function(e,t) {
    e.stopImmediatePropagation();
  },
  'click': function(e,t) {
    t.showDetail.set(!t.showDetail.get());
  },
});
