const URL =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// The JSON data
fetch(URL)
  .then((response) => response.json())
  .then((data) => console.log(data));

// Graph
const graph = document.getElementById("graph");

// Styles
// Padding
const padding = {
  top: 4,
  right: 4,
  bottom: 4,
  left: 4,
};

const paddingStyle =
  "padding: " +
  padding.top +
  "px " +
  padding.right +
  "px " +
  padding.bottom +
  "px " +
  padding.left +
  "px";

// Margin
const marginVals = window
  .getComputedStyle(graph)
  .getPropertyValue("margin")
  .split(" ");

const margin = {
  top: 40,
  right: parseFloat(marginVals[1].replace("px", "")),
  bottom: 40,
  left: parseFloat(marginVals[1].replace("px", "")),
};

const marginStyle =
  "margin: " +
  margin.top +
  "px " +
  margin.right +
  "px " +
  margin.bottom +
  "px " +
  margin.left +
  "px";

// Width & height
const WIDTH = 920 - padding.right - padding.left;
const HEIGHT = 650 - padding.top - padding.bottom;

// x & y scales
var x = d3.scaleLinear().range([0, WIDTH]);
var y = d3.scaleTime().range([0, HEIGHT]);

// Color scheme
const color = d3.scaleOrdinal(d3.schemeTableau10);

// Time format
const timeFormat = d3.timeFormat("%M:%S");

// x & y axes
const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
const yAxis = d3.axisLeft(y).tickFormat(timeFormat);

// Tooltip
const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// SVG
const svg = d3
  .select("#graph")
  .append("svg")
  .attr("id", "axis")
  .attr(
    "width",
    WIDTH + margin.left + margin.right + padding.left + padding.right
  )
  .attr(
    "height",
    HEIGHT + margin.top + margin.bottom + padding.top + padding.bottom
  )
  .attr("style", paddingStyle + "; " + marginStyle)
  .append("g")
  .attr("transform", "translate(-10,10)");

// Retrieves data in JSON
d3.json(URL).then((data) => {
  // Updates the place on list and time
  data.forEach((d) => {
    d.Place = +d.Place;
    var parsedTime = d.Time.split(":");
    // Same year used to produce accurate results
    d.Time = new Date(1990, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });

  // Gets the domain for the x and y axes
  x.domain([
    d3.min(data, function (d) {
      return d.Year - 1;
    }),
    d3.max(data, function (d) {
      return d.Year + 1;
    }),
  ]);

  y.domain(
    d3.extent(data, function (d) {
      return d.Time;
    })
  );

  // Axes
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(80," + HEIGHT + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("id", "y-axis")
    .attr("transform", "translate(80,0)")
    .call(yAxis);

  // Dots
  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("id", (d) => (d.Doping !== "" ? "doping" : "clean"))
    .attr("r", 8)
    .attr("cx", (d) => x(d.Year) + 80) // Offsets based on translate of x axis
    .attr("cy", (d) => y(d.Time))
    .attr("data-name", (d) => d.Name)
    .attr("data-nationality", (d) => d.Nationality)
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toISOString())
    .attr("data-time", (d) => d.Time)
    .attr("data-doping", (d) => d.Doping)
    .style("fill", (d) => color(d.Doping !== "")) // Adds diferent colors to dots
    .on("mouseover", function (e) {
      tooltip.style("display", "block");
      tooltip.transition().duration(150).style("opacity", 0.9);
      tooltip.attr("data-year", e.target.getAttribute("data-xvalue"));
      tooltip
        .html(
          "<h3>" +
            e.target.getAttribute("data-name") +
            ", " +
            e.target.getAttribute("data-nationality") +
            "</h3><b>Year</b>: " +
            e.target.getAttribute("data-xvalue") +
            "<br><b>Time</b>: " +
            timeFormat(new Date(e.target.getAttribute("data-time"))) +
            (e.target.getAttribute("data-doping")
              ? "<br/><br/>" + e.target.getAttribute("data-doping")
              : "")
        )
        .style("left", e.pageX + 10 + "px")
        .style("top", e.pageY - 38 + "px");
    })
    .on("mouseout", function () {
      tooltip
        .style("display", "none")
        .transition()
        .duration(150)
        .style("opacity", 0);
    });

  /* Legend */
  const legendContainer = svg.append("g").attr("id", "legend");

  legendContainer
    .selectAll("legend")
    .data(color.domain())
    .enter()
    .append("g")
    .attr("class", "legend-label")
    .attr("transform", (c, i) => "translate(0," + (HEIGHT / 2 - i * 20) + ")")
    .append("rect")
    .attr("x", WIDTH - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  legendContainer
    .selectAll("legend-label")
    .data(color.domain())
    .enter()
    .append("text")
    .attr(
      "transform",
      (c, i) =>
        "translate(" + (WIDTH + 5) + "," + (HEIGHT / 2 - i * 20 + 16) + ")"
    )
    .text((c) => (c ? "Not doped" : "Doped"));

  // Adds sources
  d3.select("#graph").append("hr").style("border-color", "#eee");

  d3.select("#graph")
    .append("h1")
    .text("Sources")
    .style("padding-left", "40px");

  d3.select("#graph")
    .append("ul")
    .selectAll("li")
    .data(
      data.filter(
        (d, i, self) =>
          d.URL !== "" && i === self.findIndex((v) => v.URL === d.URL)
      )
    )
    .enter()
    .append("li")
    .append("a")
    .attr("href", (d) => d.URL)
    .attr("target", "_blank")
    .text((d) => d.URL);
});

/* Labels */
svg
  .append("text")
  .attr("class", "axis-label")
  .attr("x", WIDTH / 2 + 80) // Offsets based on translate of x axis
  .attr("y", HEIGHT + 25)
  .attr("dy", "0.8em")
  .text("Year");

svg
  .append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("y", 25)
  .attr("x", -375)
  .attr("dy", "0.8em")
  .text("Best Time (minutes)");
