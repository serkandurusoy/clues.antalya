Meteor.publish('takvimdata', function() {
  var begin = moment().format('YYYY-MM-DD');
  var end = moment().add(32,'days').format('YYYY-MM-DD');
  return Rezervasyon.find({$and: [ {tarih: {$gte: begin}}, {tarih: {$lte: end}} ]}, {fields: {tarih: 1, saat: 1, durum: 1, ip: 1, conn: 1}});
});

Meteor.publish('fiyatdata', function() {
  return Fiyatlar.find();
});

Meteor.publish('parametredata', function() {
  return Parametreler.find();
});

Meteor.publish('adminipdata', function() {
  return AdminIp.find();
});

Meteor.publish('takvimdataFull', function() {
  if (this.userId) {
    return Rezervasyon.find();
  } else {
    this.ready();
  }
});

Meteor.publish('musterilerdata', function() {
  if (this.userId) {
    return Musteriler.find();
  } else {
    this.ready();
  }
});
