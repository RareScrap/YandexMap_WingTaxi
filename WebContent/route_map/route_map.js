function init () {
	/**
	 * Тестовый массив с метками адресов
	 */
	var adresses = [
		  [52.282071, 104.287999],
		  [52.276622, 104.316408],
		  [52.262905, 104.302418],
		  [52.225794, 104.311010]
		];
	
    /**
     * Создаем мультимаршрут.
     * Первым аргументом передаем модель либо объект описания модели.
     * Вторым аргументом передаем опции отображения мультимаршрута.
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRoute.xml
     * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/multiRouter.MultiRouteModel.xml
     */
    var multiRoute = new ymaps.multiRouter.MultiRoute({
        // Описание опорных точек мультимаршрута.
        referencePoints: [
          [52.282071, 104.287999],
  		  [52.276622, 104.316408],
  		  [52.262905, 104.302418],
  		  [52.225794, 104.311010]
        ]
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

    // Добавляем мультимаршрут на карту.
    myMap.geoObjects.add(multiRoute);
}

ymaps.ready(init);
