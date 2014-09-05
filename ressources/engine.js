/*
 * ==========[ MSE : mini site engine ]==========
 *           Version 3.0.0 : 27/05/2013
 *
 *        Developped by Hadrien Croubois :
 *           hadrien.croubois@gmail.com
 * ==============================================
 */

$(function(){
	$.ajaxSetup({beforeSend: function(xhr) { if (xhr.overrideMimeType) { xhr.overrideMimeType("application/json"); }}});


	var file			= 'ressources/data.json';
	var pageHash	= '';
	var pageIndex	= new Object();
	



		$('error').hide();



	






	$.getJSON(file, function(json) {
		
		$('#name').text(json.title);
		$('#picture').attr('src', json.picture);



		$.each(json.pages, function(page_key, page) {
			pageIndex[page.title] = page_key;

			$('#nav, #mininav').append($('<li/>').append($('<a/>').attr({href: '#'+page.title}).text(page.title)));

			$('section').append($('<page/>'));

			$.each(page.content, function(article_key, article) {
				
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
						.append(
							article.text
						)
					);
				

				if(article.hide == "true") $('page').eq(page_key).find('article').eq(article_key).hide();

			});


/*
			$('section')
				.append($('<page/>')
					.append($('<h2/>')
						.append($('<a/>')	.attr('href', '#').click(function() {
									$('article').eq(page_key).slideToggle('slow', function () {
									$(this).trigger('launch')
									}); return false;
									}).text(page.title)
						)
					)
				);
			// .addClass((value.hide=='true')?'label-purple':'label-blue').appendTo($('#content')));
*/			
		});


		$.each(json.sidebar, function(side_key, side) {

			$('aside').append($('<article/>').append($('<h2/>').addClass('bordered label-orange').text(side.title)).append(side.content));

		});
		
		
		$.each(json.links, function(link_key, link) {
			
			$('#social').append($('<li/>').append($('<a/>').attr({href: link.url, target: '_blank'}).append($('<img/>').attr({src: link.img})).append(link.title)));

		});





		$('<a/>').attr('href', '#').click(function() { goTop(); return false; }).addClass('quietest').html('Page Top &#8593;').appendTo($('#mininav'));



	})
	.fail(function() {
		
	})
	.done(function() {
		
		


	})
	.always(function() {
		
	});











  function goTop() {
		document.body.scrollTop = document.documentElement.scrollTop = 0;
  }


  function updateNav() {
  	$('#nav li').removeClass();
		$('#nav li').eq(pageIndex[pageHash]).addClass("current");
  }

	$(window).bind('hashchange', function() {
			pageHash = window.location.hash.substring(1);
			updateNav();
	});


});
