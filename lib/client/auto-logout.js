Meteor.startup(function(){
  $(window).bind('beforeunload', function() {
    closingWindow();
  });
});

closingWindow = function(){
  Meteor.logout();
}
