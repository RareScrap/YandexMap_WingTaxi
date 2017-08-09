function GeolocationButton(params, options) {
    GeolocationButton.superclass.constructor.call(this, params, options);
}

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
		        	var coords = [parseFloat(window.gpsJavaScriptInterface.getUserLongitude()), parseFloat(window.gpsJavaScriptInterface.getUserLatitude())];

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

			// Обработка события, возникающего при щелчке
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
							balloonContent: window.gpsJavaScriptInterface.getUserLatitude() + "_" + window.gpsJavaScriptInterface.getUserLongitude()
						});
					
					window.adresTextViewJSInterface.updateAdresView(firstGeoObject.getAddressLine());
				});
			}
		});