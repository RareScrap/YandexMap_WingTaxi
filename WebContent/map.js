/**
 * Функция-конструтор GPS контрола для Яндекс карты
 * @param params Параменры контрола (модель функциональности?)
 * @param options Опции контрола (модель поведения?)
 * @returns GPS контрол
 */
function GeolocationButton(params, options) {
    GeolocationButton.superclass.constructor.call(this, params, options);
}


/**
 * Переменная, предоставляющая доступ к переменной внутри функции init()
 */
var mapOutside;

/**
 * Основной скрипт карты. Инициализирует карту.
 */
ymaps.ready(function init(){
	// Создаем обьект карты
	var myMap = new ymaps.Map('map', {
			center: [52.286387, 104.280660], // Центрируем на сквере кирова
			zoom: 15,
			controls: ['zoomControl']
		});
	
	// Отключаем интерактивность (инфу по клику на значки)
	myMap.options.set('yandexMapDisablePoiInteractivity', true);
	
	// Создаем обьект первоначальной метки
	var myPlacemark = createPlacemark([52.286387, 104.280660]); // Место - сквер кирово
	myMap.geoObjects.add(myPlacemark); // Добавляем метку на карту
	getAddress([52.286387, 104.280660]); // Получаем инфу о месте в хит метки (myPlacemark уже есть в getAddress())
	
	 // Создаем экземпляр класса ymaps.control.SearchControl
    mySearchControl = new ymaps.control.SearchControl({
        options: {
            noPlacemark: false,
            placeholderContent: "Вы можете ввести адрес самому",
            size: "auto"
        }
    }),
	// Результаты поиска будем помещать в коллекцию.
    mySearchResults = new ymaps.GeoObjectCollection(null, {
        hintContentLayout: ymaps.templateLayoutFactory.createClass('$[properties.name]')
    });
    
    // Добавление контрола на карту
	myMap.controls.add(mySearchControl);
	
	// Обработка кликнутых результатов поиска
	mySearchControl.events.add('resultselect', function (e) {
		// Получение результата, по которому был сделан клик
		var index = e.get('index');
	    var test = mySearchControl.getResult(index);
	    
	    // Обработка полученного результата
	    mySearchControl.getResult(index).then(function (res) {
	    	// Получение координат результата
	    	var coords = res.geometry._coordinates;
	    	
			// Если метка уже создана – просто передвигаем ее.
			if (myPlacemark) {
				myPlacemark.geometry.setCoordinates(coords);
			}
			// Если нет – создаем.
			else {
				myPlacemark = createPlacemark(coords);
				myMap.geoObjects.add(myPlacemark);
				
				// TODO: Зачем?
				// Слушаем событие окончания перетаскивания на метке.
				myPlacemark.events.add('dragend', function () {
					getAddress(myPlacemark.geometry.getCoordinates());
				});
			}
			// TODO: Зачем?
			getAddress(coords);
	    	
	    	// Помещаем результат в коллекцию
	       mySearchResults.add(res);
	    });
	}).add('submit', function () { // Очистить результаты поиска при отправке реквеста о получении новых
	        mySearchResults.removeAll();
    })
	
	// Задаем функционал GPS контрола
	ymaps.util.augment(GeolocationButton, ymaps.control.Button, {
		// Добавление контрола на карту
        onAddToMap: function () {
            GeolocationButton.superclass.onAddToMap.apply(this, arguments);
            ymaps.option.presetStorage.add('geolocation#icon', {
                iconImageHref: 'man.png',
                iconImageSize: [27, 26],
                iconImageOffset: [-10, -24]
            });

            // Установка обработчика клика по кнопке
            this.events.add('click', this._onBtnClick, this);
        },
        // Функция удаления контрола
        onRemoveFromMap: function () {
            this.events.remove('click', this._onBtnClick, this);
            this.hint = null;
            ymaps.option.presetStorage.remove('geolocation#icon');

            // Вызов суперкласса
            GeolocationButton.superclass.onRemoveFromMap.apply(this, arguments);
        },
        // Вызывается при клике на кнопку
        _onBtnClick: function (e) {
        	// Отладочные координаты
        	var coords = [0, 0];
        	// Получение кооднинат с устройства
        	//var coords = [parseFloat(window.gpsJavaScriptInterface.getUserLongitude()), parseFloat(window.gpsJavaScriptInterface.getUserLatitude())];

        	// Установить центр карты в точке coords
        	myMap.panTo(coords, {
        		// Разрешает уменьшать и затем увеличивать зум карты при перемещении к заданной точке
                flying: true
            })
        	
			// Если метка уже создана – просто передвигаем ее.
			if (myPlacemark) {
				myPlacemark.geometry.setCoordinates(coords);
			}
			// Если нет – создаем.
			else {
				myPlacemark = createPlacemark(coords);
				myMap.geoObjects.add(myPlacemark);
				// TODO: Удалить
				// Слушаем событие окончания перетаскивания на метке.
				myPlacemark.events.add('dragend', function () {
					getAddress(myPlacemark.geometry.getCoordinates());
				});
			}

        	// TODO: Хачем это?
			getAddress(coords);
        },
        // Создает эффект нажатой кнопки
        toggleIconImage: function (image) {
            this.data.set('image', image);
        }
    });
	
	// Создаем GPS контрол с заданным функционалом
    var button = new GeolocationButton({
        data : {
            image : 'wifi.png',
            title : 'Определить местоположение'
        },
        geolocationOptions: {
            enableHighAccuracy : true // Режим получения наиболее точных данных
        }
    }, {
    	// TODO: Зачем это?
        // Зададим опции для кнопки.
        selectOnClick: false
    });
    // Добавим GPS контрол на карту
    myMap.controls.add(button, { top : 5, left : 5 });

    // Обработка события, возникающего при щелчке левой кнопкой мыши в любой точке карты.
	myMap.events.add('click', function (e) {
		// Получаем координаты косания 
		var coords = e.get('coords');

		// Если метка уже создана – просто передвигаем ее.
		if (myPlacemark) {
			myPlacemark.geometry.setCoordinates(coords);
		}
		// Если нет – создаем.
		else {
			myPlacemark = createPlacemark(coords);
			myMap.geoObjects.add(myPlacemark);
			
			// TODO: Зачем?
			// Слушаем событие окончания перетаскивания на метке.
			myPlacemark.events.add('dragend', function () {
				getAddress(myPlacemark.geometry.getCoordinates());
			});
		}

		// TODO: Зачем?
		getAddress(coords);
	});
	
	/**
	 * Получает информацию о месте в точке данной и записывае ее в хинт метки myPlacemark
	 * @param coords Место, о котором нужно получить информацию
	 */
	function getAddress(coords) {
		// Устанавливаем заглушку, когда информация о месте еще не получена
		myPlacemark.properties.set('iconCaption', 'поиск...');
		
		// Обработка полученной информации
		ymaps.geocode(coords).then(function (res) {
			// Геообьект, находящийся в точке coords
			var firstGeoObject = res.geoObjects.get(0);
			
			// TODO: Нужно сохранять город, чтобы передать его на сервер
			// Сохраняем название населенного пункта или вышестоящее административно-территориальное образование
			var city = firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas();

			// Записываем загруженную информацию в хинт myPlacemark
			myPlacemark.properties
				.set({
					// Формируем строку с данными об объекте.
					iconCaption: [
						// Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания. Если и его нет - возвращаем образование внтури района (микрорайон)
						firstGeoObject.getThoroughfare() || firstGeoObject.getPremise() || firstGeoObject.getLocalities()[1],
						// Номер здания
						firstGeoObject.getPremiseNumber()
						
						// Полный адрес метки
						//firstGeoObject.getAddressLine()
					].filter(Boolean).join(', '), // Применяем фильтр, разделяя токены адреса запятой
					
					// Тестовая строка для тестирования GPS
					//balloonContent: window.gpsJavaScriptInterface.getUserLatitude() + "_" + window.gpsJavaScriptInterface.getUserLongitude()
				});
			
			// Информирует окружение о том, что метка была передвинута
			//window.updateDataJSInterface.updateAddress(coords[0], coords[1], firstGeoObject.getAddressLine());
			
			// Информируем окружение, что карта загружена
			// TODO: Это лучшее место для этой строки?
			//window.mapReadyJSInterface.mapReady();
		});
	}
	
	/**
	 * Создает метку выброра адреса
	 * @param coords Точка, в тоторой нужно создать метку
	 * @return Созданная метка
	 */
	function createPlacemark(coords) {
		return new ymaps.Placemark(coords, {
			iconCaption: 'поиск...'
		}, {
			preset: 'islands#violetDotIconWithCaption',
			draggable: false
		});
	}

	
	// Сохранение готовой карты во внешней переменной
	mapOutside = myMap;
});

