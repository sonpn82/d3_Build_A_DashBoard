// 1. get data into JS
// 2. make map
// 3. make pie chart
// 4. make bar chart
// 5. tooltip!

d3.queue()  // load data first
  .defer(d3.json, "//unpkg.com/world-atlas@1.1.4/world/50m.json") // json data
  .defer(d3.csv, "./data/all_data.csv", row => {  // csv file data
    return {  // return object with fields corresponding to columns in csv file
      continent: row.Continent,
      country: row.Country,
      countryCode: row["Country Code"],
      emissions: +row["Emissions"],  // + to convert text to number
      emissionsPerCapita: +row["Emissions Per Capita"],
      region: row.Region,
      year: +row.Year
    }
  })
  .await((error, mapData, data) => {
    if (error) throw error;

    // get min and max year value
    let extremeYears = d3.extent(data, d => d.year);
    let currentYear = extremeYears[0]; // set current year = min year
    // get which checkbox is checked
    let currentDataType = d3.select('input[name="data-type"]:checked')
                            .attr("value");
    // get topojson data
    let geoData = topojson.feature(mapData, mapData.objects.countries).features;

    // Creat a map area with width equals to drawing canvas
    let width = +d3.select('.chart-container')
                    .node().offsetWidth;
    let height = 300;

    createMap(width, width * 4.7 / 5);  // adjust to show all the world map
    createPie(width, height);
    createBar(width, height);

    // initial map drawing on page load
    drawMap(geoData, data, currentYear, currentDataType)
    drawPie(data, currentYear);
    drawBar(data, currentDataType, "");

    // map drawing on event
    d3.select("#year")
        .property("min", currentYear)  // set property for year selection slider
        .property("max", extremeYears[1])
        .property("value", currentYear)
        .on("input", () => {  // event for year selection slider
          currentYear = +d3.event.target.value;  // current selected year
          drawMap(geoData, data, currentYear, currentDataType); // draw the map
          drawPie(data, currentYear);  // draw the pie
          highlightBars(currentYear);  // hightlight the selected year
        });
    // event for radio button select changed
    d3.selectAll('input[name="data-type"]')
        .on("change", () => {
          let active = d3.select(".active").data()[0];
          let country = active ? active.properties.country : "";
          currentDataType = d3.event.target.value;
          drawMap(geoData, data, currentYear, currentDataType);
          drawBar(data, currentDataType, country);
        })

    // add tooltip
    d3.selectAll("svg")
        .on("mousemove touchmove", updateTooltip);

    function updateTooltip() {
      let tooltip = d3.select(".tooltip");  // select tooltip class - a div in index.ejs
      let tgt = d3.select(d3.event.target);  // target object of event
      let isCountry = tgt.classed("country");   // check if tooltip target is country
      let isBar = tgt.classed("bar"); // check if tooltip target is bar
      let isArc = tgt.classed("arc"); // check if tooltip target is arc
      let dataType = d3.select("input:checked")
                        .property("value");
      // unit to show in tooltip
      let units = dataType === "emissions" ? 
                               "thousand metric tons" :
                               "metric tons per capita";

      let data;
      let percentage = "";  // to show in pie chart

      // set data value for each type of target object
      if (isCountry) data = tgt.data()[0].properties;
      if (isArc) {
        data = tgt.data()[0].data;
        percentage = `<p>Percentage of total: ${getPercentage(tgt.data()[0])}</p>`;      
      }
      if (isBar) data = tgt.data()[0];

      // set general style for tooltip
      tooltip
            .style("opacity", +(isCountry || isArc || isBar)) // show tooltip if one is selected
            .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
            .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");

      // set tooltip content if data is available
      if (data) {
        let dataValue = data[dataType] ?
                        data[dataType].toLocaleString() + " " + units :
                        "Data Not Available";
        tooltip
              .html(`
                <p>Country: ${data.country}</p>
                <p>${formatDataType(dataType)}: ${dataValue}</p>
                <p>Year: ${data.year || d3.select("#year").property("value")}</p>
              `)
      }
    }
  });

// uppercase format for 1st letter of each word
function formatDataType(key) {
    return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => " " + c);
}

// percentage calculation for pie chart in tooltip
function getPercentage(d) {
  let angle = d.endAngle - d.startAngle;
  let fraction = 100 * angle / (Math.PI * 2);
  return fraction.toFixed(2) + "%";
}





















