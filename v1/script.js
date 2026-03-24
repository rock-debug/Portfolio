document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.getElementById('coordinate-tooltip');
    const bgGrid = document.querySelector('.background-grid');

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX; const y = e.clientY;
        tooltip.textContent = `x: ${x}, y: ${y}`;
        const moveX = (x / window.innerWidth - 0.5) * -20;
        const moveY = (y / window.innerHeight - 0.5) * -20;
        bgGrid.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        bgGrid.style.backgroundPositionY = `${scrollY * 0.5}px`;
    });

    const observer = new IntersectionObserver((entries) => {
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
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const graphs = document.querySelectorAll('.project-graph');
    graphs.forEach(g => observer.observe(g));
});
