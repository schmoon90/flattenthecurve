<template>
  <div>
    <div class="alert alert-success fade show" role="alert">
      Successfully selected <strong>{{ country }}</strong>
    </div>
    <div class="chart-container">
      <canvas id="cases-chart"></canvas>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';
import axios from 'axios';
import { find as _find, zipWith as _zipWith } from 'lodash';
import { parse as parseCSV } from '@vanillaes/csv';
import { perDayChartOptions, getTSData, addDataSet } from '../perDayChartData.js'

let chartInstance;
export default {
  name: 'CountryChart',
  methods: {
    createChart(chartId, chartOptions, chartData) {
      if (chartInstance) {
        chartInstance.data = chartData;
        chartInstance.options = chartOptions;
        chartInstance.update();
      } else {
        const ctx = document.getElementById(chartId);
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: chartOptions,
        });
      }
    },
    async retrieveData(ts_type, country) {
      let url = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${ts_type}_global.csv`;

      console.log(`Requesting ${url}`);
      let response = await axios.get(url);      
      if (response.data) {
        
        console.log(`parsing git data of ${ts_type} to csv`);
        let raw_data = parseCSV(response.data);
        
        console.log(`parsing csv data of ${ts_type} for chart`)
        return new Promise((resolve) => resolve(addDataSet(raw_data, country, ts_type)));
      }
    },
    async updateChart() {
      await Promise.all(['confirmed', 'recovered', 'deaths'].map(ts_type => this.retrieveData(ts_type, this.country)));
      console.log("[mounted] creating chart");
      this.createChart('cases-chart', perDayChartOptions, getTSData());
      console.log("[mounted] creating chart complete");
    },
  },
  props: {
    country: String,
  },
  data: () => {
    return {
    };
  },
  async mounted() {
    // source: https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_time_series
    if (this.country) {
      console.log(`[mounted] Country chart with this.country = ${this.country}`);
      await this.updateChart();
    } else {
      console.log(`[mounted] no country defined`)
    }
  },
  async updated() {
    if (this.country) {
      console.log(`[updated] Country chart with this.country = ${this.country}`);
      await this.updateChart();
    } else {
      console.log(`[updated] no country defined`)
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
