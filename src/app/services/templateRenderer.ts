import type { InstallationRequest, InstallerInfo } from "../models/installationModels";

export type TemplateResult = {
  subject: string;
  htmlBody: string;
};

export interface ITemplateRenderer {
  renderInstallerEmail(request: InstallationRequest): TemplateResult;
  renderCustomerEmail(request: InstallationRequest, installer: InstallerInfo): TemplateResult;
}

export class TemplateRenderer implements ITemplateRenderer {
  public renderInstallerEmail(request: InstallationRequest): TemplateResult {
    const subject = this.buildInstallerSubject(request);
    const htmlBody = this.buildInstallerHtml(request);
    return { subject, htmlBody };
  }

  

  public renderCustomerEmail(request: InstallationRequest, installer: InstallerInfo): TemplateResult {
    const subject = this.buildCustomerSubject(request);
    const htmlBody = this.buildCustomerHtml(request, installer);
    return { subject, htmlBody };
  }

  private buildInstallerSubject(r: InstallationRequest): string {
    const details = r.installation.detailsText.trim();
    const city = r.location.postalCity.trim();

    const left = details.length > 0 ? details : "Installatie";
    const right = city.length > 0 ? city : "";

    const subject = `Installatie inplannen - ${left}${right.length > 0 ? " - " + right : ""}`;
    return subject.trim();
  }

  private buildCustomerSubject(r: InstallationRequest): string {
    const desc = r.customerEmail.salesOrderDescription.trim();
    const value = desc.length > 0 ? desc : "installatie";
    return `Planning ${value}`.trim();
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


      installerWhoFull: fr
        ? `{person} de la société {company}`
        : `{person} van de firma {company}`,

      installerWhoCompanyOnly: fr
        ? `la société {company}`
        : `de firma {company}`,
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
        : "Alvast bedankt voor de succesvolle verwerking van bovenstaande opdracht."
    };
  }


  private buildInstallerHtml(r: InstallationRequest): string {
    const tr = this.t(r.language);

    const color = r.brandPrimaryColorHex.trim().length > 0 ? r.brandPrimaryColorHex.trim() : "#C20E1A";
    const html: string[] = [];

    html.push(`<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`);

    html.push(`<div>${this.htmlEncode(this.buildInstallerGreeting(r))}</div>`);
    html.push(`<br>`);
    html.push(`<div>${this.htmlEncode(r.intro.requestLine.trim())}</div>`);
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.dateInstall, color));
    html.push(`<ul style="margin-top: 6px;">`);
    html.push(`<li><strong>${this.htmlEncode(tr.date)}:</strong> ${this.htmlEncode(this.formatDate(r))}</li>`);
    html.push(`<li><strong>${this.htmlEncode(tr.time)}:</strong> ${this.htmlEncode(this.formatTime(r))}</li>`);
    html.push(`</ul>`);
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.installationDetails, color));
    if (r.installation.detailsText.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;">${this.htmlEncode(r.installation.detailsText.trim())}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.vehicleDetails, color));
    html.push(this.buildVehicleHtml(r));
    if (r.notes.vehicleNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.htmlEncode(tr.notes)}:</strong> ${this.htmlEncode(r.notes.vehicleNotes.trim())}</div>`);
    }
    html.push(`<br>`);

    const placeTitle = r.notes.installationPlaceLine.trim().length > 0 ? r.notes.installationPlaceLine.trim() : tr.installPlace;
    html.push(this.sectionTitle(placeTitle, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.htmlEncode(tr.location)}:</strong> ${this.htmlEncode(r.location.name)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.street)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.postalCity.trim())}</div>`);
    html.push(`</div>`);
    if (r.notes.installationPlaceNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>${this.htmlEncode(tr.notes)}:</strong> ${this.htmlEncode(r.notes.installationPlaceNotes.trim())}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.contact, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.htmlEncode(tr.name)}:</strong> ${this.htmlEncode(r.contact.name)}</div>`);

    if (r.contact.tel.trim().length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.tel)}:</strong> ${this.htmlEncode(r.contact.tel.trim())}</div>`);
    }
    if (r.contact.gsm.trim().length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.gsm)}:</strong> ${this.htmlEncode(r.contact.gsm.trim())}</div>`);
    }
    if (r.contact.email.trim().length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.email)}:</strong> ${this.htmlEncode(r.contact.email.trim())}</div>`);
    }

    html.push(`</div>`);
    html.push(`<br>`);

    html.push(`<div><strong>${this.htmlEncode(r.ending.confirmLine.trim())}</strong></div>`);
    html.push(`<br>`);
    html.push(`<div>${this.htmlEncode(r.ending.thanksLine.trim())}</div>`);

    html.push(`</div>`);
    return html.join("").trim();
  }




  private buildCustomerHtml(r: InstallationRequest, installer: InstallerInfo): string {
    const color = r.brandPrimaryColorHex.trim().length > 0 ? r.brandPrimaryColorHex.trim() : "#C20E1A";
    const html: string[] = [];

    const tr = this.t(r.language);
    const prefix = r.customerEmail.intro.salutationPrefix.trim().length > 0 ? r.customerEmail.intro.salutationPrefix.trim() : tr.best;
    const name = r.customerEmail.intro.salutationName.trim();
    const greeting = name.length > 0 ? `${prefix} ${name},` : `${prefix},`;

    const installerPerson = installer.contactPerson.trim().length > 0 ? installer.contactPerson.trim() : "";
    const installerCompany = installer.companyName.trim().length > 0 ? installer.companyName.trim() : "";

    html.push(`<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`);

    html.push(`<div>${this.htmlEncode(greeting)}</div>`);
    html.push(`<br>`);
    html.push(`<br>`);




    const person = installerPerson.trim();
    const company = installerCompany.trim();

    const who = (() => {
      if (person.length > 0 && company.length > 0) {
        const template = tr.installerWhoFull;
        return template
          .split("{person}").join(`<strong>${this.htmlEncode(person)}</strong>`)
          .split("{company}").join(`<strong>${this.htmlEncode(company)}</strong>`);
      }

      if (company.length > 0) {
        const template = tr.installerWhoCompanyOnly;
        return template
          .split("{company}").join(`<strong>${this.htmlEncode(company)}</strong>`);
      }

      if (person.length > 0) {
        return `<strong>${this.htmlEncode(person)}</strong>`;
      }

      return this.htmlEncode(tr.installer);
    })();



    html.push(`<div>${this.htmlEncode(tr.customerIntroPrefix)} ${who} ${this.htmlEncode(tr.customerWillContact)}</div>`);

    html.push(this.sectionTitle(tr.vehicleDetails, color));
    const vehicleHtml = this.buildVehicleHtml(r);
    html.push(vehicleHtml.length > 0 ? vehicleHtml : `<div>(Geen voertuigen opgegeven)</div>`);
    html.push(`<br>`);


    html.push(this.sectionTitle(tr.installPlace, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>${this.htmlEncode(tr.location)}:</strong> ${this.htmlEncode(r.location.name)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.street)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.postalCity.trim())}</div>`);
    html.push(`</div>`);
    html.push(`<br>`);

    html.push(this.sectionTitle(tr.contact, color));
    html.push(`<div style="margin-top: 6px;">`);

    if (company.length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.company)}:</strong> ${this.htmlEncode(company)}</div>`);
    }
    if (person.length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.contactPersonLabel)}:</strong> ${this.htmlEncode(person)}</div>`);
    }

    if (installer.gsm.trim().length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.gsm)}:</strong> ${this.htmlEncode(installer.gsm.trim())}</div>`);
    }
    if (installer.email.trim().length > 0) {
      html.push(`<div><strong>${this.htmlEncode(tr.email)}:</strong> ${this.htmlEncode(installer.email.trim())}</div>`);
    }

    html.push(`</div>`);
    html.push(`<br>`);

    html.push(`<div>${this.htmlEncode(tr.customerQuestions)}</div>`);

    html.push(`</div>`);
    return html.join("").trim();
  }


  private buildInstallerGreeting(r: InstallationRequest): string {
    const tr = this.t(r.language);
    const prefix = r.intro.salutationPrefix.trim().length > 0 ? r.intro.salutationPrefix.trim() : tr.best;
    const name = r.intro.salutationName.trim();
    if (name.length === 0) return `${prefix},`;
    return `${prefix} ${name},`;
  }

  private formatDate(r: InstallationRequest): string {
    const tr = this.t(r.language);
    return r.planning.plannedDate.trim().length === 0 ? tr.tbdCustomer : r.planning.plannedDate.trim();
  }

  private formatTime(r: InstallationRequest): string {
    const tr = this.t(r.language);
    return r.planning.plannedTime.trim().length === 0 ? tr.tbdCustomer : r.planning.plannedTime.trim();
  }

