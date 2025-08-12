/**
 * Eternal1OS Website - Optimized Main Script File
 * 
 * Features:
 * - 3D particle systems with performance optimization
 * - Responsive animations with FPS limiting
 * - Memory management and cleanup
 * - Cross-browser compatibility
 * - Mobile-first optimization
 * 
 * Performance Notes:
 * - Uses requestAnimationFrame for smooth animations
 * - Implements spatial partitioning for particle interactions
 * - Memory cleanup every 30 seconds
 * - Adaptive particle counts based on device capabilities
 * 
 * @author Ayaan Siddique
 * @version 2.0.0
 * @license MIT
 */

/* MIT License - © 2025 Ayaan Siddique */
/* Eternal1OS - Ultra-Premium 3D Branding Website Scripts - OPTIMIZED v2.0 */

// Global variables with better memory management
let introCompleted = false;
let animationFrame = null;
let heroAnimationFrame = null;
let matrixAnimationFrame = null;
let particles3D = [];
let heroParticles = [];
let codeMatrix = [];

// Device capabilities detection
const DEVICE_CONFIG = {
    mobile: window.innerWidth <= 768,
    tablet: window.innerWidth <= 1024 && window.innerWidth > 768,
    desktop: window.innerWidth > 1024,
    highDPI: window.devicePixelRatio > 1.5,
    lowEndDevice: navigator.hardwareConcurrency <= 4,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    // Adaptive settings based on device
    getParticleCount(base) {
        if (this.reducedMotion) return 0;
        if (this.mobile) return Math.floor(base * 0.25);
        if (this.tablet) return Math.floor(base * 0.5);
        if (this.lowEndDevice) return Math.floor(base * 0.7);
        return base;
    },
    
    getAnimationSpeed(base) {
        if (this.reducedMotion) return 0;
        if (this.mobile) return base * 0.5;
        if (this.lowEndDevice) return base * 0.8;
        return base;
    }
};

// Enhanced configuration with device-adaptive settings
const CONFIG = {
    intro: {
        duration: 5000,
        particleCount: DEVICE_CONFIG.getParticleCount(15), // Reduced from 30
        logoTransitionDelay: 2000,
        textDelay: 3000
    },
    hero: {
        particleCount: DEVICE_CONFIG.getParticleCount(12), // Reduced from 20
        mouseInfluence: DEVICE_CONFIG.mobile ? 50 : 100,
        connectionDistance: DEVICE_CONFIG.mobile ? 80 : 120,
        maxConnections: DEVICE_CONFIG.mobile ? 3 : 5
    },
    matrix: {
        characters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ',
        columns: DEVICE_CONFIG.getParticleCount(20), // Reduced from 30
        speed: DEVICE_CONFIG.getAnimationSpeed(2),
        maxTrailLength: DEVICE_CONFIG.mobile ? 8 : 15
    },
    performance: {
        targetFPS: DEVICE_CONFIG.mobile ? 30 : 60,
        enableDebug: false,
        memoryCleanupInterval: 30000,
        spatialOptimization: true
    }
};

// Enhanced utility functions with better performance
const utils = {
    lerp: (start, end, factor) => start + (end - start) * factor,
    
    random: (min, max) => Math.random() * (max - min) + min,
    
    distance: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    distanceSquared: (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    },
    
    map: (value, start1, stop1, start2, stop2) => 
        start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1)),
    
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // Spatial partitioning helper
    getGridCell: (x, y, cellSize) => ({
        x: Math.floor(x / cellSize),
        y: Math.floor(y / cellSize)
    })
};

// Enhanced FPS Controller with adaptive quality
const FPSController = {
    targetFPS: CONFIG.performance.targetFPS,
    frameInterval: 1000 / CONFIG.performance.targetFPS,
    lastFrameTime: 0,
    frameCount: 0,
    fpsHistory: [],
    qualityLevel: 1.0,
    
    shouldRender(currentTime) {
        if (currentTime - this.lastFrameTime >= this.frameInterval) {
            this.lastFrameTime = currentTime;
            this.frameCount++;
            return true;
        }
        return false;
    },
    
    updateQuality() {
        this.frameCount++;
        if (this.frameCount % 60 === 0) { // Check every 60 frames
            const avgFPS = PerformanceMonitor.getAverageFPS();
            
            if (avgFPS < this.targetFPS * 0.8) {
                this.qualityLevel = Math.max(0.3, this.qualityLevel * 0.9);
                this.adaptPerformance();
            } else if (avgFPS > this.targetFPS * 0.95 && this.qualityLevel < 1.0) {
                this.qualityLevel = Math.min(1.0, this.qualityLevel * 1.1);
            }
        }
    },
    
    adaptPerformance() {
        // Reduce particle counts dynamically
        CONFIG.hero.particleCount = Math.max(5, Math.floor(CONFIG.hero.particleCount * this.qualityLevel));
        CONFIG.intro.particleCount = Math.max(8, Math.floor(CONFIG.intro.particleCount * this.qualityLevel));
        CONFIG.matrix.columns = Math.max(10, Math.floor(CONFIG.matrix.columns * this.qualityLevel));
        
        console.log(`Performance adapted: Quality level ${(this.qualityLevel * 100).toFixed(0)}%`);
    }
};

// Enhanced Notification System
const NotificationSystem = {
    container: null,
    notifications: new Set(),
    maxNotifications: DEVICE_CONFIG.mobile ? 3 : 5,
    
    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            console.warn('Notification container not found');
        }
    },
    
    show(message, type = 'success', duration = 3000) {
        if (!this.container || this.notifications.size >= this.maxNotifications) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        this.container.appendChild(notification);
        this.notifications.add(notification);
        
        // Auto remove with proper cleanup
        const removeNotification = () => {
            if (notification.parentNode && this.notifications.has(notification)) {
                notification.style.animation = 'slideInNotification 0.3s reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        this.container.removeChild(notification);
                    }
                    this.notifications.delete(notification);
                }, 300);
            }
        };
        
        setTimeout(removeNotification, duration);
        notification.addEventListener('click', removeNotification, { once: true });
    }
};

// Optimized Spatial Grid for particle interactions
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill(null).map(() => []);
    }
    
    clear() {
        this.grid.forEach(cell => cell.length = 0);
    }
    
    insert(particle, x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            const index = row * this.cols + col;
            this.grid[index].push(particle);
        }
    }
    
    getNearby(x, y, radius) {
        const nearby = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        for (let r = row - cellRadius; r <= row + cellRadius; r++) {
            for (let c = col - cellRadius; c <= col + cellRadius; c++) {
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    const index = r * this.cols + c;
                    nearby.push(...this.grid[index]);
                }
            }
        }
        
        return nearby;
    }
}

