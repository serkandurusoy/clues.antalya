Meteor.methods({
  'serverTime': function() {
    return Date.now();
  }
});
