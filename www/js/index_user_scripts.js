/*jshint browser:true */
/*global $ */
var map, daemon, serloop;
var xhr;
var loop = 0;
var pause = true;
var masa = [];
var markers = [];
var usermarkers = [];
var latLocation, lngLocation;
//var host = "http://localhost/bustrackingsystem/";
var host = "http://slumberjer.com/bustrackerXDK/";
var hostGambar = "http://slumberjer.com/bustrackerXDK/image/MissingItem/";
var getlocation = host + "getLocation.php";
var getlocationbyID = host + "getLocationByID.php";
var getlocationbyroute = host + "getLocationbyRoute.php";
var reportMissingItem = host + "reportMissingItem.php";
var reportComplaint = host + "reportComplaint.php";
var getMissingItem = host + "getMissingItem.php";
var getComplaint = host + "getComplaint.php";
var getInfoBus = host + "getInfoBus.php";
var locationBus;
var center;
var content;
var arrayContent = [];
var markerids;
var time2, infowindow;
var pictureSource; // picture source
var destinationType; // sets the format of returned value
var imageID;
var minutess; //time from user to notify them
var imageBusA = {
    url: 'http://slumberjer.com/bustrackerXDK/image/BusMarkerA.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var imageBusB = {
    url: 'http://slumberjer.com/bustrackerXDK/image/BusMarkerB.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var imageBusC = {
    url: 'http://slumberjer.com/bustrackerXDK/image/BusMarkerC.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var imageBusD = {
    url: 'http://slumberjer.com/bustrackerXDK/image/BusMarkerD.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var imageBusE = {
    url: 'http://slumberjer.com/bustrackerXDK/image/BusMarkerE.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var imageBusMay = {
    url: 'http://slumberjer.com/bustrackerXDK/image/BusMarkerMay.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var imageBus;
var imageUser = {
    url: 'http://slumberjer.com/bustrackerXDK/image/passenger.png', // image is 512 x 512
    scaledSize: new google.maps.Size(30, 32),
};
var missRouteP, MissDateP, MissTimeP, MissfromP, MisstypeP, MissContactP; //report missing item variable
var comNoMatric = null,
    comRoute = null,
    comDate = null,
    comTime = null,
    complaintreport = null,
    comEmail = null;
var temp;

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
        startapp();
        /* button  #menu */

        $(document).on("click", "#menu", function (evt) {
            /*global uib_sb */
            /* Other possible functions are: 
              uib_sb.open_sidebar($sb)
              uib_sb.close_sidebar($sb)
              uib_sb.toggle_sidebar($sb)
               uib_sb.close_all_sidebars()
             See js/sidebar.js for the full sidebar API */
            uib_sb.toggle_sidebar($("#slidemenu"));
            return false;
        });

        /* button  #slideExit */
        $(document).on("click", "#slideExit", function (evt) {
            /* your code goes here */
            uib_sb.toggle_sidebar($("#slidemenu"));
            return false;
        });

        /* button  #slideBus */
        $(document).on("click", "#slideBus", function (evt) {
            /* Other options: .modal("show")  .modal("hide")  .modal("toggle")
            See full API here: http://getbootstrap.com/javascript/#modals 
               */
            uib_sb.toggle_sidebar($("#slidemenu"));
            $(".uib_w_12").modal("toggle");
            return false;
        });

        /* button  #slideMissing */
        $(document).on("click", "#slideMissing", function (evt) {
            /*global activate_subpage */
            uib_sb.toggle_sidebar($("#slidemenu"));
            $("#btnCamera").show();
            $("#btnBrowse").hide();
            $("#misscontact").show();
            $("#btnreport").hide();
            $("#btnreport2").show();

            $("#missDate").val(moment().format('YYYY-MM-DD'));
            $("#missTime").val(moment().format("HH:mm"));
            activate_subpage("#reportmissingitem");
            return false;
        });

        /* button  #btnBrowse */
        $(document).on("click", "#btnBrowse", function (evt) {

            getPhoto(Camera.PictureSourceType.PHOTOLIBRARY);
            return false;
        });



        /* button  #btnAduansub */
        $(document).on("click", "#btnAduansub", function (evt) {
            /* your code goes here */
            bootbox.confirm({
                title: "Comfirmation Report?",
                message: "Do you want to submit Report",
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> Cancel'
                    },
                    confirm: {
                        label: '<i class="fa fa-check"></i> Confirm'
                    }
                },
                callback: function (result) {
                    comNoMatric = $("#comNoMatric").val();
                    comRoute = $("#comRoute").val();
                    comDate = $("#comDate").val();
                    comTime = $("#comTime").val();
                    complaintreport = $("#complaintreport").val();
                    comEmail = $("#comEmail").val();

                    if (result === true) {
                        if (comNoMatric !== "" && comRoute !== "" && comDate !== "" && comTime !== "" && complaintreport !== "") {
                            if (checkEmail(comEmail) === true && checkNumberLenght(comNoMatric) === true) {
                                if (localStorage.getItem("emailPassenger") === null) {
                                    localStorage.setItem("emailPassenger", comEmail);
                                }

                                $.ajax({
                                    //Getting the url of the uploadphp from action attr of form 
                                    //this means currently selected element which is our form 
                                    url: reportComplaint,

                                    //For file upload we use post request
                                    type: "POST",

                                    //Creating data from form 
                                    data: {
                                        nomatric: comNoMatric,
                                        comroute: comRoute,
                                        comdate: comDate,
                                        comtime: comTime,
                                        comemail: comEmail,
                                        complaint: complaintreport

                                    },

                                    //Setting these to false because we are sending a multipart request
                                    contentType: "application/x-www-form-urlencoded",
                                    cache: false,
                                    //processData: false,
                                    success: function (data) {
                                       
                                        $("#comNoMatric").val("");
                                        $("#comRoute").val("");
                                        $("#comDate").val(moment().format('YYYY-MM-DD'));
                                        $("#comTime").val(moment().format("HH:mm"));
                                        $("#complaintreport").val("");
                                        $("#comEmail").val("");
                                        bootbox.alert(JSON.parse(data));
                                    },
                                    error: function () {}
                                });
                            }

                        } else {

                            bootbox.alert("Please fill in Form");
                        }
                    }

                }

            });

            return false;
        });

        /* button  #btnSelectRoute */
        $(document).on("click", "#btnSelectRoute", function (evt) {
            if (pause) {
                pause = false;
            } else {
                pause = true;
            }

            clearInterval(daemon);
            $(".uib_w_12").modal("toggle");

            for (var demarker = 0; demarker < markers.length; demarker++) {
                markers[demarker].setMap(null);

            }
            usermarkers[0].setMap(null);
               
            var routre = $("#selectRoute").val();
            viewbusbyRoute(routre);
            return false;
        });
        $("#misstype").on("change", function () {
            if ($(this).val() != 'Found') {
                $("#btnCamera").hide();
                $("#btnBrowse").show();
                $("#misscontact").hide();
                $("#btnreport").show();
                $("#btnreport2").hide();

            } else {
                $("#btnBrowse").hide();
                $("#btnCamera").show();
                $("#misscontact").show();
                $("#btnreport").hide();
                $("#btnreport2").show();
            }
        });
        /* button  #slideInfo */
        $(document).on("click", "#slideInfo", function (evt) {
            /*global activate_subpage */
            uib_sb.toggle_sidebar($("#slidemenu"));
            $.ajax({
                //Getting the url of the uploadphp from action attr of form 
                //this means currently selected element which is our form 
                url: getInfoBus,

                //For file upload we use post request
                type: "POST",


                //Setting these to false because we are sending a multipart request
                contentType: "application/x-www-form-urlencoded",
                cache: false,
                //processData: false,
                success: function (data) {
                    var infoData = JSON.parse(data);
                    activate_subpage("#infobus");
                    if (infoData.length > 0) {
                        $("#listinfobus").empty();
                        $.each(infoData, function (i, results) {

                            temp = $('<a class="list-group-item allow-badge widget uib_w_50" data-uib="twitter%20bootstrap/list_item" data-ver="1"><h4 class="list-group-item-heading">' + results.infobusTitle + '</h4></a>');
                            temp.click(function () {
                                $("#infobusdetail").html("<table><tr><td>Title </td><td>: </td><td> " + results.infobusTitle + "</td></tr><tr><td>Date Start </td><td>: </td><td> " + results.dateStart + "</td></tr><tr><td>Date End </td><td>: </td><td> " + results.dateEnd + "</td></tr><tr><td>Message </td><td>: </td><td> " + results.infoMessage + "</td></tr></table>");
                                activate_subpage("#displayInfoDetail");
                            });
                            $("#listinfobus").append(temp);
                        });

                    }


                },
                error: function () {}
            });

            return false;
        });



        /* button  #slideHome */
        $(document).on("click", "#slideHome", function (evt) {
            pause = true;
            /*global activate_subpage */
            uib_sb.toggle_sidebar($("#slidemenu"));
            clearInterval(daemon);
            for (var demarker = 0; demarker < markers.length; demarker++) {
                markers[demarker].setMap(null);

            }
            usermarkers[0].setMap(null);
            startapp();
            activate_subpage("#page_70_0");
            return false;
        });

        /* button  Report Complaint */
        $(document).on("click", ".uib_w_36", function (evt) {
            /*global activate_subpage */
            $("#comDate").val(moment().format('YYYY-MM-DD'));
            $("#comTime").val(moment().format("HH:mm"));
            uib_sb.toggle_sidebar($("#slidemenu"));
            activate_subpage("#aduan");
            return false;
        });

        /* button  #btnDISComplaint */
        $(document).on("click", "#btnDISComplaint", function (evt) {
            /*global activate_subpage */
            uib_sb.toggle_sidebar($("#slidemenu"));
            $.ajax({
                //Getting the url of the uploadphp from action attr of form 
                //this means currently selected element which is our form 
                url: getComplaint,

                //For file upload we use post request
                type: "POST",

                //Creating data from form 
                data: {
                    getEmail: localStorage.getItem("emailPassenger")

                },

                //Setting these to false because we are sending a multipart request
                contentType: "application/x-www-form-urlencoded",
                cache: false,
                //processData: false,
                success: function (data) {
                    var complaintData = JSON.parse(data);
                    $.each(complaintData, function (i, complaint) {
                        $("#disComplaint").empty();

                        if (complaint.comStatus == "new") {
                            temp = $('<li class="list-group-item justify-content-between" id="nocomplaint"><a><table><tbody><tr><td>Complainer </td><td>:</td><td>' + complaint.noMatric + '</td></tr><tr><td>Route</td><td>:</td><td>' + complaint.comRoute + '</td></tr><tr><td>Date</td><td>:</td><td>' + complaint.comDate + '</td></tr><tr><td>Time</td><td>:</td><td>' + complaint.comTime + '</td></tr><tr><td>Complaint</td><td>:</td><td>' + complaint.complaint + '</td></tr><tr><td>Status</td><td>:</td><td>Receive</td></tr></tbody></table></a></li>');
                        }

                        //                        temp.click(function () {
                        //                            $("#missIMG").attr("src", hostGambar + results.missIMG);
                        //                            $("#missDetail").html("<table><tr><td>Route </td><td>: </td><td> " + results.missRoute + "</td></tr><tr><td>Date repoty </td><td>: </td><td> " + results.missDate + "</td></tr><tr><td>Time report </td><td>: </td><td> " + results.missTime + "</td></tr><tr><td>From </td><td>: </td><td> " + results.missFrom + "</td></tr></table>");
                        //                            activate_subpage("#missingItemDetail");
                        //                        });
                        $("#disComplaint").append(temp);
                    });


                    activate_subpage("#displayComplaint");
                },
                error: function () {}
            });

            return false;
        });

        /* button  #btnMissItem */
        $(document).on("click", "#btnMissItem", function (evt) {
            var xhr = new XMLHttpRequest();
            uib_sb.toggle_sidebar($("#slidemenu"));
            //xhr.open("GET", "data.json", false);
            xhr.open("GET", getMissingItem, false);
            xhr.onload = function () {

                if (parseInt(xhr.status) == 200) {

                    var json_string = JSON.parse(xhr.responseText);
                    if (json_string.length > 0) {
                        $("#ListMiss").empty();
                        $.each(json_string, function (i, results) {

                            temp = $('<li class="list-group-item justify-content-between" id="nomissitem"><a><table><tr><td style="width:20%;height:20%"><img src="' + hostGambar + results.missIMG + '" style="width:100%;">                      </td><td style="padding:0% 0% 0% 2%"><h4>Date ' + results.missType + ': ' + results.missDate + '</h4></td></tr></table></a></li>');

                            temp.click(function () {
                                $("#missIMG").attr("src", hostGambar + results.missIMG);
                                if (results.missContact === "null") {
                                    $("#missDetail").html("<table><tr><td>Route </td><td>: </td><td> " + results.missRoute + "</td></tr><tr><td>Date report </td><td>: </td><td> " + results.missDate + "</td></tr><tr><td>Time report </td><td>: </td><td> " + results.missTime + "</td></tr><tr><td>From </td><td>: </td><td sytle='padding-left:40%'> " + results.missFrom + "</td></tr><tr></table>");
                                } else {
                                    $("#missDetail").html("<table><tr><td>Route </td><td>: </td><td> " + results.missRoute + "</td></tr><tr><td>Date report </td><td>: </td><td> " + results.missDate + "</td></tr><tr><td>Time report </td><td>: </td><td> " + results.missTime + "</td></tr><tr><td>From </td><td>: </td><td sytle='padding-left:40%'> " + results.missFrom + "</td></tr><tr><td>Contact No. </td><td>:   </td><td> " + results.missContact + "</td></tr></table>");
                                }

                                activate_subpage("#missingItemDetail");
                            });
                            $("#ListMiss").append(temp);
                        });

                    }


                }
            };
            xhr.send();
            activate_subpage("#displayMissItem");
            return false;
        });

        /* button  #btnCamera */
        $(document).on("click", "#btnCamera", function (evt) {
            capturePhoto('IMAGE');
            return false;
        });



        /* button  #slideMarker */
    $(document).on("click", "#slideMarker", function(evt)
    {
         /* Other options: .modal("show")  .modal("hide")  .modal("toggle")
         See full API here: http://getbootstrap.com/javascript/#modals 
            */
        
         $("#infoMarker").modal("toggle");  
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
                    icon:"file://logo-bus35.png",
                    text: 'Bus Tracking on Background',
                
                
                });
            }, 5000);
        };
        // Cordova is ready to be used!

        if (!navigator.camera) {
            throw new Error('Cordova camera plugin required to access hardware camera.');
        }
        pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;

    }
    //    document.addEventListener('push-notification', function(event) {
    //  var notification = event.notification;
    //  // handle push open here
    //});
    // Wait for Cordova to connect with the device
    document.addEventListener("app.Ready", onDeviceReady, false);
    document.addEventListener("app.Ready", register_event_handlers, false);
    /* button  #slideHome */
    //start code camera
    // Called when a photo is successfully retrieved (photo taken)
    function onPhotoDataSuccess(imageData) {
        // Uncomment to view the base64 encoded image data
        // console.log(imageData);

        // Give your image widget an ID and set it here
        // Get image handle
        var imageNode = $(imageID);

        //create photo
        var photo = 'data:image/jpeg;base64,' + imageData;

        // Show the captured photo
        imageNode.attr('src', photo);
        /* button  #btnreport */
        /* button  #btnreport2 */
        $(document).on("click", "#btnreport2", function (evt) {
            /* your code goes here */
            bootbox.confirm({
                title: "Comfirmation Report?",
                message: "Do you want to submit Report",
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> Cancel'
                    },
                    confirm: {
                        label: '<i class="fa fa-check"></i> Confirm'
                    }
                },
                callback: function (result) {
                    missRouteP = $("#missRoute").val();
                    MissDateP = $("#missDate").val();
                    MissTimeP = $("#missTime").val();
                    MissfromP = $("#missFrom").val();
                    MisstypeP = $("#misstype").val();
                    MissContactP = $("misscontact").val();
                    if (result === true) {

                        if (missRouteP !== "" && MissDateP !== "" && MissTimeP !== "" && MissfromP !== "" && MissContactP !== "") {
                            $.ajax({
                                //Getting the url of the uploadphp from action attr of form 
                                //this means currently selected element which is our form 
                                url: reportMissingItem,

                                //For file upload we use post request
                                type: "POST",

                                //Creating data from form 
                                data: {
                                    missroute: missRouteP,
                                    missdate: MissDateP,
                                    misstime: MissTimeP,
                                    missfrom: MissfromP,
                                    imej: imageURI,
                                    misstype: MisstypeP,
                                    misscontact: MissContactP
                                },

                                //Setting these to false because we are sending a multipart request
                                contentType: "application/x-www-form-urlencoded",
                                cache: false,
                                //processData: false,
                                success: function (data) {
                                    bootbox.alert(JSON.parse(data));
                                },
                                error: function () {
                                    alert("DSDSADas");
                                }
                            });


                        } else {
                            toastr.info("Please fill in Form");
                        }
                    }

                }

            });

            return false;
        });

    }


    // Called when a photo is successfully retrieved (photo retrieved)
    function onPhotoURISuccess(imageURI) {
        // Uncomment to view the image file URI
        // console.log(imageURI);

        var imageNode = $("#IMAGE");
        //create photo
        var photo = 'data:image/jpeg;base64,' + imageURI;
        // Show the captured photo
        imageNode.attr('src', photo);
        /* button  #btnreport */

        $(document).on("click", "#btnreport", function (evt) {
            /* your code goes here */
            bootbox.confirm({
                title: "Comfirmation Report?",
                message: "Do you want to submit Report",
                buttons: {
                    cancel: {
                        label: '<i class="fa fa-times"></i> Cancel'
                    },
                    confirm: {
                        label: '<i class="fa fa-check"></i> Confirm'
                    }
                },
                callback: function (result) {
                    missRouteP = $("#missRoute").val();
                    MissDateP = $("#missDate").val();
                    MissTimeP = $("#missTime").val();
                    MissfromP = $("#missFrom").val();
                    MisstypeP = $("#misstype").val();
                    if (result === true) {

                        if (missRouteP !== "" && MissDateP !== "" && MissTimeP !== "" && MissfromP !== "") {
                            $.ajax({
                                //Getting the url of the uploadphp from action attr of form 
                                //this means currently selected element which is our form 
                                url: reportMissingItem,

                                //For file upload we use post request
                                type: "POST",

                                //Creating data from form 
                                data: {
                                    missroute: missRouteP,
                                    missdate: MissDateP,
                                    misstime: MissTimeP,
                                    missfrom: MissfromP,
                                    imej: imageURI,
                                    misstype: MisstypeP,
                                    misscontact: "null"
                                },

                                //Setting these to false because we are sending a multipart request
                                contentType: "application/x-www-form-urlencoded",
                                cache: false,
                                //processData: false,
                                success: function (data) {
                                    bootbox.alert(JSON.parse(data));
                                },
                                error: function () {
                                    alert("DSDSADas");
                                }
                            });


                        } else {
                            toastr.info("Please fill in Form");
                        }
                    }

                }

            });

            return false;
        });

        // Get image handle

    }

    // A button will call this function
    function capturePhoto(uib_id) {
        alert("DSADSADA");
        imageID = uib_id || '#IMAGE';
        // Take picture using device camera and retrieve image as base64-encoded string
        if (!navigator.camera) {
            onFail('Missing the Cordova camera plugin');
        }
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
            quality: 50,
            destinationType: destinationType.DATA_URL,
            correctOrientation: true,
            encodingType: Camera.EncodingType.JPEG
        });
    }
    window.capturePhoto = capturePhoto;

    // A button will call this function
    function captureAndSavePhoto(uib_id) {
        if (!navigator.camera) {
            onFail('Missing the Cordova camera plugin');
        }
        imageID = uib_id || '#IMAGE';
        //desinationType and saveToPhotoAlbum must be set correctly to save the photo to the camera roll
        var cameraOptions = {
            quality: 50,
            destinationType: destinationType.FILE_URI,
            saveToPhotoAlbum: true
        };
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, cameraOptions);
    }
    window.captureAndSavePhoto = captureAndSavePhoto;

    // A button will call this function
    function capturePhotoEdit(uib_id) {
        imageID = uib_id || '#IMAGE';
        // Take picture using device camera, allow edit, and retrieve image as base64-encoded string
        navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
            quality: 20,
            allowEdit: true,
            destinationType: destinationType.DATA_URL
        });
    }
    window.capturePhotoEdit = capturePhotoEdit;

    // A button will call this function
    function getPhoto(source) {
        // Retrieve image file location from specified source

        navigator.camera.getPicture(onPhotoURISuccess, onFail, {
            quality: 50,
            destinationType: destinationType.DATA_URL,
            sourceType: source,
            encodingType: Camera.EncodingType.JPEG
        });
    }
    window.getPhoto = getPhoto;

    // Called if something bad happens.
    function onFail(message) {
        throw new Error('Camera failed: ' + message);
        //  alert('Failed because: ' + message);
    }
    //end code samera


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
        icon: imageUser,
        title: "you here"
    });
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });

    // Event that closes the Info Window with a click on the map
    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });
    usermarkers.push(marker);
}

