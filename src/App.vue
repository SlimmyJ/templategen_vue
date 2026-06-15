<script setup lang="ts">
  import { computed, ref } from "vue";

  import TopBar from "./app/components/TopBar.vue";
  import { features, defaultFeatureKey, findFeature } from "./app/shell/featureRegistry";

  const activeKey = ref<string>(defaultFeatureKey);

  const navItems = computed(() =>
    features.map((feature) => ({
      key: feature.key,
      label: feature.label,
      active: feature.key === activeKey.value
    }))
  );

  const activeComponent = computed(() => findFeature(activeKey.value).component);

  function handleTopBarClick(key: string): void {
    if (features.some((feature) => feature.key === key)) {
      activeKey.value = key;
    }
  }
</script>

<template>
  <TopBar
    brandText="Geofleet V2 Planning"
    :leftItems="navItems"
    @clickItem="handleTopBarClick" />

  <div class="container">
    <component :is="activeComponent" />
  </div>
</template>
