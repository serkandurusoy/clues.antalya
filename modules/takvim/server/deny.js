var collections = [
  'Rezervasyon',
  'Fiyatlar',
  'Parametreler',
  'Musteriler',
  'AdminIp'
];

_.each(collections, function(collection) {
  var col = global[collection];
  col.allow({
    insert: function() {
      return false;
    },
    update: function() {
      return false;
    },
    remove: function() {
      return false;
    }
  });
  col.deny({
    insert: function() {
      return true;
    },
    update: function() {
      return true;
    },
    remove: function() {
      return true;
    }
  });
});
