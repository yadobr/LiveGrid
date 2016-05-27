//
// LiveGrid v.2.0
//
(function($)
{
	$.fn.liveGrid = function(params)
	{
		var table = this,             // Таблица
            thList,			          // Все <th> таблицы
            rhList,			          // Все Resize Handles таблицы
			rh,                       // Resize Handle, который находится в <th>, потянув за который, можно изменить ширину
            bResizeActivated = false, // Флаг, сообщающий об активации изменения ширины
            currentRh,                // Resize Handle за который потянули,
            thWidth,                  // Ширина th
            thListWidth = 0,          // Ширина Всех th
            userID,                   // Идентификатор пользователя. Берется из параметров
            tableID,                  // Идентификатор таблицы. Берется из параметров
            userIDFromLocalStorage;   // Объект пользователя, с размерами колонок таблиц. Берется из LocalStorage

		// Если по селектору выбирается объект
		if(table.length == 1)
		{
			// Проверяем, есть ли у таблицы th
			thList = this.find('th');

			if(thList.length > 0)
			{
                // Проверям, есть ли в localStorage объект с этим именем пользоватлея и в нем лежит объект с именем таблицы.
                // Если чего-то из этого нет, то создаем
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
                    }

                    // Устанавливаем ширину таблицы
                    table.width(
                        userIDFromLocalStorage[tableID] != undefined ?
                            userIDFromLocalStorage[tableID].tableWidth :
                            'auto'
                    )
                }

                // Проверяем, сохранены ли размеры колонок, если нет, то проставляем ширину каждой <th> исходя из ее размеров
                // Также, создаем элементы, которые будут служить рукояткой изменения ширины
				thList.each(function(i)
				{
                    thWidth = 0;

                    // Учитываем ширину границ и padding
                    var thBorderWidth = Number($(this).css('border-width').replace('px', '')),
                        thPaddingLeft = Number($(this).css('padding-left').replace('px', '')),
                        thPaddingRight = Number($(this).css('padding-right').replace('px', ''));

                    thWidth = Object.keys(userIDFromLocalStorage[tableID]).length != 0 ?
                        (userIDFromLocalStorage[tableID].colsWidth[i]) :
                        ($(this).outerWidth()); // OuterWidth = width + border + padding

                    //($(this).outerWidth() + thBorderWidth * 2 + thPaddingLeft + thPaddingRight);

                    thListWidth += thWidth;

                    $(this).css('width', thWidth);

                    // Скрыть колонку
                    $(this).on('click', colHide);

					rh = $('<div class="lg-resizeHandle">');
                    $(this).append(rh);
                    rh.css({
                        'left': $(this).offset().left + $(this).width() + rh.width() / 2.5,
                        'top': table.offset().top
                    });
					rh.height(table.height());

                    // При нажатии на Resize Handle активируем событие mousemove у таблицы
                    rh.on('mousedown', function()
                    {
                        bResizeActivated = true;
                        currentRh = $(this);
                    });
				});

                table.width(thListWidth);

                // Запоминаем все Resize Handles
                rhList = this.find('.lg-resizeHandle');

                // Привязываем к таблице события
                // Изменения ширины
                $(document).on('mousemove', function(e)
                {
                    // Если нажали на Resize Handle
                    if(bResizeActivated)
                    {
                        table.width('auto');

                        // Устанавливаем новые координаты Resize Handle
                        currentRh.css('left', e.clientX + $(window).scrollLeft());

                        // Устанавливаем новую ширину колонки
                        currentRh.parent().width(e.clientX + $(window).scrollLeft() - currentRh.parent().offset().left);

                        // Функция подсчета ширины всех th, обновления коорднитат Resize Handles
                        // Изменения ширины таблицы и обертки
                        calculateWidth();
                        console.log('adasdasdsdasd');
                        table.addClass('lg-noselect');
                    }
                });

                // Окончание изменения ширины
                $(document).on('mouseup', function()
                {
                    if(typeof params == 'object' && bResizeActivated)
                    {
                        // Сохраняем ширину колонок в localStorage
                        if(typeof params.saveColsSize == 'object')
                        {
                            var colsWidthArr = []; // Тут накапливается ширина  всех th

                            // Считаем ширину каждой колонки
                            thList.each(function()
                            {
                                colsWidthArr.push($(this).css('width'));
                            });

                            // Заносим все в localStorage
                            userIDFromLocalStorage[tableID].tableWidth = table.width();
                            userIDFromLocalStorage[tableID].colsWidth = colsWidthArr;
                            localStorage.setItem(userID, JSON.stringify(userIDFromLocalStorage));
                        }

                        // Вызываем Callback
                        if(typeof params.callback == 'function')
                        {
                            console.log(currentRh.parent());
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
                    table.removeClass('lg-noselect');

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

        // Функция подсчета ширины всех th, обновления коорднитат Resize Handles
        // Изменения ширины таблицы и обертки
        function calculateWidth()
        {
            // Считаем ширину всех th. Это будет ширина таблицы
            thListWidth = 0;
            thList.each(function(i)
            {
                // Не учитываем скрытые колонки
                if($(this).css('display') != 'none')
                {
                    thWidth = 0;

                    thWidth = $(this).outerWidth();

                    thListWidth += thWidth;

                    // Пересчитываем координаты всех Resize Handles
                    $(rhList[i]).css(
                    {
                        'left': $(this).offset().left + $(this).outerWidth() - $(rhList[i]).width() / 2.5,
                        'top': table.offset().top
                    });
                }
            });

            // Устанавливаем ширину таблице и ее обертки. Иначе таблица не будет расширятся за пределы страницы
            table.parent().width(thListWidth + 100);
            table.width(thListWidth);
        }

        // Функция скрытия колонки
        function colHide()
        {
            var th = $(this),          // th, по которому кликнули
                thIndex = th.index(),  // Порядковый номер колонки
                tr = table.find('tr'), // Все tr в таблице
                td;                    // Все td в tr

            th.hide();

            // Ищем все строки в таблице
            // Ищем все ячейки в этой строке
            // Затем, скрываем все ячейки, порядковый номер которых равен thIndex
            tr.each(function()
            {
                td = $(this).find('td');
                td.each(function(index)
                {
                    if(index == thIndex)
                        $(this).hide();
                });
            });

            // Пересчитываем ширину обертки, таблицы, th и Resize Handles
            calculateWidth();
        }
	};
})(jQuery);