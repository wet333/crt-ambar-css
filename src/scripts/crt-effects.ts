const VERTEX_SHADER = `
// ================================================================
// VERTEX SHADER - Quad de pantalla completa
//
// Recibe un quad de 4 vertices en clip-space (-1 a 1) y lo convierte
// en coordenadas UV (0 a 1) para que el fragment shader pueda
// muestrear la pantalla. No transforma geometria 3D.
// ================================================================
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
    // Convierte clip-space (-1..1) a UV (0..1)
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
// ================================================================
// FRAGMENT SHADER - Efectos CRT
//
// Genera una capa de overlay que simula un monitor CRT ambar.
// El shader produce dos tipos de salida combinados en gl_FragColor:
//   - RGB (totalAdd): luz que se SUMA sobre el contenido (grain,
//     beam, haze, interference)
//   - Alpha (totalDark): oscuridad que se RESTA del contenido
//     (scanlines, vignette, flicker)
//
// El blending premultiplied alpha en el lado JS hace que ambos
// funcionen simultaneamente.
// ================================================================
precision mediump float;
varying vec2 v_uv;
uniform float u_time;       // segundos desde inicio
uniform vec2 u_resolution;  // tamaño del canvas en pixeles

// ----------------------------------------------------------------
// HASH - Generador pseudo-aleatorio
//
// Recibe una coordenada 2D y devuelve un valor 0.0 - 1.0.
// Se usa para generar ruido (grain) e interferencia.
// No es criptografico; solo necesita verse "aleatorio" visualmente.
// ----------------------------------------------------------------
float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

void main() {
    vec2 uv = v_uv;

    // Color base ambar del fosforo CRT
    // Config: cambiar estos valores para otro tono (ej. verde: 0.0, 1.0, 0.0)
    vec3 amber = vec3(1.0, 0.69, 0.0);

    // ============================================================
    // SCANLINES - Lineas horizontales oscuras entre filas de pixeles
    //
    // Simula las bandas oscuras visibles entre las lineas de fosforo
    // de un CRT real. Se genera un seno por cada fila de pixeles
    // y se usa la parte baja de la onda como oscurecimiento.
    //
    // Config:
    //   0.12 → intensidad de oscuridad (0.0 = sin scanlines, ~0.3 = muy marcadas)
    // ============================================================
    float scanlineY = uv.y * u_resolution.y;
    float scanline = sin(scanlineY * 3.14159265);
    float scanDark = (1.0 - clamp(scanline, 0.0, 1.0)) * 0.25;

    // ============================================================
    // VIGNETTE - Oscurecimiento en bordes y esquinas
    //
    // Simula la sombra del bisel/curvatura del tubo CRT.
    // Se calcula la distancia del pixel al centro; cuanto mas lejos,
    // mas se oscurece.
    //
    // Config:
    //   vec2(0.7, 0.5) → forma del ovalo (mas bajo = mas redondo)
    //   smoothstep(0.6, 1.4, ...) → 0.6 = donde empieza, 1.4 = donde llega al maximo
    //   0.5 → oscuridad maxima en los bordes (0.0 - 1.0)
    // ============================================================
    vec2 vigCoord = uv * 2.0 - 1.0;
    float vigDist = length(vigCoord * vec2(0.7, 0.5));
    float vigDark = smoothstep(0.6, 1.4, vigDist) * 0.75;

    // ============================================================
    // FLICKER - Parpadeo sutil de brillo
    //
    // Simula la inestabilidad electrica de un CRT real. Dos ondas
    // sinusoidales a frecuencias distintas crean un parpadeo
    // irregular y sutil.
    //
    // Config:
    //   0.008 → amplitud de la primera onda (mas = parpadeo mas fuerte)
    //   0.004 → amplitud de la segunda onda
    //   9.0   → frecuencia de la primera onda (Hz)
    //   17.3  → frecuencia de la segunda onda (Hz)
    // ============================================================
    float flicker = 1.0 + 0.01 * sin(u_time * 9.0) + 0.005 * sin(u_time * 17.3);

    // Combina scanlines + vignette, modulados por flicker
    float totalDark = clamp((scanDark + vigDark) * flicker, 0.0, 1.0);

    // ============================================================
    // GRAIN / NOISE - Ruido granulado tipo pelicula
    //
    // Genera un valor aleatorio por cada pixel de pantalla,
    // cambiando 30 veces por segundo para simular ruido analogico.
    //
    // Config:
    //   floor(u_time * 10.0) → 10.0 = fps del ruido (mas = cambio mas rapido)
    //   0.01 → intensidad del grano (0.0 = sin grano, ~0.05 = muy visible)
    // ============================================================
    vec2 noiseCoord = floor(uv * u_resolution);
    float noise = hash(noiseCoord + floor(u_time * 10.0));
    vec3 grain = amber * noise * 0.01;

    // ============================================================
    // BEAM - Barra de refresco vertical
    //
    // Una banda horizontal brillante que baja lentamente por la
    // pantalla, simulando el haz de electrones del CRT recorriendo
    // la pantalla de arriba a abajo.
    //
    // Config:
    //   7.5 → velocidad de desplazamiento (mas alto = mas rapido)
    //   25.0 → grosor inverso del haz (mas alto = haz mas fino)
    //   0.025 → brillo maximo del haz (0.0 - ~0.1)
    // ============================================================
    float beamPos = fract(u_time * 7.5);
    float beam = exp(-abs(uv.y - beamPos) * 25.0) * 0.025;
    vec3 beamColor = amber * beam;

    // ============================================================
    // HAZE - Resplandor central de fosforo
    //
    // Un brillo sutil concentrado en el centro de la pantalla,
    // simulando la difusion de luz del fosforo. Usa la misma
    // distancia que el vignette pero para SUMAR luz.
    //
    // Config:
    //   1.0   → velocidad de caida (mas alto = haze mas concentrado al centro)
    //   0.05 → intensidad del resplandor (0.0 - ~0.03)
    // ============================================================
    float haze = exp(-vigDist * 1.0) * 0.05;
    vec3 hazeColor = amber * haze;

    // ============================================================
    // INTERFERENCE - Lineas horizontales aleatorias
    //
    // Genera lineas brillantes que aparecen brevemente en posiciones
    // aleatorias, simulando interferencia electromagnetica o
    // problemas de señal.
    //
    // Config:
    //   0.997 → umbral de aparicion (mas alto = menos frecuente, rango 0.99-0.999)
    //   floor(u_time * 15.0) → 15.0 = velocidad de cambio temporal
    //   floor(uv.y * 200.0) → 200.0 = numero de franjas verticales posibles
    //   0.015 → brillo de cada linea (0.0 - ~0.05)
    // ============================================================
    float interference = step(0.997, hash(vec2(floor(u_time * 15.0), floor(uv.y * 200.0)))) * 0.015;
    vec3 interferenceColor = amber * interference;

    // ============================================================
    // SALIDA FINAL
    //
    // RGB = suma de todos los efectos de luz (grain + beam + haze + interference)
    // Alpha = oscuridad total (scanlines + vignette, modulados por flicker)
    //
    // El blending premultiplied alpha en JS (ONE, ONE_MINUS_SRC_ALPHA) hace que:
    //   - RGB se sume sobre el contenido de la pagina
    //   - Alpha oscurezca el contenido de la pagina
    // ============================================================
    vec3 totalAdd = grain + beamColor + hazeColor + interferenceColor;

    gl_FragColor = vec4(totalAdd, totalDark);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function linkProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function initCRT(): void {
    // ================================================================
    // BLOOM / GLOW DE FOSFORO
    //
    // Simula como los fosforos de un CRT irradian luz alrededor de
    // cada pixel encendido. Funciona en 3 pasos:
    //
    //   1. backdrop-filter captura el contenido visible detras de
    //      esta capa y le aplica blur (difusion) + brightness (brillo)
    //   2. mix-blend-mode: screen hace que esta capa solo SUME luz
    //      sobre el contenido original, sin oscurecerlo nunca
    //   3. opacity controla la intensidad general del efecto
    //
    // Ajustes rapidos:
    //   - blur(Xpx)      → radio del glow (mas = glow mas difuso)
    //   - brightness(X)   → amplitud de la luz (mas = mas brillante)
    //   - opacity          → intensidad global (0.0 a 1.0)
    // ================================================================
    const bloom = document.createElement('div');
    bloom.style.cssText = [
        'position:fixed',
        'inset:0',
        'width:100%',
        'height:100%',
        'pointer-events:none',
        'z-index:9998',
        'backdrop-filter:blur(8px) brightness(2.5)',
        '-webkit-backdrop-filter:blur(8px) brightness(2.5)',
        'mix-blend-mode:screen',
        'opacity:0.2',
    ].join(';');

    document.body.appendChild(bloom);

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999;';
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
    if (!gl) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = linkProgram(gl, vs, fs);
    if (!program) return;

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const resize = (): void => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const startTime = performance.now();
    const render = (): void => {
        const elapsed = (performance.now() - startTime) / 1000.0;
        gl.uniform1f(timeLoc, elapsed);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}

function initMenu(): void {
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

document.addEventListener('DOMContentLoaded', () => {
    initCRT();
    initMenu();
});
