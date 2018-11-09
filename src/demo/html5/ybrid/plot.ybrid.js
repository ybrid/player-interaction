/**
 * plot.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

const maxPlotItems = 200;
const maxPlotTimeRangeMillis = 60000;
const bandwidthPlotId = 'bandwidth-plot';
var bandwidthPlotter;

const bufferPlotId = 'buffer-plot';
var bufferPlotter;

const plotFont = '"Montserrat", sans-serif';
const plotGridColor = 'rgba(0.5, 0.5, 0.5, 0.7)';
const plotBackground = 'rgba(0, 0, 0, 0.0)';
const paperBackground = 'rgba(0, 0, 0, 0.5)';

var bandwidthDS = new PlotDataSet();
var bufferDS = new PlotDataSet();

function pushTimelineUntilNow(dataSet, length, value) {
    now = Date.now();
    deltaTMillis = maxPlotTimeRangeMillis / length;
    for (i = length; i > 0; i--) {
        dataSet.pushTuple((now - (i * deltaTMillis)), value);
    }
}

function push3DTimelineUntilNow(dataSet3D, length, dataSet) {
    now = Date.now();
    deltaTMillis = maxPlotTimeRangeMillis / length;
    for (i = length; i > 0; i--) {
        dataSet3D.push(dataSet, (now - (i * deltaTMillis)));
    }
}

function initPlots() {
    bandwidthPlotter = document.getElementById(bandwidthPlotId);
    initPlot(bandwidthPlotter, bandwidthDS, 'Bandwidth', 'bps', 0, 192000, 'hv',
            false, 64000);
    
    bufferPlotter = document.getElementById(bufferPlotId);
    initPlot(bufferPlotter, bufferDS, 'Playout Buffer', 'Seconds', 0, 5,
            'spline', true, 2);
}

function initPlotLines() {
    pushTimelineUntilNow(bandwidthDS, maxPlotItems, 0)
    pushTimelineUntilNow(bufferDS, maxPlotItems, 0)
    updatePlot(bandwidthPlotter, bandwidthDS);
    updatePlot(bufferPlotter, bufferDS);
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
        shapeVal, filled, dtickVal) {
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

function updatePlot3D(plotter, dataSet3D){
    Plotly.update(plotter, {
        z: [dataSet3D.convertToSurface()]
    });
}

function initPlot3D(plotter, dataSet3D, plotTitle, zAxisTitle, minZ, maxZ,
        shapeVal, filled, dtickVal) {
    fillVal = 'none';
    modeVal = 'lines';
    if (filled) {
        fillVal = 'tozeroy';
        // modeVal = 'none';
    }

    Plotly.react(plotter, [ {
        z : dataSet3D.convertToSurface(),
//        type : 'heatmap',
        type : 'surface',
        zmin: minZ,
        zmax: maxZ,
        colorscale : [ [ 0, 'rgb(0, 64, 0)' ], [ 0.40, 'rgb(0, 255, 0)' ],
                [ 0.55, 'rgb(255, 255, 0)' ], [ 0.8, 'rgb(255, 0, 255)' ] , [ 1.0, 'rgb(0, 255, 255)' ] ],
        colorbar : {
            thickness : 5,
// title: 'dB',
            range: [minZ, maxZ]
        },
        opacity : 1.0
    } ], {
        scene: {
            xaxis : {
                visible: false,
                gridcolor: plotGridColor,
                showaxeslabels:  false
            },
            yaxis : {
                visible: false,
                gridcolor: plotGridColor,
                showaxeslabels:  false
            },
            zaxis : {
                visible: true,
                gridwidth: 2.0,
                gridcolor: plotGridColor,
                showaxeslabels:  false,
                autorange: false,
                range: [ minZ, maxZ ],
                dtick : dtickVal,
                title: zAxisTitle
            },
        },
        font : {
            family : plotFont,
            color : '#fff'
        },
        autosize : true,
        height : 298,
        title : plotTitle,
        titlefont : {
            size : 12,
        },
        margin : {
            l : 0,
            r : 0,
            b : 7,
            t : 25,
            pad : 5
        },
        paper_bgcolor : paperBackground,
        plot_bgcolor : plotBackground
    });
}
