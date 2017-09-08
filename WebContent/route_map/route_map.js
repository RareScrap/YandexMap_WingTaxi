function init () {
	/**
	 * Тестовый массив с метками адресов
	 */
	var arr = new Array();
	arr[0] = new Array();
    arr[0][0] = 52.289187;
    arr[0][1] = 104.280826;
    arr[1] = new Array();
    arr[1][0] = 52.274419;
    arr[1][1] = 104.253159;
	/*for(var i=0; i<window.getDataJSInterface.getRoutePointsNumber(); i++){
	    arr[i] = new Array();
	    arr[i][0] = window.getDataJSInterface.getRoutePointCoord(i, 0);
	    arr[i][1] = window.getDataJSInterface.getRoutePointCoord(i, 1);
	  }*/
	
    var balloonLayout = ymaps.templateLayoutFactory.createClass(
        "<div>", {
            build: function () {
                this.constructor.superclass.build.call(this);
            }
        }
    );
    
    /**
     * Создаем мультимаршрут.
     * Первым аргументом передаем модель либо объект описания модели.
     * Вторым аргументом передаем опции отображения мультимаршрута.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRouteModel.xml
     */
    var multiRoute = new ymaps.multiRouter.MultiRoute({
        // Описание опорных точек мультимаршрута.
        referencePoints: arr
    }, {
        // Автоматически устанавливать границы карты так, чтобы маршрут был виден целиком.
        boundsAutoApply: true,
        
        balloonLayout: balloonLayout
        
        // Отключаем режим панели для балуна.
        //balloonPanelMaxMapArea: 0
    });

    ymaps
    
    // Создаем карту с добавленными на нее кнопками.
    var myMap = new ymaps.Map('map', {
        center: [55.750625, 37.626],
        zoom: 7,
        controls: ['zoomControl']
    }, {
        buttonMaxWidth: 300
    });
    
    // Ожидаем успешного построения маршрута
    multiRoute.model.events.add("requestsuccess", function(){
		//window.updateDataJSInterface.updateRouteLength( multiRoute.getActiveRoute().properties.get('distance').value );
		
		// Возвращает пиздец, если расстояние огромно
		//window.console.log( multiRoute.getActiveRoute().properties.get('durationInTraffic').value );
		
		var s = multiRoute.getActiveRoute().properties.get('duration').value;
		var test = multiRoute.getActiveRoute().properties.get('coordinates');
		var m = (s/60) % 60;
		window.console.log(m);
		var h = s / 3600;
		window.console.log(h);
		
		//window.updateDataJSInterface.updateTripTime(h, m);
		
		var moveList = 'Трогаемся,</br>',
	        way,
	        segments;
	    // Получаем массив путей.
		for (var g = 0; g < multiRoute.getRoutes().getLength(); g++) {
			var route = multiRoute.getRoutes().get(g);
		    for (var i = 0; i < route.getPaths().getLength(); i++) {
		        way = route.getPaths().get(i);
		        segments = way.getSegments();
		        
		        segments = segments._collectionComponent._baseArrayComponent._children;
		        
		        for (var j = 0; j < segments.length; j++) {
		        	var myPlacemark = createPlacemark(segments[j].model.geometry._coordPath._coordinates[0]);
					myMap.geoObjects.add(myPlacemark);
		            /*var street = segments[j].getStreet();
		            moveList += ('Едем ' + segments[j].getHumanAction() + (street ? ' на ' + street : '') + ', проезжаем ' + segments[j].getLength() + ' м.,');
		            moveList += '</br>'*/
		        }
		    }
		}
	    moveList += 'Останавливаемся.';
		//var test = multiRoute.getActiveRoute().getPaths().getLength()/*.get('coordinates')*/;
    });
    
    function createPlacemark(coords) {
		return new ymaps.Placemark(coords, {
			iconCaption: 'поиск...'
		}, {
			preset: 'islands#violetDotIconWithCaption',
			draggable: false
		});
	}

    // Добавляем мультимаршрут на карту.
    myMap.geoObjects.add(multiRoute);
}

ymaps.ready(init);
