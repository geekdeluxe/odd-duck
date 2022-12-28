'use strict';

const totalProducts = 3;


const totalRounds = 25;
let round = 0;

function Product(name, src) {
    this.name = name;
    this.src = src;
    this.clicks = 0;
    this.views = 0;
}

let productsArray = [];


const roundKey = 'current-round';
const productsArrayKey = 'products-array';
const currentProductArrayIndicesKey = 'current-product-indices';

const resultsButton = document.getElementById('resultsButton');
const resetButton = document.getElementById('resetButton');

const repeater = productsArray.length / 2 >= productNumber ? true : false;

const productArrayIndices = {};


let currentProductArrayIndices = [];


function pageLoad() {

    defineProducts();
    defineRound();
    defineCurrentProductArrayIndices();
    defineProductIndices();
    createInitialProducts();

    if (round < totalRounds) {
        for (let img of document.getElementsByClassName('productImage')) {
            img.addEventListener('click', handleproductClick);
        }
    } else {

        document.getElementById('resultsButton').style.border = '0.50rem solid #eed6d3';
    }
    resultsButton.addEventListener('click', viewResults);
    resetButton.addEventListener('click', resetSurvey);
}


function defineProducts() {
    if (getLocalStorage(productsArrayKey)) {
        productsArray = getLocalStorage(productsArrayKey);
    } else {
        productsArray = [
            new Product('breakfast', './img/breakfast.jpg'),
            new Product('scissors', './img/scissors.jpg'),
            new Product('unicorn', './img/unicorn.jpg'),
        ];
        setLocalStorage(productsArrayKey, productsArray);
    }
}


function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}


function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}


function defineRound() {
    if (getLocalStorage(roundKey)) {
        round = getLocalStorage(roundKey);
    } else {
        round = 0;
        setLocalStorage(roundKey, round);
    }
}


function defineCurrentProductArrayIndices() {
    if (getLocalStorage(currentProductArrayIndicesKey)) {
        currentProductArrayIndices = getLocalStorage(currentProductArrayIndicesKey);
    } else {
        currentProductArrayIndices = [];
        setLocalStorage(currentProductArrayIndicesKey, currentProductArrayIndices);
    }
}


function defineProductIndices() {
    for (let i = 0; i < productsArray.length; i++) {
        let productName = productsArray[i].name;
        productArrayIndices[productName] = i;
    }
}


function createFirstProduct() {

    const container = document.getElementById('productDisplaySection');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < productNumber; i++) {
        let imgElement = document.createElement('img');
        imgElement.className = 'productImage';
        fragment.appendChild(imgElement);
    }
    container.appendChild(fragment);

    if (currentProductArrayIndices.length === 0) {
        renderProducts();
    } else {
        setCurrentProducts();
    }
}


function renderProduct() {

    let newProductArrayIndices = [];
    const imgArray = document.getElementsByClassName('productImage');
    for (let i = 0; i < productNumber; i++) {
        let randomIndex = getRandomIndex();

        if (REPEATER) {
            while (currentProductArrayIndices.includes(randomIndex) || newProductArrayIndices.includes(randomIndex)) {
                randomIndex = getRandomIndex();
            }

        } else {
            while (newProductArrayIndices.includes(randomIndex)) {
                randomIndex = getRandomIndex();
            }
        }

        let newProduct = productsArray[randomIndex];
        updateImageElement(imgArray[i], newProduct);

        newProduct.views++;

        newProductArrayIndices[i] = randomIndex;
    }
    currentProductArrayIndices = newProductArrayIndices;

    setLocalStorage(currentProductArrayIndicesKey, currentProductArrayIndices);
}

/
function getRandomIndex() {
    return Math.floor(Math.random() * productsArray.length);
}


function updateImageElement(imgElement, product) {
    imgElement.id = product.name;
    imgElement.src = product.src;
    imgElement.alt = product.name;
    imgElement.title = product.name;
}


function setCurrentProducts() {
    const imgArray = document.getElementsByClassName('productImage');
    for (let i = 0; i < PRODUCTNUMBER; i++) {
        let productsIdx = currentProductArrayIndices[i];
        let newProduct = productsArray[productsIdx];
        updateImageElement(imgArray[i], newProduct);

    }
}


function ProductClickHandler(event) {
    round++;
    let targetIndex = productArrayIndices[event.target.id];
    productsArray[targetIndex].clicks++;


    setLocalStorage(productsArrayKey, productsArray);
    setLocalStorage(roundKey, round);

    if (round === totalRounds) {

        document.getElementById('resultsButton').style.border = '0.50rem solid #eed6d3';
        for (let img of document.getElementsByClassName('productImage')) {
            img.removeEventListener('click', ProductClickHandler);
        }
        return;
    }

    renderProducts();
}


function viewResults() {

    const ul = document.getElementById('resultsList');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < productsArray.length; i++) {
        let li = document.createElement('li');
        let viewNumber = productsArray[i].views;
        let clickNumber = productsArray[i].clicks;

        let viewTimes = viewNumber === 1 ? 'time' : 'times';
        let clickTimes = clickNumber === 1 ? 'time' : 'times';
        li.innerText = `${productsArray[i].name} was viewed ${viewNumber} ${viewTimes}, and was clicked ${clickNumber} ${clickTimes}.`;
        fragment.appendChild(li);
    }
    ul.replaceChildren(fragment);


    if (round === totalRounds) {

        createResultsChart();
        resultsButton.removeEventListener('click', viewResults);
    }
}


function createResultsChart() {
    Chart.defaults.font.family = '"Helvetica, serif"';
    Chart.defaults.font.size = '18';
    Chart.defaults.color = '#000';
    const ctx = document.getElementById('resultsChart');
    const resultsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productsArray.map(row => row.name),
            datasets: [{
                label: 'Number of Clicks',
                data: productsArray.map(row => row.clicks),
                backgroundColor: [
                    'rgba(69,39,14)'
                ],
                borderColor: [
                    'rgba(199,164,110)',
                ],
                borderWidth: 2
            },
            {
                label: 'Number of Views',
                data: productsArray.map(row => row.views),
                backgroundColor: [
                    'rgba(102,139,97)'
                ],
                borderColor: [
                    'rgba(199,164,110)',
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


function resetSurvey() {
    localStorage.clear();

    let chartStatus = Chart.getChart('resultsChart');
    if (chartStatus !== undefined) {
        chartStatus.destroy();
    }

    const resultsList = document.getElementById('resultsList');
    removeAllChildNodes(resultsList);

    const productDisplaySection = document.getElementById('productDisplaySection');
    removeAllChildNodes(productDisplaySection);

    document.getElementById('resultsButton').style.border = '';

    resetButton.removeEventListener('click', resetSurvey);

    pageLoad();
}


function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


pageLoad();
