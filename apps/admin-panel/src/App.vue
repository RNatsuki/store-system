<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { Button } from '@store-system/ui-components';
const handleClick = () => {
  console.log('Button clicked!');
};
</script>

<template>
  <div>
    <Button class="main-btn" variant="primary" size="lg" @click="handleClick">
      Click Me
    </Button>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style lang="scss" scoped>
  @use '@store-system/ui-theme' as *;
  .main-btn {
    background-color: $primary-color;
    color: white;
  }

</style>
