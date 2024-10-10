document.addEventListener('DOMContentLoaded', () => {
    // DOM element selections
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const body = document.body;
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const homeSection = document.querySelector('#home');
    const homeContent = document.querySelector('.home-content');
    const aboutSection = document.querySelector('#about');
    const header = document.querySelector('header');
    const cartIcon = document.querySelector('.cart-icon');
    const medicinesGrid = document.querySelector('.medicines-grid');
    const categorySelect = document.getElementById('medicine-category');
    const medicineCategories = document.querySelectorAll('.medicine-category');
    const closeMenu = document.querySelector('.close-menu');
    const mapIframe = document.querySelector('.map-container iframe');

    const cartItems = [];
    const animatedSections = document.querySelectorAll('#services, #medicines, #about, #contact');

    // Initialize page
    initializePage();
    if (homeSection) {
        setupHomeBackground();
    }

    // Event listeners
    setupEventListeners();

    // Functions
    function initializePage() {
        navLinks[0].classList.add('active');
        setTimeout(() => window.scrollTo(0, 0), 0);
        if (window.location.hash) {
            history.replaceState(null, document.title, window.location.pathname);
        }
    }

    function setupEventListeners() {
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }
        
        document.querySelector('.nav-menu').addEventListener('click', handleNavMenuClick);
        window.addEventListener('scroll', handleScroll);
        
        if (medicinesGrid) {
            medicinesGrid.addEventListener('click', handleMedicineGridClick);
        }
        
        if (categorySelect) {
            categorySelect.addEventListener('change', handleCategoryChange);
        }
        
        if (closeMenu) {
            closeMenu.addEventListener('click', closeMobileMenu);
        }
        
        document.addEventListener('click', handleOutsideClick);
        
        if (mapIframe) {
            mapIframe.addEventListener('error', handleMapError);
        }
        
        window.addEventListener('load', checkSectionVisibility);
        
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavLinkClick);
        });
    }

    function handleNavMenuClick(e) {
        if (e.target.closest('a')) {
            handleNavLinkClick(e);
        }
    }

    function handleScroll() {
        updateActiveLink();
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
    }

    function handleMapError() {
        this.style.display = 'none';
        const mapFallback = document.querySelector('.map-fallback');
        if (mapFallback) {
            mapFallback.style.display = 'block';
        }
    }

    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        nav.classList.toggle('active');
        body.classList.toggle('menu-open');
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

    function smoothScrollTo(targetId) {
        const targetSection = document.querySelector(targetId);
        if (!targetSection) {
            console.warn(`Target section ${targetId} not found`);
            return;
        }
        const headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
        const y = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({top: y, behavior: 'smooth'});
    }

    function updateActiveNavLink(clickedLink) {
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
        body.classList.remove('menu-open');
    }

    function updateActiveLink() {
        const scrollPosition = window.scrollY;

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach((link) => link.classList.remove('active'));
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
        homeSection.insertBefore(bgDiv, homeSection.firstChild);

        window.addEventListener('scroll', () => {
            bgDiv.style.transform = `translateY(${window.pageYOffset * 0.3}px)`;
        });
    }

    function updateCartCount() {
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = cartIcon.querySelector('.cart-count');
        
        if (totalItems > 0) {
            if (!cartCountElement) {
                const countSpan = document.createElement('span');
                countSpan.classList.add('cart-count');
                cartIcon.appendChild(countSpan);
            }
            cartIcon.querySelector('.cart-count').textContent = totalItems;
        } else if (cartCountElement) {
            cartIcon.removeChild(cartCountElement);
        }
    }

    function addToCart(id, name, price, quantity) {
        const existingItem = cartItems.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({ id, name, price, quantity });
        }
        
        updateCartCount();
        
        const message = document.createElement('div');
        message.textContent = `Added ${quantity} ${name} to cart!`;
        message.classList.add('add-to-cart-message');
        event.target.parentNode.appendChild(message);
        setTimeout(() => message.remove(), 2000);
    }

    function handleMedicineGridClick(event) {
        if (event.target.classList.contains('decrease-quantity')) {
            const quantitySpan = event.target.nextElementSibling;
            let quantity = parseInt(quantitySpan.textContent);
            if (quantity > 1) {
                quantitySpan.textContent = quantity - 1;
            }
        } else if (event.target.classList.contains('increase-quantity')) {
            const quantitySpan = event.target.previousElementSibling;
            let quantity = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = quantity + 1;
        } else if (event.target.classList.contains('add-to-cart-btn')) {
            const medicineItem = event.target.closest('.medicine-item');
            const quantity = parseInt(medicineItem.querySelector('.quantity').textContent);
            const id = event.target.dataset.id;
            const name = event.target.dataset.name;
            const price = parseFloat(event.target.dataset.price);
            
            addToCart(id, name, price, quantity);
        }
    }

    function handleCategoryChange(e) {
        const selectedCategory = e.target.value;
        medicineCategories.forEach(category => {
            category.style.display = selectedCategory === 'all' || category.dataset.category === selectedCategory ? 'block' : 'none';
        });
    }

    function handleOutsideClick(event) {
        if (!nav.contains(event.target) && !hamburger.contains(event.target)) {
            nav.classList.remove('active');
        }
    }

    function checkSectionVisibility() {
        animatedSections.forEach(section => {
            if (section) {
                section.style.opacity = 1;
            }
        });
    }
});