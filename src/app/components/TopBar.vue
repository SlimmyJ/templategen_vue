<script setup lang="ts">
export type TopBarItem = {
  key: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
};

type Props = {
  brandText?: string;
  leftItems?: TopBarItem[];
  rightItems?: TopBarItem[];
};

const props = withDefaults(defineProps<Props>(), {
  brandText: "TemplateGen",
  leftItems: () => [],
  rightItems: () => []
});

const emit = defineEmits<{
  (e: "clickItem", key: string): void;
}>();

function onClick(item: TopBarItem): void {
  if (item.disabled) return;
  emit("clickItem", item.key);
}
</script>

<template>
  <div class="topbar">
    <div class="topbar-inner">
      <div class="brand" @click="emit('clickItem', 'brand')">
        {{ props.brandText }}
      </div>

      <ul class="nav">
        <li
          v-for="item in props.leftItems"
          :key="item.key"
          :class="{ active: !!item.active, disabled: !!item.disabled }"
        >
          <a href="#" @click.prevent="onClick(item)">{{ item.label }}</a>
        </li>
      </ul>

      <div class="spacer"></div>

      <ul class="nav right">
        <li
          v-for="item in props.rightItems"
          :key="item.key"
          :class="{ active: !!item.active, disabled: !!item.disabled }"
        >
          <a href="#" @click.prevent="onClick(item)">{{ item.label }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
