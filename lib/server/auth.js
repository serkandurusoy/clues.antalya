ServiceConfiguration.configurations.upsert(
  {service: 'google'},
  {
    $set: {
      clientId: 'deprecated',
      secret: 'deprecated'
    }
  }
);

var checkEmailAgainstAllowed = function(email) {
  var allowedDomains = ['cluesantalya.com'];
  var allowedEmails = ['cluesantalya@gmail.com','serkan.durusoy@dna-tr.com','ustaselman@gmail.com','morpalyaco@gmail.com'];
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
