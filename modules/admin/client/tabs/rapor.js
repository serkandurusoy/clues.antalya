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
    return _.reduce(Rezervasyon.find({durum:'dolu'}).fetch(), function(stats, rezervasyon){
      return {
        rez: stats.rez + 1,
        kisi: stats.kisi + rezervasyon.bilgiler.sayi,
        ciro: stats.ciro + rezervasyon.fiyat
      };
    }, {
      rez: 0,
      kisi: 0,
      ciro: 0
    });
  },
  future: function() {
    var bugun = moment(new Date(TimeSync.serverTime(null,5*60*1000))).format('YYYY-MM-DD');
    return _.reduce(Rezervasyon.find({durum:'dolu',tarih:{$gte: bugun}}).fetch(), function(stats, rezervasyon){
      return {
        rez: stats.rez + 1,
        kisi: stats.kisi + rezervasyon.bilgiler.sayi,
        ciro: stats.ciro + rezervasyon.fiyat
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
    var gun = moment(Rezervasyon.findOne({durum:'dolu'}) ? Rezervasyon.find({durum:'dolu'},{sort: {tarih: 1}, limit: 1}).fetch()[0].tarih : moment(new Date(TimeSync.serverTime(null,5*60*1000))).format('YYYY-MM-DD') ,'YYYY-MM-DD').subtract(1,'months');
    var end = moment(Rezervasyon.findOne({durum:'dolu'}) ? Rezervasyon.find({durum:'dolu'},{sort: {tarih: -1}, limit: 1}).fetch()[0].tarih: moment(new Date(TimeSync.serverTime(null,5*60*1000))).format('YYYY-MM-DD') ,'YYYY-MM-DD').add(2,'months');
    var aylar = [];

    while(gun.isBefore(end)) {
      aylar.push({ay: gun.format('MMM YYYY'), toplam: 0});
      gun.add(1,'months');
    }

    Rezervasyon.find({durum:'dolu'},{sort: {tarih: 1}}).forEach(function(rez){
      var ayRez = moment(rez.tarih,'YYYY-MM-DD').format('MMM YYYY');
      _.map(aylar,function(ay) {
        if (ay.ay === ayRez) {
          ay.toplam = ay.toplam + 1;
        }
        return ay;
      });
    });

    var data = {
      labels : _.pluck(aylar,'ay'),
      datasets : [
        {
          fillColor : "rgba(49,134,193, 0.7)",
          strokeColor : "rgba(49,134,193, 0.7)",
          pointColor: "#f0f0f0",
          pointStrokeColor: "#2A699E",
          pointHighlightFill: "#2A699E",
          pointHighlightStroke: "#2A699E",
          data : _.pluck(aylar,'toplam')
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

