<svelte:head>
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/series-label.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
</svelte:head>
<script>
    //@ts-nocheck
    import { onMount } from 'svelte';
    import { dev } from "$app/environment";

    let data = [];
    let result ="";
    
    let API = "/api/v2/workingplaces-stats";
    if (dev) API = "http://localhost:12345" + API;

    onMount(async () => {
        await getData();
    });
    async function getData(){
        const res = await fetch(API, {
            method: "GET",
        });
        try{
            const dataReceived = await res.json();
            result = JSON.stringify(dataReceived, null, 2);
            data = dataReceived;

            const provinces = [... new Set(data.map(item => item.province))];
            const years = [... new Set(data.map(item => item.year))];

            const seriesData = provinces.map(province => {
                const provinceData = data.filter(item => item.province === province);
                return {
                    name: province,
                    data: years.map(year => {
                        const yearData = provinceData.find(item => item.year === year);
                        return yearData ? parseFloat(yearData.work_place) : null;
                    })
                };
            });
            console.log(seriesData);
            loadChartData(years, seriesData);
        }catch(error){
            console.log(error);
        } 
     
    }
    async function loadChartData(years, seriesData) {
        Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Puestos De Trabajo Totales de Mercado de las provincias de Andalucía desde 2008 hasta 2019'
            },
            xAxis: {
                categories: years
            },
            yAxis: {
                title: {
                text: 'Puestos'
                }
            },
            tooltip: {
                formatter: function () {
                const point = this.point;
                const year = this.x;
                const provinceData = data.find(item => item.province === point.series.name && item.year === year);
                const PercentageStructure = provinceData ? provinceData.percentage_structure.toFixed(2) + '%' : '-';
                const VariationRate = provinceData ? provinceData.variation_rating.toFixed(2) + '%' : '-';
                return `<b>${point.series.name}</b><br>` +
                        `Year: ${year}<br>` +
                        `Puestos de Trabajo: ${point.y.toLocaleString()}€<br>` +
                        `Porcentaje de estructuras: ${PercentageStructure}<br>` +
                        `Ratio de variaciones: ${VariationRate}`;
                }
            },
            series: seriesData
        });
    }
   
    
</script>   
<main>
    <figure class="highcharts-figure">
        <div id="container"></div>
    </figure>
</main>