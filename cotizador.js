document.addEventListener('DOMContentLoaded', () => {
    
    // VARIABLES DE ESTADO
    let modoActual = 'horas'; // 'horas' o 'paginas'

    // REFERENCIAS DOM
    const btnHoras = document.querySelector('[data-mode="horas"]');
    const btnPaginas = document.querySelector('[data-mode="paginas"]');
    const labelVolumen = document.getElementById('label-volumen');
    const helperVolumen = document.getElementById('helper-volumen');
    
    const inputCursos = document.getElementById('cantidadCursos');
    const inputDensidad = document.getElementById('densidad');
    const inputVolumen = document.getElementById('volumenInput'); 

    // REFERENCIAS DE SALIDA
    const elTotalCreacion = document.getElementById('total-creacion');
    const elCosteUnitario = document.getElementById('coste-unitario');
    const elPrecioPagina = document.getElementById('precio-pagina-aplicado');
    const elPrecioHora = document.getElementById('precio-hora-resultante');
    const elVolumenTotal = document.getElementById('volumen-total-horas');
    
    const elPrecioRefresh = document.getElementById('precio-refresh');
    const elFinancePlazo = document.getElementById('finance-plazo');
    const elFinanceDto = document.getElementById('finance-dto');
    
    const tierBadge = document.getElementById('tier-badge');
    const tierName = tierBadge.querySelector('.tier-name');
    const tierDesc = tierBadge.querySelector('.tier-desc');
    
    const upsellBox = document.getElementById('upsell-alert');
    const upsellCursos = document.getElementById('upsell-cursos');
    
    const btnCopy = document.getElementById('btn-copy-hubspot');

    // --- 1. GESTIÓN DEL CAMBIO DE MODO ---
    function cambiarModo(nuevoModo) {
        modoActual = nuevoModo;
        const densidad = parseFloat(inputDensidad.value);
        let valorActual = parseFloat(inputVolumen.value) || 0;

        if (nuevoModo === 'horas') {
            inputVolumen.value = (valorActual / densidad).toFixed(1);
            btnHoras.classList.add('active');
            btnPaginas.classList.remove('active');
            labelVolumen.textContent = "Horas por Curso";
        } else {
            inputVolumen.value = (valorActual * densidad).toFixed(0);
            btnPaginas.classList.add('active');
            btnHoras.classList.remove('active');
            labelVolumen.textContent = "Páginas por Curso";
        }
        recalcular();
    }

    btnHoras.addEventListener('click', () => cambiarModo('horas'));
    btnPaginas.addEventListener('click', () => cambiarModo('paginas'));

    // --- 2. MOTOR DE CÁLCULO ---
    function recalcular() {
        const cursos = parseFloat(inputCursos.value) || 0;
        const densidad = parseFloat(inputDensidad.value);
        const valorVolumen = parseFloat(inputVolumen.value) || 0;

        let horasPorCurso = 0;
        let paginasPorCurso = 0;

        // Normalización
        if (modoActual === 'horas') {
            horasPorCurso = valorVolumen;
            paginasPorCurso = horasPorCurso * densidad;
            helperVolumen.textContent = `Equivale a ${new Intl.NumberFormat('es-ES').format(paginasPorCurso)} págs/curso`;
        } else {
            paginasPorCurso = valorVolumen;
            horasPorCurso = paginasPorCurso / densidad;
            helperVolumen.textContent = `Equivale a ${horasPorCurso.toFixed(1)} horas/curso`;
        }

        const totalHorasProyecto = horasPorCurso * cursos;
        const totalPaginasProyecto = paginasPorCurso * cursos;

        // --- LÓGICA DE TIERS ---
        let tier = 1;
        let precioPorPagina = 6.00;
        let mesesFinanciacion = 6;
        let descuentoProntoPago = 5;
        let costeRefreshPagina = 1.20; 

        if (totalHorasProyecto > 5000) {
            tier = 3;
            precioPorPagina = 5.00;
            mesesFinanciacion = 12;
            descuentoProntoPago = 8.5;
            costeRefreshPagina = 1.00;
        } else if (totalHorasProyecto >= 500) {
            tier = 2;
            precioPorPagina = 5.50;
            mesesFinanciacion = 12;
            descuentoProntoPago = 8.5;
            costeRefreshPagina = 1.10;
        }

        // --- CÁLCULOS FINALES ---
        const inversionTotal = totalPaginasProyecto * precioPorPagina;
        const costeUnitario = (cursos > 0) ? (inversionTotal / cursos) : 0;
        const precioHoraResultante = precioPorPagina * densidad;
        const costeTotalRefresh = totalPaginasProyecto * costeRefreshPagina;

        // --- ACTUALIZAR UI ---
        const fmt = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
        const fmtNum = (n) => new Intl.NumberFormat('es-ES').format(n);

        elTotalCreacion.textContent = fmt(inversionTotal);
        elCosteUnitario.textContent = fmt(costeUnitario);
        
        elPrecioPagina.textContent = fmt(precioPorPagina);
        elPrecioHora.textContent = fmt(precioHoraResultante);
        elVolumenTotal.textContent = `${fmtNum(totalHorasProyecto.toFixed(0))} Horas`;

        elPrecioRefresh.textContent = fmt(costeTotalRefresh);
        elFinancePlazo.textContent = `${mesesFinanciacion} meses incluidos`;
        elFinanceDto.textContent = `${descuentoProntoPago}%`;

        // Badge Tier
        tierBadge.className = `tier-badge tier-${tier}`;
        if (tier === 1) {
            tierName.textContent = "TIER 1 (TEST)";
            tierDesc.textContent = "< 500 Horas Totales";
        } else if (tier === 2) {
            tierName.textContent = "TIER 2 (GROWTH)";
            tierDesc.textContent = "500 - 5000 Horas";
        } else {
            tierName.textContent = "TIER 3 (ENTERPRISE)";
            tierDesc.textContent = "+ 5000 Horas";
        }

        checkUpsell(tier, totalHorasProyecto, horasPorCurso);
    }

    function checkUpsell(tierActual, horasTotales, horasPorCurso) {
        upsellBox.classList.add('hidden');
        if (horasPorCurso === 0) return;

        if (tierActual === 1 && horasTotales >= 350 && horasTotales < 500) {
            const horasFaltantes = 500 - horasTotales;
            const cursosExtra = Math.ceil(horasFaltantes / horasPorCurso);
            upsellCursos.textContent = `${cursosExtra} curso(s)`;
            upsellBox.innerHTML = `💡 <strong>Consejo Pro:</strong> Estás a solo <strong>${horasFaltantes.toFixed(0)} horas</strong> del Tier 2. Si añades <strong>${cursosExtra} curso(s) más</strong>, el precio baja a 5,50€/pág y obtienes 12 meses de financiación.`;
            upsellBox.classList.remove('hidden');
        }
    }

    // --- 3. LÓGICA DE COPIADO PARA HUBSPOT ---
    btnCopy.addEventListener('click', () => {
        const cursos = inputCursos.value;
        const densidad = inputDensidad.value;
        const tierTxt = tierName.textContent;
        const volTxt = elVolumenTotal.textContent;
        const precioP = elPrecioPagina.textContent;
        const precioH = elPrecioHora.textContent;
        const refreshP = elPrecioRefresh.textContent;
        const finPlazo = elFinancePlazo.textContent;
        const finDto = elFinanceDto.textContent;

        const textoParaHubspot = `
📊 **RESUMEN DE CONFIGURACIÓN TÉCNICA**
----------------------------------------
• Cantidad de Cursos: ${cursos}
• Densidad: ${densidad} págs/hora
• Volumen Total Proyecto: ${volTxt}
• Nivel Aplicado: ${tierTxt}

💰 **CONDICIONES ECONÓMICAS APLICADAS**
----------------------------------------
• Precio Base: ${precioP} / página
• Precio Equivalente: ${precioH} / hora formativa

🎁 **BONUS Y CONDICIONES ESPECIALES**
----------------------------------------
✅ **Biblioteca Viva (Refresh):**
   - Año 1: 100% BONIFICADO (GRATIS)
   - Año 2+: ${refreshP} / año (estimado)

✅ **Financiación Two.inc:**
   - Plazo Estándar: ${finPlazo} sin intereses.
   - Opción Pronto Pago: ${finDto} de descuento (30/60/90 días).
`.trim();

        navigator.clipboard.writeText(textoParaHubspot).then(() => {
            const textoOriginal = btnCopy.textContent;
            btnCopy.textContent = "✅ ¡Copiado al portapapeles!";
            btnCopy.style.backgroundColor = "#4CAF50"; // Verde éxito
            
            setTimeout(() => {
                btnCopy.textContent = textoOriginal;
                btnCopy.style.backgroundColor = ""; // Volver al naranja
            }, 3000);
        }).catch(err => {
            alert("No se pudo copiar el texto. Permisos denegados.");
        });
    });

    // Eventos
    inputCursos.addEventListener('input', recalcular);
    inputDensidad.addEventListener('change', recalcular);
    inputVolumen.addEventListener('input', recalcular);

    recalcular();
});
