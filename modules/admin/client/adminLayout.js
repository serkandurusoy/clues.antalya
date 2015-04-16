Template.adminLayout.onCreated(function(){
  this.tabState = new ReactiveVar('one');
});

Template.adminLayout.helpers({
  selectedTab: function(tab) {
    return Template.instance().tabState.get() === tab ? 'selectedTab' : null;
  }
});

Template.adminLayout.events({
  'click .tab': function(e,t) {
    if (!_.contains(e.target.classList, 'selectedTab')) {
      t.tabState.set(e.target.id);
    }
  }
});

Template.rezervasyonlar.helpers({
  connected: function(){
    return Session.equals('status','connected');
  }
});
