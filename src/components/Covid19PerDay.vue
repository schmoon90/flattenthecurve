<template>
  <div class="container">
    <h1>{{ msg }}</h1>
    <div class="input-group mb-3">      
      <select class="custom-select" id="inputGroupSelect01" v-model="selected_country">
        <option disabled value="">Please select a country</option>
        <option v-for="country in countries" v-bind:value="country.Country" :key="country.Country">
          {{ country.Country }} ({{ country.Cases}})
        </option>
      </select>
    </div>
    <CountryChart :country="selected_country" />
  </div>
</template>

<script>
import axios from 'axios';
import { parse as parseCSV } from 'csv-es';
import CountryChart from './CountryChart.vue';
import { addDataSet, getCountries } from '../perDayChartData.js'

export default {
  name: 'Covid19PerDay',
  components: {
    CountryChart,
  },
  methods: {
    async retrieveData(ts_type, country) {

      if (getCountries().length > 0) {
        return new Promise((resolve) => resolve(true));
      }

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
  },
  props: {
    msg: String,
  },
  data: () => {
    return {
      selected_country: '',
      countries: [],
    };
  },
  async mounted() {
    console.log("Getting countries");
    await this.retrieveData('confirmed', 'Germany');
    this.countries = getCountries();
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
