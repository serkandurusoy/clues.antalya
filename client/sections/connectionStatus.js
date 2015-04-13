Meteor.startup(function() {
  Meteor.autorun(function () {
    var stat;
    if (Meteor.status().status === "connected") {
      stat = 'connected'
    }
    else if (Meteor.status().status === "connecting") {
      stat = 'connecting'
    }
    else {
      stat = 'disconnected';
    }
    Session.set('status',stat);
  });
});
