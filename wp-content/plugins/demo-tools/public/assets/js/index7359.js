// ;(function($){

//     $(".aux-sticky-button").hover(function () {
//         $(this).addClass('aux-slide-out');
//     },
//     function () {
//         $(this).removeClass('aux-slide-out');
//     });

// 	// Display demo button after 15s
// 	$(window).load(function() {
// 		setTimeout(function() {
// 			$('.aux-preview-button').addClass('aux-slide-out').delay(10000).queue(function(){
// 				$(this).removeClass('aux-slide-out');
// 				$(this).dequeue();
// 			});
// 		}, 8000);
// 	});

// })(jQuery);

;(function($){
	if( window.Beacon !== undefined ){
		Beacon('on', 'open', function(){
			document.querySelector('body').classList.add('beacon-is-open');
		});
		Beacon('on', 'close', function(){
			document.querySelector('body').classList.remove('beacon-is-open');
		});
	}
})(jQuery);


(function($){
    $.fn.AuxinExportSectionModalInit = function() {
        var $handler = $('.aux-export-help-button');

        if ( !$handler.length ) {
            return
        }

        var siteSlug  = document.querySelector('body').getAttribute('data-site-slug'),
            pageSlug  = document.querySelector('body').getAttribute('data-page-slug');

        function createExportHandler(section, order) {
            var exportID  = section.getAttribute('data-export-id');

            var wrapper = document.createElement('div');
            wrapper.classList.add('export-button');
            
            var type = '';
            if ( $(section).parents('header').length ) {
                type = '&sectionType=header'
            } else if ( $(section).parents('footer').length ) {
                type = '&sectionType=footer'
            }

            var link = document.createElement('a');
                link.href = 'https://demo.phlox.pro/wp-json/demos/v3/elementor/section/?type=attachment&export-id=' + exportID + type;
                link.target = '_blank';
                link.innerHTML = 'Export Section'

            wrapper.appendChild(link);
            section.appendChild(wrapper);
            section.classList.add('aux-show-export-button');

            link.addEventListener('click', function(event){
                ga( 'send', 'event', 'export-section', 'download', siteSlug + '-' + pageSlug + '-' + order );
                ga( 'author_analytics.send', 'event', 'export-section', 'download', siteSlug + '-' + pageSlug + '-' + order );
            });
        }

        function removeExportHandler(section) {
            var exportButton = section.querySelector('.export-button');
            section.removeChild(exportButton);
            section.classList.remove('aux-show-export-button');
        }

        $.ajax({
            type : "post",
            dataType : "json",
            url : auxDemoTools.ajax_url,
            data : {action: "auxin_export_modal_ajax_handler"},
            success: function(response) {
                var template = document.createElement('div');
                template.innerHTML = response.data.trim();
                template = template.firstChild ;

                var modal = new AuxinDemoToolsModal( $handler[0], {
                    content: template
                })

                var cancelButton           = template.querySelector('.aux-export-cancel-button'),
                    checkBox               = template.querySelector('.aux-export-checkbox input'),
                    exportButton           = template.querySelector('.aux-export-active-button'),
                    activeExportButton     = document.querySelector('.aux-export-button'),
                    activeExportButtonText = activeExportButton.querySelector('span'),
                    sections               = document.querySelectorAll('.elementor-section-wrap > section.elementor-element'),
                    isActive               = false;

                if (!sections.length) {
                    sections = document.querySelectorAll('section.elementor-element:not(.elementor-inner-section)');
                }
                
                checkBox.checked = localStorage.getItem('exportModal');

                // Modal Buttons Events and Handler
                cancelButton.addEventListener('click', function(event){
                    event.preventDefault();
                    modal.closeModal();
                })

                checkBox.addEventListener('change', function(event){
                    localStorage.setItem('exportModal', event.target.checked);
                })

                exportButton.addEventListener('click', function(event){
                    $(document).trigger('AuxExportIsActive');
                    modal.closeModal();
                })

                // Export Button Events and Handler
                activeExportButton.addEventListener('click', function(event){
                    event.preventDefault();

                    if ( isActive ) {
                        $(document).trigger('AuxExportIsDeactive');
                    } else {
                        var displayModal = localStorage.getItem('exportModal');

                        if ( !displayModal ) {
                            modal.showModal();
                        } else {
                            $(document).trigger('AuxExportIsActive');
                        }
                    }

                })

                $(document).on('AuxExportIsActive', function() {

                    if ( isActive ) {
                        return;
                    }

                    activeExportButtonText.innerHTML = 'Disable Export';
                    activeExportButton.classList.add('aux-enabled');

                    ga( 'send', 'event', 'export-section', 'enable', siteSlug );
                    ga( 'author_analytics.send', 'event', 'export-section', 'enable', siteSlug );

                    sections.forEach( function(section, index) {
                        createExportHandler(section, ++index);
                    });

                    isActive = true;

                });

                $(document).on('AuxExportIsDeactive', function() {

                    if ( !isActive ) {
                        return;
                    }

                    activeExportButtonText.innerHTML = 'Export Section';
                    activeExportButton.classList.remove('aux-enabled');

                    ga( 'send', 'event', 'export-section', 'disable', siteSlug );
                    ga( 'author_analytics.send', 'event', 'export-section', 'disable', siteSlug );

                    sections.forEach( function(section) {
                        removeExportHandler(section)
                    });

                    isActive = false;

                });


            }
         })

    };

    $(document).ready(function(){
        $.fn.AuxinExportSectionModalInit();
    });
})(jQuery);