function checkEmail(email) {
    var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

    if (filter.test(email)) {
        return true;
    } else {
        alert('Please provide a valid email address');
        return false;
    }
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

        arrayContent[markerid] = "<table><tr><td>Route</td><td>:</td><td>" + busRoute + "</td></tr><tr><td>Time Arrival</td><td>:</td><td>" + masa[markerid] + "</td></tr></table><select id='minute'><option value=2>2 minute</option><option value=4>4 minute</option><option value=6>6 minute</option></select><br><button onclick='myFunction(" + markerid + ")'>Notify Me</button>";
        // marker options
        if(busRoute=="A"){
           imageBus=imageBusA; 
        }else if(busRoute=="B"){
              imageBus=imageBusB; 
        }else if(busRoute=="C"){
              imageBus=imageBusC; 
        }else if(busRoute=="D"){
              imageBus=imageBusD; 
        }else if(busRoute=="E"){
              imageBus=imageBusE; 
        }else if(busRoute=="MAYBANK"){
              imageBus=imageBusMay; 
        }
        var marker = new google.maps.Marker({
            id: markerid,
            position: origin1,
            icon: imageBus,
            map: map,
            title: "Bus Route " + busRoute
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

    }, callback2);

    function callback2(response, status) {
        masa[markerid] = response.rows[0].elements[0].duration.text;


    }
}