// Enhanced 3D Particle System with spatial optimization
class Particle3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.trail = [];
        this.maxTrailLength = DEVICE_CONFIG.mobile ? 4 : 8;
        this.reset();
    }
    
    reset() {
        this.x = utils.random(0, this.canvas.width);
        this.y = utils.random(0, this.canvas.height);
        this.z = utils.random(-400, 400); // Reduced Z range
        this.vx = utils.random(-1, 1);
        this.vy = utils.random(-1, 1);
        this.vz = utils.random(-2, 2);
        this.size = utils.random(1, 2);
        this.baseOpacity = utils.random(0.3, 0.7);
        this.trail.length = 0;
        this.lastTrailTime = 0;
    }
    
    update(currentTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        
        // Throttled trail management
        if (currentTime - this.lastTrailTime > 50) { // Update trail every 50ms
            if (this.trail.length >= this.maxTrailLength) {
                this.trail.shift();
            }
            this.trail.push({ x: this.x, y: this.y, z: this.z });
            this.lastTrailTime = currentTime;
        }
        
        // Efficient boundary checks
        if (this.x < -50 || this.x > this.canvas.width + 50 ||
            this.y < -50 || this.y > this.canvas.height + 50 ||
            this.z < -400 || this.z > 400) {
            this.reset();
        }
    }
    
    draw() {
        if (DEVICE_CONFIG.reducedMotion) return;
        
        const scale = utils.clamp(utils.map(this.z, -400, 400, 0.3, 1.5), 0.1, 2);
        const opacity = this.baseOpacity * utils.map(Math.abs(this.z), 0, 400, 1, 0.3);
        const drawSize = this.size * scale;
        
        this.ctx.save();
        this.ctx.globalAlpha = opacity * FPSController.qualityLevel;
        this.ctx.fillStyle = `rgba(0, 217, 255, ${opacity})`;
        
        // Use fillRect for better performance
        this.ctx.fillRect(
            this.x - drawSize * 0.5, 
            this.y - drawSize * 0.5, 
            drawSize, 
            drawSize
        );
        
        // Simplified trail rendering for mobile
        if (this.trail.length > 1 && !DEVICE_CONFIG.mobile) {
            this.ctx.strokeStyle = `rgba(0, 217, 255, ${opacity * 0.5})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            // Skip points for performance
            for (let i = 2; i < this.trail.length; i += 2) {
                this.ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
}

// Enhanced Hero Particle System with spatial optimization
class HeroParticle {
    constructor(canvas, mouse, spatialGrid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.mouse = mouse;
        this.spatialGrid = spatialGrid;
        this.reset();
    }
    
    reset() {
        this.x = utils.random(0, this.canvas.width);
        this.y = utils.random(0, this.canvas.height);
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = utils.random(-0.5, 0.5);
        this.vy = utils.random(-0.5, 0.5);
        this.size = utils.random(1.5, 3);
        this.opacity = utils.random(0.1, 0.3);
        this.hue = utils.random(180, 220);
        this.mouseForceX = 0;
        this.mouseForceY = 0;
        this.connections = [];
    }
    
    update() {
        // Base movement
        this.x += this.vx * 0.3;
        this.y += this.vy * 0.3;
        
        // Optimized mouse interaction
        if (!DEVICE_CONFIG.mobile) {
            const dx = this.mouse.x - this.x;
            const dy = this.mouse.y - this.y;
            const distSq = dx * dx + dy * dy;
            const influenceSq = CONFIG.hero.mouseInfluence * CONFIG.hero.mouseInfluence;
            
            if (distSq < influenceSq && distSq > 0) {
                const force = (influenceSq - distSq) / influenceSq;
                const dist = Math.sqrt(distSq);
                this.mouseForceX = -(dx / dist) * force * 0.015;
                this.mouseForceY = -(dy / dist) * force * 0.015;
            } else {
                this.mouseForceX *= 0.95;
                this.mouseForceY *= 0.95;
            }
            
            this.x += this.mouseForceX;
            this.y += this.mouseForceY;
        }
        
        // Return to base position
        this.x = utils.lerp(this.x, this.baseX, 0.005);
        this.y = utils.lerp(this.y, this.baseY, 0.005);
        
        // Boundary wrapping
        if (this.x < -10) this.x = this.canvas.width + 10;
        if (this.x > this.canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.canvas.height + 10;
        if (this.y > this.canvas.height + 10) this.y = -10;
    }
    
    draw() {
        if (DEVICE_CONFIG.reducedMotion) return;
        
        this.ctx.save();
        this.ctx.globalAlpha = this.opacity * FPSController.qualityLevel;
        this.ctx.fillStyle = `hsl(${this.hue}, 85%, 65%)`;
        
        // Simplified drawing for mobile
        if (DEVICE_CONFIG.mobile) {
            this.ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        } else {
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = `hsl(${this.hue}, 85%, 65%)`;
            this.ctx.beginPath();
            this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    findConnections() {
        if (DEVICE_CONFIG.mobile || DEVICE_CONFIG.reducedMotion) return [];
        
        if (CONFIG.performance.spatialOptimization && this.spatialGrid) {
            return this.spatialGrid.getNearby(this.x, this.y, CONFIG.hero.connectionDistance);
        }
        
        // Fallback to basic distance check
        const connections = [];
        for (let particle of heroParticles) {
            if (particle !== this) {
                const distSq = utils.distanceSquared(this.x, this.y, particle.x, particle.y);
                if (distSq < CONFIG.hero.connectionDistance * CONFIG.hero.connectionDistance) {
                    connections.push(particle);
                }
            }
        }
        return connections;
    }
}

// Enhanced Matrix Column with better performance
class MatrixColumn {
    constructor(canvas, x) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.x = x;
        this.reset();
    }
    
    reset() {
        this.y = utils.random(-200, -50);
        this.speed = utils.random(1, CONFIG.matrix.speed);
        this.characters = [];
        this.maxLength = utils.random(5, CONFIG.matrix.maxTrailLength);
        this.opacity = utils.random(0.3, 0.6);
        this.nextCharTime = 0;
        this.fontSize = DEVICE_CONFIG.mobile ? 10 : 13;
    }
    
    update() {
        if (DEVICE_CONFIG.reducedMotion) return;
        
        this.y += this.speed;
        
        if (this.y > this.canvas.height + 100) {
            this.reset();
            return;
        }
        
        // Throttled character addition
        const now = Date.now();
        if (now > this.nextCharTime && this.characters.length < this.maxLength) {
            this.characters.push({
                char: CONFIG.matrix.characters[utils.randomInt(0, CONFIG.matrix.characters.length - 1)],
                age: 0
            });
            this.nextCharTime = now + utils.random(100, 300);
        }
        
        // Update character ages
        for (let i = this.characters.length - 1; i >= 0; i--) {
            this.characters[i].age++;
            if (this.characters[i].age > 80) {
                this.characters.splice(i, 1);
            }
        }
    }
    
    draw() {
        if (DEVICE_CONFIG.reducedMotion) return;
        
        this.ctx.font = `${this.fontSize}px monospace`;
        this.ctx.textAlign = 'center';
        
        const qualityOpacity = this.opacity * FPSController.qualityLevel;
        
        for (let i = 0; i < this.characters.length; i++) {
            const charObj = this.characters[i];
            const y = this.y - (i * (this.fontSize + 5));
            
            if (y < -20 || y > this.canvas.height + 20) continue;
            
            const alpha = qualityOpacity * Math.max(0, 1 - charObj.age * 0.02);
            
            // Simplified rendering for performance
            if (i === 0) {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            } else {
                this.ctx.fillStyle = `rgba(0, 255, 198, ${alpha * 0.8})`;
            }
            
            this.ctx.fillText(charObj.char, this.x, y);
        }
    }
}

// Enhanced Intro Controller with better error handling
const IntroController = {
    overlay: null,
    scene: null,
    asLogo: null,
    eternalLogo: null,
    subtitle: null,
    tagline: null,
    progressFill: null,
    progressPercent: null,
    particlesCanvas: null,
    startTime: null,
    isActive: false,
    
    init() {
        try {
            // Cache DOM elements
            this.overlay = document.getElementById('intro-overlay');
            this.scene = document.getElementById('intro-scene');
            this.asLogo = document.getElementById('as-logo');
            this.eternalLogo = document.getElementById('eternal-logo');
            this.subtitle = document.getElementById('intro-subtitle');
            this.tagline = document.getElementById('intro-tagline');
            this.progressFill = document.getElementById('progress-fill');
            this.progressPercent = document.getElementById('progress-percent');
            this.particlesCanvas = document.getElementById('particles-3d');
            
            if (!this.overlay || !this.particlesCanvas) {
                console.warn('Required intro elements not found');
                return;
            }
            
            this.setupCanvas();
            this.initParticles();
            this.bindEvents();
            
            if (!introCompleted) {
                this.start();
            } else {
                this.skip();
            }
        } catch (error) {
            console.error('IntroController initialization failed:', error);
            ErrorHandler.logError(error);
            this.skip(); // Fallback to main site
        }
    },
    
    setupCanvas() {
        if (!this.particlesCanvas) return;
        
        try {
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limit DPR for performance
            const rect = this.particlesCanvas.getBoundingClientRect();
            
            this.particlesCanvas.width = rect.width * dpr;
            this.particlesCanvas.height = rect.height * dpr;
            this.particlesCanvas.style.width = rect.width + 'px';
            this.particlesCanvas.style.height = rect.height + 'px';
            
            const ctx = this.particlesCanvas.getContext('2d');
            ctx.scale(dpr, dpr);
        } catch (error) {
            console.error('Canvas setup failed:', error);
            ErrorHandler.handleCanvasError(error);
        }
    },
    
    initParticles() {
        particles3D = [];
        if (CONFIG.intro.particleCount > 0) {
            for (let i = 0; i < CONFIG.intro.particleCount; i++) {
                particles3D.push(new Particle3D(this.particlesCanvas));
            }
        }
    },
    
    bindEvents() {
        // Skip on spacebar
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !introCompleted && this.isActive) {
                e.preventDefault();
                this.skip();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        
        // Skip on click/touch
        const handleClick = () => {
            if (!introCompleted && this.isActive) {
                this.skip();
            }
        };
        this.overlay?.addEventListener('click', handleClick);
        this.overlay?.addEventListener('touchstart', handleClick, { passive: true });
        
        // Optimized resize handler
        window.addEventListener('resize', utils.debounce(() => {
            if (this.isActive) {
                this.setupCanvas();
                this.initParticles();
            }
        }, 300));
    },
    
    start() {
        this.isActive = true;
        this.startTime = performance.now();
        this.animate();
        
        // Logo transitions with error checking
        setTimeout(() => {
            try {
                if (this.asLogo) {
                    this.asLogo.style.transform = 'translate(-50%, -50%) rotateY(-90deg) scale(0)';
                    this.asLogo.style.opacity = '0';
                    
                    setTimeout(() => {
                        this.eternalLogo?.classList.add('active');
                    }, 500);
                }
            } catch (error) {
                console.error('Logo transition error:', error);
            }
        }, CONFIG.intro.logoTransitionDelay);
        
        // Text animations
        setTimeout(() => {
            this.subtitle?.classList.add('visible');
            setTimeout(() => {
                this.tagline?.classList.add('visible');
            }, 500);
        }, CONFIG.intro.textDelay);
        
        // Auto complete
        setTimeout(() => {
            this.complete();
        }, CONFIG.intro.duration);
    },
    
    animate(currentTime = performance.now()) {
        if (!this.isActive || introCompleted) return;
        
        try {
            // FPS limiting
            if (!FPSController.shouldRender(currentTime)) {
                animationFrame = requestAnimationFrame((time) => this.animate(time));
                return;
            }
            
            const ctx = this.particlesCanvas.getContext('2d');
            const elapsed = currentTime - this.startTime;
            const progress = utils.clamp(elapsed / CONFIG.intro.duration, 0, 1);
            
            // Clear canvas
            ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
            ctx.fillRect(0, 0, this.particlesCanvas.width, this.particlesCanvas.height);
            
            // Update and draw particles
            particles3D.forEach(particle => {
                particle.update(currentTime);
                particle.draw();
            });
            
            // Update progress
            const progressPercent = Math.round(progress * 100);
            if (this.progressFill) this.progressFill.style.width = `${progressPercent}%`;
            if (this.progressPercent) this.progressPercent.textContent = `${progressPercent}%`;
            
            // Logo rotation (simplified for mobile)
            if (!DEVICE_CONFIG.mobile) {
                const rotation = progress * 360;
                if (this.asLogo) {
                    this.asLogo.style.transform = `translate(-50%, -50%) rotateY(${rotation}deg)`;
                }
                if (this.eternalLogo) {
                    const scale = this.eternalLogo.classList.contains('active') ? 1 : 0;
                    this.eternalLogo.style.transform = `translate(-50%, -50%) rotateY(${rotation * 0.5}deg) scale(${scale})`;
                }
            }
            
            animationFrame = requestAnimationFrame((time) => this.animate(time));
            
        } catch (error) {
            console.error('Animation error:', error);
            this.complete(); // Fallback
        }
    },
    
    complete() {
        this.isActive = false;
        introCompleted = true;
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        
        this.overlay?.classList.add('fade-out');
        document.getElementById('main-site')?.classList.add('visible');
        
        setTimeout(() => {
            if (this.overlay) this.overlay.style.display = 'none';
            NotificationSystem.show('Welcome to Eternal1OS!', 'success');
            
            // Initialize main site features
            HeroCanvas.init();
            MatrixCanvas.init();
        }, 1000);
    },
    
    skip() {
        this.complete();
    },
    
    replay() {
        try {
            introCompleted = false;
            this.overlay.style.display = 'flex';
            this.overlay.classList.remove('fade-out');
            document.getElementById('main-site')?.classList.remove('visible');
            
            // Reset elements
            if (this.asLogo) {
                this.asLogo.style.transform = 'translate(-50%, -50%) rotateY(0deg) scale(1)';
                this.asLogo.style.opacity = '1';
            }
            this.eternalLogo?.classList.remove('active');
            this.subtitle?.classList.remove('visible');
            this.tagline?.classList.remove('visible');
            if (this.progressFill) this.progressFill.style.width = '0%';
            if (this.progressPercent) this.progressPercent.textContent = '0%';
            
            // Clean up existing animations
            HeroCanvas.destroy();
            MatrixCanvas.destroy();
            
            this.start();
        } catch (error) {
            console.error('Replay failed:', error);
            ErrorHandler.logError(error);
        }
    }
};

// Enhanced Hero Canvas with spatial optimization
const HeroCanvas = {
    canvas: null,
    ctx: null,
    mouse: { x: 0, y: 0 },
    isActive: false,
    spatialGrid: null,
    lastMouseUpdate: 0,
    
    init() {
        try {
            this.canvas = document.getElementById('hero-canvas-3d');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.initParticles();
            this.bindEvents();
            this.isActive = true;
            this.animate();
        } catch (error) {
            console.error('HeroCanvas initialization failed:', error);
            ErrorHandler.logError(error);
        }
    },
    
    setupCanvas() {
        if (!this.canvas) return;
        
        try {
            const dpr = Math.min(window.devicePixelRatio || 1, DEVICE_CONFIG.mobile ? 1 : 2);
            const rect = this.canvas.getBoundingClientRect();
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            this.ctx.scale(dpr, dpr);
            
            // Initialize spatial grid for optimization
            if (CONFIG.performance.spatialOptimization && !DEVICE_CONFIG.mobile) {
                this.spatialGrid = new SpatialGrid(rect.width, rect.height, 100);
            }
        } catch (error) {
            console.error('Hero canvas setup failed:', error);
            ErrorHandler.handleCanvasError(error);
        }
    },
    
    initParticles() {
        heroParticles = [];
        if (CONFIG.hero.particleCount > 0) {
            for (let i = 0; i < CONFIG.hero.particleCount; i++) {
                heroParticles.push(new HeroParticle(this.canvas, this.mouse, this.spatialGrid));
            }
        }
    },
    
    bindEvents() {
        const throttledMouseMove = utils.throttle((e) => {
            if (!this.canvas) return;
            
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.lastMouseUpdate = performance.now();
        }, DEVICE_CONFIG.mobile ? 50 : 16);
        
        // Touch events for mobile
        const handleTouch = (e) => {
            if (!this.canvas || !e.touches.length) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        };
        
        if (DEVICE_CONFIG.mobile) {
            this.canvas.addEventListener('touchmove', handleTouch, { passive: true });
            this.canvas.addEventListener('touchstart', handleTouch, { passive: true });
        } else {
            window.addEventListener('mousemove', throttledMouseMove);
        }
        
        window.addEventListener('resize', utils.debounce(() => {
            if (this.isActive) {
                this.setupCanvas();
                this.initParticles();
            }
        }, 300));
    },
    
    animate(currentTime = performance.now()) {
        if (!this.isActive) return;
        
        try {
            // FPS limiting and quality adaptation
            if (!FPSController.shouldRender(currentTime)) {
                heroAnimationFrame = requestAnimationFrame((time) => this.animate(time));
                return;
            }
            
            FPSController.updateQuality();
            
            // Clear canvas with adaptive alpha
            const clearAlpha = DEVICE_CONFIG.mobile ? 0.1 : 0.03;
            this.ctx.fillStyle = `rgba(10, 10, 15, ${clearAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update spatial grid
            if (this.spatialGrid) {
                this.spatialGrid.clear();
                heroParticles.forEach(particle => {
                    this.spatialGrid.insert(particle, particle.x, particle.y);
                });
            }
            
            // Update and draw particles
            heroParticles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            // Draw connections with spatial optimization
            this.drawConnections();
            
            heroAnimationFrame = requestAnimationFrame((time) => this.animate(time));
            
        } catch (error) {
            console.error('Hero animation error:', error);
            ErrorHandler.logError(error);
            this.isActive = false;
        }
    },
    
    drawConnections() {
        if (DEVICE_CONFIG.mobile || DEVICE_CONFIG.reducedMotion) return;
        
        try {
            const maxConnections = CONFIG.hero.maxConnections;
            const connectionDistSq = CONFIG.hero.connectionDistance * CONFIG.hero.connectionDistance;
            
            for (let i = 0; i < heroParticles.length; i++) {
                let connectionCount = 0;
                const p1 = heroParticles[i];
                
                // Use spatial optimization if available
                const nearbyParticles = this.spatialGrid 
                    ? this.spatialGrid.getNearby(p1.x, p1.y, CONFIG.hero.connectionDistance)
                    : heroParticles.slice(i + 1);
                
                for (let j = 0; j < nearbyParticles.length && connectionCount < maxConnections; j++) {
                    const p2 = nearbyParticles[j];
                    if (p2 === p1) continue;
                    
                    const distSq = utils.distanceSquared(p1.x, p1.y, p2.x, p2.y);
                    
                    if (distSq < connectionDistSq) {
                        const opacity = utils.map(distSq, 0, connectionDistSq, 0.2, 0) * FPSController.qualityLevel;
                        
                        this.ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
                        this.ctx.lineWidth = 1;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                        
                        connectionCount++;
                    }
                }
            }
        } catch (error) {
            console.error('Connection drawing error:', error);
        }
    },
    
    destroy() {
        this.isActive = false;
        if (heroAnimationFrame) {
            cancelAnimationFrame(heroAnimationFrame);
            heroAnimationFrame = null;
        }
        heroParticles = [];
        this.spatialGrid = null;
    }
};

// Enhanced Matrix Canvas Controller
const MatrixCanvas = {
    canvas: null,
    ctx: null,
    columns: [],
    isActive: false,
    
    init() {
        try {
            this.canvas = document.getElementById('code-matrix');
            if (!this.canvas) return;
            
            this.ctx = this.canvas.getContext('2d');
            this.setupCanvas();
            this.initColumns();
            this.isActive = true;
            this.animate();
        } catch (error) {
            console.error('MatrixCanvas initialization failed:', error);
            ErrorHandler.logError(error);
        }
    },
    
    setupCanvas() {
        if (!this.canvas) return;
        
        try {
            const dpr = Math.min(window.devicePixelRatio || 1, DEVICE_CONFIG.mobile ? 1 : 1.5);
            const rect = this.canvas.getBoundingClientRect();
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            this.ctx.scale(dpr, dpr);
        } catch (error) {
            console.error('Matrix canvas setup failed:', error);
            ErrorHandler.handleCanvasError(error);
        }
    },
    
    initColumns() {
        this.columns = [];
        if (CONFIG.matrix.columns > 0) {
            const columnWidth = this.canvas.width / CONFIG.matrix.columns;
            
            for (let i = 0; i < CONFIG.matrix.columns; i++) {
                this.columns.push(new MatrixColumn(this.canvas, i * columnWidth + columnWidth / 2));
            }
        }
    },
    
    animate(currentTime = performance.now()) {
        if (!this.isActive) return;
        
        try {
            // FPS limiting
            if (!FPSController.shouldRender(currentTime)) {
                matrixAnimationFrame = requestAnimationFrame((time) => this.animate(time));
                return;
            }
            
            // Clear canvas
            const clearAlpha = DEVICE_CONFIG.mobile ? 0.15 : 0.08;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${clearAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw columns
            this.columns.forEach(column => {
                column.update();
                column.draw();
            });
            
            matrixAnimationFrame = requestAnimationFrame((time) => this.animate(time));
            
        } catch (error) {
            console.error('Matrix animation error:', error);
            ErrorHandler.logError(error);
            this.isActive = false;
        }
    },
    
    destroy() {
        this.isActive = false;
        if (matrixAnimationFrame) {
            cancelAnimationFrame(matrixAnimationFrame);
            matrixAnimationFrame = null;
        }
        this.columns = [];
    }
};

// Enhanced Navigation Controller
const Navigation = {
    navbar: null,
    navLinks: null,
    
    init() {
        try {
            this.navbar = document.querySelector('.navbar');
            this.navLinks = document.querySelectorAll('.nav-link');
            
            if (!this.navbar || !this.navLinks.length) {
                console.warn('Navigation elements not found');
                return;
            }
            
            this.bindEvents();
        } catch (error) {
            console.error('Navigation initialization failed:', error);
            ErrorHandler.logError(error);
        }
    },
    
    bindEvents() {
        // Smooth scrolling
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    NotificationSystem.show(`Navigated to ${targetId.replace('#', '')}`, 'success', 1500);
                }
            });
        });
        
        // Optimized navbar scroll effect
        let ticking = false;
        const updateNavbar = () => {
            const scrolled = window.pageYOffset > 100;
            if (this.navbar) {
                this.navbar.style.background = scrolled 
                    ? 'rgba(10, 10, 15, 0.95)' 
                    : 'rgba(10, 10, 15, 0.85)';
            }
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });
    }
};

