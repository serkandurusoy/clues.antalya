Template.rezervasyon.helpers({
  fiyatGece: function() {
    return Fiyatlar.findOne({tip: 'gece'}).fiyat;
  },
  fiyatKampanya: function() {
    return Fiyatlar.findOne({tip: 'kampanya'}).fiyat;
  },
  fiyatGun2: function() {
    return Fiyatlar.findOne({tip: 'gun2'}).fiyat;
  },
  fiyatGun3: function() {
    return Fiyatlar.findOne({tip: 'gun3'}).fiyat;
  },
  fiyatGun4: function() {
    return Fiyatlar.findOne({tip: 'gun4'}).fiyat;
  },
  fiyatGun5: function() {
    return Fiyatlar.findOne({tip: 'gun5'}).fiyat;
  },
});
