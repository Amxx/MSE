/*
 * ==========[ MSE : mini site engine ]==========
 *           Version 2.3.1 : 03/09/2014
 *
 *        Developped by Hadrien Croubois :
 *           hadrien.croubois@gmail.com
 * ==============================================
 */


function errorTitle(id) {
	switch (id) {
		case 400:	return "400 Bad Request";
		case 401:	return "401 Unauthorized";
		case 403:	return "403 Forbidden";
		case 404:	return "404 Not Found";
		default:	return "Undocumented error";
	}
}
function errorDescription(id) {
	switch (id) {
		case 400:	return "";
		case 401:	return "";
		case 403:	return "";
		case 404:	return "";
		default:	return "Error code : "+id;
	}
}



function goTop() {
	document.body.scrollTop = document.documentElement.scrollTop = 0;
}

$(function() {
	
	var file = 'ressources/data.json';
	var main = '';
	var data = new Object();
	var index = new Object();
	

	$.ajaxSetup({beforeSend: function(xhr) { if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); }}});


	$('#content').html('');
	$.getJSON(file, function(json) {
		data = json;
		$('header h1').html(json.title);
		$('header img').attr("src", json.picture);
		$.each(json.pages, function(key, value) {
			index[value.title] = key;
			if(main == '' && value.default) main = value.title;
			$('<a/>').attr('href', value.title).addClass('navigation').html(value.title).appendTo($('<li/>').appendTo($('nav')));
			$('<a/>').attr('href', value.title).addClass('navigation').html(value.title).appendTo($('#mininav'));
			$('<span/>').addClass('text-separator').text('|').appendTo($('#mininav'));
		})
		$.each(json.sidebar, function(key, value) {
			$('<h2/>').addClass('label-orange').html(value.title).appendTo($('#links'));
			$('<spacing/>').appendTo($('#links'));
			$('#links').append(value.content);
		});
		$.each(json.links, function(key, value) {
			$('<a/>').attr({ href: value.url, target: '_blank'}).appendTo($('<span/>').addClass("align_image").appendTo($('#social')));
			$('<img/>').attr({ src: value.img, height: 18}).appendTo($('#social a:last'));
			$('<span/>').html(value.title).appendTo($('#social a:last'));
		});
		$('<a/>').attr('href', '#').click(function() { goTop(); return false; }).addClass('quietest').html('Page Top &#8593;').appendTo($('#mininav'));
	})
	.fail(function() {
		alert( "Error loading data: " + file );
	})
	.done(function() {
		// Set click action to all navigation class object
		$('.navigation').click(function() {
			window.location.hash = $(this).attr('href');
			return false;			
		})

		// Hash tag change triggered function
		$(window).bind('hashchange', function() {
			// Get page ID from hashtag
			var id = window.location.hash.substring(1);
			var error;
			if (id in index)																{ error = 0;																				}
			else if (id == "")															{ error = 0; 														id = main;	}
			else if (new RegExp("[0-9]{3}error").test(id))	{ error = parseInt(id.substring(0,3));	id = main;	}
			else																						{	error = 404;													id = main;	}
			
			// Set page title
			document.title = data.title+" | "+(error?errorTitle(error):id);
			
			// Set highlight to current page in nav
			$('nav li').removeClass();
			$('nav li').eq(index[id]).addClass("current");

			// ##########################################################################
			// #								P A G E   D R A W I N G   F U N C T I O N								#
			// ##########################################################################
			var display = function() {
				// Go to page top and hide content
				goTop();
				// Clear content
				$('#content').html('');
				
				// Display all entries in the requested page
				$.each(data.pages[index[id]].content, function(key, value) {
					// Entrie title in show/hide link
					$('<a/>').attr('href', '#').click(function() { $('article').eq(key).slideToggle('slow', function () { $(this).trigger('launch') }); return false; }).text(value.title).appendTo($('<h2/>').addClass((value.hide=='true')?'label-purple':'label-blue').appendTo($('#content')));
					// Spacing 
					$('<spacing/>').appendTo($('#content'));
					// Entrie html content
					$('<article/>').html(value.text).appendTo($('#content'));
					// Entrie bibliographie
					if (value.biblio)
					$.each(value.biblio, function(bibkey, bibvalue) {
						$('<bibtitle/>'	).html(bibvalue.title	).appendTo($('article').eq(key));
						$('<bibauthor/>').html(bibvalue.author).appendTo($('article').eq(key));
						$('<bibref/>'		).html(bibvalue.ref		).appendTo($('article').eq(key));
						if (bibvalue.bibtex)
						{
							$('<a/>').attr('href', '#').click(function() { $('article').eq(key).find('bibtex').eq(bibkey).slideToggle('slow', function () { $(this).trigger('launch') }); return false; }).text('[Bibtex]').appendTo($('article').eq(key).find('bibref').eq(bibkey));
							$('<bibtex/>').html(bibvalue.bibtex).appendTo($('<pre>').appendTo($('article').eq(key)));
							$('article').eq(key).find('bibtex').eq(bibkey).hide();
						}
					});
					// Set hidden status for archived entries
					if(value.hide == "true") $('article').eq(key).hide();
				});
				// Slide down content and execute requested javascript afterwards
				$('#content').slideDown('slow', function() {
					$.each(data.pages[index[id]].content, function(key, value) { eval(value.javascript) })
				});

				// Error panel
				if (error) {
					//$('#content').show();
					$('<container/>').appendTo($('<error/>').appendTo('#content'));
					$('<h1>').text(errorTitle(error)).appendTo('error container');
					$('<h3/>').text(errorDescription(error)).appendTo('error container');
				}
			};
			// ##########################################################################
			
			// If content is empty then call display with an hidden (empty) content
			if ($('#content').html() == '') { $('#content').hide(); display();				}
			// Otherwise display new page is slide action
			else														{ $('#content').slideUp('slow', display);	}

		})
		
		// If user hasn't selected a specific hash then set default value
		if(window.location.hash == '')		{ window.location.hash = main;						}
		// Otherwise trigger hashchange to draw the requested page
		else															{ $(window).trigger('hashchange');				}
	});
})