// Enhanced Interactive Elements Controller
const InteractiveElements = {
    init() {
        try {
            this.bindCTAButtons();
            this.bindModuleCards();
            this.bindCommunityLinks();
            this.bindReplayButton();
            this.bindNavLogo();
        } catch (error) {
            console.error('InteractiveElements initialization failed:', error);
            ErrorHandler.logError(error);
        }
    },
    
    bindCTAButtons() {
        const downloadBtn = document.getElementById('download-starter');
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                NotificationSystem.show('Download starting soon! Stay tuned for updates.', 'success');
                
                // Enhanced click animation
                downloadBtn.style.transform = 'translateY(-6px) translateZ(12px) scale(0.96)';
                downloadBtn.style.transition = 'transform 0.15s ease-out';
                
                setTimeout(() => {
                    downloadBtn.style.transform = '';
                    downloadBtn.style.transition = 'transform 0.3s ease-out';
                }, 150);
            });
        }
    },
    
    bindModuleCards() {
        const moduleCards = document.querySelectorAll('.module-card-3d');
        
        moduleCards.forEach(card => {
            const module = card.dataset.module;
            
            if (module) {
                card.addEventListener('click', () => {
                    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);
                    NotificationSystem.show(`${moduleName} module details`, 'success', 2000);
                });
                
                // Optimized hover for non-touch devices
                if (!DEVICE_CONFIG.mobile) {
                    let hoverTimeout;
                    card.addEventListener('mouseenter', () => {
                        clearTimeout(hoverTimeout);
                        card.style.transform = 'translateY(-5px) rotateX(5deg) rotateY(5deg)';
                    });
                    
                    card.addEventListener('mouseleave', () => {
                        hoverTimeout = setTimeout(() => {
                            card.style.transform = '';
                        }, 100);
                    });
                }
            }
        });
    },
    
    bindCommunityLinks() {
        const communityLinks = document.querySelectorAll('.community-link-3d');
        
        communityLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const linkText = link.querySelector('.link-text')?.textContent || 'Link';
                NotificationSystem.show(`Opening ${linkText}...`, 'success', 2000);
            });
        });
    },
    
    bindReplayButton() {
        const replayBtn = document.getElementById('replay-intro');
        
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                // Clean up existing animations before replay
                HeroCanvas.destroy();
                MatrixCanvas.destroy();
                IntroController.replay();
            });
        }
    },
    
    bindNavLogo() {
        const navLogo = document.getElementById('nav-logo');
        
        if (navLogo) {
            navLogo.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                NotificationSystem.show('Back to top', 'success', 1500);
            });
        }
    }
};

