/**
 * plot.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

const maxPlotItems = 200;
const maxPlotTimeRangeMillis = 120000;

const bandwidthPlotId = 'bandwidth-plot';
var bandwidthPlotter;

const bufferPlotId = 'buffer-plot';
var bufferPlotter;

const avgLevelPlotId = 'level-plot';
var levelPlotter;

const plotFont = '"Montserrat", sans-serif';
const plotGridColor = 'rgba(0.5, 0.5, 0.5, 0.7)';
const plotBackground = 'rgba(0, 0, 0, 0.0)';
const paperBackground = 'rgba(0, 0, 0, 0.5)';

var bandwidthDS = new PlotDataSet();
var bufferDS = new PlotDataSet();
var levelDS = new PlotDataSet();
var lastLevelTS = 0;

function pushTimelineUntilNow(dataSet, length, value) {
    now = Date.now();
    deltaTMillis = maxPlotTimeRangeMillis / length;
    for (i = length; i > 0; i--) {
        dataSet.pushTuple((now - (i * deltaTMillis)), value);
    }
}

function initPlots() {
    bandwidthPlotter = document.getElementById(bandwidthPlotId);
    initPlot(bandwidthPlotter, bandwidthDS, 'Bandwidth', 'bps', 0, 192000, 'hv',
            false, 64000);
    
    bufferPlotter = document.getElementById(bufferPlotId);
    initPlot(bufferPlotter, bufferDS, 'Playout Buffer', 'Seconds', 0, 5,
            'spline', true, 2);

    levelPlotter = document.getElementById(avgLevelPlotId);
    initPlot(levelPlotter, levelDS, 'Volume', 'Level', 0, 0.04,
            'vh', false, 0.02, true, false);
}

function initPlotLines() {
    pushTimelineUntilNow(bandwidthDS, maxPlotItems, 0)
    pushTimelineUntilNow(bufferDS, maxPlotItems, 0)
    pushTimelineUntilNow(levelDS, maxPlotItems, 0)
    updatePlot(bandwidthPlotter, bandwidthDS);
    updatePlot(bufferPlotter, bufferDS);
    updatePlot(levelPlotter, levelDS);
}

function pushBandwidthPlotItem(item) {
    now = Date.now();
    minimumT = now - maxPlotTimeRangeMillis;
    bandwidthDS.pushTuple(now, item);
    while (bandwidthDS.getXData()[0] < minimumT) {
        bandwidthDS.shiftTuple();
    }
    updatePlot(bandwidthPlotter, bandwidthDS);
}

function pushBufferPlotItem(item) {
    now = Date.now();
    minimumT = now - maxPlotTimeRangeMillis;
    bufferDS.pushTuple(now, item);
    while (bufferDS.getXData()[0] < minimumT) {
        bufferDS.shiftTuple();
    }
    updatePlot(bufferPlotter, bufferDS);
}

function pushLevelPlotItem(levels) {
    now = Date.now();
    if(lastLevelTS == 0){
        lastLevelTS = now;
        return;
    }
    range = now - lastLevelTS;
    delta = Math.round(range / levels.length);
    // deltaHalf = Math.round(delta / 2);
    ts = lastLevelTS;
    for(value of levels){
        level = parseFloat(value).toFixed(5);
        // ts += deltaHalf;
        ts += delta;
        levelDS.pushTuple(ts, level);
        // negativeLevel = level * -1;
        // ts += deltaHalf;
        // levelDS.pushTuple(ts, negativeLevel);
    }
    lastLevelTS = ts;
    
    minimumT = now - maxPlotTimeRangeMillis;
    while (levelDS.getXData()[0] < minimumT) {
        levelDS.shiftTuple();
    }
    updatePlot(levelPlotter, levelDS);
}

function updatePlot(plotter, dataSet){
    Plotly.update(plotter, {
        x: [dataSet.getXData()],
        y: [dataSet.getYData()]
   });
}

function updatePlotBars(plotter, dataSet, minY = 0){
    Plotly.update(plotter, {
        x: [dataSet.getXData()],
        y: [dataSet.getYData().map( x => x - minY)]
   });
}
function initPlot(plotter, dataSet, plotTitle, yAxisTitle, minY, maxY,
        shapeVal, filled, dtickVal, autoY = false, showTick = true) {
    var layout = {
            font : {
                family : plotFont,
                color : '#fff'
            },
            autosize : true,
            height : 98,
            title : plotTitle,
            titlefont : {
                size : 12,
            },
            xaxis : {
                gridcolor : plotGridColor,
                gridwidth : 0.5,
                showticklabels : false,
                zeroline : false,
                showline : false
            },
            yaxis : {
                gridcolor : plotGridColor,
                gridwidth : 0.5,
                title : yAxisTitle,
                titlefont : {
                    size : 10,
                },
                range : [ minY, maxY ],
                tickfont : {
                    size : 8,
                },
                dtick : dtickVal,
                zeroline : true,
                zerolinewidth : 0.5,
                zerolinecolor : '#7f7f7f',
                showline : false
            },
            margin : {
                l : 40,
                r : 0,
                b : 7,
                t : 25,
                pad : 5
            },
            paper_bgcolor : paperBackground,
            plot_bgcolor : plotBackground
        };
    
    layout.yaxis.autotick = autoY;
    layout.yaxis.autorange = autoY;
    layout.yaxis.showticklabels = showTick;
    
    fillVal = 'none';
    modeVal = 'lines';
    if (filled) {
        fillVal = 'tozeroy';
        // modeVal = 'none';
    }
    Plotly.react(plotter, [ {
        x : dataSet.getXData(),
        y : dataSet.getYData(), // clone to trigger reactive update
        mode : modeVal,
        fill : fillVal,
        fillcolor : 'rgba(0, 1.0, 1.0, 0.2)',
        line : {
            color : '#0ff',
            width : 1.0,
            shape : shapeVal
        }
    } ], layout);
    
}

function initPlotBars(plotter, dataSet, plotTitle, yAxisTitle, minY, maxY,
        shapeVal, filled, dtickVal) {
    fillVal = 'none';
    modeVal = 'lines';
    if (filled) {
        fillVal = 'tozeroy';
        // modeVal = 'none';
    }
    Plotly.react(plotter, [ {
        x : dataSet.getXData(),
        y : dataSet.getYData().map( x => x - minY),
        mode : modeVal,
        type : 'bar',
        base: minY,
        marker : {
            color : 'rgba(0, 1.0, 0, 0.6)'
        // line: {
        // color: '#0f0',
        // width: 1.0
        // }
        },
        fill : fillVal,
        fillcolor : 'rgba(0, 1.0, 0, 0.6)',
        line : {
            color : '#0f0',
            width : 1.0,
            shape : shapeVal
        }
    } ], {
        font : {
            family : plotFont,
            color : '#fff'
        },
        autosize : true,
        height : 98,
        title : plotTitle,
        titlefont : {
            size : 12,
        },
        xaxis : {
            gridcolor : plotGridColor,
            gridwidth : 0.5,
            showticklabels : false,
            zeroline : false,
            showline : false
        },
        yaxis : {
            gridcolor : plotGridColor,
            gridwidth : 0.5,
            dtick : dtickVal,
            title : yAxisTitle,
            titlefont : {
                size : 10,
            },
            range : [ minY, maxY ],
            showticklabels : true,
            tickfont : {
                size : 8,
            },
            zeroline : true,
            zerolinewidth : 0.5,
            zerolinecolor : '#7f7f7f',
            showline : false,
        },
        margin : {
            l : 40,
            r : 0,
            b : 7,
            t : 25,
            pad : 5
        },
        paper_bgcolor : paperBackground,
        plot_bgcolor : plotBackground
    });
}

