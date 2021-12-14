function createBar(width, height) {
    // set basic value bar width and height
    let bar = d3.select("#bar")
                    .attr("width", width)
                    .attr("height", height);

    // set class for x axis
    bar.append("g")
        .classed("x-axis", true);

    // set class for y axis
    bar.append("g")
        .classed("y-axis", true);

    // set y axis title
    bar.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "1em")
        .classed("y-axis-label", true);

    // set bar title
    bar.append("text")
        .attr("x", width / 2)
        .attr("y", "1em")
        .attr("font-size", "1.5em")
        .style("text-anchor", "middle")
        .classed("bar-title", true);
}

// function to hightlight selected year bar
function highlightBars(year) {
    d3.select("#bar")
        .selectAll("rect")
            .attr("fill", d => d.year === year ? "#16a085" : "#1abc9c");            
}

function drawBar(data, dataType, country) {
    let bar = d3.select("#bar");
    let padding = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 110
    };

    let barPadding = 1;
    let width = +bar.attr("width");
    let height = +bar.attr("height");

    // filter data with selected country and sort by year
    let countryData = data.filter(d => d.country === country)
                            .sort((a,b) => a.year - b.year);

    // scale x axis
    let xScale = d3.scaleLinear()
                    .domain(d3.extent(data, d => d.year))
                    .range([padding.left, width - padding.right]);

    // scale y axis
    let yScale = d3.scaleLinear()
                    .domain([0, d3.max(countryData, d => d[dataType])])
                    .range([height - padding.bottom, padding.top]);

    let barWidth = xScale(xScale.domain()[0] + 1) - xScale.range()[0];

    let xAxis = d3.axisBottom(xScale)
                    .tickFormat(d3.format(".0f"));

    // move xaxis to bottom location with a padding value
    d3.select(".x-axis")
        .attr("transform", `translate(0,${height-padding.bottom})`)
        .call(xAxis);

    let yAxis = d3.axisLeft(yScale);

    // move yaxis to left location with a padding value
    d3.select(".y-axis")
        .attr("transform", `translate(${padding.left-barWidth/2},0)`)
        .transition()
        .duration(1000)
        .call(yAxis);

    // set y axis label text
    let axisLabel = dataType === "emissions" ? 
        "CO2 emissions, thousand metric tons" :
        "CO2 emissions, metric tons per capita";

    // set bar label text
    let barTitle = country ?
        `CO2 Emissions, ${country}` :
        "Click on a country to see annual trends.";
    
    d3.select(".y-axis-label")
        .text(axisLabel);

    d3.select(".bar-title")
        .text(barTitle)

    // set transition style
    let t = d3.transition()
                .duration(500)
                .ease(d3.easeBounceOut)
    
    // general update pattern
    let update = bar.selectAll(".bar")
                    .data(countryData);

    update
        .exit()
        .transition(t)
            .delay((d, i, nodes) => (nodes.length - i - 1) * 100)  // bar will be removed from right to left
            .attr("y", height - padding.bottom)
            .attr("height", 0)
            .remove();

    update
        .enter()
        .append("rect")
            .classed("bar", true)
            .attr("y", height - padding.bottom)
            .attr("height", 0)
        .merge(update)
            .attr("x", d => (xScale(d.year) + xScale(d.year - 1)) / 2)
            .attr("width", barWidth - barPadding)
            .transition(t)
            .delay((d, i) => i * 100)  // add bar from left to right
                .attr("y", d => yScale(d[dataType]))
                .attr("height", d => height - padding.bottom - yScale(d[dataType]));

}