import { computed, reactive, ref, watch } from "vue";
import type { InstallationRequest, InstallerInfo } from "../models/installationModels";
import { InstallerStore, type InstallerRecord } from "../services/installerStore";

function slugifyId(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .split(" ")
    .filter(Boolean)
    .join("-")
    .split("&")
    .join("and");
}

const defaultSeed: InstallerRecord[] = [
  { id: "1", companyName: "Car&Truck Protection", contactPerson: "Dhr. Ronny Michiels", email: "ronny@ronny.be", gsm: "0476 45 75 75" },
  { id: "2", companyName: "VDB Install", contactPerson: "Anja Goossens", email: "", gsm: "" },
  { id: "3", companyName: "Desjokken BV", contactPerson: "Joris Van Gijseghem", email: "desjokken@gmail.com", gsm: "+32 473 37 52 95" },
  { id: "4", companyName: "AudioJetcar", contactPerson: "Frederic Battheu", email: "", gsm: "" },
  { id: "5", companyName: "VES", contactPerson: "Thomas Solomé", email: "", gsm: "" },
  { id: "6", companyName: "Bruthi", contactPerson: "Dirk Bruyninx", email: "", gsm: "" },
  { id: "7", companyName: "BR2", contactPerson: "Laurent Brasseur", email: "", gsm: "" },
  { id: "8", companyName: "Car&Co", contactPerson: "Maarten Houben", email: "", gsm: "" },
  { id: "9", companyName: "CJ Tracking", contactPerson: "Cindy Laussaunière", email: "", gsm: "" },
  { id: "10", companyName: "Tracing.LU", contactPerson: "Alexandre Maniora", email: "", gsm: "" },
  { id: "11", companyName: "Rietveld", contactPerson: "Ruud Stigter", email: "", gsm: "" },
  { id: "12", companyName: "Javaco", contactPerson: "Niko Gijs", email: "", gsm: "" }
];

export function useInstallerCatalog(request: InstallationRequest) {
  const installerStore = new InstallerStore();

  installerStore.ensureSeed(defaultSeed);

  const installers = ref<InstallerRecord[]>([]);
  const installerSearch = ref<string>("");
  const installerOpen = ref<boolean>(false);

  function reloadInstallers(): void {
    installers.value = installerStore.getAll().map((x) => ({
      id: x.id,
      companyName: x.companyName ?? "",
      contactPerson: x.contactPerson ?? "",
      email: x.email ?? "",
      gsm: x.gsm ?? ""
    }));
  }

  reloadInstallers();

  const selectedInstaller = computed<InstallerRecord | null>(() => {
    const id = request.installerSelection.selectedId;
    if (!id) return null;
    return installers.value.find((x) => x.id === id) ?? null;
  });

  const installerEdit = reactive<InstallerInfo>({
    companyName: "",
    contactPerson: "",
    email: "",
    gsm: ""
  });

  const emptyInstaller: InstallerInfo = {
    companyName: "",
    contactPerson: "",
    email: "",
    gsm: ""
  };

  const activeInstaller = computed<InstallerInfo>(() => {
    if (request.installerSelection.mode === "new") return request.installerSelection.newInstaller;
    if (selectedInstaller.value) return installerEdit;
    return emptyInstaller;
  });

  watch(
    () => selectedInstaller.value,
    (sel) => {
      if (!sel) {
        installerEdit.companyName = "";
        installerEdit.contactPerson = "";
        installerEdit.email = "";
        installerEdit.gsm = "";
        return;
      }

      installerEdit.companyName = sel.companyName;
      installerEdit.contactPerson = sel.contactPerson;
      installerEdit.email = sel.email;
      installerEdit.gsm = sel.gsm;
    },
    { immediate: true }
  );

  function onInstallerPick(): void {
    const value = installerSearch.value.trim();

    if (value.length === 0) {
      request.installerSelection.mode = "existing";
      request.installerSelection.selectedId = "";
      return;
    }

    if (value.toLowerCase() === "nieuwe installateur") {
      request.installerSelection.mode = "new";
      request.installerSelection.selectedId = "";
      return;
    }

    const normalized = value.toLowerCase();

    let match = installers.value.find((x) => x.companyName.trim().toLowerCase() === normalized) ?? null;

    if (!match) {
      match = installers.value.find((x) => x.companyName.trim().toLowerCase().startsWith(normalized)) ?? null;
    }

    if (!match) {
      match = installers.value.find((x) => x.companyName.trim().toLowerCase().includes(normalized)) ?? null;
    }

    if (match) {
      request.installerSelection.mode = "existing";
      request.installerSelection.selectedId = match.id;
      installerSearch.value = match.companyName;
      return;
    }

    request.installerSelection.mode = "new";
    request.installerSelection.selectedId = "";
    request.installerSelection.newInstaller.companyName = value;
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
    installerOpen.value = false;
  }

  function saveNewInstaller(): void {
    const n = request.installerSelection.newInstaller;
    const companyName = n.companyName.trim();
    if (companyName.length === 0) return;

    const record: InstallerRecord = {
      id: slugifyId(companyName),
      companyName,
      contactPerson: n.contactPerson.trim(),
      email: n.email.trim(),
      gsm: n.gsm.trim()
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

    const name = sel.companyName.trim().length > 0 ? sel.companyName.trim() : "deze installateur";
    const ok = window.confirm(`Bent u zeker dat u ${name} wil verwijderen?`);
    if (!ok) return;

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
    onInstallerPick,
    pickExistingInstaller,
    pickNewInstaller,
    saveNewInstaller,
    saveSelectedInstallerEdits,
    deleteSelectedInstaller
  };
}