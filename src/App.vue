<script setup lang="ts">
  import { computed, ref, watch } from "vue";

  import TopBar from "./app/components/TopBar.vue";
  import ConfirmDialog from "./app/components/common/ConfirmDialog.vue";
  import { visibleFeatures, defaultFeatureKey, findFeature } from "./app/shell/featureRegistry";

  const ACTIVE_KEY_STORAGE = "templategen.activeFeature";

  function loadActiveKey(): string {
    try {
      const saved = localStorage.getItem(ACTIVE_KEY_STORAGE);
      if (saved && visibleFeatures.some((feature) => feature.key === saved)) return saved;
    } catch {  }
    return defaultFeatureKey;
  }

  const activeKey = ref<string>(loadActiveKey());

  watch(activeKey, (key) => {
    try { localStorage.setItem(ACTIVE_KEY_STORAGE, key); } catch {  }
  });

  const navItems = computed(() =>
    visibleFeatures.map((feature) => ({
      key: feature.key,
      label: feature.label,
      active: feature.key === activeKey.value
    }))
  );

  const activeComponent = computed(() => findFeature(activeKey.value).component);

  function handleTopBarClick(key: string): void {
    if (key === "brand") {
      activeKey.value = defaultFeatureKey;
      return;
    }
    if (visibleFeatures.some((feature) => feature.key === key)) {
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

  <ConfirmDialog />
</template>
