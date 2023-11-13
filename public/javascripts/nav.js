(function ($) {
    $(function () {
  
  
      var scrollX,
          scrollY,
          hoverTimer,
          openPanel = false,
          clickEvent = (function () {
            return 'click';
          })();
  
        // Activate menu on click
        $('.js-ag-menu_btn').on(clickEvent, function () {
          var $this = $(this);
          var navCount = $('.js-ag-nav_nav').length;
          if ($('body').hasClass('js-ag-panel_open')) {
            closeNav();
          } else {
            openNav();
          }
        });
  
        // Deactivate menu on backdrop
        $('.js-ag-content_backdrop').on(clickEvent, function () {
          if ($('body').hasClass('js-ag-panel_open')) {
            closeNav();
          }
        });
  
        // Open Panel
        function openNav() {
          openPanel = true;
          scrollX = window.pageXOffset;
          scrollY = window.pageYOffset;
          $('body').addClass('js-ag-panel_open');
          $('.js-ag-menu_btn').addClass('js-ag-active');
          $('.js-ag-nav_nav').addClass('js-ag-active');
  
          // Smooth enter menu items
          setTimeout(function () {
            $('.js-ag-nav_item').each(function (i) {
              var navItem = $(this);
              setTimeout(function () {
                if (openPanel === true) {
                  navItem.css({
                    'transform': 'translateX(0)',
                    'opacity': '1'
                  });
                }
              }, i * 50);
            });
          }, 150);
        }
  
        // Close Panel
        function closeNav() {
          openPanel = false;
          $('body').removeClass('js-ag-panel_open');
          $('.js-ag-menu_btn').removeClass('js-ag-active');
          $('.js-ag-nav_nav').removeClass('js-ag-active');
          $('.js-ag-nav_item').css({
            'transform': 'translateX(100%)',
            'opacity': '0'
          });
        }
  
        function disableScroll() {
          $(window).scroll(function () {
            if ($('body').hasClass('js-ag-panel_open')) {
              window.scrollTo(scrollX, scrollY);
            }
          });
        }
  
        if (window.innerWidth > 768) {
  
          // Submenu hover
          $('.js-ag-nav_sub-link').on({
            mouseenter: function () {
              $('.js-ag-sub-nav_list').removeClass('js-ag-active');
              $(this).next().addClass('js-ag-active');
              clearTimeout(hoverTimer);
            },
            mouseleave: function () {
              var subPanel = $(this).next();
              hoverTimer = setTimeout(function () {
                subPanel.removeClass('js-ag-active');
              }, 700);
            }
          });
  
          $('.js-ag-sub-nav_list').on({
            mouseenter: function () {
              clearTimeout(hoverTimer);
            },
            mouseleave: function () {
              var subPanel = $(this);
              hoverTimer = setTimeout(function () {
                subPanel.removeClass('js-ag-active');
              }, 700);
            }
          });
        } else if (window.innerWidth <= 768) {
  
          disableScroll();
  
          // Submenu Click
          $('.js-ag-nav_sub-link').on(clickEvent, function () {
            if ($(this).next().hasClass('js-ag-active')) {
              $(this).next().removeClass('js-ag-active');
            } else {
              $(this).next().addClass('js-ag-active');
            }
          });
        }
  
  
    });
  })(jQuery);