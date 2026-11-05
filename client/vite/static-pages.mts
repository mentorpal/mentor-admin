/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

function pageFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return pageFiles(file);
    return /\.(tsx|jsx)$/.test(entry.name) ? [file] : [];
  });
}

// Copy the built SPA shell to each page path for hosts without SPA rewrites.
export function staticPages(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "admin-static-pages",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
    },
    writeBundle() {
      const out = path.resolve(config.root, config.build.outDir);
      const shell = fs.readFileSync(path.join(out, "index.html"));
      const pages = path.join(config.root, "src/pages");
      const seen = new Set<string>();
      for (const file of pageFiles(pages)) {
        const route = path
          .relative(pages, file)
          .replace(/\\/g, "/")
          .replace(/\.(tsx|jsx)$/, "")
          .replace(/(^|\/)index$/, "");
        if (seen.has(route)) throw new Error(`Duplicate page route: /${route}`);
        seen.add(route);
        if (!route) continue;
        const destination = path.join(out, route);
        fs.mkdirSync(destination, { recursive: true });
        fs.writeFileSync(path.join(destination, "index.html"), shell);
      }
      fs.writeFileSync(path.join(out, "404.html"), shell);
      config.logger.info(`Generated ${seen.size} page shells and 404.html`);
    },
  };
}
