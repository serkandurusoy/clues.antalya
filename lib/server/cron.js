SyncedCron.options = {
  log: true,
  collectionName: 'cronHistory',
  utc: false,
  collectionTTL: 31536000
};

Meteor.startup(function() {
  SyncedCron.start();
});
