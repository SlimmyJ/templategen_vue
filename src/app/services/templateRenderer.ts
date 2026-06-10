import type { InstallationRequest, InstallerInfo } from "../models/installationModels";
import type { InspectionRequest, InspectionItem } from "../models/inspectionModels";

export type TemplateResult = {
  subject: string;
  htmlBody: string;
};

export interface ITemplateRenderer {
  renderInstallerEmail(request: InstallationRequest): TemplateResult;
  renderCustomerEmail(request: InstallationRequest, installer: InstallerInfo): TemplateResult;
  renderCalendarSnippet(request: InstallationRequest): TemplateResult;
  renderInspectionInstallerEmail(request: InspectionRequest, installer: InstallerInfo): TemplateResult;
}

type Tr = ReturnType<TemplateRenderer["t"]>;
type Ti = ReturnType<TemplateRenderer["tInspection"]>;

export class TemplateRenderer implements ITemplateRenderer {

  // ── Public entry points ────────────────────────────────────────────────────

  public renderInstallerEmail(request: InstallationRequest): TemplateResult {
    return {
      subject: this.buildInstallerSubject(request),
      htmlBody: this.buildInstallerHtml(request)
    };
  }

  public renderCustomerEmail(request: InstallationRequest, installer: InstallerInfo): TemplateResult {
    return {
      subject: this.buildCustomerSubject(request),
      htmlBody: this.buildCustomerHtml(request, installer)
    };
  }

  public renderCalendarSnippet(request: InstallationRequest): TemplateResult {
    return {
      subject: "",
      htmlBody: this.buildInstallerCalendarHtml(request)
    };
  }

  public renderInspectionInstallerEmail(request: InspectionRequest, _installer: InstallerInfo): TemplateResult {
    return {
      subject: this.buildInspectionSubject(request),
      htmlBody: this.buildInspectionHtml(request)
    };
  }

  // ── Subject builders ───────────────────────────────────────────────────────

  private buildInstallerSubject(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const details = this.subjectSafe(r.installation.detailsText);
    const city = this.subjectSafe(r.location.postalCity);
    const left = details.length > 0 ? details : tr.subjectInstallFallback;
    return `${tr.subjectInstallPrefix} - ${left}${city.length > 0 ? " - " + city : ""}`;
  }

  private buildCustomerSubject(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const desc = this.subjectSafe(r.customerEmail.salesOrderDescription);
    return `${tr.subjectPlanningPrefix} ${desc.length > 0 ? desc : tr.subjectInstallFallback.toLowerCase()}`.trim();
  }

  private buildInspectionSubject(r: InspectionRequest): string {
    const ti = this.tInspection(r.language);
    const tr = this.t(r.language);
    const firstIdcode = (r.items[0]?.idcode ?? "").trim();
    const city = this.subjectSafe(r.location.postalCity);
    let subject = ti.subjectPrefix;
    if (firstIdcode.length > 0) subject += ` - IDCODE ${firstIdcode}`;
    if (city.length > 0) subject += ` - ${city}`;
    void tr; // tr available if needed for future use
    return subject;
  }

  // ── Installation email ─────────────────────────────────────────────────────

  private buildInstallerHtml(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const color = this.getBrandColor(r);
    const html: string[] = [];

    html.push(this.wrapperStart());

    html.push(`<div>${this.e(this.buildGreeting(r.intro, tr), true)}</div>`);
    html.push(`<br>`);

    if (r.intro.requestLine.trim().length > 0) {
      html.push(`<div>${this.e(r.intro.requestLine.trim(), true)}</div>`);
      html.push(`<br>`);
    }

    // ✅ planning note shows on installer mail even when date/time are filled
    html.push(...this.buildPlanningSectionHtml(
      r.planning.plannedDate.trim(),
      r.planning.plannedTime.trim(),
      r.notes.planningNotes.trim(),
      tr.dateInstall,
      tr,
      color
    ));
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.installationDetails, color));
    if (r.installation.detailsText.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;">${this.e(r.installation.detailsText.trim(), true)}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.vehicleDetails, color));
    html.push(this.buildVehicleHtml(r, tr));
    if (r.notes.vehicleNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(r.notes.vehicleNotes.trim(), true)}</div>`);
    }
    html.push(`<br>`);

    const placeTitle = r.notes.installationPlaceLine.trim() || tr.installPlace;
    html.push(...this.buildLocationSectionHtml(r.location, r.notes.installationPlaceNotes.trim(), placeTitle, tr, color));
    html.push(`<br>`);

    html.push(...this.buildContactSectionHtml(r.contact, tr, color));
    html.push(`<br>`);

    html.push(...this.buildEndingHtml(r.ending.confirmLine, r.ending.thanksLine));

    html.push(this.wrapperEnd());
    return html.join("").trim();
  }

  // ── Calendar snippet (installer email without greeting/intro/ending) ───────

  private buildInstallerCalendarHtml(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const color = this.getBrandColor(r);
    const html: string[] = [];

    html.push(this.wrapperStart());

    html.push(...this.buildPlanningSectionHtml(
      r.planning.plannedDate.trim(),
      r.planning.plannedTime.trim(),
      r.notes.planningNotes.trim(),
      tr.dateInstall,
      tr,
      color
    ));
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.installationDetails, color));
    if (r.installation.detailsText.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;">${this.e(r.installation.detailsText.trim(), true)}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.vehicleDetails, color));
    html.push(this.buildVehicleHtml(r, tr));
    if (r.notes.vehicleNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(r.notes.vehicleNotes.trim(), true)}</div>`);
    }
    html.push(`<br>`);

    const placeTitle = r.notes.installationPlaceLine.trim() || tr.installPlace;
    html.push(...this.buildLocationSectionHtml(r.location, r.notes.installationPlaceNotes.trim(), placeTitle, tr, color));
    html.push(`<br>`);

    html.push(...this.buildContactSectionHtml(r.contact, tr, color));

    html.push(this.wrapperEnd());
    return html.join("").trim();
  }

  // ── Customer email ─────────────────────────────────────────────────────────

  private buildCustomerHtml(r: InstallationRequest, installer: InstallerInfo): string {
    const tr = this.t(r.language);
    const color = this.getBrandColor(r);
    const html: string[] = [];

    const prefix = r.customerEmail.intro.salutationPrefix.trim() || tr.best;
    const name = r.customerEmail.intro.salutationName.trim();
    const greeting = name.length > 0 ? `${prefix} ${name},` : `${prefix},`;

    const person = (installer.contactPerson ?? "").trim();
    const company = (installer.companyName ?? "").trim();

    html.push(this.wrapperStart());

    html.push(`<div>${this.e(greeting)}</div>`);
    html.push(`<br>`);

    const who = this.buildInstallerWho(person, company, tr);
    html.push(`<div>${this.e(tr.customerIntroPrefix)} ${who} ${this.e(tr.customerWillContact)}</div>`);
    html.push(`<br>`);

    const hasDate = r.planning.plannedDate.trim().length > 0;
    const hasTime = r.planning.plannedTime.trim().length > 0;
    if (hasDate || hasTime) {
      html.push(this.sectionTitle(tr.dateInstall, color));
      html.push(`<ul style="margin-top: 6px;">`);
      if (hasDate) html.push(`<li><strong>${this.e(tr.date)}:</strong> ${this.e(r.planning.plannedDate.trim())}</li>`);
      if (hasTime) html.push(`<li><strong>${this.e(tr.time)}:</strong> ${this.e(r.planning.plannedTime.trim())}</li>`);
      html.push(`</ul>`);
      html.push(`<br>`);
    }

    html.push(this.sectionTitle(tr.vehicleDetails, color));
    const vehicleHtml = this.buildVehicleHtml(r, tr);
    html.push(vehicleHtml.length > 0 ? vehicleHtml : `<div>${this.e(tr.noVehicles)}</div>`);
    html.push(`<br>`);

    html.push(...this.buildLocationSectionHtml(r.location, "", tr.installPlace, tr, color));
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.contact, color));
    html.push(`<div style="margin-top: 6px;">`);
    if (company.length > 0) html.push(`<div><strong>${this.e(tr.company)}:</strong> ${this.e(company)}</div>`);
    if (person.length > 0) html.push(`<div><strong>${this.e(tr.contactPersonLabel)}:</strong> ${this.e(person)}</div>`);
    const gsm = (installer.gsm ?? "").trim();
    const email = (installer.email ?? "").trim();
    if (gsm.length > 0) html.push(`<div><strong>${this.e(tr.gsm)}:</strong> ${this.e(gsm)}</div>`);
    if (email.length > 0) html.push(`<div><strong>${this.e(tr.email)}:</strong> ${this.e(email)}</div>`);
    html.push(`</div>`);
    html.push(`<br>`);

    html.push(`<div>${this.e(tr.customerQuestions)}</div>`);

    html.push(this.wrapperEnd());
    return html.join("").trim();
  }

  // ── Inspection email ───────────────────────────────────────────────────────

  private buildInspectionHtml(r: InspectionRequest): string {
    const tr = this.t(r.language);
    const ti = this.tInspection(r.language);
    const color = this.getBrandColor(r);
    const html: string[] = [];

    html.push(this.wrapperStart());

    html.push(`<div>${this.e(this.buildGreeting(r.intro, tr), true)}</div>`);
    html.push(`<br>`);

    if (r.intro.requestLine.trim().length > 0) {
      html.push(`<div>${this.e(r.intro.requestLine.trim(), true)}</div>`);
      html.push(`<br>`);
    }

    html.push(...this.buildPlanningSectionHtml(
      r.planning.plannedDate.trim(),
      r.planning.plannedTime.trim(),
      r.notes.planningNotes.trim(),
      ti.when,
      tr,
      color
    ));
    html.push(`<br>`);

    if (r.detailsText.trim().length > 0) {
      html.push(this.sectionTitle(ti.wat, color));
      html.push(`<div style="margin-top: 6px;">${this.e(r.detailsText.trim(), true)}</div>`);
      html.push(`<br>`);
    }

    for (const [index, item] of r.items.entries()) {
      html.push(...this.buildInspectionItemHtml(item, index, ti, color));
    }

    html.push(...this.buildLocationSectionHtml(r.location, r.notes.locationNotes.trim(), ti.nazichtPlace, tr, color));
    html.push(`<br>`);

    html.push(...this.buildContactSectionHtml(r.contact, tr, color));
    html.push(`<br>`);

    html.push(...this.buildEndingHtml(r.ending.confirmLine, r.ending.thanksLine));

    html.push(this.wrapperEnd());
    return html.join("").trim();
  }

  private buildInspectionItemHtml(
    item: InspectionItem,
    index: number,
    ti: Ti,
    color: string
  ): string[] {
    const html: string[] = [];
    const idcode = item.idcode.trim();
    const itemTitle = idcode.length > 0
      ? `${ti.nazicht} — IDCODE ${idcode}`
      : `${ti.nazicht} #${index + 1}`;

    html.push(this.sectionTitle(itemTitle, color));
    html.push(`<div style="margin-top: 6px;">`);

    const problem = item.problemDescription.trim();
    if (problem.length > 0) {
      html.push(`<div><strong>${this.e(ti.problem)}:</strong> ${this.e(problem, true)}</div>`);
    }

    const solution = item.solution.trim();
    if (solution.length > 0) {
      html.push(`<div style="margin-top: 4px;"><strong>${this.e(ti.solution)}:</strong> ${this.e(solution, true)}</div>`);
    }

    const { typeLabel, brand, model, licensePlate } = item.vehicle;
    const hasVehicle = [typeLabel, brand, model, licensePlate].some((v) => v.trim().length > 0);
    if (hasVehicle) {
      html.push(`<div style="margin-top: 8px;">`);
      if (typeLabel.trim().length > 0) html.push(`<div><strong>${this.e(ti.vehicle)}:</strong> ${this.e(typeLabel.trim())}</div>`);
      if (brand.trim().length > 0) html.push(`<div><strong>${this.e(ti.brand)}:</strong> ${this.e(brand.trim())}</div>`);
      if (model.trim().length > 0) html.push(`<div><strong>${this.e(ti.type)}:</strong> ${this.e(model.trim())}</div>`);
      if (licensePlate.trim().length > 0) html.push(`<div><strong>${this.e(ti.plate)}:</strong> ${this.e(licensePlate.trim())}</div>`);
      html.push(`</div>`);
    }

    html.push(`</div>`);
    html.push(`<br>`);
    return html;
  }

  // ── Shared section builders ────────────────────────────────────────────────

  private buildGreeting(
    intro: { salutationPrefix: string; salutationName: string },
    tr: Tr
  ): string {
    const prefix = intro.salutationPrefix.trim() || tr.best;
    const name = intro.salutationName.trim();
    return name.length === 0 ? `${prefix},` : `${prefix} ${name},`;
  }

  private buildPlanningSectionHtml(
    date: string,
    time: string,
    note: string,
    sectionLabel: string,
    tr: Tr,
    color: string
  ): string[] {
    const html: string[] = [];
    html.push(this.sectionTitle(sectionLabel, color));
    html.push(`<ul style="margin-top: 6px;">`);
    html.push(`<li><strong>${this.e(tr.date)}:</strong> ${this.e(date || tr.tbdCustomer)}</li>`);
    html.push(`<li><strong>${this.e(tr.time)}:</strong> ${this.e(time || tr.tbdCustomer)}</li>`);
    html.push(`</ul>`);
    if (note.length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(note, true)}</div>`);
    }
    return html;
  }

  private buildLocationSectionHtml(
    location: { name: string; street: string; postalCity: string },
    note: string,
    sectionLabel: string,
    tr: Tr,
    color: string
  ): string[] {
    const html: string[] = [];
    html.push(this.sectionTitle(sectionLabel, color));
    html.push(`<div style="margin-top: 6px;">`);
    if (location.name.trim().length > 0) {
      html.push(`<div><strong>${this.e(tr.location)}:</strong> ${this.e(location.name)}</div>`);
    }
    html.push(`<div>${this.e(location.street)}</div>`);
    html.push(`<div>${this.e(location.postalCity.trim())}</div>`);
    html.push(`</div>`);
    if (note.length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(note, true)}</div>`);
    }
    return html;
  }

  private buildContactSectionHtml(
    contact: { name: string; tel?: string; gsm?: string; email?: string },
    tr: Tr,
    color: string
  ): string[] {
    const html: string[] = [];
    html.push(this.sectionTitle(tr.contact, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.e(tr.name)}:</strong> ${this.e(contact.name)}</div>`);
    const tel = (contact.tel ?? "").trim();
    const gsm = (contact.gsm ?? "").trim();
    const email = (contact.email ?? "").trim();
    if (tel.length > 0) html.push(`<div><strong>${this.e(tr.tel)}:</strong> ${this.e(tel)}</div>`);
    if (gsm.length > 0) html.push(`<div><strong>${this.e(tr.gsm)}:</strong> ${this.e(gsm)}</div>`);
    if (email.length > 0) html.push(`<div><strong>${this.e(tr.email)}:</strong> ${this.e(email)}</div>`);
    html.push(`</div>`);
    return html;
  }

  private buildEndingHtml(confirmLine: string, thanksLine: string): string[] {
    const html: string[] = [];
    if (confirmLine.trim().length > 0) {
      html.push(`<div><strong>${this.e(confirmLine.trim(), true)}</strong></div>`);
      html.push(`<br>`);
    }
    if (thanksLine.trim().length > 0) {
      html.push(`<div>${this.e(thanksLine.trim(), true)}</div>`);
    }
    return html;
  }

  private buildInstallerWho(person: string, company: string, tr: Tr): string {
    if (person.length > 0 && company.length > 0) {
      return tr.installerWhoFull
        .split("{person}").join(`<strong>${this.e(person)}</strong>`)
        .split("{company}").join(`<strong>${this.e(company)}</strong>`);
    }
    if (company.length > 0) {
      return tr.installerWhoCompanyOnly
        .split("{company}").join(`<strong>${this.e(company)}</strong>`);
    }
    if (person.length > 0) return `<strong>${this.e(person)}</strong>`;
    return this.e(tr.installer);
  }

  // ── Vehicle table ──────────────────────────────────────────────────────────

  private buildVehicleHtml(r: InstallationRequest, tr: Tr): string {
    const pastedHtml = r.vehicleTable.html.trim();
    if (pastedHtml.length > 0) {
      return this.hidePlateColumnIfEmpty(pastedHtml, tr.thPlate);
    }

    if (!r.vehicles || r.vehicles.length === 0) return "";

    const hasAnyPlate = r.vehicles.some((v) => (v.licensePlate ?? "").trim().length > 0);
    const header = hasAnyPlate
      ? [tr.thBrand, tr.thModel, tr.thQty, tr.thPlate]
      : [tr.thBrand, tr.thModel, tr.thQty];

    const rows = r.vehicles.map((v) => {
      const base = [
        (v.brand ?? "").trim(),
        (v.model ?? "").trim(),
        String(v.quantity ?? 1)
      ];
      if (hasAnyPlate) base.push((v.licensePlate ?? "").trim());
      return base;
    });

    return this.rowsToHtmlTable([header, ...rows]);
  }

  private rowsToHtmlTable(rows: string[][]): string {
    if (rows.length === 0) return "";

    const tableStyle = "border-collapse:collapse;width:100%;font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;";
    const cellStyle = "border:1px solid #999;padding:4px;vertical-align:top;";
    const headerStyle = "border:1px solid #999;padding:4px;vertical-align:top;background:#eeeeee;font-weight:bold;";

    let html = `<table style="${tableStyle}">`;
    for (const [index, row] of rows.entries()) {
      html += "<tr>";
      const isHeader = index === 0;
      for (const cell of row) {
        html += isHeader
          ? `<th style="${headerStyle}">${this.e(cell)}</th>`
          : `<td style="${cellStyle}">${this.e(cell)}</td>`;
      }
      html += "</tr>";
    }
    html += "</table>";
    return `<div style="margin-top:6px;">${html}</div>`;
  }

  private hidePlateColumnIfEmpty(htmlTable: string, translatedPlateHeader: string): string {
    const input = htmlTable.trim();
    if (input.length === 0 || typeof DOMParser === "undefined") return input;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/html");
      const table = doc.querySelector("table");
      if (!table) return input;

      const rows = Array.from(table.querySelectorAll("tr"));
      if (rows.length === 0) return input;

      const headerRow = rows[0];
      if (!headerRow) return input;

      const headerCells = Array.from(headerRow.querySelectorAll("th, td"));
      if (headerCells.length === 0) return input;

      const norm = (s: string) => s.trim().toLowerCase();
      const plateHeaders = new Set<string>([
        norm(translatedPlateHeader),
        "kenteken", "nummerplaat", "plaque", "immatriculation", "license plate", "plate"
      ]);

      const plateIndex = headerCells.findIndex((c) => plateHeaders.has(norm(c.textContent ?? "")));
      if (plateIndex < 0) return input;

      const anyNonEmpty = rows.slice(1).some((row) => {
        const cell = Array.from(row.querySelectorAll("th, td"))[plateIndex];
        return (cell?.textContent ?? "").trim().length > 0;
      });

      if (anyNonEmpty) return input;

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll("th, td"));
        cells[plateIndex]?.remove();
      }

      const wrapperDiv = table.parentElement?.tagName.toLowerCase() === "div"
        ? table.parentElement
        : null;

      return wrapperDiv ? wrapperDiv.outerHTML : table.outerHTML;
    } catch {
      return input;
    }
  }

  // ── Shared HTML helpers ────────────────────────────────────────────────────

  private sectionTitle(title: string, color: string): string {
    return `
      <br>
      <div style="
        margin-top: 6px;
        margin-bottom: 10px;
        padding: 8px 10px;
        border-left: 4px solid ${color};
        background: #f7f7f7;
        font-weight: bold;
      ">${this.e(title)}</div>
    `;
  }

  private getBrandColor(r: { brandPrimaryColorHex: string }): string {
    const c = r.brandPrimaryColorHex.trim();
    return c.length > 0 ? c : "#C20E1A";
  }

  private wrapperStart(): string {
    return `<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`;
  }

  private wrapperEnd(): string {
    return `</div>`;
  }

  private subjectSafe(value: string): string {
    return value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  }

  private e(value: string, preserveBreaks = false): string {
    const encoded = this.htmlEncode(value ?? "");
    return preserveBreaks ? encoded.replace(/\r\n|\r|\n/g, "<br>") : encoded;
  }

  private htmlEncode(value: string): string {
    return String(value ?? "")
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split('"').join("&quot;");
  }

  // ── Translations ───────────────────────────────────────────────────────────

  private t(lang: "nl" | "fr") {
    const fr = lang === "fr";

    return {
      best: fr ? "Bonjour" : "Beste",

      company: fr ? "Société" : "Firma",
      contactPersonLabel: fr ? "Contact" : "Contact",
      installer: fr ? "notre installateur" : "onze installateur",

      dateInstall: fr ? "Date d'installation" : "Datum installatie",
      installationDetails: fr ? "Détails d'installation" : "Installatiegegevens",
      vehicleDetails: fr ? "Informations véhicules" : "Voertuiggegevens",
      installPlace: fr ? "Lieu d'installation" : "Installatieplaats",
      contact: fr ? "Personne de contact" : "Contactpersoon",
      notes: fr ? "Remarque" : "Opmerking",
      noVehicles: fr ? "(Aucun véhicule renseigné)" : "(Geen voertuigen opgegeven)",

      date: fr ? "Date" : "Datum",
      time: fr ? "Heure" : "Tijd",
      location: fr ? "Lieu" : "Locatie",
      name: fr ? "Nom" : "Naam",
      tel: fr ? "Tél" : "Tel",
      gsm: "GSM",
      email: "Email",

      thBrand: fr ? "Marque" : "Merk",
      thModel: fr ? "Modèle" : "Model",
      thQty: fr ? "Nombre" : "Aantal",
      thPlate: fr ? "Plaque" : "Kenteken",

      installerWhoFull: fr ? `{person} de la société {company}` : `{person} van de firma {company}`,
      installerWhoCompanyOnly: fr ? `la société {company}` : `de firma {company}`,

      tbdCustomer: fr ? "À convenir avec le client" : "Te bepalen met klant",

      subjectInstallPrefix: fr ? "Installation à planifier" : "Installatie inplannen",
      subjectInstallFallback: fr ? "Installation" : "Installatie",
      subjectPlanningPrefix: fr ? "Planning" : "Planning",

      customerIntroPrefix: fr ? "Comme convenu par téléphone," : "Zoals telefonisch besproken zal",
      customerWillContact: fr
        ? "vous contactera directement afin de fixer un rendez-vous pour l'installations suivantes :"
        : "u rechtstreeks contacteren voor het maken van een afspraak voor de volgende installatie:",
      customerQuestions: fr
        ? "Si vous avez des questions entre-temps, vous pouvez bien entendu nous contacter."
        : "Mocht u in de tussentijd vragen hebben, dan kunt u uiteraard bij ons terecht."
    };
  }

  private tInspection(lang: "nl" | "fr") {
    const fr = lang === "fr";
    return {
      subjectPrefix: fr ? "Révision à planifier" : "Nazicht inplannen",
      when: fr ? "Date d'intervention" : "Wanneer",
      wat: fr ? "Mission" : "Wat",
      nazicht: fr ? "Révision" : "Nazicht",
      problem: fr ? "Description du problème" : "Probleemomschrijving",
      solution: fr ? "Solution" : "Oplossing",
      vehicle: fr ? "Véhicule" : "Voertuig",
      brand: fr ? "Marque" : "Merk",
      type: "Type",
      plate: fr ? "Numéro de plaque" : "Nummerplaat",
      nazichtPlace: fr ? "Lieu d'intervention" : "Nazichtplaats"
    };
  }
}
