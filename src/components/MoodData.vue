<template>
  <div class="hello">
    <h1>Display Mood Data</h1>
    <p>
      This section shows my mood data from telegram bot interactions.
    </p>
    <table style="width:100%">
    <tr>
        <th>Date/Time</th>
        <th>Mood</th> 
        <th>Reason</th>
    </tr>
    <tr v-for="mood in data" :key="mood.timestamp">
        <td>{{ mood.timestamp }}</td>
        <td>{{ mood.mood }}</td>
        <td>{{ mood.reason }}</td>
    </tr>
    </table>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import ApiService from '@/services/ApiService';

interface Mood {
    timestamp: string;
    mood: string;
    reason: string;
}

@Component
export default class MoodData extends Vue {

    private data: Mood[] = [];

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