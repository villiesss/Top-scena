// ============================================
// МОБИЛЬНОЕ МЕНЮ И ИНТЕРАКТИВНОСТЬ
// ============================================

(function() {
    'use strict';

    // DOM Elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const body = document.body;
    
    // State
    let isMenuOpen = false;
    let mobileMenu = null;
    let menuOverlay = null;

    /**
     * Initialize mobile menu structure
     */
    function initMobileMenu() {
        if (!mainNav || !mobileMenuBtn) return;
        
        // Create mobile menu container
        mobileMenu = document.createElement('nav');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.id = 'mobileMenu';
        mobileMenu.setAttribute('aria-label', 'Мобильное меню');
        
        // Clone navigation list
        const navListElement = mainNav.querySelector('.nav-list');
        if (!navListElement) return;
        
        const navList = navListElement.cloneNode(true);
        navList.className = 'mobile-menu__list';
        
        // Update link classes
        const links = navList.querySelectorAll('.nav-link');
        links.forEach(link => {
            link.className = 'mobile-menu__link';
        });
        
        // Update list items
        const items = navList.querySelectorAll('li');
        items.forEach(item => {
            item.className = 'mobile-menu__item';
        });
        
        mobileMenu.appendChild(navList);
        body.appendChild(mobileMenu);
        
        // Create overlay
        menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        menuOverlay.id = 'menuOverlay';
        menuOverlay.setAttribute('aria-hidden', 'true');
        body.appendChild(menuOverlay);
    }

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            openMenu();
        } else {
            closeMenu();
        }
    }

    /**
     * Open mobile menu
     */
    function openMenu() {
        if (!mobileMenu || !menuOverlay || !mobileMenuBtn) return;
        
        mobileMenu.classList.add('active');
        menuOverlay.classList.add('active');
        mobileMenuBtn.classList.add('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'true');
        mobileMenuBtn.setAttribute('aria-label', 'Закрыть меню');
        menuOverlay.setAttribute('aria-hidden', 'false');
        body.classList.add('menu-open');
        
        // Focus management for accessibility
        const firstLink = mobileMenu.querySelector('.mobile-menu__link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        if (!mobileMenu || !menuOverlay || !mobileMenuBtn) return;
        
        mobileMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'Меню');
        menuOverlay.setAttribute('aria-hidden', 'true');
                body.classList.remove('menu-open');
        
        // Return focus to toggle button
        mobileMenuBtn.focus();
    }

    /**
     * Handle smooth scroll to anchor
     * @param {Event} e - Click event
     */
    function handleAnchorClick(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (href === '#' || !href) return;
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            e.preventDefault();
            
            // Close menu if open
            if (isMenuOpen) {
                closeMenu();
            }
            
            // Calculate offset for fixed header
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const targetPosition = targetElement.offsetTop - headerHeight;
                
            // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            
            // Update URL without triggering scroll
            history.pushState(null, null, href);
        }
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        // Close menu on resize to desktop if open
        if (window.innerWidth > 767 && isMenuOpen) {
            closeMenu();
        }
    }

    /**
     * Handle escape key press
     * @param {Event} e - Keyboard event
     */
    function handleEscapeKey(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    }

    /**
     * Handle overlay click
     */
    function handleOverlayClick() {
        if (isMenuOpen) {
            closeMenu();
        }
    }

    /**
     * Initialize event listeners
     */
    function initEventListeners() {
        if (!mobileMenuBtn) return;
        
        // Menu toggle button
        mobileMenuBtn.addEventListener('click', toggleMenu);
        
        // Anchor links in both desktop and mobile menus
        document.addEventListener('click', handleAnchorClick);
        
        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 150);
        });
        
        // Escape key
        document.addEventListener('keydown', handleEscapeKey);
        
        // Overlay click
        if (menuOverlay) {
            menuOverlay.addEventListener('click', handleOverlayClick);
        }
        
        // Prevent body scroll when menu is open (touch devices)
        if (mobileMenu) {
            let touchStartY = 0;
            mobileMenu.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
            });
            
            mobileMenu.addEventListener('touchmove', (e) => {
                const touchY = e.touches[0].clientY;
                const menuScrollTop = mobileMenu.scrollTop;
                const menuHeight = mobileMenu.clientHeight;
                const menuScrollHeight = mobileMenu.scrollHeight;
                
                // Prevent scroll if at top and swiping down, or at bottom and swiping up
                if (
                    (menuScrollTop === 0 && touchY > touchStartY) ||
                    (menuScrollTop + menuHeight >= menuScrollHeight && touchY < touchStartY)
                ) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    /**
     * Initialize application
     */
    function init() {
        // Check if we're on mobile
        if (window.innerWidth <= 767) {
            initMobileMenu();
            initEventListeners();
        } else {
            // Initialize on resize if needed
            window.addEventListener('resize', () => {
                if (window.innerWidth <= 767 && !mobileMenu) {
                    initMobileMenu();
                    initEventListeners();
                }
            });
        }
        
        // Set initial ARIA attributes
        if (mobileMenuBtn) {
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.setAttribute('aria-controls', 'mobileMenu');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for potential external use
    window.mobileMenuController = {
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        isOpen: () => isMenuOpen
    };
})();

document.addEventListener('DOMContentLoaded', function() {

    // Анимации при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Наблюдение за элементами с анимацией
    document.querySelectorAll('.fade-in, .direction-card, .project-card, .news-card, .team-member, .jury-member').forEach(el => {
        observer.observe(el);
    });

    // Динамическое изменение header при прокрутке
    const header = document.getElementById('header');
    if (header) {
        let lastScroll = 0;
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    // Обработка форм
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Отправка...';
                submitBtn.disabled = true;
                
                // Имитация отправки
                setTimeout(() => {
                    submitBtn.textContent = 'Отправлено!';
                    submitBtn.style.background = '#4caf50';
                    
                    setTimeout(() => {
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        form.reset();
                    }, 2000);
                }, 1000);
            }
        });
    });

    // Маскировка телефона
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            // Обработка начала номера
            if (value.length > 0) {
                // Если начинается с 8, заменяем на 7
                if (value[0] === '8') {
                    value = '7' + value.slice(1);
                }
                // Если не начинается с 7, добавляем 7 в начало (если длина позволяет)
                if (value[0] !== '7' && value.length > 0) {
                    value = '7' + value;
                }
                
                // Ограничиваем длину до 11 цифр (7 + 10 цифр)
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                // Форматируем номер
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length > 4) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length > 7) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length > 9) {
                    formatted += '-' + value.slice(9, 11);
                }
                e.target.value = formatted;
            } else {
                e.target.value = '';
            }
        });
        
        // Обработка вставки из буфера обмена
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            let pasted = (e.clipboardData || window.clipboardData).getData('text');
            let value = pasted.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value[0] === '8') {
                    value = '7' + value.slice(1);
                }
                if (value[0] !== '7') {
                    value = '7' + value;
                }
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.slice(1, 4);
                }
                if (value.length > 4) {
                    formatted += ') ' + value.slice(4, 7);
                }
                if (value.length > 7) {
                    formatted += '-' + value.slice(7, 9);
                }
                if (value.length > 9) {
                    formatted += '-' + value.slice(9, 11);
                }
                input.value = formatted;
            }
        });
    });

    // Автоматический выбор категории по возрасту
    const ageInputs = document.querySelectorAll('input[name="age"]');
    const categorySelects = document.querySelectorAll('select[name="category"]');
    
    if (ageInputs.length > 0 && categorySelects.length > 0) {
        ageInputs.forEach(ageInput => {
            ageInput.addEventListener('change', function() {
                const age = parseInt(this.value);
                categorySelects.forEach(select => {
                    if (age >= 5 && age <= 8) {
                        select.value = 'junior';
                    } else if (age >= 9 && age <= 12) {
                        select.value = 'middle';
                    } else if (age >= 13 && age <= 18) {
                        select.value = 'senior';
                    }
                });
            });
        });
    }

    // Остановка анимаций когда вкладка неактивна
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            document.body.style.animationPlayState = 'paused';
        } else {
            document.body.style.animationPlayState = 'running';
        }
    });

    // Разворачивание описаний в секции "Направления деятельности"
    const directionCards = document.querySelectorAll('.direction-card[data-expandable]');
    directionCards.forEach(card => {
        const header = card.querySelector('.direction-header');
        if (!header) return;
        
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            const isExpanded = card.classList.contains('expanded');
            
            // Закрываем все остальные карточки
            directionCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('expanded');
                }
            });
            
            // Переключаем текущую карточку
            if (isExpanded) {
                card.classList.remove('expanded');
            } else {
                card.classList.add('expanded');
            }
        });
    });

    // Masonry Gallery для страницы конкурса
    function initGallery() {
        const galleryContainer = document.getElementById('gallery-container');
        if (!galleryContainer) return;
        
        // Ждем загрузки GSAP
        if (typeof gsap === 'undefined') {
            setTimeout(initGallery, 100);
            return;
        }
        
        const items = [
            {
              id: "1",
              img: "imgs/galery/n1.jpg",
              url: "https://example.com/one",
              height: 400,
              description: "Захватывающее выступление на сцене"
            },
            {
              id: "2",
              img: "imgs/galery/n2.jpg",
              url: "https://example.com/two",
              height: 250,
              description: "Яркое мероприятие с участием талантливых исполнителей"
            },
            {
              id: "3",
              img: "imgs/galery/n3.jpg",
              url: "https://example.com/three",
              height: 600,
              description: "Торжественный момент награждения победителей"
            },
            {
              id: "4",
              img: "imgs/galery/n4.jpg",
              url: "https://example.com/four",
              height: 350,
              description: "Эмоциональное выступление артистов"
            },
            {
              id: "5",
              img: "imgs/galery/n5.jpeg",
              url: "https://example.com/five",
              height: 450,
              description: "Праздничное мероприятие с участием зрителей"
            },
            {
              id: "6",
              img: "imgs/galery/n6.jpeg",
              url: "https://example.com/six",
              height: 300,
              description: "Запоминающийся концерт на главной сцене"
            },
            {
              id: "7",
              img: "imgs/galery/n7.jpg",
              url: "https://example.com/seven",
              height: 380,
              description: "Творческий вечер с выступлениями участников"
            },
        ];
        
        class Masonry {
          constructor(options = {}) {
            this.container = document.getElementById('gallery-container');
            this.items = options.items || [];
            this.ease = options.ease || 'power3.out';
            this.duration = options.duration || 0.6;
            this.stagger = options.stagger || 0.05;
            this.animateFrom = options.animateFrom || 'bottom';
            this.scaleOnHover = options.scaleOnHover !== false;
            this.hoverScale = options.hoverScale || 0.95;
            this.blurToFocus = options.blurToFocus !== false;
            this.colorShiftOnHover = options.colorShiftOnHover || false;
            
            this.imagesReady = false;
            this.hasMounted = false;
            this.hasAnimated = false; // Флаг для отслеживания анимации при прокрутке
            this.columns = this.getColumns();
            this.grid = [];
            
            this.init();
            this.setupScrollAnimation();
          }
          
          setupScrollAnimation() {
            if (!this.container) return;
            
            // Создаем Intersection Observer для отслеживания появления галереи в viewport
            this.observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting && this.imagesReady) {
                  // Запускаем анимацию каждый раз, когда галерея появляется в viewport
                  this.animateOnScroll();
                } else if (!entry.isIntersecting) {
                  // Когда галерея исчезает из viewport, сбрасываем состояние для повторной анимации
                  this.resetAnimationState();
                }
              });
            }, {
              threshold: 0.1, // Запускаем анимацию, когда 10% галереи видно
              rootMargin: '50px' // Начинаем анимацию немного раньше
            });
            
            this.observer.observe(this.container);
          }
          
          resetAnimationState() {
            // Сбрасываем состояние элементов для повторной анимации
            if (!this.grid.length) return;
            
            this.grid.forEach((item) => {
              const selector = `[data-key="${item.id}"]`;
              const element = document.querySelector(selector);
              if (!element) return;
              
              // Останавливаем текущую анимацию
              gsap.killTweensOf(selector);
              
              const initialPos = this.getInitialPosition(item);
              // Устанавливаем начальное состояние (невидимое, снизу)
              gsap.set(selector, {
                opacity: 0,
                x: initialPos.x,
                y: initialPos.y + 100,
                width: item.w,
                height: item.h,
                ...(this.blurToFocus && { filter: 'blur(10px)' })
              });
            });
          }
          
          animateOnScroll() {
            if (!this.imagesReady || !this.grid.length) return;
            
            // Останавливаем все текущие анимации перед запуском новых
            this.grid.forEach((item) => {
              const selector = `[data-key="${item.id}"]`;
              gsap.killTweensOf(selector);
            });
            
            this.grid.forEach((item, index) => {
              const selector = `[data-key="${item.id}"]`;
              const element = document.querySelector(selector);
              if (!element) return;
              
              // Убеждаемся, что начальное состояние установлено
              const initialPos = this.getInitialPosition(item);
              gsap.set(selector, {
                opacity: 0,
                x: initialPos.x,
                y: initialPos.y + 100,
                width: item.w,
                height: item.h,
                ...(this.blurToFocus && { filter: 'blur(10px)' })
              });
              
              // Анимация появления снизу вверх (более медленная)
              gsap.to(selector, {
                opacity: 1,
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h,
                ...(this.blurToFocus && { filter: 'blur(0px)' }),
                duration: 1.5, // Увеличено с 0.8 до 1.5 для более медленной анимации
                ease: 'power3.out',
                delay: index * this.stagger
              });
            });
            
            this.hasMounted = true;
            this.hasAnimated = true;
          }
        
          getColumns() {
            const width = window.innerWidth;
            // Уменьшаем количество колонок в 2 раза, чтобы изображения были в 2 раза шире
            if (width >= 1500) return 3; // было 5
            if (width >= 1000) return 2; // было 4
            if (width >= 600) return 2; // было 3
            if (width >= 400) return 1; // было 2
            return 1;
          }
        
          async preloadImages(urls) {
            await Promise.all(
              urls.map(
                src =>
                  new Promise(resolve => {
                    const img = new Image();
                    img.src = src;
                    img.onload = img.onerror = () => resolve();
                  })
              )
            );
            this.imagesReady = true;
            this.updateLayout();
          }
        
          calculateGrid() {
            if (!this.container) return [];
            
            let width = this.container.offsetWidth;
            if (!width || width === 0) {
              const parent = this.container.parentElement;
              if (parent) {
                width = parent.offsetWidth;
              }
            }
            if (!width || width === 0) {
              width = window.innerWidth - 40;
            }
            
            const colHeights = new Array(this.columns).fill(0);
            const columnWidth = width / this.columns;
        
            const grid = this.items.map(item => {
              const col = colHeights.indexOf(Math.min(...colHeights));
              const x = columnWidth * col;
              const height = item.height; // Увеличено в 2 раза (было item.height / 2)
              const y = colHeights[col];
        
              colHeights[col] += height;
        
              return { ...item, x, y, w: columnWidth, h: height };
            });
            
            // Устанавливаем высоту контейнера
            const maxHeight = Math.max(...colHeights);
            if (maxHeight > 0) {
              this.container.style.height = maxHeight + 'px';
            }
            
            return grid;
          }
        
          getInitialPosition(item) {
            const containerRect = this.container.getBoundingClientRect();
            if (!containerRect) return { x: item.x, y: item.y };
        
            let direction = this.animateFrom;
        
            if (this.animateFrom === 'random') {
              const directions = ['top', 'bottom', 'left', 'right'];
              direction = directions[Math.floor(Math.random() * directions.length)];
            }
        
            switch (direction) {
              case 'top':
                return { x: item.x, y: -200 };
              case 'bottom':
                return { x: item.x, y: window.innerHeight + 200 };
              case 'left':
                return { x: -200, y: item.y };
              case 'right':
                return { x: window.innerWidth + 200, y: item.y };
              case 'center':
                return {
                  x: containerRect.width / 2 - item.w / 2,
                  y: containerRect.height / 2 - item.h / 2
                };
              default:
                return { x: item.x, y: item.y + 100 };
            }
          }
        
          render() {
            if (!this.container) return;
            
            this.container.innerHTML = '';
            
            this.grid.forEach(item => {
              const wrapper = document.createElement('div');
              wrapper.className = 'item-wrapper';
              wrapper.setAttribute('data-key', item.id);
              wrapper.style.cursor = 'pointer';
              
              const imgDiv = document.createElement('div');
              imgDiv.className = 'item-img';
              imgDiv.style.backgroundImage = `url(${item.img})`;
              
              if (this.colorShiftOnHover) {
                const overlay = document.createElement('div');
                overlay.className = 'color-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.background = 'linear-gradient(45deg, rgba(255,0,150,0.5), rgba(0,150,255,0.5))';
                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';
                overlay.style.borderRadius = '8px';
                imgDiv.appendChild(overlay);
              }
              
              wrapper.appendChild(imgDiv);
              
              // Добавляем элемент с описанием
              if (item.description) {
                const descriptionDiv = document.createElement('div');
                descriptionDiv.className = 'item-description';
                descriptionDiv.textContent = item.description;
                wrapper.appendChild(descriptionDiv);
              }
              
              wrapper.addEventListener('click', () => {
                window.open(item.url, '_blank', 'noopener');
              });
              
              wrapper.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, item));
              wrapper.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, item));
              
              this.container.appendChild(wrapper);
            });
          }
        
          updateLayout() {
            if (!this.imagesReady) return;
            if (!this.container) return;
            
            // Убеждаемся, что контейнер виден
            const containerWidth = this.container.offsetWidth || this.container.parentElement?.offsetWidth;
            if (!containerWidth || containerWidth === 0) {
              // Повторяем попытку через небольшую задержку
              setTimeout(() => this.updateLayout(), 100);
              return;
            }
            
            this.columns = this.getColumns();
            this.grid = this.calculateGrid();
            if (this.grid.length === 0) return;
            
            this.render();
            this.animate();
          }
        
          animate() {
            if (!this.imagesReady) return;
            
            // Если анимация при прокрутке еще не запущена, не запускаем обычную анимацию
            // Анимация будет запущена через animateOnScroll при появлении в viewport
            if (!this.hasAnimated) {
              // Устанавливаем начальное состояние элементов (невидимыми)
              this.grid.forEach((item) => {
                const selector = `[data-key="${item.id}"]`;
                const element = document.querySelector(selector);
                if (!element) return;
                
                const initialPos = this.getInitialPosition(item);
                gsap.set(selector, {
                  opacity: 0,
                  x: initialPos.x,
                  y: initialPos.y + 100,
                  width: item.w,
                  height: item.h,
                  ...(this.blurToFocus && { filter: 'blur(10px)' })
                });
              });
              return;
            }
        
            // Если анимация уже была запущена, используем обычную логику для ресайза
            this.grid.forEach((item, index) => {
              const selector = `[data-key="${item.id}"]`;
              const element = document.querySelector(selector);
              if (!element) return;
              
              const animationProps = {
                x: item.x,
                y: item.y,
                width: item.w,
                height: item.h
              };
        
              if (!this.hasMounted) {
                const initialPos = this.getInitialPosition(item);
                const initialState = {
                  opacity: 0,
                  x: initialPos.x,
                  y: initialPos.y,
                  width: item.w,
                  height: item.h,
                };
                
                if (this.blurToFocus) {
                  initialState.filter = 'blur(10px)';
                }
        
                gsap.fromTo(selector, initialState, {
                  opacity: 1,
                  ...animationProps,
                  ...(this.blurToFocus && { filter: 'blur(0px)' }),
                  duration: 0.8,
                  ease: 'power3.out',
                  delay: index * this.stagger
                });
              } else {
                gsap.to(selector, {
                  ...animationProps,
                  duration: this.duration,
                  ease: this.ease,
                  overwrite: 'auto'
                });
              }
            });
        
            this.hasMounted = true;
          }
        
          handleMouseEnter(e, item) {
            const selector = `[data-key="${item.id}"]`;
        
            if (this.scaleOnHover) {
              gsap.to(selector, {
                scale: this.hoverScale,
                duration: 0.3,
                ease: 'power2.out'
              });
            }
        
            if (this.colorShiftOnHover) {
              const overlay = e.currentTarget.querySelector('.color-overlay');
              if (overlay) {
                gsap.to(overlay, {
                  opacity: 0.3,
                  duration: 0.3
                });
              }
            }
            
            // Анимация появления описания снизу вверх
            const description = e.currentTarget.querySelector('.item-description');
            if (description) {
              gsap.fromTo(description, 
                {
                  opacity: 0,
                  y: 20
                },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.4,
                  ease: 'power2.out'
                }
              );
            }
          }
        
          handleMouseLeave(e, item) {
            const selector = `[data-key="${item.id}"]`;
        
            if (this.scaleOnHover) {
              gsap.to(selector, {
                scale: 1,
                duration: 0.3,
                ease: 'power2.out'
              });
            }
        
            if (this.colorShiftOnHover) {
              const overlay = e.currentTarget.querySelector('.color-overlay');
              if (overlay) {
                gsap.to(overlay, {
                  opacity: 0,
                  duration: 0.3
                });
              }
            }
            
            // Анимация скрытия описания
            const description = e.currentTarget.querySelector('.item-description');
            if (description) {
              gsap.to(description, {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: 'power2.in'
              });
            }
          }
        
          init() {
            // Preload images
            this.preloadImages(this.items.map(i => i.img));
            
            // Handle window resize
            let resizeTimer;
            window.addEventListener('resize', () => {
              clearTimeout(resizeTimer);
              resizeTimer = setTimeout(() => {
                this.updateLayout();
              }, 250);
            });
          }
        }
        
        // Initialize gallery
        new Masonry({
          items: items,
          ease: "power3.out",
          duration: 0.6,
          stagger: 0.05,
          animateFrom: "bottom",
          scaleOnHover: true,
          hoverScale: 0.95,
          blurToFocus: true,
          colorShiftOnHover: false
        });
    }
    
    // Инициализация галереи
    initGallery();
});