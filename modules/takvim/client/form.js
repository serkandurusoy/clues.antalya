Template.rezform.onRendered(function(){
  var inputs = $('#rezform input, #rezform textarea, #rezform select, #rezform button[type="submit"]'), inputTo;

  inputs.on('keydown', function(e) {

    if (e.keyCode == 9 || e.which == 9) {
      e.preventDefault();

      if (e.shiftKey) {
        inputTo = inputs.get(inputs.index(this) - 1);
      } else {
        inputTo = inputs.get(inputs.index(this) + 1);
      }

      if (inputTo) {
        inputTo.focus();
      } else {
        inputs[0].focus();
      }
    }
  });
});

Template.rezform.helpers({
  seciliTarih: function() {
    return Session.get('seciliDilim') && moment(Session.get('seciliDilim').tarih, 'YYYY-MM-DD').format('DD MMMM YYYY');
  },
  seciliSaat: function() {
    return Session.get('seciliDilim') && Session.get('seciliDilim').saat;
  },
  seciliFiyat: function() {
    var fiyat;
    if (Session.get('seciliDilim') && Session.get('seciliDilim').saat === '00:30') {
      fiyat = Fiyatlar.findOne({tip: 'gece'}).fiyat;
    } else if (Rezervasyon.findOne({
        tarih: Session.get('seciliDilim') && Session.get('seciliDilim').tarih,
        saat: Session.get('seciliDilim') && Session.get('seciliDilim').saat,
        durum: 'kampanyali'
      })) {
      fiyat = Fiyatlar.findOne({tip: 'kampanya'}).fiyat;
    } else {
      fiyat = Session.get('kisiSayisi') ? Fiyatlar.findOne({tip: 'gun' + Session.get('kisiSayisi')}).fiyat : Fiyatlar.findOne({tip: 'gun2'}).fiyat;
    }
    return fiyat;
  },
  formHatali: function() {
    return Session.get('formHatali');
  },
  baskasiAldi: function() {
    var tarih = Session.get('seciliDilim') && Session.get('seciliDilim').tarih;
    var saat = Session.get('seciliDilim') && Session.get('seciliDilim').saat;
    return !Session.get('inProgress') && ( kayitAra(tarih, saat, 'dolu') || kayitAra(tarih, saat, 'tadilat') );
  },
  inProgress: function() {
    return Session.get('inProgress');
  },
  tooFrequent: function() {
    return Rezervasyon.find({
      conn: Meteor.connection._lastSessionId
    }).count() >= 3;
  },
  tooMuch: function() {
    var ip;
    headers.ready(function() {
      ip = headers.get('x-forwarded-for');
    });
    return Rezervasyon.find({
        ip: ip
      }).count() >= 10;
  }
});

Template.rezform.events({
  'click .rezformwrapper': function(e) {
    e.stopImmediatePropagation();
  },
  'keydown': function(e,t) {
    if (e.which == 27) {
      if (t.$('#rezform').length > 0) {
        t.$('#rezform')[0].reset();
      } else {
        Session.set('formHatali', null);
        Session.set('kisiSayisi', null);
        Session.set('seciliDilim', null);
        Session.set('inProgress', null);
      }
    }
  },
  'click .rezformcontainer': function(e,t) {
    if (t.$('#rezform').length > 0) {
      t.$('#rezform')[0].reset();
    } else {
      Session.set('formHatali', null);
      Session.set('kisiSayisi', null);
      Session.set('seciliDilim', null);
      Session.set('inProgress', null);
    }
  },
  'reset #rezform': function() {
    Session.set('formHatali', null);
    Session.set('kisiSayisi', null);
    Session.set('seciliDilim', null);
    Session.set('inProgress', null);
  },
  'blur select[name="sayi"], change select[name="sayi"]': function(e,t) {
    var val = parseInt(e.target.value);
    var test = val;
    var $el = t.$('select[name="sayi"]');
    Session.set('kisiSayisi', val);
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
    }
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
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
    }
  },
  'blur input[name="telefon"], keyup input[name="telefon"]': function(e,t){
    var test = testTel(e.target.value);
    var $el = t.$('input[name="telefon"]');
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
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
  'submit #rezform': function(e,t) {
    e.preventDefault();

    if (!Session.get('inProgress')) {
      Session.set('inProgress', true);
      var tarih = Session.get('seciliDilim') && Session.get('seciliDilim').tarih;
      var saat = Session.get('seciliDilim') && Session.get('seciliDilim').saat;
      var bilgiler = {
        isim: trim(t.find('input[name="isim"]').value),
        telefon: t.find('input[name="telefon"]').value,
        eposta: t.find('input[name="eposta"]').value,
        sayi: parseInt(t.find('select[name="sayi"]').value),
        not: trim(t.$('textarea[name="not"]').val())+' '
      };

      if ( !(bilgiler.isim && bilgiler.isim.length >=5 && bilgiler.isim.length <= 250 &&
        bilgiler.not && bilgiler.not.length <=1000 &&
        bilgiler.telefon && testTel(bilgiler.telefon) &&
        bilgiler.eposta && testEmail(bilgiler.eposta) &&
        bilgiler.sayi) ) {
        Session.set('formHatali', true);
        Session.set('inProgress', null);
      } else {
        Meteor.call('Rezervasyon.insert', tarih, saat, bilgiler, 'yok', function(e,r) {
          if (e) {
            Session.set('formHatali', true);
            Session.set('inProgress', null);
          }
          if (r) {
            var kendiRez = {tarih: tarih, saat: saat};
            var kendiRezs = Session.get('kendiRez') ? Session.get('kendiRez').slice(0) : [];
            kendiRezs.push(kendiRez);
            Session.set('kendiRez', kendiRezs);

            Session.set('formHatali', null);
            Session.set('kisiSayisi', null);
            Session.set('seciliDilim', null);
            Session.set('inProgress', null);

          }
        });

      }

    }

  }
});
