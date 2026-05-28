/* --------------------------------------------------
   Frances Decor - Main Orchestration Script
   GSAP, ScrollTrigger, Lenis, Gallery & UI Integrations
-------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  
  // --------------------------------------------------
  // 1. Lenis Smooth Scrolling Initialization
  // --------------------------------------------------
  let lenis;
  try {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Synchronize ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
  } catch (e) {
    console.warn("Lenis not loaded via CDN; falling back to native smooth scrolling.");
  }

  // --------------------------------------------------
  // 2. Custom Interactive Cursor Follower
  // --------------------------------------------------
  const cursorDot = document.querySelector('.custom-cursor');
  const cursorGlow = document.querySelector('.cursor-glow');
  
  let mouseX = 0, mouseY = 0; // Actual mouse position
  let dotX = 0, dotY = 0;     // Lerped positions
  let glowX = 0, glowY = 0;
  
  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Fade in cursor elements on movement
    if (cursorDot) cursorDot.style.opacity = 1;
    if (cursorGlow) cursorGlow.style.opacity = 1;
  });
  
  function updateCursor() {
    dotX = lerp(dotX, mouseX, 0.25);
    dotY = lerp(dotY, mouseY, 0.25);
    
    glowX = lerp(glowX, mouseX, 0.08);
    glowY = lerp(glowY, mouseY, 0.08);
    
    if (cursorDot) {
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
    }
    
    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }
    
    requestAnimationFrame(updateCursor);
  }
  
  updateCursor();

  // Hover state expansions for cursor dot
  const interactiveElements = document.querySelectorAll('a, button, .gallery-item, .service-card, input, textarea');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (cursorDot) {
        cursorDot.style.width = '30px';
        cursorDot.style.height = '30px';
        cursorDot.style.backgroundColor = 'var(--color-gold-bright)';
      }
    });
    el.addEventListener('mouseleave', () => {
      if (cursorDot) {
        cursorDot.style.width = '10px';
        cursorDot.style.height = '10px';
        cursorDot.style.backgroundColor = 'var(--color-gold)';
      }
    });
  });

  // --------------------------------------------------
  // 3. Navigation Bar & Scroll Thresholds
  // --------------------------------------------------
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Operations
  const menuToggle = document.querySelector('.mobile-nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu .nav-link');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      
      // Toggle Lenis scroll state to prevent background scroll
      if (mobileMenu.classList.contains('open')) {
        if (lenis) lenis.stop();
      } else {
        if (lenis) lenis.start();
      }
    });
    
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        if (lenis) lenis.start();
      });
    });
  }

  // Active Navigation link mapping on scroll
  const sections = document.querySelectorAll('section, .hero');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Dynamic Anchor Scroll overrides using Lenis
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: -80, duration: 1.5 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // --------------------------------------------------
  // 4. GSAP & ScrollTrigger Luxury Cinematic Animations
  // --------------------------------------------------
  
  // Hero Entrance Timelines
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.5 } });
  
  heroTl.to('.hero-tagline', { opacity: 1, y: 0, delay: 0.5 })
        .to('.hero-title', { opacity: 1, y: 0 }, '-=1.0')
        .to('.hero-buttons', { opacity: 1, y: 0 }, '-=1.1');
        
  // Scroll-Triggered reveals for Section Headings
  const textReveals = document.querySelectorAll('.section-title, .section-subtitle');
  textReveals.forEach((text) => {
    gsap.fromTo(text, 
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: text,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
  
  // About Section: Grid elements reveal
  gsap.fromTo('.about-img-frame',
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about',
        start: 'top 75%'
      }
    }
  );
  
  gsap.fromTo('.about-content > *',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.25,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.about-content',
        start: 'top 75%'
      }
    }
  );
  
  // Services Grid Cards staggered drift
  gsap.fromTo('.service-card',
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1.4,
      stagger: 0.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.services-grid',
        start: 'top 80%'
      }
    }
  );

  // Gallery items fade-up reveal on scroll
  gsap.fromTo('.gallery-item',
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.gallery-grid',
        start: 'top 85%'
      }
    }
  );
  
  // Instagram items staggered reveal
  gsap.fromTo('.instagram-card',
    { opacity: 0, scale: 0.95 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.instagram-grid',
        start: 'top 85%'
      }
    }
  );

  // --------------------------------------------------
  // 5. Signature Wedding Gallery Category Filter, Lightbox & 3D Panoramic
  // --------------------------------------------------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const galleryGrid = document.querySelector('.gallery-grid');
  const gallerySection = document.querySelector('#gallery');

  const galleryPrevBtn = document.querySelector('.gallery-nav-btn.prev');
  const galleryNextBtn = document.querySelector('.gallery-nav-btn.next');

  let galleryCenterIndex = 0;

  // Dynamically calculates and applies the beautiful cylindrical 3D arc transforms to visible items
  function applyGallery3DCurve(animate = true) {
    if (!galleryGrid) return;
    
    // Get currently visible items (not hidden by category filter)
    const visibleItems = Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));
    const count = visibleItems.length;
    
    if (count === 0) return;
    
    // Safety check for index out of bounds
    if (galleryCenterIndex < 0) galleryCenterIndex = 0;
    if (galleryCenterIndex >= count) galleryCenterIndex = count - 1;
    
    visibleItems.forEach((item, i) => {
      const d = i - galleryCenterIndex;
      
      // Calculate dynamic curve parameters based on distance from center card
      const rotateY = -d * 14;                  // dynamic cylindrical slant
      const translateZ = 30 - Math.abs(d) * 35;     // concave depth positioning
      
      // Translate horizontally by a larger multiplier to slide them dynamically off the screen
      const translateX = -d * 180;              
      
      const scale = 1 - Math.abs(d) * 0.08;        // scale down peripheral cards
      const zIndex = 10 - Math.abs(d);           // center spotlight card stack on top
      const opacity = Math.max(0, 1 - Math.abs(d) * 0.35); // dim outer cards completely
      
      // Store default values on element datasets for smooth hover recovery
      item.dataset.rotateY = rotateY;
      item.dataset.translateZ = translateZ;
      item.dataset.translateX = translateX;
      item.dataset.scale = scale;
      item.dataset.zIndex = zIndex;
      item.dataset.opacity = opacity;
      
      if (animate) {
        gsap.to(item, {
          rotateY: rotateY,
          z: translateZ,
          x: translateX,
          scale: scale,
          zIndex: zIndex,
          opacity: opacity,
          duration: 0.85,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        gsap.set(item, {
          rotateY: rotateY,
          z: translateZ,
          x: translateX,
          scale: scale,
          zIndex: zIndex,
          opacity: opacity
        });
      }
    });
  }

  // Set initial panoramic view active and draw curve instantly on page load
  if (galleryGrid) {
    galleryGrid.classList.add('panoramic-active');
    
    // Set initial center index to center card
    const visibleItems = Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));
    galleryCenterIndex = Math.floor(visibleItems.length / 2);
    
    applyGallery3DCurve(false);
  }

  // Set hover events on all gallery items
  galleryItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      if (!galleryGrid || !galleryGrid.classList.contains('panoramic-active')) return;

      const visibleItems = Array.from(galleryItems).filter((el) => !el.classList.contains('hidden'));
      
      visibleItems.forEach((el) => {
        if (el === item) {
          // Focus and bring hovered card straight to the front (straighten rotation)
          gsap.to(el, {
            rotateY: 0,
            z: 80,
            x: 0,
            scale: 1.15,
            opacity: 1,
            zIndex: 20,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          // Blur and dim peripheral non-hovered cards
          gsap.to(el, {
            opacity: 0.4,
            filter: 'grayscale(20%) blur(0.8px)',
            scale: parseFloat(el.dataset.scale) * 0.95,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    });

    item.addEventListener('mouseleave', () => {
      if (!galleryGrid || !galleryGrid.classList.contains('panoramic-active')) return;

      const visibleItems = Array.from(galleryItems).filter((el) => !el.classList.contains('hidden'));
      
      visibleItems.forEach((el) => {
        // Smoothly restore elements back to their computed cylindrical coordinates
        gsap.to(el, {
          rotateY: parseFloat(el.dataset.rotateY),
          z: parseFloat(el.dataset.translateZ),
          x: parseFloat(el.dataset.translateX),
          scale: parseFloat(el.dataset.scale),
          opacity: parseFloat(el.dataset.opacity),
          zIndex: parseInt(el.dataset.zIndex, 10),
          filter: 'none',
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    });
  });
  
  // Dynamic Category Tab Filters click listener with staggered 3D Swap
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;

      // Toggle active status
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');

      // Phase 1: Smoothly fade and shrink current cards backward
      gsap.to(galleryItems, {
        opacity: 0,
        scale: 0.8,
        z: -60,
        duration: 0.35,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          // Phase 2: Toggle hidden state
          galleryItems.forEach((item) => {
            const itemCategory = item.getAttribute('data-category');
            
            if (filterValue === 'all' || itemCategory === filterValue) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
            }
          });

          // Reset center index to middle of new category
          const visibleItems = Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));
          galleryCenterIndex = Math.floor(visibleItems.length / 2);

          // Phase 3: Recalculate 3D curved coordinates and expand visible items into place
          applyGallery3DCurve(true);
          
          // Refresh ScrollTrigger to recalculate heights of shifted gallery columns
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 150);
        }
      });
    });
  });

  // Gallery circular navigation arrows click events
  if (galleryPrevBtn) {
    galleryPrevBtn.addEventListener('click', () => {
      const visibleItems = Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));
      const count = visibleItems.length;
      if (count > 0) {
        galleryCenterIndex = (galleryCenterIndex - 1 + count) % count;
        applyGallery3DCurve(true);
      }
    });
  }

  if (galleryNextBtn) {
    galleryNextBtn.addEventListener('click', () => {
      const visibleItems = Array.from(galleryItems).filter((item) => !item.classList.contains('hidden'));
      const count = visibleItems.length;
      if (count > 0) {
        galleryCenterIndex = (galleryCenterIndex + 1) % count;
        applyGallery3DCurve(true);
      }
    });
  }

  // Immersive 3D Parallax Stage Rotation on Mouse Move
  let isMouseInGallery = false;

  if (gallerySection && galleryGrid) {
    gallerySection.addEventListener('mouseenter', () => {
      isMouseInGallery = true;
    });

    gallerySection.addEventListener('mouseleave', () => {
      isMouseInGallery = false;
      // Smoothly return stage to rest position when cursor leaves
      if (galleryGrid.classList.contains('panoramic-active')) {
        gsap.to(galleryGrid, {
          rotateY: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'power3.out'
        });
      }
    });

    gallerySection.addEventListener('mousemove', (e) => {
      if (!isMouseInGallery || !galleryGrid.classList.contains('panoramic-active')) return;

      const rect = gallerySection.getBoundingClientRect();
      const x = e.clientX - rect.left; // horizontal coordinate relative to section
      const y = e.clientY - rect.top;  // vertical coordinate relative to section

      // Compute percentage from center point
      const deltaX = (x / rect.width) - 0.5; // range [-0.5, 0.5]
      const deltaY = (y / rect.height) - 0.5; // range [-0.5, 0.5]

      // Rotate stage dynamically using GSAP for a fluid, floating parallax look
      gsap.to(galleryGrid, {
        rotateY: -deltaX * 22, // rotate on Y axis
        rotateX: deltaY * 12,  // rotate on X axis
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  // --------------------------------------------------
  // 5.5. Instagram Visual Diaries 3D Curved Slider & Parallax
  // --------------------------------------------------
  const instagramGrid = document.querySelector('.instagram-grid');
  const instagramCards = document.querySelectorAll('.instagram-card');
  const instagramSection = document.querySelector('#instagram');
  const prevBtnInsta = document.querySelector('.instagram-3d-btn.prev');
  const nextBtnInsta = document.querySelector('.instagram-3d-btn.next');

  let instagramCurrentIndex = 3; // Start with the middle card (index 3) active

  function applyInstagram3DCurve(animate = true) {
    if (!instagramGrid) return;
    
    const count = instagramCards.length;
    if (count === 0) return;
    
    instagramCards.forEach((card, i) => {
      // Calculate circular distance in the loop of 7 items
      let d = i - instagramCurrentIndex;
      if (d > 3) d -= 7;
      if (d < -3) d += 7;
      
      let rotateY, translateZ, translateX, scale, zIndex, opacity, visibility, pointerEvents;
      
      // Display only 5 cards at a time (Math.abs(d) <= 2)
      if (Math.abs(d) > 2) {
        // Hidden cards
        rotateY = -d * 25;
        translateZ = -250;
        translateX = d * 280;
        scale = 0.5;
        zIndex = 0;
        opacity = 0;
        visibility = 'hidden';
        pointerEvents = 'none';
      } else {
        // Visible 5 cards
        rotateY = -d * 22;                  // slanting angle
        translateZ = 40 - Math.abs(d) * 85;     // concave depth positioning
        translateX = d * 220;                // horizontal offset spacing
        scale = 1 - Math.abs(d) * 0.08;        // shrink side cards
        zIndex = 10 - Math.abs(d);           // center spotlight card stack on top
        opacity = 1 - Math.abs(d) * 0.2;       // dim peripheral cards
        visibility = 'visible';
        pointerEvents = 'auto';
      }
      
      // Store computed values for hover recovery
      card.dataset.rotateY = rotateY;
      card.dataset.translateZ = translateZ;
      card.dataset.translateX = translateX;
      card.dataset.scale = scale;
      card.dataset.zIndex = zIndex;
      card.dataset.opacity = opacity;
      
      if (animate) {
        gsap.to(card, {
          rotateY: rotateY,
          z: translateZ,
          x: translateX,
          scale: scale,
          zIndex: zIndex,
          opacity: opacity,
          visibility: visibility,
          pointerEvents: pointerEvents,
          duration: 0.85,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      } else {
        gsap.set(card, {
          rotateY: rotateY,
          z: translateZ,
          x: translateX,
          scale: scale,
          zIndex: zIndex,
          opacity: opacity,
          visibility: visibility,
          pointerEvents: pointerEvents
        });
      }
    });
  }

  // Draw initial Instagram curve on page load
  if (instagramGrid) {
    applyInstagram3DCurve(false);
  }

  // Hook hover events to Instagram Reels cards
  instagramCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      if (parseFloat(card.dataset.opacity) === 0) return;

      instagramCards.forEach((el) => {
        if (el === card) {
          // Focus hovered Reel card
          gsap.to(el, {
            rotateY: 0,
            z: 110,
            x: parseFloat(el.dataset.translateX),
            scale: 1.12,
            opacity: 1,
            zIndex: 30,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          // Blur and dim peripheral Reel cards
          gsap.to(el, {
            opacity: parseFloat(el.dataset.opacity) * 0.4,
            filter: 'grayscale(20%) blur(0.8px)',
            scale: parseFloat(el.dataset.scale) * 0.95,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });
    });

    card.addEventListener('mouseleave', () => {
      instagramCards.forEach((el) => {
        // Restore elements back to their computed cylindrical coordinates
        gsap.to(el, {
          rotateY: parseFloat(el.dataset.rotateY),
          z: parseFloat(el.dataset.translateZ),
          x: parseFloat(el.dataset.translateX),
          scale: parseFloat(el.dataset.scale),
          opacity: parseFloat(el.dataset.opacity),
          zIndex: parseInt(el.dataset.zIndex, 10),
          filter: 'none',
          visibility: parseFloat(el.dataset.opacity) > 0 ? 'visible' : 'hidden',
          pointerEvents: parseFloat(el.dataset.opacity) > 0 ? 'auto' : 'none',
          duration: 0.6,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    });
  });

  // Navigation Arrows event listeners
  if (prevBtnInsta) {
    prevBtnInsta.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const count = instagramCards.length;
      instagramCurrentIndex = (instagramCurrentIndex - 1 + count) % count;
      applyInstagram3DCurve(true);
    });
  }

  if (nextBtnInsta) {
    nextBtnInsta.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const count = instagramCards.length;
      instagramCurrentIndex = (instagramCurrentIndex + 1) % count;
      applyInstagram3DCurve(true);
    });
  }

  // Immersive 3D Parallax stage rotation on Mouse Move over Instagram section
  let isMouseInInstagram = false;

  if (instagramSection && instagramGrid) {
    instagramSection.addEventListener('mouseenter', () => {
      isMouseInInstagram = true;
    });

    instagramSection.addEventListener('mouseleave', () => {
      isMouseInInstagram = false;
      // Smoothly return stage to rest position when cursor leaves
      gsap.to(instagramGrid, {
        rotateY: 0,
        rotateX: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    });

    instagramSection.addEventListener('mousemove', (e) => {
      if (!isMouseInInstagram) return;

      const rect = instagramSection.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const deltaX = (x / rect.width) - 0.5;
      const deltaY = (y / rect.height) - 0.5;

      gsap.to(instagramGrid, {
        rotateY: -deltaX * 22, // rotate on Y axis
        rotateX: deltaY * 12,  // rotate on X axis
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  }

  // --------------------------------------------------
  // 5.8. Fullscreen Dual-Mode Image & Video Lightbox Functionality
  // --------------------------------------------------
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxVideoContainer = document.querySelector('.lightbox-video-container');
  const lightboxIframe = document.querySelector('.lightbox-iframe');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  
  // Gallery Portfolio Image Click Handlers
  galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.gallery-img');
      const title = item.querySelector('.gallery-title').textContent;
      const tag = item.querySelector('.gallery-tag').textContent;
      
      if (lightbox) {
        // Toggle view modes (show image, hide iframe video)
        if (lightboxImg) lightboxImg.style.display = 'block';
        if (lightboxVideoContainer) lightboxVideoContainer.style.display = 'none';
        if (lightboxIframe) lightboxIframe.src = ''; // stop any playing videos
        
        if (lightboxImg) lightboxImg.src = img.src;
        if (lightboxCaption) {
          lightboxCaption.innerHTML = `${title} <span style="display:block; font-size:0.8rem; font-family:var(--font-sans); text-transform:uppercase; letter-spacing:0.2em; color:var(--color-gold); margin-top:8px;">${tag}</span>`;
        }
        lightbox.classList.add('open');
        if (lenis) lenis.stop(); // Stop scroll while viewing details
      }
    });
  });

  // Instagram Reels Click Handlers (Loads embed player on-demand)
  instagramCards.forEach((card) => {
    card.addEventListener('click', () => {
      const reelId = card.getAttribute('data-reel-id');
      const title = card.getAttribute('data-title');
      const caption = card.getAttribute('data-caption');
      
      if (lightbox && reelId) {
        // Toggle view modes (hide image, show iframe video)
        if (lightboxImg) lightboxImg.style.display = 'none';
        if (lightboxVideoContainer) lightboxVideoContainer.style.display = 'block';
        
        // Load official Instagram Reel embed player securely in high quality
        if (lightboxIframe) {
          lightboxIframe.src = `https://www.instagram.com/reel/${reelId}/embed/`;
        }
        
        if (lightboxCaption) {
          lightboxCaption.innerHTML = `${title} <span style="display:block; font-size:0.8rem; font-family:var(--font-sans); text-transform:uppercase; letter-spacing:0.15em; color:var(--color-gold); margin-top:8px;">${caption}</span>`;
        }
        lightbox.classList.add('open');
        if (lenis) lenis.stop(); // Stop scroll while viewing details
      }
    });
  });
  
  if (lightboxClose && lightbox) {
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('open');
      if (lightboxIframe) lightboxIframe.src = ''; // completely stop video from playing in background!
      if (lenis) lenis.start();
    });
    
    // Close on click outside the content container
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('open');
        if (lightboxIframe) lightboxIframe.src = ''; // completely stop video
        if (lenis) lenis.start();
      }
    });
  }

  // --------------------------------------------------
  // 6. Testimonials Auto-Sliding Carousel
  // --------------------------------------------------
  const slides = document.querySelectorAll('.carousel-slide');
  const indicatorsContainer = document.querySelector('.carousel-indicators');
  const prevBtn = document.querySelector('.control-btn.prev');
  const nextBtn = document.querySelector('.control-btn.next');
  let currentSlideIndex = 0;
  let slideInterval;
  
  // Dynamically generate indicators dots
  if (indicatorsContainer) {
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('indicator');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetSlideTimer();
      });
      indicatorsContainer.appendChild(dot);
    });
  }
  
  const indicators = document.querySelectorAll('.indicator');
  
  function goToSlide(index) {
    slides[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex = (index + slides.length) % slides.length;
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
  }
  
  function nextSlide() {
    goToSlide(currentSlideIndex + 1);
  }
  
  function prevSlide() {
    goToSlide(currentSlideIndex - 1);
  }
  
  function startSlideTimer() {
    slideInterval = setInterval(nextSlide, 6000); // Shift slides every 6 seconds
  }
  
  function resetSlideTimer() {
    clearInterval(slideInterval);
    startSlideTimer();
  }
  
  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetSlideTimer();
    });
    
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetSlideTimer();
    });
    
    startSlideTimer();
  }

  // --------------------------------------------------
  // 7. Contact Booking Form & WhatsApp Direct Connect
  // --------------------------------------------------
  const contactForm = document.getElementById('luxury-booking-form');
  const successToast = document.querySelector('.form-success-toast');
  const btnWhatsApp = document.querySelector('.btn-whatsapp-direct');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Grab values for validation/feedback
      const name = document.getElementById('client-name').value.trim();
      const date = document.getElementById('wedding-date').value;
      const venue = document.getElementById('wedding-venue').value.trim();
      const vision = document.getElementById('wedding-vision').value.trim();
      
      if (!name || !date || !venue) {
        alert("Please complete the Name, Wedding Date, and Venue fields to proceed.");
        return;
      }
      
      // Simulated server booking success
      if (successToast) {
        successToast.classList.add('show');
        setTimeout(() => {
          successToast.classList.remove('show');
        }, 5000);
      }
      
      contactForm.reset();
    });
  }
  
  // WhatsApp Direct Message Constructor
  if (btnWhatsApp) {
    btnWhatsApp.addEventListener('click', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('client-name').value.trim();
      const date = document.getElementById('wedding-date').value;
      const venue = document.getElementById('wedding-venue').value.trim();
      const vision = document.getElementById('wedding-vision').value.trim();
      
      let message = "Hello Frances Decor! I would love to connect about wedding styling. Here are my details:\n\n";
      
      if (name) message += `*Name:* ${name}\n`;
      if (date) message += `*Wedding Date:* ${date}\n`;
      if (venue) message += `*Venue:* ${venue}\n`;
      if (vision) message += `*Theme/Vision:* ${vision}\n`;
      
      if (!name && !date && !venue) {
        message = "Hello Frances Decor! I would love to book a consultation for my upcoming luxury wedding decor styling.";
      }
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/94777123456?text=${encodedMessage}`; // Custom Sri Lankan Frances Decor WhatsApp Number placeholder
      
      window.open(whatsappURL, '_blank');
    });
  }

  // --------------------------------------------------
  // 8. 3D Editorial Spotlight Carousel & Toggle Logic
  // --------------------------------------------------
  const spotlightData = {
    concepts: [
      {
        title: "Imperial Wisteria Canopy",
        location: "Shangri-La Hotel, Colombo",
        image: "assets/gallery_mandap.png",
        category: "Floral Architecture",
        description: "A breathtaking overhead installation of cascading white wisteria, delicate orchids, and suspended crystal elements engineered to transform the hotel ballroom into an ethereal botanical canopy."
      },
      {
        title: "Clifftop Rose Garden",
        location: "Anantara Peace Haven, Tangalle",
        image: "assets/gallery_destination.png",
        category: "Floral Architecture",
        description: "Monumental rose arches framing the ocean horizon, with volumetric floral walls creating a cinematic destination ceremony at one of Sri Lanka's most exclusive coastal resorts."
      },
      {
        title: "Ballroom Symphony",
        location: "Cinnamon Grand, Colombo",
        image: "assets/gallery_reception.png",
        category: "Floral Architecture",
        description: "An immersive floral transformation featuring towering candelabra arrangements, luxurious blush rose archways, and warm candlelit pathways creating an unforgettable reception atmosphere."
      },
      {
        title: "Romantic Garden Cathedral",
        location: "Galle Fort Hotel, Galle",
        image: "assets/hero-bg.png",
        category: "Floral Architecture",
        description: "A classical European-inspired garden ceremony setup with soaring botanical pillars, delicate sheer drapery, and hand-placed floral meadow runners creating a sacred natural cathedral."
      },
      {
        title: "Cascading Floral Wall",
        location: "The Kingsbury, Colombo",
        image: "assets/gallery_bouquets.png",
        category: "Floral Architecture",
        description: "A living wall installation featuring thousands of individually placed blooms creating a dramatic gradient cascade from ivory through blush to deep mauve, designed as the perfect editorial backdrop."
      }
    ]
  };

  const cards = document.querySelectorAll('.carousel-3d-card');
  const prevBtn3d = document.querySelector('.carousel-3d-btn.prev');
  const nextBtn3d = document.querySelector('.carousel-3d-btn.next');
  const dots3d = document.querySelectorAll('.spotlight-dot');
  const titleEl = document.querySelector('.spotlight-project-title');
  const locationEl = document.querySelector('.spotlight-project-location');
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const toggleSlider = document.querySelector('.toggle-slider');

  // Editorial Detail Viewer elements
  const detailViewer = document.getElementById('editorial-detail-viewer');
  const detailImg = document.getElementById('editorial-detail-img');
  const detailTitle = document.getElementById('editorial-detail-title');
  const detailLocation = document.getElementById('editorial-detail-location');
  const detailCategory = document.getElementById('editorial-detail-category');
  const detailDesc = document.getElementById('editorial-detail-desc');
  const detailCloseBtn = document.querySelector('.editorial-detail-close');
  const editorialNavPrev = document.getElementById('editorial-nav-prev');
  const editorialNavNext = document.getElementById('editorial-nav-next');
  const detailCounter = document.getElementById('editorial-detail-counter');

  let activeCategory = 'concepts';
  let currentIndex = 0;
  let detailViewerIndex = 0; // Separate index for detail viewer navigation

  // Open the editorial detail viewer with data from clicked card
  function openDetailViewer(dataItem, index) {
    if (!detailViewer || !detailImg) return;

    // Check if the viewer is already open (skip scroll if just updating)
    const wasAlreadyVisible = detailViewer.classList.contains('visible');

    // Set the detail viewer index
    detailViewerIndex = (typeof index === 'number') ? index : currentIndex;

    // Update counter
    const totalItems = spotlightData[activeCategory].length;
    if (detailCounter) {
      detailCounter.textContent = `${String(detailViewerIndex + 1).padStart(2, '0')} / ${String(totalItems).padStart(2, '0')}`;
    }

    // Populate detail panel content
    detailImg.src = dataItem.image;
    detailImg.alt = dataItem.title;
    if (detailTitle) detailTitle.textContent = dataItem.title;
    if (detailLocation) detailLocation.textContent = dataItem.location;
    if (detailCategory) detailCategory.textContent = dataItem.category;
    if (detailDesc) detailDesc.textContent = dataItem.description;

    // Show the viewer with animation
    detailViewer.classList.add('visible');

    // GSAP staggered content entrance animation
    gsap.fromTo('.editorial-detail-content > *', 
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.08, 
        ease: 'power3.out',
        delay: 0.2
      }
    );

    // Animate image entrance
    gsap.fromTo('.editorial-detail-img',
      { scale: 1.08, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
    );

    // Only scroll to the viewer on the FIRST open, not when already visible
    if (!wasAlreadyVisible) {
      const viewerElement = detailViewer;
      if (viewerElement) {
        setTimeout(() => {
          if (typeof lenis !== 'undefined' && lenis) {
            lenis.scrollTo(viewerElement, { offset: -120, duration: 1.2 });
          } else {
            viewerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }

  // Synchronize carousel position and detail viewer content
  function syncCarouselAndDetail(newIndex) {
    currentIndex = newIndex;
    detailViewerIndex = newIndex;
    updateCarousel();
    updateDetailViewerContent(newIndex);
  }

  // Update only the detail viewer content with crossfade
  function updateDetailViewerContent(newIndex) {
    const dataItem = spotlightData[activeCategory][newIndex];
    if (!dataItem || !detailViewer) return;

    detailViewerIndex = newIndex;

    // Update counter
    const totalItems = spotlightData[activeCategory].length;
    if (detailCounter) {
      detailCounter.textContent = `${String(detailViewerIndex + 1).padStart(2, '0')} / ${String(totalItems).padStart(2, '0')}`;
    }

    // Crossfade the image
    gsap.to('.editorial-detail-img', {
      opacity: 0,
      scale: 1.04,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        detailImg.src = dataItem.image;
        detailImg.alt = dataItem.title;
        gsap.to('.editorial-detail-img', {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out'
        });
      }
    });

    // Crossfade the text content
    gsap.to('.editorial-detail-content > *', {
      opacity: 0,
      y: -8,
      duration: 0.2,
      stagger: 0.03,
      ease: 'power2.in',
      onComplete: () => {
        if (detailTitle) detailTitle.textContent = dataItem.title;
        if (detailLocation) detailLocation.textContent = dataItem.location;
        if (detailCategory) detailCategory.textContent = dataItem.category;
        if (detailDesc) detailDesc.textContent = dataItem.description;

        gsap.to('.editorial-detail-content > *', {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power3.out'
        });
      }
    });
  }

  // Close the editorial detail viewer
  function closeDetailViewer() {
    if (!detailViewer) return;

    gsap.to('.editorial-detail-inner', {
      opacity: 0,
      y: -15,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        detailViewer.classList.remove('visible');
        // Reset inner opacity for next open
        gsap.set('.editorial-detail-inner', { opacity: 1, y: 0 });
      }
    });
  }

  // Close button event
  if (detailCloseBtn) {
    detailCloseBtn.addEventListener('click', closeDetailViewer);
  }

  // Editorial Detail Viewer's own navigation arrows (rotate carousel to match!)
  if (editorialNavPrev) {
    editorialNavPrev.addEventListener('click', () => {
      const totalItems = spotlightData[activeCategory].length;
      const newIdx = (detailViewerIndex - 1 + totalItems) % totalItems;
      syncCarouselAndDetail(newIdx);
    });
  }

  if (editorialNavNext) {
    editorialNavNext.addEventListener('click', () => {
      const totalItems = spotlightData[activeCategory].length;
      const newIdx = (detailViewerIndex + 1) % totalItems;
      syncCarouselAndDetail(newIdx);
    });
  }

  if (cards.length > 0) {
    // Initialize initial dataset
    cards.forEach((card, i) => {
      const img = card.querySelector('.carousel-3d-img');
      if (img) {
        img.src = spotlightData[activeCategory][i].image;
        img.alt = spotlightData[activeCategory][i].title;
      }
    });

    // Initial draw
    updateCarousel(true);

    // Event Handlers for Navigation Arrows
    if (prevBtn3d) {
      prevBtn3d.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("3D Carousel Nav: Clicked Prev. Current Index:", currentIndex);
        // If detail viewer is open, keep carousel & viewer fully in sync
        if (detailViewer && detailViewer.classList.contains('visible')) {
          const newIdx = (detailViewerIndex - 1 + 5) % 5;
          syncCarouselAndDetail(newIdx);
        } else {
          currentIndex = (currentIndex - 1 + 5) % 5;
          updateCarousel();
        }
      });
    }

    if (nextBtn3d) {
      nextBtn3d.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("3D Carousel Nav: Clicked Next. Current Index:", currentIndex);
        // If detail viewer is open, keep carousel & viewer fully in sync
        if (detailViewer && detailViewer.classList.contains('visible')) {
          const newIdx = (detailViewerIndex + 1) % 5;
          syncCarouselAndDetail(newIdx);
        } else {
          currentIndex = (currentIndex + 1) % 5;
          updateCarousel();
        }
      });
    }

    // Direct click-to-activate card
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-index'), 10);
        if (detailViewer && detailViewer.classList.contains('visible')) {
          // If open, synchronize immediately on card click
          syncCarouselAndDetail(idx);
        } else {
          if (idx !== currentIndex) {
            currentIndex = idx;
            updateCarousel();
          } else {
            // Active card clicked — open the detail viewer
            const dataItem = spotlightData[activeCategory][currentIndex];
            if (dataItem) {
              openDetailViewer(dataItem, currentIndex);
            }
          }
        }
      });
    });

    // Dots navigation
    dots3d.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (detailViewer && detailViewer.classList.contains('visible')) {
          syncCarouselAndDetail(idx);
        } else {
          if (idx !== currentIndex) {
            currentIndex = idx;
            updateCarousel();
          }
        }
      });
    });



    // Touch Swiping logic for mobile layouts
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;
    const wrapper = document.querySelector('.carousel-3d-wrapper');

    if (wrapper) {
      wrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      wrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      if (touchStartX - touchEndX > swipeThreshold) {
        currentIndex = (currentIndex + 1) % 5;
        updateCarousel();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        currentIndex = (currentIndex - 1 + 5) % 5;
        updateCarousel();
      }
    }

    // Cursor hover expansions for new items
    const newInteractives = document.querySelectorAll('.carousel-3d-card, .carousel-3d-btn, .toggle-btn, .spotlight-dot, .editorial-detail-close');
    newInteractives.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        if (cursorDot) {
          cursorDot.style.width = '30px';
          cursorDot.style.height = '30px';
          cursorDot.style.backgroundColor = 'var(--color-gold-bright)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (cursorDot) {
          cursorDot.style.width = '10px';
          cursorDot.style.height = '10px';
          cursorDot.style.backgroundColor = 'var(--color-gold)';
        }
      });
    });
  }

  function updateCarousel(isInitial = false) {
    cards.forEach((card, i) => {
      const d = (i - currentIndex + 5) % 5;
      card.className = 'carousel-3d-card'; // reset all classes

      if (d === 0) {
        card.classList.add('card-active');
      } else if (d === 1) {
        card.classList.add('card-right');
      } else if (d === 2) {
        card.classList.add('card-far-right');
      } else if (d === 3) {
        card.classList.add('card-far-left');
      } else if (d === 4) {
        card.classList.add('card-left');
      }
    });

    dots3d.forEach((dot, i) => {
      if (i === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    if (isInitial) {
      if (titleEl && locationEl) {
        const item = spotlightData[activeCategory][currentIndex];
        titleEl.textContent = item.title;
        locationEl.textContent = item.location;
      }
    } else {
      gsap.to('.spotlight-info', {
        opacity: 0,
        y: -10,
        duration: 0.3,
        onComplete: () => {
          if (titleEl && locationEl) {
            const item = spotlightData[activeCategory][currentIndex];
            titleEl.textContent = item.title;
            locationEl.textContent = item.location;
          }
          gsap.to('.spotlight-info', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
      });
    }


  }
});

