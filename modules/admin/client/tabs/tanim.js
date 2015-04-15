Template.tabtanim.helpers({
  fkampanya: function() {
    return Fiyatlar.findOne({tip: 'kampanya'});
  },
  fgece: function() {
    return Fiyatlar.findOne({tip: 'gece'});
  },
  fgun2: function() {
    return Fiyatlar.findOne({tip: 'gun2'});
  },
  fgun3: function() {
    return Fiyatlar.findOne({tip: 'gun3'});
  },
  fgun4: function() {
    return Fiyatlar.findOne({tip: 'gun4'});
  },
  fgun5: function() {
    return Fiyatlar.findOne({tip: 'gun5'});
  }
});

Template.tabtanim.events({
  'change input, blur input, keyup input': function(e,t) {
    var tip = e.target.id.slice(1);
    var fiyat = parseInt(e.target.value);
    var $el = t.$('#'+e.target.id);
    var test = Match.test(fiyat,Match.Integer) && 50 <= fiyat && fiyat <= 500 ;
    if (!test) {
      $el.addClass('error');
    } else {
      $el.removeClass('error');
      Meteor.call('Fiyat.update',tip,fiyat);
    }
  }
});
