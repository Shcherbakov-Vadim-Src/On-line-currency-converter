let buttonCurrencyLeft = document.querySelectorAll('.leftCurrency'); // получение левых кнопок
let buttonCurrencyRight = document.querySelectorAll('.rightCurrency'); // получение правых кнопок

let colorButtonsRight = document.querySelectorAll('.colorButRight'); // они же для смены цвета
let colorButtonsLeft = document.querySelectorAll('.colorButLeft'); //  они же для смены цвета

let selectLeft = document.querySelector('.selectLeft');  //    получение левого списка валют
let selectRight = document.querySelector('.selectRight'); //  правого списка валют

let inputLeft = document.querySelector('.inputLeft');  // левый инпут рассчета
let inputRight = document.querySelector('.inputRight'); // правый инпут

let crossRateLeft = document.querySelector('.exchangeLeft');    // отображение левого кросс-курса
let crossRateRight = document.querySelector('.exchangeRight'); // отображение правого кросс-курса

let arrows = document.querySelector('.arrows');   // кнопка реверса

let loadScreen = document.querySelector('.loadingScreen');   // табло долгой загрузки
loadScreen.style.display = 'none';          // спрячем с глаз строку загрузки

let leftCurrency = 'RUB';   // валюта по умолчанию (по ТЗ)
let rightCurrency = 'USD';


// -------------------------------------------------------------------------- // 
//                       ЗАПОЛНЕНИЕ СПИСКА ВАЛЮТ                              //
// -------------------------------------------------------------------------- //

function selectСurrency() {                   // вставляем значения в селект, удаляя повтор валют
    fetch('https://api.ratesapi.io/api/latest?HTTP/2')
        .then(response => response.json())
        .then(data => {
            delete data.rates.USD;
            delete data.rates.GBP;
            delete data.rates.EUR;
            delete data.rates.RUB;
            for (let elem in data.rates){            
            selectLeft.append(createOption(elem));
            selectRight.append(createOption(elem));      
        }
    });
}

function createOption(elem) {                   // создаем перечень валют - элементы списка "option"
    let newOptions = document.createElement('option');
    newOptions.innerHTML = `${elem}`;
    newOptions.value = `${elem}`;
    return newOptions;
}

selectСurrency();            // заполнение списка валют в селекты

// -------------------------------------------------------------------------- // 
//                  ПОЛУЧЕНИЕ ЗНАЧЕНИЙ ИЗ ЛЕВОЙ ЧАСТИ                         //
// -------------------------------------------------------------------------- //


selectLeft.addEventListener('change', (event) => {  //  обработка по смене селекта левого
    leftCurrency = event.target.value;
    getMeCurrencyValue();
    colorsButtons(event, 'true')
});

buttonCurrencyLeft.forEach((item) => {             // расчет курса по левым кнопкам
    item.addEventListener('click', (event) => {
        leftCurrency = event.target.innerText;
        getMeCurrencyValue();
        colorsButtons(event, 'true')
    })
});

inputLeft.addEventListener('input', (event) => {     //  смена значений левого инпута
    inputRight.value = +(event.target.value*arrayValueSecond[0][rightCurrency]).toFixed(4);
})


// -------------------------------------------------------------------------- // 
//                  ПОЛУЧЕНИЕ ЗНАЧЕНИЙ ИЗ ПРАВОЙ ЧАСТИ                        //
// -------------------------------------------------------------------------- //


selectRight.addEventListener('change', (event) => {   // обработка правого селекта
    rightCurrency = event.target.value;
    getMeCurrencyValue();
    colorsButtons(event);
});

buttonCurrencyRight.forEach((item) => {        // расчет курса по правым кнопкам
    item.addEventListener('click', (event) => {
        rightCurrency = event.target.innerText;
        getMeCurrencyValue();
        colorsButtons(event);
    })
});

inputRight.addEventListener('input', (event) => {      //  смена правого инпута
    inputLeft.value = +(event.target.value*arrayValueSecond[1][leftCurrency]).toFixed(4);
})


// -------------------------------------------------------------------------- // 
//                 ОСНОВНОЙ FETCH И РАСЧЕТ КОНВЕРТАЦИИ                        //
// -------------------------------------------------------------------------- //

getMeCurrencyValue();                       // start function

