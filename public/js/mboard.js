var latlongurl= "https://us1.locationiq.com/v1/search.php?key=e90ad673872fbc&city=";
var weatherurl= "https://fcc-weather-api.glitch.me/api/current?lon=";

//var postmsgurl= "http://localhost:8080/posts/";
//var getallpostsurl = "http://localhost:8080/posts/";
//var postreplyurl= "http://localhost:8080/posts/reply/";

var postmsgurl= "https://localhost:8443/posts/";
var getallpostsurl = "https://localhost:8443/posts/";
var postreplyurl= "https://localhost:8443/posts/reply/";

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://us1.locationiq.com/v1/search.php?key=e90ad673872fbc&city=",
  "method": "GET"
}

//var allposts;

var apdata = $.ajax({
		"async": true,
        "crossDomain": true,
        "url": getallpostsurl,
        "method": "GET"
	}), 
	a2 = apdata.then(function(data){
		renderMsgBoard(data);
	});

$(document).ready(function(){

	//fetchAllPostsData().then(function );
	$(document).on("click", ".reply", function(){
		var repuser = $(this).siblings(".rep_usr").val();
		var repcommt = $(this).siblings(".commt").val();
		var user = $(this).parent().siblings().first().html().replace(':','');
		var comment = $(this).parent().siblings().first().next().html();
		var city = $(this).parent().siblings().first().next().next().html();

		var postreply={};
		var postreplycont={};
		postreply.user = user;
		postreply.comment = comment;
		postreplycont.user= repuser;
		postreplycont.comment= repcommt;
		postreply.reply = postreplycont;

		console.log('Reply: ' + JSON.stringify(postreply));

		sendReply(postreply);
		//alert('repuser: ' + repuser + ' repcommt: ' + repcommt + ' user: ' + user + ' comment: ' + comment + ' city: ' + city);
	});
    
	$("#submitcomm").click(function(e){
		//console.log('submit button pressed');
		var post={};
		post.user= $("#user_name").val();
		post.comment= $("#comment").val();
		post.city=$("#city").val();
		//fill post.longitude and post.latitude using geocoding api
		settings.url = settings.url+post.city+"&format=json";
		console.log('modified settings url is: ' + settings.url);
		/*$.ajax(settings).done(function (response) {
  			console.log('latitude is ' + response[0].lat);
  			console.log('longitude is ' + response[0].lon);
		});*/
		var weather;
		var latitude;
		var longitude;
		var geocoding = $.ajax(settings),
		    weather = geocoding.then(function(data){
			   latitude=data[0].lat;
			   longitude=data[0].lon; 
               return $.ajax({
               	   "url": weatherurl+longitude+'&lat='+latitude,
               	   "method" : "GET"
               	  });
			});

		weather.done(function(data){
  			weather = data.main.temp;
		});

		$.when(weather.done(function(){
			console.log('latitude is ' + latitude);
  			console.log('longitude is ' + longitude);
  			console.log('temperature is ' + weather);
  			post.longitude = longitude;
  			post.latitude = latitude;
  			post.weather = weather;

  			//Make post call
  			sendPost(post);
		})
		);

		settings.url = latlongurl;

		e.preventDefault();
	});

});

function sendReply(ireply){
	$.ajax({
        type: "POST",
        contentType: "application/json",
        url: postreplyurl,
        data: JSON.stringify(ireply),
        success: success
    });
}

function sendPost(ipost) {
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: postmsgurl,
        data: JSON.stringify(ipost),
        success: success
    });
}

function success(result) {
    console.log('Post Saved!');
    //TODO: functionalize and re-use function.
    var alldata = $.ajax({
		"async": true,
        "crossDomain": true,
        "url": getallpostsurl,
        "method": "GET"
	}), 
	a2 = alldata.then(function(data){
		renderMsgBoard(data);
	});

}

function fetchAllPostsData(){
	return $.ajax({
        "async": true,
        "crossDomain": true,
        "url": getallpostsurl,
        "method": "GET"
	});
}

function renderMsgBoard(data){
	//console.log('first user is: ' + data[0].user);
	//for each data object, map it up
	$("#messages").html('');
	data.forEach(renderPost);

}

function renderPost(apost){
	var replies = '';

	if(apost.replies){
		for(i=0;i<apost.replies.length;i++){
			replies=replies+getReplyHtml(apost.replies[i]);
		}
	}

	var hpost= '<div class="message"> <span class="uname">'+ apost.user+ ':</span><span class="commnt">' + apost.comment + '</span><span class="citydesc">'+apost.city+
	' Lat: ' + apost.latitude + ' Lon: ' + apost.longitude + ' Temp: ' + apost.weather + ' C ' +
	'</span> <br>'+replies+'<div class="rep"> User:<input type="text" class="rep_usr"> </input> '+
	'Comment: <input type="text" size="100" class="commt"></input> <button class="reply"> Reply</button> </div> </div>';

	//$("#messages").html("<h1>Bonga</h1>");
	//Register reply button click
	//$(".reply").on("click", handleAlertClick);

	var orightml= $("#messages").html();
	$("#messages").html(orightml + hpost);
	//return false;
}

function getReplyHtml(reply){
	return '<div class="reply_msg"><span class="uname">' + reply.user + ':</span><span class="commnt">' + reply.comment + '</span></div><br>';
}


