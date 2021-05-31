const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
const margin = {
    top: 60,
    right: 20,
    bottom: 30,
    left: 40
}

const width = 1000 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

const tooltip = d3.select(".chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

const overlay = d3.select(".chart")
    .append("div")
    .attr("id", "overlay")
    .style("opacity", 0);

const svgContainer = d3.select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr('transform', 'translate(' + margin.left + ',' + 0 + ')');

async function getData() {
    const response = await fetch(url);
    const data = await response.json();
    return data
}

async function drawChart() {
    const dataset = await getData();
    const timeFormat = d3.timeFormat('%M:%S');
    const times = dataset.map((item) => item.Time);
    dataset.forEach((item) => {
        const getMinutesAndSeconds = item.Time.split(':');
        item.Time = new Date(1970, 0, 1, 0, getMinutesAndSeconds[0], getMinutesAndSeconds[1])
    })

    const x = d3.scaleLinear().range([margin.left, width - margin.right]);
    const y = d3.scaleTime().range([margin.top - 10, height]);
    const xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(y).tickFormat(timeFormat);
    x.domain([
        d3.min(dataset, function (d) {
          return d.Year - 1;
        }),
        d3.max(dataset, function (d) {
          return d.Year + 1;
        })
    ]);
    y.domain(
        d3.extent(dataset, function (d) {
          return d.Time;
        })
    );

    svgContainer
      .append('text')
      .attr('x', 0)
      .attr('y', 30)
      .style('font-size', 11)
      .style('font-style', "italic")
      .text('Time in Minutes');

    svgContainer
      .append("g")
      .attr("id", "x-axis")
      .attr("class", "tick")
      .attr("transform", "translate(" + [0, height] + ")")
      .call(xAxis);
    
    svgContainer
      .append("g")
      .attr("id", "y-axis")
      .attr("class", "tick")
      .attr("transform", "translate(" + [margin.left, 0] + ")")
      .call(yAxis);
    
    svgContainer
        .append("rect")
        .attr("id", "legend")
        .attr("class", "doping")
        .attr("x", 900)
        .attr("y", 100)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "03191eff");
    
    svgContainer
        .append("rect")
        .attr("id", "legend")
        .attr("class", "nodoping")
        .attr("x", 900)
        .attr("y", 130)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "03191eff");

    svgContainer
        .append("text")
        .attr("id", "legend")
        .attr("x", 668)
        .attr("y", 115)
        .style("color", "#03191eff")
        .text("Riders with doping allegations");
    
    svgContainer
        .append("text")
        .attr("id", "legend")
        .attr("x", 818)
        .attr("y", 145)
        .style("color", "#03191eff")
        .text("No doping");

    svgContainer.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("data-xvalue", (d) => d.Year)
        .attr("data-yvalue", (d) => d.Time.toISOString())
        .attr("time", (d, i) => times[i])
        .attr("name", (d) => d.Name)
        .attr("nationality", (d) => d.Nationality)
        .attr("doping", (d) => d.Doping)
        .attr("cx", (d) => x(d.Year))
        .attr("cy", (d) => y(d.Time))
        .attr("r", 8)
        .attr("class", (d) => d.Doping === "" ? "dot nodoping" : "dot")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
}

function handleMouseOver() {
  currentDot = d3.select(this);
  currentDot.attr("r", 12);
  let xLocation = parseInt(currentDot.attr("cx")) + 50;
  let yLocation = parseInt(currentDot.attr("cy")) - 50;
  let year = currentDot.attr("data-xvalue");
  let time = currentDot.attr("time");
  let name = currentDot.attr("name");
  let nationality = currentDot.attr("nationality");
  let doping = currentDot.attr("doping");
  const dopingText = doping === "" ? "No doping" : doping;
  overlay.transition()
      .duration(0)
      .style("opacity", 0.9)
      .style("top", 0)
      .style("left", 0);

  tooltip.transition().duration(100).style("opacity", 0.9);
  tooltip.attr("data-year", year);

  tooltip.html(name + " " + nationality + "<br>" + "Time: " + time + "<br>" + "Year: " + year + "<br>" + dopingText)
      .style("left", xLocation + "px")
      .style("top", yLocation + "px");
}

function handleMouseOut(d, i) {
  d3.select(this).attr("r", "8")
  tooltip.transition().duration(100).style("opacity", 0);
  overlay.transition().duration(100).style("opacity", 0);
}


drawChart()