document.addEventListener('DOMContentLoaded', () => {
    
    const scene = document.getElementById('scene3d');
    const ball = document.getElementById('ball3d');
    const shadow = document.getElementById('ball-shadow');
    const pitcher = document.getElementById('pitcher-model');
    const batter = document.getElementById('batter-model');
    const steps = document.querySelectorAll('.step');

    window.addEventListener('scroll', () => {
        const scrollMax = document.body.scrollHeight - window.innerHeight;
        const progress = Math.min(Math.max(window.scrollY / scrollMax, 0), 1);
        
        let bx = 0, by = 0, bz = 0;
        let camZ = -135, camX = 85, scale = 1.2;
        let batterX = 0, batterY = 0;
        let batterImage = 'images/bat1.png';
        
        // 0.0 - 0.25: The Windup & Pitch (Mound to Home)
        if (progress <= 0.25) {
            let p = progress / 0.25; 
            bx = 125 - (125 * p);
            by = 125 - (125 * p);
            bz = 15 - (10 * p); 
            
            camZ = -135;
            camX = 78; // Slightly higher (78deg) to look over the batter's shoulder
            scale = 1.2 + (0.4 * p); // Zoom in dramatically as the pitch arrives
            
            let frameIdx = Math.min(Math.floor(p * 5) + 1, 5);
            pitcher.style.backgroundImage = `url('images/pitch${frameIdx}.png')`;
            batterImage = `images/bat1.png`;
        }
        // 0.25 - 0.70: The Contact & Flight (Home to Deep Center Field)
        else if (progress <= 0.70) {
            let p = (progress - 0.25) / 0.45;
            bx = p * 700; 
            by = p * 700;
            bz = 10 + Math.sin(p * Math.PI) * 200; // Flatter line drive trajectory
            
            camZ = -135 + (p * 90); 
            camX = 78 - (p * 28); // Smoothly tilt up from 78 down to an aerial 50 degree view
            scale = 1.6 - (0.8 * p); // Compensating for the added zoom in the first phase
            
            pitcher.style.backgroundImage = `url('images/pitch5.png')`; 
            
            let batP = Math.min(p / 0.15, 1); 
            if (batP < 1) {
                let batFrameIdx = Math.min(Math.floor(batP * 4) + 1, 4);
                batterImage = `images/bat${batFrameIdx}.png`;
            } else {
                batterImage = `images/bat5.png`;
            }
        }
        // 0.70 - 1.0: Scoreboard Display (Center Field)
        else {
            let p = (progress - 0.70) / 0.30;
            bx = 700; 
            by = 700; 
            bz = 5; 
            
            camZ = -45 - (p * 90); 
            camX = 50 + (p * 35); 
            scale = 0.8 + (p * 2.0); 
            
            pitcher.style.backgroundImage = `url('images/pitch5.png')`;
            batterImage = `images/bat5.png`;
        }

        // Apply Batter Base Trot
        if (progress > 0.32) {
            let trotP = Math.min((progress - 0.32) / 0.68, 1);
            if (trotP <= 0.25) { 
                batterX = 0; batterY = (trotP / 0.25) * 250;
            } else if (trotP <= 0.50) { 
                batterX = ((trotP - 0.25) / 0.25) * 250; batterY = 250;
            } else if (trotP <= 0.75) { 
                batterX = 250; batterY = 250 - (((trotP - 0.50) / 0.25) * 250);
            } else { 
                batterX = 250 - (((trotP - 0.75) / 0.25) * 250); batterY = 0;
            }
        }

        // Apply transforms to scene and ball
        scene.style.transform = `scale(${scale}) rotateX(${camX}deg) rotateZ(${camZ}deg)`;
        ball.style.transform = `translate3d(${bx}px, ${by}px, ${bz}px)`;
        shadow.style.transform = `translate3d(${bx}px, ${by}px, 0px)`;

        // Update Billboards
        batter.style.backgroundImage = `url('${batterImage}')`;
        batter.style.left = `${batterX}px`;
        batter.style.top = `${batterY}px`;

        let faceCameraAngle = -camZ - 45;
        let billboardTransform = `translate(-50%, -100%) rotateZ(${faceCameraAngle}deg) rotateX(-90deg)`;
        pitcher.style.transform = billboardTransform;
        batter.style.transform = billboardTransform;

        // Highlight narrative text based on viewport
        steps.forEach(step => {
            const rect = step.getBoundingClientRect();
            const stepCenter = rect.top + (rect.height / 2);
            if (Math.abs(stepCenter - window.innerHeight / 2) < window.innerHeight * 0.4) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    });

    window.dispatchEvent(new Event('scroll'));
});
