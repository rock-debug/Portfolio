document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mouse Tooltip (V1 Logic)
    const tooltip = document.getElementById('coordinate-tooltip');
    document.addEventListener('mousemove', (e) => {
        tooltip.textContent = `x: ${e.clientX}, y: ${e.clientY}`;
    });

    // Setup elements for interaction
    const bgGrid         = document.querySelector('.background-grid');
    const mapTrigger     = document.getElementById('map-trigger');
    const mapCanvas      = document.getElementById('map-canvas');
    const backboardWraps = document.querySelectorAll('.backboard-wrap');
    const balls          = document.querySelectorAll('.basketball');
    const jumpFigure     = document.getElementById('jumpshot');
    const jumpFrames     = jumpFigure ? jumpFigure.querySelectorAll('.jump-frame') : [];

    // 2. Global Scroll Event handling Parallax (V1) and 3D Cinematic (V2)
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // V1 Parallax pan for the aesthetic background
        if (bgGrid) {
             bgGrid.style.backgroundPositionY = `${scrollY * 0.5}px`;
        }

        // V2 3D Cinematic Scroll Logic — Basketball Backboard Timeline
        if (mapTrigger && mapCanvas) {
            const rect = mapTrigger.getBoundingClientRect();
            let scrollProgress = 0;

            if (rect.top <= 0) {
                const totalScrollableHeight = rect.height - window.innerHeight;
                const scrolledPixels = Math.abs(rect.top);
                scrollProgress = Math.min(Math.max(scrolledPixels / totalScrollableHeight, 0), 1);
            }

            if (rect.top > 0) scrollProgress = 0;

            // 1. Background Grid scale & rotate (fly-through parallax — unchanged)
            const maxScale = 50;
            const currentScale = Math.pow(maxScale, scrollProgress);
            const rotation = scrollProgress * 15;
            mapCanvas.style.transform = `scale(${currentScale}) rotate(${rotation}deg)`;

            // 2. Backboard wraps — same fly-in-from-depth logic as before
            const isMobile = window.innerWidth <= 768;
            const W = window.innerWidth;
            const H = window.innerHeight;
            const xOffset = isMobile ? '0px' : '-40px';

            backboardWraps.forEach(wrap => {
                const threshold  = parseFloat(wrap.getAttribute('data-threshold'));
                const diff       = scrollProgress - threshold;

                if (diff < -0.15) {
                    wrap.style.opacity   = '0';
                    wrap.style.transform = `translate(${xOffset}, -40%) scale(0.5)`;
                    wrap.style.filter    = 'blur(10px)';
                    wrap.style.pointerEvents = 'none';
                } else if (diff >= -0.15 && diff <= 0.15) {
                    let scaleC = 1, opacityC = 1, blurC = 0;
                    if (diff < 0) {
                        const p = (diff + 0.15) / 0.15;
                        scaleC   = 0.5 + p * 0.5;
                        opacityC = p;
                        blurC    = (1 - p) * 10;
                    } else {
                        const p = diff / 0.15;
                        scaleC   = 1 + p * 3;
                        opacityC = 1 - p;
                        blurC    = 0;   // no blur on exit — stays crisp as it moves out
                    }
                    wrap.style.opacity   = opacityC;
                    wrap.style.transform = `translate(${xOffset}, -40%) scale(${scaleC})`;
                    wrap.style.filter    = `blur(${blurC}px)`;
                    wrap.style.pointerEvents = opacityC > 0.5 ? 'auto' : 'none';
                } else {
                    wrap.style.opacity   = '0';
                    wrap.style.pointerEvents = 'none';
                }
            });

            // 3. Per-hoop basketball arc
            // Each ball is active during its hoop's focus window: threshold ± 0.13

            balls.forEach((ball, i) => {
                const threshold = parseFloat(backboardWraps[i].getAttribute('data-threshold'));
                const window_half = 0.13;
                const start = threshold - window_half;
                const end   = threshold + window_half;

                if (scrollProgress < start || scrollProgress > end) {
                    ball.style.opacity = '0';
                    return;
                }

                // Local progress 0→1 within this hoop's window
                const local = (scrollProgress - start) / (end - start);

                // Hoop target derived from CSS layout:
                // backboard-wrap: right:30%, width:380px → center-x = W*0.70 - 190
                // JS translate: -40px horizontally → centre-x = W*0.70 - 190 - 40 = W*0.70 - 230
                // backboard-wrap: top:50%, translate -40%  of wrap height (~335px) → top = H*0.5 - 134
                // backboard height ~240px, hoop-ring center is 20px below board bottom
                // → hoopY = H*0.5 - 134 + 240 + 20 = H*0.5 + 126
                const hoopX = W * 0.70 - 230;
                const hoopY = H * 0.50 + 130;

                // Ball launches from bottom-LEFT corner
                const startX = W * 0.08;
                const startY = H * 0.96;


                // ── Phase breakdown ──
                // 0.00 → 0.15 : frame 1
                // 0.15 → 0.30 : frame 2
                // 0.30 → 0.45 : frame 3 hold  — ball still hidden
                // 0.45 → 0.68 : FLIGHT — frame 4, ball arcs to hoop
                // 0.68 → 1.00 : DROP   — figure & ball fade out

                let bx, by, opacity, rotate;
                const figX = startX - 40;
                const figY = startY - 200;

                if (local < 0.45) {
                    // WINDUP — ball invisible, figure shows frames 1 → 2 → 3
                    opacity = 0;
                    bx = startX; by = startY; rotate = 0;

                    if (jumpFigure) {
                        jumpFigure.style.opacity = Math.min(1, local * 10).toString();
                        jumpFigure.style.transform = `translate(${figX}px, ${figY}px)`;
                        // Frame steps: 0-0.15 → frame0, 0.15-0.30 → frame1, 0.30-0.45 → frame2
                        const frameIdx = local < 0.15 ? 0 : local < 0.30 ? 1 : 2;
                        jumpFrames.forEach((f, fi) => f.classList.toggle('active', fi === frameIdx));
                    }

                } else if (local <= 0.68) {
                    // FLIGHT — ball in the air, figure holds frame 4
                    const t = (local - 0.45) / 0.23;   // 0→1 during flight
                    bx = startX + (hoopX - startX) * t;
                    const arcHeight = H * 0.55;
                    by = startY + (hoopY - startY) * t - arcHeight * 4 * t * (1 - t);
                    opacity = Math.min(1, t * 5);
                    rotate  = t * 360;

                    if (jumpFigure) {
                        jumpFigure.style.opacity = '1';
                        jumpFigure.style.transform = `translate(${figX}px, ${figY}px)`;
                        jumpFrames.forEach((f, fi) => f.classList.toggle('active', fi === 3));
                    }

                } else {
                    // DROP — ball falls, figure fades
                    const t = (local - 0.68) / 0.32;
                    bx = hoopX;
                    by = hoopY + t * H * 0.35;
                    opacity = 1 - t;
                    rotate  = 360 + t * 180;

                    if (jumpFigure) {
                        jumpFigure.style.opacity = Math.max(0, 1 - t * 2).toString();
                    }
                }

                ball.style.opacity   = opacity;
                ball.style.transform = `translate(${bx - 32}px, ${by - 32}px) rotate(${rotate}deg)`;
            });

            // Hide jumpshot when no hoop is active
            const anyActive = Array.from(backboardWraps).some(wrap => {
                const t = parseFloat(wrap.getAttribute('data-threshold'));
                return scrollProgress >= t - 0.13 && scrollProgress <= t + 0.13;
            });
            if (jumpFigure && !anyActive) jumpFigure.style.opacity = '0';
        }
    });

    // 3. Faux Bar Chart Animations (V1 Logic)
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                if (entry.target.classList.contains('blue-graph')) {
                    const bars = entry.target.querySelectorAll('.bar');
                    bars.forEach((bar, index) => {
                        const originalHeight = bar.style.height;
                        bar.style.height = '0%';
                        setTimeout(() => {
                            bar.style.transition = 'height 1s cubic-bezier(0.1, 0.9, 0.2, 1)';
                            bar.style.height = originalHeight;
                        }, index * 200 + 100);
                    });
                }
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const graphs = document.querySelectorAll('.project-graph');
    graphs.forEach(g => barObserver.observe(g));

    // 4. Technical Lexicon Flip Cards
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });

    // Certification Flip Boxes
    const certCards = document.querySelectorAll('.cert-card');
    certCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Do not flip if the link button was clicked
            if (!e.target.classList.contains('cert-btn')) {
                card.classList.toggle('flipped');
            }
        });
    });

    // 5. Scroll-reveal for project cards
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings slightly
                const delay = entry.target.dataset.revealDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.project-card').forEach((card, i) => {
        card.dataset.revealDelay = i * 80;
        revealObserver.observe(card);
    });

    // Reveal plain sections too
    document.querySelectorAll('.reveal-section').forEach(el => {
        revealObserver.observe(el);
    });

    // 6. 3D Magnetic Tilt on project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('revealed')) return;
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);   // -1 to +1
            const dy = (e.clientY - cy) / (rect.height / 2);  // -1 to +1
            const maxTilt = 4; // degrees — subtle
            card.style.setProperty('--tilt-x', `${-dy * maxTilt}deg`);
            card.style.setProperty('--tilt-y', `${dx * maxTilt}deg`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        });
    });

    // 7. Hero Stat Counter Animation
    const statValues = document.querySelectorAll('.stat-value[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseFloat(el.getAttribute('data-target'));
            const suffix = el.getAttribute('data-suffix') || '';
            const isFloat = !Number.isInteger(target);
            const duration = 1400;
            const startTime = performance.now();

            function tick(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;
                el.textContent = (isFloat ? current.toFixed(2) : Math.floor(current)) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = (isFloat ? target.toFixed(2) : target) + suffix;
            }

            requestAnimationFrame(tick);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.6 });

    statValues.forEach(el => counterObserver.observe(el));

    // 8. Fetch Live Coding Stats
    fetch('coding_stats.json')
        .then(response => response.json())
        .then(data => {
            if (data.leetcode && !data.leetcode.error) {
                const lc = data.leetcode;
                if(document.getElementById('lc-total')) document.getElementById('lc-total').textContent = lc.total;
                if(document.getElementById('lc-easy')) document.getElementById('lc-easy').textContent = lc.easy;
                if(document.getElementById('lc-medium')) document.getElementById('lc-medium').textContent = lc.medium;
                if(document.getElementById('lc-hard')) document.getElementById('lc-hard').textContent = lc.hard;
                if(document.getElementById('lc-rank')) document.getElementById('lc-rank').textContent = lc.ranking;
            }
            if (data.geeksforgeeks && !data.geeksforgeeks.error) {
                const gfg = data.geeksforgeeks;
                if(document.getElementById('gfg-total')) document.getElementById('gfg-total').textContent = gfg.total_problems_solved || document.getElementById('gfg-total').textContent;
                if(document.getElementById('gfg-score')) document.getElementById('gfg-score').textContent = gfg.score || document.getElementById('gfg-score').textContent;
                if(document.getElementById('gfg-rank')) document.getElementById('gfg-rank').textContent = gfg.institute_rank || document.getElementById('gfg-rank').textContent;
            }
            if (data.hackerrank && !data.hackerrank.error) {
                const badges = data.hackerrank.badges || {};
                const safeSet = (id, badgeName) => { const el = document.getElementById(id); if(el && badges[badgeName]) el.textContent = badges[badgeName]; };
                safeSet('hr-ps', 'Problem Solving'); safeSet('hr-py', 'Python'); safeSet('hr-sql', 'Sql'); safeSet('hr-c', 'C');
                const pyRaw = badges['Python_raw'] || 4; const psRaw = badges['Problem Solving_raw'] || 3;
                if(document.getElementById('hr-ft-1')) document.getElementById('hr-ft-1').innerHTML = `⚡ ${pyRaw}★ Python Track`;
                if(document.getElementById('hr-ft-2')) document.getElementById('hr-ft-2').innerHTML = `🧩 ${psRaw}★ Problem Solving`;
            }
        })
        .catch(err => console.error(err));

});
