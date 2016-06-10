//
// LiveGrid v.2.0
//
(function($)
{
	$.fn.liveGrid = function(params)
	{
		var table = this,             // Таблица
            thList,			          // Все <th> таблицы
			rh,                       // Resize Handle, который находится в <th>, потянув за который, можно изменить ширину
            bResizeActivated = false, // Флаг, сообщающий об активации изменения ширины
            currentRh,                // Resize Handle за который потянули,
            thWidth,                  // Ширина th
            userID,                   // Идентификатор пользователя. Берется из параметров
            tableID,                  // Идентификатор таблицы. Берется из параметров
            userIDFromLocalStorage;   // Объект пользователя, с размерами колонок таблиц. Берется из LocalStorage

		// Если по селектору выбирается объект
		if(table.length == 1)
		{
            // Ставим временно width=auto, чтобы проигнорировать сторонние стили, увеличивающие ширину таблицы
            // Иначе, может быть такая ситуация, что таблица width:100% и колонки увеличатся больше, чем их фактическая ширина
            table.width('auto');

			// Проверяем, есть ли у таблицы th
			thList = this.find('th');

			if(thList.length > 0)
			{
                // Проверям, есть ли в localStorage объект с этим именем пользоватлея и в нем лежит объект с именем таблицы.
                // Если чего-то из этого нет, то создаем
                checkLocalStorage();

                // Проверяем, сохранены ли размеры колонок и их видимость, и если нет, то проставляем ширину каждой <th> исходя из ее размеров
                // Также, создаем элементы, которые будут служить рукояткой изменения ширины
				thList.each(function(i)
				{
                    // Считаем ширину этой th
                    thWidth = 0;                	

                	try
                	{
	                    thWidth = userIDFromLocalStorage[tableID].colsWidth.length != 0 ?
	                        (userIDFromLocalStorage[tableID].colsWidth[i]) :
	                        ($(this).outerWidth()); // OuterWidth = width + border + padding
	                }
	                catch(err)
	                {
	                	console.log('LiveGrid: localStorage data error:'+err.name);
	                	console.log(err.message);
	                	localStorage.removeItem(userID);
	                }

                    $(this).css('width', thWidth);

                    // Создаем Resize Handle у этой th
					rh = $('<div class="lg-resizeHandle">');
                    $(this).append(rh);
					rh.height(table.height());

                    // При нажатии на Resize Handle активируем событие mousemove у таблицы
                    rh.on('mousedown', function()
                    {
                        bResizeActivated = true;
                        currentRh = $(this);
                    });
				});

                // Функция подсчета ширины всех th, для изменения ширины таблицы и обертки
                $.liveGrid.calc(userID, tableID);

                // Скрываем скрытые колонки
                for(var n = 0; n < userIDFromLocalStorage[tableID].hiddenCols.length; n++)
                    $.liveGrid.hide(userID, tableID, userIDFromLocalStorage[tableID].hiddenCols[n], true);

                // Привязываем к таблице события
                // Изменения ширины
                $(document).on('mousemove', function(e)
                {
                    // Если нажали на Resize Handle
                    if(bResizeActivated)
                    {
                        table.width('auto');

                        // Устанавливаем новую ширину колонки
                        currentRh.parent().width(e.clientX + $(window).scrollLeft() - currentRh.parent().offset().left);

                        // Функция подсчета ширины всех th, для изменения ширины таблицы и обертки
                        $.liveGrid.calc(userID, tableID);

                        table.addClass('lg-noselect');
                    }
                });

                // Окончание изменения ширины
                $(document).on('mouseup', function()
                {
                    if(typeof params == 'object' && bResizeActivated)
                    {
                        // Сохраняем ширину колонок и их видимость в localStorage
                        $.liveGrid.save(userID, tableID);

                        // Вызываем Callback
                        if(typeof params.callback == 'function')
                        {
                            var data = {
                                table: table,
                                index: $(currentRh.parent()).index(),
                                width: currentRh.parent().css('width').replace('px', '')
                            };
                            params.callback(data);
                        }
                    }

                    // Сбрасываем параметры
                    bResizeActivated = false;
                    currentRh = undefined;
                    setTimeout(function()
                    {
                        table.removeClass('lg-noselect');
                    }, 100);    
                });
			}
			else
			{
				console.log('LiveGrid: table required a th tags');
			}
		}
		else
		{
			console.log('LiveGrid: Wrong table selector');
		}

        // Проверям, есть ли в localStorage объект с этим именем пользоватлея и в нем лежит объект с именем таблицы.
        // Если чего-то из этого нет, то создаем
        function checkLocalStorage()
        {
            if(typeof params.saveColsSize == 'object')
            {
                if(
                    params.saveColsSize.uniqUserID != undefined &&
                    params.saveColsSize.uniqTableID != undefined
                )
                {
                    userID = params.saveColsSize.uniqUserID;
                    tableID = params.saveColsSize.uniqTableID;

                    userIDFromLocalStorage = JSON.parse(localStorage.getItem(userID));

                    // Проверяем, есть ли в localStorage объект с именем пользователя
                    // и если нет, то создаем
                    userIDFromLocalStorage =
                        userIDFromLocalStorage == null ?
                            (userIDFromLocalStorage = {}) :
                            (userIDFromLocalStorage);

                    // Если объект есть, то проверяем, есть ли в нем объект с именем таблицы
                    // и если нет, то создаем
                    userIDFromLocalStorage[tableID] =
                        userIDFromLocalStorage[tableID] == undefined ?
                            (userIDFromLocalStorage[tableID] = {}) :
                            (userIDFromLocalStorage[tableID]);

                    // Если данных таблицы нет, то инициализируем свойства дефолтными значениями
                    if(Object.keys(userIDFromLocalStorage[tableID]).length == 0)
                    {
                        userIDFromLocalStorage[tableID].tableWidth = 0;
                        userIDFromLocalStorage[tableID].colsWidth = [];
                        userIDFromLocalStorage[tableID].hiddenCols = [];
                    }
                }

                // Устанавливаем ширину таблицы
                table.width(
                    userIDFromLocalStorage[tableID] != undefined ?
                        userIDFromLocalStorage[tableID].tableWidth :
                        'auto'
                )
            }
        }
	};

    // Функции, доступные извне
    $.liveGrid =
    {
        // Скрыть колонку
        hide: function(userID, tableID, colIndex, bSave)
        {
            // Сохранять результат в localStorage или нет
            bSave =
                bSave == undefined ?
                (bSave = false) :
                (bSave = true);

            // Проверяем входящие параметры
            if(
                userID != undefined &&
                tableID != undefined &&
                colIndex != undefined
            )
            {
                var table = $(tableID);

                if(tableID.length != 0)
                {
                    var trList = table.find('tr'),
                        thList = table.find('th'),
                        tdList;

                    if(trList.length != 0 && thList.length != 0)
                    {
                        table.width('auto'); // Чтобы колонки не растянулись под указанную в пикселях ширину таблицы

                        var th = $(thList[colIndex]);

                        // Скрываем th
                        th.length != 0 && th.hide();

                        // Скрываем td
                        trList.each(function(index)
                        {
                            var tdList = $(this).find('td');

                            $(tdList[colIndex]).hide();
                        });

                        // Сохраняем в localStorage
                        !bSave && this.save(userID, tableID);

                        // Пересчитываем ширину обертки, таблицы, th и Resize Handles
                        this.calc(userID, tableID);
                    }
                }
            }
        },

        // Показать колонку
        show: function(userID, tableID, colIndex)
        {
            if(
                userID != undefined &&
                tableID != undefined &&
                colIndex != undefined
            )
            {
                var table = $(tableID);

                if(tableID.length != 0)
                {
                    var trList = table.find('tr'),
                        thList = table.find('th'),
                        tdList;

                    if(trList.length != 0 && thList.length != 0)
                    {
                        table.width('auto'); // Чтобы колонки не растянулись под указанную в пикселях ширину таблицы

                        var th = $(thList[colIndex]);

                        // Проверка на: "Что если кликнули на "Показать колонку", а она уже показана"
                        if(th.css('display') != 'none')
                            return;

                        // Показываем th
                        th.length != 0 && th.show();

                        // Показываем td
                        trList.each(function(index)
                        {
                            var tdList = $(this).find('td');

                            $(tdList[colIndex]).show();
                        });

                        // Сохраняем в localStorage
                        this.save(userID, tableID);

                        // Пересчитываем ширину обертки, таблицы, th и Resize Handles
                        this.calc(userID, tableID);
                    }
                }
            }
        },

        // Функция подсчета ширины всех th, для изменения ширины таблицы и обертки
        calc: function(userID, tableID)
        {
            if(
                userID != undefined &&
                tableID != undefined
            )
            {
                var table = $(tableID);

                if(tableID.length != 0)
                {
                    var thList = table.find('th'),
                        rhList = table.find('.lg-resizeHandle');

                    if(thList.length != 0 && rhList.length != 0)
                    {
                        // Считаем ширину всех th. Это будет ширина таблицы
                        var thListWidth = 0,
                            thWidth;

                        thList.each(function(i)
                        {
                            // Не учитываем скрытые колонки
                            if($(this).css('display') != 'none')
                            {
                                thWidth = 0;

                                thWidth = this.style.width != '' ?
                                    Number(this.style.width.replace('px','')) :
                                    $(this).outerWidth();

                                thWidth =
                                    thWidth < $(this).outerWidth() ?
                                        ($(this).outerWidth()) :
                                        (thWidth);

                                thListWidth += thWidth;
                            }
                        });

                        // Устанавливаем ширину таблице и ее обертке
                        // Иначе таблица не будет расширятся за пределы страницы
                        table.parent().width(thListWidth + 100);
                        table.width(thListWidth);
                    }
                }
            }
        },

        // Сохранить ширину и видимость колонок таблицы в localStorage
        save: function(userID, tableID)
        {
            if(
                userID != undefined &&
                tableID != undefined
            )
            {
                var table = $(tableID);

                if (tableID.length != 0)
                {
                    var thList = table.find('th');

                    if(thList.length != 0)
                    {
                        var colsWidthArr = [], // Тут накапливается ширина  всех th
                            hiddenColsArr = []; // Тут хранятся все порядковые номера скрытых колонок

                        // Считаем ширину каждой колонки
                        thList.each(function(i)
                        {
                            $(this).css('display') == 'none' && hiddenColsArr.push(i);     // Запоминаем индексы скрытых колонок

                            // Запоминаем ширину колонок
                            var thWidth =
                                Number(this.style.width.replace('px', '')) < $(this).outerWidth() ?
                                    ($(this).outerWidth()) :
                                    (Number(this.style.width.replace('px', '')));

                            colsWidthArr.push(thWidth);
                        });

                        //region Проверяем localStorage
                        var userIDFromLocalStorage = JSON.parse(localStorage.getItem(userID));

                        // Проверяем, есть ли в localStorage объект с именем пользователя
                        // и если нет, то создаем
                        userIDFromLocalStorage =
                            userIDFromLocalStorage == null ?
                                (userIDFromLocalStorage = {}) :
                                (userIDFromLocalStorage);

                        // Если объект есть, то проверяем, есть ли в нем объект с именем таблицы
                        // и если нет, то создаем
                        userIDFromLocalStorage[tableID] =
                            userIDFromLocalStorage[tableID] == undefined ?
                                (userIDFromLocalStorage[tableID] = {}) :
                                (userIDFromLocalStorage[tableID]);

                        // Если данных таблицы нет, то инициализируем свойства дефолтными значениями
                        if(Object.keys(userIDFromLocalStorage[tableID]).length == 0)
                        {
                            userIDFromLocalStorage[tableID].tableWidth = 0;
                            userIDFromLocalStorage[tableID].colsWidth = [];
                            userIDFromLocalStorage[tableID].hiddenCols = [];
                        }
                        //endregion

                        // Сохраняем в localStorage
                        userIDFromLocalStorage[tableID].tableWidth = table.width();
                        userIDFromLocalStorage[tableID].colsWidth = colsWidthArr;
                        userIDFromLocalStorage[tableID].hiddenCols = hiddenColsArr;
                        localStorage.setItem(userID, JSON.stringify(userIDFromLocalStorage));
                    }
                }
            }
        }
    };
})(jQuery);