function myFunction(busid) {
    //alert(markers[sad-1].position);
    minutess = $("#minute").val();
    
    var split = masa[busid].split(" ");
    if (minutess < split[0]) {
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
    } else if (minutess >=split[0]) {
        bootbox.alert("Please Get ready!!");
    } else {
        bootbox.alert("Please choose diffrent time to notify");
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
    timearrive = parseInt(timearrive[0]);
    timearrive = parseInt(timearrive);
    minutess = parseInt(minutess);
    if (timearrive <= minutess) {
        clearInterval(serloop);
        navigator.vibrate(10000);
        bootbox.alert("bus sampai");
        //        navigator.notification.vibrate(3000);
        //        navigator.notification.beep(3);
        cordova.plugins.notification.local.schedule({
            icon:"file://logo-bus35.png",
            title: "Your Bus will arive in 2 minutes",
            text: "Please wait at Bus Stop",
        });

        cordova.plugins.notification.local.on("click", function (notification) {
navigator.vibrate(0);
            activate_subpage("#mainpage");

        });

    }

}

function startapp() {
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
                    for (var id = 0; id < locationBus.length; id++) {
                        // InfoWindow content
                        busLocation(locationBus[id].latitude, locationBus[id].longitude, locationBus[id].driverRoute, latLocation, lngLocation, locationBus[id].busID);
                    }
                    //Set unique
                    map.setCenter(position.coords.latitude, position.coords.longitude);
                    //
                      userLocation();
                    $.ajax({
                        success: function () {
                            clearInterval(daemon);
                            daemon = setInterval(function () {
                              
                                if (pause) {
                                    $.ajax({
                                        type: "POST",
                                        url: getlocation,
                                        success: function (data) {
                                            locationBus = JSON.parse(data);
                                            for (var demarker = 0; demarker < markers.length; demarker++) {
                                                markers[demarker].setMap(null);
                                                

                                            }
                                            for (var de = 0; de < locationBus.length; de++) {
                                                loop++;
                                                busLocation(locationBus[de].latitude, locationBus[de].longitude, locationBus[de].driverRoute, latLocation, lngLocation, locationBus[de].busID);

                                            }

                                        },
                                    });
                                } else {

                                    return;
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
}

function checkNumberLenght(numberMatric) {
    numberMatric = numberMatric.length;
    if (numberMatric == 6) {
        return true;
    } else {
        alert("Please enter 6 digit");
        return false;
    }
}

function viewbusbyRoute(routebus) {
     
    var xhr = new XMLHttpRequest();
    var param = "route=" + routebus;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", getlocationbyroute, false);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
    
            console.log(getlocationbyroute + "?route=" + routebus);
            locationBus = JSON.parse(xmlhttp.responseText);
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
                            clearInterval(daemon);
                            daemon = setInterval(function () {
                                if (!pause) {
                                    $.ajax({
                                        type: "GET",
                                        url: getlocationbyroute + "?route=" + routebus,
                                        success: function (data) {
                                            locationBus = JSON.parse(data);
                                            for (var demarker = 0; demarker < markers.length; demarker++) {
                                                markers[demarker].setMap(null);

                                            }
                                            for (var de = 0; de < locationBus.length; de++) {
                                                loop++;
                                                busLocation(locationBus[de].latitude, locationBus[de].longitude, locationBus[de].driverRoute, latLocation, lngLocation, locationBus[de].busID);

                                            }

                                        },
                                    });
                                } else {
                                    return;
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
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(param);
     activate_subpage("#page_70_0");

}