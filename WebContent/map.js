function GeolocationButton(params, options) {
    GeolocationButton.superclass.constructor.call(this, params, options);
}



var mapOutside;

ymaps.ready(function init(){
	var myPlacemark,
		myMap = new ymaps.Map('map', {
			center: [52.286387, 104.280660],
			zoom: 15,
			controls: ['zoomControl', 'fullscreenControl']
		});

	myMap.options.set('yandexMapDisablePoiInteractivity', true);
	

	
	
	
	
	
	
	
	
	ymaps.util.augment(GeolocationButton, ymaps.control.Button, {
        onAddToMap: function () {
            GeolocationButton.superclass.onAddToMap.apply(this, arguments);

            ymaps.option.presetStorage.add('geolocation#icon', {
                iconImageHref: 'man.png',
                iconImageSize: [27, 26],
                iconImageOffset: [-10, -24]
            });

            // Обрабатываем клик на кнопке.
            this.events.add('click', this._onBtnClick, this);
        },
        onRemoveFromMap: function () {
            this.events.remove('click', this._onBtnClick, this);
            this.hint = null;
            ymaps.option.presetStorage.remove('geolocation#icon');

            GeolocationButton.superclass.onRemoveFromMap.apply(this, arguments);
        },
        _onBtnClick: function (e) {
        	var coords = [0, 0]//[parseFloat(window.gpsJavaScriptInterface.getUserLongitude()), parseFloat(window.gpsJavaScriptInterface.getUserLatitude())];

        	myMap.panTo(coords, {
                flying: 1
            })
        	
			// Если метка уже создана – просто передвигаем ее.
			if (myPlacemark) {
				myPlacemark.geometry.setCoordinates(coords);
			}
			// Если нет – создаем.
			else {
				myPlacemark = createPlacemark(coords);
				myMap.geoObjects.add(myPlacemark);
				// Слушаем событие окончания перетаскивания на метке.
				myPlacemark.events.add('dragend', function () {
					getAddress(myPlacemark.geometry.getCoordinates());
				});
			}

			getAddress(coords);
        },
        toggleIconImage: function (image) {
            this.data.set('image', image);
        }
        
    });
	
	

	// Создание кнопки определения местоположения
    var button = new GeolocationButton({
        data : {
            image : 'wifi.png',
            title : 'Определить местоположение'
        },
        geolocationOptions: {
            enableHighAccuracy : true // Режим получения наиболее точных данных
        }
    }, {
        // Зададим опции для кнопки.
        selectOnClick: false
    });
    myMap.controls.add(button, { top : 5, left : 5 });
    
    
    
    
    
    
    
    
    
    
    

	myPlacemark = createPlacemark([52.286387, 104.280660]);
	myMap.geoObjects.add(myPlacemark);
	getAddress([52.286387, 104.280660]);

    /*myPlacemark = new ymaps.Placemark([52.286387, 104.280660], {
        hintContent: 'Иркутск!',
        balloonContent: 'Заебись'
    });
    myMap.geoObjects.add(myPlacemark);*/



    // Обработка события, возникающего при щелчке
	// левой кнопкой мыши в любой точке карты.
	// При возникновении такого события откроем балун.
	myMap.events.add('click', function (e) {
		var coords = e.get('coords');

		// Если метка уже создана – просто передвигаем ее.
		if (myPlacemark) {
			myPlacemark.geometry.setCoordinates(coords);
		}
		// Если нет – создаем.
		else {
			myPlacemark = createPlacemark(coords);
			myMap.geoObjects.add(myPlacemark);
			// Слушаем событие окончания перетаскивания на метке.
			myPlacemark.events.add('dragend', function () {
				getAddress(myPlacemark.geometry.getCoordinates());
			});
		}

		getAddress(coords);
	});
	

	function getAddress(coords) {
		myPlacemark.properties.set('iconCaption', 'поиск...');
		ymaps.geocode(coords).then(function (res) {
			var firstGeoObject = res.geoObjects.get(0);
			// Название населенного пункта или вышестоящее административно-территориальное образование.
			// Нужно сохранять город, чтобы передать его на сервер
			var city = firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas()

			myPlacemark.properties
				.set({
					// Формируем строку с данными об объекте.
					iconCaption: [
						// Название населенного пункта или вышестоящее административно-территориальное образование.
						// Нужно сохранять город, чтобы передать его на сервер
						//var city = firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
						// Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
						firstGeoObject.getThoroughfare() || firstGeoObject.getPremise() || firstGeoObject.getLocalities()[1],
						firstGeoObject.getPremiseNumber()
						// В качестве контента балуна задаем строку с адресом объекта.
						//firstGeoObject.getAddressLine()
					].filter(Boolean).join(', '),
					// В качестве контента балуна задаем строку с адресом объекта.
					//balloonContent: firstGeoObject.getAddressLine()
					
					// Тестовая строка для тестирования GPS
					//balloonContent: window.gpsJavaScriptInterface.getUserLatitude() + "_" + window.gpsJavaScriptInterface.getUserLongitude()
				});
			
			//window.updateDataJSInterface.updateAddress(coords[0], coords[1], firstGeoObject.getAddressLine());
			
			// Информируем окружение, что карта загружена
			//window.mapReadyJSInterface.mapReady();
		});
	}
	mapOutside = myMap;
});

//Обработка события, возникающего при щелчке
// правой кнопки мыши в любой точке карты.
// При возникновении такого события покажем всплывающую подсказку
// в точке щелчка.
/*myMap.events.add('contextmenu', function (e) {
	myMap.hint.open(e.get('coords'), 'Кто-то щелкнул правой кнопкой');
});

// Скрываем хинт при открытии балуна.
myMap.events.add('balloonopen', function (e) {
	myMap.hint.close();
});*/

// Создание метки.
function createPlacemark(coords) {
	return new ymaps.Placemark(coords, {
		iconCaption: 'поиск...'
	}, {
		preset: 'islands#violetDotIconWithCaption',
		draggable: false
	});
}

function carsDriver() {
	  var car = [
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
		  [52.238080, 104.264740]
	  ]
	  
	  //alert( "тик" );
	  s--;
	  try {
		  if (metka) {
			  metka.geometry.setCoordinates(car[s]);
			}
			// Если нет – создаем.
			else {
				var pm= createPlacemark(car[s]);
			  	metka = pm;
			  	mapOutside.geoObjects.add(pm);
			}
	  } catch (err) {}
	}

var metka;
var s = 171;
setInterval(carsDriver, 1000);


/*function qwe() {
	  alert( 'Привет' );
	}
setInterval(qwe(), 1000);*/