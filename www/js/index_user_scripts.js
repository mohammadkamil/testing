/*jshint browser:true */
/*global $ */
var map, deamon, serloop;
var xhr;
var loop = 0;
var pause = true;
var masa = [];
var markers = [];
var latLocation, lngLocation;
//var host = "http://localhost/bustrackingsystem/";
var host = "http://slumberjer.com/bustrackerXDK/";
var getlocation = host + "getLocation.php";
var getlocationbyID = host + "getLocationByID.php";
var locationBus;
var center;
var content;
var arrayContent = [];
var markerids;
var time2, infowindow;
(function () {
    "use strict";
    //    document.addEventListener("deviceready", onDeviceReady, false);
    /*
      hook up event handlers 
    */
    function register_event_handlers() {
//        navigator.notification.vibrate(3000);
//        navigator.notification.beep(3);
//        
        var xhr = new XMLHttpRequest();

        xhr.open("GET", getlocation, false);
        xhr.onload = function () {
            if (xhr.status == 200) {
                locationBus = JSON.parse(xhr.responseText);

                GMaps.geolocate({
                    success: function (position) {
                        center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        latLocation = position.coords.latitude;
                        lngLocation = position.coords.longitude;
                        var mapOptions = {
                            center: center,
                            zoom: 15,

                        };

                        map = new google.maps.Map(document.getElementById("map"), mapOptions);

                        userLocation();

                        for (var id = 0; id < locationBus.length; id++) {
                            // InfoWindow content
                            busLocation(locationBus[id].latitude, locationBus[id].longitude, locationBus[id].driverRoute, latLocation, lngLocation, locationBus[id].busID);


                        }


                        //Set unique
                        map.setCenter(position.coords.latitude, position.coords.longitude);
                        //
                        $.ajax({
                            success: function () {
                                daemon = setInterval(function () {
                                    if (pause) {
                                        $.ajax({
                                            type: "POST",
                                            url: getlocation,
                                            success: function (data) {
                                                locationBus = JSON.parse(data);
                                                //markers=null;

                                                for (var demarker = 0; demarker < markers.length; demarker++) {
                                                    markers[demarker].setMap(null);

                                                }
                                                for (var de = 0; de < locationBus.length; de++) {
                                                    loop++;

                                                    busLocation(locationBus[de].latitude, locationBus[de].longitude, locationBus[de].driverRoute, latLocation, lngLocation, locationBus[de].busID);

                                                }

                                            },
                                        });
                                    }

                                }, 3000);

                            }
                        });
                    },
                    error: function (error) {
                        alert('Geolocation failed: ' + error.message);
                    },
                    not_supported: function () {
                            alert("Your browser does not support geolocation");
                        }
                        //            ,
                        //            always: function () {
                        //                alert("Done!");
                        //            }
                });

            }
        };
        xhr.send();


        /* button  Button */
        $(document).on("click", ".uib_w_3", function (evt) {

            return false;
        });

    }

    function onDeviceReady() {

        cordova.plugins.backgroundMode.setDefaults({
            text: 'Bus Tracking'
        });
        // Enable background mode
        cordova.plugins.backgroundMode.enable();

        // Called when background mode has been activated
        cordova.plugins.backgroundMode.onactivate = function () {
            setTimeout(function () {
                // Modify the currently displayed notification
                cordova.plugins.backgroundMode.configure({
                    text: 'Bus Tracking on Background'
                });
            }, 5000);
        };
    }
    //    document.addEventListener('push-notification', function(event) {
    //  var notification = event.notification;
    //  // handle push open here
    //});
    // Wait for Cordova to connect with the device
    document.addEventListener("app.Ready", onDeviceReady, false);
    document.addEventListener("app.Ready", register_event_handlers, false);
})();

function userLocation() {
    content = "<h1>You Here</h1>";

    // A new Info Window is created and set content
    var infowindow = new google.maps.InfoWindow({
        content: content,

        // Assign a maximum value for the width of the infowindow allows
        // greater control over the various content elements
        maxWidth: 350
    });

    // marker options
    var marker = new google.maps.Marker({
        position: center,
        map: map,
        title: "you here"
    });
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });

    // Event that closes the Info Window with a click on the map
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });
}

