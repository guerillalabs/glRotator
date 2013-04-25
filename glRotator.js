(function($){
	var methods = {
		init : function(options) {
			// use settings to hold the default class names of the media elements
			// and a couple of other things
			var settings = {
				'interval'	: 6750,
				'fade'		: 1200,
				'fadeclick' : 300
			};

			return this.each(function() {
				// if options exist, lets merge them with our default settings
				if (options) {
					$.extend(settings, options);
				}

				// set variables
				var $this = $(this);
				var $rotate_list = $this.find('ul');
				var rotatorIsPlaying = true;

				// set video hero boolean
				var hasVideoHero = false;
				if($this.find(".video-hero").length){
					hasVideoHero = true;
					var bcVideoHero;
				}

				// do the actual rotation
				function rotate(event, link) {

					var $currentAdRef = $rotate_list.children("li.current");
					var currentAdLink = $currentAdRef.children('a').attr('href');
					var $currentAd = $("#rotator .hero" + currentAdLink);
					var $nextAdRef;
					var fadeSetting = settings.fade;

					if (event === "click") {
						$nextAdRef = link.parent("li");
						fadeSetting = settings.fadeclick;
					} else {
						$nextAdRef = $currentAdRef.next("li");
						if ($nextAdRef.length === 0) {
							$nextAdRef = $rotate_list.children("li:first");
						}
					}
					var nextAdLink = $nextAdRef.children('a').attr('href');
					var $nextAd = jQuery("#rotator .hero" + nextAdLink);
					
					// check for video hero on current
					if(hasVideoHero && $currentAd.hasClass("video-hero")){
						// check for brightcove object and pause it
						if(typeof(bcVideoHero) == "object" && typeof(bcVideoHero.pause) == "function"){
							bcVideoHero.pause();
						}
					}

					// handle fade & layering
					$currentAd.stop(false, true).css("z-index","1");
					$nextAd.css("opacity","0").css("z-index","2").fadeTo(fadeSetting,1,function(){
						$currentAd.css("z-index","0");
					});
					
					$currentAdRef.removeClass("current");
					$nextAdRef.addClass("current");

				}

				// start the timer
				var rotateTimer = setInterval(rotate, settings.interval);

				// create and set the functionality for the manual pause link
				$('<a href="#" id="rotate_link" class="play">pause</a>').appendTo(this).click(function(e){
					e.preventDefault();
					if(rotatorIsPlaying){
						jQuery(this).removeClass("play").addClass("pause").text("play");
						clearInterval(rotateTimer);
						rotatorIsPlaying = false;
					}else{
						jQuery(this).removeClass("pause").addClass("play").text("pause");
						rotatorIsPlaying = true;
						rotate();
						rotateTimer = setInterval(rotate, settings.interval);
					}
				});

				// set the functionality for clicking on the menu items
				$rotate_list.find("a").click(function(e) {
					e.preventDefault();
					if (!$(this).parent().hasClass("current")) {
						if (rotatorIsPlaying) {
							clearInterval(rotateTimer);
							rotateTimer = setInterval(rotate, settings.interval);
						}
						rotate(e.type, $(this));
					}
				});

				if(hasVideoHero){
					// initialize video hero, this is set as a callback in the brightcove player snippet
					window.initVideoHero = function(experienceId) {

					    var bc = brightcove.api.getExperience(experienceId);
					    bcVideoHero = bc.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);

					    // when video is played, stop the rotator
					    bcVideoHero.addEventListener(brightcove.api.events.MediaEvent.PLAY, function(){
						    
						    // alert("play was clicked!");
						    
						    if(rotatorIsPlaying){
							clearInterval(rotateTimer);
							rotatorIsPlaying = false;
							jQuery("#rotate_link").removeClass("play").addClass("pause").text("play");
						    }
					    });
					}
				}

			});
		}
	};

	$.fn.glRotator = function(method) {
		// Method calling logic
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.glRotator');
		}
	};
})(jQuery);


jQuery(document).ready(function() {
	jQuery("#rotator_box").glRotator();
});