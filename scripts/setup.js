// ------ OPTIONS ---------------------------
var BEGIN_YR = 1961; // Earliest year an event occurs. Change if adding events!
var END_YR = 1995;   // Latest year an event occurs. See above.
var YEAR_RANGE = END_YR - BEGIN_YR;
var ST_VIEW_UNSELECTED = "See modern day";
var ST_VIEW_SELECTED = "Back to map";
var DESKTOP_TTL = "Black History in Washington D.C.";
var MOBILE_TTL = "D.C. Black History";
var PRESENT = "present"; // Word used in spreadsheet to say event is still occuring.
var ICN_PTH = 'images/icons/'; // Path to where icons are.

// Change if modifying spreadsheet field names.
var SHEET_NAME = "DC BLACK POWER CHRONICLES - Chronology";
var E_STRT = "Start_Year";
var E_END  = "End_Date";
var E_ADDR = "Geography_Address ";
var E_DESC = "Description";
var E_NAME = "Event_Name";
var E_LAT  = "Latitude";
var E_LONG = "Longitude";
// ------------------------------------------

var mobile = false;  // If page is in compact mode.
var selected = null; // The currently selected marker.
var displayed = [];  // All icons currently being displayed on the map.
var allMarkers = new Array(YEAR_RANGE); // Holds arrays of markers. Indexed by [year] - BEGIN_YR.

for (i = 0; i <= YEAR_RANGE; i++) {
	allMarkers[i] = []; // Each element holds a list of events that happen in same year.
}

$("#street_view").hide(); // Street view is visible when the street_view_button is pressed.

var myMap = L.map('map'); // Create map

// Adds the tile layer to the map, then adds the map to the page.
// TO CHANGE MAP, VISIT https://leaflet-extras.github.io/leaflet-providers/preview/
L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" \
		target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; \
		<a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(myMap);


/*
 * Fires when a slider changes. Changes year text and switches up markers.
 */
var changeYear = function() {
	var yr = $(this).val();
	$('#year').text(yr);
	$('#mobile_year').text(yr).animate({
		left: (((yr - BEGIN_YR) * 15) + "px")
	}, 15, 'linear');

		//.css("left", ((yr - BEGIN_YR) * 15) + "px"); // Moves year text.

	if (selected) {
		selected.remove();
		selected.setIcon(selected.ICONS[0]);
		selected = null; // Not needed, just for consistency.
	}

	eventQuery(yr, $("#month_select option:selected").text());
};


/*
 * Rearranges page elements when the window gets thinner. Basically moves the 
 * right half of the table into the left half, then moves THAT element above 
 * the table so that it centers on the page. Also swaps the slider to mobile 
 * version. If street view is showing, first resets back to map or else map SEIZES.
 */
$(window).resize(function() {
	var b = $("#street_view_button");

	if ($(this).width() < 1200 && ! mobile) {
		// Tranforms into compact mode.
		mobile = ! mobile; // Switch mode.
		var yr = $("#year").text();
		
		if (b.text() === ST_VIEW_SELECTED) {
			b.trigger('click', true); // Prevents map seizing.
		}

		$("#legend")
			.after($("#right_box").detach())
			.before('<input type="range" id="mobile_slider" \
				min="1961" max="1995" value="' + yr + '"/>')
			.css("margin-bottom", "10px");

		$("#title_box")
			.after($("#mobile_holder").detach())
			.text(MOBILE_TTL);

		$("#slider_box").css("visibility", "hidden");

		$("#mobile_slider")
			.before('<div id="mobile_year">' + yr + '</div>')
			.on('input', changeYear);

		$("#mobile_year").css("left", ((yr - BEGIN_YR) * 15) + "px");
		$("#button_and_address").css("bottom", "371px");
		$("#address").css("bottom", "0px");

		$(".purple_box").each(function() {
			$(this).css("width", "650px");
		});
	}
	else if ($(this).width() >= 1200 && mobile) {
		// Transforms into desktop mode.
		mobile = ! mobile; // Switch mode.

		if (b.text() === ST_VIEW_SELECTED) {
			b.trigger('click', true);
		}

		$(".purple_box").each(function() {
			$(this).css("width", "1200px");
		});

		$("#legend").css("margin-bottom", "");
		$("#slider").val($("#year").text());
		$("#mobile_slider").off('input').detach();
		$("#mobile_year").detach();
		$("#slider_box").css("visibility", "visible");
		$("#title_box").text(DESKTOP_TTL);
		$("#left_pane").html($("#mobile_holder").detach());
		$("#right_pane").html($("#right_box").detach());
		$("#button_and_address").css("bottom", "30px");
		$("#address").css("bottom", "16px");
	}
}).trigger('resize'); // Trigger resize when page loads.


/*
 * Removes each marker from the map, then populates the map with all events
 * that fall in [year] and [month]. If month == 'all', then month is irrelevant.
 * Finally, fits bounds of the map around the points.
 */
var eventQuery = function(year, month) {
	for (i = 0; i < displayed.length; i++) {
		displayed[i].remove();
	}

	selected = null; // Not needed, just for consistency.
	displayed.length = 0; // Clears array.
	var bounds = [];

	allMarkers[year - BEGIN_YR].forEach(function(marker) {
		displayed.push(marker);
		marker.addTo(myMap);
		bounds.push(marker.getLatLng());
	});

	if(bounds.length) {
		myMap.fitBounds(bounds, {maxZoom: 13, padding: L.point(23,23)});
		displayed[0].fire('click', {fast: true});
		displayed[0].closeTooltip();
	}
};


