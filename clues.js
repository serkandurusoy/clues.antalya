if (Meteor.isClient) {
  Template.home.helpers({
    connected: function(){
      return Session.equals('status','connected');
    }
  });
}
