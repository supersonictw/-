<template>
  <div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    title: String,
    description: String,
  },
};
</script>

<style scoped>

</style>
