<template>
  <div class="home">
    <MoodData/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MoodData from '@/components/MoodData.vue'; // @ is an alias to /src

@Component({
  components: {
    MoodData,
  },
})
export default class Home extends Vue {}
</script>
