document.addEventListener("DOMContentLoaded", function () {
  console.log("11111");
  var TITLE = "Dynamic Data Visualization";
  var HORIZONTAL = false;
  var STACKED = false;
  var SHOW_GRID = true;
  var SHOW_LEGEND = true;

  var chartData;
  var X_AXIS;
  var Y_AXIS;

  var chart = null;

  var dataFile = document.getElementById("dataFile");
  var xColumnDropdown = document.getElementById("xColumn");
  var yColumnDropdown = document.getElementById("yColumn");
  var readData;
  dataFile.addEventListener("change", function (e) {
    var file = e.target.files[0];
    handleFileUpload(file);
  });

  function createChart() {
    console.log("3333");
    var ctx = document.getElementById("chart").getContext("2d");

    if (chart) {
      chart.destroy();
    }
    console.log("4444");

    chart = new Chart(ctx, {
      type: HORIZONTAL ? "horizontalBar" : "bar",
      data: chartData,
      options: {
        title: {
          display: true,
          text: TITLE,
          fontSize: 14,
        },
        legend: {
          display: SHOW_LEGEND,
        },
        tooltips: {
          displayColors: false,
          callbacks: {
            label: function (tooltipItem, all) {
              return (
                all.datasets[tooltipItem.datasetIndex].label +
                ": " +
                tooltipItem.yLabel.toLocaleString()
              );
            },
          },
        },
      },
    });

    console.log("5555");
  }

  function updateChart() {
    var selectedXColumn = xColumnDropdown.value;
    var selectedYColumn = yColumnDropdown.value;

    if (selectedXColumn && selectedYColumn) {
      X_AXIS = selectedXColumn;
      Y_AXIS = selectedYColumn;

      chartData = {
        labels: readData.map(function (row) {
          console.log("ert", row[X_AXIS]);
          return row[X_AXIS];
        }),
        datasets: [
          {
            label: Y_AXIS,
            backgroundColor: "blue",
            data: readData.map(function (row) {
              return row[Y_AXIS];
            }),
          },
        ],
      };
      createChart();
    } else {
      alert("Please select both X and Y columns.");
    }
  }

  function handleFileUpload(file) {
    var fileType = getFileType(file.name);

    switch (fileType) {
      case "csv":
        parseCSV(file);
        break;
      case "xls":
        parseExcel(file);
        break;
      default:
        alert("Unsupported file type. Please upload a CSV, XLS, file.");
    }
  }

  function getFileType(fileName) {
    var ext = fileName.split(".").pop().toLowerCase();
    return ext;
  }

  function parseCSV(file) {
    console.log("2222");
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.data.length === 0) {
          alert("No data found in the CSV file.");
          return;
        }
        clearDropdownOptions();

        readData = results.data;
        console.log(results);
        if (results.meta.fields.length > 0) {
          results.meta.fields.forEach((element) => {
            if (element.length > 0) {
              var option = document.createElement("option");
              option.text = element;
              option.value = element;
              xColumnDropdown.add(option);
            }
          });
          results.meta.fields.forEach((element) => {
            if (element.length > 0) {
              var option = document.createElement("option");
              option.text = element;
              option.value = element;
              yColumnDropdown.add(option);
            }
          });
        }
      },
      error: function (error) {
        console.error("CSV parsing error:", error);
      },
    });
  }

  function parseExcel(file) {
    var reader = new FileReader();

    reader.onload = function (e) {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: "array" });

      if (workbook.SheetNames.length === 0) {
        console.error("No sheets found in the Excel file.");
        return;
      }

      var sheet = workbook.Sheets[workbook.SheetNames[0]];
      var results = XLSX.utils.sheet_to_json(sheet);

      if (results.length === 0) {
        alert("No data found in the Excel file.");
        return;
      }
      readData = results;
      clearDropdownOptions();
      var columnNames = Object.keys(results[0]);
      xColumnDropdown.innerHTML = "";
      yColumnDropdown.innerHTML = "";

      columnNames.forEach(function (columnName) {
        var option = document.createElement("option");
        option.value = columnName;
        option.text = columnName;
        xColumnDropdown.appendChild(option);

        var option2 = document.createElement("option");
        option2.value = columnName;
        option2.text = columnName;
        yColumnDropdown.appendChild(option2);
      });
      createChart();
    };

    reader.readAsArrayBuffer(file);
  }
  function updateNoteAfterVisualization() {
    var note = document.getElementById("note");
    note.innerHTML =
      "Please select the required X and Y columns for accurate visualization. Please select at least one numerical data type column for better visualization.";
    note.classList.remove("initial-note");
    note.classList.add("after-visualization-note");
  }

  function clearDropdownOptions() {
    xColumnDropdown.innerHTML = "";
    yColumnDropdown.innerHTML = "";
  }

  var visualizeButton = document.getElementById("visualizeButton");
  visualizeButton.addEventListener("click", function () {
    updateChart();
    updateNoteAfterVisualization();
  });
});
