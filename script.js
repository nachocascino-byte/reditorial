document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DE ENTRADA (INPUTS) ---
    const inputHoras = document.getElementById('horas');
    const inputRatio = document.getElementById('ratioPaginas'); // NUEVO SELECTOR
    const inputVentasAnuales = document.getElementById('ventasAnuales');
    const inputCosteAlquiler = document.getElementById('costeAlquiler');
    const inputPrecioVenta = document.getElementById('precioVenta');

    // --- ELEMENTOS DE SALIDA (OUTPUTS) ---
    const outPaginasTotales = document.getElementById('output-paginas-totales');
    const outPrecioPagina = document.getElementById('output-precio-pagina');
    const outPrecioHora = document.getElementById('output-precio-hora');

    const resultadoInversion = document.getElementById('resultado-inversion');
    const resultadoPayback = document.getElementById('resultado-payback');
    const resultadoCosteAlquiler = document.getElementById('resultado-coste-alquiler');
    const resultadoCosteCoCreacion = document.getElementById('resultado-coste-cocreacion');
    const resultadoBeneficioAlquiler = document.getElementById('resultado-beneficio-alquiler');
    const resultadoBeneficioCoCreacion = document.getElementById('resultado-beneficio-cocreacion');
    const resultadoAhorro = document.getElementById('resultado-ahorro');
    const resultadoROI = document.getElementById('resultado-roi');
    const conclusion = document.getElementById('conclusion');

    // --- PARÁMETROS FIJOS ---
    const HORIZONTE_AÑOS = 3;

    // --- INICIALIZACIÓN DEL GRÁFICO ---
    const ctx = document.getElementById('miGrafico').getContext('2d');
    let miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Coste Total (3 Años)', 'Beneficio Neto (3 Años)'],
            datasets: [
                {
                    label: 'Modelo Alquiler',
                    data: [0, 0],
                    backgroundColor: 'rgba(211, 47, 47, 0.7)',
                    borderColor: 'rgba(211, 47, 47, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Modelo Co-creación',
                    data: [0, 0],
                    backgroundColor: 'rgba(56, 142, 60, 0.7)',
                    borderColor: 'rgba(56, 142, 60, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
                        }
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });

    function calcular() {
        // 1. Obtener valores de los inputs
        const horas = parseFloat(inputHoras.value) || 0;
        const ratioPaginas = parseFloat(inputRatio.value) || 4; // Default a 4 si falla
        const ventasAnuales = parseFloat(inputVentasAnuales.value) || 0;
        const costeAlquiler = parseFloat(inputCosteAlquiler.value) || 0;
        const precioVenta = parseFloat(inputPrecioVenta.value) || 0;

        // 2. Definir Precio por Página según Tiers (Volumen en Horas)
        // Tier 1: < 500 horas -> 6€
        // Tier 2: 500 - 5000 horas -> 5.5€
        // Tier 3: > 5000 horas -> 5€
        
        let precioPorPagina = 6; // Precio Base (Tier 1)

        if (horas > 5000) {
            precioPorPagina = 5; // Tier 3
        } else if (horas >= 500) {
            precioPorPagina = 5.5; // Tier 2
        } else {
            precioPorPagina = 6; // Tier 1
        }

        // 3. Cálculos de Producción
        const paginasTotales = horas * ratioPaginas;
        const inversionInicial = paginasTotales * precioPorPagina;
        const costoProduccionPorHora = precioPorPagina * ratioPaginas;

        // 4. Cálculos Financieros (Comparativa)
        const paybackMeses = (costeAlquiler > 0 && ventasAnuales > 0) ? (inversionInicial / (costeAlquiler * ventasAnuales) * 12) : 0;
        
        const costeTotalAlquiler3Anos = ventasAnuales * HORIZONTE_AÑOS * costeAlquiler;
        // En modelo Co-creación el coste es solo la inversión inicial (asumiendo mantenimiento 0 o incluido en margen)
        const costeTotalCoCreacion = inversionInicial; 

        const ingresosTotales3Anos = ventasAnuales * HORIZONTE_AÑOS * precioVenta;
        const beneficioNetoAlquiler = ingresosTotales3Anos - costeTotalAlquiler3Anos;
        const beneficioNetoCoCreacion = ingresosTotales3Anos - costeTotalCoCreacion;
        
        const ahorroNeto = costeTotalAlquiler3Anos - costeTotalCoCreacion;
        const roi = (inversionInicial > 0) ? (ahorroNeto / inversionInicial) * 100 : 0;

        // 5. Actualizar la interfaz (DOM)
        const formatCurrency = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

        // Nuevos Outputs Superiores
        outPaginasTotales.textContent = new Intl.NumberFormat('es-ES').format(paginasTotales);
        outPrecioPagina.textContent = formatCurrency(precioPorPagina);
        outPrecioHora.textContent = formatCurrency(costoProduccionPorHora);

        // Tabla de Resultados
        resultadoInversion.textContent = formatCurrency(inversionInicial);
        resultadoPayback.textContent = `${paybackMeses.toFixed(1)} meses`;
        resultadoCosteAlquiler.textContent = formatCurrency(costeTotalAlquiler3Anos);
        resultadoCosteCoCreacion.textContent = formatCurrency(costeTotalCoCreacion);
        resultadoBeneficioAlquiler.textContent = formatCurrency(beneficioNetoAlquiler);
        resultadoBeneficioCoCreacion.textContent = formatCurrency(beneficioNetoCoCreacion);
        resultadoAhorro.textContent = formatCurrency(ahorroNeto);
        resultadoROI.textContent = `${roi.toFixed(0)}%`;
        
        // Conclusión Dinámica
        conclusion.textContent = `Invirtiendo ${formatCurrency(inversionInicial)} (a ${formatCurrency(costoProduccionPorHora)}/hora producida), recuperas la inversión en ${Math.ceil(paybackMeses)} meses y generas un beneficio adicional de ${formatCurrency(ahorroNeto)} en 3 años.`;

        // 6. Actualizar el gráfico
        actualizarGrafico(costeTotalAlquiler3Anos, costeTotalCoCreacion, beneficioNetoAlquiler, beneficioNetoCoCreacion);
    }

    function actualizarGrafico(costeAlquiler, costeCoCreacion, beneficioAlquiler, beneficioCoCreacion) {
        miGrafico.data.datasets[0].data = [costeAlquiler, beneficioAlquiler]; 
        miGrafico.data.datasets[1].data = [costeCoCreacion, beneficioCoCreacion]; 
        miGrafico.update(); 
    }

    // --- EVENTOS ---
    [inputHoras, inputRatio, inputVentasAnuales, inputCosteAlquiler, inputPrecioVenta].forEach(input => {
        input.addEventListener('input', calcular);
    });

    // Calcular al cargar
    calcular();
});
