function createPie(width, height) {
  // basic setting for chart - height and width
  var pie = d3.select("#pie")
                  .attr("width", width)
                  .attr("height", height);

  // chart transformation, center translation
  pie.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`)
      .classed("chart", true);

  // chart title
  pie.append("text")
      .attr("x", width / 2)
      .attr("y", "1em")
      .attr("font-size", "1.5em")
      .style("text-anchor", "middle")
      .classed("pie-title", true);
}

function drawPie(data, currentYear) {
  let pie = d3.select("#pie");

  // sort data by continent and emission
  let arcs = d3.pie()
                .sort((a, b) => {
                  if (a.continent < b.continent) return -1;
                  if (a.continent > b.continent) return 1;
                  return a.emissions - b.emissions;
                })
                .value(d => d.emissions);

  // set radius of pie chart
  let path = d3.arc()
                .outerRadius(+pie.attr("height") / 2 - 50)
                .innerRadius(0);

  // get selected year
  let yearData = data.filter(d => d.year === currentYear);
  // input continent list
  let continents = []; 
  for (let i=0; i< yearData.length; i++) {
    let continent = yearData[i].continent;
    if(!continents.includes(continent)) {
      continents.push(continent);
    }
  }

  let colorScale = d3.scaleOrdinal()
                      .domain(continents)
                      .range(["#ab47bc", "#7e57c2", "#26a69a", "#42a5f5", "#78909c"]);
  // General update pattern
  let update = pie
                .select(".chart")
                .selectAll(".arc")
                .data(arcs(yearData));

  update
    .exit()
    .remove();

  update
    .enter()
      .append('path')
      .classed("arc", true)
      .attr("stroke", "#dff1ff")
      .attr("stroke-width", "0.25px")
    .merge(update)
      .attr("fill", d => colorScale(d.data.continent))
      .attr("d", path);

  pie.select(".pie-title")
    .text(`Total emissions by continent and region, ${currentYear}`);
}











