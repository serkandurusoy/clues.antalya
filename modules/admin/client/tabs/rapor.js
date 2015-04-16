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

Template.tabrapor.helpers({
  stats: function() {
    return _.reduce(Musteriler.find().fetch(), function(stats, musteri){
      return {
        rez: stats.rez+musteri.rez,
        kisi: stats.kisi+musteri.kisi,
        ciro: stats.ciro+musteri.ciro
      };
    }, {
      rez: 0,
      kisi: 0,
      ciro: 0
    });
  }
});

Template.tipKirilimiAdet.onRendered(function(){
  this.autorun(function() {
    var data = {
      labels : ["Normal","Kampanyalı","Gece"],
      datasets : [
        {
          fillColor : "rgba(49,134,193, 0.7)",
          strokeColor : "rgba(49,134,193, 0.7)",
          highlightFill: "#2A699E",
          highlightStroke: "#2A699E",
          data : [
            Rezervasyon.find({tip:'Normal',saat:{$ne: '00:30'},durum:'dolu'}).count(),
            Rezervasyon.find({tip:'Kampanyalı',durum:'dolu'}).count(),
            Rezervasyon.find({saat:'00:30',durum:'dolu'}).count()
          ]
        }
      ]
    };
    var ctx = document.getElementById("tipKirilimiAdet").getContext("2d");
    window.tipKirilimiAdetChart = new Chart(ctx).Bar(data, {
      responsive : true,
      scaleBeginAtZero: true,
      barShowStroke: false,
      tooltipFillColor: "rgba(0,0,0,0.9)",
      tooltipFontFamily: "'Open Sans', sans-serif",
      tooltipFontSize: 12,
      tooltipTitleFontStyle: "normal",
      tooltipTitleFontColor: "#fff"
    });
  });
});

Template.tipKirilimiCiro.onRendered(function(){
  this.autorun(function() {
    var data = {
      labels : ["Normal","Kampanyalı","Gece"],
      datasets : [
        {
          fillColor : "rgba(49,134,193, 0.7)",
          strokeColor : "rgba(49,134,193, 0.7)",
          highlightFill: "#2A699E",
          highlightStroke: "#2A699E",
          data : [
            _.reduce(Rezervasyon.find({tip:'Normal',saat:{$ne: '00:30'},durum:'dolu'}).fetch(), function(ciro,rez){return ciro+rez.fiyat},0),
            _.reduce(Rezervasyon.find({tip:'Kampanyalı',durum:'dolu'}).fetch(), function(ciro,rez){return ciro+rez.fiyat},0),
            _.reduce(Rezervasyon.find({saat:'00:30',durum:'dolu'}).fetch(), function(ciro,rez){return ciro+rez.fiyat},0)
          ]
        }
      ]
    };
    var ctx = document.getElementById("tipKirilimiCiro").getContext("2d");
    window.tipKirilimiCiroChart = new Chart(ctx).Bar(data, {
      responsive : true,
      scaleBeginAtZero: true,
      barShowStroke: false,
      tooltipFillColor: "rgba(0,0,0,0.9)",
      tooltipFontFamily: "'Open Sans', sans-serif",
      tooltipFontSize: 12,
      tooltipTitleFontStyle: "normal",
      tooltipTitleFontColor: "#fff"
    });
  });
});

Template.aylikRezervasyonGelisimi.onRendered(function(){
  this.autorun(function() {
    var data = {
      labels : ["Ocak","Şubat","Mart","Nisan"],
      datasets : [
        {
          fillColor : "rgba(49,134,193, 0.7)",
          strokeColor : "rgba(49,134,193, 0.7)",
          pointColor: "#f0f0f0",
          pointStrokeColor: "#2A699E",
          pointHighlightFill: "#2A699E",
          pointHighlightStroke: "#2A699E",
          data : [
            13,
            18,
            21,
            16
          ]
        }
      ]
    };
    var ctx = document.getElementById("aylikRezervasyonGelisimi").getContext("2d");
    window.aylikRezervasyonGelisimiChart = new Chart(ctx).Line(data, {
      responsive : true,
      scaleBeginAtZero: true,
      datasetStroke: false,
      datasetStrokeWidth: 0,
      tooltipFillColor: "rgba(0,0,0,0.9)",
      tooltipFontFamily: "'Open Sans', sans-serif",
      tooltipFontSize: 12,
      tooltipTitleFontStyle: "normal",
      tooltipTitleFontColor: "#fff",
      bezierCurve: false
    });
  });
});