// Removes the intro screen.
$("#to_map").click(function() {
	$("#intro_box").slideUp();
	$("#intro_screen").delay(150).fadeOut();
	$("body").css("overflow", "visible");
});


// Toggles between the map and the street view image.
$("#street_view_button").on("click", function(e, show = false) {
	if ($(this).text() === ST_VIEW_UNSELECTED) {
		$(this).text(ST_VIEW_SELECTED);
		$("#slider_box").fadeOut();
		$("#mobile_slider").fadeOut();
		$("#mobile_year").fadeOut();
		$("#map").fadeOut(function() {
			$("#street_view").fadeIn();
		});
	}
	else {
		$(this).text(ST_VIEW_UNSELECTED);

		if (show) {
			// Animation causes seizing when screen resizes.
			$("#street_view").hide();
			$("#map").show();
			$("#slider_box").show();
			$("#mobile_slider").show();
			$("#mobile_year").show();
		}
		else {
			$("#street_view").fadeOut(function() {
				$("#map").fadeIn();
				$("#slider_box").fadeIn();
				$("#mobile_slider").fadeIn();
				$("#mobile_year").fadeIn();
			});
		}
	}
});


// Changes year, then calls event_query to update markers.
$("#slider").on("input", changeYear);


// Instantiate all icon types.
var FISTS = [
	L.icon({iconUrl: ICN_PTH + 'fst_ic_un.png',   iconSize: [30, 63]}), // Unselected icon.
	L.icon({iconUrl: ICN_PTH + 'fst_ic_sel.png',  iconSize: [30, 63]})  // Selected icon.
];
var BRUSHES = [
	L.icon({iconUrl: ICN_PTH + 'brsh_ic_un.png',  iconSize: [47, 70]}),
	L.icon({iconUrl: ICN_PTH + 'brsh_ic_sel.png', iconSize: [47, 70]})
];
var DOLLARS = [
	L.icon({iconUrl: ICN_PTH + 'dllr_ic_un.png',  iconSize: [30, 70]}),
    L.icon({iconUrl: ICN_PTH + 'dllr_ic_sel.png', iconSize: [30, 70]})
];
var GLOBES = [
	L.icon({iconUrl: ICN_PTH + 'glb_ic_un.png',   iconSize: [47, 70]}),
    L.icon({iconUrl: ICN_PTH + 'glb_ic_sel.png',  iconSize: [47, 70]})
];
var SCHOOLS = [ 
	L.icon({iconUrl: ICN_PTH + 'schl_ic_un.png',  iconSize: [47, 70]}),
	L.icon({iconUrl: ICN_PTH + 'schl_ic_sel.png', iconSize: [47, 70]})
];


(function() {
	// Deselects currently selected marker, then selects this one.
	// Fast is false if event is caused from the slider moving.
	var iconFlip = function(speed = {fast: false}) {
		if (selected == this) return; // User clicked the same one twice.
		
		if (selected) {
			selected.remove();
			selected.setIcon(marker.ICONS[0]);
			selected.addTo(myMap);
		}

		// Changes icon.
		this.remove();
		this.setIcon(this.ICONS[1]);
		this.addTo(myMap);
		selected = this;
		
		// Display all the event information.
		var e = spreadsheet.events[this.EVENT_INDEX];
		var end = (e[E_END] == "") ? "?" : e[E_END];
		var timeSpan = (e[E_STRT] == end) ? e[E_STRT] : '(' + e[E_STRT] + " - " + end + ')';

		if (speed.fast) {
			$("#desc_title").text(e[E_NAME]);
			$("#desc_body").html('<sup><i>' + timeSpan + '</i></sup><br>' + e[E_DESC]);
			$("#address").hide(0, function() {
				$(this).text(e[E_ADDR]).css('bottom', ($(this).height() - 26) + "px").show();
			});
		}
		else {
			$("#desc_body").fadeOut(200, function() {
				$(this).html('<sup><i>' + timeSpan + '</i></sup><br>' + e[E_DESC]).fadeIn(200)
			});		
			$("#desc_title").slideUp(200, function() {
				$(this).text(e[E_NAME]).slideDown(200);	
			});
			$("#address").fadeOut(200, function() {
				$(this).text(e[E_ADDR]).css('bottom', ($(this).height() - 26) + "px").fadeIn(200);
			});
		}
	};

	// Populate allMarkers.
	var toolTipOptions = {opacity: 0.8, className: 'tooltip'};

	for (i = 0; i < spreadsheet.events.length; i++) {
		var e = spreadsheet.events[i];

		if (e[E_STRT] && e[E_LAT] && e[E_LONG]) {
			// To add a marker, it must have a start date and a position.
			var marker = L.marker([e[E_LAT], e[E_LONG]], {icon: FISTS[0]});
			var start = e[E_STRT] - BEGIN_YR;
			marker.EVENT_INDEX = i;
			marker.ICONS = FISTS;
			marker.on('click', iconFlip);
			marker.bindTooltip(e[E_NAME], toolTipOptions);
			
			if (e[E_END]) {
				// Add this to every year it falls into.
				var range = (e[E_END] === PRESENT) ? allMarkers.length : e[E_END] - e[E_STRT];

				for (j = 0; start + j < allMarkers.length && j <= range; j++) {
					allMarkers[start + j].push(marker);
				}
			}
			else {
				allMarkers[start].push(marker);
			}
		}
	}

	eventQuery(BEGIN_YR, "All"); // Default year to start with is first year.
})();
