function isValue(value) {
    return !(value == null || value === undefined)
}

function setAttributeSVG(element, attributeName, value) {
    if(isValue(value)){
        element.setAttributeNS(null, attributeName, value);
    }
}

function createLine(x1, y1, x2, y2, className) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    setAttributeSVG(element,'class', className);
    setAttributeSVG(element, 'x1', x1);
    setAttributeSVG(element, 'y1', y1);
    setAttributeSVG(element, 'x2', x2);
    setAttributeSVG(element, 'y2', y2);
    return element;
}

function createRect(x, y, width, height, className) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    setAttributeSVG(element,'class', className);
    setAttributeSVG(element, 'x', x);
    setAttributeSVG(element, 'y', y);
    setAttributeSVG(element, 'width', width);
    setAttributeSVG(element, 'height', height);
    return element;
}

function createText(text, x, y, transform, className, fontSize, textAnchor) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    element.textContent = text;
    setAttributeSVG(element, 'font-size', fontSize);
    setAttributeSVG(element, 'class', className);
    setAttributeSVG(element, 'x', x);
    setAttributeSVG(element, 'y', y);
    setAttributeSVG(element, 'text-anchor', textAnchor);
    setAttributeSVG(element, 'transform', transform);
    return element;
}

function createTSpan(text, x, y, dx, dy, textAnchor, className) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    element.textContent = text;
    setAttributeSVG(element, 'class', className);
    setAttributeSVG(element, 'x', x);
    setAttributeSVG(element, 'y', y);
    setAttributeSVG(element, 'dx', dx);
    setAttributeSVG(element, 'dy', dy);
    setAttributeSVG(element, 'text-anchor', textAnchor);
    return element;
}

function drawHGrid(options) {
    var zoom = options.zoom;
    var x = options.leftPadding * zoom;
    var y = (options.topPadding + options.hGrid.offset) * zoom;
    var step = options.hGrid.step * zoom;
    var gridLength = (options.vGrid.step * (options.vGrid.count - 1) + options.vGrid.offset) * zoom;
    var labelFontSize = options.hGrid.labelFontSize * zoom;

    var axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var axisLabelText = createText(
            null, 
            x, 
            y - step  + (step * .1),
            'translate(' + (3 * zoom) + ')', 
            options.hGrid.labelClassName, 
            labelFontSize);
    
    for(var i = 0; i < options.hGrid.count; i++) {
        var gridLine = createLine(
            x, 
            y + step * i, 
            x + gridLength, 
            y + step * i, 
            options.hGrid.className);
        axisG.appendChild(gridLine);

        var tSpan = createTSpan(options.hGrid.labels[i], 1, null, null, step, 'end');
        axisLabelText.appendChild(tSpan);
    }
    axisG.appendChild(axisLabelText);
    return axisG;
}

function drawVGrid(options) { 
    var zoom = options.zoom;
    var x = (options.leftPadding + options.vGrid.offset) * zoom;
    var y = options.topPadding * zoom;
    var step = options.vGrid.step * zoom;
    var gridLength = (options.hGrid.step * (options.hGrid.count - 1) + options.hGrid.offset) * zoom;

    var axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for(var i = 0; i < options.vGrid.count; i++) {
        var gridLine = createLine(
            x + step * i, y, x + step * i,
            y + gridLength, 
            options.vGrid.className);
        axisG.appendChild(gridLine);
    }
    return axisG;
}

function createRectLabel(x, y, width, height, title, className, fontSize) {
    var labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var labelRect = createRect(x, y, width, height, className);
    var labelText = createText(title, x + width/2, y + height/2, null, className, fontSize);
    labelG.appendChild(labelRect);
    labelG.appendChild(labelText);
    return labelG;
}

