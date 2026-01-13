import { PowertrainType, type InstallationRequest, type VehicleLine } from "../models/installationModels";

export type TemplateResult = {
  subject: string;
  htmlBody: string;
  plainBody: string;
};

export interface ITemplateRenderer {
  renderInstallerEmail(request: InstallationRequest): TemplateResult;
}

export class TemplateRenderer implements ITemplateRenderer {
  public renderInstallerEmail(request: InstallationRequest): TemplateResult {
    const subject = this.buildSubject(request);
    const plainBody = this.buildPlain(request);
    const htmlBody = this.buildHtml(request);
    return { subject, htmlBody, plainBody };
  }

  private buildSubject(r: InstallationRequest): string {
    const details = r.installation.detailsText.trim();
    const city = r.location.city.trim();
    const name = r.intro.salutationName.trim();

    const left = details.length > 0 ? details : "Installatie";
    const middle = name.length > 0 ? name : "Klant";
    const right = city.length > 0 ? city : "";

    const subject = `Installatie inplannen - ${left} - ${middle}${right.length > 0 ? " - " + right : ""}`;
    return subject.trim();
  }

  private buildPlain(r: InstallationRequest): string {
    const lines: string[] = [];

    lines.push(this.buildGreeting(r));
    lines.push("");
    lines.push(r.intro.requestLine.trim());
    lines.push("");

    lines.push("Datum installatie");
    lines.push("");
    lines.push(`- Datum: ${this.formatDate(r)}`);
    lines.push(`- Tijd: ${this.formatTime(r)}`);
    lines.push("");

    lines.push("Installatiegegevens");
    if (r.installation.detailsText.trim().length > 0) {
      lines.push(r.installation.detailsText.trim());
    }
    lines.push("");

    lines.push("Voertuiggegevens");
    for (const v of r.vehicles) {
      lines.push(`- ${this.formatVehicleLine(v)}`);
    }
    if (r.notes.vehicleNotes.trim().length > 0) {
      lines.push(`- Opmerking: ${r.notes.vehicleNotes.trim()}`);
    }
    lines.push("");

    lines.push(r.notes.installationPlaceLine.trim().length > 0 ? r.notes.installationPlaceLine.trim() : "Installatieplaats");
    lines.push("");
    lines.push(`- Locatie: ${r.location.name}`);
    lines.push("");
    lines.push(`  ${r.location.street}`);
    lines.push(`  ${(`${r.location.postalCode} ${r.location.city}`).trim()}`);
lines.push("");
    if (r.notes.installationPlaceNotes.trim().length > 0) {
      lines.push(`- Opmerking: ${r.notes.installationPlaceNotes.trim()}`);
    }
    lines.push("");

    lines.push("Contactpersoon");
    lines.push("");
    lines.push(`- Naam: ${r.contact.name}`);
    lines.push(`- GSM: ${r.contact.phone}`);
    if (r.contact.email.trim().length > 0) {
      lines.push("");
      lines.push(`- Email: ${r.contact.email}`);
    }
    lines.push("");

    lines.push(r.ending.confirmLine.trim());
    lines.push("");
    lines.push(r.ending.thanksLine.trim());


    return lines.join("\n").trimEnd();
  }

