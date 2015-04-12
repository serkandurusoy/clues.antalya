Template.login.events({
  'click [data-target="login"]': function(){
    Meteor.loginWithGoogle({
      loginStyle         : "redirect",
      requestPermissions : ['profile', 'email'],
      requestOfflineToken: true
    });
  }
});
