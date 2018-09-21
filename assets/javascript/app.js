//--------------------------------------Begin eBay API JSON callback-------------------

function jsonpcallback(data) {
        console.log(data.Item);

    // Item 1 data
        var urlOne = data.Item[0].ViewItemURLForNaturalSearch;
        var titleOne = data.Item[0].Title;
        var priceOne = data.Item[0].ConvertedCurrentPrice.Value;

    // Item 2 data
        var urlTwo = data.Item[1].ViewItemURLForNaturalSearch;
        var titleTwo = data.Item[1].Title;
        var priceTwo = data.Item[1].ConvertedCurrentPrice.Value;

    // Item 3 data
        var urlThree = data.Item[2].ViewItemURLForNaturalSearch;
        var titleThree = data.Item[2].Title;
        var priceThree = data.Item[2].ConvertedCurrentPrice.Value;

    //Results Container jQuery
        $("#result-1").show().html("<h5><strong>" + titleOne + "</strong></h5>");
        $("#result-2").show().html("<h5><strong>" + titleTwo + "</strong></h5>");
        $("#result-3").show().html("<h5><strong>" + titleThree + "</strong></h5>");
        $("#result-1").append("<a target='_blank' href=" + urlOne + ">Click Here for Listing</a>");
        $("#result-1").append("<p>" + "Price in USD: $" + priceOne + "</p>");
        $("#result-2").append("<a target='_blank' href=" + urlTwo + ">Click Here for Listing</a>");
        $("#result-2").append("<p>" + "Price in USD: $" + priceTwo + "</p>");
        $("#result-3").append("<a target='_blank' href=" + urlThree + ">Click Here for Listing</a>");
        $("#result-3").append("<p>" + "Price in USD: $" + priceThree + "</p>");

//Bitcoin conversions
// I had to store the bitcoin number in a hidden html element to beat the scope issues
// the convertedPrice variable retrieves it and it can be used in this function
// the math to convert USD to bitcoin is just: price_in_USD / covertPrice
var convertPrice = $("#storeBTC").html();
$("#result-1").append("<p>" + parseFloat(priceOne / convertPrice).toFixed(8) + " BTC</p>");
$("#result-2").append("<p>" + parseFloat(priceTwo / convertPrice).toFixed(8) + " BTC</p>");
$("#result-3").append("<p>" + parseFloat(priceThree / convertPrice).toFixed(8) + " BTC</p>")
    }

//--------------------------------------End eBay API JSON callback-----------------------

