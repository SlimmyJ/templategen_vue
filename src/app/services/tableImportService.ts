export type ParsedTable = {
    html: string;
    plain: string;
};

export interface ITableImportService {
    fromClipboard(html: string, plain: string): ParsedTable;
    fromText(text: string): ParsedTable;
    fromCsvFileContent(text: string): ParsedTable;
}

export class TableImportService implements ITableImportService {
    public fromClipboard(html: string, plain: string): ParsedTable {
        const tableHtml = this.extractFirstTableHtml(html);
        if (tableHtml.length > 0) {
            const safe = this.sanitizeTableHtml(tableHtml);
            return {
                html: this.wrapWithTableStyle(safe),
                plain: this.tableHtmlToPlain(safe)
            };
        }
        return this.fromText(plain);
    }

    public fromText(text: string): ParsedTable {
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            return { html: "", plain: "" };
        }

        const rows = this.normalizeRows(this.parseDelimited(trimmed));
        const html = this.rowsToHtmlTable(rows);
        const plain = this.rowsToPlain(rows);

        return { html, plain };
    }

    public fromCsvFileContent(text: string): ParsedTable {
        return this.fromText(text);
    }

    private extractFirstTableHtml(html: string): string {
        if (!html || html.trim().length === 0) return "";
        const doc = new DOMParser().parseFromString(html, "text/html");
        const table = doc.querySelector("table");
        if (!table) return "";
        return table.outerHTML;
    }

    private sanitizeTableHtml(tableHtml: string): string {
        const doc = new DOMParser().parseFromString(tableHtml, "text/html");
        const table = doc.querySelector("table");


        if (!table) return "";

        if (!table.querySelector("thead")) {
            const firstRow = table.querySelector("tr");
            if (firstRow) {
                for (const cell of Array.from(firstRow.children)) {
                    if (cell.tagName === "TD") {
                        const th = doc.createElement("th");
                        th.innerHTML = cell.innerHTML;
                        th.style.fontWeight = "bold";
                        th.style.background = "#eeeeee";
                        th.style.border = "1px solid #999";
                        th.style.padding = "4px";
                        cell.replaceWith(th);
                    }
                }
            }
        }


        const allowedTags = new Set(["TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "B", "STRONG", "I", "EM", "BR", "SPAN"]);
        const walker = doc.createTreeWalker(table, NodeFilter.SHOW_ELEMENT);

        const toRemove: Element[] = [];
        let node = walker.nextNode() as Element | null;
        while (node) {
            if (!allowedTags.has(node.tagName)) {
                toRemove.push(node);
            } else {

                for (const attr of Array.from(node.attributes)) {
                    const name = attr.name.toLowerCase();
                    if (name.startsWith("on")) node.removeAttribute(attr.name);
                    if (name === "href") node.removeAttribute(attr.name);
                    if (name === "src") node.removeAttribute(attr.name);
                    if (name === "style") {
                    }
                }
            }
            node = walker.nextNode() as Element | null;
        }

        for (const el of toRemove) {
            el.replaceWith(...Array.from(el.childNodes));
        }

        return table.outerHTML;
    }

    private wrapWithTableStyle(tableHtml: string): string {
        if (tableHtml.trim().length === 0) return "";
        const style = [
            "border-collapse:collapse",
            "width:100%",
            "font-family:Verdana,Arial,Helvetica,sans-serif",
            "font-size:12px"
        ].join(";");

        return `<div style="margin-top:6px;">${tableHtml.replace("<table", `<table style="${style}" border="1" cellpadding="4"`)}</div>`;
    }

    private tableHtmlToPlain(tableHtml: string): string {
        const doc = new DOMParser().parseFromString(tableHtml, "text/html");
        const table = doc.querySelector("table");
        if (!table) return "";

        const rows: string[] = [];
        for (const tr of Array.from(table.querySelectorAll("tr"))) {
            const cells = Array.from(tr.querySelectorAll("th,td")).map(c => (c.textContent || "").trim());
            if (cells.length > 0) rows.push(cells.join(" | "));
        }
        return rows.join("\n");
    }

    private parseDelimited(text: string): string[][] {
        const firstLine = text.split(/\r?\n/)[0] || "";
        const delimiter = firstLine.includes("\t") ? "\t" : firstLine.includes(";") ? ";" : ",";

        return delimiter === "," || delimiter === ";"
            ? this.parseCsv(text, delimiter)
            : this.parseTsv(text);
    }

    private parseTsv(text: string): string[][] {
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        return lines.map(l => l.split("\t").map(x => x.trim()));
    }
    private parseCsv(text: string, delimiter: string): string[][] {
        const rows: string[][] = [];
        let row: string[] = [];
        let field = "";
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const ch = text.charAt(i);

            if (inQuotes) {
                if (ch === "\"") {
                    const hasNext = i + 1 < text.length;
                    const next = hasNext ? text.charAt(i + 1) : "";

                    if (next === "\"") {
                        field += "\"";
                        i++;
                    } else {
                        inQuotes = false;
                    }
                } else {
                    field += ch;
                }
                continue;
            }

            if (ch === "\"") {
                inQuotes = true;
                continue;
            }

            if (ch === delimiter) {
                row.push(field.trim());
                field = "";
                continue;
            }

            if (ch === "\n") {
                row.push(field.trim());
                field = "";

                if (row.some(x => x.length > 0)) {
                    rows.push(row);
                }

                row = [];
                continue;
            }

            if (ch === "\r") {
                continue;
            }

            field += ch;
        }

        row.push(field.trim());
        if (row.some(x => x.length > 0)) {
            rows.push(row);
        }

        return rows;
    }


    private rowsToHtmlTable(rows: string[][]): string {
        if (rows.length === 0) return "";

        const tableStyle = "border-collapse:collapse;width:100%;font-family:Verdana,Arial,Helvetica,sans-serif;font-size:12px;";
        const cellStyle = "border:1px solid #999;padding:4px;vertical-align:top;";

        let html = `<table style="${tableStyle}">`;

        for (const [index, row] of rows.entries()) {
            html += "<tr>";

            const isHeader = index === 0;
            if (isHeader) {
                for (const cell of row) {
                    html += `<th style="border:1px solid #999;padding:4px;vertical-align:top;background:#eeeeee;font-weight:bold;">${this.htmlEncode(cell)}</th>`;
                }
            } else {
                for (const cell of row) {
                    html += `<td style="${cellStyle}">${this.htmlEncode(cell)}</td>`;
                }
            }

            html += "</tr>";
        }

        html += "</table>";
        return `<div style="margin-top:6px;">${html}</div>`;
    }

    private normalizeRows(rows: string[][]): string[][] {
        if (rows.length === 0) return rows;

        const trimmed = rows.map(r => this.trimRowRight(r));

        const maxCols = trimmed.reduce((m, r) => Math.max(m, r.length), 0);
        if (maxCols === 0) return [];

        const padded = trimmed.map(r => {
            const copy = r.slice();
            while (copy.length < maxCols) copy.push("");
            return copy;
        });

        const keep: boolean[] = new Array(maxCols).fill(false);

        for (let c = 0; c < maxCols; c++) {
            for (let r = 0; r < padded.length; r++) {
                const cell = padded[r]?.[c] ?? "";
                if (cell.trim().length > 0) {
                    keep[c] = true;
                    break;
                }
            }
        }

        const result = padded.map(r => r.filter((_, idx) => keep[idx]));
        return result.map(r => this.trimRowRight(r));
    }


    private trimRowRight(row: string[]): string[] {
        let end = row.length;

        while (end > 0) {
            const value = row[end - 1] ?? "";
            if (value.trim().length > 0) {
                break;
            }
            end--;
        }

        return row.slice(0, end);
    }



    private rowsToPlain(rows: string[][]): string {
        return rows.map(r => r.join(" | ")).join("\n");
    }

    private htmlEncode(value: string): string {
        return value
            .split("&").join("&amp;")
            .split("<").join("&lt;")
            .split(">").join("&gt;")
            .split("\"").join("&quot;");
    }
}
