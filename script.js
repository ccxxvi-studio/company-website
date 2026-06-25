/**
 * CCXXVI Studio - Interactive Behaviors
 * Merged with Downloads Design Theme.
 * Implements: Sticky header transitions, reveal-on-scroll IntersectionObserver,
 * scrollspy highlights, mobile overlay toggle, category list refiltering,
 * and a premium, keyboard-navigated lightbox viewer.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Shared Navigation Elements
  const header = document.getElementById('siteNav');
  const menuToggle = document.getElementById('navBurger');
  const navMenu = document.getElementById('navLinks');
  const navLinks = document.querySelectorAll('.nav-link');

  /* ==========================================================================
     1. Shared Menu Controls (Mobile Menu Toggle)
     ========================================================================== */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const active = menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', active ? 'true' : 'false');
    });

    // Close Mobile Menu on Nav link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ==========================================================================
     2. Generic Reveal-on-Scroll Utility (IntersectionObserver)
     ========================================================================== */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ==========================================================================
     3. Homepage Logic (Scrollspy, Sticky Nav, Contact Form)
     ========================================================================== */
  const isHomepage = document.getElementById('home') !== null;
  
  if (isHomepage) {
    const sections = document.querySelectorAll('section');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // Toggle Header Background on Scroll
    const handleScroll = () => {
      if (window.scrollY > 8) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      
      // Scrollspy active tab highlight
      let currentActive = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= (sectionTop - 150)) {
          currentActive = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href.startsWith('#') && href === `#${currentActive}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial run

    // Contact Form handling
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('contact-name').value.trim();
        const emailVal = document.getElementById('contact-email').value.trim();
        const companyVal = document.getElementById('contact-company').value.trim() || 'N/A';
        const messageVal = document.getElementById('contact-message').value.trim();

        if (!nameVal || !emailVal || !messageVal) {
          formStatus.textContent = 'Please fill out all required fields.';
          formStatus.className = 'form-status error';
          return;
        }

        formStatus.textContent = 'Redirecting to your email client...';
        formStatus.className = 'form-status success';
        
        const emailTo = 'shawn.huang.rd@ccxxvi.com';
        const emailSubject = `Inquiry: CCXXVI Studio - From ${nameVal}`;
        const emailBody = `Dear CCXXVI Studio Team,

I would like to inquire about your product engineering services. Here are my details:

Name: ${nameVal}
Email: ${emailVal}
Company: ${companyVal}

Message:
${messageVal}

Regards,
${nameVal}`;

        setTimeout(() => {
          window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          
          contactForm.reset();
          const inputs = contactForm.querySelectorAll('.form-input');
          inputs.forEach(input => input.blur());
          
          setTimeout(() => {
            formStatus.textContent = 'Email client opened. Feel free to send the email!';
          }, 2000);
        }, 800);
      });
    }
  }

  /* ==========================================================================
     4. Services Standalone Archive Logic (Alternating Grid & Lightbox)
     ========================================================================== */
  const isServicesPage = document.body.classList.contains('services-page');

  if (isServicesPage) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const projectItems = document.querySelectorAll('.feed__item');
    const projectsGrid = document.getElementById('projects-grid');
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    const serviceTexts = {
      all: {
        title: "Services Archive",
        desc: "Explore our visual collection of active projects, technical sketches, and physical design prototypes categorized across our primary engineering sectors."
      },
      footwear: {
        title: "Footwear - Design, Prototype, Production",
        desc: "From conceptual sketching and ergonomic engineering to advanced prototyping and mass production, we design next-generation footwear that balances style, comfort, and performance."
      },
      garment: {
        title: "Garment - Design, Prototype, Production",
        desc: "We push the boundaries of apparel design, integrating functional textile engineering with modern silhouettes to create high-quality prototypes across sportswear, streetwear, and technical outerwear."
      },
      accessory: {
        title: "Accessory - Design, Prototype, Production",
        desc: "We deliver comprehensive product development services, ensuring every physical product like headgear, wearable device, and sport equipment we design is optimized for manufacturing, user experience, and aesthetic excellence"
      }
    };

    let visibleProjects = Array.from(projectItems);
    let currentLightboxIndex = 0;

    // Filter Logic with Dynamic Header updates
    const filterProjects = (filterVal) => {
      visibleProjects = [];

      // Update headers dynamically
      const headerTitle = document.querySelector('.projects-header .section__title');
      const headerDesc = document.querySelector('.projects-intro p');
      if (headerTitle && headerDesc && serviceTexts[filterVal]) {
        headerTitle.textContent = serviceTexts[filterVal].title;
        headerDesc.textContent = serviceTexts[filterVal].desc;
      }
      
      projectItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filterVal === 'all' || category === filterVal) {
          item.classList.remove('hidden');
          visibleProjects.push(item);
        } else {
          item.classList.add('hidden');
        }
      });

      // Show visible elements (without alternate-even order calculation)
      visibleProjects.forEach((item) => {
        // Triggers fade up animation
        setTimeout(() => {
          item.classList.add('is-visible');
        }, 100);
      });
      
      // Smooth grid fade transition
      projectsGrid.style.opacity = '0.99';
      setTimeout(() => {
        projectsGrid.style.opacity = '1';
      }, 50);
    };

    // Filter Tabs click handlers
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filterVal = tab.getAttribute('data-filter');
        
        // Update active tab states
        filterTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        
        filterProjects(filterVal);
      });
    });

    // Lightbox open function (no captions or titles)
    const openLightbox = (index) => {
      currentLightboxIndex = index;
      const activeItem = visibleProjects[currentLightboxIndex];
      if (!activeItem) return;

      const imgElement = activeItem.querySelector('.project-item-img');
      
      lightboxImg.src = imgElement.src;
      lightboxImg.alt = imgElement.alt || '';
      
      lightboxCaption.textContent = ''; // Explicitly clear any caption details
      lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${visibleProjects.length}`;
      
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    // Lightbox close function
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 300);
    };

    // Lightbox navigation (prev/next)
    const navigateLightbox = (direction) => {
      if (visibleProjects.length <= 1) return;
      
      let newIndex = currentLightboxIndex + direction;
      if (newIndex < 0) {
        newIndex = visibleProjects.length - 1;
      } else if (newIndex >= visibleProjects.length) {
        newIndex = 0;
      }
      
      openLightbox(newIndex);
    };

    // Attach click listeners to visible images in feed
    projectItems.forEach(item => {
      const mediaWrapper = item.querySelector('.feed__media');
      mediaWrapper.addEventListener('click', () => {
        const indexInVisible = visibleProjects.indexOf(item);
        if (indexInVisible !== -1) {
          openLightbox(indexInVisible);
        }
      });
    });

    // Lightbox close hooks
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
        closeLightbox();
      }
    });

    // Lightbox arrow click hooks
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(-1);
    });
    
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      navigateLightbox(1);
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') navigateLightbox(-1);
      else if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // URL Query Parameter Filtering
    const parseUrlCategory = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const targetCategory = urlParams.get('category');
      
      if (targetCategory && ['footwear', 'garment', 'accessory'].includes(targetCategory)) {
        // Trigger tab active state
        filterTabs.forEach(tab => {
          const tabFilter = tab.getAttribute('data-filter');
          if (tabFilter === targetCategory) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
          } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
          }
        });
        
        // Filter elements
        filterProjects(targetCategory);
      } else {
        filterProjects('all');
      }
    };

    parseUrlCategory(); // Run parser on load
  }
});