$(document).ready(function() {

    $("#result-1").hide();
    $("#result-2").hide();
    $("#result-3").hide();

//---------------------------------------Blockchain API GET request-------------
    // Chain all ajax request inside of $.when()
    // Manipulate all responses inside of .then(function(){});
    //API URL links
var myKey = "0c450e4c-8ea7-4c5e-976d-879cc34f087c";
var bitQueryURL = 'https://api.blockchain.info/stats?cors=true&key=' + myKey;
var priceGraphURL = 'https://api.blockchain.info/charts/market-price?timespan=30days&format=json&cors=true&key=' + myKey;
var hashURL = 'https://api.blockchain.info/pools?timespan=10days&cors=true&key=' + myKey;
var transactionURL = 'https://api.blockchain.info/charts/n-transactions?timespan=30days&cors=true&key=' + myKey;
var outputURL = 'https://api.blockchain.info/charts/output-volume?timespan=30days&cors=true&key=' + myKey;
    //API output variables
    var gStats;
    var priceGraph;
    var hashPool;
    var transactionCount;
    var outputValue;
var convertBTC;

    $.when(
        //General Stats
        $.ajax({
            url: bitQueryURL,
            method: 'GET',
        }).done(function(json1) {
            gStats = json1;
        }),
        //Price graph
        $.ajax({
            url: priceGraphURL,
            method: 'GET',
        }).done(function(json2) {
            priceGraph = json2;
        }),
        //Hash pools vs hashrate
        $.ajax({
            url: hashURL,
            method: 'GET',
        }).done(function(json3) {
            hashPool = json3;
        }),
        //Transactions count linegraph
        $.ajax({
            url: transactionURL,
            method: 'GET',
        }).done(function(json4) {
            transactionCount = json4;
        }),
        // Output value linegraph
        $.ajax({
            url: outputURL,
            method: 'GET',
        }).done(function(json5) {
            outputValue = json5;
        })
        //Function converts JSON date outputs into a usable format
    ).then(function() {
        // how to convert unix time to any format for chart axis
        // var time = moment.unix(1513140162).format("MMM Do");
        var dateRange = [];
        var convert;
        for (var i = 0; i < transactionCount.values.length; i++) {
    convert = moment.unix(transactionCount.values[i].x).format("MMM Do");
        dateRange.push(convert);
    }
//Following functions organize the values from our APIs into an array for ease of access.
var marketValue30Day = [];
for (var i = 0; i < priceGraph.values.length; i++) {
    marketValue30Day.push(priceGraph.values[i].y);
}
var transactionValue30Day = [];
for (var i = 0; i < transactionCount.values.length; i++) {
    transactionValue30Day.push(transactionCount.values[i].y);
}
var outputValue30Day = [];
for (var i = 0; i < outputValue.values.length; i++) {
    outputValue30Day.push(outputValue.values[i].y);
    }
    var hashPoolNameList = Object.keys(hashPool);
    var hashPoolValueList = Object.values(hashPool);

        // chartJS work goes here
        // Carousel options.
        $("#carouselExampleControls").carousel({
            interval: false
        });
        // Function containing all of the carousel charts.
        function generateChart() {
            // Global Chartjs values
            Chart.defaults.scale.ticks.beginAtZero = true;
            Chart.defaults.global.tooltips.enabled = true;
            Chart.defaults.global.animation.duration = 2000;
            Chart.defaults.global.animation.easing = 'easeInOutQuart';
            Chart.defaults.global.title.fontSize = 30;
    Chart.defaults.global.defaultFontColor = '#ffffff';
            // Global plugin for text inside of dought chart
            // copied from chartjs github issues https://github.com/chartjs/Chart.js/issues/78
            Chart.pluginService.register({
                afterUpdate: function(chart) {
                    if (chart.config.options.elements.center) {
                        var helpers = Chart.helpers;
                        var centerConfig = chart.config.options.elements.center;
                        var globalConfig = Chart.defaults.global;
                        var ctx = chart.chart.ctx;

                        var fontStyle = helpers.getValueOrDefault(centerConfig.fontStyle, globalConfig.defaultFontStyle);
                        var fontFamily = helpers.getValueOrDefault(centerConfig.fontFamily, globalConfig.defaultFontFamily);

                        if (centerConfig.fontSize)
                            var fontSize = centerConfig.fontSize;
                        // figure out the best font size, if one is not specified
                        else {
                            ctx.save();
                            var fontSize = helpers.getValueOrDefault(centerConfig.minFontSize, 1);
                            var maxFontSize = helpers.getValueOrDefault(centerConfig.maxFontSize, 256);
                            var maxText = helpers.getValueOrDefault(centerConfig.maxText, centerConfig.text);

                            do {
                                ctx.font = helpers.fontString(fontSize, fontStyle, fontFamily);
                                var textWidth = ctx.measureText(maxText).width;

                                // check if it fits, is within configured limits and that we are not simply toggling back and forth
                                if (textWidth < chart.innerRadius * 2 && fontSize < maxFontSize)
                                    fontSize += 1;
                                else {
                                    // reverse last step
                                    fontSize -= 1;
                                    break;
                                }
                            } while (true)
                            ctx.restore();
                        }

                        // save properties
                        chart.center = {
                            font: helpers.fontString(fontSize, fontStyle, fontFamily),
                            fillStyle: helpers.getValueOrDefault(centerConfig.fontColor, globalConfig.defaultFontColor)
                        };
                    }
                },
                afterDraw: function(chart) {
                    if (chart.center) {
                        var centerConfig = chart.config.options.elements.center;
                        var ctx = chart.chart.ctx;

                        ctx.save();
                        ctx.font = chart.center.font;
                        ctx.fillStyle = chart.center.fillStyle;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                        var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
                        ctx.fillText(centerConfig.text, centerX, centerY);
                        ctx.restore();
                    }
                },
            });
            // end of plugin
            //bitcoin color rgba(255, 153, 0, 1)
            //bitcoin accent color rgba(250, 200, 37, 1)
            // Active doughtnut chart on page load.
            var mainChart = $('#mainChart');
            var myChart = new Chart(mainChart, {
                type: 'pie',
                data: {
                    datasets: [{
            data: [10],
                        backgroundColor: [
            'rgba(255, 153, 0, 1)'
                    ],
                    borderColor: [
            'rgba(250, 200, 37, 1)'
                    ],
        borderWidth: 2
                }]
            },
            options: {
                cutoutPercentage: 80,
                responsive: true,
                maintainAspectRatio: true,
        tooltips: {
        enabled: false
        },
                elements: {
                    center: {
            text: "1 BTC = " + gStats.market_price_usd + " USD"
                    }
                    }
                }
        });
        // Line chart displaying BTC market data.
        var chart1 = $('#lineChart');
        var lineChart = new Chart(chart1, {
            type: 'line',
            data: {
        labels: dateRange,
                    datasets: [{
            backgroundColor: 'rgba(255, 153, 0, 1)',
            borderColor: 'rgba(250, 200, 37, 1)',
            data: marketValue30Day,
                    }, ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    title: {
                        display: true,
                        text: 'Market Data',
                    },
                    legend: {
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'USD',
                    },
            gridLines: {
            display: false,
            color: '#ffffff'
            }
        }],
        xAxes: [{
            gridLines: {
            display: false,
            color: '#ffffff'
            }
        }]
        }
    }
        });
        // Chart displaying different hashpools and hashrate.
        var chart2 = $('#barChart');
        var bar = new Chart(chart2, {
    type: 'horizontalBar',
            data: {
        labels: hashPoolNameList,
                datasets: [{
        borderWidth: 2,
        backgroundColor: 'rgba(255, 153, 0, 1)',
        borderColor: 'rgba(250, 200, 37, 1)',
        data: hashPoolValueList,
                }, ]
            },
            options: {
        legend: {
        display: false
        },
                responsive: true,
                maintainAspectRatio: true,
                title: {
                    display: true,
                    text: "Hash Rates of Popular Mining Pools (Higher is better)"
                },
                scales: {
                    yAxes: [{
                    scaleLabel: {
            display: false,
            labelString: 'Popular Pool'
            },
            gridLines: {
            display: false,
            color: '#ffffff'
                    }
        }],
        xAxes: [{
            scaleLabel: {
            display: true,
            labelString: 'Gigahash/sec'
            },
            gridLines: {
            display: false,
            color: '#ffffff'
            }
                    }]
                    }
                }
            });

            //Bubble showing transactions per day with bubble size relative to transaction size
    var scaledR = outputValue30Day.map(function(x) {
    return x/100000;
    });
    var xArray = dateRange;
    var yArray = transactionValue30Day;
    var rArray = scaledR;
    var bubbleData = [];
    xArray.forEach(function(e,i) {
    bubbleData.push({
        x: parseFloat(e),
        y: parseFloat(yArray[i]),
        r: parseFloat(rArray[i])
    });
    });
        var chart3 = $("#bubbleChart");
        var bubbleChar = new Chart(chart3, {
            type: 'bubble',
            data: {
        labels: dateRange,
                    datasets: [{
            borderWidth: 2,
            label: "Relative Transaction Size (1/100,000 BTC)",
            backgroundColor: 'rgba(255, 153, 0, 0.5)',
            borderColor: 'rgba(250, 200, 37, 1)',
            data: bubbleData
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    title: {
                        display: true,
                        text: "BTC Transactions per Day"
                    },
                    scales: {
                        yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: '# of Transactions per Day'
            },
            gridLines: {
            display: false,
            color: '#ffffff'
                        }
        }],
        xAxes: [{
            type: 'category',
            labels: dateRange,
            gridLines: {
            display: false,
            color: '#ffffff'
            }
                        }]
                    }
                }
            });
        }
        generateChart();
        // reset function to show each chart animation on slide
        function resetChart() {
            //Reset chart data
            $('canvas').remove();
            $('.item4').prepend('<canvas id="bubbleChart"></canvas>');
            $('.item3').prepend('<canvas id="barChart"></canvas>');
            $('.item2').prepend('<canvas id="lineChart"></canvas>');
            $('.item1').prepend('<canvas id="mainChart"></canvas>');

            generateChart();
        }
        $('#carouselExampleControls').on('slid.bs.carousel', function() {

    generateChart();
    });
    convertBTC = gStats.market_price_usd;
    $("#storeBTC").prepend(convertBTC).hide();
    }); // end of $.when().then() function
//----------------------End Blockchain API GET request----------------------

//----------------------Begin eBay API GET request on click function------
	$("#search-button").on("click", function() {

    var queryKeyword = $("#user-input").val().trim();

    var queryURL = "https://open.api.ebay.com/shopping?" +
        "callname=FindItems&" +
        "appid=GordonBl-BitBay-PRD-85d7504c4-e49e3c45&" +
        "version=1015&" +
        "siteid=0&" +
        "QueryKeywords=" +
        queryKeyword +
        "&ItemSort=BestMatch&" +
        "responseencoding=JSON&" +
        "MaxEntries=3&" +
        "callbackname=jsonpcallback";

        // Clear input on click event
        $("#user-input").val("");

    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: "jsonp"
    });

});
//--------------------End eBay API GET request on click function--------------

});
// end doc ready function
