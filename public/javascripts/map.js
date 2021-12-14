function createMap(width, height) {
  d3.select("#map")
      .attr("width", width)  // set dimension for svg
      .attr("height", height)   
    .append("text")
      .attr("x", width / 2)  // add text for graph title
      .attr("y", "1em")
      .attr("font-size", "1.5em")
      .style("text-anchor", "middle")
      .classed("map-title", true);
}

function drawMap(geoData, climateData, year, dataType) {
  let map = d3.select("#map");

  // create a mercato projection for map
  let projection = d3.geoMercator()
                      .scale(110)
                      .translate([
                        +map.attr("width") / 2.1,
                        +map.attr("height") / 1.4
                      ]);
  
  // apply the projection
  let path = d3.geoPath()
                .projection(projection);

  d3.select("#year-val").text(year); // set year value for current year text

  // climateData = emission data from cvs file
  // match data from geoData and csv data, merge by country code or id
  // also match year data between csv year and current year
  geoData.forEach(d => {
    let countries = climateData.filter(row => row.countryCode === d.id);
    let name = '';
    if (countries.length > 0) name = countries[0].country;
    d.properties = countries.find(c => c.year === year) || {country: name};
  })

  // color for our map
  let colors = ["#f1c40f", "#e67e22", "#e74c3c", "#c0392b"]

  // domains corresponding to data type checkbox selection
  let domains = {
    emissions: [0, 2.5e5, 1e6, 5e6],
    emissionsPerCapita: [0, 0.5, 2, 10]
  };

  // match domain and range for graph
  let mapColorScale = d3.scaleLinear()
                        .domain(domains[dataType])  // 0 or 1
                        .range(colors);

  let update = map.selectAll(".country")
                  .data(geoData);

  // general update pattern without 'exit' 
  update
    .enter()
    .append("path")
      .classed("country", true)
      .attr("d", path)
      .on("click", function() {  // set event on country selection
        let currentDataType = d3.select("input:checked")
                                .property("value");
        let country = d3.select(this);  // this = current path  
        // check if class of current selection is active     
        let isActive = country.classed("active");  
        // if active (that country is currently selected), set name of that country to blank ~ unselected it (to avoid having 2 active country)
        let countryName = isActive ? "" : country.data()[0].properties.country; 
        // draw the bar chart, if countryname is blank then no bar would be drawn
        drawBar(climateData, currentDataType, countryName);
        // highlight the selected year bar
        highlightBars(+d3.select("#year").property("value"));
        // clear all 'active' class from all countries
        d3.selectAll(".country").classed("active", false);
        // reverse class state of current selected country
        country.classed("active", !isActive);
      })
    .merge(update)
      .transition()
      .duration(750)
      .attr("fill", d => {
        let val = d.properties[dataType];
        return val ? mapColorScale(val) : "#ccc";
      });

  // update the title
  d3.select(".map-title")
      .text(`Carbon dioxide ${graphTitle(dataType)}, ${year}`)
}

function graphTitle(str) {
  // replace any capital letter by a space followed by a lower case
  return str.replace(/[A-Z]/g, c => " " + c.toLowerCase());
}

