/**
 * Создает метку машины такси
 * @param coords Точка, в тоторой нужно создать метку
 * @return Созданная метка
 */
function createPlacemarkCar(coords) {
	return new ymaps.Placemark(coords, {}, {
		iconLayout: 'default#imageWithContent',
		iconImageHref: 'car.png',
		iconImageSize: [48, 48],
		
		// Смещает картинку, чтобы "хвостик" метки указывал прямо на точку дороги
		iconImageOffset: [-24, -48],
	    // Смещение слоя с содержимым относительно слоя с картинкой.
	    //iconContentOffset: [15, 15],
		
		preset: 'islands#violetDotIconWithCaption',
		// Отлючает возможность переноса
		draggable: false
	});
}

/**
 * Функция, содержащая в себе координаты точек маршрута для всех меток машин. При вызове,
 * выставляет все метки машин в их s-тую точку (s - внешняя переменная).
 */
function carsDriver() {
	  var car = [
		  // Машина 1
		  [52.219864, 104.246826],
		  [52.220045, 104.247206],
		  [52.220193, 104.247625],
		  [52.220332, 104.247931],
		  [52.220556, 104.248392],
		  [52.220691, 104.248768],
		  [52.220839, 104.249095],
		  [52.220978, 104.249374],
		  [52.221179, 104.249690],
		  [52.221366, 104.249948],
		  [52.221574, 104.250259],
		  [52.221696, 104.250473],
		  [52.221887, 104.250720],
		  [52.222012, 104.250962],
		  [52.222172, 104.251211],
		  [52.222340, 104.251457],
		  [52.222518, 104.251742],
		  [52.222689, 104.251989],
		  [52.222887, 104.252268],
		  [52.223058, 104.252616],
		  [52.223186, 104.252804],
		  [52.223348, 104.253051],
		  [52.223476, 104.253271],
		  [52.223673, 104.253578],
		  [52.223804, 104.253776],
		  [52.224002, 104.254103],
		  [52.224160, 104.254355],
		  [52.224285, 104.254532],
		  [52.224434, 104.254817],
		  [52.224558, 104.255019],
		  [52.224673, 104.255163],
		  [52.224752, 104.255314],
		  [52.224884, 104.255019],
		  [52.225032, 104.254777],
		  [52.225105, 104.254520],
		  [52.225263, 104.254171],
		  [52.225428, 104.253881],
		  [52.225569, 104.253533],
		  [52.225665, 104.253345],
		  [52.225777, 104.253120],
		  [52.225922, 104.252835],
		  [52.226113, 104.252626],
		  [52.226353, 104.252556],
		  [52.226512, 104.252519],
		  [52.226620, 104.252637],
		  [52.226749, 104.252841],
		  [52.226874, 104.253045],
		  [52.227016, 104.253275],
		  [52.227151, 104.253495],
		  [52.227276, 104.253656],
		  [52.227368, 104.253828],
		  [52.227513, 104.254069],
		  [52.227658, 104.254289],
		  [52.227800, 104.254488],
		  [52.227974, 104.254799],
		  [52.228109, 104.255115],
		  [52.228215, 104.255324],
		  [52.228304, 104.255598],
		  [52.228379, 104.255850],
		  [52.228462, 104.256086],
		  [52.228534, 104.256387],
		  [52.228613, 104.256623],
		  [52.228689, 104.256859],
		  [52.228755, 104.257084],
		  [52.228841, 104.257336],
		  [52.228967, 104.257372],
		  [52.229056, 104.257401],
		  [52.229161, 104.257457],
		  [52.229240, 104.257511],
		  [52.229314, 104.257559],
		  [52.229392, 104.257613],
		  [52.229458, 104.257664],
		  [52.229538, 104.257731],
		  [52.229601, 104.257760],
		  [52.229663, 104.257806],
		  [52.229710, 104.257836],
		  [52.229798, 104.257908],
		  [52.229902, 104.257983],
		  [52.230011, 104.258058],
		  [52.230111, 104.258117],
		  [52.230197, 104.258203],
		  [52.230261, 104.258286],
		  [52.230306, 104.258372],
		  [52.230344, 104.258485],
		  [52.230385, 104.258587],
		  [52.230419, 104.258707],
		  [52.230475, 104.258825],
		  [52.230523, 104.258872],
		  [52.230578, 104.258952],
		  [52.230650, 104.259027],
		  [52.230729, 104.259116],
		  [52.230800, 104.259167],
		  [52.230871, 104.259242],
		  [52.230945, 104.259312],
		  [52.231019, 104.259376],
		  [52.231087, 104.259440],
		  [52.231149, 104.259494],
		  [52.231212, 104.259537],
		  [52.231347, 104.259615],
		  [52.231452, 104.259644],
		  [52.231587, 104.259679],
		  [52.231739, 104.259709],
		  [52.231862, 104.259725],
		  [52.231971, 104.259816],
		  [52.232075, 104.259971],
		  [52.232123, 104.260071],
		  [52.232165, 104.260130],
		  [52.232220, 104.260216],
		  [52.232281, 104.260320],
		  [52.232349, 104.260415],
		  [52.232385, 104.260512],
		  [52.232441, 104.260573],
		  [52.232509, 104.260678],
		  [52.232583, 104.260756],
		  [52.232654, 104.260842],
		  [52.232718, 104.260903],
		  [52.232779, 104.260968],
		  [52.232845, 104.261043],
		  [52.232910, 104.261112],
		  [52.232983, 104.261163],
		  [52.233052, 104.261236],
		  [52.233141, 104.261332],
		  [52.233199, 104.261375],
		  [52.233250, 104.261424],
		  [52.233304, 104.261472],
		  [52.233400, 104.261571],
		  [52.233510, 104.261657],
		  [52.233612, 104.261764],
		  [52.233734, 104.261877],
		  [52.233849, 104.261976],
		  [52.233951, 104.262070],
		  [52.234068, 104.262164],
		  [52.234193, 104.262258],
		  [52.234233, 104.262325],
		  [52.234305, 104.262376],
		  [52.234373, 104.262435],
		  [52.234435, 104.262488],
		  [52.234501, 104.262561],
		  [52.234580, 104.262647],
		  [52.234630, 104.262749],
		  [52.234679, 104.262867],
		  [52.234717, 104.262950],
		  [52.234770, 104.263065],
		  [52.234854, 104.263113],
		  [52.234921, 104.263156],
		  [52.234989, 104.263180],
		  [52.235048, 104.263202],
		  [52.235157, 104.263247],
		  [52.235269, 104.263298],
		  [52.235371, 104.263344],
		  [52.235491, 104.263398],
		  [52.235626, 104.263454],
		  [52.235748, 104.263521],
		  [52.235883, 104.263575],
		  [52.236016, 104.263642],
		  [52.236145, 104.263687],
		  [52.236290, 104.263762],
		  [52.236425, 104.263815],
		  [52.236565, 104.263885],
		  [52.236703, 104.263968],
		  [52.236800, 104.264006],
		  [52.236932, 104.264091],
		  [52.237070, 104.264158],
		  [52.237187, 104.264217],
		  [52.237283, 104.264266],
		  [52.237423, 104.264346],
		  [52.237566, 104.264413],
		  [52.237704, 104.264499],
		  [52.237843, 104.264558],
		  [52.237970, 104.264636],
		  [52.238040, 104.264698],
		  [52.238080, 104.264740],
	  
		  // Машина 2
		  [52.275816, 104.287387],
		  [52.275701, 104.287709],
		  [52.275552, 104.287940],
		  [52.275460, 104.288197],
		  [52.275460, 104.288202],
		  [52.275368, 104.288417],
		  [52.275289, 104.288540],
		  [52.275154, 104.288798],
		  [52.275095, 104.288937],
		  [52.274980, 104.289152],
		  [52.274907, 104.289329],
		  [52.274809, 104.289447],
		  [52.274727, 104.289678],
		  [52.274651, 104.289828],
		  [52.274546, 104.290026],
		  [52.274486, 104.290144],
		  [52.274417, 104.290300],
		  [52.274302, 104.290514],
		  [52.274230, 104.290702],
		  [52.274128, 104.290842],
		  [52.274052, 104.291019],
		  [52.273983, 104.291142],
		  [52.273920, 104.291298],
		  [52.273845, 104.291437],
		  [52.273792, 104.291587],
		  [52.273769, 104.291786],
		  [52.273752, 104.292022],
		  [52.273723, 104.292242],
		  [52.273716, 104.292419],
		  [52.273690, 104.292596],
		  [52.273680, 104.292848],
		  [52.273654, 104.293202],
		  [52.273624, 104.293443],
		  [52.273611, 104.293653],
		  [52.273608, 104.293862],
		  [52.273581, 104.294098],
		  [52.273571, 104.294275],
		  [52.273565, 104.294516],
		  [52.273575, 104.294720],
		  [52.273598, 104.294945],
		  [52.273641, 104.295155],
		  [52.273677, 104.295348],
		  [52.273710, 104.295568],
		  [52.273749, 104.295831],
		  [52.273818, 104.296088],
		  [52.273841, 104.296260],
		  [52.273874, 104.296437],
		  [52.273917, 104.296635],
		  [52.273930, 104.296775],
		  [52.273989, 104.297005],
		  [52.274032, 104.297247],
		  [52.274095, 104.297461],
		  [52.274108, 104.297697],
		  [52.274164, 104.297907],
		  [52.274187, 104.298110],
		  [52.274236, 104.298271],
		  [52.274272, 104.298470],
		  [52.274318, 104.298620],
		  [52.274368, 104.298797],
		  [52.274368, 104.298797],
		  [52.274414, 104.299146],
		  [52.274447, 104.299296],
		  [52.274473, 104.299489],
		  [52.274516, 104.299671],
		  [52.274539, 104.299816],
		  [52.274592, 104.299993],
		  [52.274638, 104.300235],
		  [52.274664, 104.300439],
		  [52.274730, 104.300648],
		  [52.274763, 104.300836],
		  [52.274792, 104.301061],
		  [52.274838, 104.301238],
		  [52.274881, 104.301388],
		  [52.274914, 104.301576],
		  [52.274957, 104.301742],
		  [52.274986, 104.301935],
		  [52.275023, 104.302155],
		  [52.275065, 104.302338],
		  [52.275131, 104.302541],
		  [52.275164, 104.302783],
		  [52.275223, 104.303014],
		  [52.275260, 104.303207],
		  [52.275309, 104.303384],
		  [52.275342, 104.303545],
		  [52.275378, 104.303668],
		  [52.275398, 104.303850],
		  [52.275431, 104.303968],
		  [52.275533, 104.303968],
		  [52.275661, 104.303909],
		  [52.275826, 104.303824],
		  [52.276030, 104.303706],
		  [52.276158, 104.303620],
		  [52.276280, 104.303550],
		  [52.276365, 104.303614],
		  [52.276411, 104.303765],
		  [52.276444, 104.303947],
		  [52.276480, 104.304108],
		  [52.276500, 104.304285],
		  [52.276549, 104.304462],
		  [52.276589, 104.304676],
		  [52.276642, 104.304939],
		  [52.276684, 104.305116],
		  [52.276730, 104.305352],
		  [52.276773, 104.305551],
		  [52.276800, 104.305749],
		  [52.276836, 104.305894],
		  [52.276865, 104.306071],
		  [52.276888, 104.306211],
		  [52.276928, 104.306361],
		  [52.276944, 104.306506],
		  [52.276958, 104.306688],
		  [52.277000, 104.306854],
		  [52.277040, 104.307026],
		  [52.277083, 104.307209],
		  [52.277109, 104.307428],
		  [52.277125, 104.307622],
		  [52.277152, 104.307809],
		  [52.277181, 104.307933],
		  [52.277194, 104.308078],
		  [52.277234, 104.308228],
		  [52.277277, 104.308410],
		  [52.277293, 104.308555],
		  [52.277316, 104.308716],
		  [52.277346, 104.308834],
		  [52.277395, 104.309041],
		  [52.277457, 104.309475],
		  [52.277484, 104.309588],
		  [52.277520, 104.309775],
		  [52.277530, 104.309936],
		  [52.277559, 104.310060],
		  [52.277592, 104.310210],
		  [52.277615, 104.310344],
		  [52.277635, 104.310462],
		  [52.277655, 104.310618],
		  [52.277675, 104.310779],
		  [52.277704, 104.310945],
		  [52.277744, 104.311133],
		  [52.277767, 104.311288],
		  [52.277800, 104.311449],
		  [52.277819, 104.311578],
		  [52.277862, 104.311723],
		  [52.277879, 104.311868],
		  [52.277892, 104.311991],
		  [52.277921, 104.312136],
		  [52.277951, 104.312318],
		  [52.277997, 104.312527],
		  [52.278014, 104.312704],
		  [52.278050, 104.312940],
		  [52.278086, 104.313187],
		  [52.278168, 104.313303],
		  [52.278209, 104.313273],
		  [52.278257, 104.313252],
		  [52.278325, 104.313227],
		  [52.278374, 104.313190],
		  [52.278430, 104.313166],
		  [52.278413, 104.313069],
		  [52.278392, 104.312989],
		  [52.278379, 104.312863],
		  [52.278380, 104.312739],
		  [52.278392, 104.312611],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527],
		  [52.278418, 104.312527]
	  ];
	  
	  //alert( "тик" );
	  s--;
	  try {
		  for (var i = 0; i < metka.length; i++) {
		  if (metka[i]) {
			  metka[i].geometry.setCoordinates(car[s+172*i]);
			}
			// Если нет – создаем.
			else {
				var pm= createPlacemarkCar(car[s+172*i]);
			  	metka[i] = pm;
			  	mapOutside.geoObjects.add(pm);
			}
		  }
	  } catch (err) {}
	}

