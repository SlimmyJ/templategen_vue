import type { AddressInfo, AppLanguage } from "./sharedModels";

export type ReportStatus = "draft" | "submitted" | "completed";

export type CustomerType = "existing" | "new";

export type SubscriptionType =
    | "manage-international"
    | "protect-start-stop"
    | "protect"
    | "reactivation";

export type TechnicianWorkType =
    | "new-installation"
    | "build-in"
    | "rebuild"
    | "swap-hardware"
    | "adjust-existing-unit";

export type AccessoryType =
    | "start-interruption"
    | "mifare"
    | "proximity"
    | "dallas"
    | "drexia"
    | "promag"
    | "temperature-probe"
    | "private-button"
    | "automatic-driver-input";

export type BleDeviceType =
    | "ble-temp"
    | "ble-coin"
    | "ble-puck"
    | "ble-id";

export type ReportIdentity = {
    id: string;
    status: ReportStatus;
    createdAt: string;
    updatedAt: string;
};

export type TechnicianCustomerInfo = AddressInfo & {
    customerType: CustomerType;
    language: AppLanguage;
    name: string;
    vatNumber: string;
};

export type BillingInfo = {
    invoiceDate: string;
};

export type SubscriptionSelection = {
    selectedTypes: SubscriptionType[];
};

export type TechnicianVehicleInfo = {
    brand: string;
    series: string;
    licensePlate: string;
    mileage: string;
    operatingHours: string;
    chassisNumber: string;
};

export type InstalledUnitInfo = {
    geofleetId: string;
    unitType: string;
    imei: string;
};

export type TachoInfo = {
    tachoType: string;
    tachoVersion: string;
    tachoSerialNumber: string;
};

export type AccessorySelection = {
    selectedTypes: AccessoryType[];
};

export type BleSelection = {
    selectedTypes: BleDeviceType[];
};

export type WorkPerformedInfo = {
    workType: TechnicianWorkType;
    notes: string;
    unitLocationInVehicle: string;
};

export type TechnicianPhotoAttachment = {
    id: string;
    fileName: string;
    caption: string;
    localPreviewUrl: string;
    serverUrl: string;
};

export type TechnicianReport = {
    identity: ReportIdentity;
    customer: TechnicianCustomerInfo;
    billing: BillingInfo;
    subscription: SubscriptionSelection;
    vehicle: TechnicianVehicleInfo;
    installedUnit: InstalledUnitInfo;
    tacho: TachoInfo;
    accessories: AccessorySelection;
    ble: BleSelection;
    workPerformed: WorkPerformedInfo;
    photos: TechnicianPhotoAttachment[];
    remarks: string;
};

export function createDefaultReportIdentity(): ReportIdentity {
    const now = new Date().toISOString();

    return {
        id: "",
        status: "draft",
        createdAt: now,
        updatedAt: now
    };
}

export function createDefaultTechnicianCustomerInfo(): TechnicianCustomerInfo {
    return {
        customerType: "existing",
        language: "nl",
        name: "",
        street: "",
        postalCity: "",
        vatNumber: ""
    };
}

export function createDefaultBillingInfo(): BillingInfo {
    return {
        invoiceDate: ""
    };
}

export function createDefaultSubscriptionSelection(): SubscriptionSelection {
    return {
        selectedTypes: []
    };
}

export function createDefaultTechnicianVehicleInfo(): TechnicianVehicleInfo {
    return {
        brand: "",
        series: "",
        licensePlate: "",
        mileage: "",
        operatingHours: "",
        chassisNumber: ""
    };
}

export function createDefaultInstalledUnitInfo(): InstalledUnitInfo {
    return {
        geofleetId: "",
        unitType: "",
        imei: ""
    };
}

export function createDefaultTachoInfo(): TachoInfo {
    return {
        tachoType: "",
        tachoVersion: "",
        tachoSerialNumber: ""
    };
}

export function createDefaultAccessorySelection(): AccessorySelection {
    return {
        selectedTypes: []
    };
}

export function createDefaultBleSelection(): BleSelection {
    return {
        selectedTypes: []
    };
}

export function createDefaultWorkPerformedInfo(): WorkPerformedInfo {
    return {
        workType: "new-installation",
        notes: "",
        unitLocationInVehicle: ""
    };
}

export function createDefaultTechnicianReport(): TechnicianReport {
    return {
        identity: createDefaultReportIdentity(),
        customer: createDefaultTechnicianCustomerInfo(),
        billing: createDefaultBillingInfo(),
        subscription: createDefaultSubscriptionSelection(),
        vehicle: createDefaultTechnicianVehicleInfo(),
        installedUnit: createDefaultInstalledUnitInfo(),
        tacho: createDefaultTachoInfo(),
        accessories: createDefaultAccessorySelection(),
        ble: createDefaultBleSelection(),
        workPerformed: createDefaultWorkPerformedInfo(),
        photos: [],
        remarks: ""
    };
}