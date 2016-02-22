var map;
var app = {};
app.toDate = new Date().toISOString().substring(0, 10);
app.monthArray = [" ", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
app.searchText = "";
app.dateText = "tonight";
app.bandsIn1Ret = 0;
app.bandsIn2NextDate = 0;
app.bandsIn2Lat = 0;
app.bandsIn2Long = 0;
app.venueName = "";
app.venueCity = "";
app.venueLocation = "";
app.venueCountry = "";
app.ticketLink = "";

app.init = function() {
  app.lookFor();
  };

app.initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 7
    });
    $('#summary, #tourInfo').hide();
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(initialLocation);
    }, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  } else {
    browserSupportFlag = false;
  }
};

app.placeMarker = function() {
     var marker = new google.maps.Marker({
          position: {
            lat: app.bandsIn2Lat,
            lng: app.bandsIn2Long
          },
          map: map,
          animation: google.maps.Animation.DROP,
          title: app.venueName
        })   
        map.panTo(marker.position);  
      };

app.placeValues = function(bandReturn) {
    app.bandsIn2NextDate = bandReturn[0].datetime.slice(0,10);
    app.venueName = bandReturn[0].venue.name;
    app.venueCity = bandReturn[0].venue.city;
    app.venueLocation = bandReturn[0].venue.city + ', ' + bandReturn[0].venue.region;
    app.venueCountry = bandReturn[0].venue.country;
    app.bandsIn2Lat = bandReturn[0].venue.latitude;
    app.bandsIn2Long = bandReturn[0].venue.longitude; 
    app.ticketLink = '<a href="'+bandReturn[0].ticket_url+'">'+bandReturn[0].ticket_status+'</a>';
};

app.placeText = function() {
  if (app.bandsIn1Ret == 0) {
    $('main h2').html('Looks like ' + app.searchText+ ' isn\'t on tour right now. Try another search!');
    $('main h2').slideDown();
    $('body, html').animate({ scrollTop: $("#searchForm").offset().top }, 1000);
    $('.insertName, .insertCityRegion, .insertCountry, .insertTickets, #tourInfo').html("");
  } else {
    $('main h2').html(app.searchText + ' is playing in ' + app.venueCity + ', '+ app.venueCountry + ' ' + app.dateText);
    $('main h2').slideDown();
    $('body, html').animate({ scrollTop: $("#searchForm").offset().top }, 1000);
    $('.insertName').html(app.venueName);
    $('.insertCityRegion').html(app.venueLocation);
    $('.insertCountry').html(app.venueCountry);
    $('.insertTickets').html(app.ticketLink);
    $('#tourInfo').html("<h3>Next Stops</h3><ul></ul>");
    $('#summary, #tourInfo').slideDown();
    google.maps.event.trigger(document.getElementById('map'), 'resize');
    google.maps.event.addListenerOnce(map, 'idle', function() {
       google.maps.event.trigger(document.getElementById('map'), 'resize');
       map.setCenter({lat:app.bandsIn2Lat,lng:app.bandsIn2Long});
    });
  }
};
//JQUERY FOR SUBMIT BUTTON GRAB TEXT
app.lookFor = function() {
  $('#searchForm').on('submit', function(e) {
    e.preventDefault();
    $('main h2').slideUp();
    $('#summary').slideUp();
    app.searchText = $( "input[name=search]" ).val();
    var bandPromise = $.ajax({
      url: 'http://api.bandsintown.com/artists/' + app.searchText + '.json',
      method: 'GET',
      dataType: 'jsonp',
      data: {     
          app_id: 'Adam'
      }
      }) //end bandpromise

  $.when(bandPromise).then(function(thingBack) {
    app.bandsIn1Ret = thingBack.upcoming_events_count;
    app.placeText();
    app.bandsIn2(app.searchText);
      //   }
      })
    });
  };//end of lookfor

app.bandsIn2 = function(band) { 
    $.ajax({
      url: 'http://api.bandsintown.com/artists/' + band + '/events.json' ,
      method: 'GET',
      dataType: 'jsonp',
      data: {
        app_id: 'Adam'
      }
  }).then(function(res) {
      app.placeValues(res);
      app.placeMarker();
      if (app.toDate === app.bandsIn2NextDate) {
        app.dateText = "tonight!"
      } else {
        var split = app.bandsIn2NextDate.split('-');
        var finalMonth = split[1];
        var finalMonthP = parseInt(finalMonth, 10);
        var finalMonthText = app.monthArray[finalMonthP];
        app.dateText = ('on ' + finalMonthText + ' ' + split[2]);
    }//end else
    app.placeText();
    $(res).slice(1).each(function(i, place) {
      var bDate = $('<p>').addClass("left").text(place.datetime.slice(0,10));
      var bName = $('<p>').addClass("right").text(place.venue.city + ', ' + place.venue.country);
      var tourDate = $('<li>').append(bDate,bName);
      $('#tourInfo ul').append(tourDate);
    });
  })
}; //end of bandsin2

$(function() {
  app.init();
  app.initMap();
});