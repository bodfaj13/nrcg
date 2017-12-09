$(document).ready(function () {

	$('.dropdown-item').on('mouseenter',function(){
		$(this).css({
			background: 'white'
		}).addClass('blue-text text-darken-1');
	});

	$('.dropdown-item').on('mouseleave',function(){
		$(this).css({
			background: 'white',
			color: 'black'
		}).removeClass('blue-text text-darken-1');
	});
	
	$('.pass-addon').on('click',function(){
		if($(this).find('i').hasClass('fa-eye')){
			$(this).find('i').addClass('fa-eye-slash').removeClass('fa-eye');
			$('#password').attr('type','text');
		}else{
			$(this).find('i').removeClass('fa-eye-slash').addClass('fa-eye');
			$('#password').attr('type','password');
		}
	});

	$('[data-toggle="tooltip"]').tooltip(); 
	$('[data-toggle="datepicker"]').datepicker();
});