function drawVAxisLabels(x, y, options) {
    var zoom = options.zoom;
    var step = options.vGrid.step * zoom;
    var labelHeight = options.vGrid.labelHeight * zoom;

    var vAxisLabelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for(i = 0; i < options.vGrid.labels.length; i++) {
        var rectLabel = createRectLabel(
                x + step * i, 
                y, 
                step, 
                labelHeight, 
                options.vGrid.labels[i], 
                options.vGrid.labelClassName,
                options.vGrid.labelFontSize * zoom,
                'middle');
        vAxisLabelsG.appendChild(rectLabel);
    }
    return vAxisLabelsG;
}

function drawGrid(options) {
    var zoom = options.zoom;
    var gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    hGridG = drawHGrid(options);
    var gridLine = createLine(
        zoom * options.leftPadding,
        zoom * (options.topPadding + options.hGrid.offset + options.hGrid.step * options.hAxis.position), 
        zoom * (options.leftPadding + options.vGrid.step * (options.vGrid.count - 1) + options.vGrid.offset),
        zoom * (options.topPadding + options.hGrid.offset + options.hGrid.step * options.hAxis.position),
        options.hAxis.className);
    hGridG.appendChild(gridLine);
    gridG.appendChild(hGridG);

    vGridG = drawVGrid(options); 
    var gridLine = createLine(
        zoom * (options.leftPadding + options.vGrid.step * options.vAxis.position),
        zoom * options.topPadding, 
        zoom * (options.leftPadding + options.vGrid.step * options.vAxis.position),
        zoom * (options.topPadding + options.hGrid.step * (options.hGrid.count - 1) + options.hGrid.offset), 
        options.vAxis.className);
    vGridG.appendChild(gridLine);
    gridG.appendChild(vGridG);

    var vTopLabelsG = drawVAxisLabels(
            options.leftPadding * zoom, 
            (options.topPadding - options.vGrid.labelHeight) * zoom, 
            options);
    gridG.appendChild(vTopLabelsG);

    var vBottomLabelsG = drawVAxisLabels(
        options.leftPadding * zoom, 
        (options.hGrid.step * (options.hGrid.count - 1) + options.topPadding) * zoom, 
        options);
    gridG.appendChild(vBottomLabelsG);

    return gridG;
}

function drawChart(chartDiv, data, options) {
    if(!isValue(options)) {
        options = {
            height: 1300,
            width: 1200,
            zoom: 20,
            topPadding: 12,
            leftPadding: 4,
            chartArea: {
                className: 'rectChart',
                height: 60,
                width: 55
            },
            hAxis: {
                className: 'axisLine',
                position: 10,
                labelSize: 1
            },
            vAxis: {
                className: 'gridLine',
                position: 0,
                labelSize: 4
            },
            hGrid: {
                className: 'gridLine',
                width: 1,
                step: 2,
                count: 21,
                offset: 0,
                labelClassName: 'gridLabel',
                labelFontSize: 1,
                labels: ['+100', '+90','+80','+70','+60','+50','+40','+30','+20','+10',
                        '0', '-10', '-20', '-30', '-40', '-50', '-60', '-70', '-80', '-90', '-100']
            },
            vGrid: {
                className: 'gridLine',
                width: 1,
                step: 6,
                count: 10,
                offset: 3,
                labelHeight: 4,
                labelClassName: 'rectLabel',
                labelFontSize: 1,
                labels: ['A','B','C','D','E','F','G','H','I', 'J']
            }
        }
    }

    var chartSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    setAttributeSVG(chartSVG,  'version', '1.1');
    setAttributeSVG(chartSVG,  'width', options.width);
    setAttributeSVG(chartSVG,  'height', options.height);
    setAttributeSVG(chartSVG,  'viewBox', '0 0 1300 1200');

    var mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var mainRect = createRect(0, 0, '100%', '100%', options.chartArea.className);

    mainG.appendChild(mainRect);

    mainG.appendChild(drawGrid(options));

    chartSVG.appendChild(mainG);
    chartDiv.appendChild(chartSVG);
}

