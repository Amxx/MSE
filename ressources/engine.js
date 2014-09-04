/*
 * ==========[ MSE : mini site engine ]==========
 *           Version 2.4.0 : 03/09/2014
 *
 *        Developped by Hadrien Croubois :
 *           hadrien.croubois@gmail.com
 * ==============================================
 */

$(function() {

/* ============[ Global Variables ]============= */	
	var file			= 'ressources/data.json';
	var main			= '';
	var hash			= '';
	var error			= 0;
	var noUpdate	= false;
	var data			= new Object();
	var index			= new Object();


/* =============[ Error Functions ]============== */
	function errorTitle(id) {
		switch (id) {
			case 400:	return "400 Bad Request";
			case 401:	return "401 Unauthorized";
			case 403:	return "403 Forbidden";
			case 404:	return "404 Not Found";
			case 502: return "502 Bad Gateway";
			default:	return "Undocumented error ("+id+")";
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

/* ============[ Display Functions ]============= */
	function goTop() {
		document.body.scrollTop = document.documentElement.scrollTop = 0;
	}
	function displayReset() {
		$('#content').html('');
		$('#error').html('');
	}
	function displayError(id) {
		//$('<h1>').text(errorTitle(id)).appendTo('#error');
		//$('<h3/>').text(errorDescription(id)).appendTo('#error');
		$('#error').text(errorTitle(id));
		$('#error').show();
	}
	function displayPage(page) {
		// Display all entries in the requested page
		$.each(page.content, function(key, value) {
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
			$.each(page.content, function(key, value) { eval(value.javascript) })
		});
	}
	function display() {
		displayReset();
		displayPage(data.pages[index[hash]]);
		if (error) displayError(error);
	}
	function setTitle(x) {
		document.title = data.title+" | "+(x?errorTitle(error):hash);
	}

/* ==============[ Initialisation ]============== */
	$.ajaxSetup({beforeSend: function(xhr) { if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); }}});
	displayReset();

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
		$('.navigation').click(function()	{
			window.location.hash = $(this).attr('href');
			return false;
		});
		// Set click action to error div
		$('#error').click(function() {
			noUpdate = true;
			window.location.hash = hash;
			setTitle(0);
			$('#error').hide();
		});

		// Hash tag change triggered function
		$(window).bind('hashchange', function() {
			if (noUpdate) { noUpdate = false; return; }

			// Get page ID from hashtag
			hash = window.location.hash.substring(1);
			if (hash in index)																{ error = 0;																						}
			else if (hash == "")															{ error = 0; 															hash = main;	}
			else if (new RegExp("[0-9]{3}error").test(hash))	{ error = parseInt(hash.substring(0,3));	hash = main;	}
			else																							{	error = 404;														hash = main;	}
			setTitle(error);
			
			// Set highlight to current page in nav
			$('nav li').removeClass();
			$('nav li').eq(index[hash]).addClass("current");

			// If content is empty then call display with an hidden (empty) content
			if ($('#content').html() == '') { 
				$('#error').hide();
				$('#content').hide();
				display();
			}
			// Otherwise display new page is slide action
			else {
				$('#error').hide();
				$('#content').slideUp('slow', display);
			}
		})
		
		// If user hasn't selected a specific hash then set default value
		if(window.location.hash == '')		{ window.location.hash = main;						}
		// Otherwise trigger hashchange to draw the requested page
		else															{ $(window).trigger('hashchange');				}
	});
})