private buildVehicleHtml(r: InstallationRequest): string {
  const tr = this.t(r.language);

  if (r.vehicleTable.html.trim().length > 0) {
    return this.hidePlateColumnIfEmpty(r.vehicleTable.html, tr.thPlate);
  }

  if (r.vehicles.length === 0) return "";

  const hasAnyPlate = r.vehicles.some(v => (v.licensePlate ?? "").trim().length > 0);

  const header = hasAnyPlate
    ? [tr.thBrand, tr.thModel, tr.thQty, tr.thPlate]
    : [tr.thBrand, tr.thModel, tr.thQty];

  const rows = r.vehicles.map(v => {
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
        if (isHeader) {
          html += `<th style="${headerStyle}">${this.htmlEncode(cell)}</th>`;
        } else {
          html += `<td style="${cellStyle}">${this.htmlEncode(cell)}</td>`;
        }
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
      ">${this.htmlEncode(title)}</div>
    `;
  }

  private htmlEncode(value: string): string {
    return value
      .split("&").join("&amp;")
      .split("<").join("&lt;")
      .split(">").join("&gt;")
      .split("\"").join("&quot;");
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

    // Check if any data row has a non-empty value in plate column
    let anyNonEmpty = false;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row) continue;

      const cells = Array.from(row.querySelectorAll("th, td"));
      if (plateIndex >= cells.length) continue;

      const cell = cells[plateIndex];
      const text = (cell?.textContent ?? "").trim();
      if (text.length > 0) {
        anyNonEmpty = true;
        break;
      }
    }

    if (anyNonEmpty) return input;

    // Remove the column from each row
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll("th, td"));
      if (plateIndex >= cells.length) continue;

      const cell = cells[plateIndex];
      if (cell) cell.remove();
    }

    // Keep wrapper div if the table was wrapped
    const wrapperDiv = table.parentElement && table.parentElement.tagName.toLowerCase() === "div"
      ? table.parentElement
      : null;

    return wrapperDiv ? wrapperDiv.outerHTML : table.outerHTML;
  } catch {
    return input;
  }
}


}
