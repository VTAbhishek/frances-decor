/* --------------------------------------------------
   Frances Decor - Falling Rose Petals Engine
   Lightweight, high-performance HTML5 Canvas animation
-------------------------------------------------- */

class PetalEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.petals = [];
    this.maxPetals = 45; // Perfect balance of luxury visuals and high-performance
    this.mouse = { x: -1000, y: -1000, active: false };
    this.scrollSpeed = 0;
    this.lastScrollY = window.scrollY;
    
    // Aesthetic Color Palette
    this.colors = [
      'rgba(250, 218, 213, opacity)',  /* Elegant Blush Pink */
      'rgba(247, 203, 196, opacity)',  /* Rose Gold / Pink */
      'rgba(253, 245, 230, opacity)',  /* Romantic Ivory Cream */
      'rgba(255, 240, 245, opacity)'   /* Dreamy Lavender Blush */
    ];
    
    this.init();
  }
  
  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Spawn Initial Petals across various heights
    for (let i = 0; i < this.maxPetals; i++) {
      this.petals.push(this.createPetal(true));
    }
    
    // Event Listeners for Interaction
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.active = false;
    });
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - this.lastScrollY;
      this.scrollSpeed = Math.min(Math.abs(diff) * 0.15, 8); // Translate scroll speed to wind gust
      this.lastScrollY = currentScrollY;
    });
    
    this.animate();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createPetal(randomY = false) {
    const size = Math.random() * 12 + 8; // Diverse leaf sizes (8px to 20px)
    const baseColor = this.colors[Math.floor(Math.random() * this.colors.length)];
    const opacity = Math.random() * 0.4 + 0.3; // Gentle opacity bounds for luxury softness
    const color = baseColor.replace('opacity', opacity.toFixed(2));
    
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : -20,
      size: size,
      speedX: Math.random() * 1.5 - 0.75, // Lateral sway
      speedY: Math.random() * 1.0 + 0.8,   // Terminal fall speed
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() * 0.02 - 0.01) * 2,
      oscillationSpeed: Math.random() * 0.02 + 0.01,
      oscillationAmount: Math.random() * 15 + 5,
      angle: Math.random() * Math.PI,
      opacity: opacity,
      color: color,
      centerFoldColor: 'rgba(230, 185, 180, ' + (opacity * 0.45).toFixed(2) + ')'
    };
  }
  
  drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    
    // Draw 3D curved luxury petal vector
    ctx.beginPath();
    ctx.moveTo(0, -p.size / 2);
    ctx.bezierCurveTo(p.size / 1.5, -p.size / 2, p.size * 1.1, p.size / 4, 0, p.size);
    ctx.bezierCurveTo(-p.size * 1.1, p.size / 4, -p.size / 1.5, -p.size / 2, 0, -p.size / 2);
    
    // Soft drop shadow
    ctx.shadowColor = 'rgba(197, 168, 128, 0.05)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 3;
    
    ctx.fillStyle = p.color;
    ctx.fill();
    
    // Petal fold dividing line for enhanced depth
    ctx.beginPath();
    ctx.moveTo(0, -p.size / 2);
    ctx.lineTo(0, p.size);
    ctx.strokeStyle = p.centerFoldColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Slowly dissipate wind gust from scroll
    this.scrollSpeed *= 0.95;
    
    this.petals.forEach((p) => {
      // Basic vertical fall + scroll gust
      p.y += p.speedY + this.scrollSpeed;
      
      // Floating wave sway logic
      p.angle += p.oscillationSpeed;
      p.x += p.speedX + Math.sin(p.angle) * (p.oscillationAmount * 0.05);
      p.rotation += p.rotationSpeed;
      
      // Fine-grained cursor repelling force
      if (this.mouse.active) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 5;
          p.y += Math.sin(angle) * force * 3;
        }
      }
      
      // Draw the petal
      this.drawPetal(this.ctx, p);
      
      // Recirculate petals once they leave screen borders
      if (p.y > this.canvas.height + 20) {
        Object.assign(p, this.createPetal(false));
      }
      
      // Wrap horizontal bounds
      if (p.x < -20) p.x = this.canvas.width + 10;
      if (p.x > this.canvas.width + 20) p.x = -10;
    });
    
    requestAnimationFrame(() => this.animate());
  }
}

// Instantiate engine globally when page loads
document.addEventListener('DOMContentLoaded', () => {
  new PetalEngine('hero-petals-canvas');
});
