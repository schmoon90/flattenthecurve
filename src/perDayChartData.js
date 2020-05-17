import {  find as _find,
          filter as _filter,
          reduce as _reduce,
          zipWith as _zipWith,
          uniq as _uniq,          
          orderBy as _orderBy } from 'lodash';


let generatedDataSets = {};
let countries = [];

const getChartOptions = (ts_type) => {
  let color = '#ffffff';
  if (ts_type === 'confirmed') {
    color = '#d7191c'
  } else if (ts_type === 'recovered') {
    color = '#fdae61'
  } else if (ts_type === 'deaths') {
    color = '#abdda4'
  } else if (ts_type === 'active') {
    color = '#2b83ba'
  }
  return {
    backgroundColor: color,
    borderColor: color,
    fill: false,
    borderWidth: 1,
    lineTension: 0.0,
  };
};

const toInt = (str) => {
  const i = parseInt(str);
  if (isNaN(i)) {
    console.log(`Couldn't parse integer value of ${str}`);
    return 0;
  } else {
    return i;
  }
};

const parseDataByCountry = (raw_data_array, country) => {
  let all_dates = raw_data_array[0].slice(4);
  let v2 = _filter(raw_data_array, (ts_element) => ts_element[1] === country);
  let values = _reduce(v2, (result, region_array) => {
    region_array = region_array.slice(4);
    if (result.length == 0) {
      return region_array;
    }
    result.forEach((element, i) => {
      result[i] = toInt(element) + toInt(region_array[i]);
    });
    return result;
  }, []); 

  if (countries.length === 0) {
    let countries_last_value_map = {};
    raw_data_array.forEach(row => {
      if (countries_last_value_map.hasOwnProperty(row[1])) {       
        countries_last_value_map[row[1]] = {
          Country: row[1],
          Cases: toInt(row[row.length - 1]) + countries_last_value_map[row[1]].Cases,
        };
      } else {
        countries_last_value_map[row[1]] = {
          Country: row[1],
          Cases: toInt(row[row.length - 1]),
        };
      }
    });

    countries = _orderBy(Object.values(countries_last_value_map), ['Cases'], ['desc']);
  }
  return _zipWith(all_dates, values, (t, y) => { return { t, y }});
};

export const getCountries = () => {
  return countries;
};

export const addDataSet = (raw_data_array, country, ts_type) => {
  generatedDataSets[ts_type] = {
    label: ts_type,
    data: parseDataByCountry(raw_data_array, country),
    ...getChartOptions(ts_type),
  };

  if ('confirmed' in generatedDataSets && 'deaths' in generatedDataSets && 'recovered' in generatedDataSets) {
    const activeType = 'active';
    const activeData = _zipWith(
      generatedDataSets.confirmed.data.map(d => d.t),
      generatedDataSets.confirmed.data.map(d => d.y),
      generatedDataSets.deaths.data.map(d => d.y),
      generatedDataSets.recovered.data.map(d => d.y),
      (t, confirmed, deaths, recovered) => {
        return {
          t,
          y: confirmed - deaths - recovered,
        };
      }
    );
    generatedDataSets[activeType] = {
      label: activeType,
      data: activeData,
      ...getChartOptions(activeType),
    };
  } 
};

export const getTSData = () => {    
    return {
      datasets: Object.values(generatedDataSets),
    };
};

export const perDayChartOptions = {
    scales: {
      xAxes: [{
          type: 'time',
          offset: true,
          time: {
              unit: 'day',
              displayFormats: {
                  day: 'DD.MM',
              },
          },
          ticks: {
              source: 'data',
          },
      }]
    },
  }