  private buildHtml(r: InstallationRequest): string {
    const color = r.brandPrimaryColorHex.trim().length > 0 ? r.brandPrimaryColorHex.trim() : "#C20E1A";
    const html: string[] = [];

    html.push(`<div style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #111;">`);

  html.push(`<p>${this.htmlEncode(this.buildGreeting(r))}</p>`);

html.push(`<p>${this.htmlEncode(r.intro.requestLine.trim())}</p>`);


    html.push(this.sectionTitle("Datum installatie", color));
    html.push(`<ul style="margin-top: 6px;">`);
    html.push(`<li><strong>Datum:</strong> ${this.htmlEncode(this.formatDate(r))}</li>`);
    html.push(`<li><strong>Tijd:</strong> ${this.htmlEncode(this.formatTime(r))}</li>`);
    html.push(`</ul>`);

    html.push(this.sectionTitle("Installatiegegevens", color));
    if (r.installation.detailsText.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;">${this.htmlEncode(r.installation.detailsText.trim())}</div>`);
    }

    html.push(this.sectionTitle("Voertuiggegevens", color));

if (r.vehicleTable.html.trim().length > 0) {
  html.push(r.vehicleTable.html);
} else if (r.vehicles.length > 0) {
  html.push(`<ul style="margin-top: 6px;">`);
  for (const v of r.vehicles) {
    html.push(`<li>${this.htmlEncode(this.formatVehicleLine(v))}</li>`);
  }
  html.push(`</ul>`);
}

if (r.notes.vehicleNotes.trim().length > 0) {
  html.push(`<div style="margin-top: 6px;"><strong>Opmerking:</strong> ${this.htmlEncode(r.notes.vehicleNotes.trim())}</div>`);
}


    const placeTitle = r.notes.installationPlaceLine.trim().length > 0 ? r.notes.installationPlaceLine.trim() : "Installatieplaats";
    html.push(this.sectionTitle(placeTitle, color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>Locatie:</strong> ${this.htmlEncode(r.location.name)}</div>`);
    html.push(`<div>${this.htmlEncode(r.location.street)}</div>`);
    html.push(`<div>${this.htmlEncode((`${r.location.postalCode} ${r.location.city}`).trim())}</div>`);
    html.push(`</div>`);

    if (r.notes.installationPlaceNotes.trim().length > 0) {
      html.push(`<div style="margin-top: 6px;"><strong>Opmerking:</strong> ${this.htmlEncode(r.notes.installationPlaceNotes.trim())}</div>`);
    }

    html.push(this.sectionTitle("Contactpersoon", color));
    html.push(`<div style="margin-top: 6px;">`);
    html.push(`<div><strong>Naam:</strong> ${this.htmlEncode(r.contact.name)}</div>`);
    html.push(`<div><strong>GSM:</strong> ${this.htmlEncode(r.contact.phone)}</div>`);
    if (r.contact.email.trim().length > 0) {
      const email = r.contact.email.trim();
      html.push(`<div><strong>Email:</strong> <a href="mailto:${this.htmlEncode(email)}" style="color:${color}; text-decoration:none;"><strong>${this.htmlEncode(email)}</strong></a></div>`);
    }
    html.push(`</div>`);

    html.push(`<p style="margin-top: 12px;"><strong>${this.htmlEncode(r.ending.confirmLine.trim())}</strong></p>`);
    html.push(`<p>${this.htmlEncode(r.ending.thanksLine.trim())}</p>`);
  
    return html.join("").trim();
  }

  private buildGreeting(r: InstallationRequest): string {
    const prefix = r.intro.salutationPrefix.trim().length > 0 ? r.intro.salutationPrefix.trim() : "Beste";
    const name = r.intro.salutationName.trim();
    if (name.length === 0) {
      return `${prefix},`;
    }
    return `${prefix} ${name},`;
  }

  private formatDate(r: InstallationRequest): string {
    return r.planning.plannedDate.trim().length === 0 ? "Te bepalen met klant" : r.planning.plannedDate.trim();
  }

  private formatTime(r: InstallationRequest): string {
    return r.planning.plannedTime.trim().length === 0 ? "Te bepalen met klant" : r.planning.plannedTime.trim();
  }

  private formatVehicleLine(v: VehicleLine): string {
    const qty = v.quantity > 0 ? v.quantity : 1;

    const power =
      v.powertrain === PowertrainType.Electric ? "elektrisch" :
      v.powertrain === PowertrainType.Diesel ? "diesel" :
      v.powertrain === PowertrainType.Petrol ? "benzine" :
      v.powertrain === PowertrainType.Hybrid ? "hybride" :
      "onbekend";

    const name = `${v.brand} ${v.model}`.trim().length > 0 ? `${v.brand} ${v.model}`.trim() : "Voertuig";
    const plate = v.licensePlate.trim().length > 0 ? ` - ${v.licensePlate.trim()}` : "";

    return `${name} (${qty}x, ${power})${plate}`;
  }

private sectionTitle(title: string, color: string): string {
  return `
    <p>&nbsp;</p>
    <div style="
      margin-top: 6px;
      margin-bottom: 10px;
      padding: 8px 10px;
      border-left: 4px solid ${color};
      background: #f7f7f7;
      font-weight: bold;
    ">
      ${this.htmlEncode(title)}
    </div>
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
