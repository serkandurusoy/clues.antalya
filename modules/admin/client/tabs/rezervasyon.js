Template.tabrezervasyon.onCreated(function() {
  this.showform = new ReactiveVar(false);
  this.showRezervasyon = new ReactiveVar(null);
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
  this.error = new ReactiveVar(false);
});

Template.tabRezForm.helpers({
  error: function() {
    return Template.instance().error.get();
  },
  barePhone: function(tel) {
    return tel && tel.slice(3);
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
  'click .noprop': function(e,t) {
    e.stopImmediatePropagation();
  },
  'click': function(e,t) {
    t.showDetail.set(!t.showDetail.get());
  }
});
