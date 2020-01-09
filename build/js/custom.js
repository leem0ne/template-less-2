'use strict';
//MATCH MEDIA POINTS
/*
 * Функция получает значения matchMedia для соответствующих ширин экрана
 * @param {array} arr - массив со значениями match points
 * @return возвращается объект с булевыми значениями для матч поинтов
 */
function isMatchMediaArr(arr) {
  if ( !Array.isArray(arr) ) return [];
  var res = {};
  arr.forEach(function(el, i) {
    res[el] = {
    	min: window.matchMedia('(min-width:'+parseInt(el, 10)+'px)').matches,
    	max: window.matchMedia('(max-width:'+parseInt(el, 10)+'px)').matches
    }
  });
  return res;
} 
var matchMediaArr = isMatchMediaArr([430, 560, 780, 990, 1250]);
// console.log(matchMediaArr);

/*
 * Плавный скролл к элементу
 * @prarm {string|jq-object} scroll_el - элемент, к которому скролить
 * @param {number} speed - скорость анимации скрола, мс
 * @param {number} offset - отступ от верха экрана, рх
 */
function scrollTo(scroll_el, speed, offset){
	speed = speed || 800;
	offset = offset || 0;

	if ($(scroll_el).length != 0) {
		$('html, body').animate({ scrollTop: $(scroll_el).offset().top + offset }, speed);
	}
}

/*
 * ленивая загрузка изображений https://davidwalsh.name/lazyload-image-fade
 */
function lazyloadWalsh (images){
	$.each(images, function(index, img) {
	  $(img).attr('src', $(img).attr('data-src'));
	  img.onload = function() {
			$(img).removeAttr('data-src');
	  };
	});
}


$(document).ready(function(){

	svg4everybody();//supports svg-sprites in IE/edge

	//ленивая загрузка с viewport-ом   https://github.com/verlok/lazyload
	// var lazyLoadInstance = new LazyLoad({
	//     elements_selector: ".lazy"
	// });


	//FIX_MENU
	const winH = $(window).height(),
				fixMenu = $('#fix-menu');
				
	$(fixMenu).css('display', 'block');

	$(window).on('load scroll', function() {
		var top = $(this).scrollTop();
		if ( top > ( winH / 3 ) ) {
			$(fixMenu).addClass('nav_show');
		} else {
			$(fixMenu).removeClass('nav_show');
		}
	});

	$('.js-nav-open').on('click', function() {
		if ( $(this).hasClass('burger_active') ) {
			$(this).removeClass('burger_active');
			$(fixMenu).removeClass('nav_show');
		} else {
			$(this).addClass('burger_active');
			$(fixMenu).addClass('nav_show');
		}
	});

	//scroll menu
	$('.js-scroll-to').click( function(){
		var href = $(this).attr('href');
		scrollTo(href);
		return false;
	});


	//POPUP LITY
	// документация https://sorgalla.com/lity/
	let modalLity;
	$('body').on('click', '.js-modal-open', function(event) {
		event.preventDefault();
		const href = $(this).attr('href');
		if (modalLity) modalLity.close();
		modalLity = lity(href);
	});

	// modalLity = lity('#modal-thanks');
	// setTimeout(function(){ modalLity.close(); console.log('sdf')}, 10000);


	//slider slick
	var boxWrap = $('#box'),
			boxSlider = $(boxWrap).find('.js-slider-wrap');
	let boxSlidesCount = $(boxSlider).children('div').length;

	boxSlidesCount = ( boxSlidesCount < 10 ) ? '0'+boxSlidesCount : boxSlidesCount;

	$(boxWrap).find('.js-slider-curr').text('0'+1);
	$(boxWrap).find('.js-slider-count').text( boxSlidesCount );

	$(boxSlider).on('afterChange', function(slick, currentSlide) {
		let curr = ( (currentSlide.currentSlide + 1) < 10 ) ? '0'+(currentSlide.currentSlide + 1) : (currentSlide.currentSlide + 1);
		$(boxWrap).find('.js-slider-curr').text( curr );
	});

	$(boxSlider).slick({
	    prevArrow: $(boxWrap).find('.slider__arrow_prev'),
	    nextArrow: $(boxWrap).find('.slider__arrow_next'),
	    centerMode: true,
	    centerPadding: '0',
	    slidesToShow: 3,
	    mobileFirst: true,
	    responsive: [
	      {
	        breakpoint: 780,
	        settings: {
	          arrows: true,
	          centerMode: true,
	          centerPadding: '0',
	          slidesToShow: 1
	        }
	      }
	    ]
	});


	$(window).on('scroll.test', function() {
		if ( $(this).scrollTop() > (boxWrap - winH) ) {
			lazyloadWalsh( $(boxWrap).find('img') );
			$(window).off('scroll.test');
		}
	});



	//Отправка заявок
	$('input[name="agree"]').on('click', function() {
		if ( $(this).prop('checked') ) {
			$(this).closest('form').find('.form__submit').removeAttr('disabled');
		} else {
			$(this).closest('form').find('.form__submit').attr('disabled', 'disabled');
		}
	});
	$('form').on('submit', function(e){
		e.preventDefault();
		
		var form = $(this),
			  submit = $(form).find('button[type=submit]');
		$(form).find('input[required]').removeClass('alert');
		$(submit).attr('disabled', 'disabled');
		
		$.ajax({
			type: 'post', 
			url:  $(form).attr('action'),
			data: $(form).serialize(),
			success: function(dataJson){
				$(submit).removeAttr('disabled');
				
				let dataObj = JSON.parse(dataJson);
				let code = dataObj.code;
				console.log(dataObj);
				
				if (code == "100"){
					$(form).find('input[type=text]').val('');
					$(form).find('input[type=tel]').val('');

					if (modalLity) modalLity.close();
					modalLity = lity('#modal-thanks');
					setTimeout(function(){ modalLity.close(); }, 5000);
				};
				if (code == "101"){
					$(form).find('input[type=text]').val('');
					$(form).find('input[type=tel]').val('');
					alert('Сообщение не отправлено<br/>Попробуйте еще раз');
				};
				if (code == "102"){
					$(form).find('input[required]').each(function(i){
						if($(this).val() == '') $(this).addClass('alert');
					});
					alert('Заполните обязательные поля');
				};
				if (code == "103"){
					$(form).find('input[name=phone]').addClass('alert');
					alert('Неправильный номер телефона');
				};
				
			}
		});
	});
});