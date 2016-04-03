// node_example.js - Example showing use of Clarifai node.js API

var Clarifai = require('./clarifai_node.js');
process.env.CLIENT_ID = "k42TgorWr6mxaR19OU-3CaAhmmVDEXDkmDh-xE1I";
process.env.CLIENT_SECRET = "QeBPvFroQ3wsUhWleZYfCOktlG6t8PaKoOG3gzy-";
Clarifai.initAPI(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
Clarifai.setModel( "nsfw-v0.1" );


var stdio = require('stdio');

// support some command-line options
var opts = stdio.getopt( {
	'print-results' : { description: 'print results'},
	'print-http' : { description: 'print HTTP requests and responses'},
	'verbose' : { key : 'v', description: 'verbose output'}
});
var verbose = opts["verbose"];
Clarifai.setVerbose( verbose );
if( opts["print-http"] ) {
	Clarifai.setLogHttp( true ) ;
}

if(verbose) console.log("using CLIENT_ID="+Clarifai._clientId+", CLIENT_SECRET="+Clarifai._clientSecret);

// Setting a throttle handler lets you know when the service is unavailable because of throttling. It will let
// you know when the service is available again. Note that setting the throttle handler causes a timeout handler to
// be set that will prevent your process from existing normally until the timeout expires. If you want to exit fast
// on being throttled, don't set a handler and look for error results instead.

Clarifai.setThrottleHandler( function( bThrottled, waitSeconds ) {
	console.log( bThrottled ? ["throttled. service available again in",waitSeconds,"seconds"].join(' ') : "not throttled");
});

function commonResultHandler( err, res ) {
	if( err != null ) {
		if( typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
			console.log("TAG request timed out");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
			console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
			console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");
		}
		else if( typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
			console.log("Clarifai host is throttling this application.");
		}
		else {
			console.log("TAG request encountered an unexpected error: ");
			console.log(err);
		}
	}
	else {
		if( opts["print-results"] ) {
			// if some images were successfully tagged and some encountered errors,
			// the status_code PARTIAL_ERROR is returned. In this case, we inspect the
			// status_code entry in each element of res["results"] to evaluate the individual
			// successes and errors. if res["status_code"] === "OK" then all images were
			// successfully tagged.
			if( typeof res["status_code"] === "string" &&
				( res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR" )) {

				// the request completed successfully
				for( i = 0; i < res.results.length; i++ ) {
					if( res["results"][i]["status_code"] === "OK" ) {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id +
							' tags='+res["results"][i].result["tag"]["classes"] +
							' tags='+res["results"][i].result["tag"]["probs"])
					}
					else {
						console.log( 'docid='+res.results[i].docid +
							' local_id='+res.results[i].local_id +
							' status_code='+res.results[i].status_code +
							' error = '+res.results[i]["result"]["error"] )
					}
				}

			}
		}
	}
}

// exampleTagSingleURL() shows how to request the tags for a single image URL
function exampleTagSingleURL() {
	var testImageURL = 'https://i.ytimg.com/vi/UfgNuUwRyPk/maxresdefault.jpg';
	var ourId = "1"; // this is any string that identifies the image to your system

	// Clarifai.setRequestTimeout( 100 ); // in ms - expect: force a timeout response
	// Clarifai.setRequestTimeout( 100 ); // in ms - expect: ensure no timeout

	Clarifai.tagURL( testImageURL , ourId, commonResultHandler );
}


// exampleTagMultipleURL() shows how to request the tags for multiple images URLs
function exampleTagMultipleURL() {
	var testImageURLs = [
	"http://e2ua.com/data/wallpapers/66/WDF_1112831.jpg",
	"http://www.returnofkings.com/wp-content/uploads/2014/07/moejacksons-rosie-huntington-whiteley_img4.jpg",
 	"http://s26.postimg.org/ghb3wkck9/naked_girl_041.jpg",
	"http://i.ebayimg.com/images/g/d9UAAOSwBLlVKK5l/s-l300.jpg",
	"http://36.media.tumblr.com/524c04987f1ed98ebdc90ef0f1ccfa79/tumblr_o3q03zVAC81u1560io1_1280.jpg",
	"http://b0b1df7540eac2ba583fe6c7fa8c101e.lswcdn.net/48457_thumbnail.jpg",
	"http://i.4cdn.org/b/1459645460460.jpg",
	"http://36bv2z1p0p3wn85qg3lbp7jjg.wpengine.netdna-cdn.com/wp-content/uploads/sites/7/2014/05/MnglwjH.jpg",
	"http://nick.mtvnimages.com/nick/properties/spongebob-squarepants/characters/spongebob-about-web-desktop.jpg?quality=0.75"];
	var ourIds =  [ "2",
	                "3",
								 	"4",
									"5",
									"6",
									"7",
									"8",
									"9",
									"10"]; // this is any string that identifies the image to your system

	Clarifai.tagURL( testImageURLs , ourIds, commonResultHandler );
}

// exampleFeedback() shows how to send feedback (add or remove tags) from
// a list of docids. Recall that the docid uniquely identifies an image previously
// presented for tagging to one of the tag methods.
function exampleFeedback() {
// these are docids that just happen to be in the database right now. this test should get
// upgraded to tag images and use the returned docids.
var docids = [
	"15512461224882630000",
	"9549283504682293000"
	];
	var addTags = [
	"addTag1",
	"addTag2"
	];
	Clarifai.feedbackAddTagsToDocids( docids, addTags, null, function( err, res ) {
		if( opts["print-results"] ) {
			console.log( res );
		};
	} );

	var removeTags = [
	"removeTag1",
	"removeTag2"
	];
	Clarifai.feedbackRemoveTagsFromDocids( docids, removeTags, null, function( err, res ) {
		if( opts["print-results"] ) {
			console.log( res );
		};
	} );
}


exampleTagSingleURL();
exampleTagMultipleURL();
exampleFeedback();

Clarifai.clearThrottleHandler();
