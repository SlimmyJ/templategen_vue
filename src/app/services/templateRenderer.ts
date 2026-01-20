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

  private buildInstallerHtml(r: InstallationRequest): string {
    const color = r.brandPrimaryColorHex.trim().length > 0 ? r.brandPrimaryColorHex.trim() : "#C20E1A";
    const html: string[] = [];

    html.push(`<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`);

    html.push(`<div>${this.htmlEncode(this.buildInstallerGreeting(r))}</div>`);
    html.push(`<br>`);
    html.push(`<div>${this.htmlEncode(r.intro.requestLine.trim())}</div>`);
    html.push(`<br>`);

    html.push(this.sectionTitle("Datum installatie", color));
    html.push(`<ul style="margin-top: 6px;">`);
    html.push(`<li><strong>Datum:</strong> ${this.htmlEncode(this.formatDate(r))}</li>`);
    html.push(`<li><strong>Tijd:</strong> ${this.htmlEncode(this.formatTime(r))}</li>`);
    html.push(`</ul>`);
    html.push(`<br>`);

    html.push(this.sectionTitle("Installatiegegevens", color));
    if (r.installation.detailsText.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;">${this.htmlEncode(r.installation.detailsText.trim())}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle("Voertuiggegevens", color));
    html.push(this.buildVehicleHtml(r));
    if (r.notes.vehicleNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>Opmerking:</strong> ${this.htmlEncode(r.notes.vehicleNotes.trim())}</div>`);
    }
    html.push(`<br>`);

    const placeTitle = r.notes.installationPlaceLine.trim().length > 0 ? r.notes.installationPlaceLine.trim() : "Installatieplaats";
    html.push(this.sectionTitle(placeTitle, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>Locatie:</strong> ${this.htmlEncode(r.location.name)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.street)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.postalCity.trim())}</div>`);
    html.push(`</div>`);
    if (r.notes.installationPlaceNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>Opmerking:</strong> ${this.htmlEncode(r.notes.installationPlaceNotes.trim())}</div>`);
    }
    html.push(`<br>`);

    html.push(this.sectionTitle("Contactpersoon", color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>Naam:</strong> ${this.htmlEncode(r.contact.name)}</div>`);

    if (r.contact.tel.trim().length > 0) {
      html.push(`<div><strong>Tel:</strong> ${this.htmlEncode(r.contact.tel.trim())}</div>`);
    }
    if (r.contact.gsm.trim().length > 0) {
      html.push(`<div><strong>GSM:</strong> ${this.htmlEncode(r.contact.gsm.trim())}</div>`);
    }
    if (r.contact.email.trim().length > 0) {
      html.push(`<div><strong>Email:</strong> ${this.htmlEncode(r.contact.email.trim())}</div>`);
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

  const prefix = r.customerEmail.intro.salutationPrefix.trim().length > 0 ? r.customerEmail.intro.salutationPrefix.trim() : "Beste";
  const name = r.customerEmail.intro.salutationName.trim();
  const greeting = name.length > 0 ? `${prefix} ${name},` : `${prefix},`;

  const installerPerson = installer.contactPerson.trim().length > 0 ? installer.contactPerson.trim() : "";
  const installerCompany = installer.companyName.trim().length > 0 ? installer.companyName.trim() : "";

  html.push(`<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`);

  html.push(`<div>${this.htmlEncode(greeting)}</div>`);
  html.push(`<br>`);
  html.push(`<br>`);


const who =
  installerPerson.length > 0 && installerCompany.length > 0
    ? `<strong>${this.htmlEncode(installerPerson)}</strong> van de firma <strong>${this.htmlEncode(installerCompany)}</strong>`
    : installerCompany.length > 0
      ? `de firma <strong>${this.htmlEncode(installerCompany)}</strong>`
      : `onze installateur`;

html.push(`<div>Zoals telefonisch besproken zal ${who} u rechtstreeks contacteren voor het maken van een afspraak voor de installaties van volgende (voertuigen):</div>`);
  html.push(`<br>`);

  
  html.push(this.sectionTitle("Voertuiggegevens", color));
  const vehicleHtml = this.buildVehicleHtml(r);
  html.push(vehicleHtml.length > 0 ? vehicleHtml : `<div>(Geen voertuigen opgegeven)</div>`);
  html.push(`<br>`);

  
  html.push(this.sectionTitle("Installatieplaats", color));
  html.push(`<div style="margin-top: 6px;">`);
html.push(`<div><strong>Locatie:</strong> ${this.htmlEncode(r.location.name)}</div>`);
  html.push(`<div>${this.htmlEncode(r.location.street)}</div>`);
  html.push(`<div>${this.htmlEncode(r.location.postalCity.trim())}</div>`);
  html.push(`</div>`);
  html.push(`<br>`);

  html.push(this.sectionTitle("Contactpersoon", color));
  html.push(`<div style="margin-top: 6px;">`);

  if (installerCompany.length > 0) {
    html.push(`<div><strong>Firma:</strong> ${this.htmlEncode(installerCompany)}</div>`);
  }
  if (installerPerson.length > 0) {
    html.push(`<div><strong>Contact:</strong> ${this.htmlEncode(installerPerson)}</div>`);
  }
  if (installer.gsm.trim().length > 0) {
    html.push(`<div><strong>GSM:</strong> ${this.htmlEncode(installer.gsm.trim())}</div>`);
  }
  if (installer.email.trim().length > 0) {
    html.push(`<div><strong>Email:</strong> ${this.htmlEncode(installer.email.trim())}</div>`);
  }

  html.push(`</div>`);
  html.push(`<br>`);

  html.push(`<div>Mocht u in de tussentijd vragen hebben, dan kunt u uiteraard bij ons terecht.</div>`);

  html.push(`</div>`);
  return html.join("").trim();
}


  private buildInstallerGreeting(r: InstallationRequest): string {
    const prefix = r.intro.salutationPrefix.trim().length > 0 ? r.intro.salutationPrefix.trim() : "Beste";
    const name = r.intro.salutationName.trim();
    if (name.length === 0) return `${prefix},`;
    return `${prefix} ${name},`;
  }

  private formatDate(r: InstallationRequest): string {
    return r.planning.plannedDate.trim().length === 0 ? "Te bepalen met klant" : r.planning.plannedDate.trim();
  }

  private formatTime(r: InstallationRequest): string {
    return r.planning.plannedTime.trim().length === 0 ? "Te bepalen met klant" : r.planning.plannedTime.trim();
  }

  private buildVehicleHtml(r: InstallationRequest): string {
    if (r.vehicleTable.html.trim().length > 0) {
      return r.vehicleTable.html;
    }

    if (r.vehicles.length === 0) {
      return "";
    }

    const rows: string[][] = [
      ["Merk", "Model", "Aantal", "Kenteken"],
      ...r.vehicles.map(v => [
        v.brand ?? "",
        v.model ?? "",
        String(v.quantity ?? 1),
        v.licensePlate ?? ""
      ])
    ];

    return this.rowsToHtmlTable(rows);
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
}
