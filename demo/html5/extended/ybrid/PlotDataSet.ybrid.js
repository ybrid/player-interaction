/**
 * PlotDataSet.ybrid.js
 * 
 * @author Sebastian A. Weiß (C) 2018 nacamar GmbH
 */

function PlotDataSet(){
    this.dataX = new Array();
    this.dataY = new Array();
}

PlotDataSet.prototype.pushTuple = function(x, y){
    this.dataX.push(x);
    this.dataY.push(y);
}

PlotDataSet.prototype.shiftTuple = function(){
    this.dataX.shift();
    this.dataY.shift();
}

PlotDataSet.prototype.clear = function(){
    this.dataX.length = 0;
    this.dataY.length = 0;
}

PlotDataSet.prototype.getXData = function(){
    return this.dataX;
}

PlotDataSet.prototype.getYData = function(){
    return this.dataY;
}
