var sizeDep = new Tracker.Dependency();

var markers = {};

var setMarker = function() {
  GoogleMaps.ready('map', function (map) {
    var marker = new google.maps.Marker({
      draggable: false,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(36.886286, 30.708304),
      map: map.instance,
      icon: '/kuzgun.png',
      id: 'cluesantalya'
    });
    markers.cluesantalya = marker;
  });
};

var clearMarker = function() {
  markers && markers.cluesantalya && markers.cluesantalya.setMap(null);
};


Template.iletisim.helpers({
  mapOptions: function () {
    sizeDep.depend();
    if (GoogleMaps.loaded()) {
      return {
        center: new google.maps.LatLng(36.886286, 30.708304),
        zoom: 16,
        styles: [
          {
            'featureType': 'road.local',
            'stylers': [
              {'visibility': 'on'},
              {'lightness': 20}
            ]
          }, {
            'stylers': [
              {'saturation': -100},
              {'lightness': -10}
            ]
          }
        ]
      };
    }
  }
});

Template.iletisim.onCreated(function () {

  $(window).resize(function() {
    clearMarker();
    sizeDep.changed();
    setMarker();
  });

  setMarker();

});

