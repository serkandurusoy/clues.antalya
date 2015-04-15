Template.adminLayout.onCreated(function(){
  this.tabState = new ReactiveVar('one');
});

Template.adminLayout.helpers({
  selectedTab: function(tab) {
    return Template.instance().tabState.get() === tab ? 'selectedTab' : null;
  },
  connected: function(){
    return Session.equals('status','connected');
  }
});

Template.adminLayout.events({
  'click .tab': function(e,t) {
    if (!_.contains(e.target.classList, 'selectedTab')) {
      t.tabState.set(e.target.id);
    }
  }
});
