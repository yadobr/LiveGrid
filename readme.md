# LiveGrid
LiveGrid - это js-библиотека для изменения ширины колонок мышкой в таблице(как в Excel).

# Возможности
 - Изменение ширины колонок мышкой
 - Скрытие/Показ колонок
 - Запоминание результатов в localStorage

# Использование
 - Подключите js и css в вашу html-cтраницу:
```html
<!-- css -->
<link href="css/liveGrid.css" rel="stylesheet">

<!-- js -->
<script src="js/jquery.min.js"></script>
<script src="js/liveGrid.js"></script>
```
 - Оберните свою таблицу в div, с классом lg-wrap:
```html
<div class="lg-wrap">
    <!-- Ваша таблица -->
	<table id="table1">...</table>
</div>
```
 - Вызовите скрипт:
```js
$(document).ready(function()
{
	$('#table1').liveGrid(
	{
		// Объект, наличие которого включает механизм сохранения колонок
		saveColsSize:
		{
			uniqUserID: 'user1',
			uniqTableID: '#table1'
		},

		// Callback вызывается, когда пользователь изменил ширину колонки
		callback: function(data)
		{
			console.log(data.table); // Handle таблицы, ширину колонки которой изменили
			console.log(data.index); // Порядковый номер столбца в таблице
			console.log(data.width); // Новая ширина столбца
		}
	});
});
```

# Примечание
У колонок в вашей таблице должен быть тег <th>, он будет использоваться как "рукоятка" для изменения ширины мышкой
```html
<!-- ПРИМЕР -->
<table>
	<tr>
		<th>head1</th>
		<th>head2</th>
		<th>head3</th>
	</tr>
	<tr>
		<td>content1</td>
		<td>content2</td>
		<td>content3</td>
	</tr>
</table>
```

# Лицензия
MIT