var s = 172;
var metka = [undefined, undefined];
setInterval(carsDriver, 1000);

//Функция для вычисления угла между 2 векторами
var angleBetweenTwoVectors = function(vector1, vector2) {
    // скалярное произведение векторов
    var scalMultVectors = vector1.reduce(function(sum, current, i) {
        return sum + (current * vector2[i])
    }, 0);
    // модуль вектора равен квадратному корню из суммы квадратов его координат
    var moduleVector = function(v) {
        // Находим квадраты слагаемых
        var step1 = v.map(function(currentValue) {
            return Math.pow(currentValue, 2)
        });
        // Складываем их
        var step2 = step1.reduce(function(sum, current) {
            return sum + current
        });
        // Вычисляем квадратный корень
        return Math.sqrt(step2, 2)
    };
    // Вычисляем косинус угла между векторами
    var cosA = scalMultVectors / (moduleVector(vector1) * moduleVector(vector2));
    console.log("cos(" + cosA + ")");
    return Math.acos(cosA);

}

// test
var v1 = [52.287575, 104.282748];
var v2 = [52.287517, 104.282786];

var ab = [v2[0]-v1[0], v2[1]-v1[1]];
var an = [v2[0]-v1[0]+1, v2[1]-v1[1]];
var n = [v1[0]+1, v1[1]];
console.log((angleBetweenTwoVectors(ab, an) * (180/3.1415)) + " градусов");

/*function qwe() {
	  alert( 'Привет' );
	}
setInterval(qwe(), 1000);*/