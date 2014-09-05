/*
 * ==========[ MSE : mini site engine ]==========
 *           Version 3.0.1 : 05/09/2014
 *
 *        Developped by Hadrien Croubois :
 *           hadrien.croubois@gmail.com
 * ==============================================
 */

$(function(){
	$.ajaxSetup({beforeSend: function(xhr) { if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); }}});


	var file				= 'ressources/data.json';
	var pageCurrent = '';
	var pageDefault	= '';
	var pageIndex		= new Object();


	$('error').text('Loading ...');

	$.getJSON(file, function(json) {
		buildHeader(json);
		buildContent(json);
		buildSidebar(json);
		buildFooter(json);		
		$('error').click(function() { window.location.hash = pageCurrent; });
	})
	.fail(function() {
		$('error').text('Error loading data: '+file);
	})
	.done(function() {
		$(window).trigger('hashchange');
	})

	$(window).bind('hashchange', function() {
		var hash	= window.location.hash.substring(1);
		var error	= 0;

		if (hash in pageIndex)														{																															}
		else if (new RegExp("[0-9]{3}error").test(hash))	{ error = parseInt(hash.substring(0,3));	hash = pageDefault;	}
		else if (hash == "")															{ window.location.hash = pageDefault;													}
		else																							{ window.location.hash = '404error'														}
	
		updateError(error);
		updatePage(hash);
		updateNav(hash);
	});




	/*
	 * ==========================================================================
	 * =                             Tool Functions                             =
	 * ==========================================================================
	 */
	function goTop() {
		document.body.scrollTop = document.documentElement.scrollTop = 0;
  }
	function errorText(error) {
		switch (error) {
			case 400:	return "400 Bad Request";
			case 401:	return "401 Unauthorized";
			case 403:	return "403 Forbidden";
			case 404:	return "404 Not Found";
			case 502: return "502 Bad Gateway";
			default:	return "Undocumented error ("+error+")";
		}
	}
	/*
	 * ==========================================================================
	 * =                            Update Functions                            =
	 * ==========================================================================
	 */
  function updateNav(hash) {
  	$('#nav li').removeClass();
		$('#nav li').eq(pageIndex[hash]).addClass("current");
  }
	function updatePage(hash) {
		if (pageCurrent != hash)
		{
			$('page').eq(pageIndex[pageCurrent]).slideUp('slow');
			$('page').eq(pageIndex[hash]).slideDown('slow');
			pageCurrent = hash;	
		}
	}
	function updateError(error) {
		if (error)	$('error').text(errorText(error)).show();
		else				$('error').hide();
	}

	/*
	 * ==========================================================================
	 * =                            Build Functions                             =
	 * ==========================================================================
	 */
	function buildHeader(data) {
		$('#name').text(data.title);
		$('#picture').attr('src', data.picture);
	}
	function buildContent(data) {
		// for each page
		$.each(data.pages, function(page_key, page) {
			// add page to pageIndex
			pageIndex[page.title] = page_key;
			// set default page
			if (pageDefault == '' && page.default) pageDefault = page.title;
			// set nav links
			$('#nav, #mininav')
				.append($('<li/>')
					.append($('<a/>')
						.attr({href: '#'+page.title})
						.text(page.title)
					)
				);
			// create new page
			$('section')
				.append($('<page/>'));
			// for each article in page
			$.each(page.article, function(article_key, article) {
				$('page').eq(page_key)
					.append($('<h2/>')
						.addClass('bordered')
						.addClass((article.hide=='true')?'label-purple':'label-blue')
						.append($('<a/>')
							.attr('href', '#')
							.click(function() {
								$('page').eq(page_key).find('article').eq(article_key)
									.slideToggle('slow', function () {
										$(this).trigger('launch')
									}); return false;
							})
							.text(article.title)
						)
					)
					.append($('<article/>')
						.html(article.text)
					);
				// if biblio is present
				if(article.biblio)
					// for each biblio in article in page
					$.each(article.biblio, function(biblio_key, biblio) {
						$('page').eq(page_key).find('article').eq(article_key)
							.append($('<bibtitle/>').html(biblio.title))
							.append($('<bibauthor/>').html(biblio.author))
							.append($('<bibref/>').html(biblio.ref));
						// if bibtex entry is present
						if (biblio.bibtex)
						{
							$('page').eq(page_key).find('article').eq(article_key).find('bibref').eq(biblio_key)
								.append(
									$('<a/>')
										.attr('href', '#')
										.text('[Bibtex]')
										.click(function() {
											$('page').eq(page_key).find('article').eq(article_key).find('bibtex').eq(biblio_key)
												.slideToggle('slow', function () { $(this).trigger('launch') });
											return false;
										})
								);
							$('page').eq(page_key).find('article').eq(article_key)
								.append($('<bibtex/>')
										.html(biblio.bibtex)
										.hide()
								);
						}
						// end bibtex entry is present
					});
					// end each biblio in article in page
				// end biblio is present
				// eval article's javascript
				if (article.javascript) eval(article.javascript);
				// hide archived articles
				if(article.hide == "true") $('page').eq(page_key).find('article').eq(article_key).hide();

			});
			// end each article in page
		});
		// end each page
		// hide pages at start
		$('page').hide();
	}
	function buildSidebar(data) {
		$.each(data.sidebar, function(side_key, side) {
			$('aside')
				.append($('<article/>')
					.append($('<h2/>')
						.addClass('bordered label-orange')
						.text(side.title))
					.append(side.content)
				);
		});
	}
	function buildFooter(data) {
		$.each(data.links, function(link_key, link) {
			$('#social')
				.append($('<li/>')
					.append($('<a/>')
						.attr({href: link.url, target: '_blank'})
						.append($('<img/>').attr({src: link.img}))
						.append(link.title)
					)
				);
		});
		$('<a/>').attr('href', '#').click(function() { goTop(); return false; }).addClass('quietest').html('Page Top &#8593;').appendTo($('#mininav'));
	}


});
