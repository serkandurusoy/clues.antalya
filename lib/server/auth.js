ServiceConfiguration.configurations.upsert(
  {service: 'google'},
  {
    $set: {
      clientId: '572836985769-c5eegngogdqpa0ciihkitg2eu74t6b8t.apps.googleusercontent.com',
      secret: '2I7ljhj1_EgUX_2cjYW68sHE'
    }
  }
);

var checkEmailAgainstAllowed = function(email) {
  var allowedDomains = ['cluesantalya.com'];
  var allowedEmails = ['cluesantalya@gmail.com','serkan.durusoy@dna-tr.com'];
  var domain = email.replace(/.*@/,'').toLowerCase();
  email = email.toLowerCase();
  return _.contains(allowedEmails, email) || _.contains(allowedDomains, domain);
};

Accounts.config({
    loginExpirationInDays: 1,
    restrictCreationByEmailDomain: function(email) {
      if (!email) {
        throw new Meteor.Error(403,'Giriş yapmak içi kayıtlı bir eposta adresi gerekli');
      }
      if (!checkEmailAgainstAllowed(email)) {
        throw new Meteor.Error(403,'Giriş yapmak için clues antalya eposta adresi gerekli');
      }
      return true;
    }
  }
);

Accounts.validateLoginAttempt(function(attempt) {
  var ip = attempt && attempt.connection && attempt.connection.clientAddress;
  if (!attempt.allowed) {
    return false;
  }

  if (testIp(ip) && !AdminIp.findOne({ip:ip})) {
    AdminIp.insert({ip: ip});
  }
  return true;
});

Meteor.users.deny({
  update: function() {
    return true;
  }
});