// Enhanced Performance Monitor
const PerformanceMonitor = {
    fps: 0,
    frames: 0,
    lastTime: performance.now(),
    fpsHistory: [],
    maxHistoryLength: 60,
    memoryWarningThreshold: 100, // MB
    
    init() {
        if (CONFIG.performance.enableDebug) {
            this.createDebugPanel();
        }
        this.monitor();
    },
    
    monitor() {
        this.frames++;
        const now = performance.now();
        
        if (now >= this.lastTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
            this.frames = 0;
            this.lastTime = now;
            
            // Store FPS history
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > this.maxHistoryLength) {
                this.fpsHistory.shift();
            }
            
            // Performance warnings and adaptive quality
            if (this.fps < CONFIG.performance.targetFPS * 0.7) {
                console.warn(`Performance warning: FPS dropped to ${this.fps}`);
                this.optimizeForLowFPS();
            }
            
            // Memory monitoring
            if (performance.memory) {
                const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                if (memoryMB > this.memoryWarningThreshold) {
                    console.warn(`Memory warning: ${memoryMB}MB used`);
                    MemoryManager.forceCleanup();
                }
            }
            
            // Update debug panel
            if (CONFIG.performance.enableDebug && this.debugPanel) {
                this.updateDebugPanel();
            }
        }
        
        requestAnimationFrame(() => this.monitor());
    },
    
    optimizeForLowFPS() {
        // Dynamic quality reduction
        CONFIG.hero.particleCount = Math.max(3, Math.floor(CONFIG.hero.particleCount * 0.8));
        CONFIG.intro.particleCount = Math.max(5, Math.floor(CONFIG.intro.particleCount * 0.8));
        CONFIG.matrix.columns = Math.max(8, Math.floor(CONFIG.matrix.columns * 0.8));
        
        // Reduce connection distance
        CONFIG.hero.connectionDistance = Math.max(60, CONFIG.hero.connectionDistance * 0.9);
        
        console.log('Applied performance optimizations');
    },
    
    createDebugPanel() {
        this.debugPanel = document.createElement('div');
        this.debugPanel.id = 'debug-panel';
        this.debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.9);
            color: #00ff88;
            padding: 12px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            z-index: 10000;
            min-width: 220px;
            border: 1px solid #00ff88;
        `;
        document.body.appendChild(this.debugPanel);
    },
    
    updateDebugPanel() {
        const avgFPS = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
        const minFPS = Math.min(...this.fpsHistory);
        const maxFPS = Math.max(...this.fpsHistory);
        const memoryMB = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'Unknown';
        
        this.debugPanel.innerHTML = `
            <div><strong>Performance Monitor</strong></div>
            <div>FPS: ${this.fps} (avg: ${avgFPS})</div>
            <div>Range: ${minFPS}-${maxFPS}</div>
            <div>Quality: ${Math.round(FPSController.qualityLevel * 100)}%</div>
            <div>Memory: ${memoryMB}MB</div>
            <div>Particles: ${heroParticles.length + particles3D.length}</div>
            <div>Device: ${DEVICE_CONFIG.mobile ? 'Mobile' : DEVICE_CONFIG.tablet ? 'Tablet' : 'Desktop'}</div>
            <div>DPR: ${window.devicePixelRatio}</div>
        `;
    },
    
    getAverageFPS() {
        return this.fpsHistory.length > 0 
            ? Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length)
            : 0;
    }
};

// Enhanced Memory Management
const MemoryManager = {
    cleanupInterval: null,
    lastCleanup: 0,
    
    init() {
        this.startCleanupInterval();
        this.bindVisibilityEvents();
        this.bindUnloadEvents();
        this.bindMemoryPressureEvents();
    },
    
    startCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, CONFIG.performance.memoryCleanupInterval);
    },
    
    cleanup() {
        const now = performance.now();
        if (now - this.lastCleanup < 5000) return; // Throttle cleanup
        
        try {
            // Clean up particle trails
            particles3D.forEach(particle => {
                if (particle.trail.length > particle.maxTrailLength) {
                    particle.trail = particle.trail.slice(-particle.maxTrailLength);
                }
            });
            
            // Clean up matrix characters
            if (MatrixCanvas.columns) {
                MatrixCanvas.columns.forEach(column => {
                    if (column.characters.length > column.maxLength) {
                        column.characters = column.characters.slice(-column.maxLength);
                    }
                });
            }
            
            // Clean up notification references
            NotificationSystem.notifications.forEach(notification => {
                if (!document.body.contains(notification)) {
                    NotificationSystem.notifications.delete(notification);
                }
            });
            
            // Force garbage collection hint (if available)
            if (window.gc) {
                window.gc();
            }
            
            this.lastCleanup = now;
            
            if (CONFIG.performance.enableDebug) {
                console.log('Memory cleanup completed');
            }
        } catch (error) {
            console.error('Memory cleanup failed:', error);
        }
    },
    
    forceCleanup() {
        this.cleanup();
        // Additional aggressive cleanup
        particles3D.forEach(particle => particle.trail.length = 0);
        if (MatrixCanvas.columns) {
            MatrixCanvas.columns.forEach(column => column.characters.length = 0);
        }
    },
    
    bindVisibilityEvents() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    },
    
    pauseAnimations() {
        HeroCanvas.isActive = false;
        MatrixCanvas.isActive = false;
        IntroController.isActive = false;
        
        if (heroAnimationFrame) {
            cancelAnimationFrame(heroAnimationFrame);
            heroAnimationFrame = null;
        }
        if (matrixAnimationFrame) {
            cancelAnimationFrame(matrixAnimationFrame);
            matrixAnimationFrame = null;
        }
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    },
    
    resumeAnimations() {
        setTimeout(() => { // Delay to ensure page is active
            if (introCompleted) {
                HeroCanvas.isActive = true;
                MatrixCanvas.isActive = true;
                
                if (HeroCanvas.canvas) HeroCanvas.animate();
                if (MatrixCanvas.canvas) MatrixCanvas.animate();
            } else {
                IntroController.isActive = true;
                if (IntroController.particlesCanvas) IntroController.animate();
            }
        }, 100);
    },
    
    bindMemoryPressureEvents() {
        // Listen for memory pressure events (if supported)
        if ('memory' in performance) {
            setInterval(() => {
                const memoryInfo = performance.memory;
                const usedRatio = memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit;
                
                if (usedRatio > 0.9) {
                    console.warn('High memory usage detected, forcing cleanup');
                    this.forceCleanup();
                }
            }, 10000);
        }
    },
    
    bindUnloadEvents() {
        window.addEventListener('beforeunload', () => {
            this.destroy();
        });
        
        window.addEventListener('pagehide', () => {
            this.destroy();
        });
    },
    
    destroy() {
        // Clear all intervals
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Cancel all animation frames
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (heroAnimationFrame) cancelAnimationFrame(heroAnimationFrame);
        if (matrixAnimationFrame) cancelAnimationFrame(matrixAnimationFrame);
        
        // Clear arrays
        particles3D.length = 0;
        heroParticles.length = 0;
        
        // Clear canvases
        [IntroController.particlesCanvas, HeroCanvas.canvas, MatrixCanvas.canvas]
            .filter(Boolean)
            .forEach(canvas => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Reset canvas size to free memory
                canvas.width = 1;
                canvas.height = 1;
            });
        
        console.log('Memory cleanup completed on unload');
    }
};

// Enhanced Error Handler
const ErrorHandler = {
    errors: [],
    maxErrors: 10,
    lastErrorTime: 0,
    
    init() {
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        
        // Canvas context lost handling
        [IntroController.particlesCanvas, HeroCanvas.canvas, MatrixCanvas.canvas]
            .filter(Boolean)
            .forEach(canvas => {
                canvas.addEventListener('webglcontextlost', this.handleContextLoss.bind(this), false);
                canvas.addEventListener('webglcontextrestored', this.handleContextRestore.bind(this), false);
            });
    },
    
    handleError(event) {
        const now = performance.now();
        if (now - this.lastErrorTime < 1000) return; // Throttle error handling
        
        const error = {
            message: event.message || 'Unknown error',
            filename: event.filename || 'Unknown file',
            line: event.lineno || 0,
            column: event.colno || 0,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.logError(error);
        this.attemptRecovery(error);
        
        // Show user-friendly message (throttled)
        if (now - this.lastErrorTime > 5000) {
            NotificationSystem.show('A minor issue occurred, but the site is still working', 'warning', 3000);
        }
        
        this.lastErrorTime = now;
        return true;
    },
    
    handlePromiseRejection(event) {
        const error = {
            message: event.reason?.message || 'Promise rejection',
            stack: event.reason?.stack || 'No stack trace',
            timestamp: new Date().toISOString(),
            type: 'promise_rejection'
        };
        
        this.logError(error);
        event.preventDefault();
    },
    
    handleContextLoss(event) {
        console.warn('Canvas context lost');
        event.preventDefault();
        
        setTimeout(() => {
            this.handleCanvasError({ message: 'Canvas context lost' });
        }, 100);
    },
    
    handleContextRestore() {
        console.log('Canvas context restored, reinitializing...');
        
        setTimeout(() => {
            try {
                if (IntroController.isActive) {
                    IntroController.setupCanvas();
                    IntroController.initParticles();
                }
                if (HeroCanvas.isActive) {
                    HeroCanvas.setupCanvas();
                    HeroCanvas.initParticles();
                }
                if (MatrixCanvas.isActive) {
                    MatrixCanvas.setupCanvas();
                    MatrixCanvas.initColumns();
                }
            } catch (error) {
                console.error('Context restoration failed:', error);
            }
        }, 500);
    },
    
    handleCanvasError(error) {
        console.error('Canvas error:', error);
        
        // Fallback to static mode
        setTimeout(() => {
            try {
                // Disable animations and show static version
                CONFIG.intro.particleCount = 0;
                CONFIG.hero.particleCount = 0;
                CONFIG.matrix.columns = 0;
                
                NotificationSystem.show('Switched to optimized mode for better performance', 'success');
            } catch (fallbackError) {
                console.error('Fallback failed:', fallbackError);
            }
        }, 1000);
    },
    
    logError(error) {
        this.errors.push(error);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        console.error('Eternal1OS Error:', error);
        
        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false,
                custom_map: {
                    device_type: DEVICE_CONFIG.mobile ? 'mobile' : DEVICE_CONFIG.tablet ? 'tablet' : 'desktop'
                }
            });
        }
    },
    
    attemptRecovery(error) {
        // Canvas context recovery
        if (error.message.includes('canvas') || error.message.includes('context')) {
            setTimeout(() => {
                this.handleCanvasError(error);
            }, 1000);
        }
        
        // Animation frame recovery
        if (error.message.includes('requestAnimationFrame')) {
            setTimeout(() => {
                if (IntroController.isActive && !animationFrame) {
                    IntroController.animate();
                }
                if (HeroCanvas.isActive && !heroAnimationFrame) {
                    HeroCanvas.animate();
                }
                if (MatrixCanvas.isActive && !matrixAnimationFrame) {
                    MatrixCanvas.animate();
                }
            }, 500);
        }
        
        // Memory recovery
        if (error.message.includes('memory') || error.message.includes('allocation')) {
            MemoryManager.forceCleanup();
        }
    },
    
    getErrorReport() {
        return {
            errors: this.errors,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            performance: PerformanceMonitor.getAverageFPS(),
            memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'Unknown',
            device: {
                mobile: DEVICE_CONFIG.mobile,
                tablet: DEVICE_CONFIG.tablet,
                lowEnd: DEVICE_CONFIG.lowEndDevice,
                dpr: window.devicePixelRatio
            }
        };
    }
};

// Enhanced Theme Controller
const ThemeController = {
    currentTheme: 'dark',
    transitions: new Map(),
    manualOverride: false,
    
    init() {
        this.loadSavedTheme();
        this.detectSystemTheme();
        this.applyTheme();
        this.bindMediaQuery();
    },
    
    loadSavedTheme() {
        try {
            const saved = localStorage.getItem('eternal1os-theme');
            if (saved && ['dark', 'light'].includes(saved)) {
                this.currentTheme = saved;
                this.manualOverride = true;
            }
        } catch (e) {
            console.warn('Could not load saved theme preference');
        }
    },
    
    detectSystemTheme() {
        if (!this.manualOverride && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.currentTheme = 'light';
        }
    },
    
    bindMediaQuery() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            mediaQuery.addEventListener('change', (e) => {
                if (!this.manualOverride) {
                    this.currentTheme = e.matches ? 'light' : 'dark';
                    this.applyTheme();
                }
            });
        }
    },
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Store preference
        try {
            localStorage.setItem('eternal1os-theme', this.currentTheme);
        } catch (e) {
            console.warn('Could not save theme preference');
        }
        
        // Update particle colors based on theme
        this.updateParticleColors();
    },
    
    updateParticleColors() {
        const isLight = this.currentTheme === 'light';
        
        if (isLight) {
            CONFIG.particleColor = 'rgba(0, 100, 200, 0.8)';
            CONFIG.matrixColor = 'rgba(50, 50, 150, 0.6)';
        } else {
            CONFIG.particleColor = 'rgba(0, 217, 255, 0.8)';
            CONFIG.matrixColor = 'rgba(0, 255, 198, 0.7)';
        }
    },
    
    toggle() {
        this.manualOverride = true;
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        NotificationSystem.show(`Switched to ${this.currentTheme} theme`, 'success', 2000);
    }
};

// Performance Tracker for Analytics
const PerformanceTracker = {
    metrics: {
        frameDrops: 0,
        averageFrameTime: 0,
        memoryUsage: 0,
        loadTime: 0,
        interactionLatency: []
    },
    
    init() {
        this.metrics.loadTime = performance.now();
        this.startTracking();
    },
    
    startTracking() {
        setInterval(() => {
            this.track();
        }, 10000); // Track every 10 seconds
    },
    
    track() {
        try {
            // Memory usage
            if (performance.memory) {
                this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }
            
            // Frame drops
            const fps = PerformanceMonitor.fps;
            if (fps < CONFIG.performance.targetFPS * 0.8) {
                this.metrics.frameDrops++;
            }
            
            // Send to analytics (if available)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'performance_metrics', {
                    fps: fps,
                    memory_mb: this.metrics.memoryUsage,
                    frame_drops: this.metrics.frameDrops,
                    device_type: DEVICE_CONFIG.mobile ? 'mobile' : DEVICE_CONFIG.tablet ? 'tablet' : 'desktop',
                    quality_level: Math.round(FPSController.qualityLevel * 100)
                });
            }
            
        } catch (error) {
            console.error('Performance tracking error:', error);
        }
    },
    
    trackInteraction(type, duration) {
        this.metrics.interactionLatency.push({
            type,
            duration,
            timestamp: Date.now()
        });
        
        // Keep only recent interactions
        if (this.metrics.interactionLatency.length > 50) {
            this.metrics.interactionLatency.shift();
        }
    }
};

// Enhanced App Controller
const App = {
    initialized: false,
    startTime: null,
    initializationSteps: [
        'ErrorHandler',
        'NotificationSystem', 
        'ThemeController',
        'MemoryManager',
        'PerformanceMonitor',
        'PerformanceTracker',
        'IntroController',
        'Navigation',
        'InteractiveElements'
    ],
    
    init() {
        if (this.initialized) return;
        
        console.log('🚀 Eternal1OS Website Initializing...');
        this.startTime = performance.now();
        
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    },
    
    async start() {
        try {
            // Initialize core systems in order
            await this.initializeComponents();
            
            // Performance logging
            const loadTime = Math.round(performance.now() - this.startTime);
            console.log(`✅ Eternal1OS Website Loaded Successfully in ${loadTime}ms`);
            
            this.initialized = true;
            
            // Log performance metrics
            if (CONFIG.performance.enableDebug) {
                this.logPerformanceMetrics();
            }
            
            // Send load time to analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: loadTime,
                    device_type: DEVICE_CONFIG.mobile ? 'mobile' : DEVICE_CONFIG.tablet ? 'tablet' : 'desktop'
                });
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            NotificationSystem.show('Some features may not work properly', 'error');
            ErrorHandler.logError({
                message: error.message,
                stack: error.stack,
                context: 'App initialization',
                timestamp: new Date().toISOString()
            });
            
            // Fallback initialization
            this.fallbackInit();
        }
    },
    
    async initializeComponents() {
        const componentMap = {
            'ErrorHandler': () => ErrorHandler.init(),
            'NotificationSystem': () => NotificationSystem.init(),
            'ThemeController': () => ThemeController.init(),
            'MemoryManager': () => MemoryManager.init(),
            'PerformanceMonitor': () => PerformanceMonitor.init(),
            'PerformanceTracker': () => PerformanceTracker.init(),
            'IntroController': () => IntroController.init(),
            'Navigation': () => Navigation.init(),
            'InteractiveElements': () => InteractiveElements.init()
        };
        
        for (const componentName of this.initializationSteps) {
            try {
                const component = componentMap[componentName];
                if (component) {
                    await component();
                    console.log(`✓ ${componentName} initialized`);
                } else {
                    console.warn(`Component ${componentName} not found`);
                }
            } catch (error) {
                console.error(`✗ Failed to initialize ${componentName}:`, error);
                ErrorHandler.logError({
                    message: `${componentName} initialization failed: ${error.message}`,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });
                
                // Continue with other components
                continue;
            }
        }
    },
    
    fallbackInit() {
        // Minimal fallback initialization for critical components
        try {
            NotificationSystem.init();
            Navigation.init();
            InteractiveElements.init();
            
            // Skip animations and use static mode
            CONFIG.intro.particleCount = 0;
            CONFIG.hero.particleCount = 0;
            CONFIG.matrix.columns = 0;
            
            NotificationSystem.show('Running in safe mode', 'warning', 5000);
            console.log('Fallback initialization completed');
            
        } catch (fallbackError) {
            console.error('Even fallback initialization failed:', fallbackError);
        }
    },
    
    logPerformanceMetrics() {
        const metrics = {
            loadTime: Math.round(performance.now() - this.startTime),
            particleCount: particles3D.length + heroParticles.length,
            memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 'Unknown',
            userAgent: navigator.userAgent.split(' ').pop(),
            screenResolution: `${screen.width}x${screen.height}`,
            devicePixelRatio: window.devicePixelRatio || 1,
            hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
            connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown',
            reducedMotion: DEVICE_CONFIG.reducedMotion,
            deviceType: DEVICE_CONFIG.mobile ? 'mobile' : DEVICE_CONFIG.tablet ? 'tablet' : 'desktop'
        };
        
        console.table(metrics);
    },
    
    restart() {
        try {
            // Clean up existing instances
            MemoryManager.destroy();
            
            // Reset global state
            introCompleted = false;
            this.initialized = false;
            
            // Clear DOM states
            const containers = ['intro-overlay', 'main-site'];
            containers.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.display = '';
                    el.classList.remove('visible', 'fade-out');
                }
            });
            
            // Reinitialize after cleanup
            setTimeout(() => {
                this.init();
            }, 100);
            
        } catch (error) {
            console.error('Restart failed:', error);
            window.location.reload(); // Force page reload as last resort
        }
    },
    
    // Health check method
    healthCheck() {
        const health = {
            initialized: this.initialized,
            introCompleted: introCompleted,
            activeAnimations: {
                intro: IntroController.isActive,
                hero: HeroCanvas.isActive,
                matrix: MatrixCanvas.isActive
            },
            fps: PerformanceMonitor.fps,
            memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : null,
            errors: ErrorHandler.errors.length,
            particleCounts: {
                intro: particles3D.length,
                hero: heroParticles.length,
                matrix: MatrixCanvas.columns ? MatrixCanvas.columns.length : 0
            }
        };
        
        console.log('Health Check:', health);
        return health;
    }
};

// Utility function for safe DOM manipulation
const SafeDOM = {
    getElementById: (id) => {
        try {
            return document.getElementById(id);
        } catch (error) {
            console.error(`Failed to get element ${id}:`, error);
            return null;
        }
    },
    
    querySelector: (selector) => {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.error(`Failed to query ${selector}:`, error);
            return null;
        }
    },
    
    querySelectorAll: (selector) => {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.error(`Failed to query all ${selector}:`, error);
            return [];
        }
    }
};

// Enhanced feature detection
const FeatureDetection = {
    canvas: (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    })(),
    
    webgl: (() => {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    })(),
    
    requestAnimationFrame: (() => {
        return !!(window.requestAnimationFrame || 
                 window.webkitRequestAnimationFrame || 
                 window.mozRequestAnimationFrame);
    })(),
    
    localStorage: (() => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    })(),
    
    touch: (() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    })(),
    
    deviceOrientation: (() => {
        return 'DeviceOrientationEvent' in window;
    })(),
    
    performanceMemory: (() => {
        return !!(performance && performance.memory);
    })()
};

// Initialize feature-based fallbacks
if (!FeatureDetection.canvas) {
    console.warn('Canvas not supported, disabling animations');
    CONFIG.intro.particleCount = 0;
    CONFIG.hero.particleCount = 0;
    CONFIG.matrix.columns = 0;
}

if (!FeatureDetection.requestAnimationFrame) {
    console.warn('RequestAnimationFrame not supported, using setTimeout fallback');
    window.requestAnimationFrame = (callback) => setTimeout(callback, 16);
    window.cancelAnimationFrame = clearTimeout;
}

// Service Worker registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully');
            })
            .catch(error => {
                console.log('Service Worker registration failed');
            });
    });
}

// Initialize the application with comprehensive error handling
(() => {
    try {
        // Pre-initialization checks
        if (!document || !window) {
            throw new Error('DOM or Window not available');
        }
        
        // Initialize with safety checks
        App.init();
        
    } catch (criticalError) {
        console.error('Critical initialization error:', criticalError);
        
        // Last resort fallback
        document.addEventListener('DOMContentLoaded', () => {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 100, 100, 0.05));
                    color: #ff6b6b;
                    padding: 30px;
                    border-radius: 15px;
                    text-align: center;
                    font-family: 'Inter', system-ui, sans-serif;
                    max-width: 400px;
                    border: 2px solid rgba(255, 107, 107, 0.3);
                    backdrop-filter: blur(20px);
                ">
                    <h3 style="margin-bottom: 20px; color: #ff4757;">System Error</h3>
                    <p style="margin-bottom: 25px; line-height: 1.6;">
                        Unable to load the website properly. This may be due to browser compatibility issues.
                    </p>
                    <button onclick="location.reload()" style="
                        background: linear-gradient(135deg, #ff6b6b, #ff4757);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        font-size: 14px;
                    " onmouseover="this.style.transform='translateY(-2px)'" 
                       onmouseout="this.style.transform='translateY(0)'">
                        Reload Page
                    </button>
                    <div style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                        Error Code: INIT_FAILURE
                    </div>
                </div>
            `;
        });
    }
})();

// Global error boundary
window.addEventListener('error', (event) => {
    if (event.message.includes('Eternal1OS')) {
        console.error('Global Eternal1OS error caught:', event);
        // Attempt to keep the site functional
        return true;
    }
});

// Export for debugging (development only)
if (CONFIG.performance.enableDebug) {
    window.Eternal1OS = {
        App,
        CONFIG,
        DEVICE_CONFIG,
        PerformanceMonitor,
        MemoryManager,
        ErrorHandler,
        IntroController,
        HeroCanvas,
        MatrixCanvas,
        healthCheck: () => App.healthCheck()
    };
}