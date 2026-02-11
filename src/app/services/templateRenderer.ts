import type { InstallationRequest, InstallerInfo } from "../models/installationModels";

export type TemplateResult = {
  subject: string;
  htmlBody: string;
};

export interface ITemplateRenderer {
  renderInstallerEmail(request: InstallationRequest): TemplateResult;
  renderCustomerEmail(request: InstallationRequest, installer: InstallerInfo): TemplateResult;
  renderCalendarSnippet(request: InstallationRequest): TemplateResult;

}

type Tr = ReturnType<TemplateRenderer["t"]>;

export class TemplateRenderer implements ITemplateRenderer {
  public renderInstallerEmail(request: InstallationRequest): TemplateResult {
    return {
      subject: this.buildInstallerSubject(request),
      htmlBody: this.buildInstallerHtml(request),
    };
  }

  public renderCustomerEmail(request: InstallationRequest, installer: InstallerInfo): TemplateResult {
    return {
      subject: this.buildCustomerSubject(request),
      htmlBody: this.buildCustomerHtml(request, installer),
    };
  }

  public renderCalendarSnippet(request: InstallationRequest): TemplateResult {
  return {
    subject: "",
    htmlBody: this.buildInstallerCalendarHtml(request),
  };
}




private subjectSafe(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

private buildInstallerSubject(r: InstallationRequest): string {
  const details = this.subjectSafe(r.installation.detailsText);
  const city = this.subjectSafe(r.location.postalCity);

  const left = details.length > 0 ? details : "Installatie";
  const right = city.length > 0 ? city : "";

  return `Installatie inplannen - ${left}${right.length > 0 ? " - " + right : ""}`.trim();
}

private buildCustomerSubject(r: InstallationRequest): string {
  const desc = this.subjectSafe(r.customerEmail.salesOrderDescription);
  const value = desc.length > 0 ? desc : "installatie";
  return `Planning ${value}`.trim();
}

  private buildInstallerHtml(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const color = this.getBrandColor(r);
    const html: string[] = [];

    const introLine = r.intro.requestLine.trim();
    const planningNote = r.notes.planningNotes.trim();
    const vehicleNote = r.notes.vehicleNotes.trim();
    const placeTitle = r.notes.installationPlaceLine.trim().length > 0 ? r.notes.installationPlaceLine.trim() : tr.installPlace;
    const placeNote = r.notes.installationPlaceNotes.trim();
    const confirmLine = r.ending.confirmLine.trim();
    const thanksLine = r.ending.thanksLine.trim();

    html.push(this.wrapperStart());

    html.push(`<div>${this.e(this.buildInstallerGreeting(r), true)}</div>`);
    html.push(`<br>`);
    if (introLine.length > 0) {
      html.push(`<div>${this.e(introLine, true)}</div>`);
      html.push(`<br>`);
    }

    html.push(this.sectionTitle(tr.dateInstall, color));
    html.push(`<ul style="margin-top: 6px;">`);
    html.push(`<li><strong>${this.e(tr.date)}:</strong> ${this.e(this.formatDate(r, tr))}</li>`);
    html.push(`<li><strong>${this.e(tr.time)}:</strong> ${this.e(this.formatTime(r, tr))}</li>`);
    html.push(`</ul>`);

    // ✅ planning note should show on installer mail whenever it is filled (even if date/time exists)
    if (planningNote.length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(planningNote, true)}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.installationDetails, color));
    const detailsText = r.installation.detailsText.trim();
    if (detailsText.length > 0) {
      html.push(`<div style="margin-top: 6px;">${this.e(detailsText, true)}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.vehicleDetails, color));
    html.push(this.buildVehicleHtml(r, tr));
    if (vehicleNote.length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(vehicleNote, true)}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(placeTitle, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.e(tr.location)}:</strong> ${this.e(r.location.name)}</div>`);
    html.push(`<div>${this.e(r.location.street)}</div>`);
    html.push(`<div>${this.e(r.location.postalCity.trim())}</div>`);
    html.push(`</div>`);
    if (placeNote.length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(placeNote, true)}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.contact, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.e(tr.name)}:</strong> ${this.e(r.contact.name)}</div>`);

    const tel = r.contact.tel.trim();
    const gsm = r.contact.gsm.trim();
    const email = r.contact.email.trim();

    if (tel.length > 0) html.push(`<div><strong>${this.e(tr.tel)}:</strong> ${this.e(tel)}</div>`);
    if (gsm.length > 0) html.push(`<div><strong>${this.e(tr.gsm)}:</strong> ${this.e(gsm)}</div>`);
    if (email.length > 0) html.push(`<div><strong>${this.e(tr.email)}:</strong> ${this.e(email)}</div>`);

    html.push(`</div>`);
    html.push(`<br>`);

    if (confirmLine.length > 0) {
      html.push(`<div><strong>${this.e(confirmLine, true)}</strong></div>`);
      html.push(`<br>`);
    }
    if (thanksLine.length > 0) {
      html.push(`<div>${this.e(thanksLine, true)}</div>`);
    }

    html.push(this.wrapperEnd());
    return html.join("").trim();
  }

private buildInstallerCalendarHtml(r: InstallationRequest): string {
  const tr = this.t(r.language);
  const color = this.getBrandColor(r);

  const placeTitle =
    r.notes.installationPlaceLine.trim().length > 0
      ? r.notes.installationPlaceLine.trim()
      : tr.installPlace;

  const html: string[] = [];

  const planningNotes = r.notes.planningNotes.trim();
  const detailsText = r.installation.detailsText.trim();
  const vehicleNotes = r.notes.vehicleNotes.trim();
  const placeNotes = r.notes.installationPlaceNotes.trim();

  html.push(this.wrapperStart());

  // DATE/TIME
  html.push(this.sectionTitle(tr.dateInstall, color));
  html.push(`<ul style="margin-top: 6px;">`);
  html.push(`<li><strong>${this.e(tr.date)}:</strong> ${this.e(this.formatDate(r, tr))}</li>`);
  html.push(`<li><strong>${this.e(tr.time)}:</strong> ${this.e(this.formatTime(r, tr))}</li>`);
  html.push(`</ul>`);

  if (planningNotes.length > 0) {
    html.push(
      `<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(planningNotes, true)}</div>`
    );
  }

  html.push(`<br>`);

  // INSTALLATION DETAILS
  html.push(this.sectionTitle(tr.installationDetails, color));
  if (detailsText.length > 0) {
    html.push(`<div style="margin-top: 6px;">${this.e(detailsText, true)}</div>`);
  }
  html.push(`<br>`);

  // VEHICLES
  html.push(this.sectionTitle(tr.vehicleDetails, color));
  html.push(this.buildVehicleHtml(r, tr));

  if (vehicleNotes.length > 0) {
    html.push(
      `<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(vehicleNotes, true)}</div>`
    );
  }
  html.push(`<br>`);

  // LOCATION
  html.push(this.sectionTitle(placeTitle, color));
  html.push(`<div style="margin-top: 6px;">`);
  html.push(`<div><strong>${this.e(tr.location)}:</strong> ${this.e(r.location.name)}</div>`);
  html.push(`<div>${this.e(r.location.street)}</div>`);
  html.push(`<div>${this.e(r.location.postalCity.trim())}</div>`);
  html.push(`</div>`);

  if (placeNotes.length > 0) {
    html.push(
      `<div style="margin-top: 6px;"><strong>${this.e(tr.notes)}:</strong> ${this.e(placeNotes, true)}</div>`
    );
  }

  html.push(`<br>`);

  // CONTACT
  html.push(this.sectionTitle(tr.contact, color));
  html.push(`<div style="margin-top: 6px;">`);
  html.push(`<div><strong>${this.e(tr.name)}:</strong> ${this.e(r.contact.name)}</div>`);

  const tel = r.contact.tel.trim();
  const gsm = r.contact.gsm.trim();
  const email = r.contact.email.trim();

  if (tel.length > 0) html.push(`<div><strong>${this.e(tr.tel)}:</strong> ${this.e(tel)}</div>`);
  if (gsm.length > 0) html.push(`<div><strong>${this.e(tr.gsm)}:</strong> ${this.e(gsm)}</div>`);
  if (email.length > 0) html.push(`<div><strong>${this.e(tr.email)}:</strong> ${this.e(email)}</div>`);

  html.push(`</div>`);

  html.push(this.wrapperEnd());
  return html.join("").trim();
}



  private buildCustomerHtml(r: InstallationRequest, installer: InstallerInfo): string {
    const tr = this.t(r.language);
    const color = this.getBrandColor(r);
    const html: string[] = [];

    const prefix = r.customerEmail.intro.salutationPrefix.trim().length > 0 ? r.customerEmail.intro.salutationPrefix.trim() : tr.best;
    const name = r.customerEmail.intro.salutationName.trim();
    const greeting = name.length > 0 ? `${prefix} ${name},` : `${prefix},`;

    const person = (installer.contactPerson ?? "").trim();
    const company = (installer.companyName ?? "").trim();

    html.push(this.wrapperStart());

    html.push(`<div>${this.e(greeting)}</div>`);
    html.push(`<br>`);

    const who = (() => {
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
    })();

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
    html.push(vehicleHtml.length > 0 ? vehicleHtml : `<div>(Geen voertuigen opgegeven)</div>`);
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.installPlace, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.e(tr.location)}:</strong> ${this.e(r.location.name)}</div>`);
    html.push(`<div>${this.e(r.location.street)}</div>`);
    html.push(`<div>${this.e(r.location.postalCity.trim())}</div>`);
    html.push(`</div>`);
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

  private buildInstallerGreeting(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const prefix = r.intro.salutationPrefix.trim().length > 0 ? r.intro.salutationPrefix.trim() : tr.best;
    const name = r.intro.salutationName.trim();
    return name.length === 0 ? `${prefix},` : `${prefix} ${name},`;
  }

  private formatDate(r: InstallationRequest, tr: Tr): string {
    const v = r.planning.plannedDate.trim();
    return v.length === 0 ? tr.tbdCustomer : v;
  }

  private formatTime(r: InstallationRequest, tr: Tr): string {
    const v = r.planning.plannedTime.trim();
    return v.length === 0 ? tr.tbdCustomer : v;
  }

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
        String(v.quantity ?? 1),
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
        if (isHeader) html += `<th style="${headerStyle}">${this.e(cell)}</th>`;
        else html += `<td style="${cellStyle}">${this.e(cell)}</td>`;
      }

      html += "</tr>";
    }

    html += "</table>";
    return `<div style="margin-top:6px;">${html}</div>`;
  }

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

  private hidePlateColumnIfEmpty(htmlTable: string, translatedPlateHeader: string): string {
    const input = htmlTable.trim();
    if (input.length === 0) return input;

    if (typeof DOMParser === "undefined") return input;

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
        "kenteken",
        "nummerplaat",
        "plaque",
        "immatriculation",
        "license plate",
        "plate",
      ]);

      const plateIndex = headerCells.findIndex((c) => plateHeaders.has(norm(c.textContent ?? "")));
      if (plateIndex < 0) return input;

      let anyNonEmpty = false;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const cells = Array.from(row.querySelectorAll("th, td"));
        const cell = cells[plateIndex];
        if (!cell) continue;

        const text = (cell.textContent ?? "").trim();
        if (text.length > 0) {
          anyNonEmpty = true;
          break;
        }
      }

      if (anyNonEmpty) return input;

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll("th, td"));
        const cell = cells[plateIndex];
        if (!cell) continue;

        cell.remove();
      }

      const wrapperDiv =
        table.parentElement && table.parentElement.tagName.toLowerCase() === "div"
          ? table.parentElement
          : null;

      return wrapperDiv ? wrapperDiv.outerHTML : table.outerHTML;
    } catch {
      return input;
    }
  }

  private getBrandColor(r: InstallationRequest): string {
    const c = r.brandPrimaryColorHex.trim();
    return c.length > 0 ? c : "#C20E1A";
  }

  private wrapperStart(): string {
    return `<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`;
  }

  private wrapperEnd(): string {
    return `</div>`;
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
      .split("\"").join("&quot;");
  }

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

      date: fr ? "Date" : "Datum",
      time: fr ? "Heure" : "Tijd",
      location: fr ? "Lieu" : "Locatie",
      name: fr ? "Nom" : "Naam",
      tel: fr ? "Tél" : "Tel",
      gsm: fr ? "GSM" : "GSM",
      email: fr ? "Email" : "Email",

      thBrand: fr ? "Marque" : "Merk",
      thModel: fr ? "Modèle" : "Model",
      thQty: fr ? "Nombre" : "Aantal",
      thPlate: fr ? "Plaque" : "Kenteken",

      installerWhoFull: fr ? `{person} de la société {company}` : `{person} van de firma {company}`,
      installerWhoCompanyOnly: fr ? `la société {company}` : `de firma {company}`,

      tbdCustomer: fr ? "À convenir avec le client" : "Te bepalen met klant",

      customerIntroPrefix: fr ? "Comme convenu par téléphone," : "Zoals telefonisch besproken",
      customerWillContact: fr
        ? "vous contactera directement afin de fixer un rendez-vous pour l'installations suivantes :"
        : "u rechtstreeks contacteren voor het maken van een afspraak voor de volgende installatie:",
      customerAddressLine: fr ? "À l'adresse ci-dessous :" : "Dit op onderstaand adres:",
      customerQuestions: fr
        ? "Si vous avez des questions entre-temps, vous pouvez bien entendu nous contacter."
        : "Mocht u in de tussentijd vragen hebben, dan kunt u uiteraard bij ons terecht.",

      installerDefaultIntro: fr
        ? "Veuillez contacter le client ci-dessous et planifier la mission suivante."
        : "Gelieve de onderstaande klant te contacteren en de volgende opdracht in te plannen.",
      installerConfirm: fr
        ? "Veuillez confirmer la date du rendez-vous à la planning et au client."
        : "Gelieve de datum van gemaakte afspraak te bevestigen naar planning en klant.",
      installerThanks: fr
        ? "Merci d'avance pour le bon traitement de cette demande."
        : "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht.",
    };
  }
}
