document.addEventListener('DOMContentLoaded', () => {
    // DOM element selections
    const elements = {
        hamburger: document.querySelector('.hamburger'),
        nav: document.querySelector('nav'),
        body: document.body,
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('.nav-menu a'),
        homeSection: document.querySelector('#home'),
        header: document.querySelector('header'),
        cartIcon: document.querySelector('.cart-icon'),
        medicinesGrid: document.querySelector('.medicines-grid'),
        categorySelect: document.getElementById('medicine-category'),
        medicineCategories: document.querySelectorAll('.medicine-category'),
        closeMenu: document.querySelector('.close-menu'),
        mapIframe: document.querySelector('.map-container iframe'),
        animatedSections: document.querySelectorAll('#services, #medicines, #about, #contact')
    };

    const state = {
        cartItems: []
    };

    // Initialize page
    initializePage();
    setupEventListeners();

    // Core functions
    function initializePage() {
        elements.navLinks[0].classList.add('active');
        setTimeout(() => window.scrollTo(0, 0), 0);
        if (window.location.hash) {
            history.replaceState(null, document.title, window.location.pathname);
        }
        if (elements.homeSection) {
            setupHomeBackground();
        }
    }

    function setupEventListeners() {
        if (elements.hamburger) {
            elements.hamburger.addEventListener('click', toggleMobileMenu);
        }
        
        document.querySelector('.nav-menu').addEventListener('click', handleNavMenuClick);
        window.addEventListener('scroll', handleScroll);
        
        if (elements.medicinesGrid) {
            elements.medicinesGrid.addEventListener('click', handleMedicineGridClick);
        }
        
        if (elements.categorySelect) {
            elements.categorySelect.addEventListener('change', handleCategoryChange);
        }
        
        if (elements.closeMenu) {
            elements.closeMenu.addEventListener('click', closeMobileMenu);
        }
        
        document.addEventListener('click', handleOutsideClick);
        
        if (elements.mapIframe) {
            elements.mapIframe.addEventListener('error', handleMapError);
        }
        
        window.addEventListener('load', checkSectionVisibility);
        
        elements.navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
    }

    // Event handlers
    function handleNavMenuClick(e) {
        if (e.target.closest('a')) {
            handleNavLinkClick(e);
        }
    }

    function handleScroll() {
        updateActiveLink();
        if (elements.header) {
            elements.header.classList.toggle('scrolled', window.scrollY > 50);
        }
    }

    function handleMapError() {
        this.style.display = 'none';
        const mapFallback = document.querySelector('.map-fallback');
        if (mapFallback) {
            mapFallback.style.display = 'block';
        }
    }

    function handleNavLinkClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            smoothScrollTo(targetId);
            updateActiveNavLink(e.currentTarget);
            closeMobileMenu();
        }
    }

    function handleMedicineGridClick(event) {
        if (event.target.classList.contains('decrease-quantity')) {
            updateQuantity(event.target.nextElementSibling, -1);
        } else if (event.target.classList.contains('increase-quantity')) {
            updateQuantity(event.target.previousElementSibling, 1);
        } else if (event.target.classList.contains('add-to-cart-btn')) {
            const medicineItem = event.target.closest('.medicine-item');
            const quantity = parseInt(medicineItem.querySelector('.quantity').textContent);
            const { id, name, price } = event.target.dataset;
            addToCart(id, name, parseFloat(price), quantity);
        }
    }

    function handleCategoryChange(e) {
        const selectedCategory = e.target.value;
        elements.medicineCategories.forEach(category => {
            category.style.display = selectedCategory === 'all' || category.dataset.category === selectedCategory ? 'block' : 'none';
        });
    }

    function handleOutsideClick(event) {
        if (!elements.nav.contains(event.target) && !elements.hamburger.contains(event.target)) {
            elements.nav.classList.remove('active');
        }
    }

    // Helper functions
    function toggleMobileMenu() {
        elements.hamburger.classList.toggle('active');
        elements.nav.classList.toggle('active');
        elements.body.classList.toggle('menu-open');
    }

    function closeMobileMenu() {
        elements.hamburger.classList.remove('active');
        elements.nav.classList.remove('active');
        elements.body.classList.remove('menu-open');
    }

    function smoothScrollTo(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) {
            console.warn(`Target section ${targetId} not found`);
            return;
        }
        const headerHeight = elements.header ? elements.header.offsetHeight : 0;
        const y = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({top: y, behavior: 'smooth'});
    }

    function updateActiveNavLink(clickedLink) {
        elements.navLinks.forEach(navLink => navLink.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    function updateActiveLink() {
        const scrollPosition = window.scrollY;

        elements.sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                elements.navLinks.forEach((link) => link.classList.remove('active'));
                const correspondingLink = document.querySelector(`.nav-menu a[href="#${section.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    function setupHomeBackground() {
        const bgDiv = document.createElement('div');
        bgDiv.classList.add('home-background');
        elements.homeSection.insertBefore(bgDiv, elements.homeSection.firstChild);

        window.addEventListener('scroll', () => {
            bgDiv.style.transform = `translateY(${window.pageYOffset * 0.3}px)`;
        });
    }

    function updateCartCount() {
        const totalItems = state.cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = elements.cartIcon.querySelector('.cart-count');
        
        if (totalItems > 0) {
            if (!cartCountElement) {
                const countSpan = document.createElement('span');
                countSpan.classList.add('cart-count');
                elements.cartIcon.appendChild(countSpan);
            }
            elements.cartIcon.querySelector('.cart-count').textContent = totalItems;
        } else if (cartCountElement) {
            elements.cartIcon.removeChild(cartCountElement);
        }
    }

    function addToCart(id, name, price, quantity) {
        const existingItem = state.cartItems.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            state.cartItems.push({ id, name, price, quantity });
        }
        
        updateCartCount();
        showAddToCartMessage(name, quantity);
    }

    function showAddToCartMessage(name, quantity) {
        const message = document.createElement('div');
        message.textContent = `Added ${quantity} ${name} to cart!`;
        message.classList.add('add-to-cart-message');
        event.target.parentNode.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }

    function updateQuantity(quantitySpan, change) {
        let quantity = parseInt(quantitySpan.textContent);
        quantity = Math.max(1, quantity + change);
        quantitySpan.textContent = quantity;
    }

    function checkSectionVisibility() {
        elements.animatedSections.forEach(section => {
            if (section) {
                section.style.opacity = 1;
            }
        });
    }
});
