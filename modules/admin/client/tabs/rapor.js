Template.tabrapor.events({
  'click .downRez': function () {
    Meteor.call('downloadExcelFileRez', function(err, fileUrl) {
      var link = document.createElement("a");
      link.download = 'rezervasyonlar.xlsx';
      link.href = fileUrl;
      link.id='silbeniRez';
      link.class='sakla';
      link.target='_blank';
      document.body.appendChild(link);
      link.click();
      Meteor.setTimeout(function(){document.body.removeChild(document.getElementById('silbeniRez'));}, 0);
    });
  },
  'click .downMus': function () {
    Meteor.call('downloadExcelFileMus', function(err, fileUrl) {
      var link = document.createElement("a");
      link.download = 'musteriler.xlsx';
      link.href = fileUrl;
      link.id='silbeniMus';
      link.class='sakla';
      link.target='_blank';
      document.body.appendChild(link);
      link.click();
      Meteor.setTimeout(function(){document.body.removeChild(document.getElementById('silbeniMus'));}, 0);
    });
  }
});