function getMeCurrencyValue() {             // основная функция расчета конвертации
    if (leftCurrency === rightCurrency) {        
        arrayValueFirst = [{[leftCurrency]:1}, {[rightCurrency]:1}];        
        reverseSubFunction(arrayValueFirst);        
    } else {    
        let promiseConverter = new Promise((resolve) => {            
            fetch(`https://api.ratesapi.io/api/latest?base=${leftCurrency}&symbols=${rightCurrency}`)
                .then(response => response.json())
                .then(data => {                
                    resolve(data.rates)                    
                })            
        });
        
        let promiseReverseConverter = new Promise((resolve) => {
            fetch(`https://api.ratesapi.io/api/latest?base=${rightCurrency}&symbols=${leftCurrency}`)
                .then(response => response.json())
                .then(reversedata => {                
                    resolve(reversedata.rates)
            })
        });
        
        let id = setTimeout(() => {
            loadScreenFunc()
        }, 500);        
        Promise.all([promiseConverter, promiseReverseConverter])
            .then((arrayValueFirst) => {reverseSubFunction(arrayValueFirst); clearTimeout(id); unLoadScreenFunc()})
    }
}

function loadScreenFunc() {            // функция отображения загрузки при плохом интернете
    loadScreen.style.display = 'flex'; 
}

function unLoadScreenFunc() {         // отмена функции
    loadScreen.style.display = 'none';    
}

function colorsButtons(event, flag) {       // функция смена цветов у кнопок
    if (flag === 'true') {    
        colorButtonsLeft.forEach((item) => {
            item.classList.remove('buttonColor')
        })
        event.target.classList.add('buttonColor')
    } else {            
        colorButtonsRight.forEach((item) => {
            item.classList.remove('buttonColor');
            })
            event.target.classList.add('buttonColor');
    }
}

// -------------------------------------------------------------------------- // 
//                                 СТРЕЛКА                                    //
// -------------------------------------------------------------------------- //

let firstValueReverse = '';   // строки для реверса
let secondValueReverse = '';

function reverse() {        //  функция для вариаций реверса
    let a = secondValueReverse;  
    secondValueReverse = firstValueReverse;  
    firstValueReverse = a;    //  меняются местами
}

arrows.addEventListener('click', () => {            // обработчик по стрелке
    for (item of colorButtonsLeft){        
        item.classList.remove('buttonColor')
        if (item.innerText === secondValueReverse) {            
            item.classList.add('buttonColor')
        } else if(item.querySelector(`[value="${secondValueReverse}"]`)) {
            item.value = secondValueReverse;
            item.classList.add('buttonColor')    
        }
    }
    for (item of colorButtonsRight) { 
        item.classList.remove('buttonColor');
        if (item.innerText === firstValueReverse) {            
            item.classList.add('buttonColor')                      
        } else if (item.querySelector(`[value="${firstValueReverse}"]`)) {            
            item.value = firstValueReverse;
            item.classList.add('buttonColor');
        }
    }    
    reverse();
    reverseСonvertFunc();
})

let arrayValueSecond = [];  // массив для расчетов по нужному значению из кросс-курса

function reverseSubFunction(arrayValueFirst){     // функция вычисления и заполнения данных после реверса
    arrayValueSecond = arrayValueFirst;        
    firstValueReverse = leftCurrency;
    secondValueReverse = rightCurrency;
    crossRateLeft.innerText = `1 ${leftCurrency} = ${arrayValueSecond[0][rightCurrency].toFixed(4)} ${rightCurrency}`;
    crossRateRight.innerText = `1 ${rightCurrency} = ${arrayValueSecond[1][leftCurrency].toFixed(4)} ${leftCurrency}`;    
    inputRight.value = +(inputLeft.value*arrayValueSecond[0][rightCurrency]).toFixed(4);    
}

function reverseСonvertFunc() {     //  функция реверса конвертации
    if (inputRight.value == +(inputLeft.value*arrayValueSecond[0][rightCurrency]).toFixed(4)) {        
        crossRateLeft.innerText = `1 ${rightCurrency} = ${arrayValueSecond[1][leftCurrency].toFixed(4)} ${leftCurrency}`;
        crossRateRight.innerText = `1 ${leftCurrency} = ${arrayValueSecond[0][rightCurrency].toFixed(4)} ${rightCurrency}`;
        inputRight.value = +(inputLeft.value*arrayValueSecond[1][leftCurrency]).toFixed(4); 
    } else {        
        crossRateLeft.innerText = `1 ${leftCurrency} = ${arrayValueSecond[0][rightCurrency].toFixed(4)} ${rightCurrency}`;
        crossRateRight.innerText = `1 ${rightCurrency} = ${arrayValueSecond[1][leftCurrency].toFixed(4)} ${leftCurrency}`;    
        inputRight.value = +(inputLeft.value*arrayValueSecond[0][rightCurrency]).toFixed(4);
    }
}
