import type { Component } from "vue";

import InstallationView from "../components/installation/InstallationView.vue";
import InspectionView from "../components/inspection/InspectionView.vue";
import CallLogView from "../components/calllog/CallLogView.vue";
import DesignerView from "../components/designer/DesignerView.vue";

export type FeatureModule = {
  key: string;
  label: string;
  component: Component;

  hidden?: boolean;
};

export const features: FeatureModule[] = [
  { key: "installatie", label: "Installaties", component: InstallationView },
  { key: "inspection",  label: "Nazichten",    component: InspectionView },
  { key: "calllog",     label: "Call log",     component: CallLogView, hidden: true },
  { key: "designer",    label: "Designer",     component: DesignerView }
];

export const visibleFeatures = features.filter((feature) => !feature.hidden);

export const defaultFeatureKey = visibleFeatures[0]!.key;

export function findFeature(key: string): FeatureModule {
  return features.find((feature) => feature.key === key) ?? features[0]!;
}
