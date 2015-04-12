Meteor.startup(function(){
  Rezervasyon._ensureIndex({tarih: 1, saat: 1, durum: 1}, {unique: 1});
  Fiyatlar._ensureIndex({tip: 1}, {unique: 1});
  Parametreler._ensureIndex({isim: 1}, {unique: 1});
  Musteriler._ensureIndex({isim: 1}, {unique: 1});
  Musteriler._ensureIndex({eposta: 1}, {unique: 1});
  Musteriler._ensureIndex({telefon: 1}, {unique: 1});
  Musteriler._ensureIndex({rez: -1});
  Musteriler._ensureIndex({kisi: -1});
  Musteriler._ensureIndex({ciro: -1});
  AdminIp._ensureIndex({ip: 1});
});
