function init () {
	/**
	 * Тестовый массив с метками адресов
	 */
	var arr = new Array();
	for(var i=0; i<window.getDataJSInterface.getRoutePointsNumber(); i++){
	    arr[i] = new Array();
	    arr[i][0] = window.getDataJSInterface.getRoutePointCoord(i, 0);
	    arr[i][1] = window.getDataJSInterface.getRoutePointCoord(i, 1);
	  }
	
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
        boundsAutoApply: true
    });

    // Создаем карту с добавленными на нее кнопками.
    var myMap = new ymaps.Map('map', {
        center: [55.750625, 37.626],
        zoom: 7,
    }, {
        buttonMaxWidth: 300
    });
   
    // Ожидаем успешного построения маршрута
    multiRoute.model.events.add("requestsuccess", function(){
		window.updateDataJSInterface.updateRouteLength( multiRoute.getActiveRoute().properties.get('distance').value );
		
		// Возвращает пиздец, если расстояние огромно
		//window.console.log( multiRoute.getActiveRoute().properties.get('durationInTraffic').value );
		
		var s = multiRoute.getActiveRoute().properties.get('duration').value;
		var m = (s/60) % 60;
		window.console.log(m);
		var h = s / 3600;
		window.console.log(h);
		
		window.updateDataJSInterface.updateTripTime(h, m);
    });

    // Добавляем мультимаршрут на карту.
    myMap.geoObjects.add(multiRoute);
}

ymaps.ready(init);
