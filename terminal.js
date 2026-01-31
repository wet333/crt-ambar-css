(function() {
    document.addEventListener("DOMContentLoaded", () => {
        initCRT();
        initMenu();
    });

    function initCRT() {
        const overlay = document.createElement('div');
        overlay.classList.add('crt-overlay');
        document.body.appendChild(overlay);

        const anim = document.createElement('div');
        anim.classList.add('crt-scan-anim');
        document.body.appendChild(anim);

        const canvas = document.createElement('canvas');
        canvas.classList.add('crt-noise-canvas');
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const drawNoise = () => {
            const w = canvas.width;
            const h = canvas.height;
            ctx.clearRect(0,0,w,h);

            for (let i = 0; i < 400; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const opacity = Math.random() * 0.4;
                ctx.fillStyle = `rgba(255, 176, 0, ${opacity})`;
                ctx.fillRect(x, y, 2, 2);
            }
            if(Math.random() > 0.92) {
                ctx.fillStyle = 'rgba(255, 176, 0, 0.05)';
                ctx.fillRect(0, Math.random() * h, w, 4);
            }
            requestAnimationFrame(drawNoise);
        };
        setInterval(() => requestAnimationFrame(drawNoise), 100);
    }

    function initMenu() {
        const nav = document.querySelector('nav');
        const list = document.querySelector('nav ul');

        if (nav && list) {
            const button = document.createElement('button');
            button.id = 'menu-toggle';
            button.innerText = '> ABRIR COMANDOS';

            nav.insertBefore(button, list);

            button.addEventListener('click', () => {
                list.classList.toggle('open');
                if (list.classList.contains('open')) {
                    button.innerText = '> CERRAR COMANDOS';
                } else {
                    button.innerText = '> ABRIR COMANDOS';
                }
            });
        }
    }
})();