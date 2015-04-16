Template.tabmusteri.onCreated(function() {
  this.showform = new ReactiveVar(false);
  this.showMusteri = new ReactiveVar(null);
});

Template.tabmusteri.helpers({
  showform: function() {
    return Template.instance().showform.get();
  },
  musteri: function() {
    return Musteriler.findOne({_id: Template.instance().showMusteri.get()});
  }
});

Template.tabmusteriForm.onCreated(function(){
  this.error = new ReactiveVar(false);
});

Template.tabmusteriForm.helpers({
  error: function() {
    return Template.instance().error.get();
  },
  barePhone: function(tel) {
    return tel && tel.slice(3);
  }
});

Template.tabmusteriForm.events({
  'click .vazgec': function(e,t) {
    Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.set(null);
    Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showform.set(false);
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
    if (!test || Musteriler.findOne({$and: [{_id: {$ne: Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.get()}}, {eposta: e.target.value}]})) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
    }
  },
  'blur input[name="telefon"], keyup input[name="telefon"]': function(e,t){
    var test = testTel(e.target.value);
    var $el = t.$('input[name="telefon"]');
    if (!test || Musteriler.findOne({$and: [{_id: {$ne: Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.get()}}, {telefon: '+90' + e.target.value.toString()}]}) ) {
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
  'submit form': function(e,t){
    e.preventDefault();

    var isim     = trim(t.find('input[name="isim"]').value);
    var telefon  = t.find('input[name="telefon"]').value;
    var eposta   = t.find('input[name="eposta"]').value;
    var not      = trim(t.$('textarea[name="not"]').val())+' ';
    var toUpdate = Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.get();

    if ( !(isim && isim.length >=5 && isim.length <= 250 &&
           not && not.length<=1000 &&
           telefon && testTel(telefon) &&
           eposta && testEmail(eposta) ) ||
           Musteriler.findOne({$and: [{_id: {$ne: toUpdate}}, {eposta: eposta}]}) ||
           Musteriler.findOne({$and: [{_id: {$ne: toUpdate}}, {telefon: '+90' + telefon.toString()}]}) ) {
      t.error.set(true);
    } else {
      if (toUpdate) {
        Meteor.call('Musteri.update',toUpdate,isim,eposta,telefon,not,function(e,r) {
          if (e) {
            t.error.set(true);
          }
          if (r) {
            t.error.set(false);
            Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.set(null);
            Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showform.set(false);
          }
        });
      } else {
        Meteor.call('Musteri.insert',isim,eposta,telefon,not,function(e,r) {
          if (e) {
            t.error.set(true);
          }
          if (r) {
            t.error.set(false);
            Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.set(null);
            Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showform.set(false);
          }
        });
      }
    }

  }
});

Template.tabmusteriList.helpers({
  musteriler: function() {
    return Musteriler.find({},{sort: {isim: 1}});
  }
});

Template.tabmusteriList.events({
  'click .musteriekle': function(e,t) {
    Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showform.set(true);
  }
});

Template.musteri.onCreated(function() {
  this.showDetail = new ReactiveVar(false);
});

Template.musteri.helpers({
  showDetail: function(){
    return Template.instance().showDetail.get();
  },
  formatTel: function(tel) {
    return formatPhone(tel);
  },
  formatTarih: function(tarih) {
    return moment(tarih,'YYYY-MM-DD').format('DD MMM YYYY');
  }
});

Template.musteri.events({
  'click .guncelle': function(e,t) {
    e.stopImmediatePropagation();
    var musteriId = t.data._id;
    if (Musteriler.findOne({_id: musteriId})) {
      Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showMusteri.set(musteriId);
      Blaze.getView(document.getElementById("tabmusteri")).templateInstance().showform.set(true);
    }
  },
  'click .rezyap': function(e,t) {
    e.stopImmediatePropagation();
    var musteri = Musteriler.findOne({_id: t.data._id});
    if (musteri) {
      Blaze.getView(document.getElementById("admin")).templateInstance().tabState.set('one');
      Meteor.defer(function() {
        Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showform.set(true);
        Blaze.getView(document.getElementById("tabrezervasyon")).templateInstance().showFromMusteri.set({isim: musteri.isim, eposta: musteri.eposta, telefon: musteri.telefon});
      });
    }
  },
  'click .noprop': function(e,t) {
    e.stopImmediatePropagation();
  },
  'click': function(e,t) {
    t.showDetail.set(!t.showDetail.get());
  }
});
