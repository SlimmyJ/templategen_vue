import { computed, reactive, ref, watch } from "vue";
import type { InstallerInfo, InstallerSelection } from "../models/installationModels";
import { InstallerStore, type InstallerRecord } from "../services/installerStore";

type InstallerCatalogTarget = {
  installerSelection: InstallerSelection;
};

export type InstallerPickerState = {
  search: string;
  open: boolean;
};

const defaultSeed: InstallerRecord[] = [
  { id: "1",  companyName: "Car&Truck Protection", contactPerson: "Dhr. Ronny Michiels", email: "ronny@ronny.be",        gsm: "0476 45 75 75"    },
  { id: "2",  companyName: "VDB Install",           contactPerson: "Anja Goossens",        email: "",                     gsm: ""                 },
  { id: "3",  companyName: "Desjokken BV",          contactPerson: "Joris Van Gijseghem",  email: "desjokken@gmail.com",  gsm: "+32 473 37 52 95" },
  { id: "4",  companyName: "AudioJetcar",            contactPerson: "Frederic Battheu",     email: "",                     gsm: ""                 },
  { id: "5",  companyName: "VES",                    contactPerson: "Thomas Solomé",        email: "",                     gsm: ""                 },
  { id: "6",  companyName: "Bruthi",                 contactPerson: "Dirk Bruyninx",        email: "",                     gsm: ""                 },
  { id: "7",  companyName: "BR2",                    contactPerson: "Laurent Brasseur",     email: "",                     gsm: ""                 },
  { id: "8",  companyName: "Car&Co",                 contactPerson: "Maarten Houben",       email: "",                     gsm: ""                 },
  { id: "9",  companyName: "CJ Tracking",            contactPerson: "Cindy Laussaunière",   email: "",                     gsm: ""                 },
  { id: "10", companyName: "Tracing.LU",             contactPerson: "Alexandre Maniora",    email: "",                     gsm: ""                 },
  { id: "11", companyName: "Rietveld",               contactPerson: "Ruud Stigter",         email: "",                     gsm: ""                 },
  { id: "12", companyName: "Javaco",                 contactPerson: "Niko Gijs",            email: "",                     gsm: ""                 }
];

// Module-level so every catalog instance (installation + inspection form)
// shares the same store and sees each other's edits immediately.
const installerStore = new InstallerStore();
const installers = ref<InstallerRecord[]>([]);
let initialized = false;

function reloadInstallers(): void {
  installers.value = installerStore.getAll().map((record) => ({
    id: record.id,
    companyName: record.companyName ?? "",
    contactPerson: record.contactPerson ?? "",
    email: record.email ?? "",
    gsm: record.gsm ?? ""
  }));
}

function ensureInitialized(): void {
  if (initialized) return;
  installerStore.ensureSeed(defaultSeed);
  reloadInstallers();
  initialized = true;
}

export function useInstallerCatalog(request: InstallerCatalogTarget) {
  ensureInitialized();

  const installerSearch = ref<string>("");
  const installerOpen = ref<boolean>(false);

  const filteredInstallers = computed<InstallerRecord[]>(() => {
    const search = installerSearch.value.trim().toLowerCase();
    if (search.length === 0) return installers.value;

    return installers.value.filter(({ companyName, contactPerson, email, gsm }) =>
      [companyName, contactPerson, email, gsm].some((field) =>
        field.trim().toLowerCase().includes(search)
      )
    );
  });

  const selectedInstaller = computed<InstallerRecord | null>(() => {
    const id = request.installerSelection.selectedId;
    return id ? (installers.value.find((x) => x.id === id) ?? null) : null;
  });

  const installerEdit = reactive<InstallerInfo>({
    companyName: "",
    contactPerson: "",
    email: "",
    gsm: ""
  });

  const emptyInstaller: InstallerInfo = { companyName: "", contactPerson: "", email: "", gsm: "" };

  const activeInstaller = computed<InstallerInfo>(() => {
    if (request.installerSelection.mode === "new") return request.installerSelection.newInstaller;
    if (selectedInstaller.value) return installerEdit;
    return emptyInstaller;
  });

  watch(
    () => selectedInstaller.value,
    (sel) => {
      installerEdit.companyName = sel?.companyName ?? "";
      installerEdit.contactPerson = sel?.contactPerson ?? "";
      installerEdit.email = sel?.email ?? "";
      installerEdit.gsm = sel?.gsm ?? "";
    },
    { immediate: true }
  );

  function updatePicker(picker: InstallerPickerState): void {
    installerSearch.value = picker.search;
    installerOpen.value = picker.open;
  }

  function updateNewInstaller(value: InstallerInfo): void {
    request.installerSelection.newInstaller = value;
  }

  function updateInstallerEdit(value: InstallerInfo): void {
    Object.assign(installerEdit, value);
  }

  function pickExistingInstaller(id: string): void {
    const ins = installers.value.find((x) => x.id === id);
    if (!ins) return;
    request.installerSelection.mode = "existing";
    request.installerSelection.selectedId = ins.id;
    installerSearch.value = ins.companyName;
    installerOpen.value = false;
  }

  function pickNewInstaller(): void {
    request.installerSelection.mode = "new";
    request.installerSelection.selectedId = "";
    request.installerSelection.newInstaller.companyName = installerSearch.value.trim();
    installerOpen.value = false;
  }

  function saveNewInstaller(): void {
    const draft = request.installerSelection.newInstaller;
    const companyName = draft.companyName.trim();
    if (companyName.length === 0) return;

    const record: InstallerRecord = {
      id: crypto.randomUUID(),
      companyName,
      contactPerson: draft.contactPerson.trim(),
      email: draft.email.trim(),
      gsm: draft.gsm.trim()
    };

    installerStore.upsert(record);
    reloadInstallers();

    request.installerSelection.mode = "existing";
    request.installerSelection.selectedId = record.id;
    installerSearch.value = record.companyName;
  }

  function saveSelectedInstallerEdits(): void {
    const sel = selectedInstaller.value;
    if (!sel) return;

    installerStore.upsert({
      id: sel.id,
      companyName: installerEdit.companyName.trim(),
      contactPerson: installerEdit.contactPerson.trim(),
      email: installerEdit.email.trim(),
      gsm: installerEdit.gsm.trim()
    });

    reloadInstallers();
    installerSearch.value = installerEdit.companyName.trim();
  }

  function deleteSelectedInstaller(): void {
    const sel = selectedInstaller.value;
    if (!sel) return;

    const name = sel.companyName.trim() || "deze installateur";
    if (!window.confirm(`Bent u zeker dat u ${name} wil verwijderen?`)) return;

    installerStore.remove(sel.id);
    reloadInstallers();

    request.installerSelection.mode = "existing";
    request.installerSelection.selectedId = "";
    installerSearch.value = "";
  }

  return {
    installers,
    installerSearch,
    installerOpen,
    installerEdit,
    selectedInstaller,
    activeInstaller,
    filteredInstallers,
    updatePicker,
    updateNewInstaller,
    updateInstallerEdit,
    pickExistingInstaller,
    pickNewInstaller,
    saveNewInstaller,
    saveSelectedInstallerEdits,
    deleteSelectedInstaller
  };
}
