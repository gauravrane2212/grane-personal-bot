<template>
  <div class="hello">
    <h1>Display Mood Data</h1>
    <p>
      This section shows my mood data from telegram bot interactions.
    </p>
    <line-chart
        :data="chartData"
        xtitle="Times"
        ytitle="Mood Values"
        :colors="['#666']"
        :legend="false"
        :stacked="true"
        :messages="{empty: 'No data'}">
    </line-chart>
    <table
        v-if="data.length > 1"
        style="width:100%">
        <tr>
            <th>Date/Time</th>
            <th>Mood</th>
            <th>Reason</th>
        </tr>
        <tr v-for="mood in data" :key="mood.timestamp">
            <td>{{ mood.timestamp | moment("MMMM Do YYYY, h:mm:ss a") }}</td>
            <td>{{ mood.mood }}</td>
            <td>{{ mood.reason }}</td>
        </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import VueChartkick from 'vue-chartkick';
import Chart from 'chart.js';
import VueMoment from 'vue-moment';
import ApiService from '@/services/ApiService';
import {map as _map} from 'lodash';

Vue.use(VueChartkick, {adapter: Chart});
Vue.use(VueMoment);

interface Mood {
    timestamp: string;
    mood: string;
    reason: string;
    value: number;
}

@Component
export default class MoodData extends Vue {

    private data: Mood[] = [];

    get chartData() {
        const chartData = _map(this.data, (moodObject: Mood) => {
            return [
               moodObject.timestamp, moodObject.value,
            ];
        });
        return chartData;
    }

    private mounted() {
        this.getMoodData();
    }

    private async getMoodData() {
        const response = await ApiService.retrieveMoodData();
        this.data = response.data;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>