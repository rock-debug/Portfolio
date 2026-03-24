document.addEventListener('DOMContentLoaded', () => {
    const mapTrigger = document.getElementById('map-trigger');
    const mapCanvas = document.getElementById('map-canvas');
    const markerLabel = document.getElementById('marker-label');

    markerLabel.style.opacity = '0';

    window.addEventListener('scroll', () => {
        const rect = mapTrigger.getBoundingClientRect();
        let scrollProgress = 0;
        
        if (rect.top <= 0) {
            const totalScrollableHeight = rect.height - window.innerHeight;
            const scrolledPixels = Math.abs(rect.top);
            scrollProgress = Math.min(Math.max(scrolledPixels / totalScrollableHeight, 0), 1);
        }
        if (rect.top > 0) scrollProgress = 0;

        const maxScale = 50; 
        const currentScale = Math.pow(maxScale, scrollProgress);
        
        if (scrollProgress > 0.8) {
            const opacity = (scrollProgress - 0.8) * 5;
            markerLabel.style.opacity = opacity.toString();
            markerLabel.style.transform = `translateX(-50%) scale(${1 / currentScale})`;
        } else {
            markerLabel.style.opacity = '0';
        }

        const rotation = scrollProgress * 15;
        mapCanvas.style.transform = `scale(${currentScale}) rotate(${rotation}deg)`;
    });
});
