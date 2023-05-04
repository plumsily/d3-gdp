import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Fetch GDP data set
let dataset;
const handleData = async () => {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
    );
    const data = await res.json();
    dataset = data.data;
    console.log("Successfully fetched data");
  } catch {
    console.log("Error fetching data");
  }
};
await handleData();

//Format the date data
const years = dataset.map((item) => {
  let quarter;
  let temp = item[0].substring(5, 7);
  if (temp === "01") {
    quarter = "Q1";
  } else if (temp === "04") {
    quarter = "Q2";
  } else if (temp === "07") {
    quarter = "Q3";
  } else if (temp === "10") {
    quarter = "Q4";
  }
  return item[0].substring(0, 4) + " " + quarter;
});

const yearsDate = dataset.map((item) => {
  return new Date(item[0]);
});

const xMax = new Date(d3.max(yearsDate));
xMax.setMonth(xMax.getMonth() + 3);

//Constrain plot dimensions
const w = 800;
const h = 600;
const bWidth = w / 275;
const padding = 60;

//Set scales
//X axis needs to scale with time
const xScale = d3
  .scaleTime()
  .domain([d3.min(yearsDate), xMax])
  .range([padding + 40, w - padding]);

const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(dataset, (d) => d[1])])
  .range([h - padding, padding]);

const linearScale = d3
  .scaleLinear()
  .domain([0, d3.max(dataset, (d) => d[1])])
  .range([padding, h - padding]);

const scaledGDP = dataset.map((item) => {
  return linearScale(item[1]);
});

//Construct graph
const svg = d3
  .select(".dataContainer")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

//Add tooltip to DOM
const tooltip = d3
  .select(".dataContainer")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

//Gradient styling
const defs = svg.append("defs");
const gradient = defs
  .append("linearGradient")
  .attr("id", "svgGradient")
  .attr("x1", "0%")
  .attr("x2", "100%")
  .attr("y1", "0%")
  .attr("y2", "100%");

gradient
  .append("stop")
  .attr("class", "start")
  .attr("offset", "0%")
  .attr("stop-color", "#13ECD1")
  .attr("stop-opacity", 1);

gradient
  .append("stop")
  .attr("class", "end")
  .attr("offset", "100%")
  .attr("stop-color", "#93F20D")
  .attr("stop-opacity", 1);

//Add data points
svg
  .selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", (d, i) => xScale(yearsDate[i]))
  .attr("y", (d) => yScale(d[1]))
  .attr("width", bWidth)
  .attr("height", (d, i) => scaledGDP[i] - padding)
  .attr("fill", "url(#svgGradient")
  .attr("data-date", (d, i) => {
    return d[0];
  })
  .attr("data-gdp", (d, i) => {
    return d[1];
  })
  .attr("class", "bar")
  .attr("index", (d, i) => i)
  .on("mouseover", function (event, d) {
    let i = this.getAttribute("index");
    tooltip.transition().duration(200).style("opacity", 1);
    tooltip
      .html(years[i] + "<br>" + "$" + dataset[i][1] + " Billion")
      .attr("data-date", dataset[i][0])
      .style("left", i * bWidth + "px")
      .style("top", h - scaledGDP[i] - 10 + "px");
  })
  .on("mouseout", function () {
    tooltip.transition().duration(200).style("opacity", 0);
  });

//Add axes
const xAxis = d3.axisBottom(xScale);
svg
  .append("g")
  .attr("transform", "translate(0," + (h - padding) + ")")
  .call(xAxis)
  .attr("id", "x-axis");
const yAxis = d3.axisLeft(yScale);
svg
  .append("g")
  .attr("transform", "translate(" + (padding + 40) + ",0)")
  .call(yAxis)
  .attr("id", "y-axis");

//Axes labels
svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -400)
  .attr("y", 20)
  .text("Gross Domestic Product (Billions)")
  .style("font-weight", "600")
  .style("fill", "#949494");