function busLocation(buslat, buslng, busRoute, desLat, desLng, markerid) {
    //alert(getTime(latLocation,lngLocation,buslat,buslng));

    var origin1 = new google.maps.LatLng(buslat, buslng);
    var destinationA = new google.maps.LatLng(desLat, desLng);

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin1],
        destinations: [destinationA],
        travelMode: 'DRIVING',

    }, callback1);

    function callback1(response, status) {
        masa[markerid] = response.rows[0].elements[0].duration.text;

        arrayContent[markerid] = "<table><tr><td>Route</td><td>:</td><td>" + busRoute + "</td></tr><tr><td>Time Arrival</td><td>:</td><td>" + masa[markerid] + "</td></tr></table><select id='minute'><option value=2>2 minute</option><option value=4>4 minute</option><option value=6>6 minute</option></select><br><button onclick='myFunction(" + markerid + ")'>Notfy Me</button>";
        // marker options
        var marker = new google.maps.Marker({
            id: markerid,
            position: origin1,
            map: map,
            title: "you here"
        });


        google.maps.event.addListener(marker, 'click', function () {
            markerids = markerid;
            //          time2= response.rows[0].elements[0].duration.text;
            if (pause === true) {

                // A new Info Window is created and set content
                infowindow = new google.maps.InfoWindow({
                    content: arrayContent[markerid],

                    // Assign a maximum value for the width of the infowindow allows
                    // greater control over the various content elements
                    maxWidth: 350
                });
                infowindow.open(map, marker);
                pause = false;
            } else {
                pause = true;
                infowindow.close();
            }

        });

        // Event that closes the Info Window with a click on the map
        google.maps.event.addListener(map, 'click', function () {

            pause = true;
            infowindow.close();
        });
        markers.push(marker);
    }
}

function busLocationtime(buslati, buslong, desLati, desLong) {
    //alert(getTime(latLocation,lngLocation,buslat,buslng));

    var origin1 = new google.maps.LatLng(buslati, buslong);
    var destinationA = new google.maps.LatLng(desLati, desLong);

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [origin1],
        destinations: [destinationA],
        travelMode: 'DRIVING',

    }, callback1);

    function callback1(response, status) {
        masa[markerid] = response.rows[0].elements[0].duration.text;


    }
}

function myFunction(busid) {
    //alert(markers[sad-1].position);
    var minutess = $("#minute").val();
    var split = masa[busid].split(" ");
    $.ajax({
        success: function () {
            serloop = setInterval(function () {

                var param = "busid=" + busid;

                var xmlhttp = new XMLHttpRequest();

                xmlhttp.open("POST", getlocationbyID, false);

                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                        var reallocbus = JSON.parse(xmlhttp.responseText);
                        var origin1 = new google.maps.LatLng(reallocbus[0].latitude, reallocbus[0].longitude);
                        var destinationA = new google.maps.LatLng(latLocation, lngLocation);

                        var service = new google.maps.DistanceMatrixService();
                        service.getDistanceMatrix({
                            origins: [origin1],
                            destinations: [destinationA],
                            travelMode: 'DRIVING',

                        }, callback);


                    }
                };
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlhttp.send(param);


            }, 3000);

        }
    });
    if (minutess <= split[0]) {
        alert("masok");
    } else {
        alert("Please choose diffrent time to notify");
    }
    //    split[0] = (parseInt(split[0]) - 2) * 60 * 1000;
    //    setTimeout(function () {
    //
    //        cordova.plugins.notification.local.schedule({
    //
    //            title: "Your Bus will arive in 2 minutes",
    //            text: "Please wait at Bus Stop",
    //        });
    //
    //        cordova.plugins.notification.local.on("click", function (notification) {
    //
    //            activate_subpage("#mainpage");
    //
    //        });
    //    }, split[0]);

}

function callback(response, status) {
    var timearrive = response.rows[0].elements[0].duration.text;
    timearrive = timearrive.split(" ");
    if (minutess <= timearrive[0]) {
//        navigator.notification.vibrate(3000);
//        navigator.notification.beep(3);
        cordova.plugins.notification.local.schedule({

            title: "Your Bus will arive in 2 minutes",
            text: "Please wait at Bus Stop",
        });

        cordova.plugins.notification.local.on("click", function (notification) {

            activate_subpage("#mainpage");

        });
    }
}