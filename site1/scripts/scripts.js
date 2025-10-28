document.getElementById("csvInput").addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
          if(!results.data.length) {
            document.getElementById("tableContainer").innerHTML = "No data found in CSV.";
            return;
          }
          renderPivotedTypeTable(results.data);
        }
      });
    });

    function detectType(col, data) {
      for (let i = 0; i < data.length; i++) {
        const value = data[i][col];
        if (value !== null && value !== undefined && value !== "") {
          if (typeof value === "number" && !isNaN(value)) return "number";
          if (typeof value === "boolean") return "boolean";
          // Check for valid date (not "NaN" + not obviously just text)
          if (typeof value === "string" && !isNaN(Date.parse(value)) && value.match(/\d{4}-\d{2}-\d{2}/)) return "date";
          return "string";
        }
      }
      return "unknown";
    }

    function renderPivotedTypeTable(data) {
      const cols = Object.keys(data[0]);
      const typeMap = {};
      cols.forEach(col => {
        const dtype = detectType(col, data);
        if (!typeMap[dtype]) typeMap[dtype] = [];
        typeMap[dtype].push(col);
      });
      const types = Object.keys(typeMap);

      // Find max number of columns per type (for the number of rows)
      const maxRows = Math.max(...types.map(type => typeMap[type].length));

      // Build table HTML
      let html = "<table><tr>";
      types.forEach(type => html += `<th>${type}</th>`);
      html += "</tr>";
      for (let i = 0; i < maxRows; i++) {
        html += "<tr>";
        types.forEach(type => {
          html += `<td>${typeMap[type][i] || ""}</td>`;
        });
        html += "</tr>";
      }
      html += "</table>";

      document.getElementById("tableContainer").innerHTML = html;
    }