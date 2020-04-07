function isValue(value) {
    return !(value == null || value === undefined || value === '')
}

function applyZoom(zoom, options) {
    options.topPadding *= zoom;
    options.leftPadding *= zoom; // Подумать как расчитать от параметров вертикальной оси
    options.hGrid.step *=  zoom;
    options.hGrid.offset *= zoom;
    options.hGrid.dataLabels.style.fontSize *= zoom;
    options.hGrid.dataLabels.style.offset *= zoom; // Подумать о замене на расчетный от leftPadding
    options.vGrid.step *= zoom;
    options.vGrid.offset *= zoom;
    options.vGrid.dataLabels.style.fontSize *= zoom;
    options.vGrid.dataLabels.style.offset *= zoom;
    options.vGrid.dataLabels.style.height *= zoom;
    return options;
}

function setAttributeSVG(element, attributeName, value) {
    if(isValue(value)){
        element.setAttributeNS(null, attributeName, value);
    }
}

function createLine(x1, y1, x2, y2, width, className) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    setAttributeSVG(element,'class', className);
    setAttributeSVG(element, 'x1', x1);
    setAttributeSVG(element, 'y1', y1);
    setAttributeSVG(element, 'x2', x2);
    setAttributeSVG(element, 'y2', y2);
    setAttributeSVG(element, 'stroke-width', width);
    return element;
}

function createRect(x, y, width, height, style) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    setAttributeSVG(element,'class', style.className);
    setAttributeSVG(element, 'x', x);
    setAttributeSVG(element, 'y', y);
    setAttributeSVG(element, 'width', width);
    setAttributeSVG(element, 'height', height);
    return element;
}

function createText(text, x, y, style) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    var transform = 'translate(' + (style.offset) + ')'
    element.textContent = text;
    setAttributeSVG(element, 'font-size', style.fontSize);
    setAttributeSVG(element, 'class', style.className);
    setAttributeSVG(element, 'x', x);
    setAttributeSVG(element, 'y', y);
    setAttributeSVG(element, 'stroke', style.color);
    setAttributeSVG(element, 'text-anchor', style.anchor);
    setAttributeSVG(element, 'transform', transform);
    return element;
}

function createTSpan(text, x, y, dx, dy, style) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    element.textContent = text;
    setAttributeSVG(element, 'class', style.className);
    setAttributeSVG(element, 'x', x);
    setAttributeSVG(element, 'y', y);
    setAttributeSVG(element, 'dx', dx);
    setAttributeSVG(element, 'dy', dy);
    setAttributeSVG(element, 'text-anchor', style.anchor);
    return element;
}

function drawHGrid(options) {
    var gridLength = options.vGrid.step * (options.vGrid.count - 1) 
        + options.hGrid.extend
        + options.vGrid.offset;
    var x = options.topPadding 
        + options.vGrid.dataLabels.style.height 
        + options.hGrid.offset;
    var y = options.leftPadding;

    var axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var axisLabelText = createText(
            null, 
            options.leftPadding, 
            x - options.hGrid.step  + (options.hGrid.step * .1),
            options.hGrid.dataLabels.style);
    
    for(var i = 0; i < options.hGrid.count; i++) {
        var gridLine = createLine(
            y, 
            x + options.hGrid.step * i, 
            y + gridLength, 
            x + options.hGrid.step * i,
            options.hGrid.style.width,
            options.hGrid.style.className);
        axisG.appendChild(gridLine);

        var tSpan = createTSpan(
            options.hGrid.dataLabels.labels[i], 
            0, 
            null, 
            null, 
            options.hGrid.step,
            options.hGrid.dataLabels.style);
        axisLabelText.appendChild(tSpan);
    }
    axisG.appendChild(axisLabelText);
    return axisG;
}

function drawVGrid(options) { 
    var x = options.leftPadding + options.vGrid.offset;
    var y = options.topPadding + options.vGrid.dataLabels.style.height;
    var step = options.vGrid.step;
    var gridLength = options.hGrid.step * (options.hGrid.count - 1) + options.hGrid.offset;

    var axisG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for(var i = 0; i < options.vGrid.count; i++) {
        var gridLine = createLine(
            x + step * i, y, x + step * i,
            y + gridLength, 
            options.vGrid.style.width,
            options.vGrid.style.className);
        axisG.appendChild(gridLine);
    }
    return axisG;
}

function createRectLabel(x, y, width, height, title, style) {
    var labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var labelRect = createRect(x, y, width, height, style);
    var labelText = createText(title, x + width/2, y + height/2, style);
    labelG.appendChild(labelRect);
    labelG.appendChild(labelText);
    return labelG;
}

function drawVAxisLabels(x, y, options) {
    var vAxisLabelsG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    for(i = 0; i < options.vGrid.dataLabels.labels.length; i++) {
        var rectLabel = createRectLabel(
                x + options.vGrid.step * i, 
                y, 
                options.vGrid.step, 
                options.vGrid.dataLabels.style.height,
                options.vGrid.dataLabels.labels[i], 
                options.vGrid.dataLabels.style);
        vAxisLabelsG.appendChild(rectLabel);
    }
    return vAxisLabelsG;
}

function drawGrid(options) {
    var x = options.leftPadding;
    var y = options.topPadding + options.vGrid.dataLabels.style.height + options.hGrid.offset;
    
    var gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    hGridG = drawHGrid(options);
    var gridLine = createLine(
        x,
        y + options.hGrid.step * options.hAxis.position, 
        x + options.vGrid.offset + options.hGrid.extend + options.vGrid.step * (options.vGrid.count - 1),
        y + options.hGrid.step * options.hAxis.position,
        options.hAxis.style.width,
        options.hAxis.style.className);
    hGridG.appendChild(gridLine);
    gridG.appendChild(hGridG);

    vGridG = drawVGrid(options); 
    var gridLine = createLine(
        x + options.vGrid.step * options.vAxis.position,
        y, 
        x + options.vGrid.step * options.vAxis.position,
        y + options.hGrid.step * (options.hGrid.count - 1) + options.hGrid.offset, 
        options.vAxis.style.width,
        options.vAxis.style.className);
    vGridG.appendChild(gridLine);
    gridG.appendChild(vGridG);

    var vTopLabelsG = drawVAxisLabels(
        options.leftPadding, 
        y - options.vGrid.dataLabels.style.height, 
        options);
    gridG.appendChild(vTopLabelsG);
    
    var vBottomLabelsG = drawVAxisLabels(
        options.leftPadding, 
        y + options.hGrid.step * (options.hGrid.count - 1), 
        options);
    gridG.appendChild(vBottomLabelsG);

    return gridG;
}

function drawChart(chartDiv, data, options) {
    var zoom = 1;
    if(!isValue(options)) {
        options = {
            height: '100%',
            width: '100%',
            topPadding: 60,
            leftPadding: 20, // Подумать как расчитать от параметров вертикальной оси
            chartArea: {
                style: {
                    width: 3,
                    color: 'gray',
                    className: 'rectChart'
                }                
            },
            hAxis: {
                position: 10,
                style: {
                    width: 3,
                    color: 'gray',
                    className: 'axisLine'
                }
            },
            vAxis: {
                position: 0,
                style: {
                    width: 3,
                    color: 'gray',
                    className: 'axisLine'
                }
            },
            hGrid: {
                step: 10,
                count: 21,
                offset: 0,
                style: {
                    width: 1,
                    color: 'gray',
                    className: 'gridLine'
                },
                dataLabels: {
                    labels: ['+100', '+90','+80','+70','+60','+50','+40','+30','+20','+10',
                    '0', '-10', '-20', '-30', '-40', '-50', '-60', '-70', '-80', '-90', '-100'],
                    style: {
                        fontSize: 5,
                        anchor: 'end',
                        offset: 15, // Подумать о замене на расчетный от leftPadding
                        className: ''
                    }
                }
            },
            vGrid: {
                step: 30,
                count: 10,
                offset: 15,
                style: {
                    width: 1,
                    color: 'gray',
                    className: 'gridLine'
                },
                dataLabels: {
                    labels: ['A','B','C','D','E','F','G','H','I', 'J'],
                    style: {
                        fontSize: 5,
                        anchor: 'middle',
                        offset: 0,
                        height: 20,
                        className: 'rectLabel'
                    }
                }
            },
            graph: {
                line: {
                    width: 3,
                    color: "blue",
                    className: ''
                },
                point: {
                    radius: 10,
                    color: 'red',
                },
                label: {
                    style: {
                        fontSize: 5,
                        anchor: 'start',
                        className: ''
                    }
                }
            }
        }
    }
    
    applyZoom(zoom, options);

    chartWidth = options.vGrid.step * options.vGrid.count 
            + options.leftPadding;
    chartHeight = options.hGrid.step * (options.hGrid.count -1) 
            + options.topPadding + options.vGrid.dataLabels.style.height * 2;

    var chartSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    setAttributeSVG(chartSVG,  'version', '1.1');
    setAttributeSVG(chartSVG,  'width', options.width);
    setAttributeSVG(chartSVG,  'height', options.height);
    setAttributeSVG(chartSVG,  'viewBox', '0 0 ' + chartWidth + ' '  + chartHeight);
    setAttributeSVG(chartSVG,  'stroke', options.chartArea.style.color);
    setAttributeSVG(chartSVG,  'stroke-width', options.chartArea.style.width);

    var mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var mainRect = createRect(0, 0, '100%', '100%', options.chartArea.style);

    mainG.appendChild(mainRect);

    mainG.appendChild(drawGrid(options));

    var graphG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    var graphPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    graphG.appendChild(graphPath);

    strPath ='M';
    for(let i = 0; i < data.length; i++) {
        let x = ((i + options.vAxis.position) * options.vGrid.step + options.leftPadding + options.vGrid.offset);
        let y = options.hAxis.position * options.hGrid.step 
            - data[i] * options.hGrid.step/(options.hGrid.count - options.hAxis.position - 1) 
            + options.topPadding + options.vGrid.dataLabels.style.height + options.hGrid.offset;
        strPath = strPath + x + ' ' + y + ' ';
        var graphPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        setAttributeSVG(graphPoint, 'cx', x);
        setAttributeSVG(graphPoint, 'cy', y);
        setAttributeSVG(graphPoint, 'r', options.graph.point.radius);
        setAttributeSVG(graphPoint, 'fill', options.graph.point.color);
        graphG.appendChild(graphPoint);
        
        graphG.appendChild(createText(data[i], x + options.graph.point.radius/2, y, options.graph.label.style));
    }

    setAttributeSVG(graphPath, 'd', strPath);
    setAttributeSVG(graphPath, 'fill-opacity', 0);
    setAttributeSVG(graphPath, 'stroke', options.graph.line.color);
    setAttributeSVG(graphPath, 'stroke-width', options.graph.line.width);
    
    mainG.appendChild(graphG);

    chartSVG.appendChild(mainG);
    chartDiv.appendChild(chartSVG);
}

