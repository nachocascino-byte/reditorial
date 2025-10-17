document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DE ENTRADA (INPUTS) ---
    const inputHoras = document.getElementById('horas');
    const inputVentasAnuales = document.getElementById('ventasAnuales');
    const inputCosteAlquiler = document.getElementById('costeAlquiler');
    const inputPrecioVenta = document.getElementById('precioVenta');

    // --- ELEMENTOS DE SALIDA (OUTPUTS) ---
    const resultadoInversion = document.getElementById('resultado-inversion');
    const resultadoPayback = document.getElementById('resultado-payback');
    const resultadoCosteAlquiler = document.getElementById('resultado-coste-alquiler');
    const resultadoCosteCoCreacion = document.getElementById('resultado-coste-cocreacion');
    const resultadoBeneficioAlquiler = document.getElementById('resultado-beneficio-alquiler');
    const resultadoBeneficioCoCreacion = document.getElementById('resultado-beneficio-cocreacion');
    const resultadoAhorro = document.getElementById('resultado-ahorro');
    const resultadoROI = document.getElementById('resultado-roi');
    const conclusion = document.getElementById('conclusion');

    // --- PARÁMETROS INTERNOS ---
    const PRECIO_BASE_PAGINA = 3;
    const RELACION_PAGINAS_HORA = 2;
    const RECARGO_EXPERTO = 0.50; // 50%
    const HORIZONTE_AÑOS = 3;
    const PRECIO_EFECTIVO_PAGINA = PRECIO_BASE_PAGINA * (1 + RECARGO_EXPERTO);

    // --- INICIALIZACIÓN DEL GRÁFICO ---
    const ctx = document.getElementById('miGrafico').getContext('2d');
    let miGrafico = new Chart(ctx, {
        type: 'bar', // Tipo de gráfico: barras
        data: {
            labels: ['Coste Total (3 Años)', 'Beneficio Neto (3 Años)'],
            datasets: [
                {
                    label: 'Modelo Alquiler',
                    data: [0, 0], // Datos iniciales
                    backgroundColor: 'rgba(211, 47, 47, 0.7)', // Rojo
                    borderColor: 'rgba(211, 47, 47, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Modelo Co-creación',
                    data: [0, 0], // Datos iniciales
                    backgroundColor: 'rgba(56, 142, 60, 0.7)', // Verde
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
        const ventasAnuales = parseFloat(inputVentasAnuales.value) || 0;
        const costeAlquiler = parseFloat(inputCosteAlquiler.value) || 0;
        const precioVenta = parseFloat(inputPrecioVenta.value) || 0;

        // 2. Cálculos intermedios
        const paginas = horas * RELACION_PAGINAS_HORA;
        
        let descuento = 0;
        if (paginas >= 100000) descuento = 0.30;
        else if (paginas >= 25000) descuento = 0.20;
        else if (paginas >= 10000) descuento = 0.10;
        
        // 3. Cálculos de resultados
        const inversionInicial = paginas * PRECIO_EFECTIVO_PAGINA * (1 - descuento);
        const paybackMeses = (costeAlquiler > 0 && ventasAnuales > 0) ? (inversionInicial / (costeAlquiler * ventasAnuales) * 12) : 0;
        
        const costeTotalAlquiler3Anos = ventasAnuales * HORIZONTE_AÑOS * costeAlquiler;
        const costeTotalCoCreacion = inversionInicial;

        const ingresosTotales3Anos = ventasAnuales * HORIZONTE_AÑOS * precioVenta;
        const beneficioNetoAlquiler = ingresosTotales3Anos - costeTotalAlquiler3Anos;
        const beneficioNetoCoCreacion = ingresosTotales3Anos - costeTotalCoCreacion;
        
        const ahorroNeto = costeTotalAlquiler3Anos - costeTotalCoCreacion;
        const roi = (inversionInicial > 0) ? (ahorroNeto / inversionInicial) * 100 : 0;

        // 4. Actualizar la interfaz (DOM)
        const formatCurrency = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

        resultadoInversion.textContent = formatCurrency(inversionInicial);
        resultadoPayback.textContent = `${paybackMeses.toFixed(0)} meses`;
        resultadoCosteAlquiler.textContent = formatCurrency(costeTotalAlquiler3Anos);
        resultadoCosteCoCreacion.textContent = formatCurrency(costeTotalCoCreacion);
        resultadoBeneficioAlquiler.textContent = formatCurrency(beneficioNetoAlquiler);
        resultadoBeneficioCoCreacion.textContent = formatCurrency(beneficioNetoCoCreacion);
        resultadoAhorro.textContent = formatCurrency(ahorroNeto);
        resultadoROI.textContent = `${roi.toFixed(1)}%`;
        
        conclusion.textContent = `Invirtiendo ${formatCurrency(inversionInicial)} en tu propio curso, recuperas la inversión en ${Math.ceil(paybackMeses)} meses y generas un beneficio adicional de ${formatCurrency(ahorroNeto)} en 3 años.`;

        // 5. Actualizar el gráfico
        actualizarGrafico(costeTotalAlquiler3Anos, costeTotalCoCreacion, beneficioNetoAlquiler, beneficioNetoCoCreacion);
    }

    function actualizarGrafico(costeAlquiler, costeCoCreacion, beneficioAlquiler, beneficioCoCreacion) {
        miGrafico.data.datasets[0].data = [costeAlquiler, beneficioAlquiler]; // Datos del Modelo Alquiler
        miGrafico.data.datasets[1].data = [costeCoCreacion, beneficioCoCreacion]; // Datos del Modelo Co-creación
        miGrafico.update(); // Redibuja el gráfico con los nuevos datos
    }

    // --- EVENTOS ---
    [inputHoras, inputVentasAnuales, inputCosteAlquiler, inputPrecioVenta].forEach(input => {
        input.addEventListener('input', calcular);
    });

    // Calcular al cargar la página por primera vez
    calcular